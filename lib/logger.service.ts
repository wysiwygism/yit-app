import log4js = require('log4js');

let logger = null;

export const LoggerService: any = {
    init: (loggerName: string, debugLevel: string) => {
        const appenders: any = {};
        appenders[loggerName] = { type: 'stdout' };
        log4js.configure({
            appenders: appenders,
            categories: { default: { appenders: [loggerName], level: debugLevel } }
        });
        logger = log4js.getLogger(loggerName);
    },
    getLogger: () => {
        return logger;
    }
};