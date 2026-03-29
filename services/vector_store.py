from langchain_pinecone import PineconeVectorStore
from services.vector_db import index
from services.embeddings import embeddings
vector_store = PineconeVectorStore(index=index, embedding=embeddings)