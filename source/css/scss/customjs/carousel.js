/* Based on http://www.baijs.com/tinycarousel */

(function(addon) {

    var component;

    if (jQuery && jQuery.NGkit) {
        component = addon(jQuery, jQuery.NGkit);
    }

    if (typeof define == "function" && define.amd) {
        define("ngkit-carousel", ["ngkit"], function(){
            return component || addon(jQuery, jQuery.NGkit);
        });
    }

})(function($, NG) {

    "use strict";

    NG.component('carousel', {

        defaults: {
            start:          0,      // The starting slide
            axis:           "x",    // vertical or horizontal scroller? ( x || y ).
            buttons:        true,   // show left and right navigation buttons.
            bullets:        true,   // is there a page number navigation present?
            interval:       true,   // move to another block on intervals.
            intervalTime:   5000,   // interval time in milliseconds.
            animation:      true,   // false is instant, true is animate.
            animationTime:  500,    // how fast must the animation move in ms?
            infinite:       true,   // infinite carousel.
            viewportSelector: ".viewport:first",
            overviewSelector: ".overview:first",
            nextSelector:   ".next:first",
            prevSelector:   ".prev:first",
            bulletSelector: ".pager > li > a"
        },

        init: function() {
            var $container = this.element,
                $this = this;
            this.viewport = $container.find(this.options.viewportSelector);
            this.overview = $container.find(this.options.overviewSelector);
            this.next     = $container.on("click", this.options.nextSelector, function(e) {
                e.preventDefault();
                this.move(++this.slideIndex);
            });
            this.prev     = $container.on("click", this.options.prevSelector, function(e) {
                e.preventDefault();
                this.move(--this.slideIndex);
            });
            this.bullets  = $container.find(this.options.bulletSelector);

            this.slides        = 0;
            this.viewportSize  = 0;
            this.contentStyle  = {};
            this.slidesVisible = 0;
            this.slideSize     = 0;
            this.slideIndex    = 0;
            this.isHorizontal  = this.options.axis === 'x';
            this.sizeLabel     = this.isHorizontal ? "Width" : "Height";
            this.posiLabel     = this.isHorizontal ? "left" : "top";
            this.intervalTimer = null;
            this.slideCurrent  = 0;
            this.slidesTotal   = 0;

            this.update();
            this.move(this.slideCurrent);


            // $(window).resize(this.update);

            if(this.options.bullets) {
                this.bullets.click(function(e){
                    e.preventDefault();
                    $this.stop();
                    $this.move(parseInt($(this).attr("rel"), 10) - 1);
                });
            }
            this.start();
        },

        update: function(e) {
            // this.overview.find(".mirrored").remove();
            if (typeof(this.overview) == "undefined") {
                console.log(this);
            }
            this.slides        = this.overview.children();
            this.viewportSize  = this.viewport[0]["offset" + this.sizeLabel];
            this.slideSize     = this.slides.first()["outer" + this.sizeLabel](true);
            this.slidesTotal   = this.slides.length;
            this.slideCurrent  = this.options.start || 0;
            this.slidesVisible = Math.ceil(this.viewportSize / this.slideSize);

            this.overview.append(this.slides.slice(0, this.slidesVisible).clone().addClass("mirrored"));
            this.overview.css(this.sizeLabel.toLowerCase(), this.slideSize * (this.slidesTotal + this.slidesVisible));

            return this;
        },

        start: function() {
            if(this.options.interval) {
                var $this = this;
                clearInterval(this.intervalTimer);

                this.intervalTimer = setInterval(function() {
                    $this.move(++$this.slideIndex);
                }, this.options.intervalTime);
            }

            return this;
        },

        stop: function() {
            clearInterval(this.intervalTimer);
            return this;
        },

        move: function(index) {
            var $this = this;
            this.slideIndex   = index;
            this.slideCurrent = this.slideIndex % this.slidesTotal;

            if(this.slideIndex < 0) {
                this.slideCurrent = this.slideIndex = this.slidesTotal - 1;
                this.overview.css(this.posiLabel, -(this.slidesTotal) * this.slideSize);
            }

            if(this.slideIndex > this.slidesTotal) {
                this.slideCurrent = this.slideIndex = 1;
                this.overview.css(this.posiLabel, 0);
            }

            this.contentStyle[this.posiLabel] = -this.slideIndex * this.slideSize;

            this.overview.animate(
                this.contentStyle,
                {
                    queue    : false,
                    duration : this.options.animation ? this.options.animationTime : 0,
                    always : function() {
                        $this.trigger("move", [$this.slides[$this.slideCurrent], $this.slideCurrent]);
                    }
            });

            this.setButtons();
            //this.start();

            return this;
        },

        setButtons: function() {
            if(this.options.buttons && !this.options.infinite) {
                this.prev.toggleClass("disable", this.slideCurrent <= 0);
                this.next.toggleClass("disable", this.slideCurrent >= this.slidesTotal - this.slidesVisible);
            }

            if(this.options.bullets) {
                this.bullets.removeClass("ng-active");
                $(this.bullets[this.slideCurrent]).addClass("ng-active");
            }
        }
    });

    NG.ready(function(context) {
        $("[data-ng-carousel]", context).each(function() {
            var obj;
            if (!$(this).data("carousel")) {
                obj = NG.carousel($(this), NG.Utils.options($(this).attr("data-ng-carousel")));
            }
        });
    });
});
