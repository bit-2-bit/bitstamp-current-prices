/*!
 * Display the latest Bitstamp Bitcoin prices with jquery-bitstampCurrentPrices - v0.2.0 - 2014-06-25
 * https://github.com/bit-2-bit/bitstamp-current-prices
 * Copyright (c) 2014 Dave Sag; Licensed MIT
 */
(function() {
  if (typeof jQuery !== "function") {
    throw "Expected jQuery to have been loaded before this script.";
  }

}).call(this);

(function() {
  (function($) {
    var PRICE_FIELDS, PriceLoader;
    PRICE_FIELDS = ["bid", "ask", "last", "high", "low", "vwap", "volume", "timestamp"];
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
              var data;
              data = $.parseJSON(jsonp.query.results.body.p);
              if (data) {
                _this.prices.btc = data;
                _this.lastLoadTime = new Date();
                $(document).trigger("price-change", [_this.prices]);
              } else {
                console.error("server returned", jsonp.query.results.body.p);
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
    return $.fn.bitstampCurrentPrices = function() {
      this.loader = PriceLoader.get();
      this.loader.loadPrices();
      return this.each(function() {
        var $this, currency, m, priceField, priceMargin, useVal;
        $this = $(this);
        useVal = $this.is("input[type=text]");
        currency = "btc";
        priceField = $this.data("price");
        if (PRICE_FIELDS.indexOf(priceField) === -1) {
          throw "invalid price field";
        }
        priceMargin = (m = $this.data("margin")) ? parseFloat(m) : 1.0;
        $(document).on("price-change", function(evt, prices) {
          var output, price;
          if (priceField === "volume" || priceField === "timestamp") {
            output = priceField === "volume" ? parseInt(prices[currency][priceField]).toString() : (console.debug("timestamp is", prices[currency][priceField], typeof prices[currency][priceField]), (new Date(parseInt(prices[currency][priceField]) * 1000)).toISOString());
            if (useVal) {
              $this.val(output);
            } else {
              $this.text(output);
            }
          } else {
            price = parseFloat(prices[currency][priceField]) * priceMargin;
            if (useVal) {
              $this.val(parseFloat(price.toFixed(6)).toString());
            } else {
              $this.text(parseFloat(price.toFixed(6)).toString());
            }
          }
        });
        return $this;
      });
    };
  })(jQuery);

}).call(this);
