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

    var baseEasings = {};
    $.each(["Quad", "Cubic", "Quart", "Quint", "Expo"], function (i, name) {
        baseEasings[name] = function (p) {
            return Math.pow(p, i + 2)
        }
    });
    $.extend(baseEasings, {Sine: function (p) {
        return 1 - Math.cos(p * Math.PI / 2)
    }, Circ: function (p) {
        return 1 - Math.sqrt(1 - p * p)
    }, Elastic: function (p) {
        return p == 0 || p == 1 ? p : -Math.pow(2, 8 * (p - 1)) * Math.sin(((p - 1) * 80 - 7.5) * Math.PI / 15)
    }, Back: function (p) {
        return p * p * (3 * p - 2)
    }, Bounce: function (p) {
        var pow2, bounce = 4;
        while (p < ((pow2 = Math.pow(2, --bounce)) - 1) / 11) {
        }
        return 1 / Math.pow(4, 3 - bounce) - 7.5625 * Math.pow((pow2 * 3 - 2) / 22 - p, 2)
    }});
    $.each(baseEasings, function (name, easeIn) {
        $.easing["easeIn" + name] = easeIn;
        $.easing["easeOut" + name] = function (p) {
            return 1 - easeIn(1 - p)
        };
        $.easing["easeInOut" + name] = function (p) {
            return p < 0.5 ? easeIn(p * 2) / 2 : 1 - easeIn(p * -2 + 2) / 2
        }
    });
    var defaults = {
        "slideTransition": "none",
        "slideTransitionSpeed": 1000,
        "slideEndAnimation": true,
        "position": "0,0",
        "transitionIn": "left",
        "transitionOut": "left",
        "fullWidth": true,
        "delay": 400,
        "timeout": 2000,
        "speedIn": 1000,
        "speedOut": 1000,
        "easeIn": "easeOutExpo",
        "easeOut": "easeOutCubic",
        "controls": true,
        "pager": true,
        "autoChange": true,
        "pauseOnHover": true,
        "backgroundAnimation": false,
        "backgroundElement": null,
        "backgroundX": 500,
        "backgroundY": 500,
        "backgroundSpeed": 2500,
        "backgroundEase": "easeOutCubic",
        "responsive": false,
        "increase": false,
        "dimensions": "",
        "startCallback": function(){},
        "startNextSlideCallback": function(){},
        "stopCallback": function(){},
        "pauseCallback": function(){},
        "resumeCallback": function(){},
        "nextSlideCallback": function(){},
        "prevSlideCallback": function(){},
        "pagerCallback": function(){}
    };

    var slider,
        pager = null,
        timeouts = [],
        fractionObjs = null,
        dX = null,
        dY = null,
        sliderWidth = 0,
        bodyWidth = 0,
        offsetX = 0,
        sliderHeight = 0;

    function FractionSlider(element, options) {
        this.$element = $(element);
        this.options = $.extend({}, defaults, options);
        this.vars = {
            init: true,
            running: false,
            pause: false,
            stop: false,
            slideComplete: false,
            stepComplete: false,
            controlsActive: true,
            currentSlide: 0,
            lastSlide: null,
            maxSlide: 0,
            currentStep: 0,
            maxStep: 0,
            currentObj: 0,
            maxObjs: 0,
            finishedObjs: 0
        };
        this.temp = {
            currentSlide: null,
            lastSlide: null,
            animationkey: "none"
        };
        this.$element.wrapInner('<div class="nr-slider-wrap"/>');
        slider = this.$element.find(".nr-slider-wrap");
        pager = null;
        this.vars.maxSlide = slider.children(".nr-slider-slide").length - 1;
        sliderWidth = slider.width();
        bodyWidth = $("body").width();
        offsetX = 0;
        if (this.options.fullWidth) {
            offsetX = (bodyWidth - sliderWidth) / 2;
            sliderWidth = bodyWidth
        }
        sliderHeight = slider.height();
        this.init()
    }

    FractionSlider.prototype = {
        init: function () {
            var options = this.options, that = this;
            if (options.controls) {
                slider.append('<a href="#" class="nr-slider-prev"></a><a href="#" class="nr-slider-next"></a>');
                slider.find(".nr-slider-next").bind("click", function () {
                    that.nextBtnPressed()
                });
                slider.find(".nr-slider-prve").bind("click", function () {
                    that.prevBtnPressed()
                })
            }
            if (options.pauseOnHover) {
                slider.bind({mouseenter: function () {
                    that.pause(false)
                }, mouseleave: function () {
                    that.resume()
                }})
            }

            if (options.fullWidth) {
                slider.css({"overflow": "visible"})
            } else {
                slider.css({"overflow": "hidden"})
            }

            if (options.pager) {
                var customPager = (typeof options.pager !== "boolean");

                pager = (customPager) ? options.pager : $('<div class="nr-slider-pager-wrapper"></div>');

                if (!customPager) {
                    slider.append(pager)
                } else {
                    pager.addClass("nr-slider-pager-wrapper")
                }
            }
            slider.children(".nr-slider-slide").each(function (index) {
                var slide = $(this);
                slide.children().attr("rel", index).addClass("nr-slider-obj");
                slide.children("[data-fixed]").addClass("nr-slider-fixed-obj");
                if (options.pager || customPager) {
                    var tempObj = $('<a rel="' + index + '" href="#"></a>').bind("click", function () {
                        that.pagerPressed(this)
                    });
                    pager.append(tempObj)
                }
            });
            if (options.pager) {
                pager = $(pager).children("a")
            }
            if (options.responsive) {
                that.makeResponsive()
            }
            if (slider.find(".nr-slider-loader").length > 0) {
                slider.find(".nr-slider-loader").remove()
            }
            this.start()
        },
        start: function () {
            var vars = this.vars;
            vars.stop = false;
            vars.pause = false;
            vars.running = true;
            this.cycle("slide")
        },
        startNextSlide:function () {
            var vars = this.vars;
            vars.stop = false;
            vars.pause = false;
            vars.running = false;
            this.nextSlide();
            this.options.startNextSlideCallback()
        },
        stop: function () {
            var vars = this.vars;
            vars.stop = true;
            vars.running = false;
            slider.find(".nr-slider-slide").stop(true, true);
            slider.find(".nr-slider-obj").stop(true, true).removeClass("nr-slider-animation");
            this.stopTimeouts(timeouts);
            this.options.stopCallback()
        },
        pause: function (finish) {
            var vars = this.vars;
            vars.pause = true;
            vars.running = false;
            if (finish) {
                slider.find(".nr-slider-animation").finish()
            }
        },
        resume: function () {
            var vars = this.vars;
            vars.stop = false;
            vars.pause = false;
            vars.running = true;
            if (vars.slideComplete) {
                this.cycle("slide")
            } else {
                if (vars.stepComplete) {
                    this.cycle("step")
                } else {
                    if (vars.finishedObjs < vars.maxObjs) {

                    } else {
                        if (vars.currentStep < vars.maxStep) {
                            this.cycle("step")
                        } else {
                            this.cycle("slide")
                        }
                    }
                }
            }
            this.options.resumeCallback()
        },
        pagerPressed: function (el) {
            var vars = this.vars;
            var target = parseInt($(el).attr("rel"));
            if (target != vars.currentSlide) {
                this.stop();
                this.targetSlide(target)
            }
            return false
        },
        prevBtnPressed: function () {
            this.stop();
            this.prevSlide();
            return false
        },
        nextBtnPressed: function () {
            this.stop();
            this.nextSlide();
            return false
        },
        nextSlide: function () {
            var vars = this.vars;
            vars.lastSlide = vars.currentSlide;
            vars.currentSlide += 1;
            vars.stop = false;
            vars.pause = false;
            vars.running = true;
            this.slideChangeControler();
            this.options.nextSlideCallback()
        },
        prevSlide: function () {
            var vars = this.vars;
            vars.lastSlide = vars.currentSlide;
            vars.currentSlide -= 1;
            vars.stop = false;
            vars.pause = false;
            vars.running = true;
            this.slideChangeControler();
            this.options.prevSlideCallback()
        },
        targetSlide: function (slide) {
            var vars = this.vars;
            vars.lastSlide = vars.currentSlide;
            vars.currentSlide = slide;
            vars.stop = false;
            vars.pause = false;
            vars.running = true;
            this.slideChangeControler();
            this.options.pagerCallback()
        },
        cycle: function (type) {
            var vars = this.vars;
            if (!vars.pause && !vars.stop && vars.running) {
                switch (type) {
                    case"slide":
                        vars.slideComplete = false;
                        this.slideRotation();
                        break;
                    case"step":
                        vars.setpComplete = false;
                        this.iterateSteps();
                        break;
                    case"obj":
                        this.iterateObjs();
                        break
                }
            }
        },
        slideRotation: function () {
            var options = this.options, vars = this.vars;
            var that = this;
            var timeout = options.timeout;

            if (vars.init) {
                vars.init = false;
                this.slideChangeControler(true)
            } else {
                timeouts.push(setTimeout(function () {
                    if (vars.maxSlide == 0 && vars.running == true) {
                    } else {
                        vars.lastSlide = vars.currentSlide;
                        vars.currentSlide += 1;
                        that.slideChangeControler()
                    }
                }, timeout))
            }
        },
        slideChangeControler: function (init) {
            var options = this.options, vars = this.vars, temp = this.temp;
            slider.find(".nr-slider-active-slide").removeClass("nr-slider-active-slide");
            if (vars.currentSlide > vars.maxSlide) {
                vars.currentSlide = 0
            }
            if (vars.currentSlide < 0) {
                vars.currentSlide = vars.maxSlide
            }
            temp.currentSlide = slider.children(".nr-slider-slide:eq(" + vars.currentSlide + ")").addClass("nr-slider-active-slide");

            if (temp.currentSlide.length == 0) {
                vars.currentSlide = 0;
                temp.currentSlide = slider.children(".nr-slider-slide:eq(" + vars.currentSlide + ")")
            }
            if (vars.lastSlide != null) {
                if (vars.lastSlide < 0) {
                    vars.lastSlide = vars.maxSlide
                }
                temp.lastSlide = slider.children(".nr-slider-slide:eq(" + vars.lastSlide + ")")
            }
            if (init) {
                temp.animation = "none"
            } else {
                temp.animation = temp.currentSlide.attr("data-in");
                if (temp.animation == null) {
                    temp.animation = options.slideTransition
                }
            }

            if (options.slideEndAnimation && vars.lastSlide != null) {
                this.objOut()
            } else {
                switch (temp.animation) {
                    case"none":
                        this.startSlide();
                        this.endSlide();
                        break;
                    case"scrollLeft":
                        this.startSlide();
                        this.endSlide();
                        break;
                    case"scrollRight":
                        this.startSlide();
                        this.endSlide();
                        break;
                    case"scrollTop":
                        this.startSlide();
                        this.endSlide();
                        break;
                    case"scrollBottom":
                        this.startSlide();
                        this.endSlide();
                        break;
                    default:
                        this.startSlide();
                        break
                }
            }
        },
        startSlide: function () {
            var options = this.options, vars = this.vars, temp = this.temp;
            if (options.backgroundAnimation) {
            }
            if (options.pager) {
                pager.removeClass("active");
                pager.eq(vars.currentSlide).addClass("active")
            }
            this.getStepsForSlide();
            temp.currentSlide.children().hide();
            vars.currentStep = 0;
            vars.currentObj = 0;
            vars.maxObjs = 0;
            vars.finishedObjs = 0;
            temp.currentSlide.children("[data-fixed]").show();
            this.slideAnimationIn()
        },
        startSlideComplete: function (slide) {
            var temp = this.temp;
            if (temp.lastSlide != null) {
                temp.lastSlide.hide()
            }
            if (slide.hasClass("nr-slider-active-slide")) {
                this.cycle("step")
            }
        },
        endSlide: function () {
            var temp = this.temp;
            if (temp.lastSlide == null) {
                return
            }
            if (temp.animation != "none") {
                this.slideAnimationOut()
            }
        },
        endSlideComplete: function () {
        },
        getStepsForSlide: function () {
            var temp = this.temp, vars = this.vars;
            var objs = temp.currentSlide.children(), maximum = 0;
            objs.each(function () {
                var value = parseFloat($(this).attr("data-step"));
                maximum = (value > maximum) ? value : maximum
            });
            vars.maxStep = maximum
        },
        iterateSteps: function () {
            var vars = this.vars, temp = this.temp;
            var objs;
            if (vars.currentStep == 0) {
                objs = temp.currentSlide.children('*:not([data-step]):not([data-fixed]), *[data-step="' + vars.currentStep + '"]:not([data-fixed])')
            } else {
                objs = temp.currentSlide.children('*[data-step="' + vars.currentStep + '"]:not([data-fixed])')
            }
            vars.maxObjs = objs.length;
            fractionObjs = objs;
            if (vars.maxObjs > 0) {
                vars.currentObj = 0;
                vars.finishedObjs = 0;
                this.cycle("obj")
            } else {
                this.stepFinished()
            }
        },
        stepFinished: function () {
            var options = this.options, vars = this.vars;
            vars.stepComplete = true;
            vars.currentStep += 1;
            if (vars.currentStep > vars.maxStep) {
                if (options.autoChange) {
                    vars.currentStep = 0;
                    vars.slideComplete = true;
                    this.cycle("slide")
                }
                return
            }
            this.cycle("step")
        },
        iterateObjs: function () {
            var options = this.options, vars = this.vars;
            var obj = $(fractionObjs[vars.currentObj]);
            obj.addClass("fs-animation");
            var position = obj.attr("data-position"),
                transition = obj.attr("data-in"),
                delay = obj.attr("data-delay"),
                time = obj.attr("data-time"),
                easing = obj.attr("data-ease-in"),
                special = obj.attr("data-special");

            if (position == null) {
                position = options.position.split(",")
            } else {
                position = position.split(",")
            }
            if (transition == null) {
                transition = options.transitionIn
            }
            if (delay == null) {
                delay = options.delay
            }
            if (easing == null) {
                easing = options.easeIn
            }

            this.objectAnimationIn(obj, position, transition, delay, time, easing, special);
            vars.currentObj += 1;
            if (vars.currentObj < vars.maxObjs) {
                this.cycle("obj")
            } else {
                vars.currentObj = 0
            }
        },
        objFinished: function (obj) {
            var vars = this.vars;
            obj.removeClass("fs-animation");
            if (obj.attr("rel") == vars.currentSlide) {
                vars.finishedObjs += 1;
                if (vars.finishedObjs == vars.maxObjs) {
                    this.stepFinished()
                }
            }
        },
        objOut: function () {
            var options = this.options, temp = this.temp;
            var that = this;
            var objs = temp.lastSlide.children(":not([data-fixed])");
            objs.each(function () {
                var obj = $(this), position = obj.position(), transition = obj.attr("data-out"), easing = obj.attr("data-ease-out");
                if (transition == null) {
                    transition = options.transition
                }
                if (easing == null) {
                    easing = options.easeOut
                }
                that.objectAnimationOut(obj, position, transition, null, easing)
            }).promise().done(function () {
                that.endSlide();
                that.startSlide()
            })
        },
        slideAnimationIn: function () {
            var that = this;
            var temp = this.temp,
                options = this.options;
            var slide = temp.currentSlide,
                cssStart = {},
                cssEnd = {},
                speed = options.slideTransitionSpeed,
                animation = temp.animation;

            if (options.responsive) {
                unit = "%"
            } else {
                unit = "px"
            }

            switch (animation) {
                case"slideLeft":
                    cssStart.left = sliderWidth + unit;
                    cssStart.top = "0" + unit;
                    cssStart.display = "block";
                    cssEnd.left = "0" + unit;
                    cssEnd.top = "0" + unit;
                    break;
                case"slideTop":
                    cssStart.left = "0" + unit;
                    cssStart.top = -sliderHeight + unit;
                    cssStart.display = "block";
                    cssEnd.left = "0" + unit;
                    cssEnd.top = "0" + unit;
                    break;
                case"slideBottom":
                    cssStart.left = "0" + unit;
                    cssStart.top = sliderHeight + unit;
                    cssStart.display = "block";
                    cssEnd.left = "0" + unit;
                    cssEnd.top = "0" + unit;
                    break;
                case"slideRight":
                    cssStart.left = -sliderWidth + unit;
                    cssStart.top = "0" + unit;
                    cssStart.display = "block";
                    cssEnd.left = "0" + unit;
                    cssEnd.top = "0" + unit;
                    break;
                case"fade":
                    cssStart.left = "0" + unit;
                    cssStart.top = "0" + unit;
                    cssStart.display = "block";
                    cssStart.opacity = 0;
                    cssEnd.opacity = 1;
                    break;
                case"none":
                    cssStart.left = "0" + unit;
                    cssStart.top = "0" + unit;
                    cssStart.display = "block";
                    speed = 0;
                    break;
                case"scrollLeft":
                    cssStart.left = sliderWidth + unit;
                    cssStart.top = "0" + unit;
                    cssStart.display = "block";
                    cssEnd.left = "0" + unit;
                    cssEnd.top = "0" + unit;
                    break;
                case"scrollTop":
                    cssStart.left = "0" + unit;
                    cssStart.top = -sliderHeight + unit;
                    cssStart.display = "block";
                    cssEnd.left = "0" + unit;
                    cssEnd.top = "0" + unit;
                    break;
                case"scrollBottom":
                    cssStart.left = "0" + unit;
                    cssStart.top = sliderHeight + unit;
                    cssStart.display = "block";
                    cssEnd.left = "0" + unit;
                    cssEnd.top = "0" + unit;
                    break;
                case"scrollRight":
                    cssStart.left = -sliderWidth + unit;
                    cssStart.top = "0" + unit;
                    cssStart.display = "block";
                    cssEnd.left = "0" + unit;
                    cssEnd.top = "0" + unit;
                    break
            }
            slide.css(cssStart).animate(cssEnd, speed, "linear", function () {
                that.startSlideComplete(slide)
            })
        },
        slideAnimationOut: function () {
            var options = this.options, temp = this.temp;
            var that = this;
            var cssStart = {},
                cssEnd = {},
                speed = options.slideTransitionSpeed,
                unit = null,
                animation = temp.animation;

            if (options.responsive) {
                unit = "%"
            } else {
                unit = "px"
            }

            switch (animation) {
                case"none":
                    cssStart.display = "none";
                    cssEnd.opacity = 0;
                    break;
                case"scrollLeft":
                    cssEnd.left = -sliderWidth + unit;
                    cssEnd.top = "0" + unit;
                    break;
                case"scrollTop":
                    cssEnd.left = "0" + unit;
                    cssEnd.top = sliderHeight + unit;
                    break;
                case"scrollBottom":
                    cssEnd.left = "0" + unit;
                    cssEnd.top = -sliderHeight + unit;
                    break;
                case"scrollRight":
                    cssEnd.left = sliderWidth + unit;
                    cssEnd.top = "0" + unit;
                    break;
                default:
                    speed = 0;
                    break
            }

            temp.lastSlide.animate(cssEnd, speed, "linear", function () {
                that.endSlideComplete()
            })
        },
        objectAnimationIn: function (obj, position, transition, delay, time, easing, special) {
            var options = this.options, vars = this.vars;
            var that = this;
            var cssStart = {}, cssEnd = {}, speed = options.speedIn, unit = null;
            if (options.responsive) {
                unit = "%"
            } else {
                unit = "px"
            }
            if (time != null && time != "") {
                speed = time - delay
            }
            cssStart.opacity = 1;
            switch (transition) {
                case"left":
                    cssStart.top = position[0];
                    cssStart.left = sliderWidth;
                    break;
                case"bottomLeft":
                    cssStart.top = sliderHeight;
                    cssStart.left = sliderWidth;
                    break;
                case"topLeft":
                    cssStart.top = obj.outerHeight() * -1;
                    cssStart.left = sliderWidth;
                    break;
                case"top":
                    cssStart.top = obj.outerHeight() * -1;
                    cssStart.left = position[1];
                    break;
                case"bottom":
                    cssStart.top = sliderHeight;
                    cssStart.left = position[1];
                    break;
                case"right":
                    cssStart.top = position[0];
                    cssStart.left = -offsetX - obj.outerWidth();
                    break;
                case"topRight":
                    cssStart.top = obj.outerHeight() * -1;
                    cssStart.left = -offsetX - obj.outerWidth();
                    break;
                case"fade":
                    cssStart.top = position[0];
                    cssStart.left = position[1];
                    cssStart.opacity = 0;
                    cssEnd.opacity = 1;
                    break;
                case"none":
                    cssStart.top = position[0];
                    cssStart.left = position[1];
                    cssStart.display = "none";
                    speed = 0;
                    break
            }
            cssEnd.top = position[0];
            cssEnd.left = position[1];
            cssEnd.left = cssEnd.left + unit;
            cssEnd.top = cssEnd.top + unit;
            cssStart.left = cssStart.left + unit;
            cssStart.top = cssStart.top + unit;
            timeouts.push(setTimeout(function () {
                if (special === "cycle" && obj.attr("rel") === vars.currentSlide) {
                    var tmp = obj.prev();
                    if (tmp.length > 0) {
                        var tmpPosition = $(tmp).attr("data-position").split(",");
                        tmpPosition = {"top": tmpPosition[0], "left": tmpPosition[1]};
                        var tmpTransition = $(tmp).attr("data-out");
                        if (tmpTransition == null) {
                            tmpTransition = options.transitionOut
                        }
                        that.objectAnimationOut(tmp, tmpPosition, tmpTransition, speed)
                    }
                }
                obj.css(cssStart).show().animate(cssEnd, speed, easing,function () {
                    that.objFinished(obj)
                }).addClass("nr-slider-obj-active")
            }, delay))
        },
        objectAnimationOut: function (obj, position, transition, speed, easing) {
            var options = this.options;
            var cssStart = {}, cssEnd = {}, unit = null;
            speed = options.speedOut;
            if (options.responsive) {
                unit = "%"
            } else {
                unit = "px"
            }
            var w = obj.outerWidth(), h = obj.outerHeight();
            if (options.responsive) {
                w = this.pixelToPercent(w, dX);
                h = this.pixelToPercent(h, dY)
            }
            switch (transition) {
                case"left":
                    cssEnd.left = -offsetX - 100 - w;
                    break;
                case"bottomLeft":
                    cssEnd.top = sliderHeight;
                    cssEnd.left = -offsetX - 100 - 2;
                    break;
                case"topLeft":
                    cssEnd.top = -h;
                    cssEnd.left = -offsetX - 100 - w;
                    break;
                case"top":
                    cssEnd.top = -h;
                    break;
                case"bottom":
                    cssEnd.top = sliderHeight;
                    break;
                case"right":
                    cssEnd.left = sliderWidth;
                    break;
                case"bottomRight":
                    cssEnd.top = sliderHeight;
                    cssEnd.left = sliderWidth;
                    break;
                case"topRight":
                    cssEnd.top = -h;
                    cssEnd.left = sliderWidth;
                    break;
                case"fade":
                    cssStart.opacity = 1;
                    cssEnd.opacity = 0;
                    break;
                case"hide":
                    cssEnd.display = "none";
                    speed = 0;
                    break;
                default:
                    cssEnd.display = "none";
                    speed = 0;
                    break
            }
            if (typeof cssEnd.top != "undefined") {
                if (cssEnd.top.toString().indexOf("px") > 0) {
                    cssEnd.top = cssEnd.substring(0, cssEnd.top.length - 2);
                    if (options.responsive) {
                        cssEnd.top = this.pixelToPercent(cssEnd.top, dY)
                    }
                }
            }
            if (typeof cssEnd.left != "undefined") {
                if (cssEnd.left.toString().indexOf("px") > 0) {
                    cssEnd.left = cssEnd.left.substring(0, cssEnd.left.length - 2);
                    if (options.responsive) {
                        cssEnd.left = this.pixelToPercent(cssEnd.left, dX)
                    }
                }
            }
            cssEnd.left = cssEnd.left + unit;
            cssEnd.top = cssEnd.top + unit;
            obj.css(cssStart).animate(cssEnd, speed, easing,function () {
                obj.hide()
            }).removeClass("nr-slider-obj-active")
        },
        makeResponsive: function () {
            var that = this;
            var options = this.options;
            var $element = this.$element;
            var d = options.dimensions.split(","), ie = this.msie();
            dX = d["0"];
            dY = d["1"];
            if (!options.increase) {
                $element.css({"maxWidth": dX + "px"})
            }
            var objs = slider.children(".slide").find("*");
            objs.each(function () {
                var obj = $(this), x = null, y = null, value = null;
                if (obj.attr("data-position") != null) {
                    var position = obj.attr("data-position").split(",");
                    x = that.pixelToPercent(position[1], dX);
                    y = that.pixelToPercent(position[0], dY);
                    obj.attr("data-position", y + "," + x)
                }
                if (obj.attr("width") != null && obj.attr("width") != "") {
                    value = obj.attr("width");
                    x = that.pixelToPercent(value, dX);
                    obj.attr("width", x + "%");
                    obj.css("width", x + "%")
                } else {
                    if (obj.css("width") != "0px") {
                        value = obj.css("width");
                        if (value.indexOf("px") > 0) {
                            value = value.substring(0, value.length - 2);
                            x = that.pixelToPercent(value, dX);
                            obj.css("width", x + "%")
                        }
                    } else {
                        if (obj.prop("tagName").toLowerCase() == "img" && ie != -1) {
                            value = that.getWidth(obj);
                            x = that.pixelToPercent(value, dX);
                            obj.css("width", x + "%").attr("width", x + "%")
                        } else {
                            if (obj.prop("tagName").toLowerCase() == "img") {
                                value = obj.get(0).width;
                                x = that.pixelToPercent(value, dX);
                                obj.css("width", x + "%")
                            }
                        }
                    }
                }
                if (obj.attr("height") != null && obj.attr("height") != "") {
                    value = obj.attr("height");
                    y = that.pixelToPercent(value, dY);
                    obj.attr("height", y + "%");
                    obj.css("height", y + "%")
                } else {
                    if (obj.css("height") != "0px") {
                        value = obj.css("height");
                        if (value.indexOf("px") > 0) {
                            value = value.substring(0, value.length - 2);
                            y = that.pixelToPercent(value, dY);
                            obj.css("height", y + "%")
                        }
                    } else {
                        if (obj.prop("tagName").toLowerCase() == "img" && ie != -1) {
                            value = that.getHeight(obj);
                            y = that.pixelToPercent(value, dY);
                            obj.css("height", y + "%").attr("height", y + "%")
                        } else {
                            if (obj.prop("tagName").toLowerCase() == "img") {
                                value = obj.get(0).height;
                                y = that.pixelToPercent(value, dY);
                                obj.css("height", y + "%")
                            }
                        }
                    }
                }
                obj.attr("data-fontsize", obj.css("font-size"))
            });
            slider.css({"width": "auto", "height": "auto"}).append('<div class="fs-stretcher" style="width:' + dX + "px; height:" + dY + 'px"></div>');
            this.resizeSlider();
            $(window).bind("resize", function () {
                that.resizeSlider()
            })
        },
        getWidth: function (element) {
            var img = new Image();
            img.src = element.attr("src");
            return img.width
        },
        getHeight: function (element) {
            var img = new Image();
            img.src = element.attr("src");
            return img.height
        },
        resizeSlider: function () {
            var options = this.options, vars = this.vars;
            var w = slider.innerWidth(), h = slider.innerHeight();
            if (w <= dX || options.increase) {
                var xy = dX / dY, nH = w / xy;
                slider.find(".fs-stretcher").css({"width": w + "px", "height": h + "px"})
            }
            bodyWidth = $("body").width();
            var sW = slider.width();
            offsetX = this.pixelToPercent((bodyWidth - sW) / 2, dX);
            sliderWidth = 100;
            if (options.fullWidth) {
                sliderWidth = 100 + offsetX * 2
            }
            sliderHeight = 100;
            sliderHeight = 100
        },
        resizeFontSize: function () {
            var that = this;
            var value = null, n = null, objs = slider.children(".slide").find("*");
            objs.each(function () {
                obj = $(this);
                var value = obj.attr("data-fontsize");
                if (value.indexOf("px") > 0) {
                    value = value.substring(0, value.length - 2);
                    n = that.pixelToPercent(value, dY) * (slider.find(".fs-stretcher").height() / 100);
                    obj.css("fontSize", n + "px");
                    obj.css("lineHeight", "100%")
                }
            })
        },
        pixelToPercent: function (value, d) {
            return value / (d / 100)
        },
        stopTimeout: function (timeout) {
            clearTimeout(timeout)
        },
        stopTimeouts: function (timeouts) {
            var length = timeouts.length;
            $.each(timeouts, function (index) {
                clearTimeout(this);
                if (index == length - 1) {
                    timeouts = []
                }
            })
        },
        msie: function () {
            var rv = -1;
            if (navigator.appName == "Microsoft Internet Explorer") {
                var ua = navigator.userAgent;
                var re = new RegExp("MSIE ([0-9]{1,}[.0-9]{0,})");
                if (re.exec(ua) != null) {
                    rv = parseFloat(RegExp.$1)
                }
            }
            return rv
        }
    };
    return FractionSlider
});