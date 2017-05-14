jQuery(function(){
    var hash = location.hash.substr(1);
    console.log("In hash...");
    if(hash && hash == "contact"){
        console.log("found hash...");
        var target = jQuery("[name='contact']").closest(".ng-accordion-large");
        console.log("found target...", target);
        setTimeout(function(){
            $(target).click();
        },350);
    }
});
