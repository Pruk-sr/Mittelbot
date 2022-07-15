const database = require("../../../src/db/db");
const { twitchApiClient } = require("../../../src/events/notfifier/twitch_notifier");
const { errorhandler } = require("../errorhandler/errorhandler");

module.exports.changeTwitchNotifier = async ({
    twitchchannel,
    twdcchannel,
    twpingrole,
    guild,
}) => {
    return new Promise(async (resolve, reject) => {
        const twitch_user = await twitchApiClient.users.getUserByName(twitchchannel);
        if (!twitch_user) {
            return reject(`❌ I couldn't find the channel you have entered.`)
        }

        const hasChannelPerms = guild.me.permissionsIn(twdcchannel).has(["VIEW_CHANNEL", "SEND_MESSAGES", "EMBED_LINKS", "ATTACH_FILES", "MENTION_EVERYONE"]);

        if (!hasChannelPerms) {
            reject(`❌ I don't have one of these permissions \`"VIEW_CHANNEL", "SEND_MESSAGES", "EMBED_LINKS", "ATTACH_FILES", "MENTION_EVERYONE"\`. Change them and try again.`)
            return;
        }

        var allChannelsFromGuild = await database.query(`SELECT * FROM twitch_streams WHERE guild_id = ?`, [guild.id])
        .then(res => {
            return {
                error: false,
                data: res
            }
        })
        .catch(err => {
            errorhandler({
                err,
                fatal: true
            })
            reject(`❌ Something went wrong while selecting all youtube channels. Please contact the Bot support.`)
            return {
                error: true
            };
        })

        if (allChannelsFromGuild.error) return;

        allChannelsFromGuild = allChannelsFromGuild.data;

        if(allChannelsFromGuild.length > 0) {
            var twChannelExists = allChannelsFromGuild.filter(channel => channel.channel_id === twitch_user.id)[0];
        }

        if (allChannelsFromGuild) {
            if (allChannelsFromGuild.length >= 3 && !twChannelExists) {
                return reject(`You already have 3 twitch channels. You have to delete one first.`)
            }
        }

        if (twChannelExists) {
            if (twitch_user.id === twChannelExists.channel_id && twdcchannel.id === twChannelExists.info_channel_id && twpingrole === twChannelExists.pingrole) {
                reject(`❌ You are trying to add the same config you've already added.`)
                return;
            }

            database.query(`UPDATE twitch_streams SET info_channel_id = ?, pingrole = ? WHERE guild_id = ? AND channel_id = ?`, [twdcchannel.id, (twpingrole) ? twpingrole.id : null, guild.id, twitch_user.id])
                .then(() => {
                    resolve(`✅ Successfully updated the twitch channel settings for ${twChannelExists.channel_name}.`)
                })
                .catch(err => {
                    errorhandler({
                        err,
                        fatal: true
                    });
                    reject('❌ Something went wrong while updating the data. Please contact the Bot support.')
                })
        } else {
            database.query(`INSERT INTO twitch_streams (guild_id, channel_id, info_channel_id, pingrole, channel_name) VALUES (?, ?, ?, ?, ?)`, [guild.id, twitch_user.id, twdcchannel.id, (twpingrole) ? twpingrole.id : null, twitchchannel])
                .then(() => {
                    resolve(`✅ Successfully added ${twitchchannel} to the notification list.`)
                })
                .catch(err => {
                    errorhandler({
                        err,
                        fatal: true
                    });
                    reject('❌ Something went wrong while adding the channel to the database. Please contact the Bot support.')
                })


        }

    })
}


module.exports.delTwChannelFromList = async ({
    guild_id,
    deltwchannel
}) => {
    return new Promise(async (resolve, reject) => {
        const twitch_user = await twitchApiClient.users.getUserByName(deltwchannel);
        if (!twitch_user) {
            return reject(`❌ I couldn't find the channel you have entered.`)
        }

        database.query(`DELETE FROM twitch_streams WHERE guild_id = ? AND channel_id = ?`, [guild_id, twitch_user.id])
            .then(() => {
                resolve('✅ Successfully removed the twitch channel to the notification list.')
            })
            .catch(err => {
                errorhandler({
                    err,
                    fatal: true
                });
                reject('❌ Something went wrong while removing the channel from the database. Please contact the Bot support.')
            })
    })
}