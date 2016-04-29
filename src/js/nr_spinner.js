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

    var defaults = {
        defaultVal:0,
        min:0,
        max:100,
        step:1
    }
    var keyCodes = {
        up:38,
        down:40
    }
    var oldValue = 0,
        timeout;
    function spinner(element,options){
        this.$element = $(element).find('.j-spinner-input');
        this.$increaseButton = $(element).find('.j-spinner-up')
        this.$decreaseButton = $(element).find('.j-spinner-down')
        this.options = $.extend({},defaults,options);

        this.init();
    }
    spinner.prototype = {
        init:function(){
            var self = this,
                $element = this.$element;
            $element.attr('maxlenght','2').val(this.options.defaultVal);
            $element.bind('keyup paste change',function(e){
                if(e.keyCode == keyCodes.up){
                    self.changeValue(1)
                }else if(e.keyCode == keyCodes.down){
                    self.changeValue(-1)
                }else if(self.getValue()!= oldValue){
                    self.validateAndTrigger($(this));
                }
            });
            this.$increaseButton.bind('click',function(){
                self.changeValue(1);
            })
            this.$decreaseButton.bind('click',function(){
                self.changeValue(-1);
            })
        },
        changeValue:function(value){
            this.$element.val(this.getValue()+value);
            console.log(value)
            this.validateAndTrigger(this.$element)
        },
        validateAndTrigger:function(field){
            clearTimeout(timeout);
            var value = this.validate()
            if(!this.isInvalid){
                this.$element.trigger('update',[this.$element,value])
            }
        },
        validate:function(){
            var value = this.getValue(),
                self = this;

            if (value <= this.options.min){
                this.$decreaseButton.addClass('j-spinner-disabled')
            }else{
                this.$decreaseButton.removeAttr('j-spinner-disabled')
            }
            this.$element.toggleClass('j-spinner-invalid', this.isInvalid(value)).toggleClass('j-spinner-passive', value === 0)

            if (this.isInvalid(value)) {
                var timeout = setTimeout(function () {
                    self.$element.val(oldValue)
                    self.validate()
                }, 500)
            } else {
                oldValue = value;
            }
            return value
        },
        isInvalid:function(value){
            return isNaN(+value) || value < this.options.min;
        },
        getValue:function(){
            var $element = this.$element;
            return parseInt($element.val() || 0, 10)
        }
    }
    return spinner;
});