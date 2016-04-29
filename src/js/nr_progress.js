/**
 * P2NR v1.0.0 (http://www.p2nr.com)
 * Copyright 2015-2016 CDDAKA, Inc.

 * Created by daven.
 * time : 2016/3/30 0030.
 * Email : 515124651@qq.com.
 */
define(function (require, exports, module) {
    var VERSION = "1.0.0",
        jquery = $ = require("jquery-1.8.2.min.js");
    var defaults = {
        value: 0,
        animate: true,
        onChange: function (value) {}
    };

    function progressbar(element, options) {
        this.$elem = $(element);
        this.options = $.extend(true, options, defaults);
        this.init()
    }

    progressbar.prototype = {
        init: function () {
            var element = this.$elem;
            if (element.data("value") != undefined) {
                this.value(element.data("value") + "%")
            }

            if ((element).data("animate") != undefined) {
                this.options.animate = element.data("animate")
            }
            this._showBar()
        },
        animateBar: function (value) {
            this.bar.animate({width: value + "%"})
        },
        _showBar: function () {
            var element = this.$elem;
            element.html("");
            this.bar = $("<div/>");
            this.bar.addClass("nr-progress-bar");
            this.bar.appendTo(element);
            if (this.options.animate) {
                this.bar.animate({width: this.value() + "%"})
            } else {
                this.bar.css("width", this.value() + "%")
            }
        },
        value: function (val) {
            if (val != undefined) {
                this.options.value = parseInt(val);
                this._showBar()
            } else {
                return parseInt(this.options.value)
            }
        }
    };
    return progressbar
});