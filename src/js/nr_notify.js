/**
 * P2NR v1.0.0 (http://www.p2nr.com)
 * Copyright 2015-2016 CDDAKA, Inc.

 * Created by daven.
 * time : 2016/3/28 0028.
 * Email : 515124651@qq.com.
 */
define(function (require, exports, module) {
    var VERSION = "1.0",
        jQuery = $ = require("jquery-1.8.2.min");

    var defaults = {
        icon: "",
        caption: "",
        content: "",
        shadow: true,
        width: "auto",
        height: "auto",
        style: false,
        position: "center-center",
        timeout: 1000
    };
    var _notifies = [];
    var _wrapper,
        _notify;

    var timeOutHide;
    function notify(element, options) {
        var that = this;
        if (arguments.length == 1) {
            this.options = $.extend({}, defaults, element);
            if (this.options.content == "" || this.options.content == undefined) {
                return
            }
            this.init()
        } else {
            this.$elem = $(element);
            this.options = $.extend({}, defaults, options);
            if (this.options.content == "" || this.options.content == undefined) {
                return
            }
            this.$elem.bind("click", function (e) {
                that.init();
                that.close();
                e.preventDefault();
            })
        }
    }

    notify.prototype = {
        init: function () {
            var options = this.options,
                that = this;

            _wrapper = $("<div/>").addClass("notify-wrapper");
            _notify = $("<div/>").addClass("notify");
            if (options.shadow) {
                _wrapper.addClass("shadow")
            }
            if (options.style && options.style.background != undefined) {
                _wrapper.css("background-color", options.style.background)
            }
            if (options.style && options.style.color != undefined) {
                _wrapper.css("color", this.options.style.color)
            }
            if (options.caption != "" && options.caption != undefined) {
                $("<div/>").addClass("caption").html(options.caption).appendTo(_notify)
            }
            if (options.content != "" && options.content != undefined) {
                $("<div/>").addClass("content").html(options.content).appendTo(_notify)
            }
            _notify.appendTo(_wrapper);
            if (options.width != "auto") {
                _wrapper.css("min-width", options.width)
            }
            if (options.height != "auto") {
                _wrapper.css("min-height", options.height)
            }

            _wrapper.hide().appendTo("body").fadeIn("fast");
            _notifies.push(_notify);

            this.positon();
            timeOutHide = setTimeout(function () {
                that.close();
            }, options.timeout)
        },
        positon: function () {
            var options = this.options;
            if (options.position == "default" || options.position == "bottom-right") {
                var bottom_position = 5;
                $.each(_notifies, function (i, n) {
                    if (i == _notifies.length - 1) {
                        return
                    }
                    bottom_position += n.parent(".notify-wrapper").outerHeight() + 5
                });
                _wrapper.css({bottom: bottom_position, right: 5})
            } else {
                if (options.position == "center-center") {
                    var left = 0,
                        top_position = 5;

                    $.each(_notifies, function (i, n) {
                        if (i == _notifies.length - 1) {
                            return
                        }
                        top_position += n.parent(".notify-wrapper").outerHeight() + 5
                    });
                    top_position += $(window).height() / 2 - 150;
                    left = ($(window).width() - _wrapper.width()) / 2;
                    _wrapper.css({top: top_position, left: left})
                } else {
                    if (options.position == "top-right") {
                        var top_position = 5;
                        $.each(_notifies, function (i, n) {
                            if (i == _notifies.length - 1) {
                                return
                            }
                            top_position += n.parent(".notify-wrapper").outerHeight() + 5
                        });
                        _wrapper.css({top: top_position, right: 5})
                    } else {
                        if (options.position == "bottom-left") {
                            var bottom_position = 5;
                            $.each(_notifies, function (i, n) {
                                if (i == _notifies.length - 1) {
                                    return
                                }
                                bottom_position += n.parent(".notify-wrapper").outerHeight() + 5
                            });
                            _wrapper.css({bottom: bottom_position, left: 5})
                        } else {
                            var top_position = 5;
                            $.each(_notifies, function (i, n) {
                                if (i == _notifies.length - 1) {
                                    return
                                }
                                top_position += n.parent(".notify-wrapper").outerHeight() + 5
                            });
                            _wrapper.css({top: top_position, left: 5})
                        }
                    }
                }
            }
        },
        close: function () {
            _wrapper.fadeOut(function () {
                $(this).remove();
                _notifies.splice(_notifies.indexOf(_notify), 1)
            })
        },
        show: function () {
            this.init()
        }
    };
    return notify
});