const amqp = require('amqplib/callback_api');
const uuid = require('uuid/v4');

const sendRabbitMessage = (theQueue, data, callback) => {
    amqp.connect('amqp://localhost', (err, connection) => {

        const sendResult = (err, data) => {
            callback(err, data);
                        
            setTimeout(() => { 
                connection.close(); 
            }, 500);
        }
    
        if (err) {
            console.error('amqp connection error:');
            throw err;
        }

        connection.createChannel((err, channel) => {
            
            if (err) {
                console.error('amqp create channel error:', err);
                return sendResult(err, null);
            }

            channel.assertQueue('', {
                exclusive: true
            }, (err, q) => {
                
                if (err) {
                    console.error('amqp channel error:', err);
                    return sendResult(err, null);
                }
                
                const correlationId = uuid();
            
                channel.consume(q.queue, (msg) => {
                    
                    if (msg.properties.correlationId == correlationId) {

                        const data = JSON.parse(msg.content);
                        return sendResult(null, data);
                    }
                }, {
                    noAck: true
                });
        
                channel.sendToQueue(theQueue,
                    Buffer.from(JSON.stringify(data)), { 
                        correlationId: correlationId, 
                        replyTo: q.queue
                    });
            });
        });
    });
}

module.exports = sendRabbitMessage;