const {
    SlashCommandBuilder
} = require('@discordjs/builders');
const { checkMessage } = require('../../../utils/functions/checkMessage/checkMessage');
const { hasPermission } = require('../../../utils/functions/hasPermissions');
const config = require('../../../src/assets/json/_config/config.json');
const { getModTime } = require('../../../utils/functions/getModTime');
const { muteUser } = require('../../../utils/functions/moderations/muteUser');
const { isMuted } = require('../../../utils/functions/moderations/checkOpenInfractions');

module.exports.run = async ({main_interaction, bot}) => {
    if (!await hasPermission(main_interaction, 0, 0)) {
        return main_interaction.reply({
            content: `<@${main_interaction.user.id}> ${config.errormessages.nopermission}`,
            ephemeral: true
        }).catch(err => {});
    }

    const user = main_interaction.options.getUser('user');
    
    const check = await checkMessage({
        author: main_interaction.user,
        target: user,
        guild: main_interaction.guild,
        bot,
        type: 'mute'
    });

    if(check) return main_interaction.reply({
        content: check,
        ephemeral: true
    }).catch(err => {});
    
    if(await isMuted({user, guild: main_interaction.guild, bot})) {
        return main_interaction.reply({
            content: 'This user is already muted!',
            ephemeral: true
        }).catch(err => {});
    }

    

    var time = main_interaction.options.getString('time');

    let dbtime = getModTime(time);

    if (!dbtime) {
        time = 'Permanent';
        dbtime = getModTime('99999d');
    }

    let reason = main_interaction.options.getString('reason') || 'No reason provided';

    const muted = await muteUser({
        user,
        mod: main_interaction.user,
        bot,
        guild: main_interaction.guild,
        reason,
        time,
        dbtime
    });

    if(muted.error) {
        return main_interaction.reply({
            content: muted.message,
            ephemeral: true
        }).catch(err => {});
    }
    
    return main_interaction.reply({
        embeds: [muted.message],
        ephemeral: true
    }).catch(err => {});
}

module.exports.data = new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Mute an user from the server')
    .addUserOption(option =>
        option.setName('user')
        .setDescription('The user to ban')
        .setRequired(true)
    )
    .addStringOption(option =>
        option.setName('time')    
        .setDescription('The time to ban the user for')
        .setRequired(false)
    )
    .addStringOption(option =>
        option.setName('reason')
        .setDescription('The reason for the ban')
        .setRequired(false)
    )