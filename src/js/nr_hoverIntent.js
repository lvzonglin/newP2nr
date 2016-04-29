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

    var _cfg = {
        interval: 50,
        sensitivity: 6,
        timeout: 0
    };

    var INSTANCE_COUNT = 0;
    var cX,
        cY;

    var track = function (ev) {
        cX = ev.pageX;
        cY = ev.pageY
    };

    var compare = function (ev, $el, s, cfg) {
        if (Math.sqrt((s.pX - cX) * (s.pX - cX) + (s.pY - cY) * (s.pY - cY)) < cfg.sensitivity) {
            $el.off("mousemove.hoverIntent" + s.namespace, track);
            delete s.timeoutId;
            s.isActive = true;
            delete s.pX;
            delete s.pY;
            return cfg.over.apply($el[0], [ev])
        } else {
            s.pX = cX;
            s.pY = cY;
            s.timeoutId = setTimeout(function () {
                compare(ev, $el, s, cfg)
            }, cfg.interval)
        }
    };

    var delay = function (ev, $el, s, out) {
        delete $el.data("hoverIntent")[s.id];
        return out.apply($el[0], [ev])
    };

    $.fn.hoverIntent = function (handlerIn, handlerOut, selector) {
        var instanceId = INSTANCE_COUNT++;
        var cfg = $.extend({}, _cfg);
        if ($.isPlainObject(handlerIn)) {
            cfg = $.extend(cfg, handlerIn)
        } else {
            if ($.isFunction(handlerOut)) {
                cfg = $.extend(cfg, {over: handlerIn, out: handlerOut, selector: selector})
            } else {
                cfg = $.extend(cfg, {over: handlerIn, out: handlerIn, selector: handlerOut})
            }
        }

        var handleHover = function (e) {
            var ev = $.extend({}, e);
            var $el = $(this);

            var hoverIntentData = $el.data("hoverIntent");
            if (!hoverIntentData) {
                $el.data("hoverIntent", (hoverIntentData = {}))
            }
            var state = hoverIntentData[instanceId];

            if (!state) {
                hoverIntentData[instanceId] = state = {id: instanceId}
            }
            if (state.timeoutId) {
                state.timeoutId = clearTimeout(state.timeoutId)
            }
            var namespace = state.namespace = ".hoverIntent" + instanceId;
            if (e.type === "mouseenter") {
                if (state.isActive) {
                    return
                }
                state.pX = ev.pageX;
                state.pY = ev.pageY;
                $el.on("mousemove.hoverIntent" + namespace, track);
                state.timeoutId = setTimeout(function () {
                    compare(ev, $el, state, cfg)
                }, cfg.interval)
            } else {
                if (!state.isActive) {
                    return
                }
                $el.off("mousemove.hoverIntent" + namespace, track);
                state.timeoutId = setTimeout(function () {
                    delay(ev, $el, state, cfg.out)
                }, cfg.timeout)
            }
        };
        return this.on({"mouseenter.hoverIntent": handleHover, "mouseleave.hoverIntent": handleHover}, cfg.selector)
    }
});