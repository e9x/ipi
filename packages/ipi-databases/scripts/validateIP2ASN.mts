import { ip2asnPath } from "../lib/index.js";
import Database from "better-sqlite3";
import { access } from "node:fs/promises";

const validateIP2ASN = async () => {
  try {
    await access(ip2asnPath);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      console.error(`Directory: ${new URL("../dist/", import.meta.url)}`);
      throw new Error("Could not access ip2asn.db.");
    } else throw err;
  }

  const db = new Database(ip2asnPath);

  const select = db.prepare<{
    version: 4 | 6;
  }>(`SELECT * FROM asn WHERE version = :version LIMIT 1;`);

  if (
    (select.get({ version: 4 }) as undefined | { version: number })?.version !==
    4
  )
    throw new Error("Validation failed.");

  if (
    (select.get({ version: 6 }) as undefined | { version: number })?.version !==
    6
  )
    throw new Error("Validation failed.");
};

export default validateIP2ASN;
