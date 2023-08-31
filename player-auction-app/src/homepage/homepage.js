import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Link, Navigate } from 'react-router-dom';
// import "../css/homepage.css";
const Homepage = ({ userInfo }) => {
  const [auctions, setAuctions] = useState([]);
  const [auctionName, setAuctionName] = useState('');
  const [auctionType, setAuctionType] = useState('');
  const userInfosRef = useRef(null);

  useEffect(() => {
    const storedUserInfo = Cookies.get('userInfo');
    if (storedUserInfo) {
      const parsedUserInfo = JSON.parse(storedUserInfo);
      userInfosRef.current = parsedUserInfo;
    }
  }, []);

  useEffect(() => {
    if (userInfosRef.current) {
      const adminId = userInfosRef.current.ID; // Get the Admin_Id from userInfosRef
      axios.get(`http://localhost:9002/auctions?adminId=${adminId}`) // Pass adminId as a query parameter
        .then((res) => {

          console.log(res.data); 
          setAuctions(res.data);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, []);
  
  const handleCreateAuction = () => {
    const newAuction = {
      name: auctionName,
      type: auctionType,
      adminId: userInfosRef.current.ID, // Get the Admin_Id from userInfosRef
    };
    

    // Make a POST request to create a new auction
    axios.post('http://localhost:9002/createAuction', newAuction)
      .then((res) => {
        console.log(newAuction);
        // Refresh the list of auctions
        setAuctions([...auctions, newAuction]);
        // Clear the input fields
        setAuctionName('');
        setAuctionType('');
      })
      .catch((err) => {
        console.error(err);
      });
  };
  const handleDeleteAuction = (auctionId) => {
    // Make a DELETE request to delete the auction
    axios.delete(`http://localhost:9002/deleteAuction/${auctionId}`)
      .then(() => {
        // Refresh the list of auctions after deletion
        const updatedAuctions = auctions.filter((auction) => auction.id !== auctionId);
        setAuctions(updatedAuctions);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const handleViewAuction = (auctionId) => {
    // Navigate to the auction details page
    Navigate(`/auction/${auctionId}`);
  };

  return (
    <div>
      {userInfosRef.current ? (
        <>
        {/* {console.log("I aaa" )} */}
          <h1>Hello, {userInfosRef.current.NAME}</h1>

          <div>
            <h2>Current Auctions</h2>
            <ul>
              {auctions.map((auction) => (
                <li key={auction.ID}>
                   <strong>{auction.NAME}</strong> - {auction.TYPE}
                  {/* <button onClick= {() => handleViewAuction(auction.ID)}> View Details</button> */}
                  <Link to={`/auction/${auction.ID}`}>View Details</Link>
                  <button onClick= {() => handleDeleteAuction(auction.ID)}>Delete</button>

                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2>Create New Auction</h2>
            <input
              type="text"
              placeholder="Auction Name"
              value={auctionName}
              onChange={(e) => setAuctionName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Auction Type"
              value={auctionType}
              onChange={(e) => setAuctionType(e.target.value)}
            />
            <button onClick={handleCreateAuction}>Create Auction</button>
          </div>
        </>
      ) : (
        <p>Loading user information...</p>
        
      )}

<button onclick="location.reload()">Refresh</button>

    </div>
    
  );
};

export default Homepage;
