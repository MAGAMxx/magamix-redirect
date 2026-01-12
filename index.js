const express = require('express');
const { randomUUID } = require('crypto');
const app = express();
const PORT = process.env.PORT || 3000;

// Конфигурация VPN
const CONFIG = {
  HAPP_NAME: "MAGAMIX VPN",
  HAPP_LOGO: "https://cdn-icons-png.flaticon.com/512/3067/3067256.png",
  SERVER_LOCATION: "Нидерланды",
  SERVER_ADDRESS: "31.130.131.214",
  SERVER_PORT: 2096,
  SUPPORT_URL: "https://t.me/MAGAMIX_support",
  WEBSITE: "https://t.me/MAGAMIX_VPN_bot",
  REALITY_HOST: "yourdomain.com", // замените на ваш домен/сервер
  REALITY_SNI: "yourdomain.com"   // то же, что host
};

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${CONFIG.HAPP_NAME}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { font-family: Arial; text-align: center; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
        .btn { display:inline-block; background:white; color:#667eea; padding:15px 30px; border-radius:50px; text-decoration:none; font-weight:bold; margin:10px;}
      </style>
    </head>
    <body>
      <h1>${CONFIG.HAPP_NAME}</h1>
      <p>Используйте Telegram бота для подписки:</p>
      <a href="https://t.me/${process.env.BOT_USERNAME || 'your_bot'}" class="btn">📱 Открыть бот</a>
    </body>
    </html>
  `);
});

const subscriptions = {};

app.get('/sub/:subId', (req, res) => {
  const subId = req.params.subId;
  const now = Date.now();

  if (!subscriptions[subId]) {
    subscriptions[subId] = {
      uuid: randomUUID(),
      created: now,
      expire: now + 30*24*60*60*1000
    };
  }

  const sub = subscriptions[subId];

  const response = {
    name: CONFIG.HAPP_NAME,
    logo: CONFIG.HAPP_LOGO,
    version: "1.0",
    subscription: {
      id: subId,
      name: CONFIG.HAPP_NAME,
      created: sub.created,
      updated: now,
      expire: sub.expire,
      time_left: sub.expire - now,
      info: `${CONFIG.SERVER_LOCATION} | Premium`
    },
    servers: [
      {
        id: "1",
        name: CONFIG.SERVER_LOCATION,
        type: "vless",
        address: CONFIG.SERVER_ADDRESS,
        port: CONFIG.SERVER_PORT,
        uuid: sub.uuid,
        security: "reality",
        remark: CONFIG.SERVER_LOCATION,
        flow: "xtls-rprx-vision",
        host: CONFIG.REALITY_HOST,
        sni: CONFIG.REALITY_SNI,
        xver: 0,
        fp: "chrome"
      }
    ],
    metadata: {
      provider: CONFIG.HAPP_NAME,
      support: CONFIG.SUPPORT_URL,
      website: CONFIG.WEBSITE,
      version: "1.0"
    }
  };

  res.set({
    'Content-Type': 'application/json; charset=utf-8',
    'X-Subscription-Name': CONFIG.HAPP_NAME,
    'X-Subscription-Logo': CONFIG.HAPP_LOGO,
    'X-Provider': CONFIG.HAPP_NAME,
    'Access-Control-Allow-Origin': '*'
  });

  res.json(response);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 ${CONFIG.HAPP_NAME} запущен на порту ${PORT}`);
});
