const express = require('express');
const bodyParser = require('body-parser');

const logger = require('./middleware/logger');

// Init the App

const app = express();

// Init the middleware

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(logger);

// Set routes

app.get('/balance', (req, res) => {
    return res.send({
        success: true,
        message: 'Balance checked',
        data: {
            balance:  0,
            lastUpdated: 'never'
        }
    });
});

app.post('/charge', (req, res) => {
    return res.send({
        success: true,
        message: 'Charge successful',
        data: {
            balance:  0,
            lastUpdated: 'now'
        }
    });
});

app.post('/deposit', (req, res) => {
    return res.send({
        success: true,
        message: 'Deposit successful',
        data: {
            balance:  0,
            lastUpdated: 'now'
        }
    });
});

app.post('/authenticate', (req, res) => {
    return res.send({
        success: true,
        message: 'Authentication successful',
        data: {
            token: "GciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
        }
    });
});

// Start the server

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`An API service is listening on port ${port}`);
});