var cypher = require('./cypher')

var normal_mode = {
    forward_encode: function (msg) {
        return msg
    },
    backward_encode: function (msg) {
        return msg
    }
}

var in_mode = {
    forward_encode: cypher.cypher,
    backward_encode: cypher.decypher,
}

var out_mode = {
    forward_encode: cypher.decypher,
    backward_encode: cypher.cypher,
}

// 这里的 config 指的是 p500 这样的一个项，不是整个 config
function gen_filter(config) {
    if (!config) {
        return normal_mode
    }
    
    var mode = process.env['mode'] || config.mode || 'normal'
    // console.log('filter mode: ' + mode)

    if (mode === 'in') {
        return in_mode
    }
    else if (mode === 'out') {
        return out_mode
    }
    else if (mode === 'normal') {
        return normal_mode
    }
    else {
        throw new Error('unknown mode: ' + mode)
    }
}

module.exports = gen_filter