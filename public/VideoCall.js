let localStream = null;
let remoteStream = new MediaStream();
let peerConnection;
let iceCandidateQueue = [];

let remoteVideo = document.getElementById("remoteVideo");
const localVideo = document.getElementById("localVideo");
// const servers = {
//   iceServers: [
//     { urls: "stun:stun.l.google.com:19302" },
//     { urls: "stun:stun.services.mozilla.org" },
//     // Add a TURN server here if possible (e.g., from Xirsys or Coturn)
//   ],
// };

const servers = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    // Add a free TURN server for testing (or deploy your own with Coturn)
    {
      urls: "turn:openrelay.metered.ca:80",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
  ],
};

function openVideoPopup() {
  document.getElementById("videoCallPopup").style.display = "block";
  setTimeout(() => {
    startVideoCall();
  }, 200); // Wait a bit to make sure all teardown is done
}

function hideVideoCallPopup() {
  document.getElementById("videoCallPopup").style.display = "none";
}

document.getElementById("endCallBtn").addEventListener("click", endCall);

function setupOnTrackHandler() {
  peerConnection.ontrack = (event) => {
    console.log("🎬 Remote track received:", event.track.kind);

    // Directly assign the stream to the video element
    remoteVideo.srcObject = event.streams[0];

    // Check if video tracks are present
    const videoTracks = event.streams[0].getVideoTracks();
    console.log("Video tracks in remote stream:", videoTracks);

    // Force-play with muted audio to bypass autoplay
    remoteVideo.muted = true; // Mute initially to allow autoplay
    // remoteVideo.play().catch((err) => {
    //   console.error("🚫 Remote video play() failed:", err);
    // });

    // Unmute audio on user click
    document.addEventListener(
      "click",
      () => {
        remoteVideo.muted = false;
      },
      { once: true }
    );
  };
}

function startVideoCall() {
  navigator.mediaDevices
    .getUserMedia({ video: true, audio: true })
    .then((stream) => {
      localStream = stream;
      localVideo.srcObject = stream;

      peerConnection = new RTCPeerConnection(servers);

      localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
      });

      setupOnTrackHandler();
      handleIceCandidate(receiverId, senderId);

      peerConnection
        .createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        })
        .then((offer) => peerConnection.setLocalDescription(offer))
        .then(() => {
          socket.emit("offer", {
            to: receiverId,
            from: senderId,
            offer: peerConnection.localDescription,
          });
        });
    })
    .catch((error) => {
      console.error("🚫 Error accessing camera/mic:", error);
    });
}

// Handle incoming offer
socket.on("offer", async ({ to, from, offer }) => {
  if (!localStream) {
    try {
      localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localVideo.srcObject = localStream;
    } catch (err) {
      console.error("🚫 Media access error:", err);
      return;
    }
  }

  peerConnection = new RTCPeerConnection(servers);

  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream);
  });

  setupOnTrackHandler();
  handleIceCandidate(from, to);

  await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);

  socket.emit("answer", {
    answer,
    to: from,
    from: to,
  });

  for (const candidate of iceCandidateQueue) {
    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  }
  iceCandidateQueue = [];
});

socket.on("answer", async ({ answer, to, from }) => {
  console.log("answer received", from, answer);
  await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
  for (const candidate of iceCandidateQueue) {
    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  }
  iceCandidateQueue = [];
});

function handleIceCandidate(toId, fromId) {
  // peerConnection.onicecandidate = (event) => {
  //   if (event.candidate) {
  //     if (!toId || !fromId) {
  //       console.warn("❌ Missing to/from in ICE candidate emit", {
  //         toId,
  //         fromId,
  //       });
  //       return;
  //     }
  //     socket.emit("candidate", {
  //       to: toId,
  //       from: fromId,
  //       candidate: event.candidate,
  //     });
  //   }
  // };

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      console.log("❄️ ICE Candidate:", event.candidate);
      socket.emit("candidate", {
        to: toId,
        from: fromId,
        candidate: event.candidate,
      });
    } else {
      console.log("✅ ICE Gathering Complete");
    }
  };
}

socket.on("candidate", async ({ from, candidate }) => {
  if (peerConnection?.remoteDescription) {
    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  } else {
    iceCandidateQueue.push(candidate);
  }
});


function endCall() {
  console.log("Ending call...");
  // Notify the other peer
  // socket.emit("callEnded", { to: receiverId, from: senderId });
  socket.emit("remoteCallEnded", { to: receiverId, from: senderId });

  // 1. Stop all local media tracks (camera & mic)
  if (localStream) {
    localStream.getTracks().forEach((track) => track.stop());
    localStream = null;
  }

  // 2. Clear local video stream
  if (localVideo.srcObject) {
    localVideo.srcObject.getTracks().forEach((track) => track.stop());
    localVideo.srcObject = null;
  }
  localVideo.pause();
  localVideo.removeAttribute("src");
  localVideo.removeAttribute("srcObject");
  localVideo.load();

  // 3. Clear remote video stream
  if (remoteVideo.srcObject) {
    remoteVideo.srcObject.getTracks().forEach((track) => track.stop());
    remoteVideo.srcObject = null;
  }
  remoteVideo.pause();
  remoteVideo.removeAttribute("src");
  remoteVideo.removeAttribute("srcObject");
  remoteVideo.load();

  // 4. Close peer connection
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }

  // 5. Clear ICE candidates
  iceCandidateQueue = [];

  // 6. Hide video call UI
  hideVideoCallPopup();

  console.log("✅ Call fully ended and video elements cleared.");
}


