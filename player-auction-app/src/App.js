import React, { useState } from 'react';
import './App.css';
import Home from './home'
import Homepage from './homepage/homepage';
import Login from './login/login';
import Register from './register/register';
import AuctionDetails from './auctiondetails/auctiondetails';
import Players from './players/players'; // Import your Players component
import Teams from './teams/teams'; // Import your Teams component
import BiddingArena from './biddingarena/biddingarena'; // Import your BiddingArena component
import TeamLogin from './teamlogin/teamlogin'; // Import your TeamLogin component
import PlayerLogin from './playerlogin/playerlogin'; // Import your PlayerLogin component
import BidManagerLogin from './bidmanagerlogin/bidmanagerlogin'; // Import your BidManagerLogin component
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  const [userInfo, setUserInfo] = useState(null);
  const [auctionID, setAuctionID] = useState(null);

  return (
    <div className="App">
      <Router>
        <Routes>
          //when path is / then render the basic component
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login setUserInfo={setUserInfo} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/homepage" element={<Homepage userInfo={userInfo} />} />
          <Route path="/auction/:id" element={<AuctionDetails />}/>
            <Route path="/auction/:id/players" element={<Players />} />
            <Route path="/auction/:id/teams" element={<Teams />} />
            <Route path="/auction/:id/bidding-arena" element={<BiddingArena />} />
            <Route path="/team/:id" element={<TeamLogin />} />
            <Route path="/player/:id" element={<PlayerLogin />} />
            <Route path="/bidmanager/:id" element={<BidManagerLogin />} />
          {/* </Route> */}
        </Routes>
      </Router>
    </div>
  );
}

export default App;
