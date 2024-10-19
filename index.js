const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const path = require('path');
const qrcode = require('qrcode'); // Import qrcode library for generating QR codes

const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.use(express.json());

let client;
let isClientReady = false;

// Initialize WhatsApp Client
const initializeClient = () => {
    client = new Client({ authStrategy: new LocalAuth() });

    client.on('qr', async (qr) => {
        console.log('QR RECEIVED', qr);
        const qrImageUrl = await qrcode.toDataURL(qr); // Convert QR code to Data URL
        app.locals.qrImageUrl = qrImageUrl; // Store QR image URL in app locals
    });

    client.on('ready', () => {
        console.log('Client is ready!');
        isClientReady = true;
    });

    client.initialize();
};

// New route to get QR code image
app.get('/qr-code', (req, res) => {
    res.json({ qrCode: app.locals.qrImageUrl });
});

app.post('/send-notification', async (req, res) => {
    if (!isClientReady) {
        return res.json({ status: 'Client not ready. Please wait.' });
    }

    const { groups, message } = req.body;

    for (const group of groups) {
        const chats = await client.getChats();
        const chat = chats.find(c => c.name === group);
        if (chat) {
            await chat.sendMessage(message);
            console.log(`Message sent to ${group}`);
        } else {
            console.log(`Group ${group} not found`);
        }
    }

    res.json({ status: 'Notifications sent!' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    initializeClient();
});
