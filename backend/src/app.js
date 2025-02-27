const path = require('path');
const express = require('express');
const cors = require('cors');
const pdfRoutes = require('./routes/pdfRoutes');

const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

app.use(express.static('/html'));
app.use((req, res, next) => {
  if (req.method === "GET" && !req.url.startsWith("/api")) {
    return res.sendFile("/html/index.html");
  }
  next();
});

app.use('/api', pdfRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
