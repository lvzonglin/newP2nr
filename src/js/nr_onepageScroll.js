/**
 * P2NR v1.0.0 (http://www.p2nr.com)
 * Copyright 2015-2016 CDDAKA, Inc.

 * Created by daven.
 * time : 2016/3/30 0030.
 * Email : 515124651@qq.com.
 */
//todo 体验有问题，因为在页面首次加载时候 会出现闪屏
define(function (require, exports, module) {
    var VERSION = "1.0.0",
        jQuery = $ = require("jquery-1.8.2.min");

    var topPos = 0,
        leftPos = 0,
        paginationList = '',
        lastAnimation = 0,
        quietPeriod = 500

    var defaults = {
        sectionContainer: ".j-onepageScroll-page",
        easing: "ease",
        animationTime: 1000,
        pagination: true,
        keyboard: true,
        beforeMove: null,
        afterMove: null,
        loop: true,
        direction : 'vertical'
    };
    function onepageScroll(element,options){
        this.options = $.extend({},defaults,options);
        this.$element = $(element);
        this.$sections = $(this.options.sectionContainer);
        this.total = this.$sections.length;

        this.init();
    }
    onepageScroll.prototype = {
        init:function(){
            var self = this;

            var $element = this.$element,
                init_index = 0;

            $.each(this.$sections,function(i){
                $(this).css({
                    position:"absolute",
                    top:topPos + '%'
                }).attr('data-index',i+1);

                $(this).css({
                    position:"absolute",
                    left:(self.options.direction == "horizontal") ? leftPos + "%" : 0,
                    top:(self.options.direction == "vertical" || self.options.direction != 'horizontal') ? topPos + '%' : 0
                })

                if(self.options.direction == 'horizontal'){
                    leftPos = leftPos + 100;
                }else{
                    topPos = topPos + 100;
                }

                if(self.options.pagination == true){
                    paginationList += "<li><a data-index='"+(i+1)+"' href='#" + (i+1) + "'></a></li>"
                }
            })

            if(this.options.pagination == true){
                if ($('ul.onepage-pagination').length < 1){
                    $("<ul class='onepage-pagination'></ul>").prependTo("body");
                    $('ul.onepage-pagination').html(paginationList);
                }
            }

            if(window.location.hash != "" && window.location.hash != "#1") {
                init_index =  window.location.hash.replace("#", "")

                if (parseInt(init_index) <= this.total && parseInt(init_index) > 0) {
                    $(this.options.sectionContainer + "[data-index='" + init_index + "']").addClass("active");
                    //$("body").addClass("viewing-page-"+ init_index);

                    if(this.options.pagination == true) {
                        $(".onepage-pagination li a" + "[data-index='" + init_index + "']").addClass("active");
                    }

                    var pos = ((init_index - 1) * 100) * -1;

                    this.transformPage(this.options, pos, init_index);
                } else {
                    $(this.options.sectionContainer + "[data-index='1']").addClass("active");
                    //$("body").addClass("viewing-page-1");
                    if(this.options.pagination == true) {
                        $(".onepage-pagination li a" + "[data-index='1']").addClass("active");
                    }
                }
            }else{
                $(this.options.sectionContainer + "[data-index='1']").addClass("active")
                //$("body").addClass("viewing-page-1")
                if(this.options.pagination == true) {
                    $(".onepage-pagination li a" + "[data-index='1']").addClass("active");
                }
            }

            if(this.options.pagination == true)  {
                $(".onepage-pagination li a").click(function (){
                    var page_index = $(this).data("index");
                    self.moveTo(page_index);
                });
            }
            //todo 暂时把这个事件给取消了 MozMousePixelScroll
            $element.bind('mousewheel DOMMouseScroll ', function(event) {
                event.preventDefault();
                var delta = event.originalEvent.wheelDelta || -event.originalEvent.detail;
                self.initScroll.call(self,event,delta);

                /*if(!$("body").hasClass("disabled-onepage-scroll")) {

                }*/
            });

            var hovered = false;
            $element.bind('mouseenter.scrollbar', function (e) {
                hovered = true;
            });
            $element.bind('mouseleave.scrollbar', function (e) {
                hovered = false;
            });

            if(this.options.keyboard == true) {
                $(document).keydown(function(e) {
                    //todo
                    if (!hovered) {
                        return;
                    }
                    var tag = e.target.tagName.toLowerCase();

                    switch(e.which) {
                        case 38:
                            if (tag != 'input' && tag != 'textarea'){
                                self.moveUp();
                                e.preventDefault();
                            }
                            break;
                        case 40:
                            if (tag != 'input' && tag != 'textarea') {
                                self.moveDown();
                                e.preventDefault();
                            }
                            break;
                        case 32: //spacebar
                            if (tag != 'input' && tag != 'textarea'){
                                self.moveDown();
                                e.preventDefault();
                            }
                            break;
                        case 33: //pageg up
                            if (tag != 'input' && tag != 'textarea'){
                                self.moveUp();
                                e.preventDefault();
                            }
                            break;
                        case 34: //page dwn
                            if (tag != 'input' && tag != 'textarea') {
                                self.moveDown();
                                e.preventDefault();
                            }
                            break;
                        case 36: //home
                            self.moveTo(1);
                            e.preventDefault();
                            break;
                        case 35: //end
                            self.moveTo(total);
                            e.preventDefault();
                            break;
                        default:
                            return ;
                    }
                });
            }
        },
        moveDown:function(){
            var $element = this.$element,
                pos = 0;
            var index = $(this.options.sectionContainer +".active").data("index");
            var current = $(this.options.sectionContainer + "[data-index='" + index + "']");
            var next = $(this.options.sectionContainer + "[data-index='" + (index + 1) + "']");

            if(next.length < 1) {
                if (this.options.loop == true) {
                    pos = 0;
                    next = $(this.options.sectionContainer + "[data-index='1']");
                } else {
                    return
                }
            }else {
                pos = (index * 100) * -1;
            }

            if (typeof this.options.beforeMove == 'function'){
                this.options.beforeMove( next.data("index"));
            }
            current.removeClass("active")
            next.addClass("active");
            if(this.options.pagination == true) {
                $(".onepage-pagination li a" + "[data-index='" + index + "']").removeClass("active");
                $(".onepage-pagination li a" + "[data-index='" + next.data("index") + "']").addClass("active");
            }

            //$("body")[0].className = $("body")[0].className.replace(/\bviewing-page-\d.*?\b/g, '');
            //$("body").addClass("viewing-page-"+next.data("index"))

            this.transformPage(pos, next.data("index"));
        },
        moveUp:function(){
            var $element = this.$element,
                pos = 0;

            var index = $(this.options.sectionContainer +".active").data("index");
            var current = $(this.options.sectionContainer + "[data-index='" + index + "']");
            var next = $(this.options.sectionContainer + "[data-index='" + (index - 1) + "']");

            if(next.length < 1) {
                if (this.options.loop == true) {
                    pos = ((this.total - 1) * 100) * -1;
                    next = $(this.options.sectionContainer + "[data-index='"+this.total+"']");
                }else {
                    return false;
                }
            }else {
                pos = ((next.data("index") - 1) * 100) * -1;
            }
            if (typeof this.options.beforeMove == 'function'){
                this.options.beforeMove(next.data("index"));
            }
            current.removeClass("active");
            next.addClass("active");

            if(this.options.pagination == true) {
                $(".onepage-pagination li a" + "[data-index='" + index + "']").removeClass("active");
                $(".onepage-pagination li a" + "[data-index='" + next.data("index") + "']").addClass("active");
            }
            //$("body")[0].className = $("body")[0].className.replace(/\bviewing-page-\d.*?\b/g, '');
            //$("body").addClass("viewing-page-"+next.data("index"))

            this.transformPage(pos, next.data("index"));
        },
        moveTo:function(page_index){
            var $element = this.$element;
            var current = $(this.options.sectionContainer + ".active")
            var next = $(this.options.sectionContainer + "[data-index='" + (page_index) + "']");

            if(next.length > 0) {
                if (typeof this.options.beforeMove == 'function') {
                    this.options.beforeMove(next.data("index"));
                }
                current.removeClass("active");
                next.addClass("active");

                $(".onepage-pagination li a" + ".active").removeClass("active");
                $(".onepage-pagination li a" + "[data-index='" + (page_index) + "']").addClass("active");
                //$("body")[0].className = $("body")[0].className.replace(/\bviewing-page-\d.*?\b/g, '');
                //$("body").addClass("viewing-page-"+next.data("index"))
                var pos = ((page_index - 1) * 100) * -1;

                $element.transformPage(pos, page_index);
            }
        },
        initScroll:function(event,delta){
            var deltaOfInterest = delta;
            var timeNow = new Date().getTime();

            if(timeNow - lastAnimation < quietPeriod + this.options.animationTime) {
                event.preventDefault();
                return;
            }

            if (deltaOfInterest < 0) {
                this.moveDown()
            } else {
                this.moveUp()
            }
            lastAnimation = timeNow;
        },
        transformPage:function(pos,index){
            var self = this;
            var $element = this.$element;
            if (typeof this.options.beforeMove == 'function'){
                this.options.beforeMove(index);
            }
            if (this.options.direction == 'horizontal') {
                var toppos = ($element.width()/100)*pos;
                $element.animate({
                        left: toppos+'px'
                    },this.options.animationTime,
                    function(){
                        if(typeof self.options.afterMove == 'function'){
                            self.options.afterMove(index);
                        }
                    }
                );
            } else {
                var toppos = ($element.height()/100)*pos;
                $element.animate({top: toppos+'px'},this.options.animationTime,
                    function(){
                        if(typeof self.options.afterMove == 'function'){
                            self.options.afterMove(index);
                        }
                    });
            }
        }
    }
    return onepageScroll;
})