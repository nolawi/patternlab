(function(global, $, NG){

    var FacetValue = function(element, filter, options) {
        // This is a value within a facet
        var $this = this, $element = $(element);
        if($element.data("facetvalue")) return;

        this.options  = $.extend({}, FacetValue.defaults, options);
        this.filter = filter;
        this.inputId = $element.data("input-id");
        this.inputName = $element.data("input-name");
        this.inputValue = $element.data("input-value");
        this.value = $($element.find('a')[0].lastChild).text();
        this.element  = $element.on("click", function(e) {
            e.preventDefault();
            var disabled = $element.data("input-disabled");
            if(disabled) return;
            $this.hide(e);
        });
        this.element.data("facetvalue", this);
    };
    FacetValue.defaults = {
        cls: 'ng-hidden',
        submitOnChange: true
    };
    $.extend(FacetValue.prototype, {
        show: function(e) {
            $(this.element[0]).removeClass(this.options.cls);
            if (this.filter.form) {
                $("#" + this.inputId).remove();
                $.event.trigger({
                    type:"ng.facetfilter.change",
                    message: "showing " + this.element[0],
                    time: new Date(),
                    form: this.filter.form});
                if (this.options.submitOnChange) this.filter.form.submit();
            }
        },

        hide: function(e) {
            this.filter.addValue(this);
            $(this.element[0]).addClass(this.options.cls);
            if (this.filter.form) {
                var html = $('<input id="' + this.inputId + '" name="' +
                    this.inputName + '" value="' + this.inputValue + '" type="hidden" />');
                this.filter.form.append(html);
                $.event.trigger({
                    type:"ng.facetfilter.change",
                    message: "hiding " + this.element[0],
                    time: new Date(),
                    form: this.filter.form});
                if (this.options.submitOnChange) this.filter.form.submit();
            }
        }
    });

    var FacetSelectedValue = function(element, original, options) {
        // Created when a FacetValue is clicked on
        var $this = this, $element = $(element);

        if($element.data("facetselectedvalue")) return;

        this.options  = $.extend({}, FacetValue.defaults, options);
        this.original = original;
        this.element  = $element.on("click", function(e) {
            e.preventDefault();
            $this.hide(e);
        });
        this.element.data("facetselectedvalue", this);
    };
    FacetSelectedValue.defaults = {
    };
    $.extend(FacetSelectedValue.prototype, {
        hide: function(e) {
            this.original.show(e);
            this.element.remove();
        }
    });

    var FacetFilter = function(element, options) {
        var $this = this, $element = $(element);
        if($element.data("facetfilter")) return;

        this.options  = $.extend({}, FacetFilter.defaults, options);
        this.currentFilters = $element.find(".ng-current-filters");
        this.form = $(this.options.formtarget);
        this.element = $element;
        this.element.data("facetfilter", this);
    };

    $.extend(FacetFilter.prototype, {
        addValue: function(obj) {
            var html_str = '<span class="ng-selected-facet" data-ng-original-id="facet_' +
                            obj.inputId + '">' +
                           '<a data-input-id="' + obj.inputId + '" data-input-name="' +
                           obj.inputName + '" data-input-value="' + obj.inputValue +
                           '" class="ng-pill-button ng-button-primary" href="">' +
                           '<i class="ng-icon-times"></i> ' + obj.value +
                           '</a></span>';
            var html = $(html_str);
            var selectedValue = this.currentFilters.append(html);
            var fsv = new FacetSelectedValue(html[0], obj);
        }
    });

    FacetFilter.defaults = {
        target: '.ng-facet-filter',
        siblings: false,
        cls: 'ng-hidden',
        formtarget: '#filterform'
    };

    var initializeFacetFilter = function() {
        var ele = $(this), filter, obj;
        if (!ele.data("facetfilter")) {
            filter = new FacetFilter(ele, NG.Utils.options(ele.attr("data-ng-facetfilter")));
        } else {
            filter = ele.data("facetfilter");
        }

        $.each(ele.find('.ng-facet-value'), function(index, item){
            if (!$(item).data("facetvalue")) {
                obj = new FacetValue($(item), filter, NG.Utils.options(ele.attr("data-ng-facetfilter")));
            }
        });

        $.each(ele.find('.ng-selected-facet'), function(index, item){
            if (!$(item).data("facetselectedvalue")) {
                var orig_selector = "#" + $(item).attr('data-ng-original-id');
                obj = new FacetSelectedValue(
                    $(item),
                    $(orig_selector).data('facetvalue'),
                    NG.Utils.options(ele.attr("data-ng-facetfilter")));
            }
        });
    };

    NG["facetfilter"] = FacetFilter;
    NG["facetfilterinitialize"] = initializeFacetFilter;

    NG.ready(function(context) {

        $("[data-ng-facetfilter]", context).each(initializeFacetFilter);

    });

})(this, jQuery, jQuery.NGkit);
