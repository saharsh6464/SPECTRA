from pathlib import Path
from datetime import datetime, timezone
import json
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker
from .config import get_settings

settings = get_settings()
Path("data").mkdir(exist_ok=True)
connect_args = {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}
engine = create_engine(settings.database_url, connect_args=connect_args)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

class Enrollment(Base):
    __tablename__ = "enrollments"
    id = Column(Integer, primary_key=True)
    session_id = Column(String(128), unique=True, index=True, nullable=False)
    face_embedding = Column(Text)
    liveness_result = Column(Text)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class TickResult(Base):
    __tablename__ = "tick_results"
    id = Column(Integer, primary_key=True)
    session_id = Column(String(128), index=True, nullable=False)
    tick_id = Column(String(128), nullable=False)
    source = Column(String(32), nullable=False)
    result_json = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

def init_db():
    Base.metadata.create_all(engine)

def save_enrollment(session_id, embedding, liveness_result):
    db = SessionLocal()
    try:
        row = db.query(Enrollment).filter_by(session_id=session_id).first()
        embedding_json = json.dumps(embedding.tolist()) if embedding is not None else None
        if row is None:
            row = Enrollment(session_id=session_id)
            db.add(row)
        row.face_embedding = embedding_json
        row.liveness_result = json.dumps(liveness_result)
        db.commit()
    finally:
        db.close()

def get_enrollment(session_id):
    db = SessionLocal()
    try:
        return db.query(Enrollment).filter_by(session_id=session_id).first()
    finally:
        db.close()

def save_tick(session_id, tick_id, source, result):
    db = SessionLocal()
    try:
        db.add(TickResult(
            session_id=session_id,
            tick_id=tick_id,
            source=source,
            result_json=json.dumps(result),
        ))
        db.commit()
    finally:
        db.close()

def get_results(session_id):
    db = SessionLocal()
    try:
        rows = db.query(TickResult).filter_by(session_id=session_id).order_by(TickResult.id).all()
        return [
            {
                "tick_id": r.tick_id,
                "source": r.source,
                "result": json.loads(r.result_json),
                "created_at": r.created_at.isoformat(),
            }
            for r in rows
        ]

    finally:
        db.close()
