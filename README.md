# IPI (IP-Info)

## CLI

Install the CLI tool globally:

```sh
$ npm i --global @e9x/ipi
```

The CLI syntax is as follows:

```
Usage: ipi [options] <IP>

IP-Info cli

Arguments:
  IP                 IP address. Can be IPv4 or IPv6

Options:
  --no-update-cache  If cache shouldn't be updated. If cache doesn't exist, this option will be ignored.
  -h, --help         display help for command
```

## API

API documentation can be found [here](https://github.com/e9x/ipi/blob/master/API.md)

## Usage in libraries

This library shouldn't be used in a library. If IP information is required, make the user pass it from this library or require the user to call `loadDatabases()` on their behalf.
