from sqlalchemy import Column, String, Integer, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.dialects.postgresql import ARRAY
Base = declarative_base()

class QATable(Base):
    __tablename__ = "qa_table"

    question_id = Column(String, primary_key=True)
    question_text = Column(Text, nullable=False)
    answer_text = Column(Text)
    subject = Column(String)
    difficulty = Column(String)

    bloom_level = Column(String)
    topic_tags=Column(ARRAY(String))

class Subject(Base):
    __tablename__ = "subjects"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(Text)
    subject_group = Column(String)

class Difficulty(Base):
    __tablename__ = "difficulties"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, unique=True, nullable=False)

class BloomTaxonomy(Base):
    __tablename__ = "bloom_taxonomies"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, unique=True, nullable=False)

from sqlalchemy import DateTime, ForeignKey, JSON
from datetime import datetime

class DBUser(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class UserSettings(Base):
    __tablename__ = "user_settings"
    user_id = Column(String, ForeignKey("users.id"), primary_key=True)
    gemini_api_key = Column(String, nullable=True)
    gemini_api_key_2 = Column(String, nullable=True)
    groq_api_key = Column(String, nullable=True)
    groq_api_key_2 = Column(String, nullable=True)
    huggingfacehub_api_token = Column(String, nullable=True)
    database_uri = Column(String, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ChatSession(Base):
    __tablename__ = "chat_sessions"
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"))
    label = Column(String)
    q_count = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    id = Column(String, primary_key=True)
    session_id = Column(String, ForeignKey("chat_sessions.id"))
    type = Column(String)
    payload = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)

