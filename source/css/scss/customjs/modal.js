(function(NG) {

    "use strict";

    var active = false, activeCount = 0, $html = NG.$html, body;

    NG.$win.on("resize orientationchange", NG.Utils.debounce(function(){
        NG.$('.ng-modal.ng-open').each(function(){
            NG.$(this).data('modal').resize();
        });
    }, 150));

    NG.component('modal', {

        defaults: {
            keyboard: true,
            bgclose: true,
            minScrollHeight: 150,
            center: false,
            modal: true
        },

        scrollable: false,
        transition: false,
        hasTransitioned: true,

        init: function() {

            if (!body) body = NG.$('body');

            if (!this.element.length) return;

            var $this = this;

            this.paddingdir = "padding-" + (NG.langdirection == 'left' ? "right":"left");
            this.dialog     = this.find(".ng-modal-dialog");

            this.active     = false;

            // Update ARIA
            this.element.attr('aria-hidden', this.element.hasClass("ng-open"));

            this.on("click", ".ng-modal-close", function(e) {
                e.preventDefault();
                $this.hide();
            }).on("click", function(e) {

                var target = NG.$(e.target);

                if (target[0] == $this.element[0] && $this.options.bgclose) {
                    $this.hide();
                }
            });

            NG.domObserve(this.element, function(e) { $this.resize(); });
        },

        toggle: function() {
            return this[this.isActive() ? "hide" : "show"]();
        },

        show: function() {

            if (!this.element.length) return;

            var $this = this;

            if (this.isActive()) return;

            if (this.options.modal && active) {
                active.hide(true);
            }

            this.element.removeClass("ng-open").show();
            this.resize(true);

            if (this.options.modal) {
                active = this;
            }

            this.active = true;

            activeCount++;

            if (NG.support.transition) {
                this.hasTransitioned = false;
                this.element.one(NG.support.transition.end, function(){
                    $this.hasTransitioned = true;
                }).addClass("ng-open");
            } else {
                this.element.addClass("ng-open");
            }

            $html.addClass("ng-modal-page").height(); // force browser engine redraw

            // Update ARIA
            this.element.attr('aria-hidden', 'false');

            this.element.trigger("show.ng.modal");

            NG.Utils.checkDisplay(this.dialog, true);

            return this;
        },

        hide: function(force) {

            if (!force && NG.support.transition && this.hasTransitioned) {

                var $this = this;

                this.one(NG.support.transition.end, function() {
                    $this._hide();
                }).removeClass("ng-open");

            } else {

                this._hide();
            }

            return this;
        },

        resize: function(force) {

            if (!this.isActive() && !force) return;

            var bodywidth  = body.width();

            this.scrollbarwidth = window.innerWidth - bodywidth;

            body.css(this.paddingdir, this.scrollbarwidth);

            this.element.css('overflow-y', this.scrollbarwidth ? 'scroll' : 'auto');

            if (!this.updateScrollable() && this.options.center) {

                var dh  = this.dialog.outerHeight(),
                pad = parseInt(this.dialog.css('margin-top'), 10) + parseInt(this.dialog.css('margin-bottom'), 10);

                if ((dh + pad) < window.innerHeight) {
                    this.dialog.css({'top': (window.innerHeight/2 - dh/2) - pad });
                } else {
                    this.dialog.css({'top': ''});
                }
            }
        },

        updateScrollable: function() {

            // has scrollable?
            var scrollable = this.dialog.find('.ng-overflow-container:visible:first');

            if (scrollable.length) {

                scrollable.css('height', 0);

                var offset = Math.abs(parseInt(this.dialog.css('margin-top'), 10)),
                dh     = this.dialog.outerHeight(),
                wh     = window.innerHeight,
                h      = wh - 2*(offset < 20 ? 20:offset) - dh;

                scrollable.css({
                    'max-height': (h < this.options.minScrollHeight ? '':h),
                    'height':''
                });

                return true;
            }

            return false;
        },

        _hide: function() {

            this.active = false;
            if (activeCount > 0) activeCount--;
            else activeCount = 0;

            this.element.hide().removeClass('ng-open');

            // Update ARIA
            this.element.attr('aria-hidden', 'true');

            if (!activeCount) {
                $html.removeClass('ng-modal-page');
                body.css(this.paddingdir, "");
            }

            if (active===this) active = false;

            this.trigger('hide.ng.modal');
        },

        isActive: function() {
            return this.element.hasClass('ng-open');
        }

    });

    NG.component('modalTrigger', {

        boot: function() {

            // init code
            NG.$html.on("click.modal.ngkit", "[data-ng-modal]", function(e) {

                var ele = NG.$(this);

                if (ele.is("a")) {
                    e.preventDefault();
                }

                if (!ele.data("modalTrigger")) {
                    var modal = NG.modalTrigger(ele, NG.Utils.options(ele.attr("data-ng-modal")));
                    modal.show();
                }

            });

            // close modal on esc button
            NG.$html.on('keydown.modal.ngkit', function (e) {

                if (active && e.keyCode === 27 && active.options.keyboard) { // ESC
                    e.preventDefault();
                    active.hide();
                }
            });
        },

        init: function() {

            var $this = this;

            this.options = NG.$.extend({
                "target": $this.element.is("a") ? $this.element.attr("href") : false
            }, this.options);

            this.modal = NG.modal(this.options.target, this.options);

            this.on("click", function(e) {
                e.preventDefault();
                $this.show();
            });

            //methods
            this.proxy(this.modal, "show hide isActive");
        }
    });

    NG.modal.dialog = function(content, options) {

        var modal = NG.modal(NG.$(NG.modal.dialog.template).appendTo("body"), options);

        modal.on("hide.ng.modal", function(){
            if (modal.persist) {
                modal.persist.appendTo(modal.persist.data("modalPersistParent"));
                modal.persist = false;
            }
            modal.element.remove();
        });

        setContent(content, modal);

        return modal;
    };

    NG.modal.dialog.template = '<div class="ng-modal"><div class="ng-modal-dialog" style="min-height:0;"></div></div>';

    NG.modal.alert = function(content, options) {

        options = NG.$.extend(true, {bgclose:false, keyboard:false, modal:false, labels:NG.modal.labels}, options);

        var modal = NG.modal.dialog(([
            '<div class="ng-margin ng-modal-content">'+String(content)+'</div>',
            '<div class="ng-modal-footer ng-text-right"><button class="ng-button ng-button-primary ng-modal-close">'+options.labels.Ok+'</button></div>'
        ]).join(""), options);

        modal.on('show.ng.modal', function(){
            setTimeout(function(){
                modal.element.find('button:first').focus();
            }, 50);
        });

        return modal.show();
    };

    NG.modal.confirm = function(content, onconfirm, oncancel) {

        var options = arguments.length > 1 && arguments[arguments.length-1] ? arguments[arguments.length-1] : {};

        onconfirm = NG.$.isFunction(onconfirm) ? onconfirm : function(){};
        oncancel  = NG.$.isFunction(oncancel) ? oncancel : function(){};
        options   = NG.$.extend(true, {bgclose:false, keyboard:false, modal:false, labels:NG.modal.labels}, NG.$.isFunction(options) ? {}:options);

        var modal = NG.modal.dialog(([
            '<div class="ng-margin ng-modal-content">'+String(content)+'</div>',
            '<div class="ng-modal-footer ng-text-right"><button class="ng-button js-modal-confirm-cancel">'+options.labels.Cancel+'</button> <button class="ng-button ng-button-primary js-modal-confirm">'+options.labels.Ok+'</button></div>'
        ]).join(""), options);

        modal.element.find(".js-modal-confirm, .js-modal-confirm-cancel").on("click", function(){
            if (NG.$(this).is('.js-modal-confirm')) {
                onconfirm();
            } else {
                oncancel();
            }
            modal.hide();
        });

        modal.on('show.ng.modal', function(){
            setTimeout(function(){
                modal.element.find('.js-modal-confirm').focus();
            }, 50);
        });

        return modal.show();
    };

    NG.modal.prompt = function(text, value, onsubmit, options) {

        onsubmit = NG.$.isFunction(onsubmit) ? onsubmit : function(value){};
        options  = NG.$.extend(true, {bgclose:false, keyboard:false, modal:false, labels:NG.modal.labels}, options);

        var modal = NG.modal.dialog(([
            text ? '<div class="ng-modal-content ng-form">'+String(text)+'</div>':'',
            '<div class="ng-margin-small-top ng-modal-content ng-form"><p><input type="text" class="ng-width-1-1"></p></div>',
            '<div class="ng-modal-footer ng-text-right"><button class="ng-button ng-modal-close">'+options.labels.Cancel+'</button> <button class="ng-button ng-button-primary js-modal-ok">'+options.labels.Ok+'</button></div>'
        ]).join(""), options),

        input = modal.element.find("input[type='text']").val(value || '').on('keyup', function(e){
            if (e.keyCode == 13) {
                modal.element.find(".js-modal-ok").trigger('click');
            }
        });

        modal.element.find(".js-modal-ok").on("click", function(){
            if (onsubmit(input.val())!==false){
                modal.hide();
            }
        });

        modal.on('show.ng.modal', function(){
            setTimeout(function(){
                input.focus();
            }, 50);
        });

        return modal.show();
    };

    NG.modal.blockNG = function(content, options) {

        var modal = NG.modal.dialog(([
            '<div class="ng-margin ng-modal-content">'+String(content || '<div class="ng-text-center">...</div>')+'</div>'
        ]).join(""), NG.$.extend({bgclose:false, keyboard:false, modal:false}, options));

        modal.content = modal.element.find('.ng-modal-content:first');

        return modal.show();
    };


    NG.modal.labels = {
        'Ok': 'Ok',
        'Cancel': 'Cancel'
    };


    // helper functions
    function setContent(content, modal){

        if(!modal) return;

        if (typeof content === 'object') {

            // convert DOM object to a jQuery object
            content = content instanceof jQuery ? content : NG.$(content);

            if(content.parent().length) {
                modal.persist = content;
                modal.persist.data("modalPersistParent", content.parent());
            }
        }else if (typeof content === 'string' || typeof content === 'number') {
                // just insert the data as innerHTML
                content = NG.$('<div></div>').html(content);
        }else {
                // unsupported data type!
                content = NG.$('<div></div>').html('NGkit.modal Error: Unsupported data type: ' + typeof content);
        }

        content.appendTo(modal.element.find('.ng-modal-dialog'));

        return modal;
    }

})(NGkit);
