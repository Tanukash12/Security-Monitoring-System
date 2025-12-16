# Security Monitoring System

The **Security Monitoring System** is a cybersecurity-focused web application designed to monitor internal user activity and detect suspicious or insider-related behaviour within an organization.

The system combines **rule-based security logic** with **machine learning–based anomaly detection** to identify risky users in real time. It monitors login behaviour, device and location changes, and unauthorized file access, then assigns dynamic risk scores to users.

---

## 🔐 Key Objectives

- Monitor user login activity in real time  
- Detect unusual device or location changes  
- Identify unauthorized or suspicious file access  
- Assign adaptive risk scores to users  
- Detect anomalies using a trained ML model  
- Provide administrators with a live monitoring dashboard  

---

## 🚀 System Features

### Authentication & Monitoring
- Secure user registration and login
- JWT-based authentication
- Login attempt logging (success, failed, suspicious)
- Device and IP-based behaviour analysis

### File Access Control
- Role-based file access
- Automatic blocking of restricted paths
- Risk escalation on unauthorized access

### Risk Scoring Engine
- Rule-based scoring (failed logins, blocked access)
- ML-based anomaly detection
- Combined final risk score (0–100)

### Admin Dashboard
- Live system statistics
- Recent login attempts
- File access logs
- High-risk users list
- ML anomaly flags per user

---

## 🤖 Machine Learning Integration

The project integrates an **Isolation Forest** model for anomaly detection.

### ML Purpose
- Detect unusual user behaviour patterns
- Identify users whose activity deviates from normal behaviour
- Add ML-based intelligence on top of rule-based security

### ML Features Used
- Number of failed logins
- Unusual access patterns
- Behavioural deviations over time

The ML model is trained using **real-world security data (Kaggle dataset)** and then applied to live user activity data.

---

## 🧠 ML Model Details

- Algorithm: **Isolation Forest**
- Type: Unsupervised Anomaly Detection
- Library: `scikit-learn`
- Model File: `backend/ml/anomaly_model.pkl`

---

## 📊 ML Training (IMPORTANT)

### Step 1: Dataset Location
After cloning the repository, place the Kaggle dataset here:
backend/ml/data/kaggle.csv


> The dataset must contain security-related behaviour columns  
> (e.g. failed_logins, unusual_time_access, attack indicators, etc.)

---

### Step 2: Train the ML Model

From the **backend directory**, run:

```bash
python ml/train_model.py
```
- on success you will see this as an output in terminal : MODEL TRAINED USING KAGGLE SECURITY DATA
- This will generate : backend/ml/anomaly_model.pkl

## Project Structure

```
Security-Monitoring-System/
│
├── backend/
├── frontend/
├── database/
├── app.py
├── requirements.txt
├── .gitignore
└── README.md
```
## How to Run the Project
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



