const db = require('knex')({
    client: 'pg',
    connection: {
        host: 'db',
        user: 'postgres',
        password: 'mysecretpassword',
        database: 'postgres'
    }
});

const insertSomeData = true;

db.schema.hasTable('users').then((exists) => {
    if (!exists) {
        db.schema.createTable('users', (table) => {
            table.increments('id')
                .notNullable()
                .primary();
            table.string('name');
        }).then(() => {
            console.log('"Users" table is created');
        }).then(() => {
            if (insertSomeData) {
                db('users').insert([
                    { name: "Mike" },
                    { name: "Dustin" },
                    { name: "Lucas" },
                    { name: "Will" },
                    { name: "Jane" }
                ]).then(() => {
                    console.log('Inserted some users');
                });
            }
        }).catch((err) => { 
            console.error(err);
            throw err;
        });
    }
}).then(() => {
    db.schema.hasTable('accounts').then((exists) => {
        if (!exists) {
            db.schema.createTable('accounts', (table) => {
                table.increments('id')
                    .notNullable()
                    .primary();
                table.integer('userId')
                    .unsigned()
                    .notNullable()
                    .references('id')
                    .inTable('users');
                table.integer('balance');
                table.datetime('lastUpdated', { precision: 6 })
                    .defaultTo(db.fn.now(6));
            }).then(() => {
                console.log('"Accounts" table is created');
            }).then(() => {
                if (insertSomeData) {
                    db('accounts').insert([
                        { userId: 1, balance: 128 },
                        { userId: 2, balance: 96 },
                        { userId: 3, balance: 80 },
                        { userId: 4, balance: 60 },
                        { userId: 5, balance: 360 }
                    ]).then(() => {
                        console.log('Inserted some accounts');
                    });
                }
            }).catch((err) => { 
                console.error(err);
                throw err;
            });
        }
    }).catch((err) => { 
        console.error(err);
        throw err;
    });;
});

module.exports = db;