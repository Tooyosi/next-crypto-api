const models = require('../connection/sequelize');

const members = async (id) => {
    let result
    result = await models.Members.findOne({
        where: {
            user_id: id
        },
        include: [{
            model: models.Members,
            as: 'descendents',
            hierarchy: true,
            include: [{
                model: models.User,
                as: 'attributes',
                attributes: ['firstname', 'lastname', 'email']
            }]
        }, {
            model: models.User,
            as: 'attributes',
            attributes: ['firstname', 'lastname', 'email']

        }],
    })
    return result;
}

module.exports = members;