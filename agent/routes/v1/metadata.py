from fastapi import APIRouter
from db.db import Session
from models.models import Subject, Difficulty, BloomTaxonomy

router = APIRouter(
    prefix="/v1/metadata",
    tags=["metadata"],
)

# ----------------- Seed Data Defaults ----------------- #

DEFAULT_SUBJECTS = [
    ('Core Computer Science', 'Data Structures & Algorithms (DSA)', 'Study of efficient ways to store, organize, and process data, along with problem-solving techniques to optimize performance.'),
    ('Core Computer Science', 'Database Management Systems (DBMS)', 'Concepts related to storing, retrieving, and managing data efficiently using structured systems.'),
    ('Core Computer Science', 'Operating Systems (OS)', 'Study of how computers manage hardware, processes, memory, and system resources.'),
    ('Core Computer Science', 'Computer Networks (CN)', 'Understanding how computers communicate, share data, and connect through network systems.'),
    ('Core Computer Science', 'Computer Architecture', 'Understanding how computer hardware components work together (CPU, memory, etc.).'),
    ('Core Computer Science', 'Compiler Design', 'Study of how programming languages are translated into machine code.'),
    ('Core Computer Science', 'Theory of Computation', 'Mathematical foundations of computation, including automata and problem-solving limits.'),
    ('Core Computer Science', 'Parallel Computing', 'Performing multiple computations simultaneously to improve performance.'),
    ('Core Computer Science', 'Distributed Systems', 'Systems where multiple computers work together to achieve a common goal.'),
    ('Software Engineering', 'Programming Language Fundamentals', 'Understanding syntax, logic, and core features of programming languages like variables, loops, functions, and error handling.'),
    ('Software Engineering', 'Object-Oriented Programming (OOP)', 'A paradigm based on objects and classes that focuses on modular, reusable, and scalable code design.'),
    ('Software Engineering', 'System Design', 'Designing scalable, efficient, and reliable software systems and architectures.'),
    ('Software Engineering', 'Software Engineering', 'Principles and practices for developing high-quality, maintainable, and scalable software.'),
    ('Web & Mobile Apps', 'Web Development', 'Building and maintaining web applications using frontend and backend technologies.'),
    ('Web & Mobile Apps', 'Mobile Application Development', 'Developing applications for mobile devices like Android and iOS.'),
    ('Infrastructure & Cloud', 'DevOps', 'Practices that combine development and operations for faster and reliable software delivery.'),
    ('Infrastructure & Cloud', 'Cloud Computing', 'Using remote servers and services (like AWS, Azure) to store data and run applications.'),
    ('AI & Data', 'Artificial Intelligence (AI)', 'Creating systems that can simulate human intelligence like decision-making and learning.'),
    ('AI & Data', 'Machine Learning (ML)', 'A subset of AI focused on training models to learn patterns from data.'),
    ('AI & Data', 'Data Science', 'Extracting insights and knowledge from structured and unstructured data.'),
    ('Security & Web3', 'Cybersecurity', 'Protecting systems, networks, and data from attacks and unauthorized access.'),
    ('Security & Web3', 'Blockchain Technology', 'Decentralized systems for secure and transparent transactions.'),
    ('Specialized Tech', 'Human-Computer Interaction (HCI)', 'Designing user-friendly interfaces and improving user experience.'),
    ('Specialized Tech', 'Embedded Systems', 'Software and hardware systems designed for specific tasks (like IoT devices).'),
    ('Specialized Tech', 'Augmented & Virtual Reality (AR/VR)', 'Technologies that create immersive digital experiences in real or virtual environments.')
]

DEFAULT_DIFFICULTIES = [
    'easy',
    'medium',
    'hard'
]

DEFAULT_BLOOM = [
    'L1 - Recall',
    'L2 - Understand',
    'L3 - Apply',
    'L4 - Analyze',
    'L5 - Evaluate',
    'L6 - Create',
    'L7 - Innovate',
    'Mixed Bloom'
]

@router.get("/all")
def get_all_metadata():
    session = Session()
    try:
        # Subjects
        subjects = session.query(Subject).all()
        if not subjects:
            for group, name, desc in DEFAULT_SUBJECTS:
                session.add(Subject(subject_group=group, name=name, description=desc))
            session.commit()
            subjects = session.query(Subject).all()
        
        # Difficulties
        difficulties = session.query(Difficulty).all()
        if not difficulties:
            for name in DEFAULT_DIFFICULTIES:
                session.add(Difficulty(name=name))
            session.commit()
            difficulties = session.query(Difficulty).all()
            
        # Blooms
        blooms = session.query(BloomTaxonomy).all()
        if not blooms:
            for name in DEFAULT_BLOOM:
                session.add(BloomTaxonomy(name=name))
            session.commit()
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
        if not subjects:
            for group, name, desc in DEFAULT_SUBJECTS:
                session.add(Subject(subject_group=group, name=name, description=desc))
            session.commit()
            subjects = session.query(Subject).all()
            
        result = [{"id": s.id, "group": s.subject_group, "name": s.name, "description": s.description} for s in subjects]
        return result
    finally:
        session.close()

@router.get("/difficulties")
def get_difficulties():
    session = Session()
    try:
        difficulties = session.query(Difficulty).all()
        if not difficulties:
            for name in DEFAULT_DIFFICULTIES:
                session.add(Difficulty(name=name))
            session.commit()
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
        if not blooms:
            for name in DEFAULT_BLOOM:
                session.add(BloomTaxonomy(name=name))
            session.commit()
            blooms = session.query(BloomTaxonomy).all()
            
        result = [{"id": b.id, "name": b.name} for b in blooms]
        return result
    finally:
        session.close()
