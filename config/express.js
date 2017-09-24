'use strict';

var path = require('path');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var expressValidator = require('express-validator');
var helmet = require('helmet');
var config = require('./index');

module.exports.init = function (app) {
  var env = app.get('env');
  var root = app.get('root');

  //common express configs
  app.use(expressValidator());
  app.use(bodyParser.urlencoded({ limit: '2mb', extended: true }));
  app.use(bodyParser.json({ limit: '2mb' }));
  app.use(methodOverride());
  app.disable('x-powered-by');

  var sessionOpts = {
    secret: 'On#MustNotGiv3S#cretsAwAy!2any1',
    key: 'skey.sid',
    resave: false,
    saveUninitialized: true
  };
  
  app.use(function (req, res, next) {
    res.locals.app = config.app;
    res.locals.version = config.version;
    res.locals.root = root;

    next();
  });

  // Extra security headers
  app.use(helmet());
  
};
