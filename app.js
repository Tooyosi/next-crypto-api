const express = require('express')
const app = express()
const { logger } = require('./loggers/logger')
const path = require("path")
const swaggerUi = require('swagger-ui-express');
const specs = require('./swagger/index')
var passport = require('passport')
const cron = require("node-cron");
require('dotenv').config()
var Client = require('coinbase').Client;
var client = new Client({ 'apiKey': process.env.COINBASE_API_KEY, 'apiSecret': process.env.COINBASE_API_SECRET, strictSSL: false });

const investmentTimer = require("./helpers/InvestmentTimer")
// client.getBuyPrice({'BTC': "NGN"}, function (err, accounts) {
//     console.log(accounts)
    
// })

client.getExchangeRates({}, function(err, price) {
    // console.log('Current bitcoin price in ' + "NGN" + ': ' +  price.data.
    // console.log(price.data.rates.NGN)
});
app.use(express.json({limit: "50mb",}));
app.use(express.urlencoded({ limit: "50mb", extended: true }))
app.use(passport.initialize())
app.use(passport.session())
app.use('/uploads', express.static('uploads'))
app.use(function (req, res, next) {
    var allowedOrigins = ['http://localhost:8081','http://localhost:8080', 'https://www.nextcryptoassets.com', 'https://nextcryptoasset.com', 'http://a090535c5a0d.ngrok.io'];
    var origin = req.headers.origin;

    if (allowedOrigins.includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin); // restrict it to the required domain
    }

    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS, PUT, PATCH, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', true);
    return next();
});
const userRoutes = require('./routes/user/index')
const authRoutes = require('./routes/auth/index')
const transactionsRoutes = require('./routes/transactions/index')
const fisRoutes = require('./routes/fis/index')
const membersRoutes = require('./routes/members/index')
const tradeRoutes = require('./routes/trade/index')
const adminRoutes = require('./routes/admin/index')
const notificationRoutes = require('./routes/notifications/index')
const investmentRoutes = require('./routes/investment/index')
const articlesRoutes = require('./routes/articles/index')
const coursesRoutes = require('./routes/courses/index')
app.use('/user', userRoutes)
app.use('/auth', authRoutes)
app.use('/transactions', transactionsRoutes)
app.use('/fis', fisRoutes)
app.use('/members', membersRoutes)
app.use('/trade', tradeRoutes)
app.use('/admin', adminRoutes)
app.use('/notification', notificationRoutes)
app.use('/invest', investmentRoutes)
app.use('/articles', articlesRoutes)
app.use('/courses', coursesRoutes)


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.get('/swagger.json', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
});

cron.schedule("10 11 * * *", function() {
    // function to increase investment running daily
    investmentTimer();
});
  


app.get("/testpaystack", async(req, res)=>{
    let Paystackcall = require('./helpers/PaystackCallService')
    let apicall = new Paystackcall()
    let result = await apicall.makeCall("GET", `https://api.paystack.co/bank`)
    let transferReciept = await apicall.makeCall("POST", `https://api.paystack.co/transferrecipient`, {
        "type": "nuban",
        "name": "Account 1029",
        "description": "Customer1029 bank account",
        "account_number": "0000000000",
        "bank_code": "057",
        "currency": "NGN",
    })
    console.log(transferReciept.response.data.recipient_code)
    let transfer = await apicall.makeCall("POST", `https://api.paystack.co/transfer`, {source: "balance", reason: "Calm down", amount:800, recipient: `${transferReciept.response.data.recipient_code}`})
    res.send({result, transferReciept, transfer}) 
})

app.listen(process.env.PORT, () => {
    logger.info(`Application is running on port ${process.env.PORT}`)
})