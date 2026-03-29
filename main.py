



from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.v1.q_a import router as q_a_router
from routes.v1.metadata import router as metadata_router
from routes.v1.chats import router as chats_router

app = FastAPI()

# Configure CORS
origins = [
    "https://qyro-ten.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(q_a_router)
app.include_router(metadata_router)
app.include_router(chats_router)


@app.get("/")
def read_root():
    return{"message":"Qyro backend is running!"}
