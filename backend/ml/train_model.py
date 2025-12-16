import os
import pandas as pd
from sklearn.ensemble import IsolationForest
import joblib

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "data", "kaggle.csv")

# Load data
df = pd.read_csv(DATA_PATH)

# 🔥 CORRECT FEATURE SELECTION (REALISTIC)
X = df[
    [
        'failed_logins',
        'unusual_time_access',
        'ip_reputation_score'
    ]
]

# Train Isolation Forest
model = IsolationForest(
    n_estimators=100,
    contamination=0.15,
    random_state=42
)

model.fit(X)

# Save model
MODEL_PATH = os.path.join(BASE_DIR, "anomaly_model.pkl")
joblib.dump(model, MODEL_PATH)

print("MODEL TRAINED USING KAGGLE SECURITY DATA")
