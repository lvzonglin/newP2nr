/**
 * P2NR v1.0.0 (http://www.p2nr.com)
 * Copyright 2015-2016 CDDAKA, Inc.

 * Created by daven.
 * time : 2016/4/2 0002.
 * Email : 515124651@qq.com.
 */
define(function (require, exports, module) {
    require('./nr_ease.js');

    var VERSION = "1.0",
        jQuery = $ = require("jquery-1.8.2.min");

    var _overlay,
        _window,
        _caption,
        _content,
        _dialog,
        _footer,
        fcontent;

    function dialog(element, option) {
        this.$elems = $(element);
        this.options = $.extend({
            title: "弹窗",
            content: "",
            flat: false,
            shadow: true,
            overlay: true,
            width: "auto",
            height: "auto",
            position: false,
            padding: false,
            draggable: false,
            overlayClickClose: false,
            sysButtons: {
                btnClose: true,
                //todo 最大化和最小化未做
                btnMax: false,
                btnMin: false
            },
            sure: {
                btn: true,
                onSure: $.noop
            },
            clear: {
                btn: true,
                onClear: $.noop
            },
            onShow: function (_dialog) {
            }
        }, option);

        this.init()
    }

    dialog.prototype = {
        init: function () {
            var that = this;
            this.$elems.bind("click", function (e) {
                e.preventDefault();
                that.renderDom();
                return false
            })
        },
        renderDom: function () {
            var that = this;
            _overlay = $("<div/>").addClass("nr-dialog-overlay");
            if (this.options.overlay) {
               // _overlay.css({backgroundColor: "#ccc"})
            }
            _window = $("<div/>").addClass("nr-dialog nr-animation");
            _caption = $("<div/>").addClass("nr-dialog-caption");
            _content = $("<div/>").addClass("nr-dialog-content");
            _footer = $("<div/>").addClass("nr-dialog-footer");

            if (this.options.sure.btn) {
                $("<button class='nr-btn'/>").text("确定").on("click", function () {
                    that.options.sure.onSure.call(that)
                }).appendTo(_footer)
            }

            if (this.options.clear.btn) {
                $("<button  class='nr-btn'/>").text("取消").on("click", function (e) {
                    that.options.clear.onClear.call(that);
                    e.preventDefault();
                    e.stopPropagation();
                    that.close()
                }).appendTo(_footer)
            }

            if (this.options.sysButtons) {
                if (this.options.sysButtons.btnClose) {
                    $("<span>X</span>").addClass("btn-close").on("click", function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        that.close()
                    }).appendTo(_caption)
                }
                //todo 没做
                if (this.options.sysButtons.btnMax) {
                    $("<button/>").addClass("btn-max").on("click", function (e) {
                        e.preventDefault();
                        e.stopPropagation()
                    }).appendTo(_caption)
                }
                if (this.options.sysButtons.btnMin) {
                    $("<button/>").addClass("btn-min").on("click", function (e) {
                        e.preventDefault();
                        e.stopPropagation()
                    }).append(_caption)
                }
            }

            $("<div/>").addClass("title").html(this.options.title).appendTo(_caption);
            if (typeof this.options.content == "function") {
                fcontent = this.options.content.call(this);
                _content.html(fcontent)
            } else {
                if ($(this.options.content).length > 0) {
                    fcontent = $(this.options.content).html();
                    _content.append(fcontent);
                    $(this.options.content).html("");
                } else {
                    _content.html(this.options.content)
                }
            }
            _caption.appendTo(_window);
            _content.appendTo(_window);
            if (this.options.sure.btn || this.options.clear.btn) {
                _footer.appendTo(_window)
            }

            _window.appendTo(_overlay);

            if (this.options.width != "auto") {
                _window.css("min-width", this.options.width)
            }
            if (this.options.height != "auto") {
                _window.css("min-height", this.options.height)
            }

            _overlay.hide().appendTo("body").fadeIn();

            _dialog = _window;

            _window.addClass('nr-animation-fadeInDown').css({
                top: (($(window).height() - _window.outerHeight()) / 2),
                left:(($(window).width() - _window.outerWidth()) / 2)
            })
            _window.on("click", function (e) {
                e.stopPropagation()
            });

            if (this.options.overlayClickClose) {
                _overlay.on("click", function (e) {
                    e.preventDefault();
                    that.close()
                })
            }
            this.options.onShow.call(this);
            this.autoResize()
        },
        content: function (newContent) {
            if (newContent) {
                _dialog.children(".nr-dialog-content").html(newContent)
            } else {
                return _dialog.children(".nr-dialog-content").html()
            }
            this.autoResize()
        },
        title: function (newTitle) {
            var _title = _dialog.children(".nr-dialog-caption").children(".title");
            if (newTitle) {
                _title.html(newTitle)
            } else {
                _title.html()
            }
        },
        autoResize: function () {
            var _content = _dialog.children(".nr-dialog-content");
            var top = ($(window).height() - _dialog.outerHeight()) / 2;
            var left = ($(window).width() - _dialog.outerWidth()) / 2;
            _dialog.css({
                width: _content.outerWidth(),
                height: _content.outerHeight() + 70,
                top:top,
                left:left
            })
        },
        close: function () {
            var that = this;
            var _overlay = _dialog.parent(".nr-dialog-overlay");
            _dialog.addClass("nr-animation-fadeOutDown");
            _overlay.fadeOut(function () {
                $(this).remove()
            })
        }
    };
    return dialog
});