const target = process.env['udp_proxy_target']
if (!target) {
    console.log('udp_proxy_target env not found.')
    process.exit()
}

module.exports = {
    p500: {
        address: target,
        port: 34005,
        ipv6: false,
        localaddress: '0.0.0.0',
        localport: 500,
        localipv6: false,
        proxyaddress: undefined,
        timeOutTime: 3600000
    },
    p4500: {
        address: target,
        port: 34006,
        ipv6: false,
        localaddress: '0.0.0.0',
        localport: 4500,
        localipv6: false,
        proxyaddress: undefined,
        timeOutTime: 3600000
    }
}