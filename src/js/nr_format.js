/**
 * P2NR v1.0.0 (http://www.p2nr.com)
 * Copyright 2015-2016 CDDAKA, Inc.

 * Created by daven.
 * time : 2016/3/30 0030.
 * Email : 515124651@qq.com.
 */
define(function (require, exports, module) {
    var VERSION = "1.0",
        jQuery = $ = require("jquery-1.8.2.min");

    $.isString = function (obj) {
        return !!(obj === "" || (obj && obj.charCodeAt && obj.substr))
    };

    var defaults = {
        currency: {
            symbol: "￥",
            format: "%s%v",
            decimal: ".",
            thousand: ",",
            precision: 2,
            grouping: 3
        },
        number: {
            precision: 2,
            grouping: 3,
            thousand: ",",
            decimal: "."
        }
    };

    function checkPrecision(val, base) {
        val = Math.round(Math.abs(val));
        return isNaN(val) ? base : val
    }

    function checkCurrencyFormat(format) {
        var options = defaults.currency.format;
        if (typeof format === "function") {
            format = format()
        }

        if ($.isString(format) && format.match("%v")) {
            return {
                pos: format,
                neg: format.replace("-", "").replace("$v", "-%v"),
                zero: format
            }
        } else {
            if (!format || !format.pos || !format.pos.match("%v")) {
                return (!$.isString(options)) ? options : options.currency.format = {
                    pos: options,
                    neg: options.replace("%v", "-%v"),
                    zero: options
                }
            }
        }
        return format
    }

    function format(elem, options) {
        var that = this;
        this.$elem = $(elem);
        this.options = $.extend({}, defaults, options);
        /*this.$elem.bind("keydown keyup keypress focus blur paste change", function () {
            that.initDom();
            $(".wd_format").html(that.formatMoney($(this).val()))
        }).bind("blur", function () {

        })*/
    }

    format.prototype = {
       /* initDom: function () {
            var dom = $("<div class='wd_format'></div>");
            if ($(".wd_format").length == 0) {
                this.$elem.after(dom.html(this.val))
            } else {
                $(".bank").html(this.formatMoney($(this.$elem).val()))
            }
        },*/
        unformat: function (value, decimal) {
            var that = this;

            if ($.isArray(value)) {
                $.map(value, function (val) {
                    return that.unformat(val, decimal)
                })
            }
            value = value || 0;
            if (typeof value === "number") {
                return value
            }
            decimal = decimal || defaults.number.decimal;

            var regex = new RegExp("[^0-9-" + decimal + "]", ["g"]);
            var unformatted = parseFloat(("" + value).replace(/\((.*)\)/, "-$1").replace(regex, "").replace(decimal, "."));
            return !isNaN(unformatted) ? unformatted : 0
        },
        toFixed: function (value, precision) {
            precision = checkPrecision(precision, defaults.number.precision);
            var power = Math.pow(10, precision);
            return (Math.round(this.unformat(value) * power) / power).toFixed(precision)
        },
        formatNumber: function (number, precision, thousand, decimal) {
            if ($.isArray(number)) {
                return $.map(number, function (val) {
                    return this.formatNumber(val, precision, thousand, decimal)
                })
            }
            number = this.unformat(number);
            var opts = $.extend({
                precision: precision,
                thousand: thousand,
                decimal: decimal}, defaults.number);

            var usePrecision = checkPrecision(opts.precision);

            var negative = number < 0 ? "-" : "";
            var base = parseInt(this.toFixed(Math.abs(number || 0), usePrecision), 10) + "";

            var mod = base.length > 3 ? base.length % 3 : 0;

            return negative + (mod ? base.substr(0, mod) + opts.thousand : "") + base.substr(mod).replace(/(\d{3})(?=\d)/g, "$1" + opts.thousand) + (usePrecision ? opts.decimal + this.toFixed(Math.abs(number), usePrecision).split(".")[1] : "")
        },
        formatMoney: function (number, symbol, precision, thousand, decimal, format) {
            if ($.isArray(number)) {
                $.map(number, function (val) {
                    return this.formatMoney(val, symbol, precision, thousand, decimal, format)
                })
            }
            number = this.unformat(number);
            var opts = $.extend({
                symbol: symbol,
                precision: precision,
                thousand: thousand,
                decimal: decimal,
                format: format
            }, defaults.currency);

            var formats = checkCurrencyFormat(opts.format);

            var useFormat = number > 0 ? formats.pos : number < 0 ? formats.neg : formats.zero;
            return useFormat.replace("%s", opts.symbol).replace("%v", this.formatNumber(Math.abs(number), checkPrecision(opts.precision), opts.thousand, opts.decimal))
        }
    };
    return format;
});