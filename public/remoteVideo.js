const localVideo = document.getElementById('local');
const remoteVideo = document.getElementById('remote');
const callButton = document.getElementById('call')
const sendButton = document.getElementById('send')

const localConnection = new RTCPeerConnection(null);
const socket = io.connect('https://' + window.location.host);

navigator.getUserMedia({
    video: true
}, (stream) => {
    localVideo.srcObject = stream;

    localConnection.addStream(stream);
    localConnection.onaddstream = (e) => {
        remoteVideo.srcObject = e.stream;
    }

    localConnection.onicecandidate = (e) => {
        if (e.candidate) {
            sendTo(socket, 'candidate', e.candidate)
        }
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
}, (e) => {
    console.log(e);
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