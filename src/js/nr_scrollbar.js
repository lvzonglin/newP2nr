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

    var $scrollbarXRail = $("<div class='ps-scrollbar-x-rail'></div>"),
        $scrollbarYRail = $("<div class='ps-scrollbar-y-rail'></div>"),
        $scrollbarX = $("<div class='ps-scrollbar-x'></div>").appendTo($scrollbarXRail),
        $scrollbarY = $("<div class='ps-scrollbar-y'></div>").appendTo($scrollbarYRail),
        scrollbarXActive,
        scrollbarYActive,
        containerWidth,
        containerHeight,
        contentWidth,
        contentHeight,
        scrollbarXWidth,
        scrollbarXLeft,
        scrollbarXBottom,
        scrollbarYHeight,
        scrollbarYTop,
        scrollbarYRight;

    var defaults = {
        wheelSpeed:10,
        wheelPropagation:false,
        minScrollbarLength:null,
        useKeyboard:true
    }

    function scrollbar(element,options){
        this.$element = $(element);
        this.options = $.extend({},options,defaults);
        this.$element.addClass('ps-container');

        $scrollbarXRail.appendTo(this.$element);
        $scrollbarYRail.appendTo(this.$element);
        scrollbarXBottom = parseInt($scrollbarXRail.css('bottom'), 10);
        scrollbarYRight = parseInt($scrollbarYRail.css('right'), 10);
        this.init();
    }
    scrollbar.prototype = {
        init:function(){
            this.updateBarSizeAndPosition();
            this.bindMouseScrollXHandler();
            this.bindMouseScrollYHandler();
            this.bindRailClickHandler();
            this.bindMouseWheelHandler();
            this.bindKeyboardHandler();
        },
        updateBarSizeAndPosition:function(){
            var $element = this.$element;
            var options = this.options;
            containerWidth = $element.width();
            containerHeight = $element.height();
            contentWidth = $element.prop('scrollWidth');
            contentHeight = $element.prop('scrollHeight');
            if(containerWidth < contentWidth){
                scrollbarXActive = true;
                scrollbarXWidth = this.getSettingsAdjustedThumbSize(parseInt(containerWidth*containerWidth/contentWidth,10));
                scrollbarXLeft = parseInt($element.scrollLeft() * (containerWidth - scrollbarXWidth) / (contentWidth - containerWidth), 10);
            }else{
                scrollbarXActive = false;
                scrollbarXWidth = 0;
                scrollbarXLeft = 0;
                $element.scrollLeft(0);
            }

            if(containerHeight < contentHeight){
                scrollbarXActive = true;
                scrollbarYHeight = this.getSettingsAdjustedThumbSize(parseInt(containerHeight*containerHeight/contentHeight,10));
                scrollbarYTop = parseInt($element.scrollTop() * (containerHeight - scrollbarYHeight) / (contentHeight - containerHeight), 10);
            }else {
                scrollbarYActive = false;
                scrollbarYHeight = 0;
                scrollbarYTop = 0;
                $element.scrollTop(0);
            }
            this.updateScrollbarCss();
        },
        moveBarY : function (currentTop, deltaY) {
            var newTop = currentTop + deltaY,
                maxTop = containerHeight - scrollbarYHeight;

            if (newTop < 0) {
                scrollbarYTop = 0;
            }
            else if (newTop > maxTop) {
                scrollbarYTop = maxTop;
            }
            else {
                scrollbarYTop = newTop;
            }
            $scrollbarYRail.css({top: this.$element.scrollTop()});
            $scrollbarY.css({top: scrollbarYTop});
        },
        moveBarX:function(currentLeft, deltaX){
            var newLeft = currentLeft + deltaX,
                maxLeft = containerWidth - scrollbarXWidth;

            if (newLeft < 0) {
                scrollbarXLeft = 0;
            }
            else if (newLeft > maxLeft) {
                scrollbarXLeft = maxLeft;
            }
            else {
                scrollbarXLeft = newLeft;
            }
            $scrollbarXRail.css({left: this.$element.scrollLeft()});
            $scrollbarX.css({left: scrollbarXLeft});
        },
        bindMouseScrollXHandler:function(){
            var currentLeft,
                currentPageX;
            var self = this;
            $scrollbarX.bind('mousedown.scrollbar',function(e){
                currentPageX = e.pageX;
                currentLeft = $scrollbarX.position().left;
                $scrollbarXRail.addClass('in-scrolling');
                e.stopPropagation();
                e.preventDefault();
            });

            $(document).bind('mousemove.scrollbar',function(e){
                if($scrollbarXRail.hasClass('in-scrolling')){
                    self.updateContentScrollLeft();
                    self.moveBarX(currentLeft, e.pageX-currentPageX);
                    e.stopPropagation();
                    e.preventDefault();
                };
            })

            $(document).bind('mouseup.perfect-scrollbar', function (e) {
                if ($scrollbarXRail.hasClass('in-scrolling')) {
                    $scrollbarXRail.removeClass('in-scrolling');
                }
            });

            currentLeft = currentPageX = null;
        },
        bindMouseScrollYHandler:function(){
            var currentTop,
                currentPageY;
            var self = this;
            $scrollbarY.bind('mousedown.perfect-scrollbar', function (e) {
                currentPageY = e.pageY;
                currentTop = $scrollbarY.position().top;
                $scrollbarYRail.addClass('in-scrolling');
                e.stopPropagation();
                e.preventDefault();
            });

            $(document).bind('mousemove.perfect-scrollbar', function (e) {
                if ($scrollbarYRail.hasClass('in-scrolling')) {
                    self.updateContentScrollTop();
                    self.moveBarY(currentTop, e.pageY - currentPageY);
                    e.stopPropagation();
                    e.preventDefault();
                }
            });

            $(document).bind('mouseup.perfect-scrollbar', function (e) {
                if ($scrollbarYRail.hasClass('in-scrolling')) {
                    $scrollbarYRail.removeClass('in-scrolling');
                }
            });

            currentTop = currentPageY = null;
        },
        bindMouseWheelHandler:function(){
            var $element = this.$element,
                options = this.options,
                self = this;
            var shouldPreventDefault = function (deltaY) {
                var scrollTop = $element.scrollTop();
                if (scrollTop === 0 && deltaY > 0) {
                    return !options.wheelPropagation;
                }
                else if (scrollTop >= contentHeight - containerHeight && deltaY < 0) {
                    return !options.wheelPropagation;
                }

                var scrollLeft = $element.scrollLeft();
                if (scrollLeft === 0  && deltaY === 0) {
                    return !options.wheelPropagation;
                }
                else if (scrollLeft >= contentWidth - containerWidth && deltaY === 0) {
                    return !options.wheelPropagation;
                }
                return true;
            };

            var shouldPrevent = false;

            $element.bind('mousewheel.scrollbar DOMMouseScroll.scrollbar',function(e){
                var deltaY = e.originalEvent.wheelDelta/120 || - e.originalEvent.detail/3;

                $(this).scrollTop($(this).scrollTop() - (deltaY * options.wheelSpeed));

                self.updateBarSizeAndPosition();
                shouldPrevent = shouldPreventDefault(deltaY);
                if (shouldPrevent) {
                    e.preventDefault();
                }
            })
        },
        bindKeyboardHandler:function () {
            var $element = this.$element,
                options = this.options,
                self = this;

            var shouldPreventDefault = function (deltaX, deltaY) {
                var scrollTop = $element.scrollTop();
                if (scrollTop === 0 && deltaY > 0 && deltaX === 0) {
                    return false;
                }
                else if (scrollTop >= contentHeight - containerHeight && deltaY < 0 && deltaX === 0) {
                    return false;
                }

                var scrollLeft = $element.scrollLeft();
                if (scrollLeft === 0 && deltaX < 0 && deltaY === 0) {
                    return false;
                }
                else if (scrollLeft >= contentWidth - containerWidth && deltaX > 0 && deltaY === 0) {
                    return false;
                }
                return true;
            };

            var hovered = false;
            $element.bind('mouseenter.scrollbar', function (e) {
                hovered = true;
            });
            $element.bind('mouseleave.scrollbar', function (e) {
                hovered = false;
            });

            var shouldPrevent = false;
            $(document).bind('keydown.scrollbar', function (e) {
                if (!hovered) {
                    return;
                }

                var deltaX = 0,
                    deltaY = 0;

                switch (e.which) {
                    case 37: // left
                        deltaX = -3;
                        break;
                    case 38: // up
                        deltaY = 3;
                        break;
                    case 39: // right
                        deltaX = 3;
                        break;
                    case 40: // down
                        deltaY = -3;
                        break;
                    default:
                        return;
                }

                $element.scrollTop($element.scrollTop() - (deltaY * options.wheelSpeed));
                $element.scrollLeft($element.scrollLeft() + (deltaX * options.wheelSpeed));

                self.updateBarSizeAndPosition();

                shouldPrevent = shouldPreventDefault(deltaX, deltaY);
                if (shouldPrevent) {
                    e.preventDefault();
                }
            });
        },
        bindRailClickHandler:function(){
            var self = this;
            var $element = this.$element;
            $scrollbarY.bind('click.scrollbar',function(e){
                e.stopPropagation();
            })
            $scrollbarYRail.bind('click.scrollbar',function(e){
                var halfOfScrollbarLength = parseInt(scrollbarYHeight/2,10),
                    positionTop = e.pageY - $scrollbarYRail.offset().top - halfOfScrollbarLength,
                    maxPositionTop = containerHeight - scrollbarYHeight,
                    positionRatio = positionTop/maxPositionTop;

                if(positionRatio < 0 ){
                    positionRatio = 0;
                }else if(positionRatio > 1){
                    positionRatio = 1
                }

                $element.scrollTop((contentHeight - containerHeight) * positionRatio);
                self.updateBarSizeAndPosition();
            })

            $scrollbarX.bind('click.scrollbar',function(e){
                e.stopPropagation();
            })
            $scrollbarXRail.bind('click.scrollbar',function(e){
                var halfOfScrollbarLength = parseInt(scrollbarXWidth/2,10),
                    positionLeft = e.pageX - $scrollbarXRail.offset().left - halfOfScrollbarLength,
                    maxPositionLeft = containerWidth - scrollbarXWidth,
                    positionRatio = positionLeft / maxPositionLeft;

                if(positionRatio < 0 ){
                    positionRatio = 0;
                }else if(positionRatio > 1){
                    positionRatio = 1;
                }

                $element.scrollLeft((contentWidth - containerWidth)*positionRatio);
                self.updateBarSizeAndPosition();
            })
        },
        //todo
        destroy:function(){
            var $element = this.$element;
            $element.unbind('.scrollbar');
            $(window).unbind('.scrollbar');
            $(document).unbind('.scrollbar');
        },
        updateContentScrollLeft:function(){
            var scrollLeft = parseInt(scrollbarXLeft*(contentWidth - containerWidth)/(containerWidth - scrollbarXWidth),10);
            this.$element.scrollLeft(scrollLeft);
            $scrollbarYRail.css({right: scrollbarYRight - scrollLeft});
        },
        updateContentScrollTop : function () {
            var scrollTop = parseInt(scrollbarYTop * (contentHeight - containerHeight) / (containerHeight - scrollbarYHeight), 10);
            this.$element.scrollTop(scrollTop);
            $scrollbarXRail.css({bottom: scrollbarXBottom - scrollTop});
        },
        getSettingsAdjustedThumbSize:function(thumbSize){
                var options = this.options;
                if(options.minScrollbarLength){
                    thumbSize = Math.max(thumbSize,options.minScrollbarLength)
                }
                return thumbSize;
            },
        updateScrollbarCss:function(){
                var $element = this.$element;

                $scrollbarXRail.css({
                    left: $element.scrollLeft(),
                    bottom: scrollbarXBottom - $element.scrollTop(),
                    width: containerWidth
                });
                $scrollbarYRail.css({
                    top: $element.scrollTop(),
                    right: scrollbarYRight - $element.scrollLeft(),
                    height: containerHeight
                });
                $scrollbarX.css({
                    left: scrollbarXLeft,
                    width: scrollbarXWidth
                });
                $scrollbarY.css({
                    top: scrollbarYTop,
                    height: scrollbarYHeight
                });
            },
        ieSupport:function(){
            //todo 修正IE
        }
    }
    return scrollbar;
});