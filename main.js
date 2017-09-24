'use strict';

const https = require('https');
const http = require('http');
var express = require('express');
var config = require('./config');
var child_process = require('child_process');
var sudo = require('sudo');
var app = express();

var server;
// Workers can share any TCP connection
// In this case it is an HTTP server
// Get environment or set default environment to development
var ENV = process.env.NODE_ENV || 'development';
var DEFAULT_PORT = 3000;
var DEFAULT_HOSTNAME = '127.0.0.1';

// Set express variables
app.set('config', config);
app.set('root', __dirname);
app.set('env', ENV);

require('./config/express').init(app);

// server = https.createServer(config.sslOptions, app);
server = http.createServer(app);
server.listen(
    config.port || DEFAULT_PORT,
    config.hostname || DEFAULT_HOSTNAME,
    function() {
        console.log(config.app.name + ' is running');
        console.log('   listening on port: ' + config.port);
        console.log('   environment: ' + ENV.toLowerCase());

    }
);

app.get('/volume/:vol(\\d+)', function(req, res, next){
    var resvar = res;
    var vol = req.params.vol;
    if(vol < 0)
        vol = 0;
    if(vol > 100)
        vol = 100;
    console.log("changing volume to: " + vol)
    var volchangecmd = child_process.spawn('/usr/bin/amixer', ["cset", "numid=1", "--", vol+"%"]);
    volchangecmd.on("close", function(code, signal) {
        if(!code) // normal exit
            resvar.end();
        else
            resvar.json({"error": "Volume change exited with code " + code})
    })
})
app.get('/channels/:channel(\\d+)', function(req, res, next){
    var resvar = res;
    var channel = req.params.channel;
    var channelchangecmd = child_process.spawn('/usr/bin/mpc', ["play", channel]);
    channelchangecmd.on("close", function(code, signal) {
        if(!code) // normal exit
            resvar.end();
        else
            resvar.json({"error": "Channel change exited with code " + code})
    })
})
app.get('/channels/stop', function(req, res, next){
    var resvar = res;
    var channelstopcmd = child_process.spawn('/usr/bin/mpc', ["stop"]);
    channelstopcmd.on("close", function (code, signal) {
        if(!code) // normal exit
            resvar.end();
        else
            resvar.json({"error": "Channel stop exited with code " + code})
    })
})
app.get('/channels/kill', function(req, res, next){
    var resvar = res;
    var channelkillcmd = sudo(["/bin/fuser", "-k", "6600/tcp"]);
    channelkillcmd.on("close", function(code, signal) {
        if(!code) // normal exit
            resvar.end();
        else
            resvar.json({"error": "Channel stop exited with code " + code})
    })
})
app.get('/channels', function(req, res, next) {
    var resvar = res;
    var channellistcmd = child_process.spawn("/usr/bin/mpc", ["playlist", "-f", '"%position%;%name%;%file%"']);
    var mychannels = "";
    channellistcmd.stdout.on("data", function(data) {
        mychannels += data;
    })
    channellistcmd.on("close", function(code, signal) {
        if(!code) {
            var channellist = mychannels.split(/\r?\n/);
            var channels = [];
            channellist.forEach(function(ch) {
                var channelparams = ch.split(/\r?;/);
                var newchannel = Object.create(null);
                newchannel.position = channelparams[0];
                newchannel.name = channelparams[1];
                newchannel.url = channelparams[2];
                channels.push(newchannel)
            })
            channels.pop(); // last channel corresponds with empty line
            resvar.json(channels);
        }
        else
            resvar.json({"error": "Channel list exited with code " + code});
    });
});

module.exports = app;