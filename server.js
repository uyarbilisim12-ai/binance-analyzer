const express = require('express');
const WebSocket = require('ws');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

let alarmData = []; // Üretilen alarmların tutulduğu liste
const trackedCoins = [
    '0GUSDT', '1000000BOBUSDT', '1000000MOGUSDT', '1000BONKUSDT', '1000CATUSDT', 
'1000CHEEMSUSDT', '1000FLOKIUSDT', '1000LUNCUSDT', '1000PEPEUSDT', '1000RATSUSDT', 
'1000SATSUSDT', '1000SHIBUSDT', '1000WHYUSDT', '1000XECUSDT', '1INCHUSDT', 
'1MBABYDOGEUSDT', '2ZUSDT', '42USDT', '4USDT', 'A2ZUSDT', 
'AAVEUSDT', 'ACEUSDT', 'ACHUSDT', 'ACTUSDT', 'ACXUSDT', 
'ADAUSDT', 'AERGOUSDT', 'AEROUSDT', 'AEVOUSDT', 'AGLDUSDT', 
'AGTUSDT', 'AINUSDT', 'AIOTUSDT', 'AIOUSDT', 'AIUSDT', 
'AIXBTUSDT', 'AKEUSDT', 'AKTUSDT', 'ALCHUSDT', 'ALGOUSDT', 
'ALICEUSDT', 'ALLOUSDT', 'ALLUSDT', 'ALPINEUSDT', 'ALTUSDT', 
'ANIMEUSDT', 'ANKRUSDT', 'APEUSDT', 'API3USDT', 'APRUSDT', 
'APTUSDT', 'ARBUSDT', 'ARCUSDT', 'ARIAUSDT', 'ARKMUSDT', 
'ARKUSDT', 'ARPAUSDT', 'ARUSDT', 'ASRUSDT', 'ASTERUSDT', 
'ASTRUSDT', 'ATAUSDT', 'ATHUSDT', 'ATOMUSDT', 'ATUSDT', 
'AUCTIONUSDT', 'AUSDT', 'AVAAIUSDT', 'AVAUSDT', 'AVAXUSDT', 
'AVNTUSDT', 'AWEUSDT', 'AXLUSDT', 'AXSUSDT', 'B2USDT', 
'B3USDT', 'BABYUSDT', 'BANANAS31USDT', 'BANANAUSDT', 'BANDUSDT', 
'BANKUSDT', 'BANUSDT', 'BARDUSDT', 'BASUSDT', 'BATUSDT', 
'BBUSDT', 'BCHUSDT', 'BDXNUSDT', 'BEAMXUSDT', 'BEATUSDT', 
'BELUSDT', 'BERAUSDT', 'BICOUSDT', 'BIDUSDT', 'BIGTIMEUSDT', 
'BIOUSDT', 'BLESSUSDT', 'BLUAIUSDT', 'BLURUSDT', 'BMTUSDT', 
'BNBUSDT', 'BNTUSDT', 'BOBUSDT', 'BOMEUSDT', 'BRETTUSDT', 
'BROCCOLI714USDT', 'BROCCOLIF3BUSDT', 'BRUSDT', 'BSVUSDT', 'BTCDOMUSDT', 
'BTCUSDT', 'BTRUSDT', 'BULLAUSDT', 'BUSDT', 'C98USDT', 
'CAKEUSDT', 'CARVUSDT', 'CATIUSDT', 'CCUSDT', 'CELOUSDT', 
'CELRUSDT', 'CETUSUSDT', 'CFXUSDT', 'CGPTUSDT', 'CHESSUSDT', 
'CHILLGUYUSDT', 'CHRUSDT', 'CHZUSDT', 'CKBUSDT', 'CLANKERUSDT', 
'CLOUSDT', 'COAIUSDT', 'COMMONUSDT', 'COMPUSDT', 'COOKIEUSDT', 
'COSUSDT', 'COTIUSDT', 'COWUSDT', 'CROSSUSDT', 'CRVUSDT', 
'CTKUSDT', 'CTSIUSDT', 'CUDISUSDT', 'CUSDT', 'CVCUSDT', 
'CVXUSDT', 'CYBERUSDT', 'CYSUSDT', 'DAMUSDT', 'DASHUSDT',


                'DEEPUSDT', 'DEGENUSDT', 'DEGOUSDT', 'DENTUSDT', 'DEXEUSDT', 
'DFUSDT', 'DIAUSDT', 'DMCUSDT', 'DODOXUSDT', 'DOGEUSDT', 
'DOGSUSDT', 'DOLOUSDT', 'DOODUSDT', 'DOTUSDT', 'DRIFTUSDT', 
'DUSDT', 'DUSKUSDT', 'DYDXUSDT', 'DYMUSDT', 'EDENUSDT', 
'EDUUSDT', 'EGLDUSDT', 'EIGENUSDT', 'ENAUSDT', 'ENJUSDT', 
'ENSOUSDT', 'ENSUSDT', 'EPICUSDT', 'EPTUSDT', 'ERAUSDT', 
'ESPORTSUSDT', 'ETCUSDT', 'ETHFIUSDT', 'ETHUSDT', 'ETHWUSDT', 
'EULUSDT', 'EVAAUSDT', 'FARTCOINUSDT', 'FETUSDT', 'FFUSDT', 
'FHEUSDT', 'FIDAUSDT', 'FILUSDT', 'FIOUSDT', 'FLOCKUSDT', 
'FLOWUSDT', 'FLUIDUSDT', 'FLUXUSDT', 'FOLKSUSDT', 'FORMUSDT', 
'FORTHUSDT', 'FUNUSDT', 'FUSDT', 'FXSUSDT', 'GALAUSDT', 
'GASUSDT', 'GHSTUSDT', 'GIGGLEUSDT', 'GLMUSDT', 'GMTUSDT', 
'GMXUSDT', 'GOATUSDT', 'GPSUSDT', 'GRASSUSDT', 'GRIFFAINUSDT', 
'GRTUSDT', 'GTCUSDT', 'GUNUSDT', 'GUSDT', 'HAEDALUSDT', 
'HANAUSDT', 'HBARUSDT', 'HEIUSDT', 'HEMIUSDT', 'HFTUSDT', 
'HIGHUSDT', 'HIPPOUSDT', 'HIVEUSDT', 'HMSTRUSDT', 'HOLOUSDT', 
'HOMEUSDT', 'HOOKUSDT', 'HOTUSDT', 'HUMAUSDT', 'HUSDT', 
'HYPERUSDT', 'HYPEUSDT', 'ICNTUSDT', 'ICPUSDT', 'ICXUSDT', 
'IDOLUSDT', 'IDUSDT', 'ILVUSDT', 'IMXUSDT', 'INITUSDT', 
'INJUSDT', 'INUSDT', 'IOSTUSDT', 'IOTAUSDT', 'IOTXUSDT', 
'IOUSDT', 'IPUSDT', 'IRYSUSDT', 'JASMYUSDT', 'JCTUSDT', 
'JELLYJELLYUSDT', 'JOEUSDT', 'JSTUSDT', 'JTOUSDT', 'JUPUSDT', 
'KAIAUSDT', 'KAITOUSDT', 'KASUSDT', 'KAVAUSDT', 'KERNELUSDT', 
'KGENUSDT', 'KITEUSDT', 'KMNOUSDT', 'KNCUSDT', 'KOMAUSDT', 
'KSMUSDT', 'LABUSDT', 'LAUSDT', 'LAYERUSDT', 'LDOUSDT', 
'LIGHTUSDT', 'LINEAUSDT', 'LINKUSDT', 'LISTAUSDT', 'LPTUSDT', 
'LQTYUSDT', 'LRCUSDT', 'LSKUSDT', 'LTCUSDT', 'LUMIAUSDT', 
'LUNA2USDT', 'LYNUSDT', 'MAGICUSDT', 'MANAUSDT', 'MANTAUSDT', 
'MASKUSDT', 'MAVIAUSDT', 'MAVUSDT', 'MBOXUSDT', 'MELANIAUSDT', 
'MEMEUSDT', 'MERLUSDT', 'METISUSDT', 'METUSDT', 'MEUSDT'
];

