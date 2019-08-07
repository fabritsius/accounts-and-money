const processMessages = require('./logic/rabbitmq');

processMessages(async (msg) => {
    return {
        balance:  100,
        lastUpdated: 'never'
    }
});