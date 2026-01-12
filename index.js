const express = require('express');
const rateLimit = require('express-rate-limit');
const fetch = require('node-fetch'); // Обязательно добавь в package.json: "node-fetch": "^2.6.7"

const app = express();

// Rate Limit — защита от спама
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 минута
  max: 45,
  message: { error: "Слишком много запросов. Попробуйте позже" },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/sub/', limiter);

// Конфигурация
const CONFIG = {
  HAPP_NAME: "MAGAMIX VPN",
  HAPP_LOGO: "https://cdn-icons-png.flaticon.com/512/3067/3067256.png",
  SERVER_LOCATION: "Reality NL Premium",
  SUPPORT_URL: "https://t.me/nejnayatp3",
  WEBSITE: "https://t.me/MAGAMIX_VPN_bot"
};

// Главная страница (оставлена как была)
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ru">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${CONFIG.HAPP_NAME} • ${CONFIG.SERVER_LOCATION}</title>
      <style>
        body { font-family: system-ui, sans-serif; max-width:900px; margin:0 auto; padding:30px 20px; text-align:center; background:linear-gradient(135deg,#667eea,#764ba2); color:white; min-height:100vh; display:flex; flex-direction:column; justify-content:center; }
        .logo { width:120px; height:120px; border-radius:24px; box-shadow:0 10px 30px rgba(0,0,0,0.4); margin-bottom:24px; }
        h1 { font-size:2.8rem; margin:0 0 12px; }
        h2 { font-size:1.6rem; opacity:0.9; margin:0 0 40px; }
        .features { background:rgba(255,255,255,0.15); backdrop-filter:blur(10px); padding:24px; border-radius:20px; margin:30px 0; text-align:left; max-width:600px; margin-left:auto; margin-right:auto; }
        .btn { display:inline-block; background:white; color:#4f46e5; padding:16px 36px; border-radius:50px; text-decoration:none; font-weight:bold; font-size:1.2rem; margin:12px; box-shadow:0 8px 20px rgba(0,0,0,0.3); transition:all 0.3s; }
        .btn:hover { transform:translateY(-4px); box-shadow:0 12px 30px rgba(0,0,0,0.4); }
      </style>
    </head>
    <body>
      <img src="${CONFIG.HAPP_LOGO}" class="logo" alt="${CONFIG.HAPP_NAME}">
      <h1>${CONFIG.HAPP_NAME}</h1>
      <h2>${CONFIG.SERVER_LOCATION}</h2>
      <div class="features">
        <h3>🚀 Премиум VPN</h3>
        <p>• Максимальная скорость и стабильность</p>
        <p>• Полная анонимность и защита</p>
        <p>• Безлимитный трафик</p>
        <p>• Поддержка 24/7</p>
      </div>
      <p style="font-size:1.2rem; margin:40px 0 20px;">Получите подписку через бота:</p>
      <a href="https://t.me/${process.env.BOT_USERNAME || 'MAGAMIX_VPN_bot'}" class="btn">📱 Открыть бота</a>
      <div style="margin-top:60px; font-size:0.95rem; opacity:0.85;">
        <p>© ${new Date().getFullYear()} ${CONFIG.HAPP_NAME}</p>
        <p>Техподдержка: <a href="${CONFIG.SUPPORT_URL}" style="color:white; text-decoration:none;">${CONFIG.SUPPORT_URL.replace('https://','')}</a></p>
      </div>
    </body>
    </html>
  `);
});

// Главный эндпоинт подписки — plain text + РЕАЛЬНЫЙ UUID из Flask API
app.get('/sub/:subId', async (req, res) => {
  const subId = (req.params.subId || '').trim();

  console.log(`[SUB] Запрос подписки: subId="${subId}" (длина=${subId.length})`);

  // Минимальная защита
  if (subId.length < 8 || !/^[0-9a-fA-F]+$/.test(subId)) {
    return res.status(400).send('Invalid subscription ID');
  }

  try {
    // Запрос реального UUID из твоего Flask API
    // Если бот на Render — замени на https://твой-бот.onrender.com/get_uuid
    // Если бот локально или на другом сервере — укажи его публичный URL
    const apiUrl = `http://localhost:8000/get_uuid?sub_id=${subId}`; // ← для теста локально
    // const apiUrl = `https://твой-бот.onrender.com/get_uuid?sub_id=${subId}`; // ← для продакшена

    const response = await fetch(apiUrl);
    const data = await response.json();

    let realUuid = "00000000-0000-0000-0000-000000000000"; // fallback на случай ошибки API
    if (!data.error && data.uuid) {
      realUuid = data.uuid;
    } else {
      console.error('Не удалось получить UUID из API:', data.error || 'Нет ответа');
    }

    // Заглушка на срок (90 дней) — потом заменишь на реальный из базы
    const now = new Date();
    const expireDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    const expireFormatted = expireDate.toISOString().split('T')[0];

    const username = `MAGAMIX_${subId.slice(0, 8)}`;

    // VLESS-ссылка с РЕАЛЬНЫМ UUID
    const vlessLink = `vless://${realUuid}@31.130.131.214:2053?type=tcp&security=reality&sni=www.bing.com&fp=chrome&pbk=P2Q_Uq49DV8iEiwiRxNe0UYKCXL--sp-nU0pihntn30&sid=9864&flow=#Нидерланды%20MAGAMIX`;

    const textResponse = `
MAGAMIX NL Premium 🇳🇱

Username: ${username}
Status: active
Traffic: Unlimited
Expiration: ${expireFormatted} (90 дней)

Remark: Нидерланды MAGAMIX Premium
Location: Netherlands

VLESS Link:
${vlessLink}

Скопируй ссылку выше и добавь в Happ.
    `.trim();

    res.set({
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    });

    res.send(textResponse);
  } catch (err) {
    console.error('[SUB ERROR]', err.message);
    res.status(500).send('Server error');
  }
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
          body { font-family:system-ui,sans-serif; text-align:center; padding:60px; background:linear-gradient(135deg,#667eea,#764ba2); color:white; min-height:100vh; display:flex; flex-direction:column; justify-content:center; align-items:center; }
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
