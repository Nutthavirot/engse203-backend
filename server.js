// server.js - My First Express Server
const express = require('express');
const http = require('http'); // << Import http ของ Node
const { Server } = require("socket.io"); // << Import Server จาก socket.io
require('dotenv').config();

const app = express();
const server = http.createServer(app); // << สร้าง server ด้วย http
const io = new Server(server, { // << ผูก socket.io กับ http server
    cors: { origin: "*" } // อนุญาตการเชื่อมต่อจากทุกที่
});

const PORT = process.env.PORT || 3000;
const APP_NAME = process.env.APP_NAME;
const cors = require('cors'); // << Import cors
const helmet = require('helmet'); // << Import helmet
const Joi = require('joi'); // << Import Joi
const userSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
    birth_year: Joi.number().integer().min(1900).max(new Date().getFullYear())
});

app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "script-src": ["'self'", "'unsafe-inline'"]
    }
  }
}));

app.use(cors());
app.use(express.json());

// เพิ่ม Route ใหม่สำหรับทดสอบ
app.get('/api/data', (req, res) => {
    res.json({ message: 'This data is open for everyone!' });
});

// Route สำหรับสร้าง user
app.post('/api/users', (req, res) => {
    const { error, value } = userSchema.validate(req.body);

    if (error) {
        // ถ้าข้อมูลไม่ถูกต้อง ส่ง 400 Bad Request กลับไปพร้อมรายละเอียด
        return res.status(400).json({ message: 'Invalid data', details: error.details });
    }

    // ถ้าข้อมูลถูกต้อง
    console.log('Validated data:', value);
    res.status(201).json({ message: 'User created successfully!', data: value });
});

// เสิร์ฟไฟล์ HTML สำหรับ Client
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// จัดการ Event เมื่อมีคนเชื่อมต่อเข้ามา
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // เมื่อได้รับ event 'chat message' จาก client
    socket.on('chat message', (msg) => {
        console.log('message: ' + msg);
        // ส่ง event 'chat message' กลับไปให้ client ทุกคนที่เชื่อมต่ออยู่
        io.emit('chat message', `[${socket.id} says]: ${msg}`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`🚀 Server with WebSocket running on http://localhost:${PORT}`);
});