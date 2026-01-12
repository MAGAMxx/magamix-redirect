const express = require('express');
const rateLimit = require('express-rate-limit');

const app = express();

// ───────────────────────────────────────────────
// Rate Limit: 45 запросов в минуту на один IP
// ───────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 60 * 1000,           // 1 минута
  max: 45,
  message: { error: "Слишком много запросов. Попробуйте позже" },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/sub/', limiter);
app.use('/servers/', limiter);

// Конфигурация
const CONFIG = {
  HAPP_NAME: "MAGAMIX VPN",
  HAPP_LOGO: "https://cdn-icons-png.flaticon.com/512/3067/3067256.png",
  SERVER_LOCATION: "Reality NL Premium",
  SUPPORT_URL: "https://t.me/nejnayatp3",
  WEBSITE: "https://t.me/MAGAMIX_VPN_bot"
};

// Главная страница
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ru">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${CONFIG.HAPP_NAME} • ${CONFIG.SERVER_LOCATION}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 900px;
          margin: 0 auto;
          padding: 30px 20px;
          text-align: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .logo { width: 120px; height: 120px; border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.4); margin-bottom: 24px; }
        h1 { font-size: 2.8rem; margin: 0 0 12px; }
        h2 { font-size: 1.6rem; opacity: 0.9; margin: 0 0 40px; }
        .features {
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(10px);
          padding: 24px;
          border-radius: 20px;
          margin: 30px 0;
          text-align: left;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }
        .btn {
          display: inline-block;
          background: white;
          color: #4f46e5;
          padding: 16px 36px;
          border-radius: 50px;
          text-decoration: none;
          font-weight: bold;
          font-size: 1.2rem;
          margin: 12px;
          box-shadow: 0 8px 20px rgba(0,0,0,0.3);
          transition: all 0.3s;
        }
        .btn:hover { transform: translateY(-4px); box-shadow: 0 12px 30px rgba(0,0,0,0.4); }
      </style>
    </head>
    <body>
      <img src="${CONFIG.HAPP_LOGO}" alt="${CONFIG.HAPP_NAME}" class="logo">
      <h1>${CONFIG.HAPP_NAME}</h1>
      <h2>${CONFIG.SERVER_LOCATION}</h2>

      <div class="features">
        <h3>🚀 Премиум VPN</h3>
        <p>• Максимальная скорость и стабильность</p>
        <p>• Полная анонимность и защита</p>
        <p>• Безлимитный трафик</p>
        <p>• Поддержка 24/7</p>
      </div>

      <p style="font-size: 1.2rem; margin: 40px 0 20px;">Получите подписку через бота:</p>
      <a href="https://t.me/${process.env.BOT_USERNAME || 'MAGAMIX_VPN_bot'}" class="btn">
        📱 Открыть бота
      </a>

      <div style="margin-top: 60px; font-size: 0.95rem; opacity: 0.85;">
        <p>© ${new Date().getFullYear()} ${CONFIG.HAPP_NAME}</p>
        <p>Техподдержка: <a href="${CONFIG.SUPPORT_URL}" style="color: white; text-decoration: none;">${CONFIG.SUPPORT_URL.replace('https://', '')}</a></p>
      </div>
    </body>
    </html>
  `);
});

// ───────────────────────────────────────────────
// /sub/:subId  →  Routing / Global profile для Happ
// ───────────────────────────────────────────────
app.get('/sub/:subId', (req, res) => {
  const subId = (req.params.subId || '').trim();
  console.log(`[SUB] Запрос на subId: "${subId}" (длина: ${subId.length}, тип: ${typeof subId})`);

  try {
    if (!/^[0-9a-fA-F]{12,64}$/.test(subId)) {
      console.log(`[SUB] Invalid format: ${subId}`);
      return res.status(400).json({
        error: "invalid_format",
        message: "subId должен быть hex-строкой длиной минимум 12 символов"
      });
    }

    const now = Date.now();
    const VALIDITY_DAYS = 90;
    const expireTime = now + (VALIDITY_DAYS * 24 * 60 * 60 * 1000);

    const fullConfig = {
      "Name": "MAGAMIX NL 🇳🇱",
      "GlobalProxy": "true",
      "UseChunkFiles": "true",
      "RemoteDNSType": "DoH",
      "RemoteDNSDomain": "https://cloudflare-dns.com/dns-query",
      "RemoteDNSIP": "1.1.1.1",
      "DomesticDNSType": "DoH",
      "DomesticDNSDomain": "",
      "DomesticDNSIP": "",
      "Geoipurl": "https://github.com/Loyalsoldier/v2ray-rules-dat/releases/latest/download/geoip.dat",
      "Geositeurl": "https://github.com/Loyalsoldier/v2ray-rules-dat/releases/latest/download/geosite.dat",
      "LastUpdated": new Date().toISOString(),
      "DnsHosts": {
        "cloudflare-dns.com": "1.1.1.1",
        "dns.google": "8.8.8.8"
      },
      "RouteOrder": "block-proxy-direct",
      "DirectSites": ["geosite:ru", "geosite:geolocation-ru", "geosite:category-ads-all"],
      "DirectIp": ["geoip:ru", "10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16"],
      "ProxySites": [],
      "ProxyIp": [],
      "BlockSites": [],
      "BlockIp": [],
      "DomainStrategy": "IPIfNonMatch",
      "FakeDNS": "false",
      "servers": [
        {
          "id": 1,
          "name": "Нидерланды 🇳🇱",
          "type": "vless",
          "address": "31.130.131.214",
          "port": 2053,
          "uuid": `00000000-0000-0000-0000-${subId.slice(0,12).padEnd(12, '0')}`,
          "security": "reality",
          "sni": "www.bing.com",
          "fp": "chrome",
          "pbk": "P2Q_Uq49DV8iEiwiRxNe0UYKCXL--sp-nU0pihntn30",
          "sid": "9864",
          "flow": "",
          "remark": "MAGAMIX • Premium • NL",
          "expire": expireTime
        }
      ]
    };

    res.set({
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    });

    res.json(fullConfig);
  } catch (err) {
    console.error('[SUB CRASH]', err.stack);
    res.status(500).json({ error: "server_error", message: "Внутренняя ошибка" });
  }
});
// ───────────────────────────────────────────────
// /servers/:subId  →  Список outbound серверов (Reality)
// ───────────────────────────────────────────────
app.get('/servers/:subId', (req, res) => {
  const subId = req.params.subId.trim();

  if (!/^[0-9a-fA-F]{16,64}$/.test(subId)) {
    return res.status(400).json({
      error: "invalid_format",
      message: "subId должен быть hex-строкой длиной 16–64 символа"
    });
  }

  const now = Date.now();
  const VALIDITY_DAYS = 90;
  const expireTime = now + (VALIDITY_DAYS * 24 * 60 * 60 * 1000);

  const servers = [
    {
      "tag": "magamix-reality-nl",
      "type": "vless",
      "server": "31.130.131.214",
      "server_port": 2053,
      "uuid": `00000000-0000-0000-0000-${subId.slice(0, 12).padEnd(12, '0')}`,
      "flow": "",
      "packet_encoding": "xudp",
      "tls": {
        "enabled": true,
        "server_name": "www.bing.com",
        "reality": {
          "enabled": true,
          "public_key": "P2Q_Uq49DV8iEiwiRxNe0UYKCXL--sp-nU0pihntn30",
          "short_id": ["9864"]
        }
      },
      "expire": expireTime,
      "remark": "MAGAMIX • Нидерланды • Premium"
    }
  ];

  res.set({
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'X-Subscription-Expire': expireTime.toString()
  });

  res.json(servers);
});

// Редирект на 3X-UI панель (оставляем на всякий случай)
app.get('/connect/:code', (req, res) => {
  const code = req.params.code;
  res.redirect(302, `https://31.130.131.214:2096/sub/${code}`);
});

