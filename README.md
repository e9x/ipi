# IPI (IP-Info)

A quick tool to fetch IP information.

> Due to the nature of the databases used (SQLITE, IP2Location), this project is littered with synchronous operations. If you're looking for a fully asynchronous API, this will not satisfy you. There are solutions such as wrapping this API for [piscina](https://www.npmjs.com/package/piscina).

## Performance

This API is very fast once the databases are built.

- Querying IP information: `9.528ms`
- Loading built databases (Without attempting to update): `31.405ms`
- Loading built databases: `323.644ms`
- Building ASN databases: `3.521s`
- Building IP2Location databases: `3.927s`

## CLI

> This tool will take ~15 seconds to initialize when first running. This tool caches the IP2Location database and creates an ASN database from [iptoasn.com](https://iptoasn.com/).

Install the CLI tool globally:

```sh
$ npm i --global @e9x/ipi
```

> If you encounter a read/write error when running the tool after installing globally on LINUX, refer to https://github.com/sindresorhus/guides/blob/main/npm-global-without-sudo.md

The CLI syntax is as follows:

```
Usage: ipi [options] <IP>

IP-Info cli

Arguments:
  IP                 IP address. Can be IPv4 or IPv6

Options:
  --update  If cache should be updated. If cache doesn't exist, this option will be ignored.
  -h, --help         display help for command

Commands:
  delete             Deletes the IP databases
```

Example:

```sh
$ node ./dist/cli.js 2607:f188::dead:beef:cafe:fed1
{
  success: true,
  asn: 21769,
  asd: 'AS-COLOAM',
  city: 'Las Vegas',
  region: 'Nevada',
  zipCode: '89136',
  timezone: '-07:00',
  latitude: 36.174969,
  longitude: -115.137222,
  countryLong: 'United States of America',
  countryShort: 'US'
}
```

## API

Install the dependency:

```sh
$ npm i @e9x/ipi
```

API documentation can be found [here](https://github.com/e9x/ipi/blob/master/API.md)

Example:

```js
import ipi, { openDatabases } from './index.js';

// openDatabases must be called before ipi
// true - check for updated databases
// false - load cached (if exists, otherwise it will load updated databases anyway)
await openDatabases(true);
console.log(ipi('2607:f188::dead:beef:cafe:fed1'));
console.log(ipi('190.239.202.254'));
```

## Good practices

When used as an API, occasionally call `openDatabases(true)`. This will check for updated databases and loads them. IP to ASN updates hourly, IP2Location updates bi-weekly.

## Usage in libraries

This API shouldn't be used in a library. If IP information is required, make the user pass the information from this library or require the user to call `openDatabases()` on their behalf.
