var cypher = require('./cypher')
const env_name = 'udp_proxy_mode'

if (!process.env[env_name]) {
    exports.forward_encode = function (msg) {
        return msg
    }

    exports.backward_encode = function (msg) {
        return msg
    }
}
else if (process.env[env_name] === 'in') {
    console.log('mode: in')
    exports.forward_encode = cypher.cypher
    exports.backward_encode = cypher.decypher
}
else if (process.env[env_name] === 'out') {
    console.log('mode: out')
    exports.forward_encode = cypher.decypher
    exports.backward_encode = cypher.cypher
}
