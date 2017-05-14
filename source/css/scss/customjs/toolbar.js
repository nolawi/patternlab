// toolbar
/*
    Two modes: radio (one item is always selected) and momentarypushin (default)
    events:
        element selected
*/
(function(addon) {

    var component;

    if (jQuery && jQuery.NGkit) {
        component = addon(jQuery, jQuery.NGkit);
    }

    if (typeof define == "function" && define.amd) {
        define("ngkit-toolbar", ["ngkit"], function(){
            return component || addon(jQuery, jQuery.NGkit);
        });
    }

})(function($, NG){

    NG.component('toolbar', {

        defaults: {
            selector: '> .ng-toolbar-nav > li',
            mode: 'momentarypushin', // radio or momentarypushin
            initiallySelected: 0    // only valid when mode = 'radio'
        },

        // Attributes/properties

        // Methods
        init: function() {
            var $this   = this;
            this.buttons = this.find(this.options.selector);
            if (this.options.mode == "radio") {
                this.selected = this.options.initiallySelected || 0;
                this.select(this.selected);
            }
            this.element.on('click', this.options.selector, function(e) {
                e.preventDefault();
                if ($this.options.mode == 'radio') {
                    $this.buttons.not(this).removeClass("ng-active").blur();
                    $(this).addClass("ng-active");
                }
                $this.trigger("change", [$(this)]);
            });
        },

        /* Select one of the buttons.
           If mode is radio, sets the selected button
           otherwise acts as a click on the button
        */
        select: function(index) {
            if (this.options.mode == "radio") {
                $(this.buttons).removeClass("ng-active");
                $(this.buttons[index]).addClass("ng-active");
            }
        },
        getSelected: function() {
            return this.find(".ng-active");
        }
    });

    // init code
    NG.ready(function(context) {
        $("[data-ng-toolbar]", context).each(function() {
            var ele = $(this);
            if (!ele.data("toolbar")) {
                var obj = NG.toolbar(ele, NG.Utils.options(ele.attr("data-ng-toolbar")));
            }
        });
    });

    return NG.toolbar;
});