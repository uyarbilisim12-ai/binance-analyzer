const express = require('express');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// İzlenen coinler (bilgi.html'den kopyaladım)
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

// Veri depolama
let cryptoData = {};
let candleData = {};
let alarmData = [];
let volumeData = {};
let initialValues = {};
let fourHourConcepts = {};
let turtleSoupData = {};

let clientConnections = new Set();

// Yardımcı fonksiyonlar
function formatVolume(value) {
    if (!value) return '-';
    const num = parseFloat(value);
    if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
    return num.toFixed(2);
}

function calculateVolumeRatio(coinData) {
    const coinVolume = coinData.volume24h || 0;
    const usdtVolume = coinData.quoteVolume24h || 0;
    const price = coinData.price || 1;
    
    if (coinVolume === 0 || usdtVolume === 0) return '-';
    
    const expectedUSDT = coinVolume * price;
    if (expectedUSDT === 0) return '-';
    
    const ratio = (usdtVolume / expectedUSDT) * 100;
    return ratio.toFixed(1) + '%';
}

function calculateLiquidityLevels(symbol, candles, currentPrice) {
    if (!candles || candles.length < 20) {
        if (candles && candles.length > 0) {
            const recentCandles = candles.slice(-Math.min(50, candles.length));
            const high = Math.max(...recentCandles.map(c => c.high));
            const low = Math.min(...recentCandles.map(c => c.low));
            
            let upperLiquidity = high;
            let lowerLiquidity = low;
            
            if (currentPrice > high) {
                upperLiquidity = currentPrice * 1.02;
            }
            
            if (currentPrice < low) {
                lowerLiquidity = currentPrice * 0.98;
            }
            
            return { upperLiquidity, lowerLiquidity };
        }
        return { upperLiquidity: 0, lowerLiquidity: 0 };
    }
    
    const length = 14;
    let swingHighs = [];
    let swingLows = [];
    
    for (let i = length; i < candles.length - length; i++) {
        let isSwingHigh = true;
        let isSwingLow = true;
        
        for (let j = i - length; j <= i + length; j++) {
            if (j === i) continue;
            if (candles[j].high >= candles[i].high) {
                isSwingHigh = false;
                break;
            }
        }
        
        for (let j = i - length; j <= i + length; j++) {
            if (j === i) continue;
            if (candles[j].low <= candles[i].low) {
                isSwingLow = false;
                break;
            }
        }
        
        if (isSwingHigh) {
            swingHighs.push({
                price: candles[i].high,
                time: candles[i].openTime
            });
        }
        
        if (isSwingLow) {
            swingLows.push({
                price: candles[i].low,
                time: candles[i].openTime
            });
        }
    }
    
    let upperLiquidity = 0;
    let lowerLiquidity = 0;
    
    for (let swing of swingHighs) {
        if (swing.price > currentPrice) {
            if (upperLiquidity === 0 || swing.price < upperLiquidity) {
                upperLiquidity = swing.price;
            }
        }
    }
    
    for (let swing of swingLows) {
        if (swing.price < currentPrice) {
            if (lowerLiquidity === 0 || swing.price > lowerLiquidity) {
                lowerLiquidity = swing.price;
            }
        }
    }
    
    if (upperLiquidity === 0) {
        const recentHighs = candles.slice(-100).map(c => c.high);
        upperLiquidity = Math.max(...recentHighs);
    }
    
    if (lowerLiquidity === 0) {
        const recentLows = candles.slice(-100).map(c => c.low);
        lowerLiquidity = Math.min(...recentLows);
    }
    
    if (upperLiquidity === 0 || lowerLiquidity === 0) {
        upperLiquidity = currentPrice * 1.05;
        lowerLiquidity = currentPrice * 0.95;
    }
    
    return { upperLiquidity, lowerLiquidity };
}

function calculateFourHour20MHighLow(candles) {
    if (!candles || candles.length < 20) {
        if (candles && candles.length > 0) {
            const highs = candles.map(c => c.high);
            const lows = candles.map(c => c.low);
            return {
                high: Math.max(...highs),
                low: Math.min(...lows)
            };
        }
        return { high: 0, low: 0 };
    }
    
    const last20 = candles.slice(-20);
    const high = Math.max(...last20.map(c => c.high));
    const low = Math.min(...last20.map(c => c.low));
    
    return { high, low };
}

