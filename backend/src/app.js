const path = require('path');
const express = require('express');
const cors = require('cors');
const pdfRoutes = require('./routes/pdfRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());


app.use(express.static('/html'));

/*app.use((req, res, next) => {
  if (req.method === "GET" && !req.url.startsWith("/api")) {
    return res.sendFile("/html/index.html");
  }
  next();
});*/

app.set('trust proxy', 1);  // Trust first proxy (Nginx)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/dashboard/:token', authRoutes.authJwtAsParam, (req, res) => {
  const pastQueries = {};//await ragRepo.getUserQueries(req.session.userId, { limit: 20 });
  const profile = {};//await profileRepo.getUserProfile(req.session.userId);

  res.render('pages/dashboard', {
    //pastQueries,
    //profile
  });
});

app.use('/api', pdfRoutes);
app.use('/auth',authRoutes.router);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
