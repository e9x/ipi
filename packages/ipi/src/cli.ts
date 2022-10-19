import ipi from "./index.js";

const [, , ip] = process.argv;

if (!ip) throw new Error("You must specify an IP address.");

const info = ipi(ip);
console.log(info);
