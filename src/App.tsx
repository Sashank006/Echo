// @ts-nocheck
import React, { useState,useRef,useEffect } from 'react';
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
  const [consoleOutput, setConsoleOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [savedSessions, setSavedSessions] = useState([]);
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('echo-sessions');
    if (saved) {
      setSavedSessions(JSON.parse(saved));
    }
  }, []);
  

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
      const response = await fetch('https://echo-backend-3yuq5lkrtq-uc.a.run.app', {
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

    const handleRunCode = () => {
      setIsRunning(true);
      setConsoleOutput('Running...');
      
      setTimeout(() => {
        if (generatedCode.includes('if ') && !generatedCode.includes('if ') + ':') {
          setConsoleOutput('SyntaxError: Missing colon after if statement');
          setIsRunning(false);
          return;
        }
        const printMatches = generatedCode.match(/print\s*\(\s*([^)]+)\s*\)/g);
        if (printMatches) {
          const output = printMatches.map(match => {
            const content = match.replace(/print\s*\(\s*|\s*\)$/g, '')
                              .replace(/^["']|["']$/g, '');
            return content;
          }).join('\n');
          setConsoleOutput(output);
        } else if (generatedCode.trim()) {
          setConsoleOutput('Code executed successfully');
        } else {
          setConsoleOutput('No code to run');
        }
        
        setIsRunning(false);
      }, 1500);
    };

    const handleExportCode = () => {
      try {
        const codeContent = generatedCode;
        const blob = new Blob([codeContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'generated_code.py';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Export failed:', error);
        setConsoleOutput('Error: Failed to export file');
      }
    };

    const handleSaveSession = () => {
      const sessionName = prompt('Session name (optional):') || `Session ${Date.now()}`;
      const newSession = {
        id: Date.now(),
        name: sessionName,
        code: generatedCode,
        prompt: spokenText || 'Direct edit',
        timestamp: new Date().toLocaleString()
      };
      const updatedSessions = [newSession, ...savedSessions].slice(0, 15); // Keep only 15 most recent
      setSavedSessions(updatedSessions);
      localStorage.setItem('echo-sessions', JSON.stringify(updatedSessions));
    };

    const handleDeleteSession = (sessionId) => {
      const updatedSessions = savedSessions.filter(session => session.id !== sessionId);
      setSavedSessions(updatedSessions);
      localStorage.setItem('echo-sessions', JSON.stringify(updatedSessions));
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
            {historyOpen && (
              <Box sx={{ width: '300px', p: 2, bgcolor: 'background.paper', borderRight: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">History</Typography>
                  <Button size="small" onClick={() => setHistoryOpen(false)}>Close</Button>
                </Box>
                
                {savedSessions.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No saved sessions yet.
                  </Typography>
                ) : (
                  <List>
                    {savedSessions.map((session) => (
                      <ListItem key={session.id} sx={{ flexDirection: 'column', alignItems: 'stretch', p: 1, mb: 1 }}>
                        <Typography variant="subtitle2">{session.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{session.timestamp}</Typography>
                        <Box sx={{ mt: 1 }}>
                          <Button size="small" onClick={() => {
                            setGeneratedCode(session.code);
                            setSpokenText(session.prompt);
                            setHistoryOpen(false);
                          }}>
                            Load
                          </Button>
                          <Button 
                            size="small" 
                            color="error" 
                            onClick={() => handleDeleteSession(session.id)}
                          >
                            Delete
                          </Button>
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
            )}
           <Box sx={{ width: historyOpen ? '250px' : '300px', p:2}}> {/*left panel*/}
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

           <Box sx={{ flex: 1, p:2}}> {/*right panel*/}
              <Paper sx= {{height:'100%', overflow:'hidden', p: 2}}>
                <Box sx={{ display: 'flex', width: '100%', gap: 2, height: '100%' }}>
                 <Box sx={{ flex: historyOpen ? 0.45 : 1 }}>
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
                        showUnused: true,
                        folding: true,
                        foldingHighlight: true,
                        bracketMatching: 'always',
                        matchBrackets: 'always',
                      }}
                    />
                  </Box>
                  <Box sx={{ flex: historyOpen ? 0.55 : 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle2">Generated Code</Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button 
                          size="small" 
                          variant="text"
                          onClick={() => setHistoryOpen(!historyOpen)}
                        >
                          History
                        </Button>
                        <Button 
                          size="small" 
                          variant="outlined"
                          onClick={handleSaveSession}
                          disabled={
                            !generatedCode.trim() || 
                            generatedCode === 'Welcome to Echo!, Your generated Python code will appear here!' ||
                            isGenerating
                          }
                        >
                          Save
                        </Button>
                        <Button 
                          size="small" 
                          variant="outlined"
                          onClick={handleExportCode}
                          disabled={
                            !generatedCode.trim() || 
                            generatedCode === 'Welcome to Echo!, Your generated Python code will appear here!' ||
                            isGenerating
                          }
                        >
                          Export .py
                        </Button>
                        <Button 
                          size="small" 
                          variant="contained"
                          onClick={handleRunCode}
                          disabled={isRunning}
                        >
                          {isRunning ? 'Running...' : '▶ Run Code'}
                        </Button>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 40px)' }}>
                      <Box sx={{ flex: '0.7' }}>
                        <Editor
                          height="100%"
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
                            showUnused: true,
                            folding: true,
                            foldingHighlight: true,
                            bracketMatching: 'always',
                            matchBrackets: 'always',
                          }}
                        />
                      </Box>
                      <Box sx={{ flex: '0.3', bgcolor: 'background.default', p: 1 }}>
                        <Typography variant="caption">Console Output:</Typography>
                        <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                          {consoleOutput}
                        </Typography>
                      </Box>
                    </Box>
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
                  