<div align="center">

# 🔥 DevTinder — Backend

### The Node.js + Express + MongoDB API powering DevTinder — a developer-focused networking platform.

[![Live API](https://img.shields.io/badge/🌐_Live_API-3.26.43.77/api-lime?style=for-the-badge)](http://3.26.43.77)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=nodedotjs)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4-000000?style=for-the-badge&logo=express)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/atlas)
[![Socket.io](https://img.shields.io/badge/Socket.io-4-010101?style=for-the-badge&logo=socketdotio)](https://socket.io)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens)](https://jwt.io)

</div>

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Live Demo](#-live-demo)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [API Reference](#-api-reference)
- [Socket.io Events](#-socketio-events)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment-ec2--nginx)
- [Security Highlights](#-security-highlights)
- [Frontend Repository](#-frontend-repository)
- [Future Improvements](#-future-improvements)

---

## 🧭 Overview

This is the backend for **DevTinder** — a MERN stack networking application for developers. It exposes a RESTful API built with Express.js, uses MongoDB Atlas for persistence via Mongoose, handles authentication with JWT stored in HTTP-only cookies, and powers real-time one-on-one chat via Socket.io.

The server is deployed on **AWS EC2** with Nginx acting as a reverse proxy, routing `/api/` traffic to the Node.js process managed by PM2.

---

## 🌐 Live Demo

> **Frontend:** [http://3.26.43.77](http://3.26.43.77)
> **API Base:** [http://3.26.43.77/api](http://3.26.43.77/api)

---

## ✨ Features

### 🔐 Authentication
- Signup with hashed passwords via **bcrypt** (10 salt rounds)
- Login with credential validation and JWT issuance
- Sessions stored in **HTTP-only cookies** — immune to XSS attacks
- Logout clears the cookie server-side
- JWT verified on every protected route via `userAuth` middleware

### 👤 Profile Management
- View logged-in user profile
- Edit profile fields (name, bio, age, gender, photo URL, skills)
- Secure password change with current password verification
- Input validation and sanitization on all profile updates

### 🃏 Developer Feed
- Smart feed algorithm — excludes yourself, existing connections, pending requests, and ignored profiles
- Paginated results to prevent overfetching

### 🤝 Connection Requests
- Send `interested` or `ignored` requests to other developers
- Review incoming requests — `accepted` or `rejected`
- Prevents duplicate or self-directed requests via validation

### 👥 User Data
- Fetch all accepted connections
- Fetch all pending received requests

### 💬 Real-Time Chat
- One-on-one messaging via **Socket.io**
- JWT authentication on every WebSocket handshake — `userId` always derived server-side from the verified token, never trusted from the client
- Private room isolation using **SHA-256 hashed room IDs** per user pair
- Connection eligibility check before any message is saved — only accepted connections can chat
- Messages persisted to MongoDB with sender reference, text, status, and timestamps
- Last 10 messages served via REST API on chat open

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20 |
| Framework | Express.js 4 |
| Database | MongoDB Atlas (Mongoose ODM) |
| Authentication | JWT (`jsonwebtoken`) + bcrypt |
| Real-Time | Socket.io 4 |
| Validation | validator.js |
| Cookie Parsing | cookie-parser |
| Cross-Origin | cors |
| Environment | dotenv |
| Process Manager | PM2 (production) |
| Reverse Proxy | Nginx (production) |

---

## 🏗 Architecture

```
Client (React SPA)
      │
      │  HTTP/HTTPS
      ▼
   Nginx (port 80)
      │
      ├── /api/*  ──────────────────► Node.js / Express (port 7777)
      │                                      │
      │                               ┌──────┴──────┐
      │                               │             │
      │                           REST API     Socket.io
      │                               │             │
      └── /*  ──► React build      MongoDB      JWT Auth
                  (/var/www/html)   Atlas       Middleware
```

**Request flow:**
1. Browser sends request with JWT cookie automatically attached
2. Nginx forwards `/api/` traffic to Express on port 7777 (strips `/api` prefix)
3. `userAuth` middleware verifies JWT from cookie on protected routes
4. Controller executes business logic and responds
5. For WebSocket: Socket.io middleware verifies JWT on handshake before any events are processed

---

## 📂 Project Structure

```
devTinder/
├── src/
│   ├── config/
│   │   └── database.js           # MongoDB Atlas connection
│   ├── middleware/
│   │   └── userAuth.js           # JWT verification middleware
│   ├── models/
│   │   ├── user.js               # User schema + methods
│   │   ├── connectionRequest.js  # Connection request schema
│   │   └── chat.js               # Chat + message schema
│   ├── routes/
│   │   ├── auth.js               # /signup, /login, /logout
│   │   ├── profile.js            # /profile/view, /profile/edit, /profile/password
│   │   ├── request.js            # /request/send, /request/review
│   │   ├── user.js               # /user/connections, /user/requests/received
│   │   └── chat.js               # /chat/:targetUserId
│   ├── utils/
│   │   ├── sockets.js            # Socket.io server + event handlers
│   │   ├── validation.js         # Request validation helpers
│   │   └── constants.js          # Shared constants (safe user fields etc.)
│   └── app.js                    # Express app entry point
├── .env                          # Environment variables (not committed)
├── .gitignore
├── package.json
└── README.md
```

---

## 🗃 Database Schema

### User
```
USER {
  _id         : ObjectId
  firstName   : String (required)
  lastName    : String
  emailId     : String (required, unique)
  password    : String (hashed, required)
  gender      : String (enum: male | female | other)
  age         : Number
  photoUrl    : String
  about       : String
  skills      : [String]
  createdAt   : Date
  updatedAt   : Date
}
```

**Instance methods:**
- `user.getJWT()` — signs and returns a JWT with `_id` payload
- `user.validatePassword(password)` — compares plain text against bcrypt hash
- `user.getSafeData()` — returns user object without the password field

### ConnectionRequest
```
CONNECTION_REQUEST {
  _id         : ObjectId
  fromUserId  : ObjectId → User
  toUserId    : ObjectId → User
  status      : String (enum: pending | accepted | rejected | ignored)
  createdAt   : Date
  updatedAt   : Date
}
```

Compound index on `{ fromUserId, toUserId }` prevents duplicate requests.

### Chat
```
CHAT {
  _id          : ObjectId
  participants : [ObjectId → User]
  messages     : [MESSAGE]
  createdAt    : Date
  updatedAt    : Date
}

MESSAGE {
  _id        : ObjectId
  senderId   : ObjectId → User
  text       : String (required)
  status     : String (enum: sent | delivered | read, default: sent)
  createdAt  : Date
  updatedAt  : Date
}
```

Unique index on `participants` ensures one chat document per user pair.

### ER Diagram

```
USER ||--o{ CONNECTION_REQUEST : "sends (fromUserId)"
USER ||--o{ CONNECTION_REQUEST : "receives (toUserId)"
USER ||--o{ CHAT               : "participates in"
CHAT ||--o{ MESSAGE            : "contains"
USER ||--o{ MESSAGE            : "sends (senderId)"
```

---

## 📡 API Reference

All protected routes require a valid JWT cookie (`token`). The cookie is set automatically on login/signup and sent by the browser on subsequent requests.

### Auth Routes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/signup` | ❌ | Register a new user. Returns user data + sets JWT cookie. |
| `POST` | `/login` | ❌ | Authenticate user. Returns user data + sets JWT cookie. |
| `POST` | `/logout` | ❌ | Clears the JWT cookie. |

**POST `/signup`** — Request body:
```json
{
  "firstName": "Anuj",
  "lastName": "Kamboj",
  "emailId": "anuj@example.com",
  "password": "securePassword123"
}
```

**POST `/login`** — Request body:
```json
{
  "emailId": "anuj@example.com",
  "password": "securePassword123"
}
```

---

### Profile Routes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/profile/view` | ✅ | Get the logged-in user's profile. Used for session restore on refresh. |
| `PATCH` | `/profile/edit` | ✅ | Update profile fields (name, bio, age, gender, photo, skills). |
| `PATCH` | `/profile/password` | ✅ | Change password. Requires current password verification. |

---

### Connection Request Routes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/request/send/:status/:toUserId` | ✅ | Send a request. `:status` must be `interested` or `ignored`. |
| `POST` | `/request/review/:status/:requestId` | ✅ | Review a received request. `:status` must be `accepted` or `rejected`. |

**Validations enforced:**
- Cannot send a request to yourself
- Cannot send duplicate requests
- Only the recipient can review a request
- Only `pending` requests can be reviewed

---

### User Routes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/user/connections` | ✅ | Get all accepted connections with safe user data. |
| `GET` | `/user/requests/received` | ✅ | Get all pending incoming connection requests. |
| `GET` | `/feed` | ✅ | Get paginated developer feed, excluding self + interacted users. |

---

### Chat Routes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/chat/:targetUserId` | ✅ | Fetch last 10 messages between the logged-in user and target. |

**Response:**
```json
{
  "message": "Chat fetched successfully",
  "chat": {
    "participants": ["userId1", "userId2"],
    "messages": [
      {
        "senderId": { "_id": "...", "firstName": "Anuj", "lastName": "Kamboj", "photoURL": "..." },
        "text": "Hey! Let's connect.",
        "status": "sent",
        "createdAt": "2025-01-01T10:00:00.000Z"
      }
    ]
  }
}
```

---

## ⚡ Socket.io Events

WebSocket connections are authenticated on handshake. The JWT cookie is read from `socket.handshake.headers.cookie`, verified, and the `userId` is attached to the socket instance. No client-sent `userId` is ever trusted.

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `joinChat` | `{ targetUserId }` | Join the private room for this conversation. |
| `sendMessage` | `{ targetUserId, text }` | Send a message. Server verifies connection exists before saving. |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `messageReceived` | `{ senderId, firstName, lastName, photoURL, text, status, createdAt }` | Broadcast new message to both users in the room. |
| `errorMessage` | `{ message }` | Emitted to sender if message delivery fails (e.g. no accepted connection). |

### Room Strategy

Each conversation gets a deterministic private room ID:

```js
const roomId = crypto
  .createHash("sha256")
  .update([userId, targetUserId].sort().join("&&"))
  .digest("hex");
```

Sorting before hashing ensures both users always compute the same room ID regardless of who initiates.

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 9
- A MongoDB Atlas cluster (or local MongoDB)

### Installation

```bash
# Clone the repository
git clone https://github.com/Anuj27aKamboj/devTinder.git
cd devTinder

# Install dependencies
npm install

# Create your environment file
cp .env.example .env
# Fill in your values (see Environment Variables below)

# Start the development server
npm run dev
```

The API will be available at `http://localhost:7777`.

---

## 🔑 Environment Variables

Create a `.env` file in the root directory:

```env
PORT=7777
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/devTinder
JWT_SECRET=your_super_secret_jwt_key_here
NODE_ENV=development
```

| Variable | Description |
|----------|-------------|
| `PORT` | Port the server listens on (default: 7777) |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for signing and verifying JWTs |
| `NODE_ENV` | `development` or `production` — controls cookie `secure` flag |

> ⚠️ **Important:** `require("dotenv").config()` must be the **first line** in `app.js`, before any other imports. This ensures all modules (including `sockets.js`) have access to env variables when they are loaded.

---

## 🖥 Deployment (EC2 + Nginx)

The app is deployed on AWS EC2 (Ubuntu) with the following setup:

### Nginx Configuration

```nginx
server {
    listen 80 default_server;
    server_name 3.26.43.77;

    # Serve React frontend build
    root /var/www/html;
    index index.html;

    # Proxy API + WebSocket traffic to Node.js
    location /api/ {
        proxy_pass http://localhost:7777/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # SPA fallback — serve index.html for all frontend routes
    location / {
        try_files $uri /index.html;
    }
}
```

### PM2 Process Management

```bash
# Start the server
pm2 start src/app.js --name devTinder

# Restart after pulling updates
pm2 restart devTinder

# View logs
pm2 logs devTinder

# Auto-start on system reboot
pm2 startup
pm2 save
```

### Deployment Steps

```bash
# 1. Pull latest code
cd /home/ubuntu/devTinder && git pull origin main

# 2. Install any new dependencies
npm install

# 3. Restart the server
pm2 restart devTinder

# 4. Reload nginx (if config changed)
sudo nginx -t && sudo systemctl reload nginx
```

---

## 🔒 Security Highlights

| Concern | Implementation |
|---------|---------------|
| Password storage | bcrypt with 10 salt rounds — plain text never stored |
| Session management | HTTP-only JWT cookies — inaccessible to JavaScript, immune to XSS |
| CORS | Strict origin whitelist with `credentials: true` — no wildcard |
| WebSocket auth | JWT verified on every Socket.io handshake via middleware |
| userId trust | Server always derives `userId` from verified JWT — never from client payload |
| Chat eligibility | Connection status checked before every message is saved |
| Room isolation | SHA-256 hashed room IDs — users cannot guess or join others' rooms |
| Input validation | All signup/login/profile inputs validated and sanitized before DB operations |

---

## 🔗 Frontend Repository

The React frontend is maintained in a separate repository:

> **[https://github.com/Anuj27aKamboj/devTinder-web](https://github.com/Anuj27aKamboj/devTinder-web)**

---

## 🔮 Future Improvements

- **Message status updates** — real-time delivered and read receipt events via Socket.io
- **Refresh token rotation** — extend sessions securely without re-login
- **Rate limiting** — protect auth endpoints from brute force with `express-rate-limit`
- **Input sanitization** — add `express-validator` for stricter request body validation
- **Real-time notifications** — Socket.io events for new connection requests and messages
- **Premium membership** — Razorpay integration for exclusive features
- **GitHub OAuth** — social login and repository display on profiles
- **Pagination cursors** — cursor-based pagination for feed and chat history
- **CI/CD pipeline** — GitHub Actions for automated testing and deployment to EC2
- **HTTPS** — SSL certificate via Let's Encrypt + Certbot for encrypted traffic

---

<div align="center">

Built with ❤️ by [Anuj Kamboj](https://github.com/Anuj27aKamboj)

</div>