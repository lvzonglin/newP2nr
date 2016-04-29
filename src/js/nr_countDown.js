/**
 * P2NR v1.0.0 (http://www.p2nr.com)
 * Copyright 2015-2016 CDDAKA, Inc.

 * Created by daven.
 * time : 2016/4/8 0008.
 * Email : 515124651@qq.com.
 */
define(function (require, exports, module) {
    var VERSION = "1.0",
        jQuery = $ = require("jquery-1.8.2.min");
    var timeOut;
    var defaults = {
        end:new Date()
    }

    function countDown(element,options){
        this.$element = $(element);
        this.options = $.extend({},defaults,options);
        this.dom = {
            //hm: this.$element.find(".hm"),
            sec: this.$element.find(".nr-countDown-sec"),
            mini: this.$element.find(".nr-countDown-mini"),
            hour: this.$element.find(".nr-countDown-hour"),
            day: this.$element.find(".nr-countDown-day"),
            month:this.$element.find(".nr-countDown-month"),
            year: this.$element.find(".nr-countDown-year")
        };
        this.init();
    }
    countDown.prototype = {
        init:function(){
            var self = this;
            if(this.dom.sec){
                this.dom.sec.html(this.getDate().sec);
            }
            if(this.dom.mini){
                this.dom.mini.html(this.getDate().mini);
            }
            if(this.dom.hour){
                this.dom.hour.html(this.getDate().hour);
            }
            if(this.dom.day){
                this.dom.day.html(this.getDate().day);
            }
            if(this.dom.month){
                this.dom.month.html(this.getDate().month);
            }
            if(this.dom.year){
                this.dom.year.html(this.getDate().year);
            }
            timeOut = setTimeout(function(){
                self.init()
            }, 1000);
        },
        reset:function(){

        },
        stop:function(){

        },
        getDate:function(){
            var _d = this.$element.data("end") || this.options.end;
            var now = new Date(),
                endDate = new Date(_d);
            //现在将来秒差值
            //alert(future.getTimezoneOffset());
            var dur = (endDate - now.getTime()) / 1000 ,
                mss = endDate - now.getTime() ,
                pms = {
                    //hm:"000",
                    sec: "00",
                    mini: "00",
                    hour: "00",
                    day: "00",
                    month: "00",
                    year: "0"
                };

            if(mss > 0){
                //pms.hm = f.haomiao(mss % 1000);
                pms.sec = this.zero(dur % 60);
                pms.mini = Math.floor((dur / 60)) > 0? this.zero(Math.floor((dur / 60)) % 60) : "00";
                pms.hour = Math.floor((dur / 3600)) > 0? this.zero(Math.floor((dur / 3600)) % 24) : "00";
                pms.day = Math.floor((dur / 86400)) > 0? this.zero(Math.floor((dur / 86400)) % 30) : "00";
                //月份，以实际平均每月秒数计算
                pms.month = Math.floor((dur / 2629744)) > 0? this.zero(Math.floor((dur / 2629744)) % 12) : "00";
                //年份，按按回归年365天5时48分46秒算
                pms.year = Math.floor((dur / 31556926)) > 0? Math.floor((dur / 31556926)) : "0";
            }else{
                pms.year=pms.month=pms.day=pms.hour=pms.mini=pms.sec="00";
                //todo 时间结束了没做相关处理

                //alert('结束了');
                return;
            }
            return pms;
        },
        zero: function(n){
            //解析字符串,返回整数
            var _n = parseInt(n, 10);
            if(_n > 0){
                if(_n <= 9){
                    _n = "0" + _n
                }
                return String(_n);
            }else{
                return "00";
            }
        },

    }
    return countDown;
});