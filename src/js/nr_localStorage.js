/**
 * P2NR v1.0.0 (http://www.p2nr.com)
 * Copyright 2015-2016 CDDAKA, Inc.

 * Created by daven.
 * time : 2016/3/30 0030.
 * Email : 515124651@qq.com.
 */
define(function (require, exports, module) {
    var VERSION = "1.0",
        jQuery = $ = require("jquery-1.8.2.min");

    var defaults = {
        excludeFields: [],
        customKeySuffix: "",
        locationBased: false,
        timeout: 0,
        autoRelease: true,
        onSave: function () {
        },
        onBeforeRestore: function () {
        },
        onRestore: function () {
        },
        onRelease: function () {
        }
    };

    var browserStorage = {};

    browserStorage.isAvailable = function () {
        try {
            return localStorage.getItem
        } catch (e) {
            return false
        }
    };
    browserStorage.set = function (key, value) {
        try {
            localStorage.setItem(key, value + "")
        } catch (e) {
        }
    };
    browserStorage.get = function (key) {
        return localStorage.getItem(key)
    };
    browserStorage.remove = function (key) {
        localStorage.removeItem(key)
    };
    var params = {
        instantiated: [],
        started: []
    };
    //todo 提示用户本地保存成功
    function nrLocalStorage(element, options) {
        var $elem = $(element)
        this.elem = $(element);

        this.identifier = $.map($elem, function (obj, i) {
            return $(obj).attr("id") + $(obj).attr("name")
        }).join();

        this.options = $.extend(true, defaults, options || {});
        this.browserStorage = browserStorage
    }

    nrLocalStorage.prototype = {
        init: function () {
            var self = this;
            this.herf = location.hostname + location.pathname + location.search + location.hash;

            if (!this.browserStorage.isAvailable()) {
                return false
            }
            var callback_result = this.options.onBeforeRestore.call(self);

            if (callback_result === undefined || callback_result) {
                self.restoreAllData()
            }
            if (this.options.autoRelease) {
                self.bindReleaseData()
            }
            if (!params.started[this.identifier]) {
                self.bindSaveData();
                params.started[self.identifier] = true
            }
        },
        bindSaveData: function () {
            var self = this;
            //自动保存
            if (self.options.timeout) {
                self.saveDataByTimeout()
            }
            self.elem.each(function () {
                var targetFormIdAndName = $(this).attr("id") + $(this).attr("name");

                self.findFieldsToProtect($(this)).each(function () {
                    if ($.inArray(this, self.options.excludeFields) !== -1) {
                        return true
                    }
                    var field = $(this);
                    var prefix = (self.options.locationBased ? self.href : "") + targetFormIdAndName + field.attr("name") + self.options.customKeySuffix;

                    if (field.is(":text") || field.is("textarea")) {
                        if (!self.options.timeout) {
                            self.bindSaveDataImmediately(field, prefix)
                        }
                    }
                    self.bindSaveDataOnChange(field)
                })
            })
        },
        bindSaveDataImmediately: function (field, prefix) {
            var self = this;
            if ("onpropertychange" in field) {
                field.get(0).onpropertychange = function () {
                    self.saveToBrowserStorage(prefix, field.val())
                }
            } else {
                field.get(0).oninput = function () {
                    self.saveToBrowserStorage(prefix, field.val())
                }
            }
        },
        saveToBrowserStorage: function (key, value, fireCallback) {
            fireCallback = fireCallback === undefined ? true : fireCallback;
            this.browserStorage.set(key, value);
            if (fireCallback && value !== "") {
                this.options.onSave.call(this)
            }
        },
        bindSaveDataOnChange: function (field) {
            var self = this;
            field.change(function () {
                self.saveAllData()
            })
        },
        saveAllData: function () {
            var self = this;
            self.elem.each(function () {
                var targetFormIdAndName = $(this).attr("id") + $(this).attr("name");

                var multiCheckboxCache = {};
                self.findFieldsToProtect($(this)).each(function () {
                    var field = $(this);
                    if ($.inArray(this, self.options.excludeFields) !== -1 || field.attr("name") === undefined) {
                        return true
                    }
                    var prefix = (self.options.locationBased ? self.href : "") + targetFormIdAndName + field.attr("name") + self.options.customKeySuffix;
                    var value = field.val();

                    if (field.is(":checkbox")) {
                        if (field.attr("name").indexOf("[") !== -1) {
                            if (multiCheckboxCache[field.attr("name")] === true) {
                                return
                            }
                            value = [];
                            $("[name='" + field.attr("name") + "']:checked").each(function () {
                                value.push($(this).val())
                            });
                            multiCheckboxCache[field.attr("name")] = true
                        } else {
                            value = field.is(":checked")
                        }

                        self.saveToBrowserStorage(prefix, value, false)
                    } else {
                        if (field.is(":radio")) {
                            if (field.is(":checked")) {
                                value = field.val();
                                self.saveToBrowserStorage(prefix, value, false)
                            }
                        } else {
                            self.saveToBrowserStorage(prefix, value, false)
                        }
                    }
                })
            });
            self.options.onSave.call(self)
        },
        saveDataByTimeout: function () {
            var self = this;
            setInterval(function () {
                self.saveAllData()
            }, self.options.timeout * 1000)
        },
        //过滤不必要的字段
        findFieldsToProtect: function (target) {
            return target.find(":input").not(":submit").not(":reset").not(":button").not(":file").not(":password").not(":disabled").not("[readonly]")
        },
        restoreAllData: function () {
            var self = this;
            var restored = false;
            self.elem.each(function () {
                var target = $(this);
                var targetFormIdAndName = $(this).attr("id") + $(this).attr("name");
                self.findFieldsToProtect(target).each(function () {
                    if ($.inArray(this, self.options.excludeFields) !== -1) {
                        return true
                    }
                    var field = $(this);
                    var prefix = (self.options.locationBased ? self.href : "") + targetFormIdAndName + field.attr("name") + self.options.customKeySuffix;
                    var resque = self.browserStorage.get(prefix);

                    if (resque !== null) {
                        self.restoreFieldsData(field, resque);
                        restored = true
                    }
                })
            });
            if (restored) {
                self.options.onRestore.call(self)
            }
        },
        restoreFieldsData: function (field, resque) {
            if (field.attr("name") === undefined) {
                return false
            }

            if (field.is(":checkbox") && resque !== "false" && field.attr("name").indexOf("[") === -1) {
                field.attr("checked", "checked")
            } else {
                if (field.is(":checkbox") && resque === "false" && field.attr("name").indexOf("[") === -1) {
                    field.removeAttr("checked")
                } else {
                    if (field.is(":radio")) {
                        if (field.val() === resque) {
                            field.attr("checked", "checked")
                        }
                    } else {
                        if (field.attr("name").indexOf("[") === -1) {
                            field.val(resque)
                        } else {
                            resque = resque.split(",");
                            field.val(resque)
                        }
                    }
                }
            }
        },
        bindReleaseData: function () {
            var self = this;
            self.elem.each(function () {
                var target = $(this);
                var formIdAndName = target.attr("id") + target.attr("name");
                $(this).bind("submit reset", function () {
                    self.releaseData(formIdAndName, self.findFieldsToProtect(target))
                })
            })
        },
        releaseData: function (targetFormIdAndName, fieldsToProtect) {
            var released = false;
            var self = this;
            fieldsToProtect.each(function () {
                if ($.inArray(this, self.options.excludeFields) !== -1) {
                    return true
                }
                var field = $(this);
                var prefix = (self.options.locationBased ? self.href : "") + targetFormIdAndName + field.attr("name") + self.options.customKeySuffix;
                self.browserStorage.remove(prefix);
                released = true
            });
            if (released) {
                self.options.onRelease.call(self)
            }
        }
    };
    return nrLocalStorage
});