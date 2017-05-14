
/**
 * See templates/educms/plugins/container.html to note the data attributes being applied.
 */
$(document).on("refreshParallax", function(){
    if($("#ng-project-pristine-seas").length){
        AOS.refresh();
    }

});

$(function () {

    if($("#ng-project-pristine-seas").length) {
        $('.ng-auto-animate').attr("data-aos", "fade-up").attr("data-aos-once", "false").attr("data-aos-duration", 1600);
        $('.ng-auto-animate:last-of-type').attr("data-aos", "fade").attr("data-aos-once", "false").attr("data-aos-duration", 2000);

        AOS.init({
            disable: 'mobile'
        });
    }
});
