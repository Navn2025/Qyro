from langchain_huggingface import HuggingFaceEndpointEmbeddings
import os

def get_embeddings(hf_token: str = None):
    """
    Returns a dynamic HuggingFace embeddings instance.
    Prioritizes the provided hf_token, then environment variables.
    """
    token = hf_token or os.getenv("HUGGINGFACEHUB_API_TOKEN")
    
    return HuggingFaceEndpointEmbeddings(
        model="sentence-transformers/all-MiniLM-L6-v2",
        huggingfacehub_api_token=token
    )