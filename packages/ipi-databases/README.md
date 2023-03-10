# ipi-databases

<a href="https://www.npmjs.com/package/@e9x/ipi-databases"><img src="https://img.shields.io/npm/v/@e9x/ipi-databases.svg?maxAge=3600" alt="npm version" /></a>

This is a part of [IPI](https://www.npmjs.com/package/@e9x/ipi).

This package provides a compiled [IPtoASN](https://iptoasn.com/) database and a free [IP2Location](https://lite.ip2location.com/) database.

This site or product includes IP2Location LITE data available from [https://lite.ip2location.com](https://lite.ip2location.com).

## Compiling the ASN database

This will download data from [IPtoASN](https://iptoasn.com/) and compile a SQLite3 database.

```sh
$ npm run ip2asn
```

## Downloading the IP2Location database

- You will need your download token from [here](https://lite.ip2location.com/database-download).

```sh
$ npm run ip2location <download token>
```

## Verifying databases

This will make sure the IPtoASN database can be successfully queried and the IP2Location database returns correct data.

```sh
$ npm run prepublishOnly
```
