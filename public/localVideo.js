const localVideo = document.getElementById('local');
const remoteVideo = document.getElementById('remote');


navigator.getUserMedia({
    video: true
}, (stream) => {
    localVideo.srcObject = stream;

    const localConnection = new RTCPeerConnection(null);
    const remoteConnection = new RTCPeerConnection(null);

    localConnection.addStream(stream);
    remoteConnection.onaddstream = (e) => {
        remoteVideo.srcObject = e.stream;
    }

    localConnection.onicecandidate = (e) => {
        if (e.candidate) {
            remoteConnection.addIceCandidate(new RTCIceCandidate(e.candidate));
        }
    }
    remoteConnection.onicecandidate = (e) => {
        if (e.candidate) {
            localConnection.addIceCandidate(new RTCIceCandidate(e.candidate));
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
    

}, (e) => {
    console.log(e);
});
