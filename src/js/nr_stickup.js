define(function (require, exports, module) {
    var VERSION = "1.0",
        jQuery = $ = require("jquery-1.8.2.min");

    var defaults = {
        item            : ".j-stickup-item",
        container       : ".j-stickup",
        stickClass      : "j-stickup-fixed",
        endStickClass   : "j-stickup-end",
        offset          : 0,
        start           : 0,
        onStick         : null,
        onUnstick       : null
    };

    function stickUp(elem, options) {
        this.$elem = $(elem);
        this.options = $.extend(true, {}, defaults, options);
        this.$win = $(window);
        this.init()
    }

    stickUp.prototype = {
        init: function () {
            this.setWindowHeight();
            this.getItems();
            this.bindEvents()
        },
        bindEvents: function () {
            var that = this;
            this.$win.on("scroll.stickup", function () {
                that.handleScroll()
            });
            this.$win.on("resize.stickup", function () {
                that.handleResize()
            })
        },
        handleScroll: function () {
            var fixStickem = $(".j-correct-stickup");
            if (this.items.length > 0) {
                var pos = this.$win.scrollTop();
                for (var i = 0, len = this.items.length; i < len; i++) {
                    var item = this.items[i];
                    if ((item.isStuck && (pos <= item.containerStart || pos > item.scrollFinish))) {
                        item.$elem.removeClass(this.options.stickClass);
                        if (pos > item.scrollFinish) {
                            item.$elem.addClass(this.options.endStickClass)
                        }
                        fixStickem.hide();
                        item.isStuck = false;
                        if (this.options.onUnstick) {
                            this.options.onUnstick(item)
                        }
                    } else {
                        if (item.isStuck === false && pos > item.containerStart && pos < item.scrollFinish) {
                            item.$elem.removeClass(this.options.endStickClass).addClass(this.options.stickClass);
                            fixStickem.show();
                            item.isStuck = true;
                            if (this.options.onStick) {
                                this.options.onStick(item)
                            }
                        }
                    }
                }
            }
        },
        handleResize: function () {
            this.setWindowHeight();
            this.getItems()
        },
        getItem: function (index, element) {
            var $this = $(element);
            var item = {
                $elem: $this,
                elemHeight: $this.height(),
                $container: $this.parents(this.options.container),
                isStuck: false
            };

            if (this.windowHeight > item.elemHeight) {
                item.containerHeight = item.$container.outerHeight();
                item.containerInner = {
                    border: {
                        bottom: parseInt(item.$container.css("border-bottom-width"), 10) || 0,
                        top: parseInt(item.$container.css("border-top-width"), 10) || 0
                    },
                    padding: {
                        bottom: parseInt(item.$container.css("padding-bottom-width"), 10) || 0,
                        top: parseInt(item.$container.css("padding-top-width"), 10) || 0
                    }
                };

                item.containerInnerHeight = item.$container.height();
                item.containerStart = item.$container.offset().top - this.options.offset + this.options.start + item.containerInner.padding.top + item.containerInner.border.top;
                item.scrollFinish = item.containerStart - this.options.start + (item.containerInnerHeight - item.elemHeight);
                if (item.containerInnerHeight > item.elemHeight) {
                    this.items.push(item)
                }
            } else {
                item.$elem.removeClass(this.options.stickClass + " " + this.options.endStickClass)
            }
        },
        getItems: function () {
            var that = this;
            this.items = [];
            $(this.options.item).each(function (index, elem) {
                that.getItem(index, elem)
            })
        },
        setWindowHeight: function () {
            this.windowHeight = this.$win.height() - this.options.offset
        },
        destroy: function () {
            this.$win.off("scroll.stickem");
            this.$win.off("resize.stickem")
        }
    };
    return stickUp
});