const express = require('express');
const axios = require('axios'); // Не забудьте axios в package.json
const app = express();

const CONFIG = {
  HAPP_NAME: "MAGAMIX VPN 🇳🇱",
  PANEL_IP: "31.130.131.214",
  SUB_PORT: "2096",
  BOT_URL: "t.me"
};

// Эндпоинт для подписки (чтобы HAPP видел ИМЯ)
app.get('/sub/:subId', async (req, res) => {
  try {
    const { subId } = req.params;
    // Тянем данные из 3X-UI по порту 2096
    const response = await axios.get(`http://${CONFIG.PANEL_IP}:${CONFIG.SUB_PORT}/sub/${subId}`, { 
      responseType: 'text',
      timeout: 5000 
    });

    res.set({
      'Content-Type': 'text/plain; charset=utf-8',
      'profile-title': CONFIG.HAPP_NAME,
      'subscription-userinfo': response.headers['subscription-userinfo'] || '',
      'Access-Control-Allow-Origin': '*'
    });

    // Отдаем имя первой строкой + конфиги
    res.send(`#profile-title: ${CONFIG.HAPP_NAME}\n${response.data}`);
  } catch (e) {
    res.status(404).send('Subscription Error');
  }
});

// Эндпоинт для редиректа в 1 клик
app.get('/url', (req, res) => {
  const { url } = req.query;
  if (!url) return res.redirect(CONFIG.BOT_URL);

  res.send(`
    <html>
      <body style="background:#000;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;">
        <script>
          window.onload = () => {
            window.location.href = "${url}";
            setTimeout(() => { window.location.href = "${CONFIG.BOT_URL}"; }, 3000);
          };
        </script>
        <div style="text-align:center;">
          <img src="cdn-icons-png.flaticon.com" width="80">
          <h2>Открываем MAGAMIX VPN...</h2>
        </div>
      </body>
    </html>
  `);
});

app.get('/', (req, res) => res.send('MAGAMIX Active'));
app.listen(process.env.PORT || 3000);
