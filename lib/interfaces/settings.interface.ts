import {IRouter} from "./router.interface";

export interface ISettings {
    host: string;
    port: number;
    name: string;
    environment: string;
    routers: IRouter[];
    loggerName?: string;
    debugLevel?: string;
    headers?: any;
}