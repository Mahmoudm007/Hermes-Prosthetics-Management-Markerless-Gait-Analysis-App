from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str
    CELERY_BROKER_URL: str
    CELERY_RESULT_BACKEND: str
    CLOUD_NAME: str
    UPLOAD_PRESET: str
    GOOGLE_API_KEY: str

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


Config = Settings()
