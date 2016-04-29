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

    function format(source, params) {
        if (arguments.length === 1) {
            return function () {
                var args = $.makeArray(arguments);
                args.unshift(source);
                return format.apply(this, args)
            }
        }
        if (arguments.length > 2 && params.constructor !== Array) {
            params = $.makeArray(arguments).slice(1)
        }
        if (params.constructor !== Array) {
            params = [params]
        }
        $.each(params, function (i, n) {
            source = source.replace(new RegExp("\\{" + i + "\\}", "g"), function () {
                return n
            })
        });
        return source
    }

    var methods = {
        required: function (value, element, param) {
            if (!this.depend(param, element)) {
                return "dependency-mismatch"
            }
            if (element.nodeName.toLowerCase() === "select") {
                var val = $(element).val();
                return val && val.length > 0
            }
            if (this.checkable(element)) {
                return this.getLength(value, element) > 0
            }
            return $.trim(value).length > 0
        },
        email: function (value, element) {
            return this.optional(element) || /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i.test(value)
        },
        url: function (value, element) {
            return this.optional(element) || /^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(value)
        },
        date: function (value, element) {
            return this.optional(element) || !/Invalid|NaN/.test(new Date(value).toString())
        },
        dateISO: function (value, element) {
            return this.optional(element) || /^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}$/.test(value)
        },
        number: function (value, element) {
            return this.optional(element) || /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(value)
        },
        digits: function (value, element) {
            return this.optional(element) || /^\d+$/.test(value)
        },
        creditcard: function (value, element) {
            if (this.optional(element)) {
                return "dependency-mismatch"
            }
            if (/[^0-9 \-]+/.test(value)) {
                return false
            }
            var nCheck = 0, nDigit = 0, bEven = false;
            value = value.replace(/\D/g, "");
            for (var n = value.length - 1; n >= 0; n--) {
                var cDigit = value.charAt(n);
                nDigit = parseInt(cDigit, 10);
                if (bEven) {
                    if ((nDigit *= 2) > 9) {
                        nDigit -= 9
                    }
                }
                nCheck += nDigit;
                bEven = !bEven
            }
            return (nCheck % 10) === 0
        },
        minlength: function (value, element, param) {
            var length = $.isArray(value) ? value.length : this.getLength($.trim(value), element);
            return this.optional(element) || length >= param
        },
        maxlength: function (value, element, param) {
            var length = $.isArray(value) ? value.length : this.getLength($.trim(value), element);
            return this.optional(element) || length <= param
        },
        rangelength: function (value, element, param) {
            var length = $.isArray(value) ? value.length : this.getLength($.trim(value), element);
            return this.optional(element) || (length >= param[0] && length <= param[1])
        },
        min: function (value, element, param) {
            return this.optional(element) || value >= param
        },
        max: function (value, element, param) {
            return this.optional(element) || value <= param
        },
        range: function (value, element, param) {
            return this.optional(element) || (value >= param[0] && value <= param[1])
        },
        equalTo: function (value, element, param) {
            var target = $(param);
            if (this.settings.onfocusout) {
                target.unbind(".validate-equalTo").bind("blur.validate-equalTo", function () {
                    $(element).valid()
                })
            }
            return value === target.val()
        },
        remote: function (value, element, param) {
            if (this.optional(element)) {
                return "dependency-mismatch"
            }
            var previous = this.previousValue(element);
            if (!this.settings.messages[element.name]) {
                this.settings.messages[element.name] = {}
            }
            previous.originalMessage = this.settings.messages[element.name].remote;
            this.settings.messages[element.name].remote = previous.message;
            param = typeof param === "string" && {url: param} || param;
            if (previous.old === value) {
                return previous.valid
            }
            previous.old = value;
            var validator = this;
            this.startRequest(element);
            var data = {};
            data[element.name] = value;
            $.ajax($.extend(true, {
                url: param,
                mode: "abort",
                port: "validate" + element.name,
                dataType: "json",
                data: data,
                success: function (response) {
                    validator.settings.messages[element.name].remote = previous.originalMessage;
                    var valid = response === true || response === "true";
                    if (valid) {
                        var submitted = validator.formSubmitted;
                        validator.prepareElement(element);
                        validator.formSubmitted = submitted;
                        validator.successList.push(element);
                        delete validator.invalid[element.name];
                        validator.showErrors()
                    } else {
                        var errors = {};
                        var message = response || validator.defaultMessage(element, "remote");
                        errors[element.name] = previous.message = $.isFunction(message) ? message(value) : message;
                        validator.invalid[element.name] = true;
                        validator.showErrors(errors)
                    }
                    previous.valid = valid;
                    validator.stopRequest(element, valid)
                }
            }, param));
            return "pending"
        }
    };
    var defaults = {
        messages: {},
        groups: {},
        rules: {},
        errorClass: "form_error",
        validClass: "valid",
        errorElement: "div",
        focusInvalid: false,
        errorContainer: $([]),
        errorLabelContainer: $([]),
        onsubmit: true,
        ignore: ":hidden",
        ignoreTitle: false,
        focusCleanup: true,
        onfocusin: function (element, event) {
            this.lastActive = element;
            if (this.settings.focusCleanup && !this.blockFocusCleanup) {
                if (this.settings.unhighlight) {
                    this.settings.unhighlight.call(this, element, this.settings.errorClass, this.settings.validClass)
                }
                this.addWrapper(this.errorsFor(element)).hide()
            }
        },
        onfocusout: function (element, event) {
            if (!this.checkable(element) && (element.name in this.submitted || !this.optional(element))) {
                this.element(element)
            }
        },
        onkeyup: function (element, event) {
            if (event.which === 9 && this.elementValue(element) === "") {
                return
            } else {
                if (element.name in this.submitted || element === this.lastElement) {
                    this.element(element)
                }
            }
        },
        onclick: function (element, event) {
            if (element.name in this.submitted) {
                this.element(element)
            } else {
                if (element.parentNode.name in this.submitted) {
                    this.element(element.parentNode)
                }
            }
        },
        highlight: function (element, errorClass, validClass) {
            if (element.type === "radio") {
                this.findByName(element.name).addClass(errorClass).removeClass(validClass)
            } else {
                $(element).addClass(errorClass).removeClass(validClass)
            }
        },
        //取消高亮
        unhighlight: function (element, errorClass, validClass) {
            if (element.type === "radio") {
                this.findByName(element.name).removeClass(errorClass).addClass(validClass)
            } else {
                $(element).removeClass(errorClass).addClass(validClass)
            }
        }
    };
    var messages = {
        required: "这个字段是必填的噢",
        remote: "请修正该字段",
        email: "请输入正确格式的电子邮件",
        url: "请输入合法的网址",
        date: "请输入合法的日期",
        dateISO: "请输入合法的日期 (ISO).",
        number: "请输入合法的数字",
        digits: "只能输入整数",
        creditcard: "请输入合法的信用卡号",
        equalTo: "请再次输入相同的值",
        maxlength: format("请输入一个 长度最多是 {0} 的字符串"),
        minlength: format("请输入一个 长度最少是 {0} 的字符串"),
        rangelength: format("请输入 一个长度介于 {0} 和 {1} 之间的字符串."),
        range: format("请输入一个介于 {0} 和 {1} 之间的值."),
        max: format("请输入一个最大为{0} 的值"),
        min: format("请输入一个最小为{0} 的值")
    };
    $.extend($.fn, {
        validateDelegate: function (delegate, type, handler) {
            return this.bind(type, function (event) {
                var target = $(event.target);
                if (target.is(delegate)) {
                    return handler.apply(target, arguments)
                }
            })
        }
    });
    function validator(form, options) {
        var that = this;
        this.currentForm = $(form);
        this.settings = $.extend(true, {}, defaults, options);

        if (this.settings.onsubmit) {
            this.currentForm.submit(function (event) {
                if (that.settings.debug) {
                    event.preventDefault()
                }
                function handle() {
                    var hidden;
                    if (that.settings.submitHandler) {
                        if (that.submitButton) {
                            hidden = $("<input type='hidden'/>").attr("name", that.submitButton.name).val($(that.submitButton).val()).appendTo(that.currentForm)
                        }
                        that.settings.submitHandler.call(that, that.currentForm, event);
                        if (that.submitButton) {
                            hidden.remove()
                        }
                        return false
                    }
                    return true
                }

                if (that.cancelSubmit) {
                    that.cancelSubmit = false;
                    return handle()
                }
                if (that.form()) {
                    if (that.pendingRequest) {
                        that.formSubmitted = true;
                        return false
                    }
                    return handle()
                } else {
                    that.focusInvalid();
                    return false
                }
            })
        }
        this.init()
    }

    validator.prototype = {
        init: function () {
            var that = this;
            this.labelContainer = $(this.settings.errorLabelContainer);
            this.errorContext = this.labelContainer.length && this.labelContainer || $(this.currentForm);
            this.containers = $(this.settings.errorContainer).add(this.settings.errorLabelContainer);
            this.submitted = {};
            this.valueCache = {};
            this.pendingRequest = 0;
            this.pending = {};
            this.invalid = {};
            this.reset();
            var groups = (this.groups = {});
            $.each(this.settings.groups, function (key, value) {
                if (typeof value === "string") {
                    value = value.split(/\s/)
                }
                $.each(value, function (index, name) {
                    groups[name] = key
                })
            });

            function delegate(event) {
                var eventType = "on" + event.type.replace(/^validate/, "");
                if (that.settings[eventType]) {
                    that.settings[eventType].call(that, this[0], event)
                }
            }

            $(this.currentForm)
                .validateDelegate(":text, [type='password'], [type='file'], select, textarea, " + "[type='number'], [type='search'] ,[type='tel'], [type='url'], " + "[type='email'], [type='datetime'], [type='date'], [type='month'], " + "[type='week'], [type='time'], [type='datetime-local'], " + "[type='range'], [type='color'] ", "focusin focusout", delegate)
                .validateDelegate("[type='radio'], [type='checkbox'], select, option", "click", delegate);

        },
        form: function () {
            this.checkForm();
            $.extend(this.submitted, this.errorMap);
            this.invalid = $.extend({}, this.errorMap);
            if (!this.valid()) {
                $(this.currentForm).triggerHandler("invalid-form", [this])
            }
            this.showErrors();
            return this.valid()
        },
        checkForm: function () {
            this.prepareForm();
            for (var i = 0, elements = (this.currentElements = this.elements()); elements[i]; i++) {
                this.check(elements[i])
            }
            return this.valid()
        },
        element: function (element) {
            element = this.validationTargetFor(this.clean(element));
            this.lastElement = element;
            this.prepareElement(element);
            this.currentElements = $(element);
            var result = this.check(element) !== false;
            if (result) {
                delete this.invalid[element.name]
            } else {
                this.invalid[element.name] = true
            }
            if (!this.numberOfInvalids()) {
                this.toHide = this.toHide.add(this.containers)
            }
            this.showErrors();
            return result
        },
        showErrors: function (errors) {
            if (errors) {
                $.extend(this.errorMap, errors);
                this.errorList = [];
                for (var name in errors) {
                    this.errorList.push({message: errors[name], element: this.findByName(name)[0]})
                }
                this.successList = $.grep(this.successList, function (element) {
                    return !(element.name in errors)
                })
            }
            if (this.settings.showErrors) {
                this.settings.showErrors.call(this, this.errorMap, this.errorList)
            } else {
                this.defaultShowErrors()
            }
        },
        resetForm: function () {
            if ($.fn.resetForm) {
                $(this.currentForm).resetForm()
            }
            this.submitted = {};
            this.lastElement = null;
            this.prepareForm();
            this.hideErrors();
            this.elements().removeClass(this.settings.errorClass).removeData("previousValue")
        },
        numberOfInvalids: function () {
            return this.objectLength(this.invalid)
        },
        objectLength: function (obj) {
            var count = 0;
            for (var i in obj) {
                count++
            }
            return count
        },
        hideErrors: function () {
            this.addWrapper(this.toHide).hide()
        },
        valid: function () {
            return this.size() === 0
        },
        size: function () {
            return this.errorList.length
        },
        focusInvalid: function () {
            if (this.settings.focusInvalid) {
                try {
                    $(this.findLastActive() || this.errorList.length && this.errorList[0].element || []).filter(":visible").focus().trigger("focusin")
                } catch (e) {
                }
            }
        },
        findLastActive: function () {
            var lastActive = this.lastActive;
            return lastActive && $.grep(this.errorList, function (n) {
                    return n.element.name === lastActive.name
                }).length === 1 && lastActive
        },
        elements: function () {
            var validator = this,
                rulesCache = {};

            var that = this;
            return $(this.currentForm).find("input, select, textarea").not(":submit, :reset, :image, [disabled]").not(this.settings.ignore).filter(function () {
                if (!this.name && validator.settings.debug && window.console) {
                    console.error("%o has no name assigned", this)
                }
                if (this.name in rulesCache || !that.objectLength(that.rules(this))) {
                    return false
                }
                rulesCache[this.name] = true;
                return true
            })
        },
        clean: function (selector) {
            return $(selector)[0]
        },
        errors: function () {
            var errorClass = this.settings.errorClass.replace(" ", ".");
            return $(this.settings.errorElement + "." + errorClass, this.errorContext)
        },
        reset: function () {
            this.successList = [];
            this.errorList = [];
            this.errorMap = {};
            this.toShow = $([]);
            this.toHide = $([]);
            this.currentElements = $([])
        },
        prepareForm: function () {
            this.reset();
            this.toHide = this.errors().add(this.containers)
        },
        prepareElement: function (element) {
            this.reset();
            this.toHide = this.errorsFor(element)
        },
        elementValue: function (element) {
            var type = $(element).attr("type"), val = $(element).val();
            if (type === "radio" ||  type === "checkbox") {
                return $("input[name='" + $(element).attr("name") + "']:checked").val()
            }
            if (typeof val === "string") {
                return val.replace(/\r/g, "")
            }
            return val
        },
        check: function (element) {
            element = this.validationTargetFor(this.clean(element));
            var rules = this.rules(element);
            var dependencyMismatch = false;
            var val = this.elementValue(element);
            var result;

            for (var method in rules) {
                var rule = {
                    method: method,
                    parameters: rules[method]
                };

                try {
                    result = methods[method].call(this, val, element, rule.parameters);

                    if (result === "dependency-mismatch") {
                        dependencyMismatch = true;
                        continue
                    }
                    dependencyMismatch = false;
                    if (result === "pending") {
                        this.toHide = this.toHide.not(this.errorsFor(element));
                        return
                    }

                    if (!result) {
                        this.formatAndAdd(element, rule);
                        return false
                    }
                } catch (e) {
                    if (this.settings.debug && window.console) {
                        console.log("Exception occurred when checking element " + element.id + ", check the '" + rule.method + "' method.", e)
                    }
                    throw e
                }
            }
            if (dependencyMismatch) {
                return
            }
            if (this.objectLength(rules)) {
                this.successList.push(element)
            }
            return true
        },
        customDataMessage: function (element, method) {
            return $(element).data("msg-" + method.toLowerCase()) || (element.attributes && $(element).attr("data-msg-" + method.toLowerCase()))
        },
        customMessage: function (name, method) {
            var m = this.settings.messages[name];
            return m && (m.constructor === String ? m : m[method])
        },
        findDefined: function () {
            for (var i = 0; i < arguments.length; i++) {
                if (arguments[i] !== undefined) {
                    return arguments[i]
                }
            }
            return undefined
        },
        defaultMessage: function (element, method) {
            return this.findDefined(this.customMessage(element.name, method), this.customDataMessage(element, method), !this.settings.ignoreTitle && element.title || undefined, messages[method], "<strong>Warning: No message defined for " + element.name + "</strong>")
        },
        formatAndAdd: function (element, rule) {
            var message = this.defaultMessage(element, rule.method),
                theregex = /\$?\{(\d+)\}/g;

            if (typeof message === "function") {
                message = message.call(this, rule.parameters, element)
            } else {
                if (theregex.test(message)) {
                    message = $.validator.format(message.replace(theregex, "{$1}"), rule.parameters)
                }
            }
            this.errorList.push({message: message, element: element});
            this.errorMap[element.name] = message;
            this.submitted[element.name] = message;
        },
        addWrapper: function (toToggle) {
            if (this.settings.wrapper) {
                toToggle = toToggle.add(toToggle.parent(this.settings.wrapper))
            }
            return toToggle
        },
        defaultShowErrors: function () {
            var i, elements;
            for (i = 0; this.errorList[i]; i++) {
                var error = this.errorList[i];
                if (this.settings.highlight) {
                    this.settings.highlight.call(this, error.element, this.settings.errorClass, this.settings.validClass)
                }
                this.showLabel(error.element, error.message)
            }
            if (this.errorList.length) {
                this.toShow = this.toShow.add(this.containers);
            }

            if (this.settings.success) {
                for (i = 0; this.successList[i]; i++) {
                    this.showLabel(this.successList[i])
                }
            }

            if (this.settings.unhighlight) {
                for (i = 0, elements = this.validElements(); elements[i]; i++) {
                    this.settings.unhighlight.call(this, elements[i], this.settings.errorClass, this.settings.validClass)
                }
            }
            this.toHide = this.toHide.not(this.toShow);
            this.hideErrors();
            this.addWrapper(this.toShow).show()
        },
        validElements: function () {
            return this.currentElements.not(this.invalidElements())
        },
        invalidElements: function () {
            return $(this.errorList).map(function () {
                return this.element
            })
        },
        showLabel: function (element, message) {
            var label = this.errorsFor(element);
            if (this.settings.temple == 2) {
                var temple2 = "<div class='profile_error'></div>";
                if (label.length && !this.labelContainer.length) {
                    label.addClass("profile_error");
                    label.html(message).show()
                } else {
                    label = $(temple2).attr("for", this.idOrName(element)).removeClass(this.settings.validClass).addClass(this.settings.errorClass).html(message || "");
                    label.insertAfter(element)
                }
            } else {
                if (label.length && !this.labelContainer.length) {
                    label.removeClass(this.settings.success).addClass(this.settings.errorClass).addClass("error_wrapper");
                    label.find(".error_content").html(message);
                    label.show()
                } else {
                    var temple = '<div class="error_wrapper">' + '<span class="error_bot"></span><span class="error_top"></span>' + '<div class="error_content"></div></div>';
                    label = $(temple).attr("for", this.idOrName(element)).removeClass(this.settings.validClass).addClass(this.settings.errorClass);
                    label.find(".error_content").html(message || "");
                    if (this.settings.wrapper) {
                        label = label.hide().show().wrap("<" + this.settings.wrapper + "/>").parent()
                    }
                    if (this.labelContainer.length) {
                        var wrapLabel = this.errorsFor(element);
                        if (wrapLabel.length) {
                            this.labelContainer.find(wrapLabel).html(message).show()
                        } else {
                            wrapLabel = $("<div></div>").attr("for", this.idOrName(element)).html(message || "").removeClass(this.settings.validClass).addClass(this.settings.errorClass);
                            this.labelContainer.append(wrapLabel)
                        }
                    } else {
                        label.insertAfter(element)
                    }
                }
            }
            if (!message && this.settings.success) {
                label.find(".error_content").html("");
                if (typeof this.settings.success === "string") {
                    label.removeClass("error_wrapper").addClass(this.settings.success)
                } else {
                    this.settings.success(label, element)
                }
            }
            this.toShow = this.toShow.add(label).add(wrapLabel)
        },
        errorsFor: function (element) {
            var name = this.idOrName(element);
            return this.errors().filter(function () {
                return $(this).attr("for") === name
            })
        },
        idOrName: function (element) {
            return this.groups[element.name] || (this.checkable(element) ? element.name : element.id || element.name)
        },
        validationTargetFor: function (element) {
            if (this.checkable(element)) {
                element = this.findByName(element.name).not(this.settings.ignore)[0]
            }
            return element
        },
        checkable: function (element) {
            return (/radio|checkbox/i).test(element.type)
        },
        findByName: function (name) {
            return $(this.currentForm).find("[name='" + name + "']")
        },
        getLength: function (value, element) {
            switch (element.nodeName.toLowerCase()) {
                case"select":
                    return $("option:selected", element).length;
                case"input":
                    if (this.checkable(element)) {
                        return this.findByName(element.name).filter(":checked").length
                    }
            }
            return value.length
        },
        depend: function (param, element) {
            return this.dependTypes[typeof param] ? this.dependTypes[typeof param](param, element) : true
        },
        dependTypes: {
            "boolean": function (param, element) {
                return param
            }, "string": function (param, element) {
                return !!$(param, element.form).length
            }, "function": function (param, element) {
                return param(element)
            }
        },
        optional: function (element) {
            var val = this.elementValue(element);
            return !methods.required.call(this, val, element) && "dependency-mismatch"
        },
        startRequest: function (element) {
            if (!this.pending[element.name]) {
                this.pendingRequest++;
                this.pending[element.name] = true
            }
        },
        stopRequest: function (element, valid) {
            this.pendingRequest--;
            if (this.pendingRequest < 0) {
                this.pendingRequest = 0
            }
            delete this.pending[element.name];
            if (valid && this.pendingRequest === 0 && this.formSubmitted && this.form()) {
                $(this.currentForm).submit();
                this.formSubmitted = false
            } else {
                if (!valid && this.pendingRequest === 0 && this.formSubmitted) {
                    $(this.currentForm).triggerHandler("invalid-form", [this]);
                    this.formSubmitted = false
                }
            }
        },
        previousValue: function (element) {
            return $.data(element, "previousValue") || $.data(element, "previousValue", {
                    old: null,
                    valid: true,
                    message: this.defaultMessage(element, "remote")
                })
        },
        rules: function (element, command, argument) {
            var element = $(element);
            if (command) {
                //todo
            }
            var data = this.normalizeRules($.extend({}, this.classRules(element), this.attributeRules(element), this.dataRules(element), this.staticRules(element)), element);
            if (data.required) {
                var param = data.required;
                delete data.required;
                data = $.extend({required: param}, data)
            }
            return data
        },
        classRuleSettings: {
            required: {required: true},
            email: {email: true},
            url: {url: true},
            date: {date: true},
            dateISO: {dateISO: true},
            number: {number: true},
            digits: {digits: true},
            creditcard: {creditcard: true}
        },
        addClassRules: function (className, rules) {
            if (className.constructor === String) {
                this.classRuleSettings[className] = rules
            } else {
                $.extend(this.classRuleSettings, className)
            }
        },
        classRules: function (element) {
            var that = this;
            var rules = {};
            var classes = $(element).attr("class");
            if (classes) {
                $.each(classes.split(" "), function () {
                    if (this in that.classRuleSettings) {
                        $.extend(rules, that.classRuleSettings[this])
                    }
                })
            }
            return rules
        },
        attributeRules: function (element) {
            var rules = {};
            var $element = $(element);
            var type = $(element)[0].getAttribute("type");
            for (var method in methods) {
                var value;
                if (method === "required") {
                    value = $element.get(0).getAttribute(method);
                    if (value === "") {
                        value = true
                    }
                    value = !!value
                } else {
                    value = $element.attr(method)
                }
                if (/min|max/.test(method) && (type === null || /number|range|text/.test(type))) {
                    value = Number(value)
                }
                if (value) {
                    rules[method] = value
                } else {
                    if (type === method && type !== "range") {
                        rules[method] = true
                    }
                }
            }
            if (rules.maxlength && /-1|2147483647|524288/.test(rules.maxlength)) {
                delete rules.maxlength
            }
            return rules
        },
        dataRules: function (element) {
            var method, value, rules = {}, $element = $(element);
            for (method in methods) {
                value = $element.data("rule-" + method.toLowerCase());
                if (value !== undefined) {
                    rules[method] = value
                }
            }
            return rules
        },
        staticRules: function (element) {
            var rules = {};
            if (this.settings.rules) {
                rules = this.normalizeRule(this.settings.rules[element.name]) || {}
            }
            return rules
        },
        normalizeRules: function (rules, element) {
            $.each(rules, function (prop, val) {
                if (val === false) {
                    delete rules[prop];
                    return
                }
                //可以传入函数和字符串
                if (val.param || val.depends) {
                    var keepRule = true;
                    switch (typeof val.depends) {
                        case"string":
                            keepRule = !!$(val.depends, element.form).length;
                            break;
                        case"function":
                            keepRule = val.depends.call(element, element);
                            break
                    }
                    if (keepRule) {
                        rules[prop] = val.param !== undefined ? val.param : true
                    } else {
                        delete rules[prop]
                    }
                }
            });

            $.each(rules, function (rule, parameter) {
                rules[rule] = $.isFunction(parameter) ? parameter(element) : parameter
            });
            $.each(["minlength", "maxlength"], function () {
                if (rules[this]) {
                    rules[this] = Number(rules[this])
                }
            });

            $.each(["rangelength", "range"], function () {
                var parts;
                if (rules[this]) {
                    if ($.isArray(rules[this])) {
                        rules[this] = [Number(rules[this][0]), Number(rules[this][1])]
                    } else {
                        if (typeof rules[this] === "string") {
                            parts = rules[this].split(/[\s,]+/);
                            rules[this] = [Number(parts[0]), Number(parts[1])]
                        }
                    }
                }
            });
            return rules
        },
        normalizeRule: function (data) {
            if (typeof data === "string") {
                var transformed = {};
                $.each(data.split(/\s/), function () {
                    transformed[this] = true
                });
                data = transformed
            }
            return data
        }
    };
    return validator
});