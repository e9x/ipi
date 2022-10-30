import { ip2locationPath } from "../lib/index.js";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import JSZip from "jszip";
import fetch from "node-fetch";
import { dirname } from "node:path";

const [, , downloadToken] = process.argv;

if (!downloadToken) throw new Error("You must specify a download token.");

try {
  await mkdir(dirname(ip2locationPath), { recursive: true });
} catch (err) {
  if ((err as NodeJS.ErrnoException).code !== "EEXIST") throw err;
}

// start with empty database
try {
  await unlink(ip2locationPath);
  console.log("Deleted old database");
} catch (err) {
  if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
}

const params = new URLSearchParams();

params.set("token", downloadToken);
params.set("file", "DB11LITEBINIPV6");

const res = await fetch(
  "https://www.ip2location.com/download/?" + params.toString()
);

// not binary data!
if (res.headers.get("content-type") === "text/html; charset=UTF-8") {
  const text = await res.text();

  switch (text) {
    case "NO PERMISSION":
      throw new Error("No permission.");
    case "THIS FILE CAN ONLY BE DOWNLOADED 5 TIMES PER HOUR":
      throw new Error("Database can only be downloaded 5 times per hour.");
    default:
      throw new Error(`Unknown error: ${text}`);
  }
}

const zip = new JSZip();

await zip.loadAsync(await res.arrayBuffer());

const { "IP2LOCATION-LITE-DB11.IPV6.BIN": bin } = zip.files;

if (!bin)
  throw new Error("Could not find IP2LOCATION-LITE-DB11.IPV6.BIN in zip.");

await writeFile(ip2locationPath, await bin.async("nodebuffer"));
