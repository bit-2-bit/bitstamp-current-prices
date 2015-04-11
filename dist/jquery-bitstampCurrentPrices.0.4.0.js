/*!
 * Display the latest Bitstamp Bitcoin prices in your local curreny with jquery-bitstampCurrentPrices - v0.4.0 - 2015-04-11
 * https://github.com/bit-2-bit/bitstamp-current-prices
 * Copyright (c) 2015 Dave Sag; Licensed MIT
 */
(function() {
  if (typeof jQuery !== "function") {
    throw "Expected jQuery to have been loaded before this script.";
  }

}).call(this);

(function() {
  (function($) {
    var CURRENCIES, CurrencyConverter, PRICE_FIELDS, PriceLoader;
    PRICE_FIELDS = ["bid", "ask", "last", "high", "low", "vwap", "volume", "timestamp"];
    CURRENCIES = ["AUD", "BRL", "CAD", "CHF", "CNY", "EUR", "GBP", "IDR", "ILS", "MXN", "NOK", "NZD", "PLN", "RON", "RUB", "SEK", "SGD", "USD", "ZAR"];
    CurrencyConverter = (function() {
      var PrivateCurrencyConverter, instance;

      function CurrencyConverter() {}

      instance = null;

      PrivateCurrencyConverter = (function() {
        function PrivateCurrencyConverter() {
          this.url = "https://api.bitcoinaverage.com/ticker/all";
          this.conversions = {};
          this.lastLoadTime = null;
          this.delay = 600000;
          this.loading = false;
          return;
        }

        PrivateCurrencyConverter.prototype.loadConversions = function(callback) {
          var andFinally, handleData, handleFail, query, yqlUrl;
          handleData = (function(_this) {
            return function(jsonp) {
              var currency, data, _i, _len;
              data = $.parseJSON(jsonp.query.results.body);
              if (data) {
                _this.basePrice = parseFloat(data.USD["24h_avg"]);
                for (_i = 0, _len = CURRENCIES.length; _i < _len; _i++) {
                  currency = CURRENCIES[_i];
                  if (data[currency]) {
                    if (data[currency]["24h_avg"]) {
                      _this.conversions[currency] = _this.basePrice / parseFloat(data[currency]["24h_avg"]);
                    }
                  } else {
                    console.error("Currency", currency, "is no longer supplied by BitcoinAverage");
                  }
                }
                _this.lastLoadTime = new Date();
                if (typeof callback === "function") {
                  callback();
                }
              } else {
                console.error("server returned", jsonp.query.results.body);
              }
            };
          })(this);
          handleFail = function(err) {
            console.error(err);
          };
          andFinally = (function(_this) {
            return function() {
              _this.loading = false;
              setTimeout(function() {
                return _this.loadConversions();
              }, _this.delay);
            };
          })(this);
          if (!this.loading && (this.lastLoadTime === null || (this.lastLoadTime - 1) + this.delay <= new Date())) {
            this.loading = true;
            query = encodeURI("select * from html where url=");
            yqlUrl = "http://query.yahooapis.com/v1/public/yql?q=" + query + "\"" + this.url + "\"&format=json&callback=?";
            $.getJSON(yqlUrl).done(handleData).fail(handleFail).always(andFinally);
          }
        };

        return PrivateCurrencyConverter;

      })();

      CurrencyConverter.get = function() {
        return instance != null ? instance : instance = new PrivateCurrencyConverter();
      };

      return CurrencyConverter;

    })();
    PriceLoader = (function() {
      var PrivatePriceLoader, instance;

      function PriceLoader() {}

      instance = null;

      PrivatePriceLoader = (function() {
        function PrivatePriceLoader() {
          this.url = "https://www.bitstamp.net/api/ticker/";
          this.prices = {
            btc: {}
          };
          this.lastLoadTime = null;
          this.delay = 60000;
          this.loading = false;
          return;
        }

        PrivatePriceLoader.prototype.loadPrices = function() {
          var andFinally, handleData, handleFail, query, yqlUrl;
          handleData = (function(_this) {
            return function(jsonp) {
              var data, err;
              try {
                if (!jsonp.query.results.body) {
                  console.error("Missing API results for Bitstamp API.");
                  console.debug("jsonp.query.results.body", jsonp.query.results.body);
                }
                data = $.parseJSON(jsonp.query.results.body);
                if (data) {
                  _this.prices.btc = data;
                  _this.lastLoadTime = new Date();
                  $(document).trigger("price-change", [_this.prices]);
                } else {
                  console.error("server returned", jsonp.query.results.body);
                }
              } catch (_error) {
                err = _error;
                console.error("Caught error", err);
              }
            };
          })(this);
          handleFail = function(err) {
            console.error("failed to loadPrices", err);
          };
          andFinally = (function(_this) {
            return function() {
              _this.loading = false;
              setTimeout(function() {
                return _this.loadPrices();
              }, _this.delay);
            };
          })(this);
          if (!this.loading && (this.lastLoadTime === null || (this.lastLoadTime - 1) + this.delay <= new Date())) {
            this.loading = true;
            query = encodeURI("select * from html where url=");
            yqlUrl = "http://query.yahooapis.com/v1/public/yql?q=" + query + "\"" + this.url + "\"&format=json&callback=?";
            $.getJSON(yqlUrl).done(handleData).fail(handleFail).always(andFinally);
          }
        };

        return PrivatePriceLoader;

      })();

      PriceLoader.get = function() {
        return instance != null ? instance : instance = new PrivatePriceLoader();
      };

      return PriceLoader;

    })();
    return $.fn.bitstampCurrentPrices = function(fiatCurrency) {
      var $base;
      if (fiatCurrency == null) {
        fiatCurrency = "AUD";
      }
      this.converter = CurrencyConverter.get();
      this.converter.loadConversions((function(_this) {
        return function() {
          _this.loader = PriceLoader.get();
          return _this.loader.loadPrices();
        };
      })(this));
      $base = this;
      return this.each(function() {
        var $fiatCurrency, $this, currency, fiat, m, priceField, priceMargin, useVal, write;
        $this = $(this);
        useVal = $this.is("input[type=text]");
        currency = "btc";
        $fiatCurrency = (fiat = $this.data("fiat")) ? fiat : fiatCurrency;
        priceField = $this.data("price");
        if (PRICE_FIELDS.indexOf(priceField) === -1) {
          throw "invalid price field";
        }
        priceMargin = (m = $this.data("margin")) ? parseFloat(m) : 1.0;
        write = function(value) {
          if (useVal) {
            $this.val(value);
          } else {
            $this.text(value);
          }
        };
        $(document).on("price-change", function(evt, prices) {
          var output, price, ts;
          if (priceField === "volume" || priceField === "timestamp") {
            output = priceField === "volume" ? parseInt(prices[currency][priceField]).toString() : (ts = (new Date(parseInt(prices[currency][priceField]) * 1000)).toISOString(), $.localtime ? $.localtime.toLocalTime(ts, "dd MMM yyyy 'at' hh:mm:ss a") : ts);
            write(output);
          } else {
            if ($base.converter.conversions[$fiatCurrency]) {
              price = parseFloat(prices[currency][priceField]) * priceMargin / $base.converter.conversions[$fiatCurrency];
              write(price.toFixed(2));
            } else {
              write("err");
            }
          }
        });
        return $this;
      });
    };
  })(jQuery);

}).call(this);
