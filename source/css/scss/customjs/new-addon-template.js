// lowercasename
(function(addon) {

    var component;

    if (jQuery && jQuery.NGkit) {
        component = addon(jQuery, jQuery.NGkit);
    }

    if (typeof define == "function" && define.amd) {
        define("ngkit-lowercasename", ["ngkit"], function(){
            return component || addon(jQuery, jQuery.NGkit);
        });
    }

})(function($, NG){

    NG.component('lowercasename', {

        defaults: {
        },

        // Attributes/properties
        visible  : false,
        value    : null,
        selected : null,

        // Methods
        init: function() {
            var $this   = this;
        },

    });

    // init code
    NG.ready(function(context) {
        $("[data-ng-lowercasename]", context).each(function() {
            var ele = $(this);
            if (!ele.data("lowercasename")) {
                var obj = NG.lowercasename(ele, NG.Utils.options(ele.attr("data-ng-lowercasename")));
            }
        });
    });

    return NG.lowercasename;
});