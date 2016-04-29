define(function (require, exports, module) {
    var VERSION = "1.0",
        jQuery = $ = require("jquery-1.8.2.min");
        require('./nr_hoverIntent.js');

    var defaults = {
        event       : "hover",
        timeout     : 0,
        current     : 0,
        tabMenu     : ".nr-tab-heads",
        tabBox      : ".nr-tab-bodys",
        tabCurrent  : "nr-tab-active",
        callback    : null
    };

    function Tab(obj, option) {
        var that = this;
        this.$element = $(obj);
        this.options = $.extend(defaults, option);
        this.$element.each(function () {
            that.init(this)
        })
    }

    Tab.prototype = {
        init: function (elem) {
            var that = this,
                element = $(elem),
                options = this.options,
                tabMenu = element.find(options.tabMenu).children("li"),
                tabBox = element.find(options.tabBox).children(".nr-tab-body"),
                current = $("." + element.data("current")).length && $("." + element.data("current")) || tabMenu.eq(0);

            function tabHandle() {
                var tabElem = $(this);
                tabElem.siblings("li").removeClass(that.options.tabCurrent).end().addClass(that.options.tabCurrent);
                tabBox.siblings("div").addClass("nr-hide").end().eq(tabElem.index()).removeClass("nr-hide");
                if (options.callback) {
                    options.callback(that)
                }
            }

            this.tabHandle(current, tabBox);
            if (options.event === "hover") {
                $(tabMenu).hoverIntent(tabHandle)
            } else {
                tabMenu.bind(options.event, function (event) {
                    event.preventDefault();
                    that.delay($(this), tabBox, options.timeout);
                    if (options.callback) {
                        options.callback(that)
                    }
                })
            }
        },
        tabHandle: function (elem, tabBox) {
            elem.siblings("li").removeClass(this.options.tabCurrent).end().addClass(this.options.tabCurrent);
            tabBox.siblings("div").addClass("nr-hide").end().eq(elem.index()).removeClass("nr-hide")
        },
        delay: function (elem, tabBox, time) {
            var that = this;
            time ? setTimeout(function () {
                that.tabHandle(elem, tabBox)
            }, time) : that.tabHandle(elem, tabBox)
        }
    };
    return Tab
});