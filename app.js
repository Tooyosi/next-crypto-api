const express = require('express')
const app = express()
const { logger } = require('./loggers/logger')
const path = require("path")
const swaggerUi = require('swagger-ui-express');
const specs = require('./swagger/index')
var passport = require('passport')

require('dotenv').config()
var Client = require('coinbase').Client;
var client = new Client({ 'apiKey': process.env.COINBASE_API_KEY, 'apiSecret': process.env.COINBASE_API_SECRET, strictSSL: false });

client.getNotifications({}, function(err, notifications) {
    // console.log(notifications);
  });   
client.getCurrentUser(function(err, user) {
    // console.log(user);
  });
client.getCurrentUser(function (err, accounts) {
    // accounts.forEach(function(acct) {
    //   console.log('my bal: ' + acct.balance.amount + ' for ' + acct.name);
    // });
    // console.log(accounts)
});

client.getBuyPrice({'currencyPair': 'BTC-USD'}, (err, info) => {
    // console.log(`Buy Price: ${info.data.amount}`);
    // // console.log(info);
    // let amt = 1/info.data.amount
    // // console.log(amt.toPrecision(3))
    // let processingFee = 0.000001
    // let withdrawAmt = amt - processingFee
    // console.log(amt, withdrawAmt)
});

client.getPaymentMethods(null, async function(err, pm) {
    // console.log(err)
    // console.log(pm);
  });

client.getAccounts({}, function (err, accounts){
    if(!err){
        // console.log(accounts)
        accounts.forEach((acct)=>{
            // console.log(acct.name)
        })
    }
})
client.getAccount("BTC", function (err, accounts) {
    accounts.getTransactions({}, function(err, txs) {
        // console.log(txs);
        // txs.forEach((tn)=>{
        //     console.log(tn.amount)
        //     console.log(tn.details)
        //     console.log(tn.type)
        //     console.log(tn.to)
        // })
      });
    // console.log(err? err : accounts )
    // accounts.forEach(function(acct) {
    //     if(!err){
    // console.log('my bal: ' + accounts.balance.amount + ' for ' + accounts.name);
    //     }else {
    //         console.log(err)
    //     }
    // var args = {
    //     "amount": "12",
    //     "currency": "BTC"
    //   };
    //   accounts.sell(args, function(err, xfer) {
    //     //   console.log(err)
    //     // console.log('my xfer id is: ' + xfer.id);
    //   });
    // });
    // console.log(err)
    // console.log(accounts)
    // accounts.sendMoney({
    //     'to': address,
    //     'amount': '0.01',
    //     'currency': 'BTC'
    // }, function (err, tx) {
    //     console.log(tx);
    // });
    accounts.getAddresses(null, function(err, addresses) {
        // console.log(addresses.address);
        // addresses.forEach((add, i)=>{
        //     // console.log(add.address, i)
        // })
      });
      accounts.getAddress('3APfE92TN3jrqqLQYqehCD2PABWBj8AZ24', function(err, address) {
        // console.log(address);
        // address.getTransactions({}, function(err, txs) {
        //     // console.log(txs);
        //     txs.forEach((tn)=>{
        //         // console.log(tn.amount)
        //     })
        //   });
      });
    accounts.createAddress(null,function(err, addr) {
        // console.log(addr.address);
        // accounts.sendMoney({
        //     'to': "3FAZbrJLMqzhaZvxiH81uyjDJserjSQtrF",
        //     'amount': '0.01',
        //     'currency': 'BTC'
        // }, function (err, tx) {
        //     // console.log(err)
        //     // console.log(tx); 
        // });
        // address = addr;
      });
    // accounts.getAddresses(null, function (err, addresses) {
    //     // console.log(addresses);
    // });
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(passport.initialize())
app.use(passport.session())
app.use('/uploads', express.static('uploads'))
app.use(function (req, res, next) {
    var allowedOrigins = ['http://localhost:8080', 'https://www.nextcryptoasset.com', 'https://nextcryptoasset.com', 'http://058c6925.ngrok.io'];
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
app.use('/user', userRoutes)
app.use('/auth', authRoutes)
app.use('/transactions', transactionsRoutes)
app.use('/fis', fisRoutes)
app.use('/members', membersRoutes)
app.use('/trade', tradeRoutes)
app.use('/admin', adminRoutes)
app.use('/notification', notificationRoutes)


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.get('/swagger.json', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
});

// app.get("/:id", async (req, res) => {
//     let getAncestors = require('./helpers/getAncestors')
//     let sendObj = await getAncestors(req.params.id)
//     res.send(sendObj)
// })

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