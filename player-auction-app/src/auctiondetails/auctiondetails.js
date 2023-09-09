import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const AuctionDetails = () => {
  const { id } = useParams(); // Extract auction ID from URL parameter
  const [auctionDetails, setAuctionDetails] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch auction details using the auction ID
    axios.get(`http://localhost:9002/auction/${id}`)
      .then((res) => {
        setAuctionDetails(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [id]);

  const handleNavigateToPlayers = () => {
    navigate(`/auction/${id}/players`);
  };

  const handleNavigateToTeams = () => {
    navigate(`/auction/${id}/teams`);
  };

  const handleNavigateToBiddingArena = () => {
    navigate(`/auction/${id}/bidding-arena`);
  };

  return (
    <div>
      <br></br>
      {/* <h2>Auction Details</h2> */}
      {auctionDetails ? (
        <>
          <h1>{auctionDetails.NAME}</h1>
          <p>Auction Type: {auctionDetails.TYPE}</p> 
        </>
      ) : (
        <p>Loading auction details...</p>
      )}
      <hr />
      <div>

        <h2>Navigation</h2>
        <button onClick={handleNavigateToPlayers}>Players</button>
        <button onClick={handleNavigateToTeams}>Teams</button>
        <button onClick={handleNavigateToBiddingArena}>Bidding Arena</button>
      </div>
    </div>
  );
};

export default AuctionDetails;
