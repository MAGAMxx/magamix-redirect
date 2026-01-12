const express = require('express');
const axios = require('axios');
const app = express();

const CONFIG = {
  HAPP_NAME: "MAGAMIX VPN",
  PANEL_IP: "31.130.131.214",
  WEBSITE: "t.me/MAGAMIX_VPN_bot"
};

// 1. Исправленный эндпоинт для редиректа (убираем чувствительность к слэшу)
app.get('/url', (req, res) => {
  const targetUrl = req.query.url;
  
  if (!targetUrl) {
    return res.status(400).send('Ошибка: Не передан параметр url');
  }

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Запуск ${CONFIG.HAPP_NAME}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <script>
        window.onload = function() {
          // Выполняем переход в HAPP
          window.location.href = "${targetUrl}";
          // Если через 3 секунды ничего не произошло, возвращаем в бота
          setTimeout(function() {
            window.location.href = "${CONFIG.WEBSITE}";
          }, 3000);
        };
      </script>
    </head>
    <body style="background:#1a1a1a; color:white; display:flex; justify-content:center; align-items:center; height:100vh; font-family:sans-serif;">
      <div style="text-align:center;">
        <h2>Открываем ${CONFIG.HAPP_NAME}...</h2>
        <p>Пожалуйста, подождите</p>
      </div>
    </body>
    </html>
  `);
});

// 2. Исправленный эндпоинт для подписки (чтобы HAPP видел ИМЯ)
app.get('/sub/:subId', async (req, res) => {
  try {
    const { subId } = req.params;
    const panelUrl = `http://${CONFIG.PANEL_IP}:2096/sub/${subId}`;
    
    const response = await axios.get(panelUrl, { responseType: 'text' });

    res.set({
      'Content-Type': 'text/plain; charset=utf-8',
      'profile-title': CONFIG.HAPP_NAME, // Для корректного имени в 2026 году
      'subscription-userinfo': response.headers['subscription-userinfo'] || '',
      'Access-Control-Allow-Origin': '*'
    });

    // Отдаем имя первой строкой
    res.send(`#profile-title: ${CONFIG.HAPP_NAME}\n${response.data}`);
  } catch (error) {
    console.error('Ошибка панели:', error.message);
    res.status(404).send('Подписка не найдена или сервер недоступен');
  }
});

// Заглушка для главной
app.get('/', (req, res) => res.send('MAGAMIX Redirect Service is Active'));

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => console.log(`Сервер запущен на порту ${port}`));
