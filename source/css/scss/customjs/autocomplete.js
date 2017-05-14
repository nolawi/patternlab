(function(addon) {

    var component;

    if (jQuery && jQuery.NGkit) {
        component = addon(jQuery, jQuery.NGkit);
    }

    if (typeof define == "function" && define.amd) {
        define("ngkit-autocomplete", ["ngkit"], function(){
            return component || addon(jQuery, jQuery.NGkit);
        });
    }

})(function($, NG){

    "use strict";

    var active;

    NG.component('autocomplete', {

        defaults: {
            minLength: 3,
            param: 'search',
            method: 'get',
            delay: 300,
            loadingClass: 'ng-loading',
            flipDropdown: false,
            skipClass: 'ng-skip',
            hoverClass: 'ng-active',
            source: null,
            renderer: null,

            // template

            template: '<ul class="ng-nav ng-nav-autocomplete ng-autocomplete-results">{{~items}}<li data-value="{{$item.value}}"><a>{{$item.value}}</a></li>{{/items}}</ul>'
        },

        visible  : false,
        value    : null,
        selected : null,

        init: function() {

            var $this   = this,
                select  = false,
                trigger = NG.Utils.debounce(function(e) {
                    if(select) {
                        return (select = false);
                    }
                    $this.handle();
                }, this.options.delay);


            this.dropdown = this.find('.ng-dropdown');
            this.template = this.find('script[type="text/autocomplete"]').html();
            this.template = NG.Utils.template(this.template || this.options.template);
            this.input    = this.find("input:first").attr("autocomplete", "off");

            if (!this.dropdown.length) {
               this.dropdown = $('<div class="ng-dropdown"></div>').appendTo(this.element);
            }

            if (this.options.flipDropdown) {
                this.dropdown.addClass('ng-dropdown-flip');
            }

            this.input.on({
                "keydown": function(e) {

                    if (e && e.which && !e.shiftKey) {

                        switch (e.which) {
                            case 13: // enter
                                select = true;

                                if ($this.selected && $this.visible){
                                    e.preventDefault();
                                    $this.select();
                                }
                                break;
                            case 38: // up
                                e.preventDefault();
                                $this.pick('prev', true);
                                break;
                            case 40: // down
                                e.preventDefault();
                                $this.pick('next', true);
                                break;
                            case 27:
                            case 9: // esc, tab
                                $this.hide();
                                break;
                            default:
                                break;
                        }
                    }

                },
                "keyup": trigger,
                "blur": function(e) {
                    setTimeout(function() { $this.hide(); }, 200);
                }
            });

            this.dropdown.on("click", ".ng-autocomplete-results > *", function(){
                $this.select();
            });

            this.dropdown.on("mouseover", ".ng-autocomplete-results > *", function(){
                $this.pick($(this));
            });

            this.triggercomplete = trigger;
        },

        handle: function() {

            var $this = this, old = this.value;

            this.value = this.input.val();

            if (this.value.length < this.options.minLength) return this.hide();

            if (this.value != old) {
                $this.request();
            }

            return this;
        },

        pick: function(item, scrollinview) {

            var $this    = this,
                items    = this.dropdown.find('.ng-autocomplete-results').children(':not(.'+this.options.skipClass+')'),
                selected = false;

            if (typeof item !== "string" && !item.hasClass(this.options.skipClass)) {
                selected = item;
            } else if (item == 'next' || item == 'prev') {

                if (this.selected) {
                    var index = items.index(this.selected);

                    if (item == 'next') {
                        selected = items.eq(index + 1 < items.length ? index + 1 : 0);
                    } else {
                        selected = items.eq(index - 1 < 0 ? items.length - 1 : index - 1);
                    }

                } else {
                    selected = items[(item == 'next') ? 'first' : 'last']();
                }
            }

            if (selected && selected.length) {
                this.selected = selected;
                items.removeClass(this.options.hoverClass);
                this.selected.addClass(this.options.hoverClass);

                // jump to selected if not in view
                if (scrollinview) {

                    var top       = selected.position().top,
                        scrollTop = $this.dropdown.scrollTop(),
                        dpheight  = $this.dropdown.height();

                    if (top > dpheight ||  top < 0) {
                        $this.dropdown.scrollTop(scrollTop + top);
                    }
                }
            }
        },

        select: function() {

            if(!this.selected) return;

            var data = this.selected.data();

            this.element.trigger("ng.autocomplete.select", [data, this]);

            if (data.value) {
                this.input.val(data.value);
            }

            this.hide();
        },

        show: function() {
            if (this.visible) return;
            this.visible = true;
            this.element.addClass("ng-open");

            active = this;
            return this;
        },

        hide: function() {
            if (!this.visible) return;
            this.visible = false;
            this.element.removeClass("ng-open");

            if (active === this) {
                active = false;
            }

            return this;
        },

        request: function() {

            var $this   = this,
                release = function(data) {

                    if(data) {
                        $this.render(data);
                    }

                    $this.element.removeClass($this.options.loadingClass);
                };

            this.element.addClass(this.options.loadingClass);

            if (this.options.source) {

                var source = this.options.source;

                switch(typeof(this.options.source)) {
                    case 'function':

                        this.options.source.apply(this, [release]);

                        break;

                    case 'object':

                        if(source.length) {

                            var items = [];

                            source.forEach(function(item){
                                if(item.value && item.value.toLowerCase().indexOf($this.value.toLowerCase())!=-1) {
                                    items.push(item);
                                }
                            });

                            release(items);
                        }

                        break;

                    case 'string':

                        var params ={};

                        params[this.options.param] = this.value;

                        $.ajax({
                            url: this.options.source,
                            data: params,
                            type: this.options.method,
                            dataType: 'json',
                            complete: function(xhr) {
                                release(xhr.responseJSON || $.parseJSON(xhr.responseText) || []);
                            }
                        });

                        break;

                    default:
                        release(null);
                }

            } else {
                this.element.removeClass($this.options.loadingClass);
            }
        },

        render: function(data) {

            var $this = this;

            this.dropdown.empty();

            this.selected = false;

            if (this.options.renderer) {

                this.options.renderer.apply(this, [data]);

            } else if(data && data.length) {

                this.dropdown.append(this.template({"items":data}));
                this.show();

                this.trigger('ng.autocomplete.show');
            }

            return this;
        }
    });

    // init code
    NG.$html.on("focus.autocomplete.ngkit", "[data-ng-autocomplete]", function(e) {

        var ele = $(this);

        if (!ele.data("autocomplete")) {
            var obj = NG.autocomplete(ele, NG.Utils.options(ele.attr("data-ng-autocomplete")));
        }
    });

    // register outer click for autocompletes
    NG.$html.on("click.autocomplete.ngkit", function(e){
        if (active && e.target!=active.input[0]) active.hide();
    });

    return NG.autocomplete;
});
