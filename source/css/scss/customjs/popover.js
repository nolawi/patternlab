(function($, NG, $win) {
    'use strict';

    var Popover = function(element, options) {
        this.options =
            this.enabled =
            this.timeout =
            this.hoverState =
            this.element = null;

        this.init(element, options);
    };

    Popover.defaults = {
        animation: true,
        placement: 'auto right',
        markup: '<div class="ng-popover"><div class="ng-arrow"></div><a href="#" class="ng-close ng-float-right"></a><div class="ng-popover-content"></div></div>',
        contentTarget: '.ng-popover-content',
        template: '{{value}}',
        source: '',
        param: '',
        value: '',
        datatype: 'json',
        trigger: 'hover focus',
        delay: 0,
        container: false,
        renderer: false,
        viewport: {
            selector: 'body',
            padding: 0
        }
    };

    $.extend(Popover.prototype, {
        init: function(element, options) {
            this.element = $(element);
            this.enabled = true;
            this.options = this.getOptions(options);
            this.$viewport = this.options.viewport && $(this.options.viewport.selector || this.options.viewport);
            var triggers = this.options.trigger.split(' ');

            for (var i = triggers.length; i--;) {
                var trigger = triggers[i];

                if (trigger == 'click' || NG.support.touch) {
                    this.element.on('click.popover.ngkit', $.proxy(this.toggle, this));
                } else if (trigger != 'manual') {
                    var eventIn = trigger == 'hover' ? 'mouseenter' : 'focusin';
                    var eventOut = trigger == 'hover' ? 'mouseleave' : 'focusout';

                    this.element.on(eventIn + '.popover.ngkit', $.proxy(this.enter, this));
                    this.element.on(eventOut + '.popover.ngkit', $.proxy(this.leave, this));
                }
                this.element.on('show.popover.ngkit', $.proxy(this.enter, this));
                this.element.on('hide.popover.ngkit', $.proxy(this.leave, this));
            }
            // If the template is an ID selector, get it
            if (this.options.template.length && this.options.template[0] === '#') {
                this.template = NG.Utils.template($(this.options.template).html());
            } else {
                this.template = NG.Utils.template(this.options.template);
            }

            this.element.data('popover', this);
        },

        getDefaults: function() {
            return Popover.defaults;
        },

        getOptions: function(options) {
            options = $.extend({}, this.getDefaults(), this.element.data(), options);

            if (options.delay && typeof options.delay == 'number') {
                options.delay = {
                    show: options.delay,
                    hide: options.delay
                };
            }

            return options;
        },

        enter: function(obj) {
            var self = null;
            if (obj instanceof this.constructor) {
                self = obj;
            } else {
                self = $(obj.currentTarget).data('popover');
            }

            clearTimeout(self.timeout);

            self.hoverState = 'in';

            if (!self.options.delay || !self.options.delay.show) return self.show();

            self.timeout = setTimeout(function() {
                if (self.hoverState == 'in') self.show();
            }, self.options.delay.show);
        },

        leave: function(obj) {
            var self = null;
            if (obj instanceof this.constructor) {
                self = obj;
            } else {
                self = $(obj.currentTarget).data('popover');
            }

            clearTimeout(self.timeout);

            self.hoverState = 'out';

            if (!self.options.delay || !self.options.delay.hide) return self.hide();

            self.timeout = setTimeout(function() {
                if (self.hoverState == 'out') self.hide();
            }, self.options.delay.hide);
        },

        show: function() {
            // var e = $.Event('show.popover.ngkit'),
                var $this = this;
            if (this.hasContent() && this.enabled) {
                // this.element.trigger(e);

                // if (e.isDefaultPrevented()) return;

                var $popover = this.popover();

                this.setContent();

                if (this.options.animation) $popover.addClass('fade');

                $popover
                    .detach()
                    .css({
                        top: 0,
                        left: 0,
                        display: 'block'
                    });

                if (this.options.container) {
                    $popover.appendTo(this.options.container);
                } else {
                    $popover.insertAfter(this.element);
                }
                this.position();

                $popover.on('click', '.ng-close', function(e) {
                    var $target = $(e.target);
                    if ($target.is("a[href='#']") || $target.parent().is("a[href='#']")){
                        e.preventDefault();
                    }
                    $this.hide();
                });

            }
        },

        hide: function() {
            var that = this;
            var $popover = this.popover();
            // var e = $.Event('hide.popover.ngkit');

            function complete() {
                if (that.hoverState != 'in') $popover.detach();
                // that.element.trigger('hide.popover.ngkit');
            }

            // this.element.trigger(e);

            // if (e.isDefaultPrevented()) return;

            $popover.removeClass('in');

            if ($.support.transition && this.$popover.hasClass('fade')) {
                $popover
                    .one($.support.transition.end, complete)
                    .emulateTransitionEnd(150);
            } else {
                complete();
            }

            this.hoverState = null;

            return this;
        },

        position: function() {
            var that = this;
            var pos = this.getPosition();
            var $popover = this.popover();
            var actualWidth = $popover[0].offsetWidth;
            var actualHeight = $popover[0].offsetHeight;
            var placement = typeof this.options.placement == 'function' ?
                this.options.placement.call(this, $popover[0], this.element[0]) :
                this.options.placement;

            var autoToken = /\s?auto?\s?/i;
            var autoPlace = autoToken.test(placement);
            if (autoPlace) placement = placement.replace(autoToken, '') || 'top';

            if (autoPlace) {
                var orgPlacement = placement;
                var $parent = this.element.parent();
                var parentDim = this.getPosition($parent);
                placement = placement == 'bottom' && pos.top + pos.height + actualHeight - parentDim.scroll > parentDim.height ? 'top' :
                    placement == 'top' && pos.top - parentDim.scroll - actualHeight < 0 ? 'bottom' :
                    placement == 'right' && pos.right + actualWidth > parentDim.right ? 'left' :
                    placement == 'left' && pos.left - actualWidth < parentDim.left ? 'right' :
                    placement;
            }
            $popover.addClass(placement);

            var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight);

            this.applyPlacement(calculatedOffset, placement);
            this.hoverState = null;

            var complete = function() {
                that.element.trigger('shown.popover.ngkit');
            };

            if ($.support.transition && this.$popover.hasClass('fade')) {
                $popover
                    .one($.support.transition.end, complete)
                    .emulateTransitionEnd(150);
            } else {
                complete();
            }

        },

        applyPlacement: function(offset, placement) {
            var $popover = this.popover();
            var width = $popover[0].offsetWidth;
            var height = $popover[0].offsetHeight;

            // manually read margins because getBoundingClientRect includes difference
            var marginTop = parseInt($popover.css('margin-top'), 10);
            var marginLeft = parseInt($popover.css('margin-left'), 10);

            // we must check for NaN for ie 8/9
            if (isNaN(marginTop)) marginTop = 0;
            if (isNaN(marginLeft)) marginLeft = 0;

            offset.top = offset.top + marginTop;
            offset.left = offset.left + marginLeft;

            // $.fn.offset doesn't round pixel values
            // so we use setOffset directly with our own function B-0
            $.offset.setOffset($popover[0], $.extend({
                using: function(props) {
                    $popover.css({
                        top: Math.round(props.top),
                        left: Math.round(props.left)
                    });
                }
            }, offset), 0);

            $popover.addClass('in');

            // check to see if placing popover in new offset caused the popover to resize itself
            var actualWidth = $popover[0].offsetWidth;
            var actualHeight = $popover[0].offsetHeight;

            if (placement == 'top' && actualHeight != height) {
                offset.top = offset.top + height - actualHeight;
            }

            var delta = this.getViewportAdjustedDelta(placement, offset, actualWidth, actualHeight);
            if (delta.left) offset.left += delta.left;
            else offset.top += delta.top;

            var arrowDelta = delta.left ? delta.left * 2 - width + actualWidth : delta.top * 2 - height + actualHeight;
            var arrowPosition = delta.left ? 'left' : 'top';
            var arrowOffsetPosition = delta.left ? 'offsetWidth' : 'offsetHeight';

            $popover.offset(offset);
            this.replaceArrow(arrowDelta, $popover[0][arrowOffsetPosition], arrowPosition);
        },

        replaceArrow: function(delta, dimension, position) {
            this.arrow().css(position, delta ? (50 * (1 - delta / dimension) + '%') : '');
        },

        setContent: function() {
            var $popover = this.popover();
            var value = this.getValue();
            $popover.find(this.options.contentTarget)['html'](value);
            $popover.removeClass('fade in top bottom left right');
        },

        hasContent: function() {
            return this.getValue();
        },

        getPosition: function($element) {
            $element = $element || this.element;
            var el = $element[0];
            var isBody = el.tagName == 'BODY';
            var clientRect = (typeof el.getBoundingClientRect == 'function') ? el.getBoundingClientRect() : null;
            return $.extend({}, clientRect, {
                scroll: isBody ? document.documentElement.scrollTop || document.body.scrollTop : $element.scrollTop(),
                width: isBody ? $(window).width() : $element.outerWidth(),
                height: isBody ? $(window).height() : $element.outerHeight()
            }, isBody ? {
                top: 0,
                left: 0
            } : $element.offset());
        },

        getCalculatedOffset: function(placement, pos, actualWidth, actualHeight) {
            return placement == 'bottom' ? {
                top: pos.top + pos.height,
                left: pos.left + pos.width / 2 - actualWidth / 2
            } :
                placement == 'top' ? {
                    top: pos.top - actualHeight,
                    left: pos.left + pos.width / 2 - actualWidth / 2
            } :
                placement == 'left' ? {
                    top: pos.top + pos.height / 2 - actualHeight / 2,
                    left: pos.left - actualWidth
            } :
            /* placement == 'right' */
            {
                top: pos.top + pos.height / 2 - actualHeight / 2,
                left: pos.left + pos.width
            };

        },

        getViewportAdjustedDelta: function(placement, pos, actualWidth, actualHeight) {
            var delta = {
                top: 0,
                left: 0
            };
            if (!this.$viewport) return delta;

            var viewportPadding = this.options.viewport && this.options.viewport.padding || 0;
            var viewportDimensions = this.getPosition(this.$viewport);

            if (/right|left/.test(placement)) {
                var topEdgeOffset = pos.top - viewportPadding - viewportDimensions.scroll;
                var bottomEdgeOffset = pos.top + viewportPadding - viewportDimensions.scroll + actualHeight;
                if (topEdgeOffset < viewportDimensions.top) { // top overflow
                    delta.top = viewportDimensions.top - topEdgeOffset;
                } else if (bottomEdgeOffset > viewportDimensions.top + viewportDimensions.height) { // bottom overflow
                    delta.top = viewportDimensions.top + viewportDimensions.height - bottomEdgeOffset;
                }
            } else {
                var leftEdgeOffset = pos.left - viewportPadding;
                var rightEdgeOffset = pos.left + viewportPadding + actualWidth;
                if (leftEdgeOffset < viewportDimensions.left) { // left overflow
                    delta.left = viewportDimensions.left - leftEdgeOffset;
                } else if (rightEdgeOffset > viewportDimensions.width) { // right overflow
                    delta.left = viewportDimensions.left + viewportDimensions.width - rightEdgeOffset;
                }
            }

            return delta;
        },

        getValue: function() {
            var $this = this,
                html = '',
                release = function(data) {
                    var html = '';
                    if (data !== null && typeof data !== 'undefined') {
                        if (typeof data == 'object') {
                            html = $this.render(data);
                        } else {
                            html = $this.render({
                                value: data
                            });
                        }
                    }
                    $this.element.removeClass($this.options.loadingClass);
                    return html;
                };

            this.element.addClass(this.options.loadingClass);

            switch (typeof(this.options.source)) {
                case 'function':
                    html = this.options.source.apply(this, [release]);
                    break;

                case 'object':
                    if (this.options.source.length) {
                        var items = [];

                        this.options.source.forEach(function(item) {
                            var searchvalue = $this.options.value || "";
                            if (item.value && item.value.toLowerCase().indexOf(searchvalue.toLowerCase()) != -1) {
                                items.push(item);
                                return false;
                            }
                        });

                        html = release(items[0]);
                    }
                    break;

                case 'string':
                    if (!this.options.source.length) {
                        html = release(this.options.value);
                        break;
                    }
                    var params = {};

                    params[this.options.param] = this.options.value;

                    $.ajax({
                        url: this.options.source,
                        data: params,
                        type: this.options.method,
                        dataType: this.options.datatype,
                        complete: function(xhr) {
                            var result = release(xhr.responseJSON || []);
                            $this.popover().find($this.options.contentTarget)['html'](result);
                            $this.position();
                        }
                    });
                    html = "Loading...";
                    break;

                default:
                    html = release(this.options.value);
            }
            return html;

        },

        render: function(data) {
            var $this = this;
            var html = "";

            if (this.options.renderer) {
                html = this.options.renderer.apply(this, [data]);
            } else {
                html = this.template(data);
            }
            return html;
        },

        popover: function() {
            return this.$popover = this.$popover || $(this.options.markup);
        },

        arrow: function() {
            return this.$arrow = this.$arrow || this.popover().find('.ng-arrow');
        },

        validate: function() {
            if (!this.element[0].parentNode) {
                this.hide();
                this.element = null;
                this.options = null;
            }
        },

        enable: function() {
            this.enabled = true;
        },

        disable: function() {
            this.enabled = false;
        },

        toggleEnabled: function() {
            this.enabled = !this.enabled;
        },

        toggle: function(e) {
            var self = e ? $(e.currentTarget).data('popover') : this;
            if (self.popover().hasClass('in')) {
                self.leave(self);
            } else {
                self.enter(self);
            }
        },

        destroy: function() {
            clearTimeout(this.timeout);
            this.hide().element.off('.' + this.type).removeData('popover');
        }
    });

    NG["popover"] = Popover;
    // init code
    NG.$doc.on("mouseenter.popover.ngkit focus.popover.ngkit", "[data-ng-popover]", function(e) {
        var ele = $(this);

        if (!ele.data("popover")) {
            var obj = new Popover(ele, NG.Utils.options(ele.attr("data-ng-popover")));
            ele.trigger("mouseenter");
        }
    });

})(jQuery, jQuery.NGkit, jQuery(window));
