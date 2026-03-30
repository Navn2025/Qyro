# This file is legacy and should be avoided in favor of dynamic instantiation in the routes.
# It is kept here for reference, but no default environment-based instantiation is allowed 
# to ensure system-wide keys are NOT accidentally leaked for user tasks.

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq

llm_basic = None
llm = None
