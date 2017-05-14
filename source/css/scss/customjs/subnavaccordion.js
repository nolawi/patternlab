(function($, NG){

    "use strict";

    var SubnavAccordion = function(element, options) {
        var $this = this,
            $element = $(element);

        if($element.data("subnavaccordion")) return;

        this.options  = $.extend({}, SubnavAccordion.defaults, options);
        this.element = $element.on({
            "focus"     : function(e) { $this.open(e); },
            "mouseenter": function(e) { $this.open(e); },
            "ng-close": function(e) { $this.close(e); },
            "ng-open": function(e) { $this.open(e); }
        });

        if (this.options.alwaysClose){
            $element.on({
                "mouseleave": function(e) { $this.close(e); },
                "blur": function(e) { $this.close(e); }
            });
        }
        this.element.data("subnavaccordion", this);
        if (this.options.initialWidth) {
            this.closed_width = this.options.initialWidth;
        } else {
            this.closed_width = $element.find(this.options.selector).width();
        }
        this.opened_width = $element.width();
        this.css_height = $element.height();
        $element.css({
            width: this.closed_width + 'px',
            height: this.css_height + 'px',
            overflow: 'hidden'
        });
    };

    SubnavAccordion.defaults = {
        alwaysClose: false,
        initiallyOpen: 0,
        initialWidth: null,
        selector: '> a > *:first'
    };

    $.extend(SubnavAccordion.prototype, {
        close: function(e) {
            // Close a li element to the width of the .ng-swatch child
            $(this.element[0]).stop();
            $(this.element[0]).animate({
                width: this.closed_width + 'px'
            }, 500);
        },
        open: function(e) {
            // Show the entire li element
            $(this.element[0]).stop();
            $(this.element[0]).siblings().each(function(index, element){
                $(element).data("subnavaccordion").close();
            });
            $(this.element[0]).animate({
                width: this.opened_width + "px"
            }, 500);
        }
    });
    NG.ready(function(context) {
        $("[data-ng-subnavaccordion]", context).each(function() {
            var subnav = $(this),
                obj,
                opts = $.extend({}, SubnavAccordion.defaults, NG.Utils.options(subnav.attr("data-ng-subnavaccordion")));
            $.each(subnav[0].children, function(index, item){
                if (!$(item).data("subnavaccordion")) {
                    obj = new SubnavAccordion($(item), NG.Utils.options(subnav.attr("data-ng-subnavaccordion")));
                }
            });
            if (opts.initiallyOpen >= 0) {
                $(subnav[0].children[opts.initiallyOpen]).trigger('ng-open');
            }
        });
    });

})(jQuery, jQuery.NGkit);
