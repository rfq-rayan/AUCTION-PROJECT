// import logo from './logo.svg';
import './App.css';
import Homepage from './homepage/homepage';
import Login from './login/login';
import Register from './register/register';
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route exact path="/" element={<Homepage />} />
          

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </Router>

      {/* <Homepage /> */}
      {/* <h1>Player Auction App</h1>
      hello world */}
      {/* <Login /> */}
      {/* <Register /> */}
    </div>
  );
}

export default App;
