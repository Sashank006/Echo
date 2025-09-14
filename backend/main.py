from fastapi import FastAPI
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
import os

app = FastAPI(title="Voice to Code API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
GEMINI_API_KEY = os.getenv("GEMINI_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-1.5-flash')
    print("Gemini API configured successfully")
else:
    print("Warning: GEMINI_API_KEY not found in environment variables")


class CodeGenerationRequest(BaseModel):
    prompt: str
    language: str = "python"  

class CodeGenerationResponse(BaseModel):
    code: str
    explanation: str
    language: str


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "voice-to-code-api", 
        "gemini_configured": GEMINI_API_KEY is not None
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)