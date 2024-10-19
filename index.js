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
	
	if (client) {
        console.warn('Client is already initialized.');
        return; // Prevent multiple initializations
    }
	
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

app.post('/logout', async (req, res) => {
    if (client) {
        try {
            await client.logout(); // Log out the client
			await client.destroy(); // destroy
			isClientReady = false; // Update readiness status
            client = null; // Reset client instance
            console.log('Client logged out successfully.');
			
			
			// Optionally wait before reinitializing
            setTimeout(() => {
                initializeClient(); // Reinitialize the client
            }, 10000); // Adjust the delay as needed

            res.json({ status: 'Client logged out successfully. You can scan the QR code to reconnect.' });
        
			
        } catch (error) {
            console.error('Error during logout:', error);
            res.status(500).json({ status: 'Error during logout.' });
        }
    } else {
        res.json({ status: 'No active client to log out.' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    initializeClient();
});
