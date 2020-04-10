const moment = require('moment-timezone')
const crypto = require('crypto')
module.exports = {
    bin2hashData:  (data, key)=> {
        let genHash = crypto.createHmac('sha512', key).update(data, "ascii").digest('hex')
        return genHash
    },
    validator: (email) => {
        let filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/
        if (filter.test(email)) {
            return true
        } else {
            return false
        }
    },
    addMinutes: (date, minutes) => {
        return moment.tz(new Date(date.getTime() + minutes * 60000), "Africa/Lagos").format().slice(0, 19).replace('T', ' ')
    },
    convertDate: (date) => {
        return moment.tz(date, "Africa/Lagos").format().slice(0, 19).replace('T', ' ')
    },
    successCode: "00",
    failureCode: "99",
    failureStatus: "Failed",
    successStatus: "Success",
    dateTime: moment.tz(Date.now(), "Africa/Lagos").format().slice(0, 19).replace('T', ' '),
    validationErrorMessage: "Validation Error: One or more parameters are invalid"
}