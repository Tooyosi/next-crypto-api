const express = require('express')
const app = express()
const { logger } = require('./loggers/logger')
const path = require("path")
const swaggerUi = require('swagger-ui-express');
const specs = require('./swagger/index')
var passport = require('passport')

require('dotenv').config()

app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(passport.initialize())
app.use(passport.session())
app.use(function (req, res, next) {
    var allowedOrigins = ['http://localhost:8080', 'https://www.rightstepsfoundation.org', 'https://rightstepsfoundation.org', 'www.rightstepsfoundation.org'];
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
app.use('/user', userRoutes)
app.use('/auth', authRoutes)

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.get('/swagger.json', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
});

app.get("/:id", async (req, res)=>{
    let getAncestors = require('./helpers/getAncestors')
    let sendObj = await getAncestors(req.params.id)
    res.send(sendObj)
})

app.listen(process.env.PORT, () => {
    logger.info(`Application is running on port ${process.env.PORT}`)
})