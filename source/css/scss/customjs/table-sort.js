(function(addon) {

    var component;

    if (jQuery && jQuery.NGkit) {
        component = addon(jQuery, jQuery.NGkit);
    }

    if (typeof define == "function" && define.amd) {
        define("ngkit-tablesort", ["ngkit"], function(){
            return component || addon(jQuery, jQuery.NGkit);
        });
    }

})(function($, NG){

    /**
     * jQuery.fn.sortElements
     * --------------
     * @author James Padolsey (http://james.padolsey.com)
     * @version 0.11
     * @updated 18-MAR-2010
     * --------------
     * @param Function comparator:
     *   Exactly the same behaviour as [1,2,3].sort(comparator)
     *
     * @param Function getSortable
     *   A function that should return the element that is
     *   to be sorted. The comparator will run on the
     *   current collection, but you may want the actual
     *   resulting sort to occur on a parent or another
     *   associated element.
     *
     *   E.g. $('td').sortElements(comparator, function(){
     *      return this.parentNode;
     *   })
     *
     *   The <td>'s parent (<tr>) will be sorted instead
     *   of the <td> itself.
     */

    $.fn.sortElements = (function(){

        var sort = [].sort;

        return function(comparator, getSortable) {

            getSortable = getSortable || function(){return this;};

            var placements = this.map(function(){

                var sortElement = getSortable.call(this),
                    parentNode = sortElement.parentNode,

                    // Since the element itself will change position, we have
                    // to have some way of storing it's original position in
                    // the DOM. The easiest way is to have a 'flag' node:
                    nextSibling = parentNode.insertBefore(
                        document.createTextNode(''),
                        sortElement.nextSibling
                    );

                return function() {

                    if (parentNode === this) {
                        throw new Error(
                            "You can't sort elements if any one is a descendant of another."
                        );
                    }

                    // Insert before flag:
                    parentNode.insertBefore(this, nextSibling);
                    // Remove flag:
                    parentNode.removeChild(nextSibling);

                };

            });

            return sort.call(this, comparator).each(function(i){
                placements[i].call(getSortable.call(this));
            });

        };

    })();

    NG.component('tablesort', {

        defaults: {
            headSelector: '.ng-sortable',
            highlightColumn: true
        },

        // Methods
        init: function() {
            var $this   = this;

            this.element.find(this.options.headSelector).each(function(){
                $(this).click(function(e) {
                    var th = $(this),
                        index = th.index(),
                        sorted = th.hasClass('ng-sorted-desc') || th.hasClass('ng-sorted-asc'),
                        descending = th.hasClass('ng-sorted-desc');

                    $this.element.find($this.options.headSelector).removeClass('ng-sorted-desc ng-sorted-asc');

                    if (sorted) {
                        if (descending){
                            th.addClass('ng-sorted-asc');
                            descending = false;
                        } else {
                            th.addClass('ng-sorted-desc');
                            descending = true;
                        }
                    } else {
                        th.addClass("ng-sorted-asc");
                        descending = false;
                    }
                    if ($this.options.highlightColumn) {
                        $this.element.find('td').removeClass('ng-sorted');
                    }
                    $this.element.find('td').filter(function(){
                        //find the TDs that are the same index as the TH
                        //only return the td's that are indexed the same as one
                        if ($this.options.highlightColumn && $(this).index() === index) {
                            $(this).addClass('ng-sorted');
                        }
                        return $(this).index() === index;

                    }).sortElements(function(a, b){
                        return $.text([a]).toUpperCase() > $.text([b]).toUpperCase() ? descending ? -1 : 1 : descending ? 1 : -1;
                    }, function(){
                        // parentNode is the element we want to move
                        return this.parentNode;
                    });
                });
            });
        }
    });

    // init code
    NG.ready(function(context) {
        $("[data-ng-tablesort]", context).each(function() {
            var ele = $(this);
            if (!ele.data("tablesort")) {
                var obj = NG.tablesort(ele, NG.Utils.options(ele.attr("data-ng-tablesort")));
            }
        });
    });

    return NG.tablesort;
});