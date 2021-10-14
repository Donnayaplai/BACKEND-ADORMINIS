const express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');

// var indexRouter = require('./routes/index');

const app = express();
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// const router = require('./routes/index');
// app.use('/api', router);

//Room
const roomRouter = require('./routes/room');
app.use('/api/room', roomRouter);

//building
const buildingRouter = require('./routes/building');
app.use('/api/building', buildingRouter);

//User
const userRouter = require('./routes/user');
app.use('/api/user', userRouter);

//Dorm
const dormSettingRouter = require('./routes/dormSetting');
app.use('/setting', dormSettingRouter);

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
