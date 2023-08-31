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
            console.log(userInfo);
            if (userInfo) {
                // console.log("I am here");
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

// Function to create a new auction in the database
app.post("/createAuction", async (req, res) => {
    const { name, type, adminId } = req.body;

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
        const auctionCount = verifyResult.rows[0].AUCTION_COUNT;
        if (auctionCount > 0) {
            console.log('Auction already exists');
            return false;
        }
        
        //generate id
        const countQuery = `SELECT COUNT(*) AS record_count FROM Auction_Details`;
        const countResult = await connection.execute(countQuery);
        const recordCount = countResult.rows[0].RECORD_COUNT;
        const generatedId = (recordCount + 1).toString().padStart(3, '0');
        
        const insertQuery = `INSERT INTO Auction_Details (ID, Name, Type, Admin_Id) VALUES (:id, :name, :type, :adminId)`;
        const bindVars = {
            id: generatedId,
            name: name,
            type: type,
            adminId: adminId
        };
        console.log("Auction created");
        await connection.execute(insertQuery, bindVars);
        await connection.commit();
        connection.close();
        console.log(`Auction created with ID: ${generatedId}`);
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
        console.log(adminId);
        const auctionsResult = await connection.execute(auctionsQuery, { adminId });
        console.log(auctionsResult.rows);

        connection.close();

        return auctionsResult.rows;
    } catch (error) {
        console.error(error);
        return [];
    }
}



app.post("/register", async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        const result = await registerUser(name, password, email, role);

        if (result) {
            res.json({ message: 'Registration successful' });
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
    console.log(req.params.id)
    const auctionId = req.params.id;
    try {
        const connection = await oracledb.getConnection(dbConfig);
      // Check if the auction exists
      console.log(auctionId);
      const auctionExistsQuery = `SELECT COUNT(*) AS auction_count FROM Auction_Details WHERE Id = :auctionId`;
      const auctionExistsResult = await connection.execute(auctionExistsQuery, { auctionId });
      const auctionCount = auctionExistsResult.rows[0].AUCTION_COUNT;
  
      if (auctionCount === 0) {
        return res.status(404).json({ message: 'Auction not found' });
      }
  
      // Delete the auction
      const deleteAuctionQuery = `DELETE FROM Auction_Details WHERE Id = :auctionId`;
      await connection.execute(deleteAuctionQuery, { auctionId });
      await connection.commit();
      // Respond with success
      res.json({ message: 'Auction deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred' });
    }
  });
  

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
            // console.log('User found');
            return true;
            // res.send({message: 'Login successful', user: user})
        }
        else {
            // console.log('Invalid credentials');
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

        console.log(userInfo);
        console.log("Iaaa");

        connection.close();
        return userInfo;
    } catch (error) {
        console.error(error);
        return null;
    }
}


// ...

async function registerUser(name, password, email, role) {
    try {
        let tableName = '';
        let additionalData = {};

        console.log(role);

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
                additionalData.Taken_Player = 0; // Set your default value here
                additionalData.Total_Player = 0; // Set your default value here
                additionalData.Available_Fund = 0.0; // Set your default value here
                additionalData.Total_Fund = 0.0; // Set your default value here

                break;
            case 'player':
                tableName = 'Player';
                // Additional data for the Player table
                additionalData.Base_Price = 0.0; // Set your default value here
                additionalData.Category = ''; // Set your default value here
                additionalData.Photo = ''; // Set your default value here
                additionalData.Status = ''; // Set your default value here
                additionalData.Playing_Role = ''; // Set your default value here
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
            console.log('User already exists');

            return false;
        }

        console.log("IN");
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
        console.log('User registered');
        await connection.execute(insertQuery, bindVars);
        //commit the transaction
        await connection.commit();

        connection.close();

        console.log(`User registered with ID: ${generatedId}`);

        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}

// ...

app.listen(9002, async () => {
    try {
        const connection = await oracledb.getConnection(dbConfig);
        console.log('DB connected');
        connection.close();
    } catch (error) {
        console.log('Error while establishing connection');
        console.error(error);
    }

    console.log('Server started on port 9002');
});
