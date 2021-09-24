import React from 'react';
import './App.css';
import {Blockdata} from "./components/Blockdata";
import {createTheme, ThemeProvider} from "@mui/material";

const defaultTheme = createTheme();

function App() {
  return (
      <ThemeProvider theme={defaultTheme}>
        <div className="App">
            <Blockdata />
        </div>
      </ThemeProvider>
  );
}

export default App;
