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
    
    return amqp.connect('amqp://rabbit:rabbitpass@rabbitmq').then((connection) => {
        
        const closeConnection = () => {
            channel = null;
            closeConnection = null;
            setTimeout(() => {
                connection.close(); 
            }, 500);
        }

        console.log('Connection created');
        return Promise.all([
            connection.createChannel(),
            Promise.resolve(closeConnection)
        ]);
    }).then((connection) => {
        channel = connection[0];
        closeConnection = connection[1];
        return Promise.resolve(connection);
    });
}

const processMessages = (responseHandler) => {
    establishRabbitConnection().then((connection) => {

        [channel, closeConnection] = connection;
    
        const queue = 'balances';

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
    }).catch((err) => {
        console.log('Rabbitmq messaging error!!!');
        process.exit(1);
    });
}

module.exports = processMessages;