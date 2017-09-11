exports.cypher = cypher
exports.decypher = decypher

function cypher(msg) {
    // console.log('encode ' + msg.length)
    for (var i = 0; i < msg.length; ++i) {
        msg[i] ^= 0xAB
    }
    return msg
}

function decypher(msg) {
    // console.log('decode ' + msg.length)
    for (var i = 0; i < msg.length; ++i) {
        msg[i] ^= 0xAB
    }
    return msg
}
