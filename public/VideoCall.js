// Show popup
function openVideoPopup() {
  document.getElementById("videoCallPopup").style.display = "block";
  startVideoCall();
}
//console.log("User ID:", localStorage.getItem('chatWithId')); // Log the userId to the console
// Hide popup
function hideVideoCallPopup() {
  document.getElementById("videoCallPopup").style.display = "none";
}

// Close on "End Call" button
document.getElementById("endCallBtn").addEventListener("click", () => {
  endCall();
});

let localStream;
let remoteStream = new MediaStream();
let peerConnection;
let iceCandidateQueue = [];

const servers = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

function startVideoCall() {
  navigator.mediaDevices
    .getUserMedia({ video: true, audio: true })
    .then((stream) => {
      localStream = stream;
      document.getElementById("localVideo").srcObject = stream;
      console.log("🎞️ Remote stream tracks:1", remoteStream.getTracks());

      peerConnection = new RTCPeerConnection(servers);

      // Add local tracks
      localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
      });

      // Handle remote track
      peerConnection.ontrack = (event) => {
        console.log("📹 Remote track received:", event.track.kind);
        remoteStream.addTrack(event.track); // ✅ Add each track
        remoteVideo.srcObject = remoteStream; // ✅ Assign collected stream
      };

      console.log("🎞️ Remote stream tracks:4", remoteStream.getTracks());

      handleIceCandidate(receiverId, senderId);
      // Handle ICE candidates
      //   peerConnection.onicecandidate = (event) => {
      //     if (event.candidate) {
      //       socket.emit("candidate", {
      //         to: receiverId,
      //         from: senderId, // ✅ ADD THIS LINE
      //         candidate: event.candidate,
      //       });
      //     }
      //   };

      // Create and send offer
      peerConnection
        .createOffer()
        .then((offer) => peerConnection.setLocalDescription(offer))
        .then(() => {
          socket.emit("offer", {
            to: receiverId,
            from: senderId,
            offer: peerConnection.localDescription,
          });
          console.log("Sending offer to:1", receiverId);
          console.log("Sending send offer to:1", senderId);
        });
    })
    .catch((error) => {
      console.error("Error accessing camera/mic:", error);
    });
}

const remoteVideo = document.getElementById("remoteVideo");
console.log("Remote video element:", remoteVideo);
remoteVideo.onloadedmetadata = () => {
  console.log("Remote video is playing 🎥");
};

socket.on("offer", async ({ to, from, offer }) => {
  console.log("📞 Incoming offer from:", offer, from, "to", to);

  // ✅ Only request media if it's not already available
  if (!localStream) {
    try {
      localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      document.getElementById("localVideo").srcObject = localStream;
    } catch (err) {
      console.error("🚫 Error accessing media devices:", err);
      return;
    }
  }

  peerConnection = new RTCPeerConnection(servers);

  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream);
  });

  peerConnection.ontrack = (event) => {
    console.log("📹 Remote track received:", event.track.kind);
    remoteStream.addTrack(event.track); // ✅ Add each track
    remoteVideo.srcObject = remoteStream; // ✅ Assign collected stream
  };

  console.log("🎞️ Remote stream tracks:2", remoteStream.getTracks());
  handleIceCandidate(from);

  await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);

  console.log("📤 Sending answer to:", from);

  socket.emit("answer", {
    answer,
    to: from,
    from: to,
  });

  // Add any queued ICE candidates
  for (const candidate of iceCandidateQueue) {
    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  }
  iceCandidateQueue = [];
});

socket.on("answer", async ({ from, answer }) => {
  console.log("✅ Received answer from:", from);
  await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));

  for (const candidate of iceCandidateQueue) {
    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  }
  iceCandidateQueue = [];
});

// Handle candidate
socket.on("candidate", async ({ from, candidate }) => {
  console.log("❄️ ICE candidate received from:", from);
  if (peerConnection?.remoteDescription) {
    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  } else {
    iceCandidateQueue.push(candidate);
  }
});

function handleIceCandidate(toId, fromId = null) {
  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      const candidateData = {
        to: toId,
        candidate: event.candidate,
      };
      if (fromId) candidateData.from = fromId;

      socket.emit("candidate", candidateData);
    }
  };
}

function endCall() {
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }

  if (localStream) {
    localStream.getTracks().forEach((track) => track.stop());
    localStream = null;
  }

  remoteVideo.srcObject = null;
  localVideo.srcObject = null;
  
  hideVideoCallPopup();
}
