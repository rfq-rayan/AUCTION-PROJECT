import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

const Homepage = ({ userInfo }) => {
  const [userInfos, setUserInfos] = useState(null);
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    // Fetch the user information from the cookie
    const storedUserInfo = Cookies.get('userInfo');
    console.log('Fetching user info from cookie:', storedUserInfo);
    if (storedUserInfo) {
      setUserInfos(JSON.parse(storedUserInfo));
    }
  }, []); // This effect should run only once, on component mount

  useEffect(() => {
    // Fetch the list of players if the user is an admin
    console.log('Fetching players');
    // console.log('User info:', userInfos)
    console.log(userInfos && userInfos.Role === 'admin')
    console.log(userInfos.Role)
    if (userInfos && userInfos.Role === 'admin') {
      axios.get('http://localhost:9002/players')
        // console.log("I am here")
        .then((res) => {
          setPlayers(res.data);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, [userInfos]); // This effect depends on userInfos


  return (
    <div>
      {userInfos ? (
        <>
          <h1>Hello, {userInfos.NAME}</h1>
          
        </>
      ) : (
        <p>Loading user information...</p>
      )}
    </div>
  );
};

export default Homepage;
