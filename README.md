# Echo - Voice-Controlled Python Code Generator

A web application that converts voice commands into Python code using AI. Speak your requirements and get working Python code instantly.

**Live Demo:** [https://echo-voicecoder.web.app](https://echo-voicecoder.web.app)

## Features

- **Voice Recognition**: Uses Web Speech API for real-time voice-to-text conversion
- **AI Code Generation**: Powered by Google Gemini 2.0 Flash for intelligent code creation
- **Interactive Editor**: Monaco Editor with syntax highlighting and IntelliSense
- **File Management**: Upload existing Python files and modify them with voice commands
- **Code Execution**: Test your code directly in the browser
- **Session History**: Save and restore previous coding sessions
- **Export Functionality**: Download generated code as .py files

## Tech Stack

### Frontend
- React 18 with TypeScript
- Material-UI for modern UI components
- Monaco Editor (VS Code's editor)
- Web Speech API
- Firebase Hosting

### Backend
- FastAPI (Python)
- Google Gemini 2.0 Flash API
- Docker containerization
- Google Cloud Run

## Architecture

The application uses a microservices architecture:
- Frontend hosted on Firebase for global CDN distribution
- Backend API containerized and deployed on Cloud Run for serverless scaling
- Communication via RESTful API with CORS enabled

## Local Setup

### Backend
```bash
cd backend
pip install -r requirements.txt
echo "GEMINI_KEY=your_api_key" > .env
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
npm install
npm start
```

Visit `http://localhost:3000` to use the app locally.

## Deployment

The app is deployed using:
- **Frontend**: Firebase Hosting (`firebase deploy --only hosting`)
- **Backend**: Google Cloud Run with automated builds from Docker

## Project Structure

```
echo/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── requirements.txt     # Python dependencies
│   └── Dockerfile           # Container configuration
├── src/
│   └── App.tsx              # Main React component
├── build/                   # Production build
└── firebase.json            # Hosting configuration
```

## Author

**Sashank**  
GitHub: [@Sashank006](https://github.com/Sashank006)
