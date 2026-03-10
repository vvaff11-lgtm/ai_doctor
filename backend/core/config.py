from pathlib import Path

from pydantic_settings import BaseSettings

BACKEND_DIR = Path(__file__).resolve().parent.parent
ENV_FILE = BACKEND_DIR / '.env'


class Settings(BaseSettings):
    PROJECT_NAME: str = 'AI 医疗助手 Backend'
    API_V1_STR: str = '/api'

    SECRET_KEY: str = 'your-super-secret-key-change-it-in-production'
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7

    MYSQL_USER: str = 'root'
    MYSQL_PASSWORD: str = ''
    MYSQL_HOST: str = 'localhost'
    MYSQL_PORT: str = '3306'
    MYSQL_DB: str = 'ai_doctor_db'

    GEMINI_API_KEY: str = ''
    DIFY_API_KEY: str = ''
    DIFY_API_BASE_URL: str = 'https://api.dify.ai/v1'

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        return f'mysql+pymysql://{self.MYSQL_USER}:{self.MYSQL_PASSWORD}@{self.MYSQL_HOST}:{self.MYSQL_PORT}/{self.MYSQL_DB}'

    class Config:
        env_file = str(ENV_FILE)
        case_sensitive = True


settings = Settings()
