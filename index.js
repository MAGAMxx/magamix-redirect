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
        /* ... ваш существующий CSS ... */
      </style>
    </head>
    <body>
      <img src="${CONFIG.HAPP_LOGO}" alt="${CONFIG.HAPP_NAME}" class="logo">
      <h1>${CONFIG.HAPP_NAME}</h1>
      <h2>${CONFIG.SERVER_LOCATION}</h2>
      <!-- ... остальной HTML ... -->
    </body>
    </html>
  `);
});

// Endpoint для подписок Happ
app.get('/sub/:subId', (req, res) => {
  const subId = req.params.subId;
  
  // Создаем конфигурацию
  const config = {
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
  };

  // Устанавливаем правильные заголовки для Happ
  res.set({
    'Content-Type': 'application/json; charset=utf-8',
    'X-Subscription-Name': CONFIG.HAPP_NAME,
    'X-Subscription-Logo': CONFIG.HAPP_LOGO,
    'X-Provider': CONFIG.HAPP_NAME,
    'Access-Control-Allow-Origin': '*'
  });

  res.json(config);
});

// Редирект на 3X-UI панель (старый функционал)
app.get('/connect/:code', (req, res) => {
  const code = req.params.code;
  res.redirect(302, `https://31.130.131.214:2096/sub/${code}`);
});

// Обёртка для Happ deeplink
app.get('/url', (req, res) => {
  const happUrl = req.query.url;
  
  if (happUrl && happUrl.startsWith('happ://add/')) {
    // Возвращаем HTML страницу с редиректом
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${CONFIG.HAPP_NAME} - Открытие в Happ</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body {
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 50px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
          }
          .logo {
            width: 80px;
            height: 80px;
            margin-bottom: 20px;
            border-radius: 15px;
          }
          .loader {
            border: 5px solid rgba(255,255,255,0.3);
            border-top: 5px solid white;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
            margin: 30px auto;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
        <script>
          setTimeout(function() {
            window.location.href = "${happUrl}";
          }, 1000);
        </script>
      </head>
      <body>
        <img src="${CONFIG.HAPP_LOGO}" alt="${CONFIG.HAPP_NAME}" class="logo">
        <h1>${CONFIG.HAPP_NAME}</h1>
        <p>Открытие подписки в Happ...</p>
        <div class="loader"></div>
        <p style="margin-top: 30px; font-size: 0.9rem;">
          Если приложение не открылось автоматически,<br>
          нажмите <a href="${happUrl}" style="color: #ffdd00;">здесь</a>
        </p>
      </body>
      </html>
    `);
  } else {
    res.status(400).send('Bad Request: Missing or invalid URL parameter');
  }
});

// Health check для Render
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: CONFIG.HAPP_NAME,
    timestamp: new Date().toISOString()
  });
});

// 404 обработчик
app.use((req, res) => {
  res.status(404).send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>404 - ${CONFIG.HAPP_NAME}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          text-align: center;
          padding: 100px 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        a {
          color: #ffdd00;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <h1>404 - Страница не найдена</h1>
      <p>Вернитесь на <a href="/">главную страницу</a></p>
    </body>
    </html>
  `);
});

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`
  🚀 ${CONFIG.HAPP_NAME} запущен на порту ${port}
  📍 ${CONFIG.SERVER_LOCATION}
  🌐 Домен: ${process.env.RENDER_EXTERNAL_URL || 'http://localhost:' + port}
  `);
});
