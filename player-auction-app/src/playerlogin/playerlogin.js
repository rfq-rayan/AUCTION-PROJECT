import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import '../css/PlayerLogin.css'; // Import your CSS file for styling


import axios from 'axios';
import Cookies from 'js-cookie';
import { Link, Navigate } from 'react-router-dom';
// import "../css/homepage.css";

const PlayerLogin = ({ userInfo }) => {
    const userInfosRef = useRef(null);
    const [players, setPlayers] = useState([]);
    const [notifications, setNotifications] = useState(
        []
    );
    useEffect(() => {
        const storedUserInfo = Cookies.get('userInfo');
        if (storedUserInfo) {
            const parsedUserInfo = JSON.parse(storedUserInfo);
            userInfosRef.current = parsedUserInfo;
        }
        console.log(userInfosRef.current)
    }, []);

    useEffect(() => {
        if (userInfosRef.current) {

            const playerId = userInfosRef.current.ID; // Get the player_id from userInfosRef
            axios.get(`http://localhost:9002/players?playerId=${playerId}`)
                .then((res) => {
                    console.log(res.data);
                    // const updatedUserInfo = { ...userInfosRef.current, INVITATIONSTATUS: res.data.INVITATIONSTATUS };
                    // userInfosRef.current = updatedUserInfo;
                    setPlayers(res.data);
                })
                .catch((err) => {
                    console.error(err);
                });
            axios
                .get(`http://localhost:9002/getNotifications?playerId=${playerId}`)
                .then((res) => {
                    // console.log(res.data);
                    const notificationData = res.data;
                    

                    console.log(notificationData);
                    setNotifications(notificationData);
                    console.log(notifications);
                    // setNotifications(res.data); // Assuming you have a state for notifications
                    // console.log(`Notifications: ${res.data}`);
                })
                .catch((err) => {
                    console.error(err);
                });
        }

    }, [userInfosRef.current]);
    useEffect(() => {
        console.log(notifications); // This will log the updated state when it changes
    }, [notifications]);

    const actionButtons = (rowData) => {
        return (
            <div>
                <Button label="Accept" onClick={() => handleAccept(rowData)} />
                <Button label="Decline" onClick={() => handleDecline(rowData)} />
            </div>
        );
    };
    const handleAccept = (notification) => {

        // Implement logic to accept the notification
        // For example, send a request to your backend to accept the notification
        const playerId = userInfosRef.current.ID;
        const auctionId = notification.auctionId;
        console.log(playerId, auctionId);
        axios
            .post(`http://localhost:9002/playerAssignmentResponse`,
                {
                    playerId: playerId,
                    auctionId: auctionId,
                   
                    response: "accept",
                })
            .then((res) => {
                console.log(res.data);
                window.current.location.reload();
            })
            .catch((err) => {
                console.error(err);
            });
        // After successful acceptance, you can update the UI or refresh the notifications list
    };

    const handleDecline = (notification) => {
        // Implement logic to decline the notification
        // For example, send a request to your backend to decline the notification

        // After successful decline, you can update the UI or refresh the notifications list
    };

    return (
        <div>
            {userInfosRef.current ? (
                <>
                    {/* {console.log("I aaa" )} */}
                    <h1>Hello, {userInfosRef.current.NAME}</h1>
                    <h2>Email: {userInfosRef.current.MAIL}</h2>
                    <h2>Playing Role: {userInfosRef.current.PLAYING_ROLE}</h2>
                    {/* PHOTO */}
                    {/* <h2>Status: {userInfosRef.current.INVITATIONSTATUS}</h2> */}
                    {/* images are in assets/photos/ directory */}
                    <img src={`${userInfosRef.current.PHOTO}`} height={200} /><br />
                    <br />
                    <br />
                    {/* <ul>
                        {notifications.map((notification) => (
                            <li key={notification.NOTIFICATIONID}>
                            <strong>{notification.AUCTIONID}</strong> - {notification.BASEPRICE} 
                            <Button label="Accept" onClick={() => handleAccept(notification)} />
                            <Button label="Decline" onClick={() => handleDecline(notification)} />
                            </li>
                            ))}
                            
                        </ul> */}
                    <h2>Notifications</h2>
                    Notifications: {notifications.length} 
                    {notifications.length > 0 ? (
                        <DataTable value={notifications}>
                            <Column field="auctionName" header="Auction NAME" />
                            <Column field="basePrice" header="Base Price" />
                            <Column field="category" header="Category" />
                            <Column header="Actions" body={actionButtons} />
                        </DataTable>
                     
                    
                    ) : (
                        <p>No notifications available.</p>
                    )}
                    {/* < updateinfo/> */}
                </>
            ) : (
                <p>Loading user information...</p>

            )}
            <button onClick={() => window.location.reload()}>Refresh</button>
        </div>

    );
};

export default PlayerLogin;
