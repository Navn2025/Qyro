import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from routes.v1.q_a import router as q_a_router
from routes.v1.metadata import router as metadata_router
from routes.v1.chats import router as chats_router

app = FastAPI(title="Qyro API", version="1.0.0")

# ── CORS ──────────────────────────────────────────────────────────────────────
# Using allow_origins=["*"] so CORS headers are present on ALL responses,
# including errors and crashes. When using wildcard, allow_credentials must
# be False (browser enforces this rule).
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Global exception handler — CORS headers survive route crashes ──────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)},
    )

app.include_router(q_a_router)
app.include_router(metadata_router)
app.include_router(chats_router)


@app.get("/")
def read_root():
    return {"message": "Qyro backend is running!", "version": "1.0.0"}


@app.on_event("startup")
def on_startup():
    db_uri = os.getenv("DATABASE_URI", "NOT SET")
    pinecone_key = os.getenv("PINECONE_API_KEY", "NOT SET")
    print(f"[STARTUP] DATABASE_URI set: {'YES' if db_uri != 'NOT SET' else 'NO ❌'}")
    print(f"[STARTUP] PINECONE_API_KEY set: {'YES' if pinecone_key != 'NOT SET' else 'NO ❌'}")
    print("[STARTUP] Qyro API is ready ✅")
