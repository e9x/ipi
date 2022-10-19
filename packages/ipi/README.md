# IPI (IP-Info)

A free library/cli tool to get IP information.

## Performance

> Due to the nature of the databases used (SQLITE, IP2Location), this project is littered with synchronous operations. If you're looking for a fully asynchronous API, this will not satisfy you. There are solutions such as wrapping this API for [piscina](https://www.npmjs.com/package/piscina). Hopefully the API is fast enough to justify using this library in your project.

This API is very fast:.

| test        | ms    |
| ----------- | ----- |
| `require()` | 44.36 |
| `ipi()`     | 0.066 |

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
  IP          IP address. Can be IPv4 or IPv6
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

See [examples/](examples/) for examples of the API.

## Usage in libraries

As of v2.0.0-beta, this package is safe to use in libraries! Data fetching is done when publishing the package.
