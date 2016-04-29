/**
 * P2NR v1.0.0 (http://www.p2nr.com)
 * Copyright 2015-2016 CDDAKA, Inc.

 * Created by daven.
 * time : 2016/4/11 0011.
 * Email : 515124651@qq.com.
 */
define(function (require, exports, module) {
    var VERSION = "1.0",
        jQuery = $ = require("jquery-1.8.2.min");
    var lastTime = 0;

    function easeOutExpo(t, b, c, d) {
        return c * (-Math.pow(2, -10 * t / d) + 1) * 1024 / 1023 + b;
    };

    var defaults = {
        useEasing:true,
        useGrouping:true,
        separator:',',
        decimal:'.',
        postFormatter:null,
        easingFn:null,
        formattingFn:null,
        duration:2,
        startVal:0,
        endVal:0,
        decimals:2
    }

    function countAnimation(element,options){
        this.$element = $(element);
        this.options = $.extend({},defaults,options);
        if (!this.options.prefix){
            this.options.prefix = '';
        }
        if (!this.options.suffix){
            this.options.suffix = '';
        }
        if(!this.options.endVal){
            console.log('error 没有配置结束值');
            return false;
        }
        this.options.duration = Number(this.options.duration) * 1000 || 2000;;
        this.countDown = (this.options.startVal>this.options.endVal);
        this.options.easingFn = !this.options.easingFn
            ? easeOutExpo
            : this.options.easingFn;
        this.dec = Math.pow(10, this.options.decimals);

        this.start();
    }
    countAnimation.prototype = {
        printValue:function(value){
            var element = this.$element[0];
            if(this.options.formattingFn){
                var result = this.options.formattingFn(value);
            }else{
                var result = (!isNaN(value)) ? this.formatNumber(value) : '--';
            }

            if(element.tagName == 'INPUT'){
                element.value = result;
            }else if(element.tagName=='text' || element.tagName=='tspan'){
                element.textContent = result;
            }else{
                element.innerHTML = result;
            }
        },
        start:function(callback){
            this.callback = callback;
            this.rAF = this.requestAnimationFrame(this.count);
            return false;
        },
        pauseResume:function(){
            if(!this.paused){
                this.paused = true;
                this.cancelAnimationFrame(this.rAF);
            }else{
                this.paused = false;
                delete this.startTime;
                this.options.duration = this.remaining;
                this.options.startVal = this.frameVal;
                this.requestAnimationFrame(this.count)
            }
        },
        reset:function(){
            this.paused = false;
            delete this.startTime;
            this.options.startVal = this.options.startVal;
            this.cancelAnimationFrame(this.rAF);
            this.printValue(this.options.startVal);
        },
        update:function(newEndVal){
            this.cancelAnimationFrame(this.rAF);
            this.paused = false;
            delete this.startTime;
            this.options.startVal = this.frameVal;
            this.options.endVal = Number(newEndVal);
            this.countDown = (this.options.startVal>this.options.endVal);
            this.rAF = this.requestAnimationFrame(this.count)
        },
        count:function(timestamp){
            if(!this.startTime){
                this.startTime = timestamp;
            }
            this.timestamp = timestamp;
            var progress = timestamp - this.startTime;
            this.remaining = this.options.duration - progress;

            if(this.options.useEasing){
                if(this.countDown){
                    this.frameVal = this.options.startVal - this.options.easingFn.call(
                            this,
                            progress,
                            0,
                            this.options.startVal-this.options.endVal,
                            this.options.duration
                        )
                }else{
                    this.frameVal = this.options.easingFn.call(
                        this,
                        progress,
                        this.options.startVal,
                        this.options.endVal - this.options.startVal,
                        this.options.duration
                    )
                }
            }else{
                if (this.countDown) {
                    this.frameVal = this.options.startVal - ((this.options.startVal - this.options.endVal) * (progress / this.duration));
                } else {
                    this.frameVal = this.options.startVal + (this.options.endVal - this.options.startVal) * (progress / this.duration);
                }
            }

            if (this.countDown) {
                this.frameVal = (this.frameVal < this.options.endVal) ? this.options.endVal : this.frameVal;
            } else {
                this.frameVal = (this.frameVal > this.options.endVal) ? this.options.endVal : this.frameVal;
            }
            this.frameVal = Math.floor(this.frameVal*this.dec)/this.dec;

            this.printValue(this.frameVal);
            if(progress<this.options.duration){
                this.rAF = this.requestAnimationFrame(this.count)
            }else{
                if(this.callback){
                    this.callback()
                }
            }
        },
        formatNumber:function(nStr){
            nStr = nStr.toFixed(this.options.decimals);

            nStr+='';

            var x,x1,x2,rgx;
            x = nStr.split('.');
            x1 = x[0];
            x2 = x.length>1?this.options.decimal+x[1]:'';
            rgx = /(\d+)(\d{3})/;
            if(this.options.useGrouping){
                while(rgx.test(x1)){
                    x1 = x1.replace(rgx, '$1' + this.options.separator + '$2');
                }
            }
            var value = this.options.prefix + x1 + x2 + this.options.suffix;
            if(this.options.postFormatter != null) {
                value = this.options.postFormatter(value);
            }
            return value;
        },
        requestAnimationFrame:function(callback,element){
            var self = this;
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0,16-(currTime - lastTime));
            var id = setTimeout(function(){
                callback.call(self,currTime+timeToCall);
            },timeToCall)
            lastTime = currTime + timeToCall;
            return id;
        },
        cancelAnimationFrame:function(id){
            clearTimeout(id);
        }
    }
    return countAnimation;
});