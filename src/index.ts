import createConfig from './config.js';
import Database from 'better-sqlite3';
import { createWriteStream, mkdirSync } from 'fs';
import { access, stat } from 'fs/promises';
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
	asnV4ETag: '',
	asnV6ETag: '',
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
	const etagKey = key === 'asnV4' ? 'asnV4ETag' : 'asnV6ETag';

	if (config.get(etagKey) && !updateCache) return;

	try {
		const res = await fetch(databaseURLs[key], { method: 'HEAD' });

		if (config.get(etagKey) && res.headers.get('etag') <= config.get(etagKey))
			return;
	} catch (error) {
		// attempt to continue and fetch new cache
		// if (error?.code !== 'ENOENT') throw error;
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
				else insertMany(4, runV6);
				config.set(etagKey, res.headers.get('etag'));
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

async function loadDump(updateCache = true) {
	if (!updateCache)
		try {
			await access(ip2locationCacheFile);
			il.open(ip2locationCacheFile);
			return;
		} catch (error) {
			// ignore error
		}

	const releasesRes = await fetch(
		'https://api.github.com/repos/e9x/ip2location-dumps/releases'
	);

	if (!releasesRes.ok)
		throw new Error(
			(
				(await releasesRes.json()) as {
					message: string;
					documentation_url: string;
				}
			).message
		);

	const releases = <
		{
			name: string;
			assets: {
				name: string;
				browser_download_url: string;
			}[];
		}[]
	>await releasesRes.json();

	let bin: string;

	for (const release of releases)
		for (const asset of release.assets)
			if (asset.name === ip2locationFile) {
				bin = asset.browser_download_url;
				break;
			}

	if (!bin) throw new Error(`Bin wasn't released`);

	try {
		const cacheStats = await stat(ip2locationCacheFile);
		const res = await fetch(bin, { method: 'HEAD' });

		for (const header of ['last-modified', 'content-length'])
			if (!res.headers.has(header)) throw new Error(`missing headers`);

		const lastModified = new Date(res.headers.get('last-modified')!);
		const contentLength = parseInt(res.headers.get('content-length')!);

		if (
			lastModified.getTime() <= cacheStats.mtimeMs &&
			contentLength === cacheStats.size
		) {
			il.open(ip2locationCacheFile);
			return;
		}
	} catch (error) {
		// attempt to continue and fetch new cache
		// if (error?.code !== 'ENOENT') throw error;
	}

	const res = await fetch(bin);
	const write = createWriteStream(ip2locationCacheFile);

	return new Promise<void>((resolve, reject) => {
		write.on('close', async () => {
			il.open(ip2locationCacheFile);
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
 * @param updateCache
 */
export async function openDatabases(updateCache = true) {
	await Promise.all([
		loadDump(updateCache),
		loadASN('asnV4', updateCache),
		loadASN('asnV6', updateCache),
	]);
}

const select = asnDB.prepare(
	'SELECT description,id FROM asn WHERE type = ? AND range_start1 <= ? AND range_start2 <= ? AND range_start3 <= ? AND range_start4 <= ? AND range_end1 >= ? AND range_end2 >= ? AND range_end3 >= ? AND range_end4 >= ? LIMIT 1;'
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

	const data = <{ description: string; id: number }>(
		select.get(parsedIP.kind() === 'ipv4' ? 4 : 6, ...split, ...split)
	);

	if (data) {
		const geoData = il.getAll(ip);

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
