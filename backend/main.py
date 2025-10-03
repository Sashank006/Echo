from fastapi import FastAPI, HTTPException
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai # type: ignore
import os

load_dotenv()  

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
    model = genai.GenerativeModel('gemini-2.0-flash-exp')
    print("Gemini API configured successfully")
else:
    print("Warning: GEMINI_API_KEY not found in environment variables")


class CodeGenerationRequest(BaseModel):
    prompt: str
    existing_code: str = "" 
   

class CodeGenerationResponse(BaseModel):
    code: str
    explanation: str
   
@app.post("/generate")
async def generate_code(request: CodeGenerationRequest):
    try:
        if not GEMINI_API_KEY:
            raise HTTPException(status_code=500, detail="Gemini API key not configured")
        if not request.prompt or request.prompt.strip() == "":
            raise HTTPException(status_code=400, detail="Prompt cannot be empty")
        if request.existing_code:
            prompt = f"""
            You are a Python expert. The user has this existing code:
        ```python
            {request.existing_code}```
        User request: {request.prompt}

        Generate clean, working code that addresses their request. If they're asking to modify existing code, build upon what they have.

        Return your response in exactly this format:

        CODE:
           [your code here]```
            
            EXPLANATION:
            [brief explanation of what the code does or what changes were made]
    """
        else:
            prompt = f"""
                You are a Python expert. Generate clean, working code for: {request.prompt}

                Return your response in exactly this format:

                CODE:
                ```python
                [your code here]```

                EXPLANATION:
                [brief explanation of what the code does]
                """
        response = model.generate_content(prompt)
        full_response = response.text
    
        if "CODE:" in full_response and "EXPLANATION:" in full_response:
            parts = full_response.split("EXPLANATION:")
            code_section = parts[0].replace("CODE:", "").strip()
            explanation_section = parts[1].strip()

            if "```python" in code_section:
                code_start = code_section.find("```python") + len("```python")
                code_end = code_section.find("```", code_start)
                clean_code = code_section[code_start:code_end].strip()
            else:
                clean_code = code_section.strip()
                
            return CodeGenerationResponse(
                code=clean_code,
                explanation=explanation_section
            )
        else:
            return CodeGenerationResponse(
                code=full_response,
                explanation="Generated response (format parsing failed)"
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating code: {str(e)}")

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "voice-to-code-api", 
        "gemini_configured": GEMINI_API_KEY is not None
    }

@app.get("/")
def root():
    return {"message": "Backend is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)