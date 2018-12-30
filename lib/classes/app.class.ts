import {Request, Response, NextFunction, Application, Router} from "express";
import {IRouter} from "../interfaces/router.interface";
import {ISettings} from "../interfaces/settings.interface";
import {LoggerService} from "../logger.service";
import * as _ from 'underscore'
import * as express from "express";
import * as bodyParser from 'body-parser'
import {ERROR_LIST, YITError} from "../error.service";

export class App {
    express: Application;
    settings: ISettings;
    logger: any;
    defaultSettings: ISettings = {
        host: '127.0.0.1',
        port: 3000,
        name: 'undefined',
        environment: 'undefined',
        routers: [],
        headers: null,
        loggerName: 'app',
        debugLevel: 'info'
    };

    constructor(settings: ISettings) {
        this.settings = _.extend(this.defaultSettings, settings);
        this.express = express();
        this.setHeaders();
        this.setLogger();
        this.mountRouters();
        return this;
    }

    private setHeaders(): void {
        this.express.use(bodyParser.json({ limit: '50mb' }));
        this.express.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));
        this.express.get('/ping', function (request: Request, response: Response) {
            return response.status(200).json({ status: 'OK' });
        });
    }

    private mountRouters(): void {
        this.settings.routers.forEach((router: IRouter) => {
            this.express.use(router.path, router.router);
        });
        this.express.all('*', (request: Request, response: Response, next: NextFunction) => {
            return response.status(404).json(new YITError(404, 'Resource not found', ERROR_LIST.NOT_FOUND));
        });
        this.express.use((err: Error, request: Request, response: Response, next: NextFunction) => {
            if (err) {
                if (err.name === 'UnauthorizedError') {
                    return response.status(401).json(new YITError(401, 'Unauthorized', ERROR_LIST.AUTH));
                } else {
                    return response.status(500).json(new YITError(500, err.message, ERROR_LIST.SERVER));
                }
            }
            next();
        });
    }

    private setLogger(): void {
        LoggerService.init(this.settings.loggerName, this.settings.debugLevel);
        this.logger = LoggerService.getLogger();
    }

    public listen(): Promise<void> {
        return new Promise((resolve, reject) => {
            let self = this;
            this.express.listen(this.settings.port, this.settings.host, (err: Error) => {
                if (err) {
                    return reject(err);
                } else {
                    this.logger.info('App: ' + self.settings.name);
                    this.logger.info('Configuration: ' + self.settings.environment);
                    this.logger.info('Listening on: ' + self.settings.host + ':' + self.settings.port);
                    return resolve();
                }
            });
        });
    }
}