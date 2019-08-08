const amqp = require('amqplib');
const uuid = require('uuid/v4');

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

const sendRabbitMessage = (theQueue, data, callback) => {
    establishRabbitConnection().then((connection) => {

        [channel, closeConnection] = connection;

        channel.assertQueue('', { exclusive: true }).then((q) => {
            
            const correlationId = uuid();
        
            channel.consume(q.queue, (msg) => {
                
                if (msg.properties.correlationId == correlationId) {
                    const data = JSON.parse(msg.content);
                    return callback(null, data);
                }
            }, {
                noAck: true
            });
            
            channel.sendToQueue(theQueue,
                Buffer.from(JSON.stringify(data)), { 
                    correlationId: correlationId, 
                    replyTo: q.queue
                });
        }).catch((err) => {
            console.error('amqp channel error:', err);
            return closeConnection();
        });
    }).catch((err) => {
        console.log('Rabbitmq connection error:');
        throw err;
    });
}

module.exports = sendRabbitMessage;