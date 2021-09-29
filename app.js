const express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const db = require('./config/dbConnection');
var indexRouter = require('./routes/index');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.json({
    message: 'API Running',
  });
});

app.use('/', indexRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
