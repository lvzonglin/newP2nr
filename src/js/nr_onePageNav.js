/**
 * P2NR v1.0.0 (http://www.p2nr.com)
 * Copyright 2015-2016 CDDAKA, Inc.

 * Created by daven.
 * time : 2016/3/30 0030.
 * Email : 515124651@qq.com.
 */
define(function (require, exports, module) {
    var VERSION = "1.0.0",
        jQuery = $ = require("jquery-1.8.2.min");

    var defaults = {
        navItems:'a',
        currentClass:'current',
        changeHash:true,
        easing:'swing',
        filter:'',
        scrollSpeed:750,
        scrollThreshold:0.5,
        begin:false,
        end:false,
        scrollChange:false
    }
    function onePageNav(element,options){
        this.$elem = $(element);
        this.$win = $(window);
        this.$doc = $(document);
        this.sections = {};
        this.didScroll = false;
        this.docHeight = this.$doc.height();

        this.options = $.extend({},defaults,options);
        this.$nav = this.$elem.find(this.options.navItems);

        if(this.options.filter!==''){
            this.$nav = this.$nav.filter(this.options.filter);
        }
        this.init();
    }
    onePageNav.prototype = {
        init:function(){
            this.$nav.on('click.onePageNav', $.proxy(this.handleClick,this));
            this.getPosition();
            this.bindInterval();

            this.$win.on('resize.onePageNav', $.proxy(this.getPosition,this));
        },
        adjustNav:function(self,$parent){
            self.$elem.find('.'+self.options.currentClass).removeClass(self.options.currentClass);
            $parent.addClass(self.options.currentClass);
        },
        bindInterval:function(){
            var self = this;
            var docHeight;
            self.$win.on('scroll.onePageNav',function(){
                self.didScroll = true;
            })

            self.t = setInterval(function(){
                docHeight = self.$doc.height();

                if(self.didScroll){
                    self.didScroll = false;
                    self.scrollChange();
                }

                if(docHeight!==self.docHeight){
                    self.docHeight = docHeight;
                    self.getPosition();
                }
            },250)
        },
        getHash:function($link){
            return $link.attr('href').split('#')[1];
        },
        getPosition:function(){
            var self = this;
            var linkHref;
            var topPos;
            var $target;

            self.$nav.each(function(){
                linkHref = self.getHash($(this));
                $target = $('#'+linkHref);

                if($target.length){
                    topPos = $target.offset().top;
                    self.sections[linkHref] = Math.round(topPos);
                }
            })
        },
        getSection:function(windowPos){
            var returnValue = null;
            var windowHeight = Math.round(this.$win.height()*this.options.scrollThreshold);

            for(var section in this.sections){
                if((this.sections[section] - windowHeight) < windowPos){
                    returnValue = section;
                }
            }
            return returnValue;
        },
        handleClick:function(e){
            var self = this;
            var $link = $(e.currentTarget);
            var $parent = $link.parent();
            var newLoc = '#'+self.getHash($link);

            if(!$parent.hasClass(this.options.currentClass)){
                if(self.options.begin){
                    self.options.begin();
                }

                self.adjustNav(self,$parent);
                //todo 需要取消绑定滚动实时事件
                self.unbindInterval();

                self.scrollTo(newLoc, function() {
                    if(self.options.changeHash) {
                        window.location.hash = newLoc;
                    }

                    self.bindInterval();

                    if(self.options.end) {
                        self.options.end();
                    }
                });
            }
            e.preventDefault();
        },
        scrollChange:function(){
            var windowTop = this.$win.scrollTop();
            var position = this.getSection(windowTop);
            var $parent;

            if(position !== null) {
                $parent = this.$elem.find('a[href$="#' + position + '"]').parent();

                if(!$parent.hasClass(this.options.currentClass)) {
                    this.adjustNav(this, $parent);

                    if(this.options.scrollChange) {
                        this.options.scrollChange($parent);
                    }
                }
            }
        },
        scrollTo:function(target, callback){
            var offset = $(target).offset().top;

            $('html, body').animate({
                scrollTop: offset
            }, this.options.scrollSpeed, this.options.easing, callback);
        },

        unbindInterval:function(){
            clearInterval(this.t);
            this.$win.unbind('scroll.onePageNav');
        }
    }
    return onePageNav;
});