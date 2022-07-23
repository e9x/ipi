import IL, { Database } from 'async-ip2location';
import { createReadStream, createWriteStream } from 'fs';
import { mkdir, stat } from 'fs/promises';
import ipaddr, { IPv4, IPv6 } from 'ipaddr.js';
import fetch from 'node-fetch';
import { dirname, join, resolve } from 'path';
import { createInterface } from 'readline';
import { fileURLToPath } from 'url';
import { createGunzip } from 'zlib';

type Databases = 'asnV4' | 'asnV6';

export interface IPInfo {
	asn: number;
	asDescription: string;
	// derive from 2nd database
	city: string;
	region: string;
	zipCode: string;
	latitude: number;
	longitude: number;
	countryLong: string;
	countryShort: string;
}

const databaseURLs: { [key in Databases]: string } = {
	asnV4: 'https://iptoasn.com/data/ip2asn-v4.tsv.gz',
	asnV6: 'https://iptoasn.com/data/ip2asn-v6.tsv.gz',
};

const databases: {
	[key in Databases]: [
		rangeStart: number,
		rangeEnd: number,
		as: number,
		countryCode: string,
		asDescription: string
	][];
} = {
	asnV4: [],
	asnV6: [],
};

let il: Database;

// build cache

const __dirname = dirname(fileURLToPath(import.meta.url));

const cacheDir = resolve(__dirname, 'cache');

function ipToDecimal(ip: IPv4 | IPv6) {
	return parseInt(Buffer.from(ip.toByteArray()).toString('hex'), 16);
}

function loadCSV(stream: NodeJS.ReadableStream, key: Databases): Promise<void> {
	// interface does not buffer.. however it does begin reading after stack ends
	const gz = createGunzip();
	const it = createInterface(gz);

	it.on('line', (line) => {
		const split = line.split('\t');

		if (split.length < 5)
			throw new Error(`Invalid CSV data. Found ${JSON.stringify(split)}`);

		const [rangeStart, rangeEnd, as, countryCode, asDescription] = split;

		databases[key].push([
			ipToDecimal(ipaddr.parse(rangeStart)),
			ipToDecimal(ipaddr.parse(rangeEnd)),
			parseInt(as),
			countryCode,
			asDescription,
		]);
	});

	return new Promise((resolve, reject) => {
		it.on('close', () => resolve());
		stream.on('error', reject);

		stream.pipe(gz);
	});
}

async function loadASN(key: Databases, updateCache: boolean) {
	const cacheFile = join(cacheDir, key);

	if (!updateCache)
		try {
			return await loadCSV(createReadStream(cacheFile), key);
		} catch (error) {
			// ignore error
		}

	try {
		const cacheStats = await stat(cacheFile);
		const res = await fetch(databaseURLs[key], { method: 'HEAD' });

		for (const header of ['last-modified', 'content-length'])
			if (!res.headers.has(header))
				throw new Error(
					`did the API change? ${databaseURLs[key]} did not return ${header}...`
				);

		const lastModified = new Date(res.headers.get('last-modified')!);
		const contentLength = parseInt(res.headers.get('content-length')!);

		if (
			lastModified.getTime() <= cacheStats.mtimeMs ||
			contentLength === cacheStats.size
		)
			return await loadCSV(createReadStream(cacheFile), key);
	} catch (error) {
		// attempt to continue and fetch new cache
		// if (error?.code !== 'ENOENT') throw error;
	}

	const res = await fetch(databaseURLs[key]);
	const write = createWriteStream(cacheFile);

	res.body.pipe(write);

	await loadCSV(res.body, key);
}

/**
 *
 * Loads the ASN v4 database
 * @param updateCache
 */
export async function loadASNv4(updateCache = true) {
	await loadASN('asnV4', updateCache);
}

/**
 *
 * Loads the ASN v6 database
 * @param updateCache
 */
export async function loadASNv6(updateCache = true) {
	await loadASN('asnV6', updateCache);
}

/**
 *
 * Loads the dumped IP2LOCATION database
 * @param updateCache
 * @returns
 */
export async function loadDump(updateCache = true) {
	const file = 'IP2LOCATION-LITE-DB9.IPV6.BIN';
	const cacheFile = join(cacheDir, file);

	if (!updateCache)
		try {
			il = await IL(cacheFile);
		} catch (error) {
			// ignore error
		}

	const releases = <
		{
			name: string;
			assets: {
				name: string;
				browser_download_url: string;
			}[];
		}[]
	>await (await fetch('https://api.github.com/repos/e9x/ip2location-dumps/releases')).json();

	let bin: string;

	for (const release of releases)
		for (const asset of release.assets)
			if (asset.name === file) {
				bin = asset.browser_download_url;
				break;
			}

	if (!bin) throw new Error(`Bin wasn't released`);

	try {
		const cacheStats = await stat(cacheFile);
		const res = await fetch(bin, { method: 'HEAD' });

		for (const header of ['last-modified', 'content-length'])
			if (!res.headers.has(header)) throw new Error(`missing headers`);

		const lastModified = new Date(res.headers.get('last-modified')!);
		const contentLength = parseInt(res.headers.get('content-length')!);

		if (
			lastModified.getTime() <= cacheStats.mtimeMs &&
			contentLength === cacheStats.size
		) {
			il = await IL(cacheFile);
			return;
		}
	} catch (error) {
		// attempt to continue and fetch new cache
		// if (error?.code !== 'ENOENT') throw error;
	}

	const res = await fetch(bin);
	const write = createWriteStream(cacheFile);

	return new Promise<void>((resolve, reject) => {
		write.on('close', async () => {
			il = await IL(cacheFile);
			resolve();
		});

		write.on('close', (error) => {
			reject(error);
		});

		res.body.pipe(write);
	});
}

/**
 *
 * Loads all dumps and databases
 * @param updateCache
 */
export async function loadDatabases(updateCache = true) {
	try {
		await mkdir(cacheDir);
	} catch (error) {
		if (error?.code !== 'EEXIST') throw error;
	}

	const promises = [
		loadDump(updateCache),
		loadASNv4(updateCache),
		loadASNv6(updateCache),
	];

	await Promise.all(promises);
}

/**
 *
 * Returns information about the IP
 * @param ip IP address
 * @returns IPInfo - When success is false, all values are filled with placeholders.
 */
export default async function ipInfo(
	ip: string
): Promise<IPInfo & { success: boolean }> {
	const parsedIP = ipaddr.parse(ip);
	const decimalIP = ipToDecimal(parsedIP);

	const database =
		parsedIP.kind() === 'ipv4' ? databases.asnV4 : databases.asnV6;

	for (const row of database) {
		if (row[0] <= decimalIP && row[1] >= decimalIP) {
			const geoData = await il.get_all(ip);

			// can't query geo database
			if (geoData.status !== 'OK') break;

			return {
				success: true,
				asn: row[2],
				asDescription: row[4],
				city: geoData.city,
				region: geoData.region,
				zipCode: geoData.zipcode,
				latitude: geoData.latitude,
				longitude: geoData.longitude,
				countryLong: geoData.country_long,
				countryShort: geoData.country_short,
			};
		}
	}

	return {
		success: false,
		asn: 0,
		asDescription: 'Unassigned',
		city: '-',
		region: '-',
		zipCode: '-',
		latitude: 0,
		longitude: 0,
		countryLong: '-',
		countryShort: '-',
	};
}
