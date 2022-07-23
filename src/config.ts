import { constants } from 'fs';
import { access, writeFile, readFile } from 'fs/promises';

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

		if (!this.writeTimeout)
			this.writeTimeout = setTimeout(async () => {
				await writeFile(this.file, JSON.stringify(this.data));
			});
	}
}

export default async function createConfig<T extends Object>(
	file: string,
	defaultConfig: () => Promise<T> | T
): Promise<Config<T>> {
	try {
		await access(file, constants.R_OK | constants.W_OK);
	} catch (error) {
		if (error?.code !== 'ENOENT') throw error;
		await writeFile(file, JSON.stringify(await defaultConfig()));
	}

	return new Config<T>(file, JSON.parse(await readFile(file, 'utf-8')));
}
