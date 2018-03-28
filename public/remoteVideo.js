const cameraInputSelect = document.getElementById('cameraInput')
const localVideo = document.getElementById('local');
const remoteVideo = document.getElementById('remote');
const startButton = document.getElementById('start')
const callButton = document.getElementById('call')
const sendButton = document.getElementById('send')

getCameraInputOptions().then((devices) => {
    devices.map((device) => {
        const opt = document.createElement('option');
        opt.value = device.deviceId;
        opt.innerHTML = device.label;

        return opt;
    }).forEach((opt) => cameraInputSelect.appendChild(opt))
});

const localConnection = new RTCPeerConnection(null);
const socket = io.connect('https://' + window.location.host);

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

startButton.onclick = () => {
    const cameraInputDeviceId = cameraInputSelect.options[cameraInputSelect.selectedIndex].value

    navigator.getUserMedia({
        video: {
            deviceId: {
                exact: cameraInputDeviceId
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
}

function getCameraInputOptions() {
    return new Promise((resolve, reject) => {
        navigator.mediaDevices.enumerateDevices()
            .then(devices => {
                const videoDevices = devices.filter((device) => {
                    return (device.kind === 'videoinput')
                });

                resolve(videoDevices);
            });
    })
}