const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://ott_user:ott_password@127.0.0.1:5433/ott_cms',
});

console.log('Connecting...');
client.connect()
    .then(() => {
        console.log('Connected successfully!');
        return client.query('SELECT version()');
    })
    .then(res => {
        console.log(res.rows[0]);
        return client.end();
    })
    .catch(err => {
        console.error('Connection error', err);
        process.exit(1);
    });
