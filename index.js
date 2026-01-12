const express = require('express');
const app = express();

app.get('/connect/:code', (req, res) => {
  const code = req.params.code;
  res.redirect(302, `https://31.130.131.214:2096/sub/${code}`);  // ← https + порт 2096
});

app.get('/', (req, res) => {
  res.send('OK - Redirect работает! Используй /connect/твой_sub_id');
});

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Запущен на ${port}`);
});
