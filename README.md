bitstampCurrentPrices
=====================

A jQuery Plugin that extracts current prices from
[the Bitstamp API](https://www.bitstamp.net/api/ticker/) and displays them within the element you specify.

Uses Yahoo's YQL to supply the API with a JSONP callback handler.

### First

Assuming you have `Node.js` installed.

```bash
npm install
```

## To Test

```bash
grunt test
```

## To Build

```bash
grunt
```

This will output the final distribution files into the `dist/` folder, prefixed with `jquery` and suffixed with the version number you specify in `package.json`.

Files created are:

* `jquery-bitstampCurrentPrices.0.2.0.js` - the 'developer' version.
* `jquery-bitstampCurrentPrices.0.2.0.min.js` The minified version for production use.
* `jquery-bitstampCurrentPrices.0.2.0.min.map` The `sourcemap` file for debugging using the minified version.

## To use

See the example.

