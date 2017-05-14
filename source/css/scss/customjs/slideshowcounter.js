(function(addon) {

    var component;

    if (window.NGkit) {
        component = addon(NGkit);
    }

    if (typeof define == "function" && define.amd) {
        define("ngkit-slideshowcounter", ["ngkit"], function() {
            return component || addon(NGkit);
        });
    }

})(function(NG) {

    "use strict";

    NG.component('slideshowcounter', {

        boot: function() {

            // init code
            NG.ready(function(context) {

                NG.$('[data-ng-slideshowcounter]', context).each(function() {

                    var ele = NG.$(this);

                    if (!ele.data("slideshowcounter")) {
                        var obj = NG.slideshowcounter(ele, NG.Utils.options(ele.attr("data-ng-slideshowcounter")));
                    }
                });
            });
        },

        init: function() {
            
            // Get the actual slideshowcounter dom-element + slideshow Object Component + update the counter display value:
            this.counter = this.element.hasClass('ng-slideshowcounter') ? this.element : NG.$(this.find('.ng-slideshowcounter'));
            var slideshow_obj = this.counter.closest("[data-ng-slideshow]").data("slideshow");
            
            this.counter.html("1 / <span>" + slideshow_obj.slidesCount + "</span>");

        },

    });

    

});

