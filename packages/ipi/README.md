# IPI (IP-Info)

<a href="https://www.npmjs.com/package/@e9x/ipi"><img src="https://img.shields.io/npm/v/@e9x/ipi.svg?maxAge=3600" alt="npm version" /></a>

A free library/cli tool to get IP information.

## Performance

Due to the nature of libraries used (SQLite3, IP2Location), this project is seemingly littered with synchronous operations.

Despite this, this project still delivers reasonable runtime performance that beats using an API.

Benchmarks: (not quite accurate, tested on my development machine)

| test        | ms    |
| ----------- | ----- |
| `require()` | 44.36 |
| `ipi()`     | 0.066 |

An extreme solution to the blocking API is wrapping the API with [piscina](https://www.npmjs.com/package/piscina).

## CLI

Install the CLI tool globally:

```sh
$ npm install --location=global @e9x/ipi
```

> If you encounter a read/write error when running the tool after installing globally on Linux, refer to https://github.com/sindresorhus/guides/blob/main/npm-global-without-sudo.md

The CLI syntax is as follows:

```
Usage: ipi <IP>

IP-Info cli

Arguments:
  IP          IP address. Can be IPv4 or IPv6.
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

Install the dependency:

```sh
$ npm i @e9x/ipi
```

See [examples/](https://github.com/e9x/ipi/tree/master/packages/ipi/examples) for examples of the API.

## Usage in libraries

As of v2.0.0-beta, this package is safe to use in libraries! Data fetching is done when publishing the package.
