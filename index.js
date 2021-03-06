var dgram = require('dgram');
var events = require('events');
var util = require('util');
var net = require('net');
var cypher = require('./cypher');

var UdpProxy = function (options) {
    "use strict";
    var proxy = this;
    var localUdpType = 'udp4';
    var localfamily = 'IPv4';
    var serverPort = options.localport || 0;
    var serverHost = options.localaddress || '0.0.0.0';
    var proxyHost = options.proxyaddress || '0.0.0.0';
    this.tOutTime = options.timeOutTime || 10000;
    this.family = 'IPv4';
    this.udpType = 'udp4';
    this.host = options.address || 'localhost';
    this.port = options.port || 41234;
    this.connections = {};
    if (options.ipv6) {
        this.udpType = 'udp6';
        this.family = 'IPv6';
        proxyHost = net.isIPv6(options.proxyaddress) ? options.proxyaddress : '::0';
    }
    this._details = {
        target: {
            address: this.host,
            family: this.family,
            port: this.port
        }
    };
    this._detailKeys = Object.keys(this._details);
    if (options.localipv6) {
        localUdpType = 'udp6';
        serverHost = net.isIPv6(options.localaddress) ? options.localaddress : '::0';
    }
    this._server = dgram.createSocket(localUdpType);
    this._server.on('listening', function () {
        var details = proxy.getDetails({ server: this.address() });
        setImmediate(function () {
            proxy.emit('listening', details);
        });
    }).on('message', function (msg, sender) {
        msg = cypher.decode(msg);
        var client = proxy.createClient(msg, sender);
        if (!client._bound) client.bind(0, proxyHost);
        else client.emit('send', msg, sender);
    }).on('error', function (err) {
        this.close();
        proxy.emit('error', err);
    }).on('close', function () {
        proxy.emit('close');
    }).bind(serverPort, serverHost);
};

util.inherits(UdpProxy, events.EventEmitter);

UdpProxy.prototype.getDetails = function getDetails(initialObj) {
    var self = this;
    return this._detailKeys.reduce(function (obj, key) {
        obj[key] = self._details[key];
        return obj;
    }, initialObj);
};

UdpProxy.prototype.hashD = function hashD(address) {
    return (address.address + address.port).replace(/\./g, '');
};

UdpProxy.prototype.send = function send(msg, port, address, callback) {
    this._server.send(msg, 0, msg.length, port, address, callback);
};

UdpProxy.prototype.createClient = function createClient(msg, sender) {
    var senderD = this.hashD(sender);
    var proxy = this;
    if (this.connections.hasOwnProperty(senderD)) {
        client = this.connections[senderD];
        clearTimeout(client.t);
        client.t = null;
        return client;
    }
    client = dgram.createSocket(this.udpType);
    client.once('listening', function () {
        var details = proxy.getDetails({ route: this.address(), peer: sender });
        this.peer = sender;
        this._bound = true;
        proxy.emit('bound', details);
        this.emit('send', msg, sender);
    }).on('message', function (msg, sender) {
        msg = cypher.decode(msg);
        proxy.send(msg, this.peer.port, this.peer.address, function (err, bytes) {
            if (err) proxy.emit('proxyError', err);
        });
        proxy.emit('proxyMsg', msg, sender);
    }).on('close', function () {
        proxy.emit('proxyClose', this.peer);
        this.removeAllListeners();
        delete proxy.connections[senderD];
    }).on('error', function (err) {
        this.close();
        proxy.emit('proxyError', err);
    }).on('send', function (msg, sender) {
        var self = this;
        msg = cypher.encode(msg);
        proxy.emit('message', msg, sender);
        this.send(msg, 0, msg.length, proxy.port, proxy.host, function (err, bytes) {
            if (err) proxy.emit('proxyError', err);
            if (!self.t) self.t = setTimeout(function () {
                self.close();
            }, proxy.tOutTime);
        });
    });
    this.connections[senderD] = client;
    return client;
};

exports.createServer = function (options) {
    return new UdpProxy(options);
};
