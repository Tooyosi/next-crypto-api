const models = require('../connection/sequelize');
const getDownlines = require('./getDownlines')
let { convertDate } = require('../helpers/index')
let notificationCreate = require('../helpers/createNotification')
var client = require('../helpers/CoinBaseClient')

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



    let updateStage = async (ancestor, parent, n, a) => {

        if (a == n) {
            return a
        } else if (parent.children !== undefined && parent.children.length >= 5) {
            client.getBuyPrice({ 'currencyPair': 'BTC-USD' }, async (err, info) => {
                if (err) {
                    
                    return updateStage(ancestor, parent, n, a)
                }
                let newAncestorStage, bonusAmount;
                // a++;
                // console.log(parent.children.length)
                let parentAccount = await models.Account.findOne({
                    where: {
                        user_id: parent.user_id
                    }
                })
                if (parent.children.length >= 5) {
                    if (parent.current_stage == 1) {
                        // console.log(parent.children.length)
                        // console.log(parent.upline_user_id)

                        let parentId, moveUp
                        let updateObj = {
                            current_stage: 2
                        }
                        parentId = await models.Members.findOne({
                            where: {
                                user_id: parent.upline_user_id !== null ? parent.upline_user_id : 0
                            }
                        })

                        if (parentId !== null && parentId !== undefined && parentId.current_stage == 1) {
                            updateObj.upline_user_id = null
                            updateObj.parentId = null
                            updateObj.parentMember_id = null
                        }
                        // check if registered by admin
                        await parent.update(updateObj)
                        bonusAmount = 100/Number(info.data.amount)
                        newAncestorStage = 1
                    }

                }
                // check the depth and assign the appropriate stages
                // if (parent.children[4] && parent.children[4].children !== undefined && parent.children[4].children.length == 5 && parent.children[3] && parent.children[3].children !== undefined && parent.children[3].children.length == 5 && parent.children[2] && parent.children[2].children !== undefined && parent.children[2].children.length == 5 && parent.children[1] && parent.children[1].children !== undefined && parent.children[1].children.length == 5 && parent.children[0].children != undefined && parent.children[0].children.length == 5) {

                let child1 = parent.children[0]
                let child2 = parent.children[1]
                let child3 = parent.children[2]
                let child4 = parent.children[3]
                let child5 = parent.children[4]
                let childArray = []
                if (child1 && child2 && child3 && child4 && child5) {
                    childArray = [child1.current_stage, child2.current_stage, child3.current_stage, child4.current_stage, child5.current_stage]
                }
                // if (parent.current_stage == 1) {
                //     let update = 0
                //     for (let i = 0; i < childArray.length; i++) {
                //         if (childArray[i] >= 1) {
                //             update += 1
                //         }
                //     }
                //     console.log(update)
                //     if (update == 5) {
                //         let parentId, moveUp
                //         let updateObj = {
                //             current_stage: 2
                //         }
                //         parentId = await models.Members.findOne({
                //             where: {
                //                 member_id: parent.upline_user_id !== null ? parent.upline_user_id : 0
                //             }
                //         })
                //         if (parentId !== null && parentId !== undefined && parentId.current_stage !== 2) {
                //             updateObj.upline_user_id = null
                //             updateObj.parentId = null
                //             updateObj.parentMember_id = null
                //         }
                //         // check if registered by admin
                //         await parent.update(updateObj)
                //     }
                // } else
                if (parent.current_stage == 2) {
                    let update = 0
                    for (let i = 0; i < childArray.length; i++) {
                        if (childArray[i] >= 2) {
                            update += 1
                        }
                    }
                    if (update == 5) {
                        let parentId, moveUp
                        let updateObj = {
                            current_stage: 3
                        }
                        parentId = await models.Members.findOne({
                            where: {
                                user_id: parent.upline_user_id !== null ? parent.upline_user_id : 0
                            }
                        })
                        if (parentId !== null && parentId !== undefined && parentId.current_stage < 2) {
                            updateObj.upline_user_id = null
                            updateObj.parentId = null
                            updateObj.parentMember_id = null
                        }
                        // check if registered by admin
                        await parent.update(updateObj)
                        bonusAmount = 375/Number(info.data.amount)
                        newAncestorStage = 2

                    }
                } else if (parent.current_stage == 3) {
                    let update = 0
                    for (let i = 0; i < childArray.length; i++) {
                        if (childArray[i] >= 3) {
                            update += 1
                        }
                    }
                    if (update == 5) {
                        let parentId, moveUp
                        let updateObj = {
                            current_stage: 4
                        }
                        parentId = await models.Members.findOne({
                            where: {
                                user_id: parent.upline_user_id !== null ? parent.upline_user_id : 0
                            }
                        })
                        if (parentId !== null && parentId !== undefined && parentId.current_stage < 3) {
                            updateObj.upline_user_id = null
                            updateObj.parentId = null
                            updateObj.parentMember_id = null
                        }
                        // check if registered by admin
                        await parent.update(updateObj)
                        bonusAmount = 1250/Number(info.data.amount)
                        newAncestorStage = 3

                    }
                } else if (parent.current_stage == 4) {
                    let update = 0
                    for (let i = 0; i < childArray.length; i++) {
                        if (childArray[i] >= 4) {
                            update += 1
                        }
                    }
                    if (update == 5) {
                        let parentId, moveUp
                        let updateObj = {
                            current_stage: 5
                        }
                        parentId = await models.Members.findOne({
                            where: {
                                user_id: parent.upline_user_id !== null ? parent.upline_user_id : 0
                            }
                        })
                        if (parentId !== null && parentId !== undefined && parentId.current_stage < 4) {
                            updateObj.upline_user_id = null
                            updateObj.parentId = null
                            updateObj.parentMember_id = null
                        }
                        // check if registered by admin
                        await parent.update(updateObj)
                        bonusAmount = 3125/Number(info.data.amount)
                        newAncestorStage = 4

                    }
                } else if (parent.current_stage == 5) {
                    let update = 0
                    for (let i = 0; i < childArray.length; i++) {
                        if (childArray[i] >= 5) {
                            update += 1
                        }
                    }
                    if (update == 5) {
                        let parentId, moveUp
                        let updateObj = {
                            current_stage: 1
                        }
                        parentId = await models.Members.findOne({
                            where: {
                                user_id: parent.upline_user_id !== null ? parent.upline_user_id : 0
                            }
                        })
                        if (parentId !== null && parentId !== undefined && parentId.current_stage < 5) {
                            updateObj.upline_user_id = null
                            updateObj.parentId = null
                            updateObj.parentMember_id = null
                        }
                        // check if registered by admin
                        await parent.update(updateObj)
                        bonusAmount = 15625/Number(info.data.amount)
                        newAncestorStage = 5


                        // clear all users associated
                        let allDownlines = await models.Members.findAll({
                            where: {
                                parentMember_id: parent.member_id
                            }
                        })

                        await allDownlines.forEach(async (downline) => {
                            await downline.update({
                                upline_user_id: null,
                                parentId: null,
                                parentMember_id: null
                            })
                        })
                    }
                }

                if (bonusAmount !== undefined) {
                    let date = convertDate(Date.now())
                    let newCommission = await models.Commissions.create({
                        commission_type_id: 1,
                        user_id: parent.user_id,
                        amount: bonusAmount,
                        date: date
                    })

                    let newBalance = Number(parentAccount.balance) + bonusAmount.toFixed(6)


                    await notificationCreate(parent.user_id, `New commission of ${bonusAmount.toFixed(6)} btc recieved for completing stage ${newAncestorStage}`, date)
                    if (newAncestorStage == 5) {
                        let deduction = (100/Number(info.data.amount))
                        await notificationCreate(parent.user_id, `New deduction of ${deduction.toFixed(6)} btc as re entry fee`, date)
                        newBalance = newBalance - deduction.toFixed(6)
                    }
                    parentAccount.update({
                        balance: Number(newBalance),
                        date_updated: date
                    })
                }
                // }
                a++
                // console.log(a)
                for (let i = 0; i < parent.children.length; i++) {


                    // a++;

                    // console.log(`depth is ${a} ${i} ${parent.attributes.firstname}`)

                    // console.log(parent.children[1].dataValues.children)
                    let stage = newStage((Number(parent.children[i].current_stage) + 1))
                    updateStage(ancestor, parent.children[i], stage, a)
                }
            })

        } else {
            return a
        }

    }

    // console.log(dn[0])
    let updates = []
    if (members !== null) {
        for (let i = members.ancestors.length - 1; i >= 0; i--) {
            let downline = await getDownlines(members.ancestors[i].user_id)
            let stage = newStage((Number(downline.current_stage) + 1))
            let update = await updateStage(downline, downline, stage, 0)

            updates.push(downline)
        }
    }
    return updates


}

module.exports = ancestors