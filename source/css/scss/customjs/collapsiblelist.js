/*

Based on CollapsibleLists.js

An object allowing lists to dynamically expand and collapse

Created by Stephen Morley - http://code.stephenmorley.org/ - and released under
the terms of the CC0 1.0 Universal legal code:

http://creativecommons.org/publicdomain/zero/1.0/legalcode

*/


// collapsiblelist
(function(addon) {

    var component;

    if (jQuery && jQuery.NGkit) {
        component = addon(jQuery, jQuery.NGkit);
    }

    if (typeof define == "function" && define.amd) {
        define("ngkit-collapsiblelist", ["ngkit"], function(){
            return component || addon(jQuery, jQuery.NGkit);
        });
    }

})(function($, NG){

    NG.component('collapsiblelist', {

        defaults: {
            recurse: true,

        },

        // Methods
        init: function() {
            var $this   = this;
            this.applyTo(this.element, !this.options.recurse);
        },
        /* Makes the specified list collapsible. The parameters are:
        *
        * node         - the list element
        * doNotRecurse - true if sub-lists should not be made collapsible
        */
        applyTo: function(node, doNotRecurse){
            // loop over the list items within this node
            var lis = node.find('li');
            for (var index = 0; index < lis.length; index ++){

                // check whether this list item should be collapsible
                if (!doNotRecurse || node == lis[index].parentNode){

                    // prevent text from being selected unintentionally
                    if (lis[index].addEventListener){
                        lis[index].addEventListener(
                            'mousedown', function (e){ e.preventDefault(); }, false);
                    } else {
                      lis[index].attachEvent(
                            'onselectstart', function(){ event.returnValue = false; });
                    }

                    // add the click listener
                    if (lis[index].addEventListener){
                        lis[index].addEventListener(
                            'click', this.createClickListener(lis[index]), false);
                    } else {
                        lis[index].attachEvent(
                            'onclick', this.createClickListener(lis[index]));
                    }

                    // close the unordered lists within this list item
                    this.toggle(lis[index]);
                }
            }
        },

        /* Returns a function that toggles the display status of any unordered
         * list elements within the specified node. The parameter is:
         *
         * node - the node containing the unordered list elements
         */
        createClickListener: function(node) {
            var $this = this;

            // return the function
            return function(e){
                // ensure the event object is defined
                if (!e) e = window.event;

                // find the list item containing the target of the event
                var li = (e.target ? e.target : e.srcElement);
                while (li.nodeName != 'LI') li = li.parentNode;

                // toggle the state of the node if it was the target of the event
                if (li == node) $this.toggle(node);

            };
        },

        /* Opens or closes the unordered list elements directly within the
         * specified node. The parameter is:
         *
         * node - the node containing the unordered list elements
         */
        toggle: function(node) {
            // determine whether to open or close the unordered lists
            var open = $(node).hasClass('ng-closed'),
                index, li;

            // loop over the unordered list elements with the node
            var uls = $(node).find('ul,ol');
            for (index = 0; index < uls.length; index ++){
                // find the parent list item of this unordered list
                li = uls[index];
                while (li.nodeName != 'LI') li = li.parentNode;

                // style the unordered list if it is directly within this node
                if (li == node) uls[index].style.display = (open ? 'block' : 'none');
            }
            // remove the current class from the node
            node.className =
                node.className.replace(
                    /(^| )ng-(open|closed)( |$)/, '');

            // if the node contains unordered lists, set its class
            if (uls.length > 0){
                node.className += ' ng-' + (open ? 'open' : 'closed');
            }
        }

    });

    // init code
    NG.ready(function(context) {
        $("[data-ng-collapsiblelist]", context).each(function() {
            var ele = $(this);
            if (!ele.data("collapsiblelist")) {
                var obj = NG.collapsiblelist(ele, NG.Utils.options(ele.attr("data-ng-collapsiblelist")));
            }
        });
    });

    return NG.collapsiblelist;
});