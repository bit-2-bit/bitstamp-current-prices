(($) ->
  ###
    ======== A Handy Little QUnit Reference ========
    http://api.qunitjs.com/

    Test methods:
      module(name, {[setup][ ,teardown]})
      test(name, callback)
      expect(numberOfAssertions)
      stop(increment)
      start(decrement)
    Test assertions:
      ok(value, [message])
      equal(actual, expected, [message])
      notEqual(actual, expected, [message])
      deepEqual(actual, expected, [message])
      notDeepEqual(actual, expected, [message])
      strictEqual(actual, expected, [message])
      notStrictEqual(actual, expected, [message])
      throws(block, [expected], [message])
  ###

  module "basic tests",
  
    setup: ->
      @elems = $("#qunit-fixture").children(".qunit-container")
      # @responseBody =
      #   high: "588.24"
      #   last: "670"
      #   timestamp: (new Date() - 0) / 1000
      #   bid: "574.28"
      #   vwap: "581.61"
      #   volume: "6804.25034089"
      #   low: "571.00"
      #   ask: "576.28"
      # jsonpWrapper =
      #   query:
      #     count: 1
      #     created: new Date().toISOString()
      #     results:
      #       body: JSON.stringify this.responseBody
      deferred = $.Deferred()
      # deferred.resolveWith(null, [jsonpWrapper])
      stub = sinon.stub($, "getJSON").returns deferred
      return

    teardown: ->
      $.getJSON.restore()
      return

  # do a bunch of tests in one go
  test "is chainable, getJSON is called once, and 'price-change' event is triggered", ->
    # $(document).on "price-change", (evt, prices) =>
    #   equal prices.btc.high, @responseBody.high, "expected correct btc high price"
    #   equal prices.btc.last, @responseBody.last, "expected correct btc last price"
    #   equal prices.btc.bid, @responseBody.bid, "expected correct btc bid price"
    #   equal prices.btc.vwap, @responseBody.vwap, "expected correct btc high price"
    #   equal prices.btc.volume, @responseBody.volume, "expected correct btc high price"
    #   equal prices.btc.low, @responseBody.low, "expected correct btc high price"
    #   equal prices.btc.ask, @responseBody.ask, "expected correct btc ask price"
    #   equal prices.btc.timestamp, @responseBody.timestamp, "expected correct btc ask price"
    strictEqual @elems.bitstampCurrentPrices(), @elems, "should be chainable"
    # equal $.getJSON.calledOnce, true, "expected $.getJSON to be called"
    # expect 10
) jQuery
