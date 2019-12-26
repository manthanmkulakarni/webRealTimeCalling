// Generate random room name if needed
if (!location.hash) {
  location.hash = '';
}
document.write(location.hash)
const roomHash = location.hash.substring(1);
document.write(roomHash)
// TODO: Replace with your own channel ID
const drone = new ScaleDrone('2xmbUiTsqTzukyf7');
// Room name needs to be prefixed with 'observable-'
const roomName = 'observable-' + roomHash;
document.write(roomName)
const configuration = {
  iceServers: [{
    urls: 'stun:stun.l.google.com:19302'
  }]
};
let room;
let pc;
  
  
function onSuccess() {};
function onError(error) {
  console.error(error);
};
  
drone.on('open', error => {
  if (error) {
    return console.error(error);
  }
  room = drone.subscribe(roomName);
  room.on('open', error => {
    if (error) {
      onError(error);
    }
  });
  // We're connected to the room and received an array of 'members'
  // connected to the room (including us). Signaling server is ready.
  room.on('members', members => {
    console.log('MEMBERS', members);
    // If we are the second user to connect to the room we will be creating the offer
    const isOfferer = members.length === 2;
    startWebRTC(isOfferer);
  });
});
  
// Send signaling data via Scaledrone
function sendMessage(message) {
  import streamSaver from 'StreamSaver'
    const streamSaver = require('StreamSaver')
    const streamSaver = window.streamSaver

    const fileStream = streamSaver.createWriteStream('filename.txt', {
      size: 22, // (optional) Will show progress
      writableStrategy: message, // (optional)
      readableStrategy: undefined  // (optional)
    })
   
    new Response('StreamSaver is awesome').body
      .pipeTo(fileStream)
      .then(success, error)



  drone.publish({
    room: roomName,
    message
  });
}
  
function startWebRTC(isOfferer) {
  pc = new RTCPeerConnection(configuration);
  
  // 'onicecandidate' notifies us whenever an ICE agent needs to deliver a
  // message to the other peer through the signaling server
  pc.onicecandidate = event => {
    if (event.candidate) {
      sendMessage({'candidate': event.candidate});
    }
  };
  
  // If user is offerer let the 'negotiationneeded' event create the offer
  if (isOfferer) {
    pc.onnegotiationneeded = () => {
      pc.createOffer().then(localDescCreated).catch(onError);
    }
  }
  
  // When a remote stream arrives display it in the #remoteVideo element
  pc.onaddstream = event => {
    remoteVideo.srcObject = event.stream;
  };
  
  navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true,
  }).then(stream => {
    // Display your local video in #localVideo element
    localVideo.srcObject = stream;
    // Add your stream to be sent to the conneting peer
    pc.addStream(stream);
  }, onError);
  
  // Listen to signaling data from Scaledrone
  room.on('data', (message, client) => {
    // Message was sent by us
    if (client.id === drone.clientId) {
      return;
    }
  
    if (message.sdp) {
      // This is called after receiving an offer or answer from another peer
      pc.setRemoteDescription(new RTCSessionDescription(message.sdp), () => {
        // When receiving an offer lets answer it
        if (pc.remoteDescription.type === 'offer') {
          pc.createAnswer().then(localDescCreated).catch(onError);
        }
      }, onError);
    } else if (message.candidate) {
      // Add the new ICE candidate to our connections remote description
      pc.addIceCandidate(
        new RTCIceCandidate(message.candidate), onSuccess, onError
      );
    }
  });
}
  
function localDescCreated(desc) {
  pc.setLocalDescription(
    desc,
    () => sendMessage({'sdp': pc.localDescription}),
    onError
  );
}