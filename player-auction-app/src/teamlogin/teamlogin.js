import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import '../css/teamlogin.css'; // Import your CSS file for styling
import Collapsible from 'react-collapsible';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Link, Navigate } from 'react-router-dom';
// import "../css/homepage.css";


const TeamLogin = ({ userInfo }) => {
    const userInfosRef = useRef(null);
    // const[teams, setTeams] = useState([]);
    const [team, setTeam] = useState([]);
    const [notifications, setNotifications] = useState(
        []
    );


    useEffect(() => {
        const storedUserInfo = Cookies.get('userInfo');
        if (storedUserInfo) {
            const parsedUserInfo = JSON.parse(storedUserInfo);
            userInfosRef.current = parsedUserInfo;
        }
    }, []);

    useEffect(() => {
        const teamId = userInfosRef.current.ID; 
        // console.log(teamId);
        axios.get(`http://localhost:9002/team?teamId=${teamId}`)
            .then((res) => {
                setTeam(res.data);
                console.log(team);
            })
            .catch((err) => {
                console.error(err);
            });
        axios.get(`http://localhost:9002/getTeamNotifications?teamId=${teamId}`)
            .then((res) => {
                const notificationData = res.data;
                console.log(notificationData);
                setNotifications(notificationData);
                console.log(notifications);
            })
            .catch((err) => {
                console.error(err);
            });
    }, [userInfosRef.current]);
    useEffect(() => {
        console.log(notifications); 
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
        const teamId = userInfosRef.current.ID;
        const auctionId = notification.auctionId;
        console.log(teamId, auctionId);
        axios
            .post(`http://localhost:9002/teamAssignmentResponse`,
                {
                    teamId: teamId,
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
    // const actionButtons = (rowData) => {
    //     return (
    //         <div>
    //             <Button label="Accept" onClick={() => handleAccept(rowData)} />
    //             <Button label="Decline" onClick={() => handleDecline(rowData)} />
    //         </div>
    //     );
    // };
    // const handleAccept = (notification) => {

    //     // Implement logic to accept the notification
    //     // For example, send a request to your backend to accept the notification
    //    const teamId = userInfoRef.current.ID;
    //    const auctionId = notification.auctionId;
    //    console.log(TeamId, auctionId);
    //    axios
    //     .post(`http://localhost:9002/teamAssignmentResponse`,
    //     {
    //         teamId: teamId,
    //         auctionId: auctionId,
    //         response: "accept"
    //     })
    //     .then((res) => {
    //         console.log(res.data);
    //     })
    //     .catch((err) => {
    //         console.error(err);
    //     });
    //     // After successful acceptance, you can update the UI or refresh the notifications list
    // };


    return (
        <div >
            {userInfosRef.current ? (
                <>
                    <h1> Hello, {team.NAME}</h1>
                    <h2> Team ID: {team.ID}</h2>
                    <br/>
                    {/* <h2>Notifications</h2> */}
                    
                    <Collapsible trigger={<p><div className='noti'>Notifications</div></p>}>
                    {notifications && notifications.length > 0 ? (
                        <DataTable value={notifications} className='table'>
                            <Column field="auctionName" header="Auction Name" />
                            <Column field="auctionType" header="Auction Type" />
                            {/* <Column field="auctionId" header="Auction ID" /> */}
                            <Column header="Action" body={actionButtons} />
                            
                        </DataTable>
                    ) : (
                        <p>No notifications</p>
                    )}
                    </Collapsible>

                </>
            )
                : (
                    <p> Loading info....</p>
                )

        }
        </div>
    );

};


export default TeamLogin;