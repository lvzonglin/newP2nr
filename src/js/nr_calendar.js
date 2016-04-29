define(function (require, exports, module) {
    var VERSION = "1.0.0",
        jQuery = $ = require("jquery-1.8.2.min"),
        format = require("./nr_dateFormate.js"),
        defaults = {
            format: "yyyy-mm-dd",
            multSelect: false,
            startMode: "day",
            months: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
            monthsShort: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
            weekDays: ["一", "二", "三", "四", "五", "六", "日"],
            buttonsNames: ["今天", "清除"],
            date: new Date(),
            buttons: false,
            renderElement: false,
            getDates: function (d) {},
            click: function (d, d0) {},
            _storage: []
        },
        _year = 0,
        _month = 0,
        _day = 0,
        _today = new Date(),
        _mode = "day",
        _distance = 0,
        table = $("<table/>").addClass("nr-calendar"),
        $div = $("<div class='nr-calendar-wrap'/>"),
        _events = [];

    if (!Array.prototype.indexOf){
        Array.prototype.indexOf = function(elt){
            var len = this.length >>> 0;
            var from = Number(arguments[1]) || 0;
            from = (from < 0)
                ? Math.ceil(from)
                : Math.floor(from);
            if (from < 0){
                from += len;
            }
            for (; from < len; from++){
                if (from in this &&
                    this[from] === elt)
                    return from;
            }
            return -1;
        };
    }

    var Calendar = function (el, options) {
        var element = $(el);
        var that = this;
        this.element = element;
        this.options = $.extend({}, defaults, options);
        if (element.data("multiSelect") != undefined) {
            this.options.multiSelect = element.data("multiSelect")
        }
        if (element.data("format") != undefined) {
            this.options.format = element.data("format")
        }
        if (element.data("date") != undefined) {
            this.options.date = new Date(element.data("date"))
        }
        if (element.data("months") != undefined) {
            this.options.months = element.data("months")
        }
        if (element.data("weekDays") != undefined) {
            this.options.weekDays = element.data("weekDays")
        }
        if (element.data("startMode") != undefined) {
            this.options.startMode = element.data("startMode")
        }
        _year = this.options.date.getFullYear();
        _distance = parseInt(this.options.date.getFullYear()) - 4;
        _month = this.options.date.getMonth();
        _day = this.options.date.getDate();
        _mode = this.options.startMode;
        element.data("_storage", []);

        if (this.options.renderElement) {
            var initD = format(new Date(_year, _month, _day), that.options.format);
            element.val(initD)
        }
        element.bind("focus click", function (e) {
            that._renderCalendar();
            e.stopPropagation()
        });
        $("body").on("click", function (e) {
            if (e.target === element) {
                return
            }
            $div.hide()
        })
    };
    Calendar.prototype = {
        _renderMonth: function () {
            var year = _year,
                month = _month,
                day = _day,
                feb = 28;
            //判断是否是闰年
            if (month == 1) {
                if ((year % 100 != 0) && (year % 4 == 0) || (year % 400 == 0)) {
                    feb = 29
                }
            }
            var totalDays = ["31", "" + feb + "", "31", "30", "31", "30", "31", "31", "30", "31", "30", "31"];
            var daysInMonth = totalDays[month];
            var first_week_day = new Date(year, month, 1).getDay();
            var tr, td, i;
            this.element.html("");
            table.html("");

            tr = $("<tr/>");
            $("<td/>").html("<a class='btn-previous-year' href='#'><i class='icon-backward'></i></a>").appendTo(tr);
            $("<td/>").html("<a class='btn-previous-month' href='#'><i class='icon-caret-left'></i></a>").appendTo(tr);
            $("<td/>").attr("colspan", 3).addClass("nr-text-center").html("<a class='btn-select-month' href='#'>" + this.options.months[month] + " " + year + "</a>").appendTo(tr);
            $("<td/>").html("<a class='btn-next-month' href='#'><i class='icon-caret-right'></i></a>").appendTo(tr);
            $("<td/>").html("<a class='btn-next-year' href='#'><i class='icon-forward'></i></a>").appendTo(tr);
            tr.addClass("nr-calendar-header").appendTo(table);

            tr = $("<tr/>");
            for (var i = 0; i < 7; i++) {
                td = $("<td/>").addClass("day-of-week").html(this.options.weekDays[i]).appendTo(tr)
            }
            tr.addClass("nr-calendar-subheader").appendTo(table);

            tr = $("<tr/>");
            for (var i = 0; i < first_week_day; i++) {
                td = $("<td/>").addClass("nr-calendar-empty").html("").appendTo(tr)
            }

            var week_day = first_week_day;
            for (var i = 1; i <= daysInMonth; i++) {
                week_day %= 7;
                if (week_day == 0) {
                    tr.appendTo(table);
                    tr = $("<tr/>")
                }
                td = $("<td/>").addClass("nr-calendar-day").html("<a href='#'>" + i + "</a>");
                if (year == _today.getFullYear() && month == _today.getMonth() && _today.getDate() == i) {
                    td.addClass("nr-calendar-today")
                }

                var d = format(new Date(_year, _month, i), "yyyy-mm-dd");
                if (this.element.data("_storage").indexOf(d) >= 0) {
                    td.find("a").addClass("nr-calendar-selected")
                }
                td.appendTo(tr);
                week_day++
            }
            for (i = week_day + 1; i <= 7; i++) {
                td = $("<td/>").addClass("nr-calendar-empty").html("").appendTo(tr)
            }
            tr.appendTo(table);
            if (this.options.buttons) {
                tr = $("<tr/>").addClass("nr-calendar-actions");
                td = $("<td/>").attr("colspan", 7).addClass("text-left").html("" + "<button class='nr-button calendar-btn-today'>" + this.options.buttonsNames[0] + "</button>&nbsp;<button class='nr-button calendar-btn-clear'>" + this.options.buttonsNames[1] + "</button>");
                td.appendTo(tr);
                tr.appendTo(table)
            }
            this._initPosition();
            this.options.getDates(this.element.data("_storage"))
        },
        _renderMonths: function () {
            var tr, td, i, j;
            this.element.html("");
            table.html("");
            tr = $("<tr/>");
            $("<td/>").html("<a class='btn-previous-year' href='#'><i class='icon-arrow-left-4'></i></a>").appendTo(tr);
            $("<td/>").attr("colspan", 2).html("<a class='btn-select-year' href='#'>" + _year + "</a>").appendTo(tr);
            $("<td/>").html("<a class='btn-next-year' href='#'><i class='icon-arrow-right-4'></i></a>").appendTo(tr);
            tr.addClass("nr-calendar-header").appendTo(table);
            tr = $("<tr/>");
            j = 0;
            for (i = 0; i < 12; i++) {
                td = $("<td/>").addClass("nr-calendar-month").html("<a href='#' data-month='" + i + "'>" + this.options.monthsShort[i] + "</a>");
                if (_month == i && (new Date()).getFullYear() == _year) {
                    td.addClass("nr-calendar-today")
                }
                td.appendTo(tr);
                if ((j + 1) % 4 == 0) {
                    tr.appendTo(table);
                    tr = $("<tr/>")
                }
                j += 1
            }
            this._initPosition()
        },
        _renderYears: function () {
            var tr, td, i, j;
            this.element.html("");
            table.html("");
            tr = $("<tr/>");
            $("<td/>").html("<a class='btn-previous-year' href='#'><i class='icon-arrow-left-4'></i></a>").appendTo(tr);
            $("<td/>").attr("colspan", 2).html((_distance) + "-" + (_distance + 11)).appendTo(tr);
            $("<td/>").html("<a class='btn-next-year' href='#'><i class='icon-arrow-right-4'></i></a>").appendTo(tr);
            tr.addClass("nr-calendar-header").appendTo(table);
            tr = $("<tr/>");
            j = 0;
            for (i = _distance; i < _distance + 12; i++) {
                td = $("<td/>").addClass("nr-calendar-year").html("<a href='#' data-year='" + i + "'>" + i + "</a>");
                if ((new Date()).getFullYear() == i) {
                    td.addClass("nr-calendar-today")
                }
                td.appendTo(tr);
                if ((j + 1) % 4 == 0) {
                    tr.appendTo(table);
                    tr = $("<tr/>")
                }
                j += 1
            }
            this._initPosition()
        },
        _initPosition: function () {
            var el_left = this.element.offset().left, el_top = this.element.offset().top + this.element.outerHeight();
            $div.css({"position": "absolute", "left": el_left, "top": el_top}).append(table);
            if ($(".nr-calendar-wrap").length == 0) {
                $("body").append($div).show()
            } else {
                $div.show()
            }
        },
        _renderCalendar: function () {
            switch (_mode) {
                case"year":
                    this._renderYears();
                    break;
                case"month":
                    this._renderMonths();
                    break;
                default:
                    this._renderMonth()
            }
            this._initButtons()
        },
        _initButtons: function () {
            var that = this, table = $(".nr-calendar");
            if (_mode == "day") {
                table.find(".btn-select-month").on("click", function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    _mode = "month";
                    that._renderCalendar()
                });
                table.find(".btn-previous-month").on("click", function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    _month -= 1;
                    if (_month < 0) {
                        _year -= 1;
                        _month = 11
                    }
                    that._renderCalendar()
                });
                table.find(".btn-next-month").on("click", function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    _month += 1;
                    if (_month == 12) {
                        _year += 1;
                        _month = 0
                    }
                    that._renderCalendar()
                });
                table.find(".btn-previous-year").on("click", function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    _year -= 1;
                    that._renderCalendar()
                });
                table.find(".btn-next-year").on("click", function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    _year += 1;
                    that._renderCalendar()
                });
                //todo 今天和清除的还没做
                table.find(".calendar-btn-today").on("click", function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    that.options.date = new Date();
                    _year = that.options.date.getFullYear();
                    _month = that.options.date.getMonth();
                    _day = that.options.date.getDate();
                    that._renderCalendar()
                });
                table.find(".calendar-btn-clear").on("click", function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    that.options.date = new Date();
                    _year = that.options.date.getFullYear();
                    _month = that.options.date.getMonth();
                    _day = that.options.date.getDate();
                    that.element.data("_storage", []);
                    that._renderCalendar()
                });
                table.find(".nr-calendar-day a").on("click", function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    var d = format(new Date(_year, _month, parseInt($(this).html())), that.options.format);
                    var d0 = (new Date(_year, _month, parseInt($(this).html())));
                    if (that.options.multiSelect) {
                        $(this).toggleClass("nr-calendar-selected");
                        if ($(this).hasClass("nr-calendar-selected")) {
                            that._addDate(d)
                        } else {
                            that._removeDate(d)
                        }
                    } else {
                        table.find(".nr-calendar-day a").removeClass("nr-calendar-selected");
                        $(this).addClass("nr-calendar-selected");
                        that.element.data("_storage", []);
                        that.element.val(d);
                        that.element.trigger("oninput");
                        that._addDate(d)
                    }
                    that.options.getDates(that.element.data("_storage"));
                    $div.hide();
                    that.options.click(d, d0)
                })
            } else {
                if (_mode == "month") {
                    table.find(".nr-calendar-month a").on("click", function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        _month = parseInt($(this).data("month"));
                        _mode = "day";
                        that._renderCalendar()
                    });
                    table.find(".btn-previous-year").on("click", function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        _year -= 1;
                        that._renderCalendar()
                    });
                    table.find(".btn-next-year").on("click", function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        _year += 1;
                        that._renderCalendar()
                    });
                    table.find(".btn-select-year").on("click", function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        _mode = "year";
                        that._renderCalendar()
                    })
                } else {
                    table.find(".nr-calendar-year a").on("click", function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        _year = parseInt($(this).data("year"));
                        _mode = "month";
                        that._renderCalendar()
                    });
                    table.find(".btn-previous-year").on("click", function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        _distance -= 10;
                        that._renderCalendar()
                    });
                    table.find(".btn-next-year").on("click", function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        _distance += 10;
                        that._renderCalendar()
                    })
                }
            }
        },
        _addDate: function (d) {
            var index = this.element.data("_storage").indexOf(d);
            if (index < 0) {
                this.element.data("_storage").push(d)
            }
        },
        _removeDate: function (d) {
            var index = this.element.data("_storage").indexOf(d);
            this.element.data("_storage").splice(i, 1)
        },
        setDate: function (d) {
            var r;
            d = new Date(d);
            r = (new Date(d.getFullYear() + "/" + (d.getMonth() + 1) + "/" + d.getDate())).format("yyyy-mm-dd");
            this._addDate(r);
            this._renderCalendar()
        },
        unsetDate: function (d) {
            var r;
            d = new Date(d);
            r = (new Date(d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate())).format("yyyy-mm-dd");
            this._removeDate(r);
            this._renderCalendar()
        },
        getDate: function (index) {
            return new Date(index != undefined ? this.element.data("_storage")[index] : this.element.data("_storage")[0]).format(this.options.format)
        },
        getDates: function () {
            return this.element.data("_storage")
        },
        _destroy: function () {
        },
        _setOption: function (key, value) {}
    };

    function calendar(el, options) {
        var elm = $(el);
        elm.each(function () {
            new Calendar(this, options)
        })
    }

    return calendar
});