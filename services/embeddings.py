from langchain_huggingface import HuggingFaceEndpointEmbeddings
import os

def get_embeddings(hf_token: str = None):
    """
    Returns a dynamic HuggingFace embeddings instance. 
    Strictly prioritizes the provided hf_token to ensure 'your keys, not mine'.
    """
    # Prefer provided token, then env
    token = hf_token or os.getenv("HUGGINGFACEHUB_API_TOKEN")

    # Diagnostic logging (masked)
    if not token:
        print("[HF EMBEDDINGS] ❌ No token found (neither in state nor .env). This will likely fail with 401.")
    else:
        # Show first 4 and last 4 chars for debugging, masked middle
        if len(token) > 8:
            masked = f"{token[:4]}****{token[-4:]}"
            print(f"[HF EMBEDDINGS] ✅ Initializing with token: {masked}")
        else:
            print("[HF EMBEDDINGS] ✅ Initializing with token (length < 8)")

    return HuggingFaceEndpointEmbeddings(
        model="sentence-transformers/all-MiniLM-L6-v2",
        huggingfacehub_api_token=token
    )