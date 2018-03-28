navigator.mediaDevices.enumerateDevices()
    .then(devices => {
        const videoDevices = [0, 0];
        let videoDeviceIndex = 0;
        devices.forEach(function (device) {
            console.log(device.kind + ": " + device.label +
                " id = " + device.deviceId);
            if (device.kind == "videoinput") {
                videoDevices[videoDeviceIndex++] = device.deviceId;
            }
        });

        console.log(videoDevices)
    });

const localVideo = document.getElementById('local');
const remoteVideo = document.getElementById('remote');
const callButton = document.getElementById('call')
const sendButton = document.getElementById('send')

const localConnection = new RTCPeerConnection(null);
const socket = io.connect('https://' + window.location.host);

navigator.getUserMedia({
    video: {
        deviceId: {
            exact: '6c8bc5d97435cc5edb2527029c7db52051fb92930c799c3070696b2724c74026'
        }
    }
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