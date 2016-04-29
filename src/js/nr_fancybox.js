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

    var wrapper = $('<div id="galpop-wrapper" />'),
        container = $('<div id="galpop-container" />').appendTo(wrapper),
        content = $('<div id="galpop-content" />').appendTo(container),
        info = $('<div id="galpop-info" />').appendTo(content),
        prev = $('<a href="#" id="galpop-prev" />').appendTo(content),
        next = $('<a href="#" id="galpop-next" />').appendTo(content),
        close = $('<a href="#" id="galpop-close" />').appendTo(content);

    var defaults = {
        arrowKeys: true,
        controls: true,
        loop: true,
        maxWidth: null,
        maxHeight: null,
        maxScreen: 90,
        updateRsz: true,
        callback: null,
        lockScroll: false
    };
    var current = null,
        isOpened = false;

    function galpop(elem, options) {
        this.$elem = $(elem);
        this.options = $.extend({}, options, defaults);
        this.init()
    }

    galpop.prototype = {
        init: function () {
            var that = this,
                options = this.options;

            this.$elem.click(function (e) {
                wrapper.data("options", options);
                that.openBox(this);

                that.bindEvent()
                e.preventDefault()
            });
        },

        bindEvent: function () {
            var that = this,
                options = this.options;

            wrapper.bind("click", function (e) {
                that.closeBox();
                e.preventDefault()
            });

            container.bind("click", function (e) {
                e.stopPropagation()
            });

            prev.bind("click", function (e) {
                that.prev();
                e.preventDefault()
            });

            next.bind("click", function (e) {
                that.next();
                e.preventDefault()
            });

            close.bind("click", function (e) {
                that.closeBox();
                e.preventDefault()
            });

            info.on("click", "a", function () {
                that.closeBox()
            })
        },
        openBox: function (elem) {
            var that = this,
                $ele = $(elem);

            var rel = $ele.data("galpop-group"),
                group = $('[data-galpop-group="' + rel + '"]'),

                index = group.index($ele),
                arrowKeys = wrapper.data("options").arrowKeys,
                updateRsz = wrapper.data("options").updateRsz,
                lockScroll = wrapper.data("options").lockScroll;

            if (arrowKeys) {
                $(document).bind("keydown", function (e) {
                    that.keybind.call(that, e)
                })
            }
            //todo 自动调整位置
            if (updateRsz) {

            }

            if (lockScroll) {
                $("html").addClass("lock-scroll")
            }

            wrapper.prependTo("body");

            wrapper.fadeIn(500, "swing");
            wrapper.data({
                rel: rel,
                group: group,
                index: index,
                status: true,
                count: group.length
            });

            this.preload(elem)
        },
        preload: function (elem) {
            var that = this;
            var url = $(elem).attr("href");
            var image = new Image();
            current = elem;
            image.onload = function () {
                that.display(this,elem)
            };
            image.onerror = function () {
                console.log(url + "图片不能加载")
            }
            image.src = url;
        },
        display: function (image,elem) {
            var that = this,
                imageHeight = image.height,
                imageWidth = image.width,
                maxWidth = wrapper.data("options").maxWidth,
                maxHeight = wrapper.data("options").maxHeight,
                maxScreen = wrapper.data("options").maxScreen,
                screenHeight = $(window).height(),
                screenWidth = $(window).width(),
                ratio = 0,
                extraWidth = container.outerWidth() - container.width(),
                extraHeight = container.outerHeight() - container.height();

            if (!maxWidth || maxWidth > screenWidth * maxScreen / 100) {
                maxWidth = screenWidth * maxScreen / 100
            }
            if (!maxHeight || maxHeight > screenHeight * maxScreen / 100) {
                maxHeight = screenHeight * maxScreen / 100
            }
            if (imageWidth > maxWidth) {
                ratio = maxWidth / imageWidth;
                imageHeight = imageHeight * ratio;
                imageWidth = imageWidth * ratio
            }
            if (imageHeight > maxHeight) {
                ratio = maxHeight / imageHeight;
                imageWidth = imageWidth * ratio;
                imageHeight = imageHeight * ratio
            }
            var rez = this.getViewport();
            var startPos = this.getOrigPosition(elem);
            startPos.opacity = 0.1;

            if(!isOpened){
                container.css(startPos).animate({
                    height: imageHeight,
                    width: imageWidth,
                    top:(rez.h-imageHeight)/2,
                    left:(rez.w-imageWidth)/2,
                    opacity:1
                    //marginTop: -(imageHeight + extraHeight) / 2,
                    //marginLeft: -(imageWidth + extraWidth) / 2
                }, 250, "swing", function () {
                    content.append(image).find("img").fadeIn(500, "swing", function () {
                        isOpened = true;
                        that.complete();
                    })
                })
            }else{
                container.animate({
                    height: imageHeight,
                    width: imageWidth,
                    top:(rez.h-imageHeight)/2,
                    left:(rez.w-imageWidth)/2
                }, 250, "swing", function () {
                    content.append(image).find("img").fadeIn(500, "swing", function () {
                        isOpened = true;
                        that.complete();
                    })
                })
            }
        },
        complete: function () {
            var controls = wrapper.data("options").controls,
                callback = wrapper.data("options").callback,
                index = wrapper.data("index"),
                count = wrapper.data("count"),
                loop = wrapper.data("loop");

            this.infoParse();
            if (!controls || (index == 0 && !loop) || count <= 1) {
                prev.hide()
            } else {
                prev.show()
            }

            if (!controls || (index + 1 >= count && !loop) || count <= 1) {
                next.hide()
            } else {
                next.show()
            }

            if ($.isFunction(callback)) {
                callback.call(this)
            }
        },
        infoParse: function () {
            var index = wrapper.data("index"),
                group = wrapper.data("group"),
                anchor = group.eq(index),
                title = $.trim(anchor.attr("title")),
                url = $.trim(anchor.data("galpop-link")),
                urlTitle = $.trim(anchor.data("galpop-link-title")),
                urlTarget = $.trim(anchor.data("galpop-link-target"));

            info.html("");

            if (title != "") {
                $("<p>" + title + "</p>").appendTo(info)
            }

            if (url != "") {
                if (urlTitle == "") {
                    urlTitle = url
                }
                if (urlTarget != "") {
                    urlTarget = 'target="' + urlTarget + '"'
                }
                $('<p><a href="' + url + '" ' + urlTarget + ">" + urlTitle + "</a></p>").appendTo(info)
            }

            if (title != "" || url != "") {
                info.fadeIn(500, "swing")
            }
        },
        closeBox: function () {
            var that = this;
            var endPos = that.getOrigPosition(current);
            container.animate(endPos, 250, "swing", function () {
                content.find("img").remove();
                info.html('');
                $(this).data("status", false);
                wrapper.remove();
                isOpened = false;
                $(document).unbind("keydown", that.keybind);
                $(window).unbind("resize", that.rsz);
                $("html,body").removeClass("lock-scroll")
            })
        },
        //todo
        moveItem: function (index) {
            var group = wrapper.data("group");
            var that = this;

            info.fadeOut(500, "swing", function () {
                $(this).contents().remove()
            });
            content.find("img").fadeOut(500, "swing", function () {
                $(this).remove();

                that.preload(group[index]);
                wrapper.data("index", index);
            })
        },
        next: function () {
            var index = wrapper.data("index"),
                loop = wrapper.data("options").loop,
                group = wrapper.data("group"),
                count = wrapper.data("count");

            if (index + 1 < count) {
                index++;
                this.moveItem(index)
            } else {
                if (loop) {
                    index = 0;
                    this.moveItem(index)
                }
            }
        },
        prev: function () {
            var index = wrapper.data("index"),
                loop = wrapper.data("options").loop,
                group = wrapper.data("group"),
                count = wrapper.data("count");

            if (index > 0) {
                index--;
                this.moveItem(index)
            } else {
                if (loop) {
                    this.moveItem(index)
                }
            }
        },
        update: function () {
            var index = wrapper.data("index");
            this.moveItem(index)
        },
        destroy: function () {

        },
        keybind: function (e) {
            var that = this;
            var k = e.which;
            switch (k) {
                case 27:
                    that.closeBox();
                    break;
                case 37:
                    that.prev();
                    break;
                case 39:
                    that.next();
                    break
            }
            e.preventDefault()
        },

        getOrigPosition:function(elem){
            var $elem = $(elem);
            var pos = {
                top:$elem.offset().top-$(window).scrollTop(),
                left:$elem.offset().left-$(window).scrollLeft(),
                width:$elem.outerWidth(),
                height:$elem.outerHeight()
            };
            console.log(pos)
            return pos;
        },
        getViewport:function(){
            var rez  = {
                    x: $(window).scrollLeft(),
                    y: $(window).scrollTop(),
                    w: $(window).width(),
                    h: $(window).height()
                 };
            return rez;
        }
    };
    return galpop
});