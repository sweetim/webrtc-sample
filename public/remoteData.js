const localVideo = document.getElementById('local');
const remoteVideo = document.getElementById('remote');
const callButton = document.getElementById('call')
const sendButton = document.getElementById('send')

const localConnection = new RTCPeerConnection(null);
const socket = io.connect('https://' + window.location.host);

const dataChannel = localConnection.createDataChannel('hello', {
    reliable: true
})

localConnection.onaddstream = (ev) => {
    remoteVideo.srcObject = ev.stream;
}

localConnection.onicecandidate = (ev) => {
    if (ev.candidate) {
        sendTo(socket, 'candidate', ev.candidate)
    }
}

localConnection.ondatachannel = (ev) => {
    const channel = ev.channel;
﻿  channel.onopen = function(event) {
        channel.send('Hi back!');
    }
    channel.onmessage = function(event) {
        console.log(event.data);
    }
}

dataChannel.onopen = (ev) => {
    dataChannel.send('hello')
}

dataChannel.onmessage = (ev) => {
    console.log(ev.data)
}

socket.on('data', (data) => {
    const type = data.type;
    const payload = data.payload;

    switch (type) {
        case 'candidate':
            localConnection.addIceCandidate(new RTCIceCandidate(payload))
            break;
        case 'offer':
            localConnection.setRemoteDescription(payload);
            localConnection.createAnswer().then((offer) => {
                localConnection.setLocalDescription(offer)
                sendTo(socket, 'answer', offer);
            });
            break;
        case 'answer':
            localConnection.setRemoteDescription(payload);
            break;
    }
});

function sendTo(socket, type, payload) {
    socket.emit('data', {
        type,
        payload
    })
}

callButton.onclick = () => {
    localConnection.createOffer().then((offer) => {
        localConnection.setLocalDescription(offer);
        sendTo(socket, 'offer', offer);
    })
}

sendButton.onclick = () => {
    dataChannel.send(JSON.stringify({
        tine: Date.now(),
        text: 'hello world!'
    }))
}