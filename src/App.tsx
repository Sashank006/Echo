import React, { useState } from 'react';
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
                onClick={()=> setIsListening(!isListening)}
                sx={{mb:3 , py:2}}
                > {isListening ? 'Stop Listening' : 'Start Voice Coding'}</Button>
                <Typography>{spokenText || "Your spoken text will appear here"}</Typography>
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
              <Paper sx= {{height:'100%', overflow:'hidden'}}>
                <Editor
                  height='400px'
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
              </Paper>
            </Box>
          </Box>
       </Box>
    </ThemeProvider>



  );
}

export default App;
