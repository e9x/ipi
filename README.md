# IPI (IP-Info)

<a href="https://www.npmjs.com/package/@e9x/ipi"><img src="https://img.shields.io/npm/v/@e9x/ipi.svg?maxAge=3600" alt="npm version" /></a>

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
  IP          IP address. Can be IPv4 or IPv6

Options:
  --update    If cache should be updated. If cache doesn't exist, this option will be ignored. (default: false)
  -h, --help  display help for command
```

Example:

```sh
$ ipi 2607:f188::dead:beef:cafe:fed1
```

```js
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

API documentation is no longer provided. The typedefs included in the NPM package should be enough to understand the API.

Install the dependency:

```sh
$ npm i @e9x/ipi
```

See [examples/](examples/) for examples of the API.

## Usage in libraries

As of v2.0.0-beta, this package is safe to use in libraries! Data fetching is done when publishing the package.
