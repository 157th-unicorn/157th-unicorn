// Firebase configuration provided in the query
const firebaseConfig = {
  apiKey: "AIzaSyBsEASvMueaIesMW84YzR613m3anIqJH-E",
  authDomain: "th-unicorn.firebaseapp.com",
  projectId: "th-unicorn",
  storageBucket: "th-unicorn.firebasestorage.app",
  messagingSenderId: "35029193312",
  appId: "1:35029193312:web:21545292dc4f4817fee905",
  measurementId: "G-NRNGYS843T"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// DOM elements
const adminBtn = document.getElementById('adminBtn');
const viewerBtn = document.getElementById('viewerBtn');
const choiceDiv = document.getElementById('choice');
const adminInterface = document.getElementById('adminInterface');
const viewerInterface = document.getElementById('viewerInterface');

// Handle Admin button click
adminBtn.addEventListener('click', () => {
    choiceDiv.style.display = 'none';
    adminInterface.style.display = 'block';
    initAdmin();
});

// Handle Viewer button click
viewerBtn.addEventListener('click', () => {
    choiceDiv.style.display = 'none';
    viewerInterface.style.display = 'block';
    initViewer();
});

// Admin initialization function
async function initAdmin() {
    const adminVideo = document.getElementById('adminVideo');
    const startStreamBtn = document.getElementById('startStreamBtn');

    // Get camera and microphone access
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    adminVideo.srcObject = stream;

    startStreamBtn.addEventListener('click', async () => {
        // Create WebRTC peer connection
        const pc = new RTCPeerConnection();

        // Add local stream tracks to the peer connection
        stream.getTracks().forEach(track => pc.addTrack(track, stream));

        // Create and set local offer
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        // Send offer to Firebase
        const roomRef = database.ref('rooms/room1/admin');
        await roomRef.child('offer').set({
            sdp: offer.sdp,
            type: offer.type
        });

        // Listen for answer from server
        roomRef.child('answer').on('value', snapshot => {
            const answer = snapshot.val();
            if (answer) {
                pc.setRemoteDescription(new RTCSessionDescription(answer));
            }
        });

        // Send ICE candidates to Firebase
        pc.onicecandidate = event => {
            if (event.candidate) {
                roomRef.child('candidates').push().set(event.candidate.toJSON());
            }
        };

        // Receive server's ICE candidates
        roomRef.child('sfuCandidates').on('child_added', snapshot => {
            const candidate = snapshot.val();
            pc.addIceCandidate(new RTCIceCandidate(candidate));
        });
    });
}

// Viewer initialization function
async function initViewer() {
    const viewerVideo = document.getElementById('viewerVideo');
    
    // Use HLS.js for browsers that support it
    if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource('http://localhost:3000/stream.m3u8'); // Replace with your server URL
        hls.attachMedia(viewerVideo);
    } 
    // Fallback for native HLS support (e.g., Safari)
    else if (viewerVideo.canPlayType('application/vnd.apple.mpegurl')) {
        viewerVideo.src = 'http://localhost:3000/stream.m3u8'; // Replace with your server URL
    }
}
