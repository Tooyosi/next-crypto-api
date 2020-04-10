class Response {
    constructor(status, description, code, data){
        this.status = status;
        this.description = description
        this.code = code
        this.data = data
    }
}

module.exports = Response