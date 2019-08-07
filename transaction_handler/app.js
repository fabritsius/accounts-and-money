const processMessages = require('./logic/rabbitmq');
const db = require('./logic/dbcreator');

processMessages(async (msg) => {

    let operation;

    if (msg.type === 'charge') {
        operation = await handleCharge(msg.userId, msg.amount);
    } else if (msg.type === 'deposit') {
        operation = await handleDeposit(msg.userId, msg.amount);
    } else {
        return {
            success: false,
            message: 'Unknown transaction operation'
        }
    }

    if (operation) {
        return operation;
    }

    return {
        success: false,
        message: 'Can\'t find the account with a given userId'
    }
});

const handleCharge = (userId, amount) => {
    return db.from('accounts')
        .where('userId', '=', userId)
        .where('balance', '>', amount)
        .returning('*')
        .update({
            balance: db.raw(`balance - ${amount}`),
            lastUpdated: db.fn.now(6)
        })
    .then((rows) => {
        if (rows.length === 1) {
            return {
                success: true,
                data: {
                    balance: rows[0].balance,
                    lastUpdated: rows[0].lastUpdated
                }
            };
        } else {
            return db.from('accounts')
                .select('balance', 'lastUpdated')
                .where('userId', '=', userId)
                .first()
            .then((firstMatch) => {
                return {
                    success: false,
                    message: 'Not enough money, no changes',
                    data: firstMatch
                }
            });
        }
    }).catch((err) => {
        return null;
    });
}

const handleDeposit = (userId, amount) => {
    return db.from('accounts')
        .where('userId', '=', userId)
        .returning('*')
        .update({
            balance: db.raw(`balance + ${amount}`),
            lastUpdated: db.fn.now(6)
        })
    .then((rows) => {
        return {
            success: true,
            data: {
                balance: rows[0].balance,
                lastUpdated: rows[0].lastUpdated
            }
        };
    }).catch((err) => {
        return null;
    });
}