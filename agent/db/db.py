from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from models.models import Base

# This is the PRIMARY database for User Settings, API Keys, and Chat History.
# Defaults to a local postgres instance if not specified via environment variables.

DATABASE_URI = os.getenv("DATABASE_URI", "postgresql://postgres:1234@localhost:5432/q&a_dataset")
engine = create_engine(
    DATABASE_URI,
    pool_pre_ping=True,      # Test the connection before using it
    pool_recycle=3600,       # Refresh connections every hour
)

# The Session maker for the primary database
Session = sessionmaker(bind=engine)