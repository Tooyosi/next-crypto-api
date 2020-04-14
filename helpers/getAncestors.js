const models = require('../connection/sequelize');
const getDownlines = require('./getDownlines')
let sendMail = require('./sendMail')

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
            as: 'details',
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
            // a++;
            // console.log(parent.children.length)

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
                }

            }
            let newAncestorStage, bonusAmount;
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
            // what im doing here is checking if the fourth level is defined and has two downlines

            if (newAncestorStage !== undefined) {
                let stageAward
                let awardNotification
                let awards
                let awardNotificationCreate
                let awardObj = {
                    user_id: parent.user_id,
                    status: 'Pending',
                    date: dateValue
                }
                let updatedUserTable = await models.User.findOne({
                    where: {
                        user_id: parent.user_id
                    }
                })
                switch (newAncestorStage) {
                    case 3:
                        // completed stage 2
                        stageAward = await awardTypes(2);
                        let randomId = Math.floor((Math.random() * stageAward.length) + 1);
                        awardObj.award_type_id = randomId
                        let id
                        stageAward.forEach(award => {
                            if (randomId == award.award_type_id) {
                                id = award
                            }
                        })
                        awardNotification = `Congratulations, you have received award of ${id.name} for completing stage ${(Number(newAncestorStage) - 1)}.`
                        // create new award
                        awards = await models.Awards.create(awardObj);

                        // add notification for award
                        awardNotificationCreate = await notificationCreate(parent.user_id, awardNotification, dateValue);

                        break;
                    case 4:
                        // complete stage 3
                        stageAward = await awardTypes(3);
                        awardObj.award_type_id = stageAward[0].award_type_id
                        awardNotification = `Congratulations, you have received award of ${stageAward[0].name} for completing stage ${(Number(newAncestorStage) - 1)}.`
                        // create new award
                        awards = await models.Awards.create(awardObj);

                        // add notification for award
                        awardNotificationCreate = await notificationCreate(parent.user_id, awardNotification, dateValue);

                        break;
                    case 5:
                        // complete stage 4
                        stageAward = await awardTypes(4);
                        awardObj.award_type_id = stageAward[0].award_type_id
                        awardNotification = `Congratulations, you have received award of ${stageAward[0].name} for completing stage ${(Number(newAncestorStage) - 1)}.`
                        // create new award
                        awards = await models.Awards.create(awardObj);

                        // add notification for award
                        awardNotificationCreate = await notificationCreate(parent.user_id, awardNotification, dateValue);

                        break;
                    case 6:
                        // complete stage 5
                        stageAward = await awardTypes(5);
                        awardObj.award_type_id = stageAward[0].award_type_id
                        awardNotification = `Congratulations, you have received award of ${stageAward[0].name} for completing stage ${(Number(newAncestorStage) - 1)}.`
                        // create new award
                        awards = await models.Awards.create(awardObj);
                        let updatedUserTable = await models.User.findOne({
                            where: {
                                user_id: parent.user_id
                            }
                        })
                        await updatedUserTable.update({
                            isCompleted: 1
                        })
                        // add notification for award
                        awardNotificationCreate = await notificationCreate(parent.user_id, awardNotification, dateValue);

                        break;
                }

                let updateParent = await parent.update({
                    current_stage: newAncestorStage
                })
                let parentNotification = await notificationAndAccount(parent.user_id, `Congratulations, You have been upgraded to stage ${newAncestorStage} and received a bonus of $${bonusAmount}`, bonusAmount, dateValue)

                let ancestorUpline = await models.Members.findOne({
                    where: {
                        user_id: parent.upline_id
                    }
                })
                let ancestorBonus = await models.Bonus.create({
                    user_id: parent.user_id,
                    bonus_type_id: 2,
                    amount: bonusAmount,
                    date: dateValue
                })

                await transferCreate(updatedUserTable.user_id, `Stage ${newAncestorStage} Matrix bonus`, dateValue, bonusAmount, 'Right Steps', `${updatedUserTable.firstname} ${updatedUserTable.lastname}`)

                if (ancestorUpline !== null) {
                    let uplineBonus = (bonusAmount * 0.1)
                    let ancestorUplineBonus = await models.Bonus.create({
                        user_id: ancestorUpline.user_id,
                        bonus_type_id: 3,
                        amount: uplineBonus,
                        date: dateValue
                    })
                    let parentUplineNotification = await notificationAndAccount(ancestorUpline.user_id, `Congratulations, You have received a bonus of $${uplineBonus} for the upgrade of your downline ${parent.attributes.username} to stage ${newAncestorStage}`, uplineBonus, dateValue)
                    await transferCreate(ancestorUpline.user_id, `${updatedUserTable.firstname} ${updatedUserTable.lastname}'s stage ${newAncestorStage} matching Bonus`, dateValue, uplineBonus, 'Right Steps', `${updatedUserTable.firstname} ${updatedUserTable.lastname}`)

                }
                console.log(parent.attributes.username, "here")
                return updateStage(parent, updateParent, n, a++)

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