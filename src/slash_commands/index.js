const { EmbedBuilder } = require('discord.js');
const {
    checkActiveCommand,
} = require('../../utils/functions/checkActiveCommand/checkActiveCommand');
const Modules = require('../../utils/functions/data/Modules');

module.exports.handleSlashCommands = async ({ main_interaction, bot }) => {
    const moduleApi = new Modules(main_interaction.guild.id, bot);
    const defaultSettings = moduleApi.getDefaultSettings();

    const admin = [
        'modules',
        'scam',
        'autotranslate',
        'settings',
        'levelsettings',
        'automod',
        'modroles',
        'log',
        'autoblacklist',
        'joinroles',
        'warnroles',
        'reactionroles',
        'autodelete',
        'banappeal',
        'tickets',
        'muterole',
        'language',
    ];
    const help = ['help', 'tutorial'];
    const notifications = ['twitch', 'youtube', 'reddit_notifier'];

    const moderation = defaultSettings.moderation.extraCommands;
    const fun = defaultSettings.fun.extraCommands;
    const level = defaultSettings.level.extraCommands;
    const utils = defaultSettings.utils.extraCommands;
    const music = defaultSettings.music.extraCommands;

    //=========================================================

    function isEnabled(requestedModule) {
        return new Promise(async (resolve) => {
            const moduleStatus = await moduleApi
                .checkEnabled(requestedModule.name || requestedModule)
                .catch(() => {
                    return false;
                });

            if (moduleStatus.enabled === false) {
                main_interaction
                    .reply({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(
                                    global.t.trans(
                                        ['error.modules.notEnabled', moduleStatus.name],
                                        main_interaction.guild.id
                                    )
                                )
                                .setColor(global.t.trans(['general.colors.error'])),
                        ],
                        ephemeral: true,
                    })
                    .catch((err) => {});
                resolve(false);
            }

            resolve(true);
        });
    }

    //=========================================================
    const isActive = await checkActiveCommand(
        main_interaction.commandName,
        main_interaction.guild.id
    );

    if (isActive.global_disabled) {
        return main_interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setDescription(
                        global.t.trans(['error.commands.globalDisabled'], main_interaction.guild.id)
                    )
                    .setColor(global.t.trans(['general.colors.error'])),
            ],
            ephemeral: true,
        });
    }

    if (!isActive.enabled) {
        return main_interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setDescription(
                        global.t.trans(
                            ['error.commands.disabledOnGuild'],
                            main_interaction.guild.id
                        )
                    )
                    .setColor(global.t.trans(['general.colors.error'])),
            ],
            ephemeral: true,
        });
    }

    //=========================================================

    if (moderation.indexOf(main_interaction.commandName) !== -1) {
        if (!(await isEnabled(defaultSettings.moderation))) return;
        return requireModule('moderation');
    }

    if (fun.indexOf(main_interaction.commandName) !== -1) {
        if (!(await isEnabled(defaultSettings.fun))) return;
        return requireModule('fun');
    }

    if (admin.indexOf(main_interaction.commandName) !== -1) {
        if (!(await isEnabled(main_interaction.commandName))) return;
        return requireModule('admin');
    }

    if (level.indexOf(main_interaction.commandName) !== -1) {
        if (!(await isEnabled(defaultSettings.level))) return;
        return requireModule('level');
    }

    if (utils.indexOf(main_interaction.commandName) !== -1) {
        if (!(await isEnabled(defaultSettings.utils))) return;
        return requireModule('utils');
    }

    if (help.indexOf(main_interaction.commandName) !== -1) {
        return requireModule('help');
    }

    if (notifications.indexOf(main_interaction.commandName) !== -1) {
        if (!(await isEnabled(main_interaction.commandName))) return;
        return requireModule('notifications');
    }

    if (music.indexOf(main_interaction.commandName) !== -1) {
        if (!(await isEnabled(defaultSettings.music))) return;
        return requireModule('music');
    }

    if (!(await isEnabled(main_interaction.commandName))) return;
    return require(`./${main_interaction.commandName}/${main_interaction.commandName}`).run({
        main_interaction: main_interaction,
        bot: bot,
    });

    function requireModule(requestedModule) {
        return require(`./${requestedModule}/${main_interaction.commandName}`).run({
            main_interaction: main_interaction,
            bot: bot,
        });
    }
};
