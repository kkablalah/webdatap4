const express = require("express");
//npm install mysql2 --save
const mysql = require("mysql2");
//npm install cors --save
const cors = require("cors");

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

//Host, user, password database
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "1mTURNT!",
    database: "chinook"
});

connection.connect();

app.get('/data', (req, res) => {
    connection.query('SELECT * FROM yourTable', (error, results) => {
        if (error) throw error;
        res.json(results);
    });
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
