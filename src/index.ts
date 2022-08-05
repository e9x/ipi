import conditionIP from './conditionIP.js';
import createConfig from './config.js';
import Database from 'better-sqlite3';
import { createWriteStream, mkdirSync } from 'fs';
import { access } from 'fs/promises';
import IL from 'ip2location-nodejs';
import ipaddr from 'ipaddr.js';
import fetch from 'node-fetch';
import { dirname, join } from 'path';
import { createInterface } from 'readline';
import { fileURLToPath } from 'url';
import { createGunzip } from 'zlib';

export interface IPInfo {
	asn: number;
	asd: string;
	// derive from 2nd database
	city: string;
	region: string;
	zipCode: string;
	timezone: string;
	latitude: number;
	longitude: number;
	countryLong: string;
	countryShort: string;
}

type Databases = 'asnV4' | 'asnV6';

const binReleasesURL =
	'https://api.github.com/repos/e9x/ip2location-dumps/releases';

const databaseURLs: { [key in Databases]: string } = {
	asnV4: 'https://iptoasn.com/data/ip2asn-v4.tsv.gz',
	asnV6: 'https://iptoasn.com/data/ip2asn-v6.tsv.gz',
};

const __dirname = dirname(fileURLToPath(import.meta.url));

const cacheDir = join(__dirname, '..', 'cache');
const asnDBFile = join(cacheDir, 'asn.db');
const ip2locationFile = 'IP2LOCATION-LITE-DB11.IPV6.BIN';
const ip2locationCacheFile = join(cacheDir, ip2locationFile);

try {
	mkdirSync(cacheDir);
} catch (error) {
	if (error?.code !== 'EEXIST') throw error;
}

const il = new IL.IP2Location();
const asnDB = new Database(asnDBFile);
const config = createConfig(join(cacheDir, 'data.json'), () => ({
	asnV4Modified: 0,
	asnV6Modified: 0,
	binModified: '',
	createdTables: false,
}));

if (!config.get('createdTables')) {
	asnDB.prepare(`DROP TABLE IF EXISTS asn;`).run();

	asnDB
		.prepare(
			`CREATE TABLE asn (
	type INT NOT NULL,
	range_start1 INT NOT NULL,
	range_start2 INT NOT NULL,
	range_start3 INT NOT NULL,
	range_start4 INT NOT NULL,
	range_end1 INT NOT NULL,
	range_end2 INT NOT NULL,
	range_end3 INT NOT NULL,
	range_end4 INT NOT NULL,
	id INT NOT NULL,
	description TEXT NOT NULL,
	UNIQUE(type, range_start1, range_start2, range_start3, range_start4, range_end1, range_end2, range_end3, range_end4)
);`
		)
		.run();

	config.set('createdTables', true);
}

function splitIP(ip) {
	if (ip.kind() === 'ipv4') return ip.toByteArray();

	return new Uint32Array(
		new Uint8Array(ip.toByteArray().reverse()).buffer
	).reverse();
}

const insert = asnDB.prepare(
	'INSERT INTO asn (type,range_start1,range_start2,range_start3,range_start4,range_end1,range_end2,range_end3,range_end4,id,description) VALUES (?,?,?,?,?,?,?,?,?,?,?);'
);

const deleteASN = asnDB.prepare('DELETE FROM asn WHERE type = ?;');

const insertMany = asnDB.transaction((type: 4 | 6, runs: unknown[][]) => {
	deleteASN.run(type);
	for (const run of runs) insert.run(...run);
});

async function loadASN(key: Databases, updateCache: boolean) {
	const cacheKey = key === 'asnV4' ? 'asnV4Modified' : 'asnV6Modified';

	if (config.get(cacheKey)) {
		if (!updateCache) return;

		try {
			const res = await fetch(databaseURLs[key], { method: 'HEAD' });
			const modified = new Date(res.headers.get('last-modified')!).getTime();
			if (modified < config.get(cacheKey)) return;
		} catch (error) {
			// continue
		}
	}

	const res = await fetch(databaseURLs[key]);

	const stream = res.body;

	// interface does not buffer.. however it does begin reading after stack ends
	const gz = createGunzip();
	const it = createInterface(gz);

	const runV4 = [];
	const runV6 = [];

	it.on('line', (line) => {
		const tag = line.indexOf('#');
		if (tag !== -1) line = line.slice(0, tag).trim();

		const split = line.split('\t');

		if (split.length < 5)
			throw new Error(`Invalid CSV data. Found ${JSON.stringify(split)}`);

		const [rangeStart, rangeEnd, id, , description] = split;

		if (key === 'asnV4')
			runV4.push([
				4,
				...splitIP(ipaddr.parse(rangeStart)),
				...splitIP(ipaddr.parse(rangeEnd)),
				parseInt(id),
				description,
			]);
		else
			runV6.push([
				6,
				...splitIP(ipaddr.parse(rangeStart)),
				...splitIP(ipaddr.parse(rangeEnd)),
				parseInt(id),
				description,
			]);
	});

	return new Promise<void>((resolve, reject) => {
		it.on('close', async () => {
			try {
				if (key === 'asnV4') insertMany(4, runV4);
				else insertMany(6, runV6);
				config.set(
					cacheKey,
					// add 3 hours to offset iptoasn not purging cache
					new Date(res.headers.get('last-modified')!).getTime() + 60e3 * 60 * 3
				);
				resolve();
			} catch (error) {
				reject(error);
				return;
			}
		});
		gz.on('error', reject);
		stream.on('error', reject);
		stream.pipe(gz);
	});
}

