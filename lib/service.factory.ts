import * as querystring from "querystring";
import * as requestJson from "request-json";
import {ERROR_LIST, YITError} from "./error.service";

export class ServiceFactory {
    private readonly methods: any;
    private readonly client: any;

    constructor(host: string, port: number) {
        this.methods = {};
        this.client = requestJson.createClient(`${host}:${port}`);
    }

    build(callName: string, path: string, method: string, successStatusCode: number, isResponseData?: boolean): void {
        this.methods[callName] = (data?: any, params?: any, headers?: any[]): Promise<any> => {
            return new Promise<any>((resolve, reject) => {
                let _path: string = path;
                if (params) {
                    Object.keys(params).forEach((param: string) => {
                        _path = _path.replace(':' + param, params[param]);
                    });
                }
                if (headers && headers.length > 0) {
                    headers.forEach((header: any) => {
                        this.client.headers[header.key] = header.value;
                    });
                }
                if (method.toLowerCase() === 'get') {
                    if (data) {
                        _path += '?' + querystring.stringify(data);
                    }
                    this.client.get(_path, (err: Error, res, body: any) => {
                        if (err) {
                            return reject(new YITError(500, err.message, ERROR_LIST.API));
                        } else {
                            if (res.statusCode !== successStatusCode) {
                                return reject(body);
                            } else {
                                if (isResponseData) {
                                    return resolve(body);
                                } else {
                                    return resolve();
                                }
                            }
                        }
                    });
                } else {
                    this.client[method](_path, data, (err: Error, res, body: any) => {
                        if (err) {
                            return reject(new YITError(500, err.message, ERROR_LIST.API));
                        } else {
                            if (res.statusCode !== successStatusCode) {
                                return reject(body);
                            } else {
                                if (isResponseData) {
                                    return resolve(body);
                                } else {
                                    return resolve();
                                }
                            }
                        }
                    });
                }
            });
        };
    }

    getMethods(): any {
        return this.methods;
    }
}