const express = require('express');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// İzlenen coinler (istediğiniz gibi düzenleyin)
const trackedCoins = [
    'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT',
    'ADAUSDT', 'DOGEUSDT', 'DOTUSDT', 'AVAXUSDT', 'MATICUSDT'
];

// Veri depolama
let cryptoData = {};
let alarms = [];
let clientConnections = new Set();

// Binance WebSocket bağlantısı
function connectToBinance() {
    const streams = trackedCoins.map(coin => `${coin.toLowerCase()}@ticker`).join('/');
    const wsUrl = `wss://fstream.binance.com/stream?streams=${streams}`;
    
    const ws = new WebSocket(wsUrl);
    
    ws.on('open', () => {
        console.log('Binance WebSocket bağlandı');
    });
    
    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data);
            
            if (message.stream && message.data) {
                const symbol = message.data.s;
                
                if (trackedCoins.includes(symbol)) {
                    // Verileri kaydet
                    cryptoData[symbol] = {
                        symbol: symbol,
                        price: parseFloat(message.data.c),
                        change24h: parseFloat(message.data.P),
                        volume24h: parseFloat(message.data.q),
                        high24h: parseFloat(message.data.h),
                        low24h: parseFloat(message.data.l),
                        lastUpdate: new Date().toISOString()
                    };
                    
                    // Alarm kontrolü
                    checkAlarms(symbol);
                    
                    // İstemcilere gönder
                    broadcastUpdate(symbol);
                }
            }
        } catch (error) {
            console.error('WebSocket hatası:', error);
        }
    });
    
    ws.on('error', (error) => {
        console.error('Binance WS error:', error);
        setTimeout(connectToBinance, 5000);
    });
    
    ws.on('close', () => {
        console.log('Binance WS kapandı, yeniden bağlanılıyor...');
        setTimeout(connectToBinance, 5000);
    });
    
    return ws;
}

// Alarm kontrolü
function checkAlarms(symbol) {
    const data = cryptoData[symbol];
    if (!data) return;
    
    // Örnek alarm: %5'ten fazla değişim
    if (Math.abs(data.change24h) > 5) {
        const alarm = {
            id: Date.now(),
            symbol: symbol,
            shortSymbol: symbol.replace('USDT', ''),
            alarmType: 'price_change',
            currentPrice: data.price,
            changePercent: data.change24h,
            timestamp: new Date().toISOString(),
            timeText: new Date().toLocaleTimeString('tr-TR')
        };
        
        // Aynı alarm için 5 dakika kontrolü
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
        const existing = alarms.find(a => 
            a.symbol === symbol && 
            a.alarmType === 'price_change' &&
            (Date.now() - new Date(a.timestamp).getTime()) < fiveMinutesAgo
        );
        
        if (!existing) {
            alarms.unshift(alarm);
            if (alarms.length > 100) {
                alarms = alarms.slice(0, 100);
            }
            
            // İstemcilere alarm gönder
            broadcastAlarm(alarm);
            console.log(`Alarm: ${symbol} - %${data.change24h}`);
        }
    }
}

// İstemcilere veri gönder
function broadcastUpdate(symbol) {
    const data = cryptoData[symbol];
    if (!data) return;
    
    const update = {
        type: 'update',
        symbol: symbol,
        data: data
    };
    
    clientConnections.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(update));
        }
    });
}

function broadcastAlarm(alarm) {
    const message = {
        type: 'alarm',
        alarm: alarm
    };
    
    clientConnections.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
}

// Express middleware
app.use(express.static('public'));
app.use(express.json());

// API Endpoints
app.get('/api/data', (req, res) => {
    res.json(cryptoData);
});

app.get('/api/alarms', (req, res) => {
    res.json(alarms);
});

app.get('/api/coins', (req, res) => {
    res.json(Object.keys(cryptoData));
});

app.delete('/api/alarms', (req, res) => {
    alarms = [];
    res.json({ success: true });
});

// Ana sayfa
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Alarm sayfası
app.get('/alarm', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'alarm.html'));
});

// WebSocket server
const server = app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor`);
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('Yeni istemci bağlandı');
    clientConnections.add(ws);
    
    // İlk verileri gönder
    ws.send(JSON.stringify({
        type: 'init',
        data: cryptoData,
        alarms: alarms.slice(0, 10)
    }));
    
    ws.on('close', () => {
        console.log('İstemci bağlantısı kapandı');
        clientConnections.delete(ws);
    });
});

// Binance'e bağlan
connectToBinance();

// Her 30 dakikada bir temizlik
setInterval(() => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    Object.keys(cryptoData).forEach(symbol => {
        const lastUpdate = new Date(cryptoData[symbol].lastUpdate);
        if (lastUpdate < oneHourAgo) {
            delete cryptoData[symbol];
        }
    });
}, 30 * 60 * 1000);