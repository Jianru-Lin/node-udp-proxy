var configFilename = process.env['udp_proxy_config']
if (!configFilename) {
    console.log('udp_proxy_config env not set')
    process.exit()
}

var path = require('path')
configFilename = path.resolve(__dirname, configFilename)
console.log('load config from: ' + configFilename)

var config = require(configFilename)
var proxy = require('./index')

run(config.p500)
run(config.p4500)

function run(options) {
    var server = proxy.createServer(options)

    server.on('listening', function (details) {
        console.log('udp-proxy-server ready on ' + details.server.family + '  ' + details.server.address + ':' + details.server.port)
        console.log('traffic is forwarded to ' + details.target.family + '  ' + details.target.address + ':' + details.target.port)
    })

    server.on('bound', function (details) {
        console.log('proxy is bound to ' + details.route.address + ':' + details.route.port)
        console.log('peer is bound to ' + details.peer.address + ':' + details.peer.port)
    })

    server.on('message', function (message, sender) {
        // console.log('message from ' + sender.address + ':' + sender.port)
    })

    server.on('proxyMsg', function (message, sender) {
        // console.log('answer from ' + sender.address + ':' + sender.port)
    })

    server.on('proxyClose', function (peer) {
        console.log('disconnecting socket from ' + peer.address)
    })

    server.on('proxyError', function (err) {
        console.log('ProxyError! ' + err)
    })

    server.on('error', function (err) {
        console.log('Error! ' + err)
    })
}