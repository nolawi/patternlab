/* There are two components: the drawer and the trigger

    The drawer is the definition of how the drawer interacts with its parent, e.g.
    the closed width, the height, if it is initially open.

    A drawer can have multiple triggers. Triggers tell the drawer to open or close.

    If the drawer is partially open (closedWith > 0), the drawer itself can act
    as a trigger, opening on mouse over.
*/
(function(addon) {
    var component;

    if (jQuery && jQuery.NGkit) {
        component = addon(jQuery, jQuery.NGkit);
    }

    if (typeof define == "function" && define.amd) {
        define("ngkit-drawer", ["ngkit"], function(){
            return component || addon(jQuery, jQuery.NGkit);
        });
        define("ngkit-drawertrigger", ["ngkit"], function(){
            return component || addon(jQuery, jQuery.NGkit);
        });
    }
})(function($, NG){

    "use strict";

    NG.component('drawer', {
        defaults: {
            openOnHover: false,
            initiallyOpen: false,
            minWidth: 0,
            maxWidth: null,
            closedWidth: 0
        },

        // Methods
        init: function() {
            var $this   = this,
                $element = $(this.element);

            this.element.data("drawer", this);
            this.flipped = $element.hasClass('ng-drawer-flip');
            this.closedWidth = this.options.closedWidth;
            if (this.options.maxWidth === null)
                this.options.maxWidth = $element.parent().width();
            this.checksize(true);
            $element.parent().css('overflow', 'hidden');
            this.element = $element.on({
                "focus"     : function(e) { $this.open(e); },
                "ng-close": function(e) { $this.close(e); },
                "ng-open": function(e) { $this.open(e); },
                "ng-toggle": function(e) {if ($this.element.hasClass('ng-open')) $this.close(e); else $this.open(e);},
                "ng-check-display": function(e) {$this.checksize();},
            });
            $(window).on({
                "resize": function(e) {$this.checksize();},
                "orientationchange": function(e) {$this.checksize();}
            });

            if (this.options.openOnHover && this.options.minWith > 0){
                $element.on({
                    "mouseenter": function(e) { $this.open(e); },
                    "mouseleave": function(e) { $this.close(e); },
                    "blur": function(e) { $this.close(e); }
                });
            }
        },
        close: function(e) {
            this.element.removeClass('ng-open');
            this.checksize();
        },
        open: function(e) {
            this.element.addClass('ng-open');
            this.checksize();
        },
        checksize: function(isInitial) {
            isInitial = isInitial || false;  // Is this the first time we are setting it up?

            this.openedWidth = Math.max(this.options.minWidth, $(this.element).width());
            this.openedWidth = Math.min(this.openedWidth, this.options.maxWidth);
            this.css_height = '100%'; //$(this.element).parent().height();
            var cssAttrs = {
                width: this.openedWidth + 'px',
                height: this.css_height,
                display: 'block'
            };
            var isOpen = $(this.element).hasClass('ng-open');
            // If closedWidth > 0 (meaning the default CSS doesn't work correctly)
            // AND the drawer is not currently open
            //     OR this is the first time through
            //        AND it is not initially open
            if (this.options.closedWidth > 0 &&
                (!isOpen ||
                (isInitial && !this.options.initiallyOpen))) {
                    var widthDelta = this.openedWidth - this.options.closedWidth;
                    cssAttrs.transform = 'translateX(' + widthDelta + 'px)';
            }
             else {
                cssAttrs.transform = '';
            }

            $(this.element).css(cssAttrs);
        }
    });
    NG.component('drawertrigger', {
        defaults: {
            target: '', // an anchor's href attribute will set this if not set explicitly
            action: 'toggle' // choices: open, close, toggle
        },
        init: function() {
            var $this   = this,
                $element = $(this.element);

            if ($element.is('a') && this.options.target === '') {
                this.options.target = $element.attr("href");
            }
            this.target = $(this.options.target);
            this.on("click", function(e) {
                e.preventDefault();
                $this.target.trigger('ng-' + $this.options.action);
            });
        }
    });
    $(document).ready(function() {
        $("[data-ng-drawer]").each(function() {
            var ele = $(this);

            if (!ele.data("drawer")) {
                var opts = NG.Utils.options(ele.attr("data-ng-drawer"));
                var obj = NG.drawer(ele, opts);
                if (opts.initiallyOpen) {
                    obj.trigger('ng-open');
                }
            }
        });
        $("[data-ng-drawertrigger]").each(function() {
            var ele = $(this);

            if (!ele.data("drawertrigger")) {
                var obj = NG.drawertrigger(ele, NG.Utils.options(ele.attr("data-ng-drawertrigger")));
            }
        });
    });

});
