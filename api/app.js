const express = require('express');
const bodyParser = require('body-parser');

const logger = require('./middleware/logger');
const sendRabbitMessage = require('./logic/rabbitmq');

// Init the App

const app = express();

// Init the middleware

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(logger);

// Set routes

app.get('/balance', (req, res) => {
    
    handleBalanceRequest(res, {
        userId: req.body.userId
    });
});

app.post('/charge', (req, res) => {

    handleTransaction(res, {
        type: 'charge',
        account: req.body.account,
        amount: req.body.amount
    });
});

app.post('/deposit', (req, res) => {

    handleTransaction(res, {
        type: 'deposit',
        account: req.body.account,
        amount: req.body.amount
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
    
    sendRabbitMessage('transactions', transactionRequst, (err, updatedBalance) => {
        
        if (err) {
            console.error(err);
        }

        response.send({
            success: true,
            message: 'Operation successful',
            data: updatedBalance
        });
    });
}

// Start the server

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`An API service is listening on port ${port}`);
});