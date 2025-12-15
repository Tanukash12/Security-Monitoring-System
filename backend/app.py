
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from functools import wraps
import requests
from sqlalchemy import event
from sqlalchemy.engine import Engine
import sqlite3

app = Flask(__name__)
CORS(app)

# Configuration
app.config['SECRET_KEY'] = 'your-secret-key-change-this'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///security.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Engine options: allow multi-thread usage & increase SQLite timeout
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    "connect_args": {"check_same_thread": False, "timeout": 30}
}

db = SQLAlchemy(app)

# Ensure SQLite uses WAL mode and a busy timeout on each connection
@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    # Only for sqlite connections
    if isinstance(dbapi_connection, sqlite3.Connection):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL;")
        cursor.execute("PRAGMA busy_timeout=30000;")  # 30s
        cursor.close()

# Models
class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), default='employee')
    is_active = db.Column(db.Boolean, default=True)
    last_login = db.Column(db.DateTime)
    risk_score = db.Column(db.Integer, default=0)

class LoginAttempt(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    username = db.Column(db.String(80), nullable=False)
    ip_address = db.Column(db.String(50))
    device_info = db.Column(db.String(200))
    location = db.Column(db.String(100))
    status = db.Column(db.String(20))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    is_suspicious = db.Column(db.Boolean, default=False)

class FileAccess(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    username = db.Column(db.String(80), nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    action = db.Column(db.String(20))
    risk_level = db.Column(db.String(20))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    is_authorized = db.Column(db.Boolean, default=True)

class Activity(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    activity_type = db.Column(db.String(50))
    description = db.Column(db.String(500))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

# Middleware for token verification
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        try:
            # Expect "Bearer <token>"
            token = token.split(' ')[1]
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = User.query.get(data['user_id'])
        except Exception:
            return jsonify({'message': 'Token is invalid'}), 401
        return f(current_user, *args, **kwargs)
    return decorated

def admin_required(f):
    @wraps(f)
    def decorated(current_user, *args, **kwargs):
        if not current_user or current_user.role != 'admin':
            return jsonify({'message': 'Admin access required'}), 403
        return f(current_user, *args, **kwargs)
    return decorated

# Helper Functions
def get_location_from_ip(ip):
    try:
        response = requests.get(f'http://ip-api.com/json/{ip}', timeout=3)
        data = response.json()
        return f"{data.get('city', 'Unknown')}, {data.get('country', 'Unknown')}"
    except Exception:
        return 'Unknown'

def detect_suspicious_login(user, ip, device):
    # consider both 'success' and 'suspicious' as previous successful-ish logins
    recent_logins = LoginAttempt.query.filter(
        LoginAttempt.user_id == user.id,
        LoginAttempt.status.in_(['success', 'suspicious'])
    ).order_by(LoginAttempt.timestamp.desc()).limit(5).all()

    if not recent_logins:
        return False

    recent_ips = [login.ip_address for login in recent_logins]
    recent_devices = [login.device_info for login in recent_logins]

    if ip not in recent_ips or device not in recent_devices:
        return True

    return False

def calculate_risk_score(user):
    one_hour_ago = datetime.utcnow() - timedelta(hours=1)

    failed_logins = LoginAttempt.query.filter(
        LoginAttempt.user_id == user.id,
        LoginAttempt.status == 'failed',
        LoginAttempt.timestamp > one_hour_ago
    ).count()

    unauthorized_access = FileAccess.query.filter(
        FileAccess.user_id == user.id,
        FileAccess.is_authorized == False,
        FileAccess.timestamp > one_hour_ago
    ).count()

    suspicious_logins = LoginAttempt.query.filter(
        LoginAttempt.user_id == user.id,
        LoginAttempt.is_suspicious == True,
        LoginAttempt.timestamp > one_hour_ago
    ).count()

    risk_score = (failed_logins * 10) + (unauthorized_access * 25) + (suspicious_logins * 15)
    return min(risk_score, 100)

# Routes
@app.route('/')
def home():
    return "Security Monitoring System Backend is Running!"

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json or {}
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({'message': 'username, email and password are required'}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({'message': 'Username already exists'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'Email already exists'}), 400

    hashed_password = generate_password_hash(password)
    new_user = User(
        username=username,
        email=email,
        password=hashed_password,
        role=data.get('role', 'employee'),
        is_active=True,
        risk_score=0
    )

    try:
        db.session.add(new_user)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to register user', 'error': str(e)}), 500

    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json or {}
    ip = request.remote_addr or '127.0.0.1'
    device = request.headers.get('User-Agent', 'Unknown')
    location = get_location_from_ip(ip)

    user = User.query.filter_by(username=data.get('username')).first()

    if not user or not check_password_hash(user.password, data.get('password', '')):
        # Log failed attempt
        attempt = LoginAttempt(
            user_id=user.id if user else None,
            username=data.get('username', ''),
            ip_address=ip,
            device_info=device,
            location=location,
            status='failed'
        )
        db.session.add(attempt)
        db.session.commit()

        if user:
            user.risk_score = calculate_risk_score(user)
            db.session.commit()

        return jsonify({'message': 'Invalid credentials'}), 401

    if not user.is_active:
        return jsonify({'message': 'Account is suspended'}), 403

    # Detect suspicious login
    is_suspicious = detect_suspicious_login(user, ip, device)

    # Log successful attempt
    attempt = LoginAttempt(
        user_id=user.id,
        username=user.username,
        ip_address=ip,
        device_info=device,
        location=location,
        status='success' if not is_suspicious else 'suspicious',
        is_suspicious=is_suspicious
    )
    db.session.add(attempt)

    user.last_login = datetime.utcnow()
    user.risk_score = calculate_risk_score(user)

    db.session.commit()

    # Generate token
    token = jwt.encode({
        'user_id': user.id,
        'username': user.username,
        'role': user.role,
        'exp': datetime.utcnow() + timedelta(hours=24)
    }, app.config['SECRET_KEY'], algorithm='HS256')

    return jsonify({
        'token': token,
        'user': {
            'username': user.username,
            'role': user.role,
            'is_suspicious': is_suspicious
        }
    }), 200

@app.route('/api/file-access', methods=['POST'])
@token_required
def file_access(current_user):
    data = request.json or {}
    file_path = data.get('file_path', '')

    restricted_files = [
        '/confidential/', '/admin/', '/hr/salary',
        '/credentials', '/passwords'
    ]

    is_authorized = True
    risk_level = 'low'

    for restricted in restricted_files:
        if restricted in file_path:
            if current_user.role != 'admin':
                is_authorized = False
                risk_level = 'critical' if '/admin/' in file_path else 'high'
            break

    access = FileAccess(
        user_id=current_user.id,
        username=current_user.username,
        file_path=file_path,
        action='allowed' if is_authorized else 'denied',
        risk_level=risk_level,
        is_authorized=is_authorized
    )
    db.session.add(access)

    if not is_authorized:
        current_user.risk_score = calculate_risk_score(current_user)

    db.session.commit()

    return jsonify({
        'allowed': is_authorized,
        'risk_level': risk_level,
        'message': 'Access granted' if is_authorized else 'Access denied'
    }), 200 if is_authorized else 403

@app.route('/api/admin/dashboard', methods=['GET'])
@token_required
@admin_required
def admin_dashboard(current_user):
    total_users = User.query.count()
    active_users = User.query.filter_by(is_active=True).count()

    today = datetime.utcnow().date()
    today_logins = LoginAttempt.query.filter(
        db.func.date(LoginAttempt.timestamp) == today
    ).count()

    failed_logins = LoginAttempt.query.filter(
        LoginAttempt.status == 'failed',
        db.func.date(LoginAttempt.timestamp) == today
    ).count()

    blocked_files = FileAccess.query.filter(
        FileAccess.is_authorized == False,
        db.func.date(FileAccess.timestamp) == today
    ).count()

    risk_users = User.query.filter(User.risk_score > 50).count()

    return jsonify({
        'stats': {
            'total_users': total_users,
            'active_users': active_users,
            'today_logins': today_logins,
            'failed_logins': failed_logins,
            'blocked_files': blocked_files,
            'risk_users': risk_users
        }
    }), 200

@app.route('/api/admin/login-attempts', methods=['GET'])
@token_required
@admin_required
def get_login_attempts(current_user):
    attempts = LoginAttempt.query.order_by(
        LoginAttempt.timestamp.desc()
    ).limit(50).all()

    return jsonify({
        'attempts': [{
            'id': a.id,
            'username': a.username,
            'ip_address': a.ip_address,
            'device_info': a.device_info,
            'location': a.location,
            'status': a.status,
            'is_suspicious': a.is_suspicious,
            'timestamp': a.timestamp.isoformat()
        } for a in attempts]
    }), 200

@app.route('/api/admin/file-access', methods=['GET'])
@token_required
@admin_required
def get_file_access(current_user):
    accesses = FileAccess.query.order_by(
        FileAccess.timestamp.desc()
    ).limit(50).all()

    return jsonify({
        'accesses': [{
            'id': a.id,
            'username': a.username,
            'file_path': a.file_path,
            'action': a.action,
            'risk_level': a.risk_level,
            'is_authorized': a.is_authorized,
            'timestamp': a.timestamp.isoformat()
        } for a in accesses]
    }), 200

@app.route('/api/admin/risk-users', methods=['GET'])
@token_required
@admin_required
def get_risk_users(current_user):
    users = User.query.filter(User.risk_score > 0).order_by(
        User.risk_score.desc()
    ).all()

    result = []
    for user in users:
        failed_count = LoginAttempt.query.filter_by(
            user_id=user.id, status='failed'
        ).count()

        unauthorized_count = FileAccess.query.filter_by(
            user_id=user.id, is_authorized=False
        ).count()

        reasons = []
        if failed_count > 0:
            reasons.append(f'{failed_count} failed login(s)')
        if unauthorized_count > 0:
            reasons.append(f'{unauthorized_count} unauthorized file access(es)')

        status = 'critical' if user.risk_score > 75 else 'high' if user.risk_score > 50 else 'medium'

        result.append({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'risk_score': user.risk_score,
            'status': status,
            'reasons': ', '.join(reasons),
            'last_login': user.last_login.isoformat() if user.last_login else None
        })

    return jsonify({'risk_users': result}), 200

@app.route('/api/admin/user/<int:user_id>/suspend', methods=['POST'])
@token_required
@admin_required
def suspend_user(current_user, user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404

    user.is_active = False
    db.session.commit()

    return jsonify({'message': f'User {user.username} suspended'}), 200

if __name__ == '__main__':
    with app.app_context():
        db.create_all()

        # Create admin user if not exists
        admin = User.query.filter_by(username='admin').first()
        if not admin:
            admin = User(
                username='admin',
                email='admin@company.com',
                password=generate_password_hash('admin123'),
                role='admin'
            )
            db.session.add(admin)
            db.session.commit()
            print('Admin user created: username=admin, password=admin123')

    # Recommended: keep debug=True during dev, but if you still see locking while the reloader is active,
    # try use_reloader=False. The SQLite WAL + timeout should usually fix locking.
    app.run(debug=True, port=5000)
