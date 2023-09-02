import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
// import css
import '../css/players.css';

const Players = () => {
    const [players, setPlayers] = useState([]);

    // console.log(players);
    const [currentPlayers, setCurrentPlayers] = useState([]);
    useEffect(() => {
        // Fetch players data
        axios
            .get('http://localhost:9002/players')
            .then((res) => {
                setPlayers(res.data);
                //console.log(`Players: ${res.data}`)
                console.log(1);
            })
            .catch((err) => {
                console.error(err);
            });
    }, []);
    useEffect(() => {
        //from the url: http://localhost:3000/auction/1/players
        //get the auction id
        const auctionId = window.location.pathname.split('/')[2];
        //console.log(`Fetching players for auction ID ${auctionId}`);
        // Fetch players data
        axios
            .get(`http://localhost:9002/auction/${auctionId}/players`)
            .then((res) => {
                console.log(`Current players: res.data`);
                setCurrentPlayers(res.data);
                console.log(currentPlayers);
                console.log(`Current players: ${res.data}`)
            }
            )
            .catch((err) => {
                console.error(err);
            });
    }, []);

    // Filter players to omit those that are in currentPlayers
    const filteredPlayers = players.filter((player) =>
        !currentPlayers.some((currentPlayer) => currentPlayer.ID === player.ID)
    );

    const renderColorBox = (player) => {
        if (player.inAuction) {
            return <div className="color-box green"></div>;
        } else if (player.invitedToAuction) {
            return <div className="color-box yellow"></div>;
        } else {
            return <div className="color-box grey"></div>;
        }
    };

    const handleInviteClick = (playerId) => {
        // Implement your logic for inviting a player to the auction
        // You can use axios to send a POST request to the server
        const auctionId = window.location.pathname.split('/')[2];
        axios
            .post(`http://localhost:9002/assignPlayerToAuction/${auctionId}/${playerId}`)
            .then(() => {
                players.map((player) => {
                    if (player.ID === playerId) {
                        player.status = 'pending';
                    }
                });
            })
            .catch((err) => {
                console.error(err);
            });

        console.log(`Inviting player with ID ${playerId}`);
        
    };
    const handleRemoveFromAuction = (playerId) => {
        // Implement your logic for inviting a player to the auction
        // You can use axios to send a POST request to the server
        const auctionId = window.location.pathname.split('/')[2];
        axios
            .delete(`http://localhost:9002/auction/${auctionId}/players/${playerId}`)
            .then((res) => {
                // Refresh the list of auctions after deletion
                const updatedPlayers = currentPlayers.filter((player) => player.ID !== playerId);
                setCurrentPlayers(updatedPlayers);
                console.log(currentPlayers);
            })
            .catch((err) => {
                console.error(err);
            });
        console.log(`Removing player with ID ${playerId}`);
    };
    return (
        <>
            <div>
                <h2>Players</h2>
                <div className='table-container'>
                    <DataTable value={filteredPlayers}>
                        <Column field="ID" header="ID" />
                        <Column field="NAME" header="Name" />
                        {/* <Column field="BASE_PRICE" header="Base Price" />
          <Column field="CATEGORY" header="Category" /> */}
                        <Column field="STATUS" header="Status" />
                        <Column field="PLAYING_ROLE" header="Playing Role" />
                        
                        <Column
                            body={(player) =>
                                player.status ? (
                                    <Button label="Remove" />
                                ) : (
                                    <Button label="Invite" onClick={() => handleInviteClick(player.ID)} />
                                )
                                
                            }
                            header="Action"
                        />
                    </DataTable>
                </div>
            </div>


            <div className='player-in-auction'>
                <h2>Players in Auction</h2>

                <div className='table-container'>
                    <DataTable value={currentPlayers}>
                        <Column field="ID" header="ID" />
                        <Column field="NAME" header="Name" />
                        <Column field="STATUS" header="Status" />
                        <Column field="PLAYING_ROLE" header="Playing Role" />
                        <Column field="BASE_PRICE" header="Base Price"  />
                        <Column field="CATEGORY" header="Category" />
                        {/* <Column body={renderColorBox} header="Color" /> */}
                        <Column
                            body={(player) => (
                                <Button label="Remove" onClick={() => handleRemoveFromAuction(player.ID)} />
                            )}
                            header="Action"
                        />

                    </DataTable>
                </div>
            </div>
        </>
    );
};

export default Players;
