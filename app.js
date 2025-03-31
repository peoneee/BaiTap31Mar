var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var cors = require('cors');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// ✅ Cấu hình CORS cho tất cả phương thức
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

// ✅ Kết nối MongoDB + xử lý lỗi
mongoose.connect("mongodb://localhost:27017/C2", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// ✅ Middleware
app.use(logger('dev'));
app.use(express.json());  // Cho phép xử lý JSON
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser('NNPTUD'));
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Routes
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/menus', require('./routes/menus'));
app.use('/roles', require('./routes/roles'));
app.use('/auth', require('./routes/auth'));
app.use('/products', require('./routes/products'));
app.use('/categories', require('./routes/categories'));

// ✅ Xử lý lỗi 404
app.use(function (req, res, next) {
  next(createError(404));
});

// ✅ Xử lý lỗi chung
app.use(function (err, req, res, next) {
  res.status(err.status || 500).send({
    success: false,
    message: err.message
  });
});

module.exports = app;