const coinData = {}; // Coinlerin anlık fiyat ve mum verileri

// Binance'ten geçmiş verileri çekmek için (EMA ve Likidite için gerekli)
async function fetchHistoricalData(symbol) {
    try {
        const response = await fetch(`https://fapi.binance.com/fapi/v1/klines?symbol=${symbol}&interval=15m&limit=100`);
        const data = await response.json();
        return data.map(d => ({
            high: parseFloat(d[2]),
            low: parseFloat(d[3]),
            close: parseFloat(d[4]),
            volume: parseFloat(d[5])
        }));
    } catch (e) {
        console.error(`${symbol} veri çekme hatası:`, e);
        return null;
    }
}

// EMA Hesaplama Fonksiyonu
function calculateEMA(data, period) {
    const k = 2 / (period + 1);
    let ema = data[0].close;
    for (let i = 1; i < data.length; i++) {
        ema = data[i].close * k + ema * (1 - k);
    }
    return ema;
}

// Alarm Kontrol Mekanizması (bilgi.html'den taşındı)
async function checkAlarms(symbol, currentPrice) {
    const history = await fetchHistoricalData(symbol);
    if (!history) return;

    const lastCandle = history[history.length - 1];
    const ema50 = calculateEMA(history, 50);
    
    // Likidite Seviyeleri (Son 100 mumun en yükseği/düşüğü)
    const upperLiquidity = Math.max(...history.map(h => h.high));
    const lowerLiquidity = Math.min(...history.map(h => h.low));

    let alarm = null;

    // 1. Üst Likidite Alarmı
    if (currentPrice >= upperLiquidity * 0.998) {
        alarm = { symbol, type: 'upper_liquidity', text: 'Üst Likiditeye Yaklaştı!' };
    } 
    // 2. Alt Likidite Alarmı
    else if (currentPrice <= lowerLiquidity * 1.002) {
        alarm = { symbol, type: 'lower_liquidity', text: 'Alt Likiditeye Yaklaştı!' };
    }
    // 3. EMA 50 Kesişimi
    else if (Math.abs(currentPrice - ema50) / ema50 < 0.001) {
        alarm = { symbol, type: 'ema', text: 'EMA 50 Seviyesinde!' };
    }

    if (alarm) {
        const newAlarm = {
            ...alarm,
            id: Date.now(),
            currentPrice: currentPrice.toFixed(4),
            timestamp: new Date().toISOString(),
            timeText: new Date().toLocaleTimeString('tr-TR')
        };
        
        // Aynı coinden çok sık alarm gelmemesi için kontrol
        const isDuplicate = alarmData.slice(0, 5).some(a => a.symbol === symbol && a.type === alarm.type);
        if (!isDuplicate) {
            alarmData.unshift(newAlarm);
            if (alarmData.length > 100) alarmData.pop();
            broadcast(newAlarm);
        }
    }
}

// WebSocket üzerinden bağlı tüm kullanıcılara mesaj gönder
function broadcast(data) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

// Statik dosyaları sun (index.html, alarm.html)
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/alarms', (req, res) => {
    res.json(alarmData);
});

const server = app.listen(PORT, () => console.log(`Sunucu ${PORT} portunda aktif`));
const wss = new WebSocket.Server({ server });

// Binance WebSocket Bağlantısı (Tüm Coinlerin Anlık Fiyatları)
const binanceWS = new WebSocket('wss://fstream.binance.com/ws/!ticker@arr');

binanceWS.on('message', (data) => {
    const tickers = JSON.parse(data);
    tickers.forEach(ticker => {
        if (trackedCoins.includes(ticker.s)) {
            const price = parseFloat(ticker.c);
            // Her 30 saniyede bir analiz yap (Render donmaması için)
            if (!coinData[ticker.s] || Date.now() - coinData[ticker.s].lastCheck > 30000) {
                checkAlarms(ticker.s, price);
                coinData[ticker.s] = { price, lastCheck: Date.now() };
            }
        }
    });
});
