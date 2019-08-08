const processMessages = require('./logic/rabbitmq');
const db = require('./logic/dbcreator');

processMessages(async (msg) => {

    try {
        if (!msg.userId) {
            return {
                success: false,
                message: 'Add userId number to your request'
            }
        }

        const account = await getUserBalance(msg.userId);

        if (account) {
            return {
                success: true,
                data: {
                    balance:  account.balance,
                    lastUpdated: account.lastUpdated
                }
            }
        } else {
            return {
                success: false,
                message: 'Can\'t find a balance of a user with a gived userId'
            }
        }
    } catch(err) {
        console.log('Messaging error:');
        throw err;
    }
});

const getUserBalance = (userId) => {
    return db.from('users')
            .join('accounts', 'users.id', '=', 'accounts.userId')
            .select('balance', 'lastUpdated')
            .where('users.id', '=', userId)
            .first()
        .then((firstMatch) => {
            return firstMatch;
        }).catch((err) => {
            return null;
        });
}