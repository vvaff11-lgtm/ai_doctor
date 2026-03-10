from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from backend.core.config import settings

# 创建数据库引擎
engine = create_engine(settings.SQLALCHEMY_DATABASE_URI, pool_pre_ping=True)

# 创建会话工厂
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 声明模型基类
Base = declarative_base()

def get_db():
    """获取数据库会话，用于依赖注入"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
