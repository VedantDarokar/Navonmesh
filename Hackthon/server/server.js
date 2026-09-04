const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dns = require('dns');
require('dotenv').config();

// Configure DNS resolution for MongoDB Atlas SRV lookup compatibility
try {
    if (dns.setDefaultResultOrder) dns.setDefaultResultOrder('ipv4first');
    dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
    // Ignore DNS fallback errors if custom servers cannot be set
}

const app = express();

// Middleware setup (Express & CORS)
app.use(cors());
app.use(express.json());

// Request Logger
app.use((req, res, next) => {
    // Only log if it's NOT a polling request to /api/issues
    if (!(req.method === 'GET' && req.url === '/api/issues')) {
        console.log(`${req.method} request to ${req.url}`);
    }
    next();
});

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/navonmesh';

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected Successfully'))
    .catch(async (err) => {
        console.log(`⚠️ Primary MongoDB Connection Failed: ${err.message}`);
        console.log('Attempting local MongoDB fallback (mongodb://127.0.0.1:27017/navonmesh)...');
        try {
            await mongoose.connect('mongodb://127.0.0.1:27017/navonmesh');
            console.log('✅ Local MongoDB Connected Successfully');
        } catch (fallbackErr) {
            console.log('⚠️ Note: To save data to MongoDB, please update MONGO_URI in server/.env with valid credentials or start a local MongoDB service.');
        }
    });

const PORT = process.env.PORT || 5000;

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/register', require('./routes/register'));
app.use('/api/accommodation', require('./routes/accommodation'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/issues', require('./routes/issues'));
app.use('/api/cultural', require('./routes/cultural'));

app.get('/', (req, res) => {
    res.send('Navonmesh Hackathon API is running');
});

const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
    pingTimeout: 60000,
});

io.on('connection', (socket) => {
    console.log(`[Socket] New operative connected: ${socket.id}`);

    socket.on('seat-update', (data) => {
        console.log(`[Socket] Broadcasting seat update for ${data.registrationId}`);
        // Broadcast to all clients including sender
        io.emit('seat-updated', data);
    });

    socket.on('team-detail-update', (data) => {
        console.log(`[Socket] Broadcasting detail update for ${data.id}`);
        io.emit('team-detail-updated', data);
    });

    socket.on('disconnect', (reason) => {
        console.log(`[Socket] Operative disconnected: ${socket.id} (${reason})`);
    });
});

server.listen(PORT, () => console.log(`🚀 Mission Control running on port ${PORT}`));

