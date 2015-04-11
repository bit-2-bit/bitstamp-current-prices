(($) ->

  PRICE_FIELDS = ["bid", "ask", "last", "high", "low", "vwap", "volume", "timestamp"]
  # okay so timestamp and volume are not technically prices.
  CURRENCIES = ["AUD", "BRL", "CAD", "CHF", "CNY", "EUR", "GBP", "IDR", "ILS", "MXN", 
                "NOK", "NZD", "PLN", "RON", "RUB", "SEK", "SGD", "USD", "ZAR"]
  
  class CurrencyConverter
    instance = null
    class PrivateCurrencyConverter
      constructor: ->
        @url = "https://api.bitcoinaverage.com/ticker/all"
        @conversions = {}
        @lastLoadTime = null
        @delay = 600000
        @loading = false
        return

      loadConversions: (callback) ->
        handleData = (jsonp) =>
          data = $.parseJSON(jsonp.query.results.body);
          if data
            @basePrice = parseFloat(data.USD["24h_avg"])
            for currency in CURRENCIES
              if data[currency]
                @conversions[currency] = @basePrice / parseFloat(data[currency]["24h_avg"]) if data[currency]["24h_avg"]
              else
                console.error "Currency", currency, "is no longer supplied by BitcoinAverage"
            @lastLoadTime = new Date()
            callback() if typeof callback is "function"
          else
            console.error "server returned", jsonp.query.results.body
          return

        handleFail = (err) ->
          console.error err
          return

        andFinally = =>
          @loading = false
          setTimeout =>
            @loadConversions()
          , @delay
          return

        if !@loading and (@lastLoadTime is null or (@lastLoadTime - 1) + @delay <= new Date())
          @loading = true
          query = encodeURI("select * from html where url=")
          yqlUrl = "http://query.yahooapis.com/v1/public/yql?q=#{query}\"#{@url}\"&format=json&callback=?"
          $.getJSON(yqlUrl).done(handleData).fail(handleFail).always(andFinally)
        return

    @get: ->
      instance ?= new PrivateCurrencyConverter()

  class PriceLoader
    instance = null
    class PrivatePriceLoader
      constructor: ->
        @url = "https://www.bitstamp.net/api/ticker/"
        @prices =
          btc: {}
        @lastLoadTime = null
        @delay = 60000
        @loading = false
        return

      loadPrices: ->
        # https://www.bitstamp.com.au/pubapi/latest
        handleData = (jsonp) =>
          try
            unless jsonp.query.results.body
              console.error "Missing API results for Bitstamp API."
              console.debug "jsonp.query.results.body", jsonp.query.results.body
            data = $.parseJSON(jsonp.query.results.body);
            if data
              @prices.btc = data
              @lastLoadTime = new Date()
              # console.debug "prices set to", @prices, "at", @lastLoadTime
              $(document).trigger "price-change", [@prices]
            else
              console.error "server returned", jsonp.query.results.body
          catch err
            console.error "Caught error", err
          return

        handleFail = (err) ->
          console.error "failed to loadPrices", err
          return

        andFinally = =>
          @loading = false
          setTimeout =>
            @loadPrices()
          , @delay
          return

        if !@loading and (@lastLoadTime is null or (@lastLoadTime - 1) + @delay <= new Date())
          @loading = true
          query = encodeURI("select * from html where url=")
          yqlUrl = "http://query.yahooapis.com/v1/public/yql?q=#{query}\"#{@url}\"&format=json&callback=?"
          $.getJSON(yqlUrl).done(handleData).fail(handleFail).always(andFinally)
        return

    @get: ->
      instance ?= new PrivatePriceLoader()

  # Main jQuery Collection method.
  $.fn.bitstampCurrentPrices = (fiatCurrency) ->
    fiatCurrency ?= "AUD"
    @converter = CurrencyConverter.get()
    @converter.loadConversions =>
      @loader = PriceLoader.get()
      @loader.loadPrices()
    $base = @

    @each ->
      $this = $(@)
      useVal = $this.is("input[type=text]")
      currency = "btc"
      $fiatCurrency = if fiat = $this.data("fiat")
        fiat
      else
        fiatCurrency
      priceField = $this.data("price")

      throw "invalid price field" if PRICE_FIELDS.indexOf(priceField) is -1

      priceMargin = if m = $this.data("margin")
        parseFloat m
      else
        1.0

      write = (value) ->
        if useVal
          $this.val(value)
        else
          $this.text(value)
        return

      $(document).on "price-change", (evt, prices) ->
        if priceField is "volume" or priceField is "timestamp"
          output = if priceField is "volume"
            parseInt(prices[currency][priceField]).toString()
          else
            ts = (new Date(parseInt(prices[currency][priceField]) * 1000)).toISOString()
            if $.localtime
              $.localtime.toLocalTime(ts, "dd MMM yyyy 'at' hh:mm:ss a")
            else
              ts
          write output
        else
          if $base.converter.conversions[$fiatCurrency]
            price = parseFloat(prices[currency][priceField]) * priceMargin / $base.converter.conversions[$fiatCurrency]
            write price.toFixed(2)
          else
            write "err"
        return
      return $this # because it's chainable.
) jQuery
