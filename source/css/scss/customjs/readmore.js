/*!
 * @preserve
 *
 * Adapted from Readmore.js jQuery plugin
 * Author: @jed_foster
 * Project home: http://jedfoster.github.io/Readmore.js
 * Licensed under the MIT license
 *
 * Debounce function from http://davidwalsh.name/javascript-debounce-function
 */

/* global jQuery */

(function(addon) {

    var component;

    if (jQuery && jQuery.NGkit) {
        component = addon(jQuery, jQuery.NGkit);
    }

    if (typeof define == "function" && define.amd) {
        define("ngkit-cover", ["ngkit"], function(){
            return component || addon(jQuery, jQuery.NGkit);
        });
    }

})(function($, NG){
    'use strict';

    NG.component('readmore', {
        readmore: 'readmore',
        defaults: {
            speed: 100,
            collapsedHeight: 200,
            heightMargin: 16,
            moreLink: '<a href="#">Read More</a>',
            lessLink: '<a href="#">Close</a>',
            embedCSS: true,
            blockCSS: 'display: block; width: 100%;',
            startOpen: false,

            // callbacks
            beforeToggle: function(){},
            afterToggle: function(){}
        },
        cssEmbedded: {},
        uniqueIdCounter: 0,

        uniqueId: function(prefix) {
            var id = ++this.uniqueIdCounter;
            if (typeof prefix == 'undefined') prefix = 'ngrm-';
            return String(prefix === null ? 'ngrm-' : prefix) + id;
        },

        setBoxHeights: function() {
            var el = $(this.element).clone().css({
                  height: 'auto',
                  width: $(this.element).width(),
                  maxHeight: 'none',
                  overflow: 'hidden'
                }).insertAfter(this.element),
                cssMaxHeight = parseInt(el.css({maxHeight: ''}).css('max-height').replace(/[^-\d\.]/g, ''), 10),
                defaultHeight = this.defaultHeight;

            this.expandedHeight = el.outerHeight();
            el.remove();

            if (!cssMaxHeight) {
                this.collapsedHeight = defaultHeight;
            } else if (cssMaxHeight > this.collapsedHeight) {
                this.collapsedHeight = cssMaxHeight;
            }
            this.maxHeight = cssMaxHeight;

            // and disable any `max-height` property set in CSS
            $(this.element).css({
                maxHeight: 'none'
            });
        }, // setBoxHeights

        init: function() {
            var $this = this,
                $element = this.element;
            this.defaultHeight = this.options.collapsedHeight;
            this.collapsedHeight = this.options.collapsedHeight;
            this.heightMargin = this.options.heightMargin;

            this.element.data('readmore', this);

            $(this.element).addClass('ng-readmore');

            this._defaults = this.options.defaults;
            this._name = this.options.readmore;

            $this.setBoxHeights();

            if ($element.outerHeight(true) <= this.collapsedHeight + this.heightMargin) {
              // The block is shorter than the limit, so there's no need to truncate it.
              return true;
            } else {
                var id = $element.attr('id') || $this.uniqueId(),
                    useLink = $this.options.startOpen ? $this.options.lessLink : $this.options.moreLink;

                $element.attr({
                    'aria-expanded': false,
                    'id': id
                });

                $element.after($(useLink)
                    .on('click', function(event) { $this.toggle(this, $this.element[0], event); })
                    .attr({
                        'class': 'ng-readmore-toggle',
                        'data-ng-readmore-toggle': '',
                        'aria-controls': id
                    })
                );
                if (! $this.options.startOpen) {
                    $element.css({
                        height: this.collapsedHeight
                    });
                }
            }

            $(window).on({
                "resize": function(e) {$this.checksize();},
                "orientationchange": function(e) {$this.checksize();}
            });
        }, // init

        checksize: NG.Utils.debounce(function() {
              var isExpanded = this.element.attr('aria-expanded') === 'true';

              this.setBoxHeights();

              this.element.css({
                height: isExpanded ? this.expandedHeight : this.collapsedHeight
              });
          }, 100),

        toggle: function(trigger, element, event) {
            if (event) {
                event.preventDefault();
            }
            if (! trigger) {
                trigger = $('[aria-controls="' + this.element.id + '"]')[0];
            }

            if (! element) {
                element = this.element;
            }

            var $this = this,
                $element = $(element),
                newHeight = '',
                newLink = '',
                expanded = false,
                collapsedHeight = this.collapsedHeight;

            if ($element.height() <= collapsedHeight) {
                newHeight = this.expandedHeight + 'px';
                newLink = 'lessLink';
                expanded = true;
            } else {
                newHeight = collapsedHeight + 'px';
                newLink = 'moreLink';
            }

            // Fire beforeToggle callback
            // Since we determined the new "expanded" state above we're now out of sync
            // with our true current state, so we need to flip the value of `expanded`
            $this.options.beforeToggle(trigger, element, ! expanded);

            $element.css({'height': newHeight});

            // Fire afterToggle callback
            $element.on('transitionend', function() {
                $this.options.afterToggle(trigger, element, expanded);

                $(this).attr({
                    'aria-expanded': expanded
                }).off('transitionend');
            });

            $(trigger).replaceWith($($this.options[newLink])
                .on('click', function(event) { $this.toggle(this, element, event); })
                .attr({
                  'data-ng-readmore-toggle': '',
                  'aria-controls': $element.attr('id')
                })
            );
        },  // toggle

        destroy: function() {
            $(this.element).each(function() {
                var current = $(this);

                current.attr({
                    'data-ng-readmore': null,
                    'aria-expanded': null
                }).css({
                    maxHeight: '',
                    height: ''
                }).next('[data-ng-readmore-toggle]')
                  .remove();

                current.removeData();
            });  // this.element.each
        }  // destroy
    }); // NG.component

    $(document).ready(function() {
        $('[data-ng-readmore]').each(function() {
            var current = $(this);

            if(!current.data("readmore")){
                var opts = NG.Utils.options(current.attr("data-ng-readmore"));
                var obj = NG.readmore(current, opts);
                // obj.setBoxHeights(current);
                current.css({
                    height: opts.startOpen ? opts.expandedHeight : opts.collapsedHeight
                });
            }
        });
    });
});

