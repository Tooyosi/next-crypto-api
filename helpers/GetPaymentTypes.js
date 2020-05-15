module.exports = (type) => {
    let response
    switch (type) {
        case "1":
            response = "Bank Deposit";
            break;
        case "2":
            response = "Bitcoin";
            break;
        case "3":
            response = "Etherenum";
            break;
        case "4":
            response = "Paystack";
            break;
        default:
            response = null
            break
    }

    return response
}