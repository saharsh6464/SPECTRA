import os

from dotenv import dotenv_values
from supabase import create_client

from risk_factor_calculator import RiskFactorCalculator


env = dotenv_values(".env")
supabase_url = os.getenv("SUPABASE_URL") or env.get("SUPABASE_URL")
service_role_key = (
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    or env.get("SUPABASE_SERVICE_ROLE_KEY")
)

if not supabase_url or not service_role_key:
    raise RuntimeError("Supabase configuration is missing")

client = create_client(supabase_url, service_role_key)

user_id = input("Enter user_id: ").strip()
test_id = input("Enter test_id: ").strip()

response = (
    client.table("anomaly_factors")
    .select(
        "fullscreen_exit_count,"
        "paste_count,"
        "copy_count,"
        "multiple_faces_count,"
        "no_face_count,"
        "window_blur_count,"
        "phone_cell_count"
    )
    .eq("user_id", user_id)
    .eq("test_id", test_id)
    .limit(1)
    .execute()
)

if not response.data:
    raise LookupError("No anomaly_factors row found")

row = response.data[0]

metrics = {
    "fullscreen_exit_count": row.get("fullscreen_exit_count", 0),
    "paste_count": row.get("paste_count", 0),
    "copy_count": row.get("copy_count", 0),
    "multiple_faces_count": row.get("multiple_faces_count", 0),
    "no_face_count": row.get("no_face_count", 0),
    "window_blur_count": row.get("window_blur_count", 0),
    "phone_cell_count": row.get("phone_cell_count", 0),
    "risk_audio_count": 0,
}

risk_result = RiskFactorCalculator().calculate(metrics)

print(risk_result.to_dict()["risk_percent"])