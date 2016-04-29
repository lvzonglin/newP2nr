/**
 * P2NR v1.0.0 (http://www.p2nr.com)
 * Copyright 2015-2016 CDDAKA, Inc.

 * Created by daven.
 * time : 2016/3/28 0028.
 * Email : 515124651@qq.com.
 */
define(function (require, exports, module) {
    var VERSION = "1.0.0",
        jQuery = $ = require("jquery-1.8.2.min");
    var defaults = {
        newTab: true,
        stickyPlaceholder: true,
        onChange: function (element, val) {

        }
    };

    function selectFx(element, options) {
        this.$el = $(element);
        this.options = $.extend({}, defaults, options);
        this._init()
    }

    selectFx.prototype = {
        reload: function () {
            this.selEl.remove();
            this._init()
        },
        _init: function () {
            var selectedOpt = this.$el.find("option:selected");
            this.hasDefaultPlaceholder = selectedOpt && selectedOpt.disabled;

            if (selectedOpt.length) {
                this.selectedOpt = selectedOpt
            } else {
                this.selectedOpt = this.$el.find("option")[0]
            }
            this._createSelectEl();

            this.selOpts = this.selEl.find("li[data-option]");
            this.selOptsCount = this.selOpts.length;
            this.current = this.selOpts.index(this.selEl.find("li.cs-selected")) || 1;
            this.selPlaceholder = this.selEl.find("span.cs-placeholder");
            this.csBorder = this.selEl.find("span.cs-border");
            this._initEvents()
        },
        _createSelectEl: function () {
            var self = this,
                options = "";
            //被禁用了的不被添加到里面了
            this.$el.find("option,optgroup").each(function () {
                if (this.disabled) {
                    return
                }
                var tag = this.tagName.toLowerCase();
                if (tag === "option") {
                    options += self.createOptionHTML($(this))
                } else {
                    if (tag === "optgroup") {
                        options += '<li class="cs-optgroup"><span>' + this.label + "</span></ul> ";
                        $(this).find("option").each(function (opt,elem) {
                            options += self.createOptionHTML($(elem))
                        });
                        options += "</ul></li>"
                    }
                }
            });
            var opts_el = '<div class="cs-options"><ul>' + options + "</ul></div>";
            this.selEl = $("<div>");
            this.selEl.addClass("cs-select");
            //this.selEl.tabIndex = this.$el.tabIndex;
            this.selEl.html('<span class="cs-placeholder">' + $(this.selectedOpt).text() + '</span><span class="cs-border"></span><i></i>' + opts_el);
            this.$el.after(this.selEl)
        },
        createOptionHTML: function (el) {
            var optcalss = "",
                optclass = "",
                link = "";

            if (el.selectedOpt && !this.foundSelected && !this.hasDefaultPlaceholder) {
                optclass += "cs-selected";
                this.foundSelected = true
            }

            if (el.data("class")) {
                optclass += el.data("class")
            }
            if (el.data("link")) {
                link = "data-link=" + el.data("link")
            }
            if (optclass !== "") {
                optclass = 'class="' + optclass + '" '
            }
            return "<li " + optclass + link + ' data-option data-value="' + el.val() + '"><span>' + el.text() + "</span></li>"
        },
        _initEvents: function () {
            var self = this;
            this.selEl.bind("click", function () {
                self._toggleSelect()
            });
            /*this.selPlaceholder.bind("click", function () {
                self._toggleSelect()
            });*/
            this.selOpts.each(function (index, opt) {
                $(opt).bind("click", function () {
                    self.current = index;
                    self._changeOption();
                    self._toggleSelect()
                })
            });
            $("body").bind("click", function (e) {
                var target = e.target;
                if (self._isOpen() && target !== self.$el && !$(target).parent(".cs-select").length) {
                    self._toggleSelect();
                    e.stopPropagation()
                }
            });
            this.$el.bind("keydown", function (e) {
                var keyCode = e.keyCode || e.which;
                switch (keyCode) {
                    case 38:
                        e.preventDefault();
                        self._navigateOpts("prev");
                        break;
                    case 40:
                        e.preventDefault();
                        self._navigateOpts("next");
                        break;
                    case 32:
                        e.preventDefault();
                        if (self._isOpen() && typeof self.preSelCurrent != "undefined" && self.preSelCurrent !== -1) {
                            self._changeOption()
                        }
                        self._toggleSelect();
                        break;
                    case 13:
                        e.preventDefault();
                        if (self._isOpen() && typeof self.preSelCurrent != "undefined" && self.preSelCurrent !== -1) {
                            self._changeOption();
                            self._toggleSelect()
                        }
                        break;
                    case 27:
                        e.preventDefault();
                        if (self._isOpen()) {
                            self._toggleSelect()
                        }
                        break
                }
            })
        },
        _navigateOpts: function (dir) {
            if (!this._isOpen()) {
                this._toggleSelect()
            }
            var tmpcurrent = typeof this.preSelCurrent != "undefined" && this.preSelCurrent !== -1 ? this.preSelCurrent : this.current;
            if (dir === "prev" && tmpcurrent > 0 || dir === "next" && tmpcurrent < this.selOptsCount - 1) {
                this.preSelCurrent = dir === "next" ? tmpcurrent + 1 : tmpcurrent - 1;
                this._removeFocus();
                $(this.selOpts[this.preSelCurrent]).addClass("cs-focus")
            }
        },
        _toggleSelect: function () {
            this._removeFocus();
            if (this._isOpen()) {
                if (this.current !== -1) {
                    this.selPlaceholder.text($(this.selOpts[this.current]).text())
                }
                this.selEl.removeClass("cs-active")
            } else {
                this.closeAll();
                if (this.hasDefaultPlaceholder && this.options.stickyPlaceholder) {
                    this.selPlaceholder.text(this.selectedOpt.text())
                }
                this.selEl.addClass("cs-active")

            }
        },
        _changeOption: function () {
            if (typeof this.preSelCurrent != "undefined" && this.preSelCurrent !== -1) {
                this.current = this.preSelCurrent;
                this.preSelCurrent = -1
            }
            var opt = $(this.selOpts[this.current]);
            this.selPlaceholder.text(opt.text());
            this.$el.val(opt.data("value"));
            this.$el.trigger("change");
            var oldOpt = this.selEl.find("li.cs-selected");
            if (oldOpt) {
                oldOpt.removeClass("cs-selected")
            }
            opt.addClass("cs-selected");
            if (opt.data("link")) {
                if (this.options.newTab) {
                    window.open(opt.data("link"), "_blank")
                } else {
                    window.location = opt.data("link")
                }
            }
            this.options.onChange(this.$el, this.$el.val(), this.$el.find("option:selected").data("option"))
        },
        _isOpen: function () {
            return this.selEl.hasClass("cs-active")
        },
        _removeFocus: function () {
            var focusEl = this.selEl.find("li.cs-focus");
            if (focusEl) {
                focusEl.removeClass("cs-focus")
            }
        },
        closeAll:function(){
            $(".cs-active").removeClass("cs-active");
        }
    };
    function nrSelectFx(element, options) {
        var that = this;
        var elm = $(element);
        elm.each(function () {
            var selectX = new selectFx(this, options);
            that.selectFx = selectX
        })
    }

    return nrSelectFx;
});