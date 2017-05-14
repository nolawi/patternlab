(function($, NG){

    "use strict";

    var Definition = function(element, options) {
        var $this = this,
            $element = $(element),
            widget;

        if($element.data("definition")) return;

        this.options = options;
        this.element = $element;
        this.word = $element.text().toLowerCase();
        this.options.value = this.word;
        this.element.data("definition", this);
        
        // For mobile sizes, load up a Modal Dialogue, else load up a popover.
        if (NG.$win.width() < 768) {
            $element.click(function() {

                var modal_template = '<a class="ng-modal-close ng-close ng-float-right" href="#"></a>' +
                                     '<div class="ng-modal-content ng-margin-remove">' +  
                                        '<p><span class="ng-text-bold">{{value}}</span> {{ phonetic }}</p>' +
                                        '<hr class="ng-hr ng-hr-small">' +
                                        '<p class="ng-text-italic ng-margin-bottom-remove">{{ partofspeech }}</p>' +
                                        '<p class="ng-margin-top-remove">{{{ definition }}}</p>' +
                                        '{{#encyclopedia}}' +
                                        '<hr class="ng-hr ng-hr-small">' +
                                        '<p>Read more in the <a href="{{{ encyclopedia }}}">NG Education Encyclopedia <i class="ng-icon-angle-double-right"></i></a></p>' +
                                        '{{/encyclopedia}}' +
                                     '</div>';
                
                
                options = NG.$.extend(true, {bgclose:false, keyboard:false, modal:false, labels:NG.modal.labels}, options);
                
                // This gets the right layout and look but has no content.
                var ng_template = NG.Utils.template(modal_template);
                
                // The clicked "word", for which we need to find the definition, word-type, etc...
                var word = $element.text().toLowerCase();
                if (options.source.length) {
                    var items = [];
                    // look through all option key/pairs for the one that matches this word.
                    options.source.forEach(function(item) {
                        var searchvalue = word || "";
                        if (item.value && item.value.toLowerCase().indexOf(searchvalue.toLowerCase()) != -1) {
                            items.push(item);
                            return false;
                        }
                    });
                    // render template w/ found context + show the modal result.
                    var html = ng_template(items[0]);
                    widget = NG.modal.dialog(html, options);
                    widget.show();
                }
            });
        } else {
            widget = new NG['popover']($element, options);    
        }
    };

    Definition.defaults = {
        selector: ".tipHelp",
        placement: 'auto top',
        trigger: 'click',
        source: null,
        template: '<a class="ng-close" href="#"></a><div class="ng-panel" style="min-width: 200px">' +
            '<p><span class="ng-text-bold">{{value}}</span> {{ phonetic }}</p>' +
            '<hr class="ng-hr ng-hr-small">' +
            '<p class="ng-text-italic ng-margin-bottom-remove">{{ partofspeech }}</p>' +
            '<p class="ng-margin-top-remove">{{{ definition }}}</p>' +
            '{{#encyclopedia}}' +
            '<hr class="ng-hr ng-hr-small">' +
            '<p>Read more in the <a href="{{{ encyclopedia }}}">NG Education Encyclopedia <i class="ng-icon-angle-double-right"></i></a></p>' +
            '{{/encyclopedia}}' +
            '</div>'
    };

    Definition.initialize = function(options) {
        var localoptions = $.extend({}, Definition.defaults, options);
        $(localoptions.selector).each(function() {
            var $this = $(this), obj;

            $.each($this, function(index, item){
                if (!$(item).data("definition")) {
                    obj = new Definition($(item), localoptions);
                }
            });
        });
    };

    NG["definition"] = Definition;

})(jQuery, jQuery.NGkit);
