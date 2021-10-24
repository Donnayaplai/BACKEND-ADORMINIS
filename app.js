const express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');

// var indexRouter = require('./routes/index');

const app = express();
const corsOptions = {
  origin: '*',
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// const router = require('./routes/index');
// app.use('/api', router);

// Room
const roomRouter = require('./routes/room');
app.use('/api/room', roomRouter);

// Building
const buildingRouter = require('./routes/building');
app.use('/api/building', buildingRouter);

// User
const userRouter = require('./routes/user');
app.use('/api/user', userRouter);

// Dorm
const dormRouter = require('./routes/dorm');
app.use('/dorm', dormRouter);

// Setting
const settingRouter = require('./routes/setting');
app.use('/setting', settingRouter);

// Calculate
const calculateRouter = require('./routes/calculateUtility');
app.use('/calculate', calculateRouter);

// Invoice
const invoiceRouter = require('./routes/invoice');
app.use('/invoice', invoiceRouter);

// Test data formats
app.use('/testja', (req, res) => {
  const { roomTypes } = req.body;

  console.log(roomTypes);
});

app.get('/', (req, res) => {
  res.json({
    message: 'API Running',
  });
});

// app.use('/', indexRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