function calculateEMA(prices, period) {
    if (prices.length < period) return prices[prices.length - 1] || 0;
    
    const k = 2 / (period + 1);
    let ema = prices[0];
    
    for (let i = 1; i < prices.length; i++) {
        ema = prices[i] * k + ema * (1 - k);
    }
    
    return ema;
}

function calculateFourHourEMA(candles, period) {
    if (!candles || candles.length < period) return candles && candles.length > 0 ? candles[candles.length - 1].close : 0;
    
    const closes = candles.map(c => c.close);
    return calculateEMA(closes, period);
}

function calculateLiquidityPercentage(currentPrice, lowerLiquidity) {
    if (currentPrice === 0 || lowerLiquidity === 0) {
        return 0;
    }
    
    return ((currentPrice - lowerLiquidity) / lowerLiquidity) * 100;
}

function checkAlarmLevels(symbol, data, candles) {
    if (!data.price || !candles || candles.length === 0) return;
    
    const currentPrice = data.price;
    const liquidity = calculateLiquidityLevels(symbol, candles, currentPrice);
    const highLow = calculateFourHour20MHighLow(candles);
    const ema50 = calculateFourHourEMA(candles, 50);
    const liquidityPercentage = calculateLiquidityPercentage(currentPrice, liquidity.lowerLiquidity);
    
    const alarms = [];
    
    // 1. Üst Likidite kontrolü (%0.5 tolerans)
    if (liquidity.upperLiquidity > 0) {
        const diff = Math.abs(currentPrice - liquidity.upperLiquidity) / liquidity.upperLiquidity * 100;
        if (diff <= 0.5) {
            alarms.push({
                symbol: symbol,
                shortSymbol: symbol.replace('USDT', ''),
                alarmType: 'upper_liquidity',
                alarmTypeText: 'Üst Likidite',
                currentPrice: currentPrice,
                targetPrice: liquidity.upperLiquidity,
                timestamp: new Date().toISOString(),
                timeText: new Date().toLocaleTimeString('tr-TR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                })
            });
        }
    }
    
    // 2. Alt Likidite kontrolü (%0.5 tolerans)
    if (liquidity.lowerLiquidity > 0) {
        const diff = Math.abs(currentPrice - liquidity.lowerLiquidity) / liquidity.lowerLiquidity * 100;
        if (diff <= 0.5) {
            alarms.push({
                symbol: symbol,
                shortSymbol: symbol.replace('USDT', ''),
                alarmType: 'lower_liquidity',
                alarmTypeText: 'Alt Likidite',
                currentPrice: currentPrice,
                targetPrice: liquidity.lowerLiquidity,
                timestamp: new Date().toISOString(),
                timeText: new Date().toLocaleTimeString('tr-TR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                })
            });
        }
    }
    
    // 3. Likidite yüzdesi kontrolü (%5 üzeri)
    if (Math.abs(liquidityPercentage) >= 5) {
        alarms.push({
            symbol: symbol,
            shortSymbol: symbol.replace('USDT', ''),
            alarmType: 'liquidity_percentage',
            alarmTypeText: 'Likidite %',
            currentPrice: currentPrice,
            targetPrice: liquidityPercentage,
            timestamp: new Date().toISOString(),
            timeText: new Date().toLocaleTimeString('tr-TR', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            })
        });
    }
    
    // 4. 20M Yüksek kontrolü (%0.5 tolerans)
    if (highLow.high > 0) {
        const diff = Math.abs(currentPrice - highLow.high) / highLow.high * 100;
        if (diff <= 0.5) {
            alarms.push({
                symbol: symbol,
                shortSymbol: symbol.replace('USDT', ''),
                alarmType: '20m_high',
                alarmTypeText: '20M Yüksek',
                currentPrice: currentPrice,
                targetPrice: highLow.high,
                timestamp: new Date().toISOString(),
                timeText: new Date().toLocaleTimeString('tr-TR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                })
            });
        }
    }
    
    // 5. 20M Düşük kontrolü (%0.5 tolerans)
    if (highLow.low > 0) {
        const diff = Math.abs(currentPrice - highLow.low) / highLow.low * 100;
        if (diff <= 0.5) {
            alarms.push({
                symbol: symbol,
                shortSymbol: symbol.replace('USDT', ''),
                alarmType: '20m_low',
                alarmTypeText: '20M Düşük',
                currentPrice: currentPrice,
                targetPrice: highLow.low,
                timestamp: new Date().toISOString(),
                timeText: new Date().toLocaleTimeString('tr-TR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                })
            });
        }
    }
    
    // 9. EMA50 üstüne çıkma kontrolü (%1 tolerans)
    if (ema50 > 0) {
        if (currentPrice >= ema50 && currentPrice <= ema50 * 1.01) {
            alarms.push({
                symbol: symbol,
                shortSymbol: symbol.replace('USDT', ''),
                alarmType: 'ema50_above',
                alarmTypeText: 'EMA50 Üstü',
                currentPrice: currentPrice,
                targetPrice: ema50,
                timestamp: new Date().toISOString(),
                timeText: new Date().toLocaleTimeString('tr-TR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                })
            });
        }
    }
    
    // 10. EMA50 altına düşme kontrolü (%1 tolerans)
    if (ema50 > 0) {
        if (currentPrice <= ema50 && currentPrice >= ema50 * 0.99) {
            alarms.push({
                symbol: symbol,
                shortSymbol: symbol.replace('USDT', ''),
                alarmType: 'ema50_below',
                alarmTypeText: 'EMA50 Altı',
                currentPrice: currentPrice,
                targetPrice: ema50,
                timestamp: new Date().toISOString(),
                timeText: new Date().toLocaleTimeString('tr-TR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                })
            });
        }
    }
    
    // Yeni alarmları kaydet
    alarms.forEach(newAlarm => {
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
        const existing = alarmData.find(a => 
            a.symbol === newAlarm.symbol && 
            a.alarmType === newAlarm.alarmType &&
            (Date.now() - new Date(a.timestamp).getTime()) < fiveMinutesAgo
        );
        
        if (!existing) {
            alarmData.unshift(newAlarm);
            if (alarmData.length > 100) {
                alarmData = alarmData.slice(0, 100);
            }
            
            // İstemcilere alarm gönder
            broadcastMessage({
                type: 'alarm',
                alarm: newAlarm
            });
            
            console.log(`Alarm: ${newAlarm.shortSymbol} - ${newAlarm.alarmTypeText}`);
        }
    });
    
    // Hacim verilerini kaydet
    const quoteVolume24h = data.quoteVolume24h || 0;
    const volume24h = data.volume24h || 0;
    const volumeRatio = calculateVolumeRatio(data) || '0%';
    
    volumeData[symbol] = {
        quoteVolume24h: quoteVolume24h,
        volume24h: volume24h,
        volumeRatio: volumeRatio,
        price: currentPrice,
        timestamp: new Date().toISOString()
    };
}

// Mum verilerini al
async function fetchCandleData(symbol) {
    try {
        const response = await fetch(`https://fapi.binance.com/fapi/v1/klines?symbol=${symbol}&interval=4h&limit=100`);
        if (!response.ok) return null;
        
        const data = await response.json();
        const candles = [];
        
        for (let i = 0; i < data.length; i++) {
            const candle = data[i];
            candles.push({
                openTime: candle[0],
                open: parseFloat(candle[1]),
                high: parseFloat(candle[2]),
                low: parseFloat(candle[3]),
                close: parseFloat(candle[4]),
                volume: parseFloat(candle[5]),
                closeTime: candle[6]
            });
        }
        
        return candles;
    } catch (error) {
        console.error(`${symbol} mum verisi alınamadı:`, error);
        return null;
    }
}

// Binance WebSocket bağlantısı
function connectToBinance() {
    const streams = trackedCoins.map(coin => `${coin.toLowerCase()}@ticker`).join('/');
    const wsUrl = `wss://fstream.binance.com/stream?streams=${streams}`;
    
    const ws = new WebSocket(wsUrl);
    
    ws.on('open', async () => {
        console.log('Binance WebSocket bağlandı');
        
        // İlk mum verilerini al
        for (const symbol of trackedCoins) {
            const candles = await fetchCandleData(symbol);
            if (candles) {
                candleData[symbol] = candles;
                console.log(`${symbol} mum verileri yüklendi: ${candles.length} mum`);
            }
        }
    });
    
    ws.on('message', async (data) => {
        try {
            const message = JSON.parse(data);
            
            if (message.stream && message.data) {
                const symbol = message.data.s;
                
                if (trackedCoins.includes(symbol)) {
                    // Mum verilerini kontrol et
                    if (!candleData[symbol]) {
                        candleData[symbol] = await fetchCandleData(symbol);
                    }
                    
                    // Verileri kaydet
                    cryptoData[symbol] = {
                        symbol: symbol,
                        price: parseFloat(message.data.c),
                        change24h: parseFloat(message.data.P),
                        volume24h: parseFloat(message.data.v),
                        quoteVolume24h: parseFloat(message.data.q),
                        high24h: parseFloat(message.data.h),
                        low24h: parseFloat(message.data.l),
                        lastUpdate: new Date().toISOString()
                    };
                    
                    // İlk değerleri kaydet
                    if (!initialValues[symbol]) {
                        initialValues[symbol] = {
                            price: parseFloat(message.data.c),
                            change24h: parseFloat(message.data.P),
                            volume24h: parseFloat(message.data.v),
                            quoteVolume24h: parseFloat(message.data.q),
                            timestamp: new Date().toISOString()
                        };
                    }
                    
                    // Alarm kontrolü yap
                    if (candleData[symbol]) {
                        checkAlarmLevels(symbol, cryptoData[symbol], candleData[symbol]);
                    }
                    
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

// İstemcilere veri gönder
function broadcastUpdate(symbol) {
    const data = cryptoData[symbol];
    if (!data) return;
    
    // Mum verilerini de ekle
    const candles = candleData[symbol] || [];
    const liquidity = calculateLiquidityLevels(symbol, candles, data.price);
    const highLow = calculateFourHour20MHighLow(candles);
    const ema50 = calculateFourHourEMA(candles, 50);
    const ema5 = calculateFourHourEMA(candles, 5);
    const ema20 = calculateFourHourEMA(candles, 20);
    const liquidityPercentage = calculateLiquidityPercentage(data.price, liquidity.lowerLiquidity);
    
    const enhancedData = {
        ...data,
        upperLiquidity: liquidity.upperLiquidity,
        lowerLiquidity: liquidity.lowerLiquidity,
        high20M: highLow.high,
        low20M: highLow.low,
        ema50: ema50,
        ema5: ema5,
        ema20: ema20,
        liquidityPercentage: liquidityPercentage,
        volumeRatio: calculateVolumeRatio(data)
    };
    
    const update = {
        type: 'update',
        symbol: symbol,
        data: enhancedData
    };
    
    clientConnections.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(update));
        }
    });
}

function broadcastMessage(message) {
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
    res.json(alarmData);
});

app.get('/api/volume-data', (req, res) => {
    res.json(volumeData);
});

app.get('/api/candles/:symbol', (req, res) => {
    const symbol = req.params.symbol;
    res.json(candleData[symbol] || []);
});

app.get('/api/initial-values', (req, res) => {
    res.json(initialValues);
});

app.get('/api/coins', (req, res) => {
    res.json(trackedCoins);
});

app.delete('/api/alarms', (req, res) => {
    alarmData = [];
    res.json({ success: true });
});

// Ana sayfa
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Alarm sayfası
app.get('/alarm.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'alarm.html'));
});

// Bilgi sayfası
app.get('/bilgi.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'bilgi.html'));
});

// Donchian sayfası
app.get('/donchian.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'donchian.html'));
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
        alarms: alarmData.slice(0, 10),
        volumeData: volumeData
    }));
    
    ws.on('close', () => {
        console.log('İstemci bağlantısı kapandı');
        clientConnections.delete(ws);
    });
    
    ws.on('error', (error) => {
        console.error('İstemci hatası:', error);
    });
});

// Binance'e bağlan
connectToBinance();

// Her 5 dakikada bir mum verilerini yenile
setInterval(async () => {
    console.log('Mum verileri yenileniyor...');
    for (const symbol of trackedCoins) {
        const candles = await fetchCandleData(symbol);
        if (candles) {
            candleData[symbol] = candles;
        }
    }
}, 5 * 60 * 1000);

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
