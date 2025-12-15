# Security-Monitoring-System

###The Security Monitoring System is a cybersecurity project designed to monitor internal user activity and identify suspicious behaviour within an organization. The system focuses on detecting insider-related risks such as unusual login attempts, device changes, location mismatches, and unauthorized file access.

###Instead of relying on complex machine-learning pipelines, the project uses simple behaviour-based rules and adaptive risk scoring to detect anomalies in real time. This makes the system easier to understand, deploy, and maintain while still providing effective monitoring.

# Project Objectives

- Monitor user login activity in real time
- Detect unusual device and location changes
- Identify unauthorized or suspicious file-access attempts
- Assign dynamic risk scores based on user behaviour
- Provide administrators with live alerts and monitoring

# System Features

- Login Monitoring – tracks login attempts, failed logins, and unusual access
- Device & Location Tracking – flags logins from new devices or locations
- File-Access Control – blocks unauthorized file access instantly
- Risk Scoring – increases risk score based on repeated suspicious actions
- Real-Time Dashboard – displays alerts, risk levels, and user activity

# Technology Stack

- Backend: Python (Flask)
- Database: SQLite
- Frontend: HTML, CSS, JavaScript
- Security Logic: Rule-based anomaly detection
- Version Control: Git & GitHub

# Project Structure

Security-Monitoring-System/
│
├── backend/
├── frontend/
├── database/
├── app.py
├── requirements.txt
├── .gitignore
└── README.md

# How to Run the Project
1. Clone the repository:
   git clone https://github.com/Tanukash12/Security-Monitoring-System.git
2. Navigate to the project directory:
   cd Security-Monitoring-System
3. Create and activate a virtual environment:
   python -m venv venv
   venv\Scripts\activate   # Windows
4. Install dependencies:
   - Backend : pip install -r requirements.txt
   - Fronetnd : npm install
5. Run the application:
   - Backend : python app.py
   - Fronetend : npm start
  
## Author
- @Tanukash12

