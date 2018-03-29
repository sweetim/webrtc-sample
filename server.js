const express = require('express');
const fs = require('fs');

const app = express();

const options = {
    key: fs.readFileSync('./cert/server.key'),
    cert: fs.readFileSync('./cert/server.cert')
};

const https = require('https');
const http = require('http')
const httpsServer = https.createServer(options, app)
const httpServer = http.createServer(app)

const io = require('socket.io')();

app.use(express.static('public'));

httpsServer.listen(3000, () => {
    console.log('https server started in port 3000');
});

httpServer.listen(3001, () => {
    console.log('http server started in port 3001');
});

io.attach(httpServer)
io.attach(httpsServer)

io.on('connection', (socket) => {
    socket.on('data', (data) => {
        console.log(data);
        socket.broadcast.emit('data', data);
    });
});
