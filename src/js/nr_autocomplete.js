/**
 * P2NR v1.0.0 (http://www.p2nr.com)
 * Copyright 2015-2016 CDDAKA, Inc.

 * Created by daven.
 * time : 2016/3/30 0030.
 * Email : 515124651@qq.com.
 */
define(function (require, exports, module) {
    var VERSION = "1.0", jQuery = $ = require("jquery-1.8.2.min");
    var $body = $("body"),
        ignoredKeyCode = [9, 13, 17, 19, 20, 27, 33, 34, 35, 36, 37, 39, 44, 92, 113, 114, 115, 118, 119, 120, 122, 123, 144, 145],
        localStorageKey = "autocompleterCache",
        guid = 0,
        cache = {},
        timeId,
        supportLocalStorage = (function () {
            var supported = typeof window.localStorage !== "undefined";
            if (supported) {
                try {
                    localStorage.setItem("autocompleter", "autocompleter");
                    localStorage.removeItem("autocompleter")
                } catch (e) {
                    supported = false
                }
            }
            return supported
        })();


    var defaults = {
        source: null,
        hotSource: null,
        empty: true,
        limit: 10,
        customClass: [],
        cache: true,
        focusOpen: true,
        hint: true,
        selectFirst: true,
        changeWhenSelect: false,
        highlightMatches: true,
        ignoredKeyCode: [],
        customLabel: false,
        customValue: false,
        template: false,
        offset: false,
        isHref: false,
        //serachType: "nav",
        combine: $.noop,
        callback: $.noop
    };

    function _clone(obj) {
        if (null === obj || "object" !== typeof obj) {
            return obj
        }
        var copy = obj.constructor();
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) {
                copy[attr] = obj[attr]
            }
        }
        return copy
    }

    function autocomplete(element, options) {
        this.$elem = $(element);
        this.options = $.extend({}, defaults, options);
        this.init()
    }

    autocomplete.prototype = {
        init: function () {
            var $elem = this.$elem,
                options = this.options,
                that = this;

            if (!$elem.hasClass("autocompleter-node")) {
                options = $.extend({}, options, $elem.data("autocompleter-options"));

                var html = '<div class="autocompleter ' + options.customClass.join(" ") + '" id="autocompleter-' + (guid + 1) + '">';
                if (options.hint) {
                    html += '<div class="autocompleter-hint"></div>'
                }
                html += '<ul class="autocompleter-list"></ul>';
                html += "</div>";

                $elem.addClass("autocompleter-node").after(html);

                var $autocompleter = $elem.next(".autocompleter").eq(0);
                //todo 做热门的选择
                var $downauto = $elem.nextAll(".form_down").eq(0);

                var originalAutocomplete = $elem.attr("autocomplete");
                $elem.attr("autocomplete", "off");

                var data = $.extend({
                    $node: $elem,
                    $autocompleter: $autocompleter,
                    $downauto: $downauto,
                    $selected: null,
                    $list: null,
                    index: -1,
                    hintText: false,
                    source: options.source,
                    jqxhr: false,
                    response: false,
                    focused: false,
                    query: "",
                    originalAutocomplete: originalAutocomplete,
                    guid: guid++
                }, options);

                data.$autocompleter.on("mousedown.autocompleter", ".autocompleter-item", data, function (e) {
                    that._select.call(that, e, this)
                }).data("autocompleter", data);

                data.$node.on("keyup.autocompleter", data, function (e) {
                    clearTimeout(timeId);
                    timeId = setTimeout(function () {
                        that._onKeyup.call(that, e)
                    }, 200)
                }).on("keydown.autocompleter", data, function (e) {
                    that._onKeydownHelper.call(that, e)
                }).on("focus.autocompleter", data, function (e) {
                    if (data.hotSource) {
                        //todo 显示热搜清单
                    }
                    that._onFocus.call(that, e)
                }).on("blur.autocompleter", data, function (e) {
                    that._onBlur.call(that, e)
                }).on("mousedown.autocompleter", data, function (e) {
                    that._onMousedown.call(that, e)
                });

                data.$downauto.bind("click", function () {
                    that._launch(data)
                })
            }
        },
        _search: function (query, source, limit) {
            var response = [];
            query = query.toUpperCase();
            if (source.length) {
                /*for (var i = 0; i < 2; i++) {
                    for (var item in source) {
                        if (response.length < limit) {
                            switch (i) {
                                case 0:
                                    if (source[item].label.toUpperCase().search(query) === 0 || source[item].value.toUpperCase().search(query) === 0) {
                                        response.push(source[item]);
                                        delete source[item]
                                    }
                                    break;
                                case 1:
                                    if (source[item].label.toUpperCase().search(query) !== -1) {
                                        response.push(source[item]);
                                        delete source[item]
                                    }
                                    break
                            }
                        }
                    }
                }*/
                for (var item in source) {
                    if (response.length < limit) {
                        if (source[item].label.toUpperCase().search(query) === 0 || source[item].value.toUpperCase().search(query) === 0) {
                            response.push(source[item]);
                            delete source[item]
                        }
                    }
                }
            }
            return response
        },
        _launch: function (data) {
            var that = this;
            data.query = $.trim(data.$node.val());

            if (!data.empty && data.query.length === 0) {
                that._clear(data);
                return
            } else {
                if (typeof data.source === "object") {
                    this._clear(data);
                    var search = this._search(data.query, _clone(data.source), data.limit);
                    if (search.length) {
                        this._response(search, data)
                    }
                } else {
                    if (data.jqxhr) {
                        data.jqxhr.abort()
                    }
                    var ajaxData = $.extend({
                        limit: data.limit,
                        query: data.query
                    }, data.combine());

                    data.jqxhr = $.ajax({
                        url: data.source,
                        dataType: "json",
                        data: ajaxData,
                        type: "GET",
                        beforeSend: function (xhr) {
                            data.$node.addClass("autocompleter-ajax");
                            that._clear(data);
                            if (data.cache) {
                                var stored = that._getCache(this.url);
                                if (stored) {
                                    xhr.abort();
                                    that._response(stored, data)
                                }
                            }
                        }
                    }).done(function (response) {
                        if (response) {
                            if (data.offset) {
                                response = that._grab(response, data.offset)
                            }
                            if (data.cache) {
                                that._setCache(this.url, response)
                            }
                            that._response(response, data)
                        } else {
                            that._responseNo("http://www.baidu.com", data)
                        }
                    }).always(function () {
                        data.$node.removeClass("autocompleter-ajax")
                    })
                }
            }
        },
        _clear: function (data) {
            data.response = null;
            data.$list = null;
            data.$selected = null;
            data.index = 0;
            data.$autocompleter.find(".autocompleter-list").empty();
            data.$autocompleter.find(".autocompleter-hint").removeClass("autocompleter-hint-show").empty();
            data.hintText = false;
            this._close(null, data)
        },
        _responseNo: function (url, data) {
            /*if (data.serachType == "nav") {
                var menu = "<li class='autocompleter-item'><i class='icon-beaker'></i> 没找到相关记录  我是平台人员<a href='" + WDGJ.ADDNAV + "' class='u-tx-bold u-tx-link'>免费添加平台</a></li>"
            } else {
                if (data.serachType == "sns") {
                    var menu = "<li class='autocompleter-item'><i class='icon-beaker'></i> 没找到相关记录  立即去<a target='_blank' href='" + WDGJ.SNSURL + "/publish/' class='u-tx-bold u-tx-link'>发标主题</a></li>"
                }
            }*/
            var menu = "<li class='autocompleter-item'><i class='icon-beaker'></i> 没找到相关记录</a></li>"
            data.$autocompleter.removeClass("autocompleter-closed").addClass("autocompleter-show").find(".autocompleter-list").html(menu)
        },
        _response: function (response, data) {
            this._buildList(response, data);
            if (data.$autocompleter.hasClass("autocompleter-focus")) {
                this._open(null, data)
            }
        },
        _buildList: function (list, data) {
            //todo 这里用的是label
            var menu = "";
            for (var item = 0, count = list.length; item < count; item++) {
                var classes = ["autocompleter-item"];
                if (data.selectFirst && item === 0 && !data.changeWhenSelect) {
                    classes.push("autocompleter-item-selected")
                }
                var highlightReg = new RegExp(data.query, "gi");
                var label = (data.customLabel && list[item][data.customLabel]) ? list[item][data.customLabel] : list[item].label;

                var clear = label;
                label = data.highlightMatches ? label.replace(highlightReg, "<strong>$&</strong>") : label;

                var value = (data.customValue && list[item][data.customValue]) ? list[item][data.customValue] : list[item].value;

                if (data.template) {
                    var template = data.template.replace(/({{ label }})/gi, label);
                    for (var property in list[item]) {
                        if (list[item].hasOwnProperty(property)) {
                            var regex = new RegExp("{{ " + property + " }}", "gi");
                            template = template.replace(regex, list[item][property])
                        }
                    }
                    label = template
                }
                menu += '<li data-value="' + value + '" data-label="' + clear + '" class="' + classes.join(" ") + '">' + value + "</li>"
                /*if (value && data.isHref) {
                    if (list[item].countActivity > 0) {
                        menu += '<li data-value="' + value + '" data-label="' + clear + '" class="autocompleter-item-high ' + classes.join(" ") + '">' + '<a class="f-fl" target="_blank" href="' + WDGJ.PLATURL + "/pid/" + urlId + '">' + value + "</a>" + '<span class="f-fr">共有<a target="_blank" href="' + WDGJ.ACTIVITYURL + "/0-0-0-" + urlId + ".html" + '"><i>' + list[item].countActivity + "</i></a>个活动</span>";
                        "</li>"
                    } else {
                        menu += '<li data-value="' + value + '" data-label="' + clear + '" class="' + classes.join(" ") + '">' + '<a class="f-fl" target="_blank" href="' + "/pname/" + clear + '.html">' + value + "</a>" + '<span class="f-fr">暂无活动<a target="_blank" class="u-tx-link" href="' + WDGJ.ADDACTIVITY + '">点此添加</a></span>';
                        "</li>"
                    }
                } else {

                }*/
            }
            /*if (data.serachType == "nav") {

            } */
           /* else {
                if (data.serachType == "sns") {
                    $.each(list, function (i, a) {
                        switch (a.type) {
                            case"questions":
                                menu += '<li class="question autocompleter-item"><a class="f-fl" target="_blank" href="' + a.url.replace("www", "sns") + '">' + a.name + '</a><span class="f-fr">' + a.detail.answer_count + "个回复</span></li>"
                        }
                    })
                }
            }*/
            if (list.length && data.hint) {
                var hint = (list[0].value.substr(0, data.query.length).toUpperCase() === data.query.toUpperCase()) ? list[0].value : false;
                if (hint && (data.query !== list[0].value)) {
                    var hintReg = new RegExp(data.query, "i");
                    var hintText = hint.replace(hintReg, "<span>" + data.query + "</span>");
                    data.$autocompleter.find(".autocompleter-hint").addClass("autocompleter-hint-show").html(hintText);
                    data.hintText = hintText
                }
            }
            data.response = list;
            data.$autocompleter.find(".autocompleter-list").html(menu);
            data.$selected = (data.$autocompleter.find(".autocompleter-item-selected").length) ? data.$autocompleter.find(".autocompleter-item-selected") : null;
            data.$list = (list.length) ? data.$autocompleter.find(".autocompleter-item") : null;
            data.index = data.$selected ? data.$list.index(data.$selected) : -1;

            data.$autocompleter.find(".autocompleter-item").each(function (i, j) {
                $(j).data(data.response[i])
            })
        },
        _onKeyup: function (e) {
            var data = e.data;
            var code = e.keyCode ? e.keyCode : e.which;
            if ((code === 40 || code === 38) && data.$autocompleter.hasClass("autocompleter-show")) {
                var len = data.$list.length, next, prev;
                if (len) {
                    if (len > 1) {
                        if (data.index === len - 1) {
                            next = data.changeWhenSelect ? -1 : 0;
                            prev = data.index - 1
                        } else {
                            if (data.index === 0) {
                                next = data.index + 1;
                                prev = data.changeWhenSelect ? -1 : len - 1
                            } else {
                                if (data.index === -1) {
                                    next = 0;
                                    prev = len - 1
                                } else {
                                    next = data.index + 1;
                                    prev = data.index - 1
                                }
                            }
                        }
                    } else {
                        if (data.index === -1) {
                            next = 0;
                            prev = 0
                        } else {
                            prev = -1;
                            next = -1
                        }
                    }
                    data.index = (code === 40) ? next : prev;
                    data.$list.removeClass("autocompleter-item-selected");
                    if (data.index !== -1) {
                        data.$list.eq(data.index).addClass("autocompleter-item-selected")
                    }
                    data.$selected = data.$autocompleter.find(".autocompleter-item-selected").length ? data.$autocompleter.find(".autocompleter-item-selected") : null;
                    if (data.changeWhenSelect) {
                        this._setValue(data)
                    }
                }
            } else {
                if ($.inArray(code, ignoredKeyCode) === -1 && $.inArray(code, data.ignoredKeyCode) === -1) {
                    this._launch(data)
                }
            }
        },
        _onKeydownHelper: function (e) {
            var code = e.keyCode ? e.keyCode : e.which;
            var data = e.data;
            if (code === 40 || code === 38) {
                e.preventDefault();
                e.stopPropagation()
            } else {
                if (code === 39) {
                    if (data.hint && data.hintText && data.$autocompleter.find(".autocompleter-hint").hasClass("autocompleter-hint-show")) {
                        e.preventDefault();
                        e.stopPropagation();
                        var hintOrigin = data.$autocompleter.find(".autocompleter-item").length ? data.$autocompleter.find(".autocompleter-item").eq(0).attr("data-label") : false;
                        if (hintOrigin) {
                            data.query = hintOrigin;
                            this._setHint(data)
                        }
                    }
                } else {
                    if (code === 13) {
                        if (data.$autocompleter.hasClass("autocompleter-show") && data.$selected) {
                            this._select(e)
                        }
                    }
                }
            }
        },
        _onFocus: function (e, internal) {
            var that = this;
            if (!internal) {
                var data = e.data;
                data.$autocompleter.addClass("autocompleter-focus");
                if (!data.$node.prop("disabled") && !data.$autocompleter.hasClass("autocompleter-show") && $.trim(data.$node.val()) == 0) {
                    if (data.focusOpen) {
                        data.focused = true;
                        setTimeout(function () {
                            data.focused = false
                        }, 500)
                    }
                }
            }
        },
        _onBlur: function (e, internal) {
            e.preventDefault();
            e.stopPropagation();
            var data = e.data;
            if (!internal) {
                data.$autocompleter.removeClass("autocompleter-focus")
            }
        },
        _onMousedown: function (e) {
            if (e.type === "mousedown" && $.inArray(e.which, [2, 3]) !== -1) {
                return
            }
            var data = e.data;
            if (data.$list && !data.focused) {
                if (!data.$node.is(":disabled")) {
                    if (data.$autocompleter.hasClass("autocompleter-closed")) {
                        this._open(e)
                    } else {
                        if (data.$autocompleter.hasClass("autocompleter-show")) {
                            this._close(e)
                        }
                    }
                }
            }
        },
        _open: function (e, instanceData) {
            var that = this;
            var data = e ? e.data : instanceData;
            if (!data.$node.prop("disabled") && !data.$autocompleter.hasClass("autocompleter-show") && data.$list && data.$list.length) {
                data.$autocompleter.removeClass("autocompleter-closed").addClass("autocompleter-show");
                $body.on("click.autocompleter-" + data.guid, ":not(.autocompleter-item)", data, function (e) {
                    that._closeHelper(e)
                })
            }
        },
        _closeHelper: function (e) {
            var that = this;
            if ($(e.target).hasClass("autocompleter-node")) {
                return
            }
            if ($(e.currentTarget).parents(".autocompleter").length === 0) {
                that._close(e)
            }
        },
        _close: function (e, instanceData) {
            var data = e ? e.data : instanceData;
            if (data.$autocompleter.hasClass("autocompleter-show")) {
                data.$autocompleter.removeClass("autocompleter-show").addClass("autocompleter-closed");
                $body.off(".autocompleter-" + data.guid)
            }
        },
        _select: function (e, elem) {
            if (e.type === "mousedown" && $.inArray(e.which, [2, 3]) !== -1) {
                return
            }
            var data = e.data;
            if (data.isHref) {
                return
            }
            e.preventDefault();
            e.stopPropagation();
            if (e.type === "mousedown" && $(elem).length) {
                data.$selected = $(elem);
                data.index = data.$list.index(data.$selected)
            }
            if (!data.$node.prop("disabled")) {
                this._close(e);
                this._update(data);
                if (e.type === "click") {
                    data.$node.trigger("focus", [true])
                }
            }
        },
        _setHint: function (data) {
            this._setValue(data);
            this._handleChange(data);
            this._launch(data)
        },
        _setValue: function (data) {
            if (data.$selected) {
                if (data.hintText && data.$autocompleter.find(".autocompleter-hint").hasClass("autocompleter-hint-show")) {
                    data.$autocompleter.find(".autocompleter-hint").removeClass("autocompleter-hint-show")
                }
                var value = data.$selected.attr("data-value") ? data.$selected.attr("data-value") : data.$selected.attr("data-label");
                data.$node.val(value)
            } else {
                if (data.hintText && !data.$autocompleter.find(".autocompleter-hint").hasClass("autocompleter-hint-show")) {
                    data.$autocompleter.find(".autocompleter-hint").addClass("autocompleter-hint-show")
                }
                data.$node.val(data.query)
            }
        },
        _update: function (data) {
            this._setValue(data);
            this._handleChange(data);
            this._clear(data)
        },
        _handleChange: function (data) {
            data.callback.call(data.$autocompleter, data.$node.val(), data.index, data.response[data.index]);
            data.$node.trigger("change")
        },
        _grab: function (response, offset) {
            offset = offset.split(".");
            while (response && offset.length) {
                response = response[offset.shift()]
            }
            return response
        },
        _setCache: function (url, data) {
            if (!supportLocalStorage) {
                return
            }
            if (url && data) {
                cache[url] = {value: data};
                try {
                    localStorage.setItem(localStorageKey, JSON.stringify(cache))
                } catch (e) {
                    var code = e.code || e.number || e.message;
                    if (code === 22) {
                        this._deleteCache()
                    } else {
                        throw (e)
                    }
                }
            }
        },
        _getCache: function (url) {
            if (!url) {
                return
            }
            var response = (cache[url] && cache[url].value) ? cache[url].value : false;
            return response
        },
        _loadCache: function () {
            if (!supportLocalStorage) {
                return
            }
            var json = localStorageKey.getItem(localStorageKey) || "{}";
            return JSON.parse(json)
        },
        _deleteCache: function () {
            var that = this;
            try {
                localStorageKey.removeItem(localStorageKey);
                cache = that._loadCache()
            } catch (e) {
                throw (e)
            }
        }
    };
    return autocomplete
});