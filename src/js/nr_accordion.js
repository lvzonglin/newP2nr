define(function (require, exports, module) {
    var VERSION = "1.0",
        jQuery = $ = require("jquery-1.8.2.min");

    var defaults = {
        closeAny: true,
        open: function (frame) {},
        action: function (frame) {}
    };

    function accordion(element, options) {
        this.$elem = $(element);
        this.options = $.extend(true, {}, defaults, options);
        this.create()
    }

    accordion.prototype = {
        create: function () {
            var elem = this.$elem;
            if (elem.data("closeany") != undefined) {
                this.options.closeAny = elem.data("closeany")
            }
            this._frames = elem.find(".nr-accordion-frame");
            this.init()
        },
        init: function () {
            var that = this;
            this._frames.each(function () {
                var frame = this,
                    a = $(this).children(".nr-accordion-heading"),
                    content = $(this).children(".nr-accordion-content");

                if ($(a).hasClass("nr-accordion-active") && !$(a).attr("disabled") && $(a).data("action") != "none") {
                    $(content).show();
                    $(a).removeClass("nr-accordion-collapsed")
                } else {
                    $(content).hide();
                    $(a).addClass("nr-accordion-collspsed")
                }

                a.on("click", function (e) {
                    e.preventDefault();
                    if ($(this).attr("disabled") || $(this).data("action") == "none") {
                        return false
                    }
                    if (that.options.closeAny) {
                        that.closeFrames()
                    }
                    if ($(content).is(":hidden")) {
                        $(content).slideDown();
                        $(this).removeClass("nr-accordion-collapsed");
                        that.options.open(frame)
                    } else {
                        $(content).slideUp();
                        $(this).addClass("nr-accordion-collapsed")
                    }
                    that.options.action(frame)
                })
            })
        },
        closeFrames: function () {
            this._frames.children(".nr-accordion-content").slideUp().parent().children(".nr-accordion-heading").addClass("nr-accordion-collapsed")
        },
        destroy: function () {

        }
    };
    return accordion
});