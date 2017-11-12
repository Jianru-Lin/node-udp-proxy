var os = require('os')
var request = require('request')
var fs = require('fs')
var path = require('path')

module.exports = load_config

function load_config(cb) {
    cb = cb || function() {}
    console.log('try loading local config: ' + local_config_filename())
    var config = load_local_config()
    if (config) {
        console.log(config)
        cb(null, config)
        return
    }

    console.log('local config not exits.')
    console.log('try loading remote config: ' + remote_config_url())
    load_remote_config(function (err, config) {
        if (err) {
            console.log(err)
            cb(err)
            return
        }

        console.log(config)
        cb(null, config)
    })
}

function load_remote_config(cb) {
    cb = cb || function () {}
    var url = remote_config_url()
    request.get({url: url, json: true}, function(err, res, body) {
        if (err) {
            console.error(err)
            cb(err.toString())
            return
        }

        if (res.statusCode !== 200) {
            var err_str = res.statusCode + ' ' + body
            console.error(err_str)
            cb(err_str)
            return
        }

        if (typeof body === 'string') {
            body = JSON.parse(body)
        }

        cb(null, body)
    })
}

function load_local_config() {
    var filename = local_config_filename()
    if (!fs.existsSync(filename)) {
        return ''
    }
    var config = require(filename)
    return config
}

function remote_config_url() {
    var server = process.env['server'] || 'miaodeli.com:3000'
    var url_prefix = `http://${server}/setupme/node-udp-proxy/`
    return url_prefix + encodeURIComponent(load_tag()) + '/config.json'
}

function local_config_filename() {
    var name = process.env['config'] || 'config.js'
    if (!name) {
        return ''
    }

    return path.resolve(__dirname, name)
}

function load_tag() {
    var tag = process.env['tag'] || read_file('tag') || os.hostname()
    return tag.trim()
}

function read_file(name) {
    var filename = path.resolve(__dirname, name)
    try {
        var text = fs.readFileSync(filename, 'utf8')
        return text
    }
    catch (err) {
        console.log(err)
        return ''
    }
}
