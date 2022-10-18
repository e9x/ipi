# ipi-databases

The databases used in the IPI package.

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
