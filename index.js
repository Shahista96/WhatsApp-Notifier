const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const path = require('path');
const qrcodeTerminal = require('qrcode-terminal'); // Import the qrcode-terminal library

const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.use(express.json());

let client;
let isClientReady = false;

// Initialize WhatsApp Client
const initializeClient = () => {
    client = new Client({ authStrategy: new LocalAuth() });

    client.on('qr', (qr) => {
        console.log('QR RECEIVED', qr);
        qrcodeTerminal.generate(qr, { small: true }); // Display QR code in terminal
    });

    client.on('ready', () => {
        console.log('Client is ready!');
        isClientReady = true;
    });

    client.initialize();
};

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
