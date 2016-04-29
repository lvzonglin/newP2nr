define(function (require, exports, module) {
    var VERSION = "1.0",
        jQuery = $ = require("jquery-1.8.2.min");

    var defaults = {
        activation: "hover",
        keepAlive: true,
        maxWidth: "200px",
        defaultPosition: "top",
        delay: 200,
        fadeIn: 200,
        fadeOut: 100,
        attribute: "tip",
        content: false,
        enter: function () {},
        exit: function () {}
    };
    var tooltip       = $('<div id="hint" class="nr-tooltip"></div>'),
        tooltip_arrow = $('<div id="hint_title" class="nr-tooltip-arrow"></div>'),
        tooltip_inner = $('<div id="hint_text" class="nr-tooltip-inner">1</div>');

    var origTop = 0,
        origLeft = 0,
        nowTop = 0,
        nowLeft = 0;

    function toolTip(elem, options) {
        this.$elem = $(elem);
        this.options = $.extend({}, defaults, options);
        this.init();
    }
    toolTip.prototype = {
        init:function(){
            if ($("#hint").length <= 0) {
                $("body").append(tooltip.append(tooltip_arrow).append(tooltip_inner))
            } else {
                tooltip = $("#hint");
                tooltip_arrow = $("#hint_title");
                tooltip_inner = $("#hint_text")
            }
            this.bindEvent();
        },
        bindEvent: function () {
            var options = this.options,
                that = this;

            this.$elem.each(function () {
                var org_elem = $(this),
                    org_content;

                var position = org_elem.data("position");
                if (options.content) {
                    org_content = options.content
                } else {
                    org_content = org_elem.data(options.attribute)
                }

                if (org_content != "") {
                    //todo 针对title移除
                    if (!options.content) {
                        org_elem.removeAttr(options.attribute)
                    }

                    if (options.activation == "hover") {
                        org_elem.hover(function () {
                            that.active_tiptip(org_elem, org_content, position)
                        }, function (e) {
                            that.deactive_tiptip(e);
                            if (!options.keepAlive) {

                            }
                        });
                        if (options.keepAlive) {
                            tooltip.hover(function () {
                                that.clearTimeouts();
                            }, function (e) {
                                that.deactive_tiptip(e);
                            })
                        }
                    } else if (options.activation == "focus") {
                        org_elem.focus(function () {
                            that.active_tiptip(org_elem, org_content, position);
                        }).blur(function () {
                            that.deactive_tiptip();
                        })
                    } else {
                        if (options.activation == "click") {
                            org_elem.click(function () {
                                that.active_tiptip(org_elem, org_content, position);
                                return false
                            }).hover(function () {

                            }, function () {
                                if (!options.keepAlive) {
                                    that.deactive_tiptip();
                                }
                            });

                            if (options.keepAlive) {
                                tooltip.hover(function (e) {

                                }, function (e) {
                                    that.deactive_tiptip(e);
                                })
                            }
                        }
                    }
                }
            })
        },
        active_tiptip: function (org_elem, org_content, position) {
            var options = this.options,
                position = position || options.defaultPosition;

            options.enter.call(this);
            tooltip_inner.html(org_content);

            var top = parseInt(org_elem.offset().top),
                left = parseInt(org_elem.offset().left),
                org_width = parseInt(org_elem.outerWidth()),
                org_height = parseInt(org_elem.outerHeight());

            if (position == "top") {
                origTop = top - org_height -10;
                origLeft = left;
                nowTop = top - org_height - 20;
                nowLeft = left;
            } else {
                if (position == "bottom") {
                    origTop = top + org_height;
                    origLeft = left;
                    nowTop = top + org_height + 10;
                    nowLeft = left;
                } else {
                    if (position == "right") {
                        origTop = top;
                        origLeft = left + org_width + 5;
                        nowTop = top;
                        nowLeft = left + org_width + 15;
                    } else {
                        if (position == "left") {
                            origTop = top;
                            origLeft = left - org_width - 5;
                            nowTop = top;
                            nowLeft = left - org_width - 15;
                        }
                    }
                }
            }
            tooltip.addClass(position);
            this.showTimeout = setTimeout(function () {
                tooltip.stop(true, true).css({
                    top:nowTop,
                    left:nowLeft,
                    opacity:0
                }).show().animate({
                    top:origTop,
                    left:origLeft,
                    opacity:1
                })
            }, options.delay);
        },
        deactive_tiptip: function (e) {
            var options = this.options;
            if ((tooltip[0] === e.relatedTarget || jQuery.contains(tooltip[0], e.relatedTarget))) {
                return true
            }
            options.exit.call(this);
            this.clearTimeouts();

            tooltip.css({
                top:origTop,
                left:origLeft
            }).animate({
                top:nowTop,
                left:nowLeft,
                opacity:0
            },function(){
                tooltip.hide();
            })
        },
        clearTimeouts: function () {
            if (this.showTimeout) {
                clearTimeout(this.showTimeout);
                this.showTimeout = 0;
            }
        }
    };
    return toolTip;
});