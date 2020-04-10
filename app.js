const express = require('express')
const app = express()
const {logger} = require('./loggers/logger')
const path = require("path")
const swaggerUi = require('swagger-ui-express');
const specs = require('./swagger/index')
require('dotenv').config()

app.use(express.json());
app.use(express.urlencoded({extended: true}))

const userRoutes = require('./routes/user/index')

app.use('/user', userRoutes)

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.get('/swagger.json', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
});

app.listen(process.env.PORT, ()=>{
    logger.info(`Application is running on port ${process.env.PORT}`)
})