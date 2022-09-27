const {
    updateGlobalConfig
} = require("../utils/functions/data/ignoreMode");
const {
    errorhandler
} = require("../utils/functions/errorhandler/errorhandler");
const { stopBot } = require("./core/core");

module.exports.rateLimit = async ({rateLimitData}) => {
    errorhandler({
        err: rateLimitData,
        message: 'The bot hit the rate limit. Enable ignoremode automatically.'
    });

    updateGlobalConfig({
        valueName: 'ignoreMode',
        value: 1
    });

    return stopBot();
}