from datetime import datetime, timedelta
from models import db, LoginAttempt, FileAccess

def extract_user_features(user_id):
    failed_logins = LoginAttempt.query.filter_by(
        user_id=user_id, status='failed'
    ).count()

    login_attempts = LoginAttempt.query.filter_by(
        user_id=user_id
    ).count()

    session_duration = FileAccess.query.filter_by(
        user_id=user_id
    ).count()  # proxy value, fine for demo

    return [
        failed_logins,
        login_attempts,
        session_duration
    ]

