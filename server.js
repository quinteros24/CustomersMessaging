const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const WebSocket = require('ws');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static('.'));

let waClient = null;
let connectedClients = new Set(); // Para manejar múltiples clientes WebSocket

// Función para broadcast a todos los clientes conectados
function broadcastToClients(message) {
    connectedClients.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
        }
    });
}

function initializeWhatsAppClient() {
    if (waClient) {
        console.log('WhatsApp client already exists');
        return;
    }

    console.log('Initializing WhatsApp client...');
    waClient = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: {
            headless: true,
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu'
            ]
        }
    });

    waClient.on('qr', (qr) => {
        console.log('QR code generated');
        broadcastToClients({ type: 'qr', qr });
    });

    waClient.on('ready', () => {
        console.log('WhatsApp client is ready');
        broadcastToClients({ type: 'ready' });
    });

    waClient.on('disconnected', (reason) => {
        console.log('WhatsApp client disconnected:', reason);
        broadcastToClients({ type: 'disconnected', reason });
        waClient.destroy().then(() => {
            waClient = null;
            console.log('WhatsApp client destroyed');
        });
    });

    waClient.on('auth_failure', (msg) => {
        console.error('Authentication failure:', msg);
        broadcastToClients({ type: 'error', message: `Authentication failure: ${msg}` });
    });

    waClient.on('error', (error) => {
        console.error('WhatsApp client error:', error);
        broadcastToClients({ type: 'error', message: `Client error: ${error.message}` });
    });

    console.log('Starting WhatsApp client initialization...');
    waClient.initialize().catch((error) => {
        console.error('Failed to initialize WhatsApp client:', error);
        broadcastToClients({ type: 'error', message: `Initialization error: ${error.message}` });
    });
}

wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    connectedClients.add(ws);

    // Enviar estado actual si WhatsApp ya está conectado
    if (waClient && waClient.info) {
        ws.send(JSON.stringify({ type: 'ready' }));
    } else {
        ws.send(JSON.stringify({ type: 'waiting_initialization' }));
    }

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log('Received WebSocket message:', data);
            
            switch(data.type) {
                case 'initialize_whatsapp':
                    if (!waClient) {
                        initializeWhatsAppClient();
                        ws.send(JSON.stringify({ type: 'initializing' }));
                    } else {
                        ws.send(JSON.stringify({ type: 'already_initialized' }));
                    }
                    break;
                    
                case 'disconnect':
                    if (waClient) {
                        console.log('Disconnecting WhatsApp client...');
                        waClient.destroy().then(() => {
                            waClient = null;
                            console.log('WhatsApp client disconnected');
                        });
                    }
                    break;
                    
                case 'send_message':
                    if (waClient && waClient.info) {
                        console.log(`Sending message to ${data.phone}`);
                        const chatId = `${data.phone}@c.us`;
                        waClient.sendMessage(chatId, data.message)
                            .then(() => {
                                console.log(`Message sent to ${data.name} (${data.phone})`);
                                ws.send(JSON.stringify({
                                    type: 'message_status',
                                    success: true,
                                    message: `Mensaje enviado a ${data.name} (${data.phone}).`
                                }));
                            })
                            .catch((error) => {
                                console.error(`Error sending message to ${data.name} (${data.phone}):`, error);
                                ws.send(JSON.stringify({
                                    type: 'message_status',
                                    success: false,
                                    message: `Error al enviar a ${data.name} (${data.phone}): ${error.message}`
                                }));
                            });
                    } else {
                        ws.send(JSON.stringify({
                            type: 'message_status',
                            success: false,
                            message: 'WhatsApp no está conectado'
                        }));
                    }
                    break;
            }
        } catch (error) {
            console.error('WebSocket message error:', error);
        }
    });

    ws.on('close', () => {
        console.log('WebSocket client disconnected');
        connectedClients.delete(ws);
    });
});

server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
    console.log('Open your browser and go to http://localhost:3000 to use the application');
});