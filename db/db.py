# from sqlalchemy import create_engine
# from sqlalchemy.orm import sessionmaker
# import os
# from models.models import Base

# DATABASE_URI = os.getenv("DATABASE_URI")
# engine  = create_engine(DATABASE_URI)

# Base.metadata.create_all(bind=engine)
# Session = sessionmaker(bind=engine)