const {
    checkActiveCommand
} = require("../../utils/functions/checkActiveCommand/checkActiveCommand");
const { getConfig } = require("../../utils/functions/data/getConfig");

module.exports.handleSlashCommands = async ({
    main_interaction,
    bot
}) => {

    let moderation = ['ban', 'infractions', 'isbanned', 'kick', 'mute', 'unban', 'unmute', 'purge', 'warn'];
    let fun = ['avatar', 'ship', 'guessnumber', 'cats', 'dogs'];
    let admin = ['modules', 'scam', 'autotranslate', 'settings', 'apply'];

    //=========================================================

    var {disabled_modules} = await getConfig({
        guild_id: main_interaction.guild.id,
    });

    disabled_modules = JSON.parse(disabled_modules);

    const module = moderation.indexOf(main_interaction.commandName) > -1 ? 'moderation' : fun.indexOf(main_interaction.commandName) > -1 ? 'fun' : false;

    if (module) {
        if (disabled_modules.indexOf(module) > -1) {
            return main_interaction.reply({
                content: `${module} is disabled.`,
                ephemeral: true
            }).catch(err => {});
        }
    }

    //=========================================================

    const isActive = await checkActiveCommand(main_interaction.commandName, main_interaction.guild.id);

    if (isActive.global_disabled) return main_interaction.reply({
        content: "This command is currently disabled in all Servers. Join the offical support discord For more informations.",
        ephemeral: true
    });
    if (!isActive.enabled) return main_interaction.reply({
        content: "This command is disabled in your Guild.",
        ephemeral: true
    });

    //=========================================================

    if (moderation.indexOf(main_interaction.commandName) !== -1) {
        return require(`./moderation/${main_interaction.commandName}`).run({
            main_interaction: main_interaction,
            bot: bot
        });
    } else if (fun.indexOf(main_interaction.commandName) !== -1) {
        return require(`./fun/${main_interaction.commandName}`).run({
            main_interaction: main_interaction,
            bot: bot
        });

    }else if(admin.indexOf(main_interaction.commandName) !== -1) {
        return require(`./admin/${main_interaction.commandName}`).run({
            main_interaction: main_interaction,
            bot: bot
        });
    } else {
        return require(`./${main_interaction.commandName}/${main_interaction.commandName}`).run({
            main_interaction: main_interaction,
            bot: bot
        });
    }
}