// Обёртка для Happ deeplink
app.get('/url', (req, res) => {
  const happUrl = req.query.url;
  if (happUrl && happUrl.startsWith('happ://add/')) {
    res.send(`
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Открытие в Happ</title>
        <style>
          body { font-family: system-ui, sans-serif; text-align:center; padding:60px; background:linear-gradient(135deg, #667eea, #764ba2); color:white; min-height:100vh; display:flex; flex-direction:column; justify-content:center; align-items:center; }
          .logo { width:90px; height:90px; border-radius:20px; margin-bottom:24px; }
          .loader { border:6px solid rgba(255,255,255,0.3); border-top:6px solid white; border-radius:50%; width:60px; height:60px; animation:spin 1.2s linear infinite; margin:40px auto; }
          @keyframes spin { 0% {transform:rotate(0deg);} 100% {transform:rotate(360deg);} }
        </style>
        <script>setTimeout(()=>location.href="${happUrl}",1200);</script>
      </head>
      <body>
        <img src="${CONFIG.HAPP_LOGO}" class="logo" alt="${CONFIG.HAPP_NAME}">
        <h2>Открываем подписку в Happ...</h2>
        <div class="loader"></div>
        <p style="margin-top:40px;">Если не открылось автоматически —<br><a href="${happUrl}" style="color:#ffdd00;">нажмите здесь</a></p>
      </body>
      </html>
    `);
  } else {
    res.status(400).send('Неверный параметр URL');
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: CONFIG.HAPP_NAME,
    timestamp: new Date().toISOString()
  });
});

// 404
app.use((req, res) => {
  res.status(404).send(`
    <!DOCTYPE html>
    <html lang="ru">
    <head>
      <meta charset="UTF-8">
      <title>404 - ${CONFIG.HAPP_NAME}</title>
      <style>body{font-family:system-ui,sans-serif;text-align:center;padding:120px 20px;background:linear-gradient(135deg,#667eea,#764ba2);color:white;}</style>
    </head>
    <body>
      <h1>404 — Страница не найдена</h1>
      <p><a href="/" style="color:#ffdd00;">Вернуться на главную</a></p>
    </body>
    </html>
  `);
});

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 ${CONFIG.HAPP_NAME} запущен на порту ${port}`);
  console.log(`🌐 Домен: ${process.env.RENDER_EXTERNAL_URL || 'http://localhost:' + port}`);
});
