# Live Streaming Website

A website where an admin can live stream to over 25,000 viewers. The admin streams via WebRTC with Firebase signaling, and viewers watch via HLS.

## Repository Structure

- `client/`: Client-side files (HTML, JS)
- `server/`: Server-side files (Node.js)

## Prerequisites

- Node.js and npm installed
- Firebase project with Realtime Database enabled
- A server capable of transcoding WebRTC to HLS (e.g., OvenMediaEngine) for production

## Setup

### 1. Firebase Configuration
- Create a Firebase project at [Firebase Console](https://console.firebase.google.com/).
- Enable Realtime Database.
- Download your service account key JSON and place it in `server/` as `serviceAccountKey.json`.
- The Firebase config is already in `client/app.js`.

### 2. Server Setup
- Navigate to the server directory:
  ```bash
  cd server
