import express from 'express';
import cors from 'cors';
import oracledb from 'oracledb';

const app = express();
app.use(express.json());
app.use(express.urlencoded());
app.use(cors());
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

// Connection Configuration
const dbConfig = {
    user: 'AUCTION',
    password: '12345',
    connectString: 'localhost/orclpdb'
};


app.post("/login", async (req, res) => {
    const { email, password, role } = req.body;
    try {
        const result = await loginUser(email, password, role);
        if (result) {
            const userInfo = await getUserInfo(role, email); // Fetch user information
            ////console.log(userInfo);
            if (userInfo) {
                // ////console.log("I am here");
                res.json({ message: 'Login successful', user: userInfo }); // Change 'userInfo' to 'user'
            } else {
                res.json({ message: 'User information not found' });
            }
        } else {
            res.json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});
// Function to fetch team
app.get("/team", async (req, res) => {
    const { teamId } = req.query;
    try {
        const connection = await oracledb.getConnection(dbConfig);
        const teamQuery = `SELECT * FROM Team WHERE Id = :teamId`;
        const teamResult = await connection.execute(teamQuery, { teamId });
        const team = teamResult.rows[0];
        connection.close();
        res.json(team);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

app.get("/bidManager", async (req, res) => {
    const { bidManagerId } = req.query;
    try {
        const connection = await oracledb.getConnection(dbConfig);
        const bidManagerQuery = `SELECT * FROM Bid_Manager WHERE Id = :bidManagerId`;
        const bidManagerResult = await connection.execute(bidManagerQuery, { bidManagerId });
        const bidManager = bidManagerResult.rows[0];
        connection.close();
        res.json(bidManager);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});



app.get("/players", async (req, res) => {
    try {
        const connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute('SELECT * FROM Player');
        connection.close();
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});
// Fetch players that has status null or not accepted

app.get("/playersInvitationsZone/:auctionId", async (req, res) => {
    const auctionId = req.params.auctionId;
    //////console.log(auctionId);
    try {
        const connection = await oracledb.getConnection(dbConfig);

        // SQL query to select players who have not accepted invitations for a specific auction
        const sqlQuery = `
        SELECT P.Id,(SELECT NAME FROM PLAYER WHERE ID = P.ID) NAME ,(SELECT AGE FROM PLAYER WHERE ID = P.ID) AGE,(SELECT PLAYING_ROLE FROM PLAYER WHERE ID = P.ID) PLAYING_ROLE,(SELECT COUNTRY FROM PLAYER WHERE ID = P.ID) COUNTRY,(SELECT PHOTO FROM PLAYER WHERE ID = P.ID) PHOTO,(SELECT STATUS FROM ASSIGN_NOTIFICATIONS_FOR_PLAYERS ANFP
            WHERE ID = ANFP.PLAYER_ID AND ANFP.AUCTION_ID = :auctionId) STATUS
        FROM PLAYER P
        WHERE P.Id NOT IN
        (SELECT PA.PLAYER_ID 
        FROM PLAYER_IN_AUCTION PA
        WHERE PA.AUCTION_ID = :auctionId)`;

        const result = await connection.execute(sqlQuery, { auctionId });

        connection.close();

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});
app.get("/auctionPlayers/:auctionId", async (req, res) => {
    const auctionId = req.params.auctionId;

    try {
        const connection = await oracledb.getConnection(dbConfig);

        const playersQuery = `
            SELECT p.*,pa.BASE_PRICE,pa.CATEGORY
            FROM Player p
            JOIN Player_In_Auction pa ON p.Id = pa.Player_Id
            WHERE pa.Auction_Id = :auctionId
        `;

        const playersResult = await connection.execute(playersQuery, { auctionId });
        const players = playersResult.rows;

        connection.close();

        res.json(players);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});
app.get("/teamsInvitationsZone/:auctionId", async (req, res) => {
    const auctionId = req.params.auctionId;
    try {
        const connection = await oracledb.getConnection(dbConfig);

        //SQL query to select players who have not accepted invitations
        const sqlQuery = `
        SELECT T.Id,(SELECT NAME FROM TEAM WHERE ID = T.ID) NAME ,(SELECT LOGO FROM TEAM WHERE ID = T.ID) LOGO,(SELECT STATUS FROM ASSIGN_NOTIFICATIONS_FOR_TEAMS ANFT
            WHERE ID = ANFT.TEAM_ID AND ANFT.AUCTION_ID = :auctionId) STATUS
        FROM TEAM T
        WHERE T.Id NOT IN
        (SELECT TA.TEAM_ID 
        FROM TEAM_IN_AUCTION TA
        WHERE TA.AUCTION_ID = :auctionId)
    `;


        const result = await connection.execute(sqlQuery, { auctionId });

        connection.close();

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

app.get("/bidManagersInvitationsZone/:auctionId", async (req, res) => {
    const auctionId = req.params.auctionId;

    try {
        const connection = await oracledb.getConnection(dbConfig);

        //SQL query to select players who have not accepted invitations
        const sqlQuery = `
        SELECT B.Id,(SELECT NAME FROM BID_MANAGER WHERE ID = B.ID) NAME ,(SELECT PHOTO FROM BID_MANAGER WHERE ID = B.ID) PHOTO,(SELECT STATUS FROM ASSIGN_NOTIFICATIONS_FOR_BIDMANAGERS ANFB
            WHERE ID = ANFB.BID_MANAGER_ID AND ANFB.AUCTION_ID = :auctionId) STATUS
        FROM BID_MANAGER B
        WHERE B.Id NOT IN
        (SELECT BA.BID_MANAGER_ID 
        FROM BID_MANAGER_IN_AUCTION BA
        WHERE BA.AUCTION_ID = :auctionId)
    `;

        const result = await connection.execute(sqlQuery, { auctionId });

        connection.close();

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

// Endpoint to assign a player to an auction and send a notification
// Endpoint to assign a player to an auction and send a notification
// app.post("/assignPlayerToAuction", async (req, res) => {
//     const { playerId, auctionId, basePrice, category } = req.body;
//     // console.log(playerId, auctionId, basePrice, category);
//     try {
//         // Insert notification for the player with base price and category
//         await insertNotification(playerId, auctionId, basePrice, category);
//         res.json({ message: 'Notification sent to player' });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'An error occurred' });
//     }
// });

// Endpoint to assign a team to an auction and send a notification
// app.post("/assignTeamToAuction", async (req, res) => {
//     const { teamId, auctionId } = req.body;
//     console.log(`Team ID: ${teamId}, Auction ID: ${auctionId}`);
//     try {
//         // Insert notification for the team
//         await insertTeamNotification(teamId, auctionId);
       
//         res.json({ message: 'Notification sent to team' });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'An error occurred' });
//     }
// });

// Function to insert notification for team
async function insertTeamNotification(teamId, auctionId) {
    try {
        const connection = await oracledb.getConnection(dbConfig);

        // Generate a new notification ID based on the maximum existing ID
        const notificationIdQuery = `
            SELECT NVL(MAX(notification_id), 0) + 1 AS new_notification_id FROM Assign_Notifications_For_Teams
        `;

        const { rows } = await connection.execute(notificationIdQuery);
        const newNotificationId = rows[0].NEW_NOTIFICATION_ID;

        const notificationInsertQuery = `
            INSERT INTO Assign_Notifications_For_Teams (notification_id, Team_Id, Auction_Id, Status)
            VALUES (:notificationId, :teamId, :auctionId, 'pending')
        `;

        const bindVars = {
            notificationId: { val: newNotificationId, dir: oracledb.BIND_IN },
            teamId: { val: teamId, dir: oracledb.BIND_IN },
            auctionId: { val: auctionId, dir: oracledb.BIND_IN }
        };

        await connection.execute(notificationInsertQuery, bindVars);
        await connection.commit();

        connection.close();
    } catch (error) {
        console.error(error);
        throw error;
    }
}


// To undo 

app.delete("/undoTeamInvitation", async (req, res) => {
    const { teamId, auctionId } = req.query;

    try {
        const connection = await oracledb.getConnection(dbConfig);

        // Check if the invitation exists and has a 'pending' status
        const checkInvitationQuery = `
            SELECT *
            FROM Assign_Notifications_For_Teams
            WHERE Team_Id = :teamId AND Auction_Id = :auctionId AND Status = 'pending'
        `;

        const checkResult = await connection.execute(checkInvitationQuery, { teamId, auctionId });

        if (checkResult.rows.length === 0) {
            // Invitation not found or not in 'pending' status
            connection.close();
            return res.status(400).json({ error: 'Invalid invitation or invitation is not pending' });
        }

        // Delete the invitation
        const deleteInvitationQuery = `
            DELETE FROM Assign_Notifications_For_Teams
            WHERE Team_Id = :teamId AND Auction_Id = :auctionId
        `;

        await connection.execute(deleteInvitationQuery, { teamId, auctionId });

        connection.commit();
        connection.close();

        res.json({ message: 'Invitation undone successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

app.delete("/undoPlayerInvitation", async (req, res) => {
    //////console.log(req.query);
    const { playerId, auctionId } = req.query;
    //////console.log(playerId, auctionId);

    try {
        const connection = await oracledb.getConnection(dbConfig);

        // Check if the invitation exists and has a 'pending' status
        const checkInvitationQuery = `
            SELECT *
            FROM Assign_Notifications_For_Players
            WHERE Player_Id = :playerId AND Auction_Id = :auctionId AND Status = 'pending'
        `;

        const checkResult = await connection.execute(checkInvitationQuery, { playerId, auctionId });

        if (checkResult.rows.length === 0) {
            // Invitation not found or not in 'pending' status
            connection.close();
            return res.status(400).json({ error: 'Invalid invitation or invitation is not pending' });
        }

        // Delete the invitation
        const deleteInvitationQuery = `
            DELETE FROM Assign_Notifications_For_Players
            WHERE Player_Id = :playerId AND Auction_Id = :auctionId
        `;

        await connection.execute(deleteInvitationQuery, { playerId, auctionId });

        connection.commit();
        connection.close();

        res.json({ message: 'Invitation undone successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

// Function to insert notification for the player
async function insertNotification(playerId, auctionId, basePrice, category) {
    try {
        const connection = await oracledb.getConnection(dbConfig);
        console.log(playerId, auctionId, basePrice, category);
        // Generate a new notification ID based on the maximum existing ID
        const notificationIdQuery = `
            SELECT NVL(MAX(notification_id), 0) + 1 AS new_notification_id FROM Assign_Notifications_For_Players
        `;

        const { rows } = await connection.execute(notificationIdQuery);
        const newNotificationId = rows[0].NEW_NOTIFICATION_ID;

        const notificationInsertQuery = `
            INSERT INTO Assign_Notifications_For_Players (notification_id, Player_Id, Auction_Id, Base_Price, Category, Status)
            VALUES (:notificationId, :playerId, :auctionId, :basePrice, :category, 'pending')
        `;

        const bindVars = {
            notificationId: { val: newNotificationId, dir: oracledb.BIND_IN },
            playerId: { val: playerId, dir: oracledb.BIND_IN },
            auctionId: { val: auctionId, dir: oracledb.BIND_IN },
            basePrice: { val: basePrice, dir: oracledb.BIND_IN },
            category: { val: category, dir: oracledb.BIND_IN }
        };
        await connection.execute(notificationInsertQuery, bindVars);
        console.log(bindVars);
        await connection.commit();

        connection.close(); 
    } catch (error) {
        console.error(error);
        throw error;
    }
}

async function checkExistingNotification(playerId, auctionId) {
    try {
        const connection = await oracledb.getConnection(dbConfig);
     
        const checkQuery = `
            SELECT *
            FROM Assign_Notifications_For_Players
            WHERE Player_Id = :playerId
            AND Auction_Id = :auctionId
        `;

        const bindVars = {
            playerId: playerId,
            auctionId: auctionId,
        };

        const result = await connection.execute(checkQuery, bindVars);
        connection.close();

        if (result.rows.length > 0) {
            
            // Return the existing notification
            return result.rows[0];
        } else {
            // No existing notification found
            return null;
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
}


async function checkExistingNotificationForTeam(teamId, auctionId) {
    try {
        const connection = await oracledb.getConnection(dbConfig);

        const checkQuery = `
            SELECT *
            FROM Assign_Notifications_For_Teams
            WHERE team_Id = :teamId
            AND Auction_Id = :auctionId
        `;

        const bindVars = {
            teamId: teamId,
            auctionId: auctionId,
        };

        const result = await connection.execute(checkQuery, bindVars);
        connection.close();

        if (result.rows.length > 0) {

            // Return the existing notification
            return result.rows[0];
        } else {
            // No existing notification found
            return null;
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
}
app.post("/assignPlayerToAuction", async (req, res) => {
    const { playerId, auctionId, basePrice, category } = req.body;

    try {
        // Check if the player already has a notification for the specified auction

        const existingNotification = await checkExistingNotification(playerId, auctionId);

        if (existingNotification) {
            console.log('dhuklam');
            // Update the existing notification status to "pending"
            await updateNotificationStatus(playerId, auctionId, 'pending', basePrice, category);
        } else {
            // Insert a new notification for the player with base price and category
            await insertNotification(playerId, auctionId, basePrice, category);
        }

        res.json({ message: 'Notification sent to player' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});
app.post("/assignTeamToAuction", async (req, res) => {
    const { teamId, auctionId } = req.body;

    try {
        // Check if the player already has a notification for the specified auction

        const existingNotification = await checkExistingNotificationForTeam(teamId, auctionId);
        if (existingNotification) {
            await updateTeamNotificationStatus(teamId, auctionId, 'pending');
        } else {
        // Insert notification for the team
        await insertTeamNotification(teamId, auctionId);
        }
        res.json({ message: 'Notification sent to team' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

// Fetch players for a specific auction ID
app.get("/auction/:id/players", async (req, res) => {
    const auctionId = req.params.id;//params is used to get the id from the url
    try {
        const connection = await oracledb.getConnection(dbConfig);

        const playersQuery = `
            SELECT p.*,pa.BASE_PRICE,pa.CATEGORY
            FROM Player p
            JOIN Player_In_Auction pa ON p.Id = pa.Player_Id
            WHERE pa.Auction_Id = :auctionId
        `;
        // //////console.log(`Auction ID: ${auctionId}`);
        const playersResult = await connection.execute(playersQuery, { auctionId });
        const players = playersResult.rows;
        if(playersResult.rows.length > 0){
            ////console.log( playersResult.rows);
            ////console.log(`currentplayers: ${playersResult.rows[0].NAME}`);
        }
        else{
            ////console.log("No players found");
        }

        connection.close();

        res.json(players);
        ////console.log(players);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

// Fetch teams for a specific auction ID
app.get("/auction/:id/teams", async (req, res) => {
    const auctionId = req.params.id;
    try {
        const connection = await oracledb.getConnection(dbConfig);

        const teamsQuery = `
            SELECT t.*
            FROM Team t
            JOIN Team_In_Auction ta ON t.Id = ta.Team_Id
            WHERE ta.Auction_Id = :auctionId
        `;

        const teamsResult = await connection.execute(teamsQuery, { auctionId });
        const teams = teamsResult.rows;

        connection.close();

        res.json(teams);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});
app.get("/auctions", async (req, res) => {
    const { adminId } = req.query; // Assuming you pass the adminId as a query parameter

    if (!adminId) {
        return res.status(400).json({ error: 'Missing adminId parameter' });
    }

    try {
        const auctions = await getAuctions(adminId);
        res.json(auctions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

// Fetch auction details for a specific ID
app.get("/auction/:id", async (req, res) => {
    const auctionId = req.params.id;
    try {
        const connection = await oracledb.getConnection(dbConfig);
        
        // Query to fetch auction details based on the provided auctionId
        const auctionDetailsQuery = `
            SELECT Id, Name, Type, Auction_Status
            FROM Auction_Details
            WHERE Id = :auctionId
        `;
        
        const auctionDetailsResult = await connection.execute(auctionDetailsQuery, { auctionId });
        connection.close();
        
        // Check if the auction details were found
        if (auctionDetailsResult.rows.length > 0) {
            const auctionDetails = auctionDetailsResult.rows[0];
            res.json(auctionDetails);
        } else {
            res.status(404).json({ message: 'Auction details not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

// Function to create a new auction in the database
app.post("/createAuction", async (req, res) => {
    const { name, type, adminId } = req.body;
    if (!name || !type || !adminId) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }


    try {
        const result = await createAuction(name, type, adminId);
        if (result) {
            res.json({ message: 'Auction created successfully' });
        } else {
            res.json({ message: 'Auction creation failed' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }

});


// Function to create a new auction in the database
async function createAuction(name, type, adminId) {
    try {
        const connection = await oracledb.getConnection(dbConfig);
        // check if auction already exists
        const verifyQuery = `SELECT COUNT(*) AS auction_count FROM Auction_Details WHERE Name = :name AND Type = :type AND Admin_Id = :adminId`;
        const verifyResult = await connection.execute(verifyQuery, { name, type, adminId });
        // ////console.log(name, type, adminId);
        const auctionCount = verifyResult.rows[0].AUCTION_COUNT;
        if (auctionCount > 0) {
            ////console.log('Auction already exists');
            return false;
        }

        // Query to insert a new auction into the Auction_Details table]
        const insertQuery = `
            BEGIN
                CREATE_AUCTION(:adminId, :name, :type );
            END;
        `;

        // //generate id
        // const countQuery = `SELECT COUNT(*) AS record_count FROM Auction_Details`;
        // const countResult = await connection.execute(countQuery);
        // const recordCount = countResult.rows[0].RECORD_COUNT;
        // const generatedId = (recordCount + 1).toString().padStart(3, '0');

        // const insertQuery = `INSERT INTO Auction_Details (ID, Name, Type, Admin_Id) VALUES (:id, :name, :type, :adminId)`;
        const bindVars = {
            // id: generatedId,
            name: name,
            type: type,
            adminId: adminId
        };
        await connection.execute(insertQuery, bindVars);
        ////console.log("Auction created");
        await connection.commit();
        connection.close();
        // ////console.log(`Auction created with ID: ${generatedId}`);
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}
// Function to fetch auctions for a specific adminId from the database
async function getAuctions(adminId) {
    try {
        const connection = await oracledb.getConnection(dbConfig);

        // Query to fetch auctions related to a specific adminId from the Auction_Details table
        const auctionsQuery = `
            SELECT Id, Name, Type
            FROM Auction_Details
            WHERE Admin_Id = :adminId
        `;
        ////console.log(adminId);
        const auctionsResult = await connection.execute(auctionsQuery, { adminId });
        ////console.log(auctionsResult.rows);

        connection.close();

        return auctionsResult.rows;
    } catch (error) {
        console.error(error);
        return [];
    }
}



app.post("/register", async (req, res) => {
    const { name, email, password, role, playingRole } = req.body;

    try {
        const result = await registerUser(name, password, email, role, playingRole);

        if (result) {
            const userInfo = await getUserInfo(role, email);
            if(userInfo){
                res.json({ message: 'Registration successful', user: userInfo });
            }

            // res.json({ message: 'Registration successful' });
        } else {
            // res.status(500).json({ error: 'Registration failed' });
            res.json({ message: 'Registration failed' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

// Assuming you have your app and database configuration set up

app.delete("/deleteAuction/:id", async (req, res) => {
    ////console.log(req.params.id)
    const auctionId = req.params.id;
    try {
        const connection = await oracledb.getConnection(dbConfig);
        const deleteAuctionQuery = `
    BEGIN
        DELETE_AUCTION(:auctionId);
    END;
`;
        const bindVars = {
            auctionId: auctionId
        };

        await connection.execute(deleteAuctionQuery, bindVars);

        // Respond with success
        res.json({ message: 'Auction deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});
// Delete a player from an auction
app.delete("/auction/:auctionId/players/:playerId", async (req, res) => {
    const auctionId = req.params.auctionId;
    const playerId = req.params.playerId;
    try {
        const connection = await oracledb.getConnection(dbConfig);
        const removePlayerQuery = `DELETE FROM Player_In_Auction WHERE Auction_Id = :auctionId AND Player_Id = :playerId`;
        const bindVars = {
            auctionId: auctionId,
            playerId: playerId
        };
        await connection.execute(removePlayerQuery, bindVars);
        await connection.commit();
        connection.close();
        res.json({ message: 'Player removed successfully' });
        console.log("Player removed successfully");
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

// Delete a team from an auction
app.delete("/auction/:auctionId/teams/:teamId", async (req, res) => {
    const auctionId = req.params.auctionId;
    const teamId = req.params.teamId;
    try {
        const connection = await oracledb.getConnection(dbConfig);
        const removeTeamQuery = `DELETE FROM Team_In_Auction WHERE Auction_Id = :auctionId AND Team_Id = :teamId`;
        const bindVars = {
            auctionId: auctionId,
            teamId: teamId
        };
        await connection.execute(removeTeamQuery, bindVars);
        await connection.commit();
        connection.close();
        res.json({ message: 'Team removed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});
// Assign a player to an auction
app.post("/assignPlayerToAuction", async (req, res) => {
    const { playerId, auctionId, basePrice, category } = req.body;

    try {
        // Check if the player already has a notification for the specified auction

        const existingNotification = await checkExistingNotification(playerId, auctionId);

        if (existingNotification) {
            console.log('dhuklam');
            // Update the existing notification status to "pending"
            await updateNotificationStatus(playerId, auctionId, 'pending', basePrice, category);
        } else {
            // Insert a new notification for the player with base price and category
            await insertNotification(playerId, auctionId, basePrice, category);
        }

        res.json({ message: 'Notification sent to player' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

// Function to insert notification for the player
// async function insertNotification(playerId, auctionId, basePrice, category) {
//     try {
//         const connection = await oracledb.getConnection(dbConfig);

//         // Generate a new notification ID based on the maximum existing ID
//         const notificationIdQuery = `
//             SELECT NVL(MAX(notification_id), 0) + 1 AS new_notification_id FROM Assign_Notifications_For_Players
//         `;

//         const { rows } = await connection.execute(notificationIdQuery);
//         const newNotificationId = rows[0].NEW_NOTIFICATION_ID;

//         const notificationInsertQuery = `
//             INSERT INTO Assign_Notifications_For_Players (notification_id, Player_Id, Auction_Id, Base_Price, Category, Status)
//             VALUES (:notificationId, :playerId, :auctionId, :basePrice, :category, 'pending')
//         `;

//         const bindVars = {
//             notificationId: { val: newNotificationId, dir: oracledb.BIND_IN },
//             playerId: { val: playerId, dir: oracledb.BIND_IN },
//             auctionId: { val: auctionId, dir: oracledb.BIND_IN },
//             basePrice: { val: basePrice, dir: oracledb.BIND_IN },
//             category: { val: category, dir: oracledb.BIND_IN }
//         };

//         await connection.execute(notificationInsertQuery, bindVars);
//         await connection.commit();

//         connection.close();
//     } catch (error) {
//         console.error(error);
//         throw error;
//     }
// }

// add loginuser code here
async function loginUser(email, password, role) {
    try {
        let tableName = '';

        // Determine the table name based on the selected role
        switch (role) {
            case 'admin':
                tableName = 'Admin';
                break;
            case 'team':
                tableName = 'Team';
                break;
            case 'player':
                tableName = 'Player';
                break;
            case 'bidmanager':
                tableName = 'Bid_Manager';
                break;
            default:
                return false;
        }

        const connection = await oracledb.getConnection(dbConfig);

        // Check if the user exists
        const loginQuery = `SELECT COUNT(*) AS user_count FROM ${tableName} WHERE Mail = :email AND Password = :password`;
        const loginResult = await connection.execute(loginQuery, { email, password });
        const userCount = loginResult.rows[0].USER_COUNT;
        connection.close();
        if (userCount > 0) {
            // ////console.log('User found');
            return true;
            // res.send({message: 'Login successful', user: user})
        }
        else {
            // ////console.log('Invalid credentials');
            return false;
            // res.send({message: 'Invalid credentials'})
        }
    } catch (error) {
        console.error(error);
        return false;
    }
}

async function getUserInfo(role, email) {
    try {
        let tableName = '';

        // Determine the table name based on the selected role
        switch (role) {
            case 'admin':
                tableName = 'Admin';
                break;
            case 'team':
                tableName = 'Team';
                break;
            case 'player':
                tableName = 'Player';
                break;
            case 'bidmanager':
                tableName = 'Bid_Manager';
                break;
            default:
                return null;
        }

        const connection = await oracledb.getConnection(dbConfig);

        // Retrieve the user's information
        const userInfoQuery = `SELECT * FROM ${tableName} WHERE Mail = :email`;
        const userInfoResult = await connection.execute(userInfoQuery, { email });
        const userInfo = userInfoResult.rows[0];
        // add table name to the user info
        userInfo.Role = tableName;

        ////console.log(userInfo);
        // ////console.log("Iaaa");

        connection.close();
        return userInfo;
    } catch (error) {
        console.error(error);
        return null;
    }
}


// ...

async function registerUser(name, password, email, role, playingRole) {
    try {
        let tableName = '';
        let additionalData = {};

        ////console.log(role);

        // Determine the table name and additional data based on the selected role
        switch (role) {
            case 'admin':
                tableName = 'Admin';
                additionalData.Mail = email;
                break;
            case 'team':
                tableName = 'Team';
                // Additional data for the Team table
                additionalData.Mail = email;
                additionalData.Logo = ''; // Set your default value here
                // additionalData.Taken_Player = 0; // Set your default value here
                // additionalData.Total_Player = 0; // Set your default value here
                // additionalData.Available_Fund = 0.0; // Set your default value here
                // additionalData.Total_Fund = 0.0; // Set your default value here

                break;
            case 'player':
                tableName = 'Player';
                // Additional data for the Player table
                // additionalData.Base_Price = 0.0; // Set your default value here
                // additionalData.Category = ''; // Set your default value here
                additionalData.Photo = ''; // Set your default value here
                // additionalData.Status = ''; // Set your default value here
                // additionalData.Playing_Role = ''; // Set your default value here
                additionalData.playing_role = playingRole;
                additionalData.Mail = email;
                break;

            case 'bidmanager':
                tableName = 'Bid_Manager';
                additionalData.Mail = email;
                additionalData.Photo = ''; // Set your default value here (empty string)
                break;

            default:
                return false;
        }

        const connection = await oracledb.getConnection(dbConfig);

        // Get the current number of records in the table
        const countQuery = `SELECT COUNT(*) AS record_count FROM ${tableName}`;
        const countResult = await connection.execute(countQuery);
        const recordCount = countResult.rows[0].RECORD_COUNT;

        // Generate the ID as a 3-digit padded string
        const generatedId = (recordCount + 1).toString().padStart(3, '0');

        //verify if already exists
        const verifyQuery = `SELECT COUNT(*) AS user_count FROM ${tableName} WHERE Mail = :email`;
        const verifyResult = await connection.execute(verifyQuery, { email });
        const userCount = verifyResult.rows[0].USER_COUNT;
        if (userCount > 0) {
            ////console.log('User already exists');

            return false;
        }

        ////console.log("IN");
        // Construct the INSERT query
        // Construct the INSERT query
        const insertQuery = `INSERT INTO ${tableName} (ID, Name, Password, ${Object.keys(additionalData).join(', ')})
        VALUES (:id, :name, :password, ${Object.keys(additionalData).map(key => `:${key}`).join(', ')})`;


        const bindVars = {
            id: generatedId,
            name: name,
            password: password,
            ...additionalData
        };

        // Execute the INSERT query
        ////console.log('User registered');
        await connection.execute(insertQuery, bindVars);
        //commit the transaction
        await connection.commit();

        connection.close();

        ////console.log(`User registered with ID: ${generatedId}`);

        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}

// ...

// Endpoint to fetch notifications for a specific player
app.get('/getNotifications', async (req, res) => {
    const playerId = req.query.playerId;
    ////console.log(playerId);
    try {
      const notifications = await getAllNotifications(playerId);
      res.json(notifications);
      ////console.log(notifications);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred' });
    }
});

// Function to fetch notifications for a specific player

  async function getAllNotifications(playerId) {
    try {
      const connection = await oracledb.getConnection(dbConfig);
  
      const notificationQuery = `
        SELECT Notification_Id, Auction_Id,(SELECT NAME FROM AUCTION_DETAILS WHERE ID = AUCTION_ID) AUCTION_NAME, Base_Price, Category, Status
        FROM Assign_Notifications_For_Players
        WHERE Player_Id = :playerId AND Status = 'pending'
      `;
  
      const bindVars = {
        playerId: { val: playerId },
      };
  
      const result = await connection.execute(notificationQuery, bindVars);
      connection.close();
  
      const notifications = result.rows.map((row) => ({
        notificationID: row.NOTIFICATION_ID,
        auctionId: row.AUCTION_ID,
        auctionName: row.AUCTION_NAME,
        basePrice: row.BASE_PRICE,
        category: row.CATEGORY,
        status: row.STATUS,
      }));
    //   ////console.log(notifications);
      return notifications;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
//to get notification of a player and a particular auction
app.get('/getNotification', async (req, res) => {
    const { playerId, auctionId } = req.query;

    try {
        const notificationInfo = await getNotificationInfo(playerId, auctionId);
        if (notificationInfo) {
            res.json(notificationInfo);
        } else {
            res.status(404).json({ error: 'Notification not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

// Function to fetch notification for a specific player and auction
async function getNotificationInfo(playerId, auctionId) {
    try {
        const connection = await oracledb.getConnection(dbConfig);

        const notificationQuery = `
            SELECT Base_Price, Category
            FROM Assign_Notifications_For_Players
            WHERE Player_Id = :playerId AND Auction_Id = :auctionId
        `;

        const bindVars = {
            playerId: { val: playerId },
            auctionId: { val: auctionId }
        };

        const result = await connection.execute(notificationQuery, bindVars);
        connection.close();

        if (result.rows.length > 0) {
            return {
                basePrice: result.rows[0].BASE_PRICE,
                category: result.rows[0].CATEGORY
            };
        } else {
            return null;
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
}


app.get('/getTeamNotifications', async (req, res) => {
    const teamId = req.query.teamId;
    // ////console.log(teamId);
    try {
        const notifications = await getAllTeamNotifications(teamId);
        res.json(notifications);
        // ////console.log(notifications);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

app.get('/getBidManagerNotifications', async (req, res) => {
    const bidManagerId = req.query.bidManagerId;
    try {
        const notifications = await getAllBidManagerNotifications(bidManagerId);
        res.json(notifications);
        // ////console.log(notifications);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});


async function getAllTeamNotifications(teamId) {
    try {
        const connection = await oracledb.getConnection(dbConfig);
        ////console.log(teamId)
        const notificationQuery = `
        SELECT Notification_Id, Auction_Id, (SELECT NAME FROM AUCTION_DETAILS WHERE ID = Auction_Id) AUCTION_NAME, (SELECT TYPE FROM AUCTION_DETAILS WHERE ID = Auction_Id) AUCTION_TYPE, Status
            FROM Assign_Notifications_For_Teams
            WHERE Team_Id = :teamId AND Status = 'pending'
        `;
        // ////console.log(teamId);
        const bindVars = {
            teamId: { val: teamId },
        };

        const result = await connection.execute(notificationQuery, bindVars);
        connection.close();

        const notifications = result.rows.map((row) => ({
            notificationID: row.NOTIFICATION_ID,
            auctionId: row.AUCTION_ID,
            auctionName: row.AUCTION_NAME,
            auctionType: row.AUCTION_TYPE,
            // auctionId: row.AUCTION_ID,
            status: row.STATUS,
        }));
        // ////console.log(notifications);
        return notifications;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

async function getAllBidManagerNotifications(bidManagerId) {
    try {
        const connection = await oracledb.getConnection(dbConfig);
        const notificationQuery = `
        SELECT Notification_Id, Auction_Id, (SELECT NAME FROM AUCTION_DETAILS WHERE ID = Auction_Id) AUCTION_NAME, (SELECT TYPE FROM AUCTION_DETAILS WHERE ID = Auction_Id) AUCTION_TYPE, Status
            FROM Assign_Notifications_For_BidManagers
            WHERE Bid_Manager_Id = :bidManagerId AND Status = 'pending'
        `;

        const bindVars = {
            bidManagerId: { val: bidManagerId },
        };

        const result = await connection.execute(notificationQuery, bindVars);
        connection.close();

        const notifications = result.rows.map((row) => ({
            notificationID: row.NOTIFICATION_ID,
            auctionId: row.AUCTION_ID,
            auctionName: row.AUCTION_NAME,
            auctionType: row.AUCTION_TYPE,
            status: row.STATUS,
        }));
        // ////console.log(notifications);
        return notifications;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

// Endpoint to fetch notifications for a specific team 



// Endpoint for players to respond to notifications
app.post("/playerAssignmentResponse", async (req, res) => {
    const { playerId, auctionId, response } = req.body;

    try {
        if (response === 'accept') {
            const notification = await getNotificationInfo(playerId, auctionId);
            if (notification) {
                // Insert player into Player_In_Auction table with base price and category
                await insertPlayerInAuction(playerId, auctionId, notification.basePrice, notification.category);
                // Update notification status to 'accepted'
                await updateNotificationStatus(playerId, auctionId, 'accepted');
                res.json({ message: 'Player accepted invitation and inserted into auction' });
            } else {
                res.status(400).json({ error: 'Invalid notification' });
            }
        } else if (response === 'decline') {
            // Update notification status to 'declined'
            await updateNotificationStatus(playerId, auctionId, 'declined');
            res.json({ message: 'Player declined invitation' });
        } else {
            res.status(400).json({ error: 'Invalid response' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});


// Function to insert player into Player_In_Auction table
async function insertPlayerInAuction(playerId, auctionId, basePrice, category) {
    try {
        const connection = await oracledb.getConnection(dbConfig);

        const insertQuery = `
            INSERT INTO Player_In_Auction (Player_Id, Auction_Id, Base_Price, Category, Status)
            VALUES (:playerId, :auctionId, :basePrice, :category, 'available')
        `;

        const bindVars = {
            playerId: { val: playerId },
            auctionId: { val: auctionId },
            basePrice: { val: basePrice },
            category: { val: category }
        };

        await connection.execute(insertQuery, bindVars);
        await connection.commit();

        connection.close();
    } catch (error) {
        console.error(error);
        throw error;
    }
}


// Endpoint for teams to respond to notifications
app.post("/teamAssignmentResponse", async (req, res) => {
    const { teamId, auctionId, response } = req.body;

    try {
        if (response === 'accept') {
            const notification = await getNotificationInfoForTeam(teamId, auctionId);
            if (notification) {
                // Insert team into Team_In_Auction table
                await insertTeamInAuction(teamId, auctionId);

                // Update notification status to 'accepted'
                await updateTeamNotificationStatus(teamId, auctionId, 'accepted');

                res.json({ message: 'Team accepted invitation and inserted into auction' });
            }
        } else if (response === 'decline') {
            // Update notification status to 'declined'
            await updateTeamNotificationStatus(teamId, auctionId, 'declined');

            res.json({ message: 'Team declined invitation' });
        } else {
            res.status(400).json({ error: 'Invalid response' });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});
async function getNotificationInfoForTeam(teamId, auctionId) {
    try {
        const connection = await oracledb.getConnection(dbConfig);

        const notificationQuery = `
        SELECT Auction_Id, 
        (SELECT Name FROM Auction_Details WHERE Id = :auctionId) AS Auction_Name
 FROM Assign_Notifications_For_Teams
 WHERE Team_Id = :teamId AND Auction_Id = :auctionId
`;

        const bindVars = {
            teamId: { val: teamId, type: oracledb.NUMBER },
            auctionId: { val: auctionId, type: oracledb.NUMBER }
        };

        const result = await connection.execute(notificationQuery, bindVars);
        connection.close();

        if (result.rows.length > 0) {
            return {
                auctionName: result.rows[0].AUCTION_NAME
            };

        } else {
            return null;
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
}

// Function to insert team into Team_In_Auction table
async function insertTeamInAuction(teamId, auctionId) {
    try {
        const connection = await oracledb.getConnection(dbConfig);

        const insertQuery = `
            INSERT INTO Team_In_Auction (Team_Id, Auction_Id)
            VALUES (:teamId, :auctionId)
        `;

        const bindVars = {
            teamId: { val: teamId },
            auctionId: { val: auctionId }
        };

        await connection.execute(insertQuery, bindVars);
        await connection.commit();

        connection.close();
    } catch (error) {
        console.error(error);
        throw error;
    }
}


// Function to update team notification status
async function updateTeamNotificationStatus(teamId, auctionId, status) {
    try {
        const connection = await oracledb.getConnection(dbConfig);

        const updateQuery = `
            UPDATE Assign_Notifications_For_Teams
            SET Status = :status
            WHERE Team_Id = :teamId AND Auction_Id = :auctionId
        `;

        const bindVars = {
            status: { val: status },
            teamId: { val: teamId },
            auctionId: { val: auctionId }
        };

        await connection.execute(updateQuery, bindVars);
        await connection.commit();

        connection.close();
    } catch (error) {
        console.error(error);
        throw error;
    }
}


// Function to update notification status
async function updateNotificationStatus(playerId, auctionId, status, basePrice, category) {
    try {
        const connection = await oracledb.getConnection(dbConfig);

        const updateQuery = `
        UPDATE Assign_Notifications_For_Players
        SET Status = :status, Base_Price = :basePrice, Category = :category
        WHERE Player_Id = :playerId AND Auction_Id = :auctionId
    `;
    

    const bindVars = {
        status: { val: status, dir: oracledb.BIND_IN },
        basePrice: { val: basePrice, dir: oracledb.BIND_IN },
        category: { val: category, dir: oracledb.BIND_IN },
        playerId: { val: playerId, dir: oracledb.BIND_IN },
        auctionId: { val: auctionId, dir: oracledb.BIND_IN }
    };
    
    

        await connection.execute(updateQuery, bindVars);
        await connection.commit();

        connection.close();
    } catch (error) {
        console.error(error);
        throw error;
    }
}

app.get("/pastAuctions", async (req, res) => {
    try {
        const connection = await oracledb.getConnection(dbConfig);

        // Query to fetch past auctions
        const pastAuctionsQuery = `
            SELECT *
            FROM Auction_Details
            WHERE Auction_Status = 'Past'
        `;

        const result = await connection.execute(pastAuctionsQuery, {}, { outFormat: oracledb.OUT_FORMAT_OBJECT });

        connection.close();

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});


app.get("/currentAuctions", async (req, res) => {
    try {
        const connection = await oracledb.getConnection(dbConfig);

        // Query to fetch current auctions
        const getCurrentAuctionsQuery = `
            SELECT Id, Name, Type, Auction_Status
            FROM Auction_Details
            WHERE Auction_Status = 'Current'
        `;

        const result = await connection.execute(getCurrentAuctionsQuery, {}, { outFormat: oracledb.OUT_FORMAT_OBJECT });

        connection.close();

        // Respond with the list of current auctions
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});


app.get("/upcomingAuctions", async (req, res) => {
    try {
        const connection = await oracledb.getConnection(dbConfig);

        // Query to fetch future auctions
        const futureAuctionsQuery = `
            SELECT Id, Name, Type, Auction_Status
            FROM Auction_Details
            WHERE Auction_Status = 'Future'
        `;

        const result = await connection.execute(futureAuctionsQuery, {}, { outFormat: oracledb.OUT_FORMAT_OBJECT });

        connection.close();

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});



app.put("/updateAuctionStatus/:id", async (req, res) => {
    const auctionId = req.params.id;

    try {
        const connection = await oracledb.getConnection(dbConfig);

        // Check if the auction status is currently "Future" or "Current"
        const checkAuctionStatusQuery = `
            SELECT Auction_Status
            FROM Auction_Details
            WHERE Id = :auctionId
        `;

        const statusResult = await connection.execute(checkAuctionStatusQuery, { auctionId });

        if (statusResult.rows.length === 0) {
            connection.close();
            return res.status(404).json({ error: 'Auction not found' });
        }

        const currentStatus = statusResult.rows[0]['AUCTION_STATUS'];

        // Call the PL/SQL function to update the auction status based on the current status
        let updateStatusFunction;
        if (currentStatus === 'Future') {
            updateStatusFunction = `BEGIN :result := UpdateAuctionStatusToCurrent(:auctionId); END;`;
        } else if (currentStatus === 'Current') {

            updateStatusFunction = `BEGIN :result := UpdateAuctionStatusToPast(:auctionId); END;`;
        } else {
            connection.close();
            return res.status(400).json({ error: 'Invalid auction status' });
        }

        const updateStatusBinds = {
            result: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
            auctionId: auctionId,
        };

        const updateStatusResult = await connection.execute(updateStatusFunction, updateStatusBinds);

        if (updateStatusResult.outBinds.result === 1) {
            // Commit the transaction
            await connection.commit();

            connection.close();

            // Respond with success
            res.json({ message: `Auction status updated to "${currentStatus === 'Future' ? 'Current' : 'Past'}" successfully` });
        } else {
            // Transaction failed
            connection.close();
            res.status(500).json({ error: 'Failed to update auction status' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});



// Function to insert notification for the bid manager
async function insertBidManagerNotification(bidManagerId, auctionId) {
    try {
        const connection = await oracledb.getConnection(dbConfig);

        // Generate a new notification ID based on the maximum existing ID
        const notificationIdQuery = `
            SELECT NVL(MAX(Notification_Id), 0) + 1 AS new_notification_id FROM Assign_Notifications_For_BidManagers
        `;

        const { rows } = await connection.execute(notificationIdQuery);
        const newNotificationId = rows[0].NEW_NOTIFICATION_ID;

        const notificationInsertQuery = `
            INSERT INTO Assign_Notifications_For_BidManagers (Notification_Id, Bid_Manager_Id, Auction_Id, Status)
            VALUES (:notificationId, :bidManagerId, :auctionId, 'pending')
        `;

        const bindVars = {
            notificationId: { val: newNotificationId, dir: oracledb.BIND_IN },
            bidManagerId: { val: bidManagerId, dir: oracledb.BIND_IN },
            auctionId: { val: auctionId, dir: oracledb.BIND_IN }
        };

        await connection.execute(notificationInsertQuery, bindVars);
        await connection.commit();

        connection.close();
    } catch (error) {
        console.error(error);
        throw error;
    }
}

async function checkExistingNotificationForBidManager(bidManagerId, auctionId) {
    try {
        const connection = await oracledb.getConnection(dbConfig);

        const checkQuery = `
            SELECT *
            FROM Assign_Notifications_For_BidManagers
            WHERE Bid_Manager_Id = :bidManagerId
            AND Auction_Id = :auctionId
        `;

        const bindVars = {
            bidManagerId: bidManagerId,
            auctionId: auctionId,
        };

        const result = await connection.execute(checkQuery, bindVars);
        connection.close();

        if (result.rows.length > 0) {

            // Return the existing notification
            return result.rows[0];
        } else {
            // No existing notification found
            return null;
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
}

app.post("/assignBidManagerToAuction", async (req, res) => {
    const { bidManagerId, auctionId } = req.body;
    console.log(bidManagerId, auctionId);
    try {
        const existingNotification = await checkExistingNotificationForBidManager(bidManagerId, auctionId);
        if (existingNotification) {
            await updateBidManagerNotificationStatus(bidManagerId, auctionId, 'pending');
        } else {
        // Insert notification for the bid manager
        await insertBidManagerNotification(bidManagerId, auctionId);
        }
        res.json({ message: 'Notification sent to bid manager' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});


app.delete("/undoBidManagerInvitation", async (req, res) => {
    const { bidManagerId, auctionId } = req.query;

    try {
        const connection = await oracledb.getConnection(dbConfig);

        // Check if the invitation exists and has a 'pending' status
        const checkInvitationQuery = `
            SELECT *
            FROM Assign_Notifications_For_BidManagers
            WHERE Bid_Manager_Id = :bidManagerId AND Auction_Id = :auctionId AND Status = 'pending'
        `;

        const checkResult = await connection.execute(checkInvitationQuery, { bidManagerId, auctionId });

        if (checkResult.rows.length === 0) {
            // Invitation not found or not in 'pending' status
            connection.close();
            return res.status(400).json({ error: 'Invalid invitation or invitation is not pending' });
        }

        // Delete the invitation
        const deleteInvitationQuery = `
            DELETE FROM Assign_Notifications_For_BidManagers
            WHERE Bid_Manager_Id = :bidManagerId AND Auction_Id = :auctionId
        `;

        await connection.execute(deleteInvitationQuery, { bidManagerId, auctionId });

        connection.commit();
        connection.close();

        res.json({ message: 'Invitation undone successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});



app.listen(9002, async () => {
    try {
        const connection = await oracledb.getConnection(dbConfig);
        ////console.log('DB connected');
        connection.close();
    } catch (error) {
        ////console.log('Error while establishing connection');
        console.error(error);
    }

    ////console.log('Server started on port 9002');
});
