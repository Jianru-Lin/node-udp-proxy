const should_encode = has_env('udp_proxy_encode')
const should_decode = has_env('udp_proxy_decode')

if (should_encode) {
    console.log('encode enabled')
}
if (should_decode) {
    console.log('decode enabled')
}

exports.encode = should_encode ? encode : unchange
exports.decode = should_decode ? decode : unchange

function encode(msg) {
    // console.log('encode ' + msg.length)
    for (var i = 0; i < msg.length; ++i) {
        msg[i] ^= 0xAB
    }
    return msg
}

function decode(msg) {
    // console.log('decode ' + msg.length)
    for (var i = 0; i < msg.length; ++i) {
        msg[i] ^= 0xAB
    }
    return msg
}

function unchange(msg) {
    // console.log('unchange ' + msg.length)
    return msg
}

function has_env(name) {
    return process.env[name] && true
}