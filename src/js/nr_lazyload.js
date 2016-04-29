define(function (require, exports, module) {
    var VERSION = "1.0",
        jQuery = $ = require("jquery-1.8.2.min");

    var defaults = {
        threshold: 0,
        failurelimit: 0,
        event: "scroll",
        effect: "show",
        container: window,
        defaultImg: "",
        errorImg: "people.jpg"
    };

    var loadedCount = 0;
    var imgReady = (function () {
        var list = [],
            intervalId = null,
            tick = function () {
                var i = 0;
                for (; i < list.length; i++) {
                    list[i].end ? list.splice(i--, 1) : list[i]()
                }
                !list.length && stop()
            },
                stop = function () {
                clearInterval(intervalId);
                intervalId = null
            };
        return function (url, callback, error) {
            var check, end, width, height, offsetWidth, offsetHeight, div, accuracy = 1024, doc = document, container = doc.body || doc.getElementsByTagName("head")[0], img = new Image();
            img.src = url;
            if (!callback) {
                return img
            }
            if (img.complete) {
                return callback(img.width, img.height)
            }
            div = doc.createElement("div");
            div.style.cssText = "visibility:hidden;position:absolute;left:0;top:0;width:1px;height:1px;overflow:hidden";
            div.appendChild(img);
            container.appendChild(div);
            width = img.offsetWidth;
            height = img.offsetHeight;
            img.onload = function () {
                end();
                callback(img.width, img.height)
            };
            img.onerror = function () {
                end();
                error && error()
            };
            check = function () {
                offsetWidth = img.offsetWidth;
                offsetHeight = img.offsetHeight;
                if (offsetWidth !== width || offsetHeight !== height || offsetWidth * offsetHeight > accuracy) {
                    end();
                    callback(offsetWidth, offsetHeight)
                }
            };
            check.url = url;
            end = function () {
                check.end = true;
                img.onload = img.onerror = null;
                div.innerHTML = "";
                div.parentNode.removeChild(div)
            };
            !check.end && check();
            for (var i = 0; i < list.length; i++) {
                if (list[i].url === url) {
                    return
                }
            }
            if (!check.end) {
                list.push(check);
                if (!intervalId) {
                    intervalId = setInterval(tick, 150)
                }
            }
        }
    })();

    var domfold = {
        belowthefold: function (element, settings) {
            if (settings.container === undefined || settings.container === window) {
                var fold = $(window).height() + $(window).scrollTop()
            } else {
                var fold = $(settings.container).offset().top + $(settings.container).height()
            }
            return fold <= $(element).offset().top - settings.threshold
        },
        righttoffold: function (element, settings) {
            if (settings.container === undefined || settings.container === window) {
                var fold = $(window).width() + $(window).scrollLeft()
            } else {
                var fold = $(settings.container).offset().left + $(settings.container).width()
            }
            return fold <= $(element).offset().left - settings.threshold
        },
        abovethetop: function (element, settings) {
            if (settings.container === undefined || settings.container === window) {
                var fold = $(window).scrollTop()
            } else {
                var fold = $(settings.container).offset().top
            }
            return fold >= $(element).offset().top + settings.threshold + $(element).height()
        },
        leftofbegin: function (element, settings) {
            if (settings.container === undefined || settings.container === window) {
                var fold = $(window).scrollLeft()
            } else {
                var fold = $(settings.container).offset().left
            }
            return fold >= $(element).offset().left + settings.threshold + $(element).width()
        }
    };

    function lazyload(elem, options) {
        this.$elem = $(elem);
        this.options = $.extend({}, defaults, options);
        this.init()
    }

    lazyload.prototype = {
        init: function () {
            var $elem = this.$elem, options = this.options, that = this;
            this.imgCount = $elem.length;
            $elem.each(function () {
                var self = this;
                if (undefined == $(self).data("original")) {
                    $(self).attr("src", options.defaultImg)
                }
                if ("scroll" != options.event || !$(self).hasClass("wd_lazyloaded") || (domfold.abovethetop(self, options) || domfold.leftofbegin(self, options) || domfold.belowthefold(self, options) || domfold.righttoffold(self, options))) {
                    self.loaded = false
                } else {
                    self.loaded = true
                }
                $(self).one("appear", function () {
                    if (!this.loaded) {
                        var url = $(self).data("original");
                        imgReady(url, function () {
                            self.loaded = true;
                            loadedCount++;
                            $(self).removeAttr("src");
                            $(self).attr("src", url).addClass("wd_lazyloaded")
                        }, function () {
                            self.loaded = true;
                            loadedCount++;
                            $(self).hide().attr("src", options.errorImg);
                            $(self)[options.effect]()
                        })
                    }
                })
            });
            this.bindEvent()
        },
        bindEvent: function () {
            var options = this.options, $elem = this.$elem;
            var self = this;
            if ("scroll" == options.event) {
                $(options.container).bind("scroll.lazyLoad",function (event) {
                    if (self.lazyTime) {
                        clearTimeout(self.lazyTime)
                    }
                    self.lazyTime = setTimeout(function () {
                        self.scrollEvent(event)
                    }, 10)
                }).trigger("scroll")
            }
        },
        scrollEvent: function (event) {
            var options = this.options, $elem = this.$elem;
            var counter = 0;
            $elem.each(function () {
                if (domfold.abovethetop(this, options) || domfold.leftofbegin(this, options)) {
                } else {
                    if (!domfold.belowthefold(this, options) && !domfold.righttoffold(this, options)) {
                        $(this).trigger("appear")
                    } else {
                        if (counter++ > options.failurelimit) {
                            return false
                        }
                    }
                }
            });
            if (loadedCount == self.imgCount) {
                $(options.container).unbind("scroll.lazyLoad")
            }
        }
    };
    return lazyload
});