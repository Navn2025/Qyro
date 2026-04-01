from fastapi import APIRouter
from db.db import Session
from models.models import Subject, Difficulty, BloomTaxonomy

router = APIRouter(
    prefix="/v1/metadata",
    tags=["metadata"],
)

# ----------------- Seed Data Defaults ----------------- #



@router.get("/all")
def get_all_metadata():
    session = Session()
    try:
        # Subjects
        subjects = session.query(Subject).all()
        
        # Difficulties
        difficulties = session.query(Difficulty).all()
       
        # Blooms
        blooms = session.query(BloomTaxonomy).all()
       
        return {
            "subjects": [{"id": s.id, "group": s.subject_group, "name": s.name, "description": s.description} for s in subjects],
            "difficulties": [{"id": d.id, "name": d.name} for d in difficulties],
            "bloom_levels": [{"id": b.id, "name": b.name} for b in blooms]
        }
    finally:
        session.close()

@router.get("/subjects")
def get_subjects():
    session = Session()
    try:
        subjects = session.query(Subject).all()
        # Seed if empty
        
            
        result = [{"id": s.id, "group": s.subject_group, "name": s.name, "description": s.description} for s in subjects]
        return result
    finally:
        session.close()

@router.get("/difficulties")
def get_difficulties():
    session = Session()
    try:
        difficulties = session.query(Difficulty).all()
        
        result = [{"id": d.id, "name": d.name} for d in difficulties]
        return result
    finally:
        session.close()

@router.get("/bloom_levels")
def get_bloom_levels():
    session = Session()
    try:
        blooms = session.query(BloomTaxonomy).all()
        
            
        result = [{"id": b.id, "name": b.name} for b in blooms]
        return result
    finally:
        session.close()
