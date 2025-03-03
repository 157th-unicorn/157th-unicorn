const express = require('express');
const app = express();
const wrtc = require('node-webrtc');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK (requires service account key)
admin.initializeApp({
  credential: admin.credential.cert('./serviceAccountKey.json'), // Download from Firebase Console
  databaseURL: "https://th-unicorn.firebaseio.com"
});
const db = admin.database();

// Create WebRTC peer connection
const pc = new wrtc.RTCPeerConnection();

// Listen for admin's offer
db.ref('rooms/room1/admin/offer').on('value', async snapshot => {
    const offer = snapshot.val();
    if (offer) {
        await pc.setRemoteDescription(new wrtc.RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await db.ref('rooms/room1/admin/answer').set({
            sdp: answer.sdp,
            type: answer.type
        });
    }
});

// Send ICE candidates to Firebase
pc.onicecandidate = event => {
    if (event.candidate) {
        db.ref('rooms/room1/admin/sfuCandidates').push().set(event.candidate.toJSON());
    }
};

// Receive admin's ICE candidates
db.ref('rooms/room1/admin/candidates').on('child_added', snapshot => {
    const candidate = snapshot.val();
    pc.addIceCandidate(new wrtc.RTCIceCandidate(candidate));
});

// Handle incoming stream
pc.ontrack = event => {
    const stream = event.streams[0];
    console.log('Received stream from admin');
    // TODO: Pipe this stream to FFmpeg or a media server to generate HLS
    // Example: ffmpeg -i - -c:v libx264 -c:a aac -f hls stream.m3u8
};

// Serve static files (e.g., HLS segments in production)
app.use(express.static('public'));

// Start server
app.listen(3000, () => {
    console.log('Server running on port 3000');
});
