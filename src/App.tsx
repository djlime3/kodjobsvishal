import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Welcome from './components/Welcome';
import Authorization from './components/Authorization';
import SignUp from './components/SignUp';
import JobDashboard from './components/JobDashboard';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/authorization" element={<Authorization />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/dashboard" element={<JobDashboard />} />
          <Route path="/" element={<Navigate to="/welcome" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 