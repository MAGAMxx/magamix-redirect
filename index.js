const express = require('express');
const app = express();

// Конфигурация
const CONFIG = {
  HAPP_NAME: "MAGAMIX VPN 🇳🇱",
  HAPP_LOGO: "https://cdn-icons-png.flaticon.com/512/3067/3067256.png",
  SERVER_LOCATION: "Нидерланды 🇳🇱",
  SUPPORT_URL: "https://t.me/nejnayatp3",
  WEBSITE: "https://t.me/your_bot_username"
};

// Главная страница
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${CONFIG.HAPP_NAME} - ${CONFIG.SERVER_LOCATION}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body {
          font-family: Arial, sans-serif;
          text-align: center;
          padding: 50px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        .logo {
          width: 100px;
          height: 100px;
          border-radius: 20px;
          margin-bottom: 20px;
        }
        h1 {
          margin: 10px 0;
        }
        .btn {
          display: inline-block;
          background: white;
          color: #667eea;
          padding: 15px 30px;
          border-radius: 50px;
          text-decoration: none;
          font-weight: bold;
          margin: 20px 10px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
      </style>
    </head>
    <body>
      <img src="${CONFIG.HAPP_LOGO}" class="logo" alt="Logo">
      <h1>${CONFIG.HAPP_NAME}</h1>
      <h2>${CONFIG.SERVER_LOCATION}</h2>
      <p>VPN Subscription Service</p>
      <a href="${CONFIG.SUPPORT_URL}" class="btn">📞 Поддержка</a>
    </body>
    </html>
  `);
});

// Endpoint для подписок Happ
app.get('/sub/:subId', (req, res) => {
  const subId = req.params.subId;
  
  // Устанавливаем правильные заголовки
  res.set({
    'Content-Type': 'application/json; charset=utf-8',
    'X-Subscription-Name': CONFIG.HAPP_NAME,
    'X-Subscription-Logo': CONFIG.HAPP_LOGO,
    'X-Provider': CONFIG.HAPP_NAME,
    'Access-Control-Allow-Origin': '*'
  });

  // Возвращаем конфигурацию
  res.json({
    name: CONFIG.HAPP_NAME,
    logo: CONFIG.HAPP_LOGO,
    version: "1.0",
    subscription: {
      id: subId,
      name: CONFIG.HAPP_NAME,
      expire: Date.now() + (30 * 24 * 60 * 60 * 1000),
      time_left: 30 * 24 * 60 * 60 * 1000,
      created: Date.now(),
      updated: Date.now(),
      info: CONFIG.SERVER_LOCATION
    },
    metadata: {
      provider: CONFIG.HAPP_NAME,
      support: CONFIG.SUPPORT_URL,
      website: CONFIG.WEBSITE,
      version: "1.0"
    }
  });
});

// Редирект на 3X-UI панель
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
      <html>
      <head>
        <title>${CONFIG.HAPP_NAME}</title>
        <meta http-equiv="refresh" content="0; url=${happUrl}">
      </head>
      <body>
        <script>
          window.location.href = "${happUrl}";
        </script>
      </body>
      </html>
    `);
  } else {
    res.status(400).send('Bad Request');
  }
});

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Сервер запущен на порту ${port}`);
});
