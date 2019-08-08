const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const logger = require('./middleware/logger');
const tokenCheck = require('./middleware/tokenchecker');

const sendRabbitMessage = require('./logic/rabbitmq');

const config = require('./config');

// Init the App

const app = express();

// Init the middleware

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(logger);

// Set routes

app.get('/balance', tokenCheck, (req, res) => {
    
    handleBalanceRequest(res, {
        userId: req.body.userId
    });
});

app.post('/charge', tokenCheck, (req, res) => {

    handleTransaction(res, {
        type: 'charge',
        userId: req.body.userId,
        amount: req.body.amount
    });
});

app.post('/deposit', tokenCheck, (req, res) => {

    handleTransaction(res, {
        type: 'deposit',
        userId: req.body.userId,
        amount: req.body.amount
    });
});

app.post('/authenticate', (req, res) => {
    
    const username = req.body.username;
    const password = req.body.password;

    if (username && password) {

        if (username in config.mockedUsers && 
            password === config.mockedUsers[username]) {

            const token = jwt.sign({username}, config.secret, { expiresIn: '24h'});
            
            return res.send({
                success: true,
                message: 'Authentication successful',
                data: { 
                    token
                }
            }); 
        } else {

            return res.send({
                success: false,
                message: 'Not valid username or password'
            });
        }
    } else {

        return res.send({
            success: false,
            message: 'Missing username or password'
        });
    }
});

// Create request handlers

const handleBalanceRequest = (response, balanceRequest) => {
    
    sendRabbitMessage('balances', balanceRequest, (err, rabbitResponse) => {
        
        if (err) {
            console.error(err);
        }

        if (!rabbitResponse.success) {
            return response.send({
                success: false,
                message: rabbitResponse.message
            });
        }

        response.send({
            success: true,
            message: 'Balance checked',
            data: rabbitResponse.data
        });
    });
}

const handleTransaction = (response, transactionRequst) => {
    
    sendRabbitMessage('transactions', transactionRequst, (err, rabbitResponse) => {
        
        if (err) {
            console.error(err);
        }

        if (!rabbitResponse.success) {
            return response.send({
                success: false,
                message: rabbitResponse.message,
                data: rabbitResponse.data
            });
        }

        response.send({
            success: true,
            message: 'Operation successful',
            data: rabbitResponse.data
        });
    });
}

// Start the server

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`An API service is listening on port ${port}`);
});