const express = require('express');
const app = express();

// Простой редирект на подписку
app.get('/connect/:code', (req, res) => {
  const code = req.params.code;
  res.redirect(302, `https://31.130.131.214:2096/sub/${code}`);
});

// Обёртка для Happ deeplink (как у конкурентов)
app.get('/url', (req, res) => {
  const happUrl = req.query.url;  // ?url=happ://add/...
  if (happUrl && happUrl.startsWith('happ://add/')) {
    res.redirect(302, happUrl);  // редирект на happ://
  } else {
    res.status(400).send('Bad Request');
  }
});

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Сервер на ${port}`);
});
