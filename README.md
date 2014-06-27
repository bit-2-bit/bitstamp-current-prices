jquery-bitstampCurrentPrices
============================

A jQuery Plugin that extracts current prices from
[the Bitstamp API](https://www.bitstamp.net/api/ticker/) and displays them within the element you specify
after converting them to the fiat currency you specify.

Bitstamp issues its currencies in US Dollars however [Bit2Bit](http://www.bit2bit.co) is an Australian
company so we wanted them to display in Australian Dollars.

Currency conversion is performed by extracting the various BTC to Fiat prices from a range of currencies
as served up by the [Bitcoin Average API](https://api.bitcoinaverage.com/ticker/) and performing the 
necessary multiplications based on the 24 hour average weighted price in each currency.

This supports automatic conversions between USD and the following currencies:

    ["AUD", "BRL", "CAD", "CHF", "CNY", "EUR", "GBP", "HKD", "IDR", "ILS", "MXN", 
     "NOK", "NZD", "PLN", "RON", "RUB", "SEK", "SGD", "TRY", "USD", "ZAR"]

It's not 100% accurate, but close, and free.

The plugin also automatically detects the amazing [jquery-localtime](https://github.com/GregDThomas/jquery-localtime) plugin by Greg D Thomas format timestamps, otherwise they are displayed in Zulu time.

The plugin takes advantage of Yahoo's YQL to wrap the API calls in a JSONP callback handler, thus avoiding any cross-site scripting issues.

## To Use

Simply add data attributes to the DOM elements you wish to inject.  For example

```html
<span data-price="ask" data-fiat="AUD"></span>
```

Sometimes you might wish to also mutate the price by a margin multiplier, so you can add `data-margin="0.95"` for
example to reduce the price by 5%.

Then add
```javascript
$(document).ready(function(){
  $("span[data-price]").bitstampCurrentPrices();
});
```

As soon as the conversions, and then the current Bitstamp price have loaded the `span` will be injected with the correct value.

See the examples for more.

## To Build

### Prerequisites

Assuming you have `Node.js` installed.

```bash
npm install
```

## Test it

The tests are a bit minimal right now as I added multiple Ajax calls and need to clean the tests up again.

```bash
grunt test
```

## Build it

```bash
grunt
```

This will output the final distribution files into the `dist/` folder, prefixed with `jquery` and suffixed with 
the version number you specify in `package.json`.

Files created are:

* `jquery-bitstampCurrentPrices.0.2.2.js` - the 'developer' version.
* `jquery-bitstampCurrentPrices.0.2.2.min.js` The minified version for production use.
* `jquery-bitstampCurrentPrices.0.2.2.min.map` The `sourcemap` file for debugging using the minified version.

## Errata
### Credits

Written by [Dave Sag](http://cv.davesag.com) for [Bit2Bit](http://www.bit2bit.co).

### License

Released under the MIT License.

### ToDo

* Clean up the tests
* Improve documentation and examples.
