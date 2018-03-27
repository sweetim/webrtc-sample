const localVideo = document.getElementById('local');
const remoteVideo = document.getElementById('remote');
const sendButton = document.getElementById('send');

const localConnection = new RTCPeerConnection(null);
const remoteConnection = new RTCPeerConnection(null);

remoteConnection.onaddstream = (e) => {
    remoteVideo.srcObject = e.stream;
}

localConnection.onicecandidate = (e) => {
    if (e.candidate) {
        remoteConnection.addIceCandidate(new RTCIceCandidate(e.candidate));
    }
}

const sendLocalChannel = localConnection.createDataChannel('HELLO', {
    reliabe: false
})

sendLocalChannel.onopen = (ev) => {
    sendLocalChannel.send('hello')
}

sendLocalChannel.onmessage = (ev) => {
    console.log(ev.data)
}

remoteConnection.ondatachannel = (ev) => {
    const channel = ev.channel;
﻿  channel.onopen = (ev) => {
        channel.send('Hi back!');
    }
    channel.onmessage = (ev) => {
        console.log(ev.data);
    }
}

remoteConnection.onicecandidate = (ev) => {
    if (ev.candidate) {
        localConnection.addIceCandidate(new RTCIceCandidate(ev.candidate));
    }
}

localConnection.createOffer().then((offer) => {
    localConnection.setLocalDescription(offer);
    remoteConnection.setRemoteDescription(offer);

    remoteConnection.createAnswer().then((offer) => {
        localConnection.setRemoteDescription(offer)
        remoteConnection.setLocalDescription(offer)
    })
})

sendButton.onclick = () => {
    sendLocalChannel.send(JSON.stringify({
        time: Date.now(),
        text: 'hello!'
    }))
}