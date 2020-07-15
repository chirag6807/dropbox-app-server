var createError = require('http-errors');
var express = require('express');
var cors = require('cors')
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var loginRouter = require('./routes/login');
var fileStoreRouter = require('./routes/filestore');
var usersRouter = require('./routes/users');
var customersRouter = require('./routes/customer');
var casesRouter = require('./routes/case');
var todoRouter = require('./routes/todo');
global.config = require('./config/config');

var app = express();
let http = require('http');
// let server = http.Server(app);
// let socketIO = require('socket.io');
// let io = socketIO(server);

var server = app.listen(4000)
var io = require('socket.io').listen(server);

app.use(cors())
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

app.use(express.json({limit: '100mb'}));
app.use(express.urlencoded({limit: '100mb',extended: true }));


app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/login', loginRouter);
app.use('/filestore', fileStoreRouter);

app.use('/users', usersRouter);
app.use('/customer', customersRouter);
app.use('/case', casesRouter);
app.use('/todo', todoRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
