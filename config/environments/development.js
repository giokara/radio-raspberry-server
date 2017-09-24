'use strict'
const fs = require('fs');

module.exports = {
  
  port: 3000,
  hostname: '127.0.0.1',
  baseUrl: 'http://localhost:3000',
  app: {
    name: 'Raspberry MPC HTTP endpoint'
  },
  version: '1.0.0',
//   sslOptions: {
// 	key  : fs.readFileSync('quotation.thrinno.key'),
// 	cert : fs.readFileSync('quotation.thrinno.crt'),
// 	ca: [fs.readFileSync('gd_bundle-g2-g1.crt')]
//   }
};
