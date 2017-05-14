(function(NG) {

    "use strict";

    var grids = [];

    NG.component('gridMatchHeight', {

        defaults: {
            "target" : false,
            "row"    : true
        },

        boot: function() {

            // init code
            NG.ready(function(context) {

                NG.$("[data-ng-grid-match]", context).each(function() {
                    var grid = NG.$(this), obj;

                    if (!grid.data("gridMatchHeight")) {
                        obj = NG.gridMatchHeight(grid, NG.Utils.options(grid.attr("data-ng-grid-match")));
                    }
                });
            });
        },

        init: function() {

            var $this = this;

            this.columns  = this.element.children();
            this.elements = this.options.target ? this.find(this.options.target) : this.columns;

            if (!this.columns.length) return;

            NG.$win.on('load resize orientationchange', (function() {

                var fn = function() {
                    $this.match();
                };

                NG.$(function() { fn(); });

                return NG.Utils.debounce(fn, 50);
            })());

            NG.$html.on("changed.ng.dom", function(e) {
                $this.columns  = $this.element.children();
                $this.elements = $this.options.target ? $this.find($this.options.target) : $this.columns;
                $this.match();
            });

            this.on("display.ng.check", function(e) {
                if(this.element.is(":visible")) this.match();
            }.bind(this));

            grids.push(this);
        },

        match: function() {

            var firstvisible = this.columns.filter(":visible:first");

            if (!firstvisible.length) return;

            var stacked = Math.ceil(100 * parseFloat(firstvisible.css('width')) / parseFloat(firstvisible.parent().css('width'))) >= 100;

            if (stacked) {
                this.revert();
            } else {
                NG.Utils.matchHeights(this.elements, this.options);
            }

            return this;
        },

        revert: function() {
            this.elements.css('min-height', '');
            return this;
        }
    });

    NG.component('gridMargin', {

        defaults: {
            "cls": "ng-grid-margin"
        },

        boot: function() {

            // init code
            NG.ready(function(context) {

                NG.$("[data-ng-grid-margin]", context).each(function() {
                    var grid = NG.$(this), obj;

                    if (!grid.data("gridMargin")) {
                        obj = NG.gridMargin(grid, NG.Utils.options(grid.attr("data-ng-grid-margin")));
                    }
                });
            });
        },

        init: function() {

            var stackMargin = NG.stackMargin(this.element, this.options);
        }
    });

    // helper

    NG.Utils.matchHeights = function(elements, options) {

        elements = NG.$(elements).css('min-height', '');
        options  = NG.$.extend({ row : true }, options);

        var matchHeights = function(group){

            if(group.length < 2) return;

            var max = 0;

            group.each(function() {
                max = Math.max(max, NG.$(this).outerHeight());
            }).each(function() {

                var element = NG.$(this),
                height  = max - (element.outerHeight() - element.height());

                element.css('min-height', height + 1 + 'px');
            });
        };

        if(options.row) {

            elements.first().width(); // force redraw

            setTimeout(function(){

                var lastoffset = false, group = [];

                elements.each(function() {

                    var ele = NG.$(this), offset = ele.offset().top;

                    if(offset != lastoffset && group.length) {

                        matchHeights(NG.$(group));
                        group  = [];
                        offset = ele.offset().top;
                    }

                    group.push(ele);
                    lastoffset = offset;
                });

                if(group.length) {
                    matchHeights(NG.$(group));
                }

            }, 0);

        } else {
            matchHeights(elements);
        }
    };

})(NGkit);
