import { ip2locationPath } from "../lib/index.js";
import IL from "ip2location-nodejs";
import ipaddr from "ipaddr.js";
import { access } from "node:fs/promises";

const validateIP2Location = async () => {
  try {
    await access(ip2locationPath);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      console.error(`Directory: ${new URL("../dist/", import.meta.url)}`);
      throw new Error(
        `Couldn't access the ip2location bin. Make sure you saved the file as ip2location.bin and put it in the dist directory.`
      );
    } else throw err;
  }

  const il = new IL.IP2Location();
  il.open(ip2locationPath);

  const test = ipaddr.fromByteArray([0xde, 0xad, 0xbe, 0xef]);

  const res = il.getAll(test.toString());

  const badField =
    "This method is not applicable for current IP2Location binary data file. Please upgrade your subscription package to install new data file.";
  const requiredFields = [
    "ip",
    "ipNo",
    "countryShort",
    "countryLong",
    "region",
    "city",
    "zipCode",
    "latitude",
    "longitude",
    "timeZone",
  ] as (keyof typeof res)[];

  for (const field of requiredFields) {
    if (res[field] === badField)
      throw new Error(
        `The IP2Location database did not contain the field: ${field}. Make sure you selected at least DB11.`
      );
  }

  console.warn(
    "Although your database was successfully validated, this script won't validate if your database contains data from a DB higher than DB11.LITE."
  );

  console.warn(
    "We don't advise you to upload your database or publish this package if you are using a premium database. You won't see any additional fields from the IPI package if you use anything higher than DB11.LITE."
  );
};

export default validateIP2Location;
