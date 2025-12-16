import os
import joblib
import numpy as np
from ml.feature_extractor import extract_user_features

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "anomaly_model.pkl")

_model = None  # model cache


def load_model():
    global _model

    if _model is None:
        if not os.path.exists(MODEL_PATH):
            print("⚠️ ML model not found. Train the model first.")
            return None

        _model = joblib.load(MODEL_PATH)
        print("✅ ML model loaded successfully")

    return _model


def get_anomaly_score(user_id):
    model = load_model()

    # Model not trained yet
    if model is None:
        return 0.0, False

    features = extract_user_features(user_id)
    X = np.array(features, dtype=float).reshape(1, -1)

    score = model.decision_function(X)[0]
    prediction = model.predict(X)[0]  # -1 = anomaly

    is_anomaly = bool(prediction == -1)

    print(
        f"🤖 ML CHECK → user_id={user_id} | score={score:.4f} | anomaly={is_anomaly}"
    )

    return float(score), is_anomaly
