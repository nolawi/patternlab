/* Based off of autocomplete, instead of putting results in a dropdown,
   it puts them into a panel
*/
(function(addon) {

    if (typeof define == "function" && define.amd) { // AMD
        define("ngkit-filter", ["ngkit"], function(){
            return jQuery.NGkit.filter || addon(window, window.jQuery, window.jQuery.NGkit);
        });
    }

    if(window && window.jQuery && window.jQuery.NGkit) {
        addon(window, window.jQuery, window.jQuery.NGkit);
    }

})(function(global, $, NG){

    var Filter = function(element, options) {

        var $this = this, $element = $(element);

        if($element.data("filter")) return;

        this.options = $.extend({}, Filter.defaults, options);
        this.element = $element;

        this.filterTarget = $element.find('.ng-filter-target');
        this.template = $element.find('script[type="text/filter"]').html();
        this.template = NG.Utils.template(this.template || this.options.template);
        this.input    = $element.find("input:first").attr("filter", "off");
        this.filterPicker = $element.find('.ng-filter-picker');

        this.element.data("filter", this);

        if (!this.filterTarget.length) {
           this.filterTarget = $('<div class="ng-panel ng-scrollable-box ng-filter-target"></div>').appendTo($element);
        }

        this.init();
    };

    $.extend(Filter.prototype, {

        value    : null,
        selected : null,

        init: function() {

            var $this   = this,
                select  = true,
                trigger = NG.Utils.debounce(function(e) {
                    if(select) {
                        return (select = false);
                    }
                    $this.trigger();
                }, this.options.delay);

            this.input.on({
                "keyup": trigger
            });

            this.filterPicker.on("click", "a", function(){
                $this.select($(this));
            });

            this.request();
        },

        trigger: function() {

            var $this = this, old = this.value;

            this.value = this.input.val();
            if (this.value.length === 0) {
                $this.request();
            }
            if (this.value.length < this.options.minLength) return this;

            if (this.value != old) {
                $this.request();
            }

            return this;
        },


        select: function(item) {
            var data = item.data();

            this.element.trigger("filter-select", [data, this]);

            if (data.value) {
                this.input.val(data.value);
            }

            this.trigger();
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
                                var searchvalue = $this.value || "";
                                if(item.value && item.value.toLowerCase().indexOf(searchvalue.toLowerCase())!=-1) {
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

            this.filterTarget.empty();

            if (this.options.renderer) {

                this.options.renderer.apply(this, [data]);

            } else {

                this.filterTarget.append(this.template({"items":data}));
            }

            return this;
        }
    });

    Filter.defaults = {
        minLength: 1,
        param: 'search',
        method: 'get',
        delay: 300,
        loadingClass: 'ng-loading',
        source: null,
        renderer: null,

        // template

        template :['<ul class="ng-list ng-list-striped ng-filter-results">',
                   '    {{#items && items.length}}',
                   '        {{~items}}',
                   '            <li data-value="{{$item.value}}">',
                   '                <a href="{{$item.html_url}}">{{$item.value}}</a>',
                   '            </li>',
                   '        {{/items}}',
                   '    {{/end}}',
                   '    {{^items.length}}',
                   '        <li>No results found.</li>',
                   '    {{/items.length}}',
                   '</ul>'].join('\n')
    };

    NG["filter"] = Filter;

    // init code
    NG.ready(function(context) {
        $("[data-ng-filter]", context).each(function() {
            var ele = $(this);
            if (!ele.data("filter")) {
                var obj = new Filter(ele, NG.Utils.options(ele.attr("data-ng-filter")));
            }
        });
    });

    return Filter;
});
