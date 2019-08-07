const amqp = require('amqplib/callback_api');

const processMessages = (responseHandler) => {

    amqp.connect('amqp://localhost', (err, connection) => {
    
        if (err) {
            console.error('amqp connection error:');
            throw err;
        }
    
        connection.createChannel((err, channel) => {
            
            if (err) {
                console.error('amqp create channel error:', err);
                return;
            }
            
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
    });

}

module.exports = processMessages;