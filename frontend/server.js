const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(__dirname));

app.get('/health', (req, res) => {
  res.status(200).send('ok');
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'login.html'));
});

app.get('*', (req, res) => {
  const filePath = path.join(__dirname, req.path);

  if (req.path.startsWith('/api')) {
    return res.status(404).send('Not found');
  }

  res.sendFile(path.join(__dirname, 'pages', 'login.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Frontend server running on port ${port}`);
});