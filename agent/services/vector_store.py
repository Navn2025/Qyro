from langchain_pinecone import PineconeVectorStore
from services.vector_db import index
from services.embeddings import get_embeddings

def get_vector_store(hf_token: str = None):
    """
    Returns a dynamic Pinecone vector store instance using the provided HF token.
    Uses get_embeddings() to dynamically initialize the embeddings engine.
    """
    embeddings = get_embeddings(hf_token)
    return PineconeVectorStore(index=index, embedding=embeddings)