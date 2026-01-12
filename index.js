const express = require('express');
const app = express();

// Конфигурация
const CONFIG = {
  HAPP_NAME: "MAGAMIX VPN",
  HAPP_LOGO: "https://cdn-icons-png.flaticon.com/512/3067/3067256.png",
  SERVER_LOCATION: "🇳🇱Нидерландия",
  SUPPORT_URL: "https://t.me/MAGAMIX_support",
  WEBSITE: "https://t.me/MAGAMIX_VPN_bot"
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
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          text-align: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        .logo {
          width: 100px;
          height: 100px;
          margin-bottom: 20px;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
        h1 {
          font-size: 2.5rem;
          margin: 10px 0;
        }
        h2 {
          font-size: 1.5rem;
          opacity: 0.9;
          margin-bottom: 30px;
        }
        .info {
          background: rgba(255,255,255,0.1);
          padding: 20px;
          border-radius: 15px;
          margin: 20px 0;
          text-align: left;
        }
        .btn {
          display: inline-block;
          background: white;
          color: #667eea;
          padding: 15px 30px;
          border-radius: 50px;
          text-decoration: none;
          font-weight: bold;
          margin: 10px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.2);
          transition: transform 0.3s;
        }
        .btn:hover {
          transform: translateY(-3px);
        }
      </style>
    </head>
    <body>
      <img src="${CONFIG.HAPP_LOGO}" alt="${CONFIG.HAPP_NAME}" class="logo">
      <h1>${CONFIG.HAPP_NAME}</h1>
      <h2>${CONFIG.SERVER_LOCATION}</h2>
     
      <div class="info">
        <h3>🚀 Premium VPN Service</h3>
        <p>• Высокая скорость и стабильность</p>
        <p>• Полная анонимность и безопасность</p>
        <p>• Неограниченный трафик</p>
        <p>• Поддержка 24/7</p>
      </div>
     
      <p>Используйте бота для получения подписки:</p>
      <a href="https://t.me/${process.env.BOT_USERNAME || 'MAGAMIX_VPN_bot'}" class="btn">
        📱 Открыть Telegram бота
      </a>
     
      <div style="margin-top: 40px; font-size: 0.9rem; opacity: 0.8;">
        <p>© ${new Date().getFullYear()} ${CONFIG.HAPP_NAME}</p>
        <p>Техподдержка: <a href="${CONFIG.SUPPORT_URL}" style="color: white;">${CONFIG.SUPPORT_URL}</a></p>
      </div>
    </body>
    </html>
  `);
});


const axios = require('axios');

app.get('/sub/:subId', async (req, res) => {
  try {
    const subId = req.params.subId;
    
    // Запрашиваем данные напрямую из вашей панели 3x-UI
    const panelUrl = `31.130.131.214{subId}`;
    const response = await fetch(panelUrl);

    if (!response.ok) {
      throw new Error(`Панель ответила кодом: ${response.status}`);
    }

    const vpnLinks = await response.text();

    // Устанавливаем заголовки для HAPP, чтобы отображалось имя
    res.set({
      'Content-Type': 'text/plain; charset=utf-8',
      'profile-title': CONFIG.HAPP_NAME,
      'X-Subscription-Name': CONFIG.HAPP_NAME,
      'Subscription-Userinfo': response.headers.get('subscription-userinfo') || '',
      'Access-Control-Allow-Origin': '*'
    });

    // Формируем ответ: метка с именем + сами конфиги
    // Это гарантирует отображение "MAGAMIX VPN" вместо домена
    const finalResponse = `#profile-title: ${CONFIG.HAPP_NAME}\n${vpnLinks}`;

    res.send(finalResponse);

  } catch (error) {
    console.error('Ошибка:', error.message);
    res.status(500).send('Ошибка при получении подписки');
  }
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
        <title>MAGAMIX VPN - Открытие в Happ</title>
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
