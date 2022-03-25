const { setNewModLogMessage } = require('../../modlog/modlog');
const { privateModResponse } = require('../../privatResponses/privateModResponses');
const { publicModResponses } = require('../../publicResponses/publicModResponses');
const { errorhandler } = require('../errorhandler/errorhandler');
const { insertDataToClosedInfraction } = require('../insertDataToDatabase');
const { getMutedRole } = require('../roles/getMutedRole');
const { removeDataFromOpenInfractions } = require('../data/removeDataFromDatabase');

const database = require('../../../src/db/db');



async function unmuteUser(message, member, bot, config, reason, log) {
    var MutedRole = await getMutedRole(message, bot.guilds.cache.get(message.guild.id));
    if(!member.roles.cache.has(MutedRole)) return message.channel.send(`<@${message.author.id}> The user isnt't muted.`)

    let pass = false;

    await member.roles.remove([MutedRole])
    .then(() => pass = true)
    .catch(err => {
        return errorhandler(err, config.errormessages.nopermissions.manageRoles, message.channel, log, config);
    })

    if(pass) {
        try {
            await setNewModLogMessage(bot, config.defaultModTypes.unmute, message.author.id, member.id, reason, null, message.guild.id);
            await publicModResponses(message, config.defaultModTypes.unmute, message.author, member.id, reason, null, bot);
            await privateModResponse(member, config.defaultModTypes.unmute, reason, null, bot, message.guild.name);

            database.query(`SELECT * FROM open_infractions WHERE user_id = ? ORDER BY id DESC`, [member.id]).then(async res => {
                if(res.length > 0) {
                    let user_roles = await JSON.parse(await res[0].user_roles);
                    for (let x in user_roles) {
                        let r = await message.guild.roles.cache.find(role => role.id == user_roles[x])
                        await member.roles.add(r);
                    }
                    await insertDataToClosedInfraction(res[0].user_id, res[0].mod_id, res[0].mute, res[0].ban, 0, 0, res[0].till_date, res[0].reason, res[0].infraction_id);
                    await removeDataFromOpenInfractions(res[0].infraction_id);

                    if(config.debug == 'true') console.info('Unmute Command passed!')
                    
                }
            }).catch(err => console.log(err))
        }
        catch(err) {
            return errorhandler(err, config.errormessages.general, message.channel, log, config, true)
        }
    }
}

module.exports = {unmuteUser}