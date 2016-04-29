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
    function common() {

    }
    common.prototype = {
        initSlider: function (element,count) {
            var $element = $(element);
            require.async("./nr_fractionslider.js", function (slider) {
                new slider($element)
             });
            return this;
        },
        initValidate:function(from){
            var that = this,
                $form = $(from);
            var formSubmit = $form.find("input[type='submit']");

            require.async("./nr_validate", function (validate) {
                var $validate = new validate($form, {
                    ignore: ".j-not-validate",
                    temple: 2/*,
                    submitHandler: function (form) {
                        //todo
                    }*/
                })
            });
            return this
        },
        initPlayer:function(element){
            var $element = $(element);
            //todo
            require.async('./plug/jquery.jplayer.js',function(){
                $("#jquery_jplayer_1").jPlayer({
                    ready: function () {
                        $(this).jPlayer("setMedia", {
                            m4v: "http://www.jplayer.org/video/m4v/Big_Buck_Bunny_Trailer.m4v",
                            ogv: "http://www.jplayer.org/video/ogv/Big_Buck_Bunny_Trailer.ogv",
                            webmv: "http://www.jplayer.org/video/webm/Big_Buck_Bunny_Trailer.webm",
                            poster:"http://www.jplayer.org/video/poster/Big_Buck_Bunny_Trailer_480x270.png"
                        });
                    },
                    play: function() {
                        $(this).jPlayer("pauseOthers");
                    },
                    size:{
                        width:380,
                        height:200
                    },
                    swfPath: NR.rootUrl + "/src/js/plug",
                    supplied: "webmv, ogv, m4v",
                    useStateClassSkin: true,
                    autoBlur: false,
                    smoothPlayBar: true,
                    keyEnabled: true,
                    remainingDuration: true,
                    toggleDuration: true,
                    verticalVolume:true
                });

            })
            return this;
        },
        initFancybox:function(element,options){
            var $element = $(element);
            require.async("./nr_fancybox", function (fancybox) {
                new fancybox($element)
            });
            return this
        },
        initLazyLoad: function (element, options) {
            var $element = $(element);
            require.async("./nr_lazyload.js", function (lazyload) {
                //todo
                var errorImg = (options && options.errorImg) || "http://www.wd568.com/Public/image/people.jpg";
                new lazyload($element, {errorImg: errorImg})
            });
            return this
        },
        initProgress:function(element){
            var $element = $(element);
            require.async('./nr_progress.js',function(progress){
                new progress($element)
            });
            return this;
        },
        initCalendar:function(element,options){
            var $element = $(element);
            require.async('./nr_calendar.js',function(calendar){
                new calendar($element,options);
            })
            return this;
        },
        initSelect: function (element) {
            var $element = $(element);
            require.async('./nr_selectFx.js',function(selectFx){
                var a = new selectFx($element);
            })
            return this;
        },
        initDialog:function(element){
            var $element = $(element);
            require.async(['./nr_dialog.js','./nr_template'],function(dialog,template){
                var testData = {
                    content:"测试弹窗加模板"
                }
                var tmpl = template('testTmpl',testData);
                new dialog($element,{
                    content:tmpl
                })
            })
            return this;
        },
        initStickup:function(element){
            var $element = $(element);
            require.async('./nr_stickup',function(fixed){
                new fixed()
            })
            return this;
        },
        initSpinner:function(element){
            var $element = $(element);
            require.async('./nr_spinner',function(spinner){
                new spinner($element);
            })
            return this;
        },
        initRange:function(element){
            var $element = $(element);
            require.async('./nr_range.js',function(range){
                new range($element,{
                    from: -2.0,
                    to: 2.0,
                    step: 0.5,
                    scale: [-2.0,-1.0,0.0,1.0,2.0],
                    format: '%s',
                    width: 300,
                    showLabels: true,
                    snap: true
                })
            })
            return this;
        },
        initCxScroll:function(element,options){
            var $element = $(element);
            require.async('./nr_cxScroll.js',function(cxScroll){
                new cxScroll($element);
            })
            return this;
        },
        initTab:function(element,options){
            var $element = $(element);
            require.async('./nr_tab.js',function(tab){
                new tab($element);
            })
            return this;
        },
        initTip:function(element,options){
            var $element = $(element);
            require.async('./nr_tip.js',function(tip){
                var tip = new tip($element,options);
            })
            return this;
        },
        initCountDown:function(element){
            var $element = $(element);
            require.async('./nr_countDown.js',function(countDown){
                new countDown($element);
            })
            return this;
        },
        initCountAnimation:function(element,options){
            var $element = $(element);
            require.async('./nr_countAnimation.js',function(countAnimation){
                new countAnimation($element,{
                    startVal:0,
                    endVal:10001.25
                })
            })
            return this;
        },
        initAnimationMenu: function (element) {
            var $element = $(element);
            var hoverTimeout;
            require.async('./nr_hoverIntent.js',function() {
                $element.hoverIntent(function () {
                    clearTimeout(hoverTimeout);
                    $("#J_NavLabel").animate({"top": $(this).position().top})
                }, function () {
                    hoverTimeout = setTimeout(function () {
                        $("#J_NavLabel").animate({"top": $element.find(".menu-item-select").position().top}, 200);
                    }, 200)
                },"li")
            })
            return this;
        },
        initAccordion:function(element,options){
            var $element = $(element);
            require.async('./nr_accordion.js',function(accordion){
                new accordion($element);
            })
            return this;
        },
        initScrollbar:function(element){
            var $element = $(element);
            require.async('./nr_scrollbar.js',function(scrollbar){
                new scrollbar($element);
            })
            return this;
        },
        //todo 用ajax提交表单数据
        initAjaxForm:function(form){
            var that = this,
                $form = $(form);
            //todo
            require.async(['./nr_validate.js','./nr_ajaxForm.js'],function(validate){
                var $validate = new validate($form, {
                    ignore: ".j-not-validate",
                    temple: 2,
                     submitHandler: function (form) {
                         $(form).ajaxSubmit({
                             resetForm:true,
                             success:function(){
                                 return false
                             }
                         })
                     }
                })

            })
            return this;
        },
        initFormat:function(){
            require.async('./nr_format.js',function(format){
                var format = new format();
                var aa = format.formatNumber("999/99.99");
                console.log(aa)
            })
            return this;
        },
        initLocalStorage:function(element){
            var $element = $(element);
            require.async('./nr_localStorage.js',function(localStorage){
                var local = new localStorage($element);
                local.init();
                //console.log(localStorage)
            })
            return this;
        },
        //todo 这个方法有问题
        initFixPlaceholder:function(ele){
            var isPlaceholder = "placeholder" in document.createElement("input");
            if(isPlaceholder){
                return this;
            }else{
                $(ele).each(function(){
                    var defaultValue = $(this).attr('placeholder');
                    var $imitate = $('<span class="wrap-placeholder" style="position:absolute; display:inline-block; overflow:hidden;  width:'+$(ele).outerWidth()+'px; height:'+$(ele).outerHeight()+'px;">' + defaultValue + '</span>');
                    $imitate.css({
                        'margin-left':$(ele).css('margin-left'),
                        'margin-top':$(ele).css('margin-top'),
                        'padding-left':parseInt($(ele).css('padding-left')) + 2 + 'px',
                        'line-height':$(ele)[0].nodeName.toLowerCase() == 'textarea' ? $(ele).css('line-weight') : $(ele).outerHeight() + 'px',
                        'padding-top':$(ele)[0].nodeName.toLowerCase() == 'textarea' ? parseInt($(ele).css('padding-top')) + 2 : 0
                    });
                    $(this).before($imitate.click(function () {
                        $(this).trigger('focus');
                    }));

                    $(this).val().length != 0 && $imitate.hide();

                    $(this).focus(function () {
                        $imitate.hide();
                    }).blur(function () {
                        /^$/.test($(this).val()) && $imitate.show();
                    });
                })
            }
            return this;
        },
        onepageScroll:function(element){
            var $element = $(element);
            require.async('./nr_onePageNav.js',function(onePageNav){
                new onePageNav($element)
            })
            return this;
        },
        initOnePageScroll:function(element){
            var $element = $(element);
            require.async('./nr_onepageScroll.js',function(onepageScroll){
                new onepageScroll($element,{
                    afterMove:function(){
                        console.log('end')
                    }
                });
            })
            return this;
        },
        initNotify:function(content){
            require.async(["./nr_notify"], function (notify) {
                new notify(".j-notify",{
                    content: content,
                    style: {background: "#ff5f3e"}
                })
            });
            return this
        },
        initAutocomplete:function(element){
            var $element = $(element);
            require.async('./nr_autocomplete.js',function(autocomplete){
                new autocomplete($element,{
                    source:[
                        {"pid":"1410","url":"http://www.dajiact.com/","value":"dajiachuangtou ","label":"test1"},
                        {"pid":"1333","url":"https://www.dongzecf.com/","value":"dongzecaifu ","label":"test2 "},
                        {"pid":"1333","url":"https://www.dongzecf.com/","value":"dongzecaifu ","label":"t2sdfd "}
                    ]
                });
            })
            return this;
        },
        initCharCount: function (element,options) {
            var defaults = {
                minLength:10,
                maxLength:200
            }

            var $element = $(element);
            $element.bind("keyup keypress charcount",function (evt) {
                var options = $.extend({},defaults,options);

                var length = $(evt.target).val().length;
                var remaining = options.maxLength - length;
                if (options.minLength > length) {
                    $(".j-charCount-tip").text("最少输入"+options.minLength+"字，还需要输入" + (options.minLength - length) + "字").addClass("j-charCount-wran")
                } else {
                    if (options.maxLength < length) {
                        $(".j-charCount-tip").text("最多输入"+options.maxLength+"字，超过了" + remaining + "字").addClass("j-charCount-wran")
                    } else {
                        $(".j-charCount-tip").text("还可以输入" + (options.maxLength - length) + "字").removeClass("j-charCount-wran")
                    }
                }
            }).trigger("charcount");
            return this
        },
        initProjectEase: function(element,className){
            var that = this;
            var $element = $(element);

            require.async(['./nr_progress.js','./nr_ease.js','./nr_hoverIntent.js'],function(progress){
                $element.hoverIntent(function(){
                    var $easeElement = $(this).find('.j-ease'),
                        $progressElement = $(this).find('.j-progress');

                    $easeElement.animate({
                        height:150
                    },{
                        easing:"easeOutCubic",
                        duration:400,
                        complete:function(){}
                    });

                    new progress($progressElement);
                },function(){
                    var $easeElement = $(this).find('.j-ease');
                    $easeElement.animate({
                        height:100
                    },{
                        easing:"easeOutQuart",
                        duration:400,
                        complete:function(){
                        }
                    })
                })
            })
            return this;
        },
        initEase:function(element){
            var $element = $(element);
            require.async('./nr_ease.js',function(){
                $element.animate({
                    height:150
                },{
                    easing:"easeInCubic",
                    duration:500,
                    complete:function(){

                    }
                })
            })
            return this;
        }
    }
    return common;
});