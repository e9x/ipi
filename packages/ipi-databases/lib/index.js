"use strict";

const { join } = require("node:path");

const ip2asnPath = join(__dirname, "..", "dist", "ip2asn.db");
exports.ip2asnPath = ip2asnPath;

const ip2locationPath = join(__dirname, "..", "dist", "ip2location.bin");
exports.ip2locationPath = ip2locationPath;
