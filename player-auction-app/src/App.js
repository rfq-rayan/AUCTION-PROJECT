import React, { useState } from 'react';
import './App.css';
import Homepage from './homepage/homepage';
import Login from './login/login';
import Register from './register/register';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  const [userInfo, setUserInfo] = useState(null);

  return (
    <div className="App">
      <Router>
        <Routes>
         
          <Route
            path="/login"
            element={<Login setUserInfo={setUserInfo} />}
          />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={<Homepage userInfo={userInfo} />}
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
