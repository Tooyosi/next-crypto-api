const models = require('../connection/sequelize');
const getDownlines = require('./getDownlines')

let ancestors = async (id) => {
    let members
    members = await models.Members.findOne({
        where: {
            user_id: id
        },
        include: [{
            model: models.Members,
            as: 'ancestors',

        }, {
            model: models.User,
            as: 'attributes',
            attributes: ['firstname', 'lastname', 'email']

        }],
    })



    let newStage = (base) => {
        let multi = Math.pow(2, base);
        let calcNo = (2 * multi)
        let result = calcNo - 1
        return result
    }


    let pushArr = []
    let updateStage = async (ancestor, parent, n, a) => {

        // if (a == n) {
        //     return a
        // } else 
        if (parent.children !== undefined && parent.children.length >= 5) {
            let child1 = parent.children[0]
            let child2 = parent.children[1]
            let child3 = parent.children[2]
            let child4 = parent.children[3]
            let child5 = parent.children[4]
            // console.log(child1.children? child1.children.length : null, child2.children? child2.children.length : null, child3.children? child3.children.length : null, child4.children? child4.children.length : null, child5.children? child5.children.length : null) 
            if (child1.children == undefined || child1.children.length < 5) {
                // console.log("here")

                // console.log(child1.user_id)

                pushArr.push({member_id: child1.member_id, user_id: child1.user_id})
            }
            if (child2.children == undefined || child2.children.length < 5) {
                // console.log(child2.user_id)

                pushArr.push({member_id: child2.member_id, user_id: child2.user_id})
            }
            if (child3.children == undefined || child3.children.length < 5) {

                pushArr.push({member_id: child3.member_id, user_id: child3.user_id})
            }
            if (child4.children == undefined || child4.children.length < 5) {
                pushArr.push({member_id: child4.member_id, user_id: child4.user_id})

            }
            if (child5.children == undefined || child5.children.length < 5) {
                pushArr.push({member_id: child5.member_id, user_id: child5.user_id})
                
            }

            for (let i = 0; i < parent.children.length; i++) {


                // a++;

                // console.log(`depth is ${a} ${i} ${parent.attributes.firstname}`)

                // console.log(parent.children[1].dataValues.children)
                let stage = newStage((Number(parent.children[i].current_stage) + 1))
                updateStage(ancestor, parent.children[i], stage, a)
            }
        } else {
            return parent
        }

    }

    // console.log(dn[0])
    let updates = []
    if (members !== null) {
        console.log(members.user_id)
        let downline = await getDownlines(members.user_id)
        let stage = newStage((Number(downline.current_stage) + 1))
        let update = await updateStage(downline, downline, stage, 0)
            updates.push(downline)

    }
    return pushArr


}

module.exports = ancestors