from functools import lru_cache
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = False
    cors_origins: str = "http://localhost:5173"
    database_url: str = "sqlite:///./data/proctoring.db"

    enable_face_match: bool = True
    enable_liveness: bool = True
    enable_face_count: bool = True
    enable_device_detection: bool = True
    enable_head_position: bool = True
    enable_voice_monitoring: bool = True
    enable_occupant_count: bool = True
    enable_posture: bool = True
    enable_typing_writing: bool = True

    face_match_threshold: float = 0.40
    head_yaw_threshold: float = 15.0
    head_pitch_threshold: float = 15.0
    onnx_providers: str = "CoreMLExecutionProvider,CPUExecutionProvider"

    max_image_mb: int = 10
    max_audio_mb: int = 10
    api_key: str = ""

    public_api_url: str = "http://localhost:8000"
    public_frontend_url: str = "http://localhost:5173"

    supabase_request_timeout_seconds: float = 30.0
    supabase_poll_interval_seconds: float = 10.0
    supabase_poll_batch_size: int = 100

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False, extra="ignore")

    @property
    def cors_origin_list(self) -> List[str]:
        return [x.strip() for x in self.cors_origins.split(",") if x.strip()]

    @property
    def onnx_provider_list(self) -> List[str]:
        return [x.strip() for x in self.onnx_providers.split(",") if x.strip()]

@lru_cache
def get_settings():
    return Settings()
