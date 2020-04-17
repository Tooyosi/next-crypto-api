
var Client = require('coinbase').Client;
var client = new Client({ 'apiKey': process.env.COINBASE_API_KEY, 'apiSecret': process.env.COINBASE_API_SECRET, strictSSL: false });

module.exports = client