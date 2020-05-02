var client = require('./CoinBaseClient')
module.exports = {
    rateFn:async () => {
        await client.getBuyPrice({ 'currencyPair': 'BTC-NGN' }, async (err, info) => {
            let nairaValue, dollarValue
            if (err) {
                return { status: false, err: err }
            }
            nairaValue = info.data.amount

            await client.getBuyPrice({ 'currencyPair': 'BTC-USD' }, async(err, dollar) => {
                if (err) {
                    return { status: false, err: err }
                }
                dollarValue = dollar.data.amount
                let exRate = dollarValue / nairaValue
                console.log(exRate)
                return { status: true, rate: exRate }
            })
        });
    }
}