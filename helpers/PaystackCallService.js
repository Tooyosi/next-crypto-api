const axios = require("axios")
const {logger} = require('../loggers/logger')

class PaystackCallService {
    constructor() {
        this.headers = {
            'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
    }

    async makeCall(method, url, data) {
        let response, status = false;
        try {
            response = await axios({
                method: method,
                url: url,
                headers: this.headers,
                data: data? data : null
            }).then((res)=>{
                status = true
                return res.data
            }).catch((err)=>{
                logger.error(err.toString())
                return err.toString()
            })

        } catch (error) {
            logger.error(error.toString())
            status = false
            response = error.toString()
        }

        return {response, status: status? true : false}
    }
}

module.exports = PaystackCallService