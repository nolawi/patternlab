(function($, NG) {

    "use strict";

    var active = false, hoverIdle;

    NG.component('popovermenu', {

        defaults: {
           'mode'       : 'hover',
           'remaintime' : 800,
           'justify'    : false,
           'boundary'   : $(window),
           'delay'      : 0
        },

        remainIdle: false,

        init: function() {

            var $this = this;

            this.popovermenu = this.find(".ng-popovermenu");

            this.centered  = true;
            this.justified = this.options.justify ? $(this.options.justify) : false;

            this.boundary  = $(this.options.boundary);
            this.flipped   = this.popovermenu.hasClass('ng-popovermenu-flip');

            if(!this.boundary.length) {
                this.boundary = $(window);
            }

            if (this.options.mode == "click" || NG.support.touch) {

                this.on("click", function(e) {

                    var $target = $(e.target);

                    if (!$target.parents(".ng-popovermenu").length) {

                        if ($target.is("a[href='#']") || $target.parent().is("a[href='#']")){
                            e.preventDefault();
                        }

                        $target.blur();
                    }

                    if (!$this.element.hasClass("ng-open")) {

                        $this.show();

                    } else {

                        if ($target.is("a:not(.js-ng-prevent)") ||
                            $target.parent().is("a:not(.js-ng-prevent)") ||
                            $target.is(".ng-popovermenu-close") ||
                            !$this.popovermenu.find(e.target).length) {
                                $this.element.removeClass("ng-open");
                                active = false;
                        }
                    }
                });

            } else {

                this.on("mouseenter", function(e) {

                    if ($this.remainIdle) {
                        clearTimeout($this.remainIdle);
                    }

                    if (hoverIdle) {
                        clearTimeout(hoverIdle);
                    }

                    hoverIdle = setTimeout($this.show.bind($this), $this.options.delay);

                }).on("mouseleave", function() {

                    if (hoverIdle) {
                        clearTimeout(hoverIdle);
                    }

                    $this.remainIdle = setTimeout(function() {

                        $this.element.removeClass("ng-open");
                        $this.remainIdle = false;

                        if (active && active[0] == $this.element[0]) active = false;

                    }, $this.options.remaintime);

                }).on("click", function(e){

                    var $target = $(e.target);

                    if ($this.remainIdle) {
                        clearTimeout($this.remainIdle);
                    }

                    if ($target.is("a[href='#']") || $target.parent().is("a[href='#']")){
                        e.preventDefault();
                    }

                    $this.show();
                });
            }
        },

        show: function(){

            if (active && active[0] != this.element[0]) {
                active.removeClass("ng-open");
            }

            if (hoverIdle) {
                clearTimeout(hoverIdle);
            }

            this.checkDimensions();

            this.element.addClass("ng-open");
            this.trigger('ng.popovermenu.show', [this]);
            active = this.element;

            this.registerOuterClick();
        },

        registerOuterClick: function(){

            var $this = this;

            $(document).off("click.outer.popovermenu");

            setTimeout(function() {
                $(document).on("click.outer.popovermenu", function(e) {

                    if (hoverIdle) {
                        clearTimeout(hoverIdle);
                    }

                    var $target = $(e.target);

                    if (active && active[0] == $this.element[0] && ($target.is("a:not(.js-ng-prevent)") || $target.is(".ng-popovermenu-close") || !$this.popovermenu.find(e.target).length)) {
                        active.removeClass("ng-open");
                        $(document).off("click.outer.popovermenu");
                    }
                });
            }, 10);
        },

        checkDimensions: function() {

            if(!this.popovermenu.length) return;

            if (this.justified && this.justified.length) {
                this.popovermenu.css("min-width", "");
            }

            var $this     = this,
                popovermenu  = this.popovermenu.css("margin-" + $.NGkit.langdirection, ""),
                offset    = popovermenu.show().offset(),
                width     = popovermenu.outerWidth(),
                boundarywidth  = this.boundary.width(),
                boundaryoffset = this.boundary.offset() ? this.boundary.offset().left:0;

            // centered popovermenu
            if (this.centered) {
                popovermenu.css("margin-" + $.NGkit.langdirection, (parseFloat(width) / 2 - popovermenu.parent().width() / 2) * -1);
                offset = popovermenu.offset();
                // reset popovermenu
                if ((width + offset.left) > boundarywidth || offset.left < 0) {
                    popovermenu.css("margin-" + $.NGkit.langdirection, "");
                    offset = popovermenu.offset();
                }
            }

            // justify popovermenu
            if (this.justified && this.justified.length) {

                var jwidth = this.justified.outerWidth();

                popovermenu.css("min-width", jwidth);

                if ($.NGkit.langdirection == 'right') {

                    var right1   = boundarywidth - (this.justified.offset().left + jwidth),
                        right2   = boundarywidth - (popovermenu.offset().left + popovermenu.outerWidth());

                    popovermenu.css("margin-right", right1 - right2);

                } else {
                    popovermenu.css("margin-left", this.justified.offset().left - offset.left);
                }

                offset = popovermenu.offset();

            }

            if ((width + (offset.left-boundaryoffset)) > boundarywidth) {
                popovermenu.addClass("ng-popovermenu-flip");
                offset = popovermenu.offset();
            }

            if ((offset.left-boundaryoffset) < 0) {

                popovermenu.addClass("ng-popovermenu-stack");

                if (popovermenu.hasClass("ng-popovermenu-flip")) {

                    if (!this.flipped) {
                        popovermenu.removeClass("ng-popovermenu-flip");
                        offset = popovermenu.offset();
                        popovermenu.addClass("ng-popovermenu-flip");
                    }

                    setTimeout(function(){

                        if ((popovermenu.offset().left-boundaryoffset) < 0 || !$this.flipped && (popovermenu.outerWidth() + (offset.left-boundaryoffset)) < boundarywidth) {
                            popovermenu.removeClass("ng-popovermenu-flip");
                        }
                    }, 0);
                }

                this.trigger('ng.popovermenu.stack', [this]);
            }

            popovermenu.css("display", "");
        }

    });

    var triggerevent = NG.support.touch ? "click" : "mouseenter";

    // init code
    NG.$doc.on(triggerevent+".popovermenu.ngkit", "[data-ng-popovermenu]", function(e) {
        var ele = $(this);

        if (!ele.data("popovermenu")) {

            var popovermenu = NG.popovermenu(ele, NG.Utils.options(ele.data("ng-popovermenu")));

            if (triggerevent=="click" || (triggerevent=="mouseenter" && popovermenu.options.mode=="hover")) {
                popovermenu.element.trigger(triggerevent);
            }

            if(popovermenu.element.find('.ng-popovermenu').length) {
                e.preventDefault();
            }
        }
    });

})(jQuery, jQuery.NGkit);
