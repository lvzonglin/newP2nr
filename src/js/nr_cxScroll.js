/**
 * P2NR v1.0.0 (http://www.p2nr.com)
 * Copyright 2015-2016 CDDAKA, Inc.

 * Created by daven.
 * time : 2016/4/7 0007.
 * Email : 515124651@qq.com.
 */
define(function (require, exports, module) {
    var VERSION = "1.0",
        jQuery = $ = require("jquery-1.8.2.min");

    var defaults = {
        direction:"left",
        easing:"swing",
        step:1,
        speed:800,
        time:4000,
        auto:false,
        hoverLock:true,
        prevBtn:true,
        nextBtn:true
    }

    function cxScroll(element,options){
        this.$element = $(element);
        this.dom = {
            box:this.$element.find('.box'),
            list:this.$element.find('.list'),
            items:this.$element.find('li'),
            prevBtn:this.$element.find('.prev'),
            nextBtn:this.$element.find('.next')
        }
        this.itemWidth = this.dom.items.outerWidth();
        this.itemHeight = this.dom.items.outerHeight();
        this.itemCount = this.dom.items.length
        this.options = $.extend({},defaults,options);
        this.init();
    }
    cxScroll.prototype = {
        init:function(){
            var self = this;
            if(this.options.direction === 'left' || this.options.direction === 'right'){
                this.prevVal = 'left';
                this.nextVal = 'right';
                this.moveVal = this.itemWidth;
            }else{
                this.prevVal = 'top';
                this.nextVal = 'bottom';
                self.moveVal = self.itemHeight;
            }

            if(this.options.nextBtn && this.dom.prevBtn.length){
                this.dom.nextBtn.bind('click',function(){
                    if(!self.lockState){
                        self.scroll(self.nextVal);
                    }
                })
            }

            if(this.options.prevBtn && this.dom.prevBtn.length){
                this.dom.prevBtn.bind('click',function(){
                    if(!self.lockState){
                        self.scroll(self.prevVal);
                    }
                })
            }
            if(this.options.auto){
                this.autoPlay();
            }
        },
        scroll:function(dir){
            var self = this;
            var _max,
                _dis,
                _speed = this.options.speed;
            dir = dir || this.options.direction;

            self.lockState = true;
            switch(dir){
                case 'left':
                    _max = 0;
                    _dis = self.dom.box.scrollLeft() - (self.moveVal*self.options.step);

                    if (_dis < _max) {
                        _dis = _max;
                    }else{
                        self.dom.box.animate({
                            'scrollLeft': _dis
                        }, _speed);
                    };
                    break;
                case 'right':
                    _max = self.itemCount * self.moveVal - self.dom.box.outerWidth();
                    _dis = self.dom.box.scrollLeft() + (self.moveVal*self.options.step);

                    if(_dis>_max){
                        _dis = _max;
                    }else{
                        self.dom.box.animate({
                            'scrollLeft':_dis
                        },_speed,self.options.easing)
                    }
                    break;
                case 'top':
                    _max = 0;
                    _dis = self.dom.box.scrollTop() - (self.moveVal * self.options.step);

                    if (_dis < _max){
                        _dis = _max;
                    }else{
                        self.dom.box.animate({
                            'scrollTop': _dis
                        }, _speed, self.options.easing);
                    };
                    break;
                case 'bottom':
                    _max = self.itemCount * self.moveVal - self.dom.box.outerHeight();

                    _dis = self.dom.box.scrollTop() + (self.moveVal * self.options.step);

                    if (_dis > _max){
                        _dis = _max;
                    }else{
                        self.dom.box.animate({
                            'scrollTop': _dis
                        }, _speed, self.options.easing);
                    };
                    break;
                default:
                    return;
            };

            self.dom.box.queue(function(){
                self.lockState = false;
                $(this).dequeue();
            })
        },
        //todo 自动播放没做
        autoPlay:function(){
            var self = this;
            this.run = setInterval(function(){
                self.scroll();
            },this.options.time)
        },
        stop:function(){
            clearTimeout(this.run);
        }
    }
    return cxScroll;
});