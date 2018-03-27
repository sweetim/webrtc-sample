const express = require('express');
const fs = require('fs');

const app = express();

const options = {
    key: fs.readFileSync('./cert/server.key'),
    cert: fs.readFileSync('./cert/server.cert')
};

const https = require('https');
const server = https.createServer(options, app)
const io = require('socket.io')(server);

app.use(express.static('public'));

server.listen(3000, () => {
    console.log('server started');
});

io.on('connection', (socket) => {
    socket.on('data', (data) => {
        socket.broadcast.emit('data', data);
    });
});
