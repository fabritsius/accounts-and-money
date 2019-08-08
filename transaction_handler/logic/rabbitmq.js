const amqp = require('amqplib');

let channel;
let closeConnection;

const establishRabbitConnection = () => {
    
    if (channel) {
        return Promise.all([
            Promise.resolve(channel),
            Promise.resolve(closeConnection)
        ]);
    }
    
    return amqp.connect('amqp://localhost').then((connection) => {
        
        const closeConnection = () => {
            channel = null;
            setTimeout(() => {
                connection.close(); 
            }, 500);
        }

        console.log('Connection created');
        return Promise.all([
            connection.createChannel(),
            Promise.resolve(closeConnection)
        ]);
    });
}

const processMessages = (responseHandler) => {
    establishRabbitConnection().then((connection) => {

        [channel, closeConnection] = connection;
    
        const queue = 'transactions';

        channel.assertQueue(queue, {
            durable: false
        });

        channel.prefetch(1);
        
        console.log('Awaiting RPC requests');
        channel.consume(queue, (msg) => {
        
            const data = JSON.parse(msg.content);
            console.log('Recieved:', data);

            responseHandler(data).then((response) => {
                channel.sendToQueue(msg.properties.replyTo,
                    Buffer.from(JSON.stringify(response)), {
                        correlationId: msg.properties.correlationId
                    });
    
                channel.ack(msg);
            }); 
        });
    });
}

module.exports = processMessages;