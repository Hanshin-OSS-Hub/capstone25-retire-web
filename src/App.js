import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './components/Home';
import Chatbot from './components/Chatbot';
import Career from './components/Career';
import Financial from './components/Financial';

function App() {
  return (
    <div className="App">
      <Header />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chatbot" element={<Chatbot />} />
          <Route path="/career" element={<Career />} />
          <Route path="/financial" element={<Financial />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;