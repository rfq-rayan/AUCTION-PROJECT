import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import '../css/teamlogin.css'; // Import your CSS file for styling
import Collapsible from 'react-collapsible';
import axios from 'axios';
import Cookies from 'js-cookie';

const BidManagerLogin = ({ userInfo }) => {
    const userInfosRef = useRef(null);
    const [bidManager, setBidManager] = useState([]);
    const [notifications, setNotifications] = useState(
        []
    );

    useEffect(() => {
        const storedUserInfo = Cookies.get('userInfo');
        if (storedUserInfo) {
            const parsedUserInfo = JSON.parse(storedUserInfo);
            userInfosRef.current = parsedUserInfo;
        }
    }
    , []);
    
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
    const handleDecline = (notification) => {};
    useEffect(() => {
        const bidManagerId = userInfosRef.current.ID; 
        // console.log(bidManagerId);
        axios.get(`http://localhost:9002/bidManager?bidManagerId=${bidManagerId}`)
            .then((res) => {
                setBidManager(res.data);
                console.log(bidManager);
            })
            .catch((err) => {
                console.error(err);
            });
        axios.get(`http://localhost:9002/getBidManagerNotifications?bidManagerId=${bidManagerId}`)
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

    return (
        <div>
            {userInfosRef.current ? (
                <>
                    <h1>Welcome {userInfosRef.current.NAME}</h1>
                    <br />
                    <Collapsible trigger = {`Notifications (${notifications.length})`}>
                    {notifications && notifications.length > 0 ? (
                        <DataTable value={notifications}>
                            {/* <Column field="NOTIFICATION" header="Notification" /> */}
                            <Column field="auctionName" header="Auction Name" />
                            <Column field="auctionType" header="Auction Type" />
                            <Column field="ACTION" header="Action" body={actionButtons} />
                        </DataTable>
                    ) : (
                        <h3>No notifications</h3>
                    )}
                    </Collapsible>

                </> 
            ) : (
                // <Navigate to="/login" />
                <h1>Please login</h1>
            )}
        </div>
        );
};

export default BidManagerLogin;