import { AsyncLocalStorage } from "node:async_hooks";
import { envConfig } from "../config/envConfig";

export default class Logger {
	static storage: AsyncLocalStorage<string>;
	private nameSpace: string;

	static setAsyncLocalStorage(asyncLocalStorage: AsyncLocalStorage<string>) {
		this.storage = asyncLocalStorage;
	}

	constructor(nameSpace: string) {
		this.nameSpace = nameSpace;
	}

	private readonly logPrefixes = {
		success: envConfig.isProd ? "" : "\x1b[32m",
		debug: "",
		info: envConfig.isProd ? "" : "\x1b[36m",
		warn: envConfig.isProd ? "" : "\x1b[33m",
		error: envConfig.isProd ? "" : "\x1b[31m",
	};

	public verbose(...optionalParams: any[]): void {
		if (envConfig.isProd) return;

		const reqId = Logger.storage.getStore();
		console.log(this.logPrefixes["success"], `${reqId} ${this.nameSpace}: `, ...optionalParams);
	}

	public debug(...optionalParams: any[]): void {
		const reqId = Logger.storage.getStore();
		console.debug(`${reqId} ${this.nameSpace}: `, ...optionalParams);
	}

	public info(...optionalParams: any[]): void {
		const reqId = Logger.storage.getStore();
		console.info(this.logPrefixes["info"], `${reqId} ${this.nameSpace}: `, ...optionalParams);
	}

	public warn(...optionalParams: any[]): void {
		const reqId = Logger.storage.getStore();
		console.warn(this.logPrefixes["warn"], `${reqId} ${this.nameSpace}: `, ...optionalParams);
	}

	public error(...optionalParams: any[]): void {
		const reqId = Logger.storage.getStore();
		console.error(this.logPrefixes["error"], `${reqId} ${this.nameSpace}: `, ...optionalParams);
	}
}
