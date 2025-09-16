// @ts-nocheck
import React, { useState,useRef } from 'react';
import Editor from '@monaco-editor/react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  Button, 
  Paper, 
  List, 
  ListItem, 
  ListItemText,
  ThemeProvider,
  createTheme,
  CssBaseline
} from '@mui/material';
import { Mic, MicOff } from '@mui/icons-material';
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#1976d2' },
    background: { default: '#121212', paper: '#1e1e1e' }
  }
});

function App() {
  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [generatedCode, setGeneratedCode] = useState('Welcome to Echo!, Your generated Python code will appear here!')
  const recognitionRef = useRef(null);
  const [codeExplanation, setCodeExplanation] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedCode, setUploadedCode] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const text = await file.text();
      setUploadedFile(file.name);
      setUploadedCode(text);
      setGeneratedCode(text); 
    }
  };

  const handleVoiceToggle = () => {
    if (!isListening) {
      setSpokenText('');
      const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognitionRef.current = recognition;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onresult = (event) => {
        const latest = event.results[event.results.length - 1];
        const transcript = latest[0].transcript;
        setSpokenText(transcript);
      };
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setSpokenText('Speech recognition failed. Please try again.');
        setIsListening(false);
      };
      recognition.start();
      setIsListening(true);
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    }
  };

  const handleGenerateCode = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('http://localhost:8000/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt: spokenText,
          existing_code: uploadedCode 
        })
      });
      const data = await response.json();
      setGeneratedCode(data.code);
      setCodeExplanation(data.explanation);
      setConversationHistory(prev => [...prev, {
        prompt: spokenText,
        code: data.code,
        explanation: data.explanation,
        timestamp: new Date().toLocaleTimeString()
      }]);
    } catch (error) {
      console.error('Error:', error);
      setGeneratedCode('Error generating code. Please try again.');
    } finally{
      setIsGenerating(false);
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline/>
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      
        <AppBar position="static">
              <Toolbar>
                <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
                  Echo - Voice-Controlled Python Coder
                </Typography>
              </Toolbar>
        </AppBar>

          <Box sx={{ display: 'flex', flex: 1 }}>
            <Box sx={{ width:'400px', p:2}}> {/*left panel*/}
              <Paper sx={{height:'100%', bgcolor:'background.paper'}}>
                <Button
                variant='contained'
                fullWidth
                size='large'
                startIcon={isListening ? <MicOff/> : <Mic/>}
                color={isListening ? 'error':'primary'}
                onClick={handleVoiceToggle}
                sx={{mb:3 , py:2}}
                > {isListening ? 'Stop Listening' : 'Start Voice Coding'}</Button>
                <Typography>{spokenText || "Your spoken text will appear here"}</Typography>
                <Button 
                variant='contained'
                size='medium'
                fullWidth
                disabled={isGenerating || !spokenText.trim()} 
                onClick={handleGenerateCode}
                sx={{mb:2,mt:1}}>{isGenerating ? 'Generating...' : 'Generate'}</Button>
                <Box sx={{mt:2}}>
                  <input
                    type="file"
                    accept=".py"
                    onChange={handleFileUpload}
                    style={{display: 'none'}}
                    id="file-upload"
                  />
                  <label htmlFor="file-upload">
                    <Button variant="outlined" component="span" fullWidth>
                      Upload Python File
                    </Button>
                  </label>
                </Box>
                {codeExplanation && (
                  <Paper sx={{p:2, mt:2, bgcolor:'background.default'}}>
                    <Typography variant="subtitle2" color="primary">Code Explanation:</Typography>
                    <Typography variant="body2">{codeExplanation}</Typography>
                  </Paper>
                )}
                <Typography variant="h6" gutterBottom>Available Commands:</Typography>
                <List dense>
                  {['Reverse a string', 'Create for loop', 'Find max in list', 'Sort a list', 'Print hello world'].map((command) => (
                    <ListItem key={command}>
                      <ListItemText primary={`"${command}"`} />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Box>

            <Box sx={{ width:'700px' , p:2}}> {/*right panel*/}
              <Paper sx= {{height:'100%', overflow:'hidden', p: 2}}>
                <Box sx={{ display: 'flex', width: '100%', gap: 2, height: '100%' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Original Code</Typography>
                    <Editor
                      height="calc(100% - 30px)"
                      theme="vs-dark"
                      defaultLanguage="python" 
                      value={uploadedCode || 'No file uploaded yet...'}   
                      onChange={(value) => setUploadedCode(value || '')}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: 'on',
                        roundedSelection: false,
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                      }}
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Generated Code</Typography>
                    <Editor
                      height="calc(100% - 30px)"
                      theme="vs-dark"
                      defaultLanguage="python" 
                      value={generatedCode}   
                      onChange={(value) => setGeneratedCode(value || '')}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: 'on',
                        roundedSelection: false,
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                      }}
                    />
                  </Box>
                </Box>
              </Paper>
            </Box>
          </Box>
       </Box>
    </ThemeProvider>



  );
}

export default App;
