(function(NG) {

    "use strict";

    var active = false, hoverIdle, flips = {
        'x': {
            "bottom-left"   : 'bottom-right',
            "bottom-right"  : 'bottom-left',
            "bottom-center" : 'bottom-center',
            "top-left"      : 'top-right',
            "top-right"     : 'top-left',
            "top-center"    : 'top-center',
            "left-top"      : 'right-top',
            "left-bottom"   : 'right-bottom',
            "left-center"   : 'right-center',
            "right-top"     : 'left-top',
            "right-bottom"  : 'left-bottom',
            "right-center"  : 'left-center'
        },
        'y': {
            "bottom-left"   : 'top-left',
            "bottom-right"  : 'top-right',
            "bottom-center" : 'top-center',
            "top-left"      : 'bottom-left',
            "top-right"     : 'bottom-right',
            "top-center"    : 'bottom-center',
            "left-top"      : 'left-bottom',
            "left-bottom"   : 'left-top',
            "left-center"   : 'left-center',
            "right-top"     : 'right-bottom',
            "right-bottom"  : 'right-top',
            "right-center"  : 'right-center'
        },
        'xy': {
            "bottom-left"   : 'top-right',
            "bottom-right"  : 'top-left',
            "bottom-center" : 'top-center',
            "top-left"      : 'bottom-right',
            "top-right"     : 'bottom-left',
            "top-center"    : 'bottom-center',
            "left-top"      : 'right-bottom',
            "left-bottom"   : 'right-top',
            "left-center"   : 'right-center',
            "right-top"     : 'left-bottom',
            "right-bottom"  : 'left-top',
            "right-center"  : 'left-center'
        }
    };

    NG.component('dropdown', {

        defaults: {
           'mode'            : 'hover',
           'pos'             : 'bottom-left',
           'offset'          : -1,
           'remaintime'      : 800,
           'justify'         : false,
           'boundary'        : NG.$win,
           'delay'           : 0,
           'dropdownSelector': '.ng-dropdown,.ng-dropdown-blank',
           'hoverDelayIdle'  : 250,
           'preventflip'     : false
        },

        remainIdle: false,

        boot: function() {

            var triggerevent = NG.support.touch ? "click" : "mouseenter";

            // init code
            NG.$html.on(triggerevent+".dropdown.ngkit", "[data-ng-dropdown]", function(e) {

                var ele = NG.$(this);

                if (!ele.data("dropdown")) {

                    var dropdown = NG.dropdown(ele, NG.Utils.options(ele.attr("data-ng-dropdown")));

                    if (triggerevent=="click" || (triggerevent=="mouseenter" && dropdown.options.mode=="hover")) {
                        dropdown.element.trigger(triggerevent);
                    }

                    if (dropdown.element.find(dropdown.options.dropdownSelector).length) {
                        e.preventDefault();
                    }
                }
            });
        },

        init: function() {

            var $this = this;

            this.dropdown     = this.find(this.options.dropdownSelector);
            this.offsetParent = this.dropdown.parents().filter(function() {
                return NG.$.inArray(NG.$(this).css('position'), ['relative', 'fixed', 'absolute']) !== -1;
            }).slice(0,1);

            this.centered  = this.dropdown.hasClass('ng-dropdown-center');
            this.justified = this.options.justify ? NG.$(this.options.justify) : false;

            this.boundary  = NG.$(this.options.boundary);

            if (!this.boundary.length) {
                this.boundary = NG.$win;
            }

            // legacy DEPRECATED!
            if (this.dropdown.hasClass('ng-dropdown-up')) {
                this.options.pos = 'top-left';
            }
            if (this.dropdown.hasClass('ng-dropdown-flip')) {
                this.options.pos = this.options.pos.replace('left','right');
            }
            if (this.dropdown.hasClass('ng-dropdown-center')) {
                this.options.pos = this.options.pos.replace(/(left|right)/,'center');
            }
            //-- end legacy

            // Init ARIA
            this.element.attr('aria-haspopup', 'true');
            this.element.attr('aria-expanded', this.element.hasClass("ng-open"));

            if (this.options.mode == "click" || NG.support.touch) {

                this.on("click.ng.dropdown", function(e) {

                    var $target = NG.$(e.target);

                    if (!$target.parents($this.options.dropdownSelector).length) {

                        if ($target.is("a[href='#']") || $target.parent().is("a[href='#']") || ($this.dropdown.length && !$this.dropdown.is(":visible")) ){
                            e.preventDefault();
                        }

                        $target.blur();
                    }

                    if (!$this.element.hasClass('ng-open')) {

                        $this.show();

                    } else {

                        if (!$this.dropdown.find(e.target).length || $target.is(".ng-dropdown-close") || $target.parents(".ng-dropdown-close").length) {
                            $this.hide();
                        }
                    }
                });

            } else {

                this.on("mouseenter", function(e) {

                    $this.trigger('pointerenter.ng.dropdown', [$this]);

                    if ($this.remainIdle) {
                        clearTimeout($this.remainIdle);
                    }

                    if (hoverIdle) {
                        clearTimeout(hoverIdle);
                    }

                    if (active && active == $this) {
                        return;
                    }

                    // pseudo manuAim
                    if (active && active != $this) {

                        hoverIdle = setTimeout(function() {
                            hoverIdle = setTimeout($this.show.bind($this), $this.options.delay);
                        }, $this.options.hoverDelayIdle);

                    } else {

                        hoverIdle = setTimeout($this.show.bind($this), $this.options.delay);
                    }

                }).on("mouseleave", function() {

                    if (hoverIdle) {
                        clearTimeout(hoverIdle);
                    }

                    $this.remainIdle = setTimeout(function() {
                        if (active && active == $this) $this.hide();
                    }, $this.options.remaintime);

                    $this.trigger('pointerleave.ng.dropdown', [$this]);

                }).on("click", function(e){

                    var $target = NG.$(e.target);

                    if ($this.remainIdle) {
                        clearTimeout($this.remainIdle);
                    }

                    if (active && active == $this) {
                        if (!$this.dropdown.find(e.target).length || $target.is(".ng-dropdown-close") || $target.parents(".ng-dropdown-close").length) {
                            $this.hide();
                        }
                        return;
                    }

                    if ($target.is("a[href='#']") || $target.parent().is("a[href='#']")){
                        e.preventDefault();
                    }

                    $this.show();
                });
            }
        },

        show: function(){

            NG.$html.off("click.outer.dropdown");

            if (active && active != this) {
                active.hide(true);
            }

            if (hoverIdle) {
                clearTimeout(hoverIdle);
            }

            this.trigger('beforeshow.ng.dropdown', [this]);

            this.checkDimensions();
            this.element.addClass('ng-open');

            // Update ARIA
            this.element.attr('aria-expanded', 'true');

            this.trigger('show.ng.dropdown', [this]);

            NG.Utils.checkDisplay(this.dropdown, true);
            active = this;

            this.registerOuterClick();
        },

        hide: function(force) {

            this.trigger('beforehide.ng.dropdown', [this, force]);

            this.element.removeClass('ng-open');

            if (this.remainIdle) {
                clearTimeout(this.remainIdle);
            }

            this.remainIdle = false;

            // Update ARIA
            this.element.attr('aria-expanded', 'false');

            this.trigger('hide.ng.dropdown', [this, force]);

            if (active == this) active = false;
        },

        registerOuterClick: function(){

            var $this = this;

            NG.$html.off("click.outer.dropdown");

            setTimeout(function() {

                NG.$html.on("click.outer.dropdown", function(e) {

                    if (hoverIdle) {
                        clearTimeout(hoverIdle);
                    }

                    var $target = NG.$(e.target);

                    if (active == $this && !$this.element.find(e.target).length) {
                        $this.hide(true);
                        NG.$html.off("click.outer.dropdown");
                    }
                });
            }, 10);
        },

        checkDimensions: function() {

            if (!this.dropdown.length) return;

            // reset
            this.dropdown.removeClass('ng-dropdown-top ng-dropdown-bottom ng-dropdown-left ng-dropdown-right ng-dropdown-stack').css({
                'top-left':'',
                'left':'',
                'margin-left' :'',
                'margin-right':''
            });

            if (this.justified && this.justified.length) {
                this.dropdown.css("min-width", "");
            }

            var $this          = this,
                pos            = NG.$.extend({}, this.offsetParent.offset(), {width: this.offsetParent[0].offsetWidth, height: this.offsetParent[0].offsetHeight}),
                posoffset      = this.options.offset,
                dropdown       = this.dropdown,
                offset         = dropdown.show().offset() || {left: 0, top: 0},
                width          = dropdown.outerWidth(),
                height         = dropdown.outerHeight(),
                boundarywidth  = this.boundary.width(),
                boundaryoffset = this.boundary[0] !== window && this.boundary.offset() ? this.boundary.offset(): {top:0, left:0},
                dpos           = this.options.pos;

            var variants =  {
                    "bottom-left"   : {top: 0 + pos.height + posoffset, left: 0},
                    "bottom-right"  : {top: 0 + pos.height + posoffset, left: 0 + pos.width - width},
                    "bottom-center" : {top: 0 + pos.height + posoffset, left: 0 + pos.width / 2 - width / 2},
                    "top-left"      : {top: 0 - height - posoffset, left: 0},
                    "top-right"     : {top: 0 - height - posoffset, left: 0 + pos.width - width},
                    "top-center"    : {top: 0 - height - posoffset, left: 0 + pos.width / 2 - width / 2},
                    "left-top"      : {top: 0, left: 0 - width - posoffset},
                    "left-bottom"   : {top: 0 + pos.height - height, left: 0 - width - posoffset},
                    "left-center"   : {top: 0 + pos.height / 2 - height / 2, left: 0 - width - posoffset},
                    "right-top"     : {top: 0, left: 0 + pos.width + posoffset},
                    "right-bottom"  : {top: 0 + pos.height - height, left: 0 + pos.width + posoffset},
                    "right-center"  : {top: 0 + pos.height / 2 - height / 2, left: 0 + pos.width + posoffset}
                },
                css = {},
                pp;

            pp = dpos.split('-');
            css = variants[dpos] ? variants[dpos] : variants['bottom-left'];

            // justify dropdown
            if (this.justified && this.justified.length) {
                justify(dropdown.css({left:0}), this.justified, boundarywidth);
            } else {

                if (this.options.preventflip !== true) {

                    var fdpos;

                    switch(this.checkBoundary(pos.left + css.left, pos.top + css.top, width, height, boundarywidth)) {
                        case "x":
                            if(this.options.preventflip !=='x') fdpos = flips['x'][dpos] || 'right-top';
                            break;
                        case "y":
                            if(this.options.preventflip !=='y') fdpos = flips['y'][dpos] || 'top-left';
                            break;
                        case "xy":
                            if(!this.options.preventflip) fdpos = flips['xy'][dpos] || 'right-bottom';
                            break;
                    }

                    if (fdpos) {

                        pp  = fdpos.split('-');
                        css = variants[fdpos] ? variants[fdpos] : variants['bottom-left'];

                        // check flipped
                        if (this.checkBoundary(pos.left + css.left, pos.top + css.top, width, height, boundarywidth)) {
                            pp  = dpos.split('-');
                            css = variants[dpos] ? variants[dpos] : variants['bottom-left'];
                        }
                    }
                }
            }

            if (width > boundarywidth) {
                dropdown.addClass("ng-dropdown-stack");
                this.trigger('stack.ng.dropdown', [this]);
            }

            dropdown.css(css).css("display", "").addClass('ng-dropdown-'+pp[0]);
        },

        checkBoundary: function(left, top, width, height, boundarywidth) {

            var axis = "";

            if (left < 0 || ((left - NG.$win.scrollLeft())+width) > boundarywidth) {
               axis += "x";
            }

            if ((top - NG.$win.scrollTop()) < 0 || ((top - NG.$win.scrollTop())+height) > window.innerHeight) {
               axis += "y";
            }

            return axis;
        }
    });


    NG.component('dropdownOverlay', {

        defaults: {
           'justify' : false,
           'cls'     : '',
           'duration': 200
        },

        boot: function() {

            // init code
            NG.ready(function(context) {

                NG.$("[data-ng-dropdown-overlay]", context).each(function() {
                    var ele = NG.$(this);

                    if (!ele.data("dropdownOverlay")) {
                        NG.dropdownOverlay(ele, NG.Utils.options(ele.attr("data-ng-dropdown-overlay")));
                    }
                });
            });
        },

        init: function() {

            var $this = this;

            this.justified = this.options.justify ? NG.$(this.options.justify) : false;
            this.overlay   = this.element.find('ng-dropdown-overlay');

            if (!this.overlay.length) {
                this.overlay = NG.$('<div class="ng-dropdown-overlay"></div>').appendTo(this.element);
            }

            this.overlay.addClass(this.options.cls);

            this.on({

                'beforeshow.ng.dropdown': function(e, dropdown) {
                    $this.dropdown = dropdown;

                    if ($this.justified && $this.justified.length) {
                        justify($this.overlay.css({'display':'block', 'margin-left':'','margin-right':''}), $this.justified, $this.justified.outerWidth());
                    }
                },

                'show.ng.dropdown': function(e, dropdown) {

                    var h = $this.dropdown.dropdown.outerHeight(true);

                    $this.dropdown.element.removeClass('ng-open');

                    $this.overlay.stop().css('display', 'block').animate({height: h}, $this.options.duration, function() {

                       $this.dropdown.dropdown.css('visibility', '');
                       $this.dropdown.element.addClass('ng-open');

                       NG.Utils.checkDisplay($this.dropdown.dropdown, true);
                    });

                    $this.pointerleave = false;
                },

                'hide.ng.dropdown': function() {
                    $this.overlay.stop().animate({height: 0}, $this.options.duration);
                },

                'pointerenter.ng.dropdown': function(e, dropdown) {
                    clearTimeout($this.remainIdle);
                },

                'pointerleave.ng.dropdown': function(e, dropdown) {
                    $this.pointerleave = true;
                }
            });


            this.overlay.on({

                'mouseenter': function() {
                    if ($this.remainIdle) {
                        clearTimeout($this.dropdown.remainIdle);
                        clearTimeout($this.remainIdle);
                    }
                },

                'mouseleave': function(){

                    if ($this.pointerleave && active) {

                        $this.remainIdle = setTimeout(function() {
                           if(active) active.hide();
                        }, active.options.remaintime);
                    }
                }
            });
        }

    });


    function justify(ele, justifyTo, boundarywidth, offset) {

        ele           = NG.$(ele);
        justifyTo     = NG.$(justifyTo);
        boundarywidth = boundarywidth || window.innerWidth;
        offset        = offset || ele.offset();

        if (justifyTo.length) {

            var jwidth = justifyTo.outerWidth();

            ele.css("min-width", jwidth);

            if (NG.langdirection == 'right') {

                var right1   = boundarywidth - (justifyTo.offset().left + jwidth),
                    right2   = boundarywidth - (ele.offset().left + ele.outerWidth());

                ele.css("margin-right", right1 - right2);

            } else {
                ele.css("margin-left", justifyTo.offset().left - offset.left);
            }
        }
    }

})(NGkit);
