var load_config = require('./load_config')
var proxy = require('./proxy')
var gen_filter = require('./gen_filter')

load_config(function (err, config) {
    if (err) {
        process.exit()
        return
    }

    for (var k in config) {
        if (!/^p/.test(k)) continue
        var tunnel = config[k]
        console.log(`[${tunnel.mode}] from ${tunnel.localaddress}[${tunnel.localport}] to ${tunnel.address}[${tunnel.port}]`)
    }

    for (var k in config) {
        run(config[k])
    }
})

function run(options) {
    var server = proxy.createServer(options, gen_filter(options))

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
