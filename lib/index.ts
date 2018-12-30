import * as bodyParser from 'body-parser'
import * as _ from 'underscore'
import {Request, Response, NextFunction, Application, Router} from "express";
import * as express from "express";
import {YITError} from "yit-error";
import {LoggerService} from "./logger.service";

export {LoggerService} from "./logger.service";
let Logger = null;

interface IRouter {
    router: Router;
    path: string;
}

export { IRouter }

interface ISettings {
    host: string;
    port: number;
    name: string;
    environment: string;
    routers: IRouter[];
    loggerName?: string;
    debugLevel?: string;
    headers?: any;
}

export { ISettings }

class App {
    express: Application;
    settings: ISettings;
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
        this.express.use((request: Request, response: Response, next: NextFunction) => {
            response['errorResponse'] = (err: YITError): Response => {
                return response.status(err.statusCode).json(err);
            };
            next();
        });
        this.express.get('/ping', function (request: Request, response: Response) {
            return response.status(200).json({ status: 'OK' });
        });
    }

    private mountRouters(): void {
        this.settings.routers.forEach((router: IRouter) => {
            this.express.use(router.path, router.router);
        });
        this.express.all('*', (request: Request, response: Response, next: NextFunction) => {
            return response.status(404).json({
                error: "Resource not found"
            });
        });
        this.express.use((err: Error, request: Request, response: Response, next: NextFunction) => {
            if (err) {
                if (err.name === 'UnauthorizedError') {
                    return response.status(401).json({error: err.message});
                } else {
                    return response.status(500).json({error: err.message});
                }
            }
            next();
        });
    }

    private setLogger(): void {
        LoggerService.init(this.settings.loggerName, this.settings.debugLevel);
        Logger = LoggerService.getLogger();
    }

    public listen(): Promise<void> {
        return new Promise((resolve, reject) => {
            let self = this;
            this.express.listen(this.settings.port, this.settings.host, function (err: Error) {
                if (err) {
                    return reject(err);
                } else {
                    Logger.info('App: ' + self.settings.name);
                    Logger.info('Configuration: ' + self.settings.environment);
                    Logger.info('Listening on: ' + self.settings.host + ':' + self.settings.port);
                    return resolve();
                }
            });
        });
    }

    public getApp(): express.Application {
        return this.express;
    }
}

export { App }