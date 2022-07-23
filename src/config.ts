import { constants, writeFileSync } from 'fs';
import { accessSync, readFileSync } from 'fs';

export class Config<T extends Object> {
	data: T;
	file: string;
	writeTimeout: unknown | undefined;
	constructor(file: string, data: T) {
		this.data = data;
		this.file = file;
	}
	get<K extends keyof T>(key: K): T[K] {
		return this.data[key];
	}
	set<K extends keyof T>(key: K, value: T[K]) {
		this.data[key] = value;
		writeFileSync(this.file, JSON.stringify(this.data));
	}
}

export default function createConfig<T extends Object>(
	file: string,
	defaultConfig: () => T
): Config<T> {
	try {
		accessSync(file, constants.R_OK | constants.W_OK);
	} catch (error) {
		if (error?.code !== 'ENOENT') throw error;
		writeFileSync(file, JSON.stringify(defaultConfig()));
	}

	return new Config<T>(file, JSON.parse(readFileSync(file, 'utf-8')));
}