async function loadDump(updateCache) {
	if (!updateCache)
		try {
			await access(ip2locationCacheFile);
			il.open(ip2locationCacheFile);
			return;
		} catch (error) {
			// ignore error
		}

	const releasesRes = await fetch(binReleasesURL);

	if (!releasesRes.ok)
		throw new Error(
			(
				(await releasesRes.json()) as {
					message: string;
					documentation_url: string;
				}
			).message
		);

	interface Asset {
		name: string;
		updated_at: string;
		browser_download_url: string;
	}

	const releases = <
		{
			name: string;
			assets: Asset[];
		}[]
	>await releasesRes.json();

	let bin: Asset;

	// github orders from oldest->newest releases
	releases.reverse();

	rel: for (const release of releases)
		for (const asset of release.assets)
			if (asset.name === ip2locationFile) {
				bin = asset;
				break rel;
			}

	if (!bin) throw new Error(`Bin wasn't released`);

	if (bin.updated_at === config.get('binModified'))
		try {
			{
				await access(ip2locationCacheFile);
				il.open(ip2locationCacheFile);
				return;
			}
		} catch (error) {
			// attempt to continue and fetch new cache
			// if (error?.code !== 'ENOENT') throw error;
		}

	const res = await fetch(bin.browser_download_url);
	const write = createWriteStream(ip2locationCacheFile);

	return new Promise<void>((resolve, reject) => {
		write.on('close', async () => {
			il.open(ip2locationCacheFile);
			config.set('binModified', bin.updated_at);
			resolve();
		});

		write.on('error', (error) => {
			reject(error);
		});

		res.body.pipe(write);
	});
}

/**
 * Closes databases
 */
export async function closeDatabases() {
	await il.close();
	asnDB.close();
}

/**
 *
 * Loads/initializes databases. If there is no database present in cache, updateCache will be ignored in order to initialize the databases.
 * @param updateCache If cache should be checked for updates. Default is to not check for updates.
 */
export async function openDatabases(updateCache = false) {
	await Promise.all([
		loadDump(updateCache),
		loadASN('asnV4', updateCache),
		loadASN('asnV6', updateCache),
	]);
}

const select = asnDB.prepare(
	`SELECT description,id FROM asn WHERE type = :type AND ${conditionIP} LIMIT 1;`
);

/**
 *
 * Returns information about the IP
 * @param ip IP address
 * @returns IPInfo - When success is false, all values are filled with placeholders.
 */
export default function ipInfo(ip: string): IPInfo & { success: boolean } {
	const parsedIP = ipaddr.parse(ip);

	const split = splitIP(parsedIP);

	const data = <{ description: string; id: number }>select.get({
		type: parsedIP.kind() === 'ipv4' ? 4 : 6,
		ip1: split[0],
		ip2: split[1],
		ip3: split[2],
		ip4: split[3],
	});

	if (data) {
		const geoData = il.getAll(parsedIP.toString());

		return {
			success: true,
			asn: data.id,
			asd: data.description,
			city: geoData.city,
			region: geoData.region,
			zipCode: geoData.zipCode,
			timezone: geoData.timeZone,
			latitude: Number(geoData.latitude),
			longitude: Number(geoData.longitude),
			countryLong: geoData.countryLong,
			countryShort: geoData.countryShort,
		};
	}

	return {
		success: false,
		asn: 0,
		asd: 'Unassigned',
		city: '-',
		region: '-',
		zipCode: '0',
		timezone: 'CST',
		latitude: 0,
		longitude: 0,
		countryLong: '-',
		countryShort: '-',
	};
}
