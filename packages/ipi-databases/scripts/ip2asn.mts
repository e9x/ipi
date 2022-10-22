import { ip2asnPath } from "../lib/index.js";
import assert from "assert";
import Database from "better-sqlite3";
import { mkdir, unlink } from "fs/promises";
import ipaddr from "ipaddr.js";
import type { IPv4, IPv6 } from "ipaddr.js";
import fetch from "node-fetch";
import { dirname } from "path";
import { createInterface } from "readline";
import { createGunzip } from "zlib";

try {
  await mkdir(dirname(ip2asnPath), { recursive: true });
} catch (err) {
  if ((err as NodeJS.ErrnoException).code !== "EEXIST") throw err;
}

// start with empty database
try {
  await unlink(ip2asnPath);
  console.log("Deleted old database");
} catch (err) {
  if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
}

const asnDB = new Database(ip2asnPath);

asnDB.exec(
  `CREATE TABLE asn (
	version INT NOT NULL,
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
	UNIQUE(version, range_start1, range_start2, range_start3, range_start4, range_end1, range_end2, range_end3, range_end4)
);`
);

type InsertData = [
  version: number,
  ...rangeStart: IPsegs,
  ...rangeEnd: IPsegs,
  asn: number,
  description: string
];

const insert = asnDB.prepare<InsertData>(
  "INSERT INTO asn (version,range_start1,range_start2,range_start3,range_start4,range_end1,range_end2,range_end3,range_end4,id,description) VALUES (?,?,?,?,?,?,?,?,?,?,?);"
);

const deleteASN = asnDB.prepare("DELETE FROM asn WHERE version = ?;");

type IPsegs = [number, number, number, number];

const splitIP = (ip: IPv4 | IPv6) => {
  if (ip.kind() === "ipv4") return [...ip.toByteArray()] as IPsegs;

  return [
    ...new Uint32Array(
      new Uint8Array(ip.toByteArray().reverse()).buffer
    ).reverse(),
  ] as IPsegs;
};

const insertMany = asnDB.transaction((version: 4 | 6, runs: InsertData[]) => {
  deleteASN.run(version);
  for (const run of runs) insert.run(...run);
});

for (const [version, url] of [
  [4, "https://iptoasn.com/data/ip2asn-v4.tsv.gz"],
  [6, "https://iptoasn.com/data/ip2asn-v6.tsv.gz"],
] as [version: 4 | 6, url: string][]) {
  const res = await fetch(url);

  if (!res.ok) throw new Error(`${url} was not OK`);

  const stream = res.body;

  assert(stream);

  // interface does not buffer.. however it does begin reading after stack ends
  const gz = createGunzip();
  const it = createInterface(gz);

  const run: InsertData[] = [];

  it.on("line", (line) => {
    const tag = line.indexOf("#");
    if (tag !== -1) line = line.slice(0, tag).trim();

    const split = line.split("\t");

    if (split.length < 5)
      throw new Error(`Invalid CSV data. Found ${JSON.stringify(split)}`);

    const [rangeStart, rangeEnd, id, , description] = split;

    const parsedID = parseInt(id);

    // not routed
    if (parsedID === 0) return;

    run.push([
      version,
      ...splitIP(ipaddr.parse(rangeStart)),
      ...splitIP(ipaddr.parse(rangeEnd)),
      parsedID,
      description,
    ]);
  });

  await new Promise<void>((resolve, reject) => {
    it.on("close", async () => {
      try {
        insertMany(version, run);
        resolve();
      } catch (error) {
        reject(error);
        return;
      }
    });
    gz.on("error", reject);
    stream.on("error", reject);
    stream.pipe(gz);
  });

  console.log(`Added ${run.length} IPv${version} ASN ranges.`);
}

console.log("dist/ip2asn.db is ready");
