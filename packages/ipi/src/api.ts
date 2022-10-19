import conditionIP from "./conditionIP.js";
import { ip2asnPath, ip2locationPath } from "@e9x/ipi-databases";
import Database from "better-sqlite3";
import { IP2Location } from "ip2location-nodejs";
import type { IPv4, IPv6 } from "ipaddr.js";
import ipaddr from "ipaddr.js";

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

type IPsegs = [number, number, number, number];

const splitIP = (ip: IPv4 | IPv6) => {
  if (ip.kind() === "ipv4") return [...ip.toByteArray()] as IPsegs;

  return [
    ...new Uint32Array(
      new Uint8Array(ip.toByteArray().reverse()).buffer
    ).reverse(),
  ] as IPsegs;
};

const il = new IP2Location();
const asnDB = new Database(ip2asnPath, { readonly: true });

il.open(ip2locationPath);

type SelectResult = { description: string; id: number };

const select = asnDB.prepare<{
  version: 4 | 6;
  ip1: number;
  ip2: number;
  ip3: number;
  ip4: number;
}>(
  `SELECT description,id FROM asn WHERE version = :version AND ${conditionIP} LIMIT 1;`
);

/**
 *
 * Returns information about the IP
 * @param ip IP address
 * @returns If successful, IP information, otherwise undefined.
 */
const ipInfo = (ip: string) => {
  const parsedIP = ipaddr.parse(ip);

  const split = splitIP(parsedIP);

  const data = select.get({
    version: parsedIP.kind() === "ipv4" ? 4 : 6,
    ip1: split[0],
    ip2: split[1],
    ip3: split[2],
    ip4: split[3],
  }) as SelectResult;

  if (!data) return; // not routed

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
  } as IPInfo;
};

export default ipInfo;
