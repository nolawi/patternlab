
(function(global, $, NG){

    var Switch = function(element, options) {

        var $this = this, $element = $(element);

        if($element.data("switch")) return;
        this.options  = $.extend({}, Switch.defaults, options);
        if (this.options.target[0] == "#") {
            this.toswitch = $(this.options.target);
            this.toswitch.on("click", function() {$this.syncWithInput();});
        } else {
            this.toswitch = $element.find(this.options.target);
        }
        this.element  = $element.on("click", function(e) {
            e.preventDefault();
            $this.toggle();
        });

        this.element.data("switch", this);
        this.syncWithInput();
    };

    $.extend(Switch.prototype, {
        syncWithInput: function(){
            if(!this.toswitch.length) return;

            this.element.removeClass(this.options.onClass + " " + this.options.offClass);
            if (this.toswitch.prop("checked")) {
                this.element.addClass(this.options.onClass);
            } else {
                this.element.addClass(this.options.offClass);
            }
        },

        toggle: function() {
            this.element.toggleClass(this.options.onClass);
            this.element.toggleClass(this.options.offClass);
            if(this.toswitch.length) {
                this.toswitch.prop("checked", !this.toswitch.prop("checked"));
            }
        }
    });

    Switch.defaults = {
        target: '> input',
        onClass: 'ng-on',
        offClass: 'ng-off'
    };

    NG["switch"] = Switch;

    NG.ready(function(context) {

        $("[data-ng-switch]", context).each(function() {
            var ele = $(this);

            if (!ele.data("switch")) {
               var obj = new Switch(ele, NG.Utils.options(ele.attr("data-ng-switch")));
            }
        });
    });

})(this, jQuery, jQuery.NGkit);
