/* Based off of UIKit's Toggle */

(function(global, $, NG){

    NG.component('accordion', {

        defaults: {
            target: false,
            siblings: false,
            cls: 'ng-hidden',
            disabled: false
        },

        init: function() {

            var $this = this,
                $element = $(this.element),
                $clickableElment = $(this.element).find(".ng-accordion-header");

            this.totoggle = this.options.target ? $(this.options.target):[];
            this.disabled = this.options.disabled;
            this.clickableElment  = $clickableElment.on("click", function(e) {
                $this.toggle();
            }).on('ng-close', function(e) {
                e.preventDefault();
                $this.close();
            }).on('ng-open', function(e) {
                e.preventDefault();
                $this.open();
            });

            this.element.data("accordion", this);
        },
        open: function() {
            var $this = this;
            if (this.disabled) return;
            if(!this.totoggle.length) return;
            $(this.totoggle).css({'overflow': 'hidden', height: 'auto', display: 'block', visibility: 'visible'});
            this.totoggle.removeClass($this.options.cls);
            var hgt = getHeight(this.totoggle);
            $(this.totoggle).css({'overflow': 'hidden', height: 0, display: 'block', visibility: 'visible'});
            $(this.totoggle).stop().animate({height: hgt}, function() {
                $($this.element).addClass("ng-open");
                $($this.totoggle).css({'overflow': 'auto'});
                $($this.totoggle).css({'height': 'auto'});
            });
        },
        close: function() {
            var $this = this;
            if (this.disabled) return;
            if(!this.totoggle.length) return;
            $(this.totoggle).stop().animate({height: 0}, function() {
                $($this.element).removeClass("ng-open");
                $this.totoggle.addClass($this.options.cls);
            });
        },
        disable: function() {
            this.disabled = true;
            $(this.element).addClass('ng-disabled');
        },
        enable: function() {
            this.disabled = false;
            $(this.element).removeClass('ng-disabled');
        },
        toggle: function() {
            var $this = this;
            if (this.disabled) return;
            if(!this.totoggle.length) return;

            if (this.options.siblings){
                this.options.siblings.each(function(){
                    if ($(this).hasClass("ng-open")) $(this).trigger("ng-close");
                });
            }
            if($(this.element).hasClass("ng-open")){
                this.close();
            } else {
                this.open();
            }

            if(this.options.cls == 'ng-hidden') {
                $(document).trigger("ng.check.display");
            }
        }
    });

    function getHeight(ele) {
        var $ele = $(ele), height = "auto";

        if ($ele.is(":visible")) {
            height = $ele.outerHeight();
        } else {
            var tmp = {
                position: $ele.css("position"),
                visibility: $ele.css("visibility"),
                display: $ele.css("display")
                // height: $ele.css("height")
            };
            var isHidden = $ele.hasClass('ng-hidden');
            $ele.removeClass('ng-hidden');
            height = $ele.css({position: 'absolute', visibility: 'hidden', display: 'block', height: 'auto'}).outerHeight();
            if(isHidden){
                $ele.addClass('ng-hidden');
            }
            $ele.css(tmp); // reset element
        }

        return height;
    }

    NG.ready(function(context) {

        $("[data-ng-accordion-radio]", context).each(function() {
            var parent = $(this);

            parent.find("[data-ng-accordion]").each(function() {
                var ele = $(this);

                if (!ele.data("accordion")) {
                    var opts = NG.Utils.options(ele.attr("data-ng-accordion"));
                    opts.siblings = parent.find("[data-ng-accordion]").not(ele);

                    var obj = NG.accordion(ele, opts);
                }
            });
        });
        $("[data-ng-accordion]", context).each(function() {
            var ele = $(this);

            if (!ele.data("accordion")) {
               var obj = NG.accordion(ele, NG.Utils.options(ele.attr("data-ng-accordion")));
            }
        });

    });

})(this, jQuery, jQuery.NGkit);