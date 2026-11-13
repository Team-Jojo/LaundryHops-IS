require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { sequelize } = require('./models');

const app = express();

app.use(cors());
app.use(express.json());
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.get('/', (req, res) => {
  res.json({ name: 'LaundryHops API', team: 'Team Jojo', status: 'running' });
});

app.use('/api', routes);

// Unmatched routes → JSON 404
app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

sequelize
  .authenticate()
  .then(() => {
    console.log('[db] PostgreSQL connected');
    app.listen(PORT, () =>
      console.log(`[api] LaundryHops running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error('[db] Unable to connect to PostgreSQL:', err.message);
    app.listen(PORT, () =>
      console.log(`[api] LaundryHops running on http://localhost:${PORT} (DB NOT connected)`)
    );
  });
