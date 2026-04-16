require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-app.vercel.app'
  ],
  credentials: true
}));

app.use(bodyParser.json());


// ✅ PUT THIS HERE (VERY TOP)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});


// Routes
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/assets',       require('./routes/assets'));
app.use('/api/purchases',    require('./routes/purchases'));
app.use('/api/transfers',    require('./routes/transfers'));
app.use('/api/assignments',  require('./routes/assignments'));
app.use('/api/expenditures', require('./routes/expenditures'));


// Root
app.get('/', (req, res) => {
  res.send('Backend is running 🚀');
});


// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});