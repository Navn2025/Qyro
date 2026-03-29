



from fastapi import FastAPI
from routes.v1.q_a import router as q_a_router
from routes.v1.metadata import router as metadata_router


from routes.v1.chats import router as chats_router

app = FastAPI()
app.include_router(q_a_router)
app.include_router(metadata_router)
app.include_router(chats_router)


@app.get("/")
def read_root():
    return{"message":"Qyro backend is running!"}
