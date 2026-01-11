const net = require('net');
const client = new net.Socket();

console.log('Attempting connection to 127.0.0.1:5433...');

client.connect(5433, '127.0.0.1', function () {
    console.log('Success: Connected to port 5433');
    client.destroy();
});

client.on('error', function (err) {
    console.error('Error: Connection failed: ' + err.message);
    console.error('Code: ' + err.code);
});

client.on('close', function () {
    console.log('Connection closed');
});
