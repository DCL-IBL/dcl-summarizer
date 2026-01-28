const path = require('path');
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/apiRoutes');
const authRoutes = require('./routes/authRoutes');
const expressLayouts = require('express-ejs-layouts');
const document_model = require('./models/document_model');
const query_model = require('./models/query_model')
const { statusEmitter } = require('./app_events');

const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

/*app.use((req, res, next) => {
  if (req.method === "GET" && !req.url.startsWith("/api")) {
    return res.sendFile("/html/index.html");
  }
  next();
});*/

app.set('trust proxy', 1);  // Trust first proxy (Nginx)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(expressLayouts);
app.set('layout','layouts/main.ejs');

app.get('/dashboard/:token', authRoutes.authJwtAsParam, async (req, res, next) => {
  const profile = {};
  const userDocs = await document_model.getUserDocs(req.userId);
  const userQueries = await query_model.getUserQueries(req.userId);
  //console.log(userDocs);

  res.render('pages/dashboard',{
    title:"DCL Summarizer Dashboard",
    userDocs,
    userQueries
    //profile
  });
  next();
});

app.use('/dashboard/:token/api', authRoutes.authJwtAsParam, apiRoutes);
app.use('/auth',authRoutes.router);

app.get('/dashboard/:token/events', authRoutes.authJwtAsParam, (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  // Send initial heartbeat
  res.write('event: heartbeat \n data: {}\n\n');

  const handleUpdate = (payload) => {
    if (payload.user_id === req.userId) {
      const json = JSON.stringify(payload);
      res.write(`data: ${json}\n\n`);
    }
  }

  statusEmitter.on('status-update', handleUpdate);

  // Cleanup on disconnect
  req.on('close', () => {
    statusEmitter.off('status-update', handleUpdate);
    res.end();
  });

  // Heartbeat every 30s to keep connection alive
  const heartbeat = setInterval(() => {
    if (!res.writableEnded) {
      res.write(': heartbeat\n\n');
    }
  }, 30000);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
