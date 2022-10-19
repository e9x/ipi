# ipi-databases

<a href="https://www.npmjs.com/package/@e9x/ipi-databases"><img src="https://img.shields.io/npm/v/@e9x/ipi-databases.svg?maxAge=3600" alt="npm version" /></a>

This package contains the databases used in [IPI](https://www.npmjs.com/package/@e9x/ipi). A library is exposed to help locate the database files.

## Building the ASN database

```sh
$ npm run ip2asn
```

## Aquiring the IP2Location database

> ⚠ Only do this with a burner account. This will get your IP2Location account banned! (They watermark the databases with your account name)

> TODO: run a diff on the databases and obfuscate the watermark

1. Login to the IP2Location (lite) website

https://lite.ip2location.com/login

2. Look for `DB11.LITE` or `IP-COUNTRY-REGION-CITY-LATITUDE-LONGITUDE-ZIPCODE-TIMEZONE`

3. Save the file as `ip2location.db` (this is what we reference)

4. Put the database into the `dist` directory within ipi-databases

5. Verify your work by running the validation script:

```sh
$ npm run prepublish
```
