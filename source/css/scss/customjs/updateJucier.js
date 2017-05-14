/**
 * Created by brentmiller on 1/8/17.
 * Used to update the UI of the Jucier Plugin.
 *
 */


var JUCIER_SET_BODY_SCROLL_POSITION = $(window).scrollTop();

var processJucierClick = function(addBodyClass){

    JUCIER_SET_BODY_SCROLL_POSITION = $(window).scrollTop();

    console.log("Window position", JUCIER_SET_BODY_SCROLL_POSITION);

    if(addBodyClass){
        $("body").addClass("jucier-modal-open");
    }

    setTimeout(function(){
        var overlay = $('.j-overlay-content');
        var jtitle = $(overlay).find(".j-title");
        var jposter = $(overlay).find(".j-poster");
        var jshare = $(overlay).find(".j-share").clone( true );
        if(jtitle.length && $('.j-overlay-content').find(".j-share").length < 2){
            $(jtitle).after(jshare);
        }else if(jposter.length && $('.j-overlay-content').find(".j-share").length < 2){
            $(overlay).find(".j-poster").after(jshare);
        }
    }, 500);
};



function updateJuicer() {
    $(".j-message p:contains('By:')").addClass("ng-article-meta");

    $(".j-text .info").removeClass("info").addClass("ng-article-meta");

    $(document).on("click", ".j-overlay", function(event){
        if($(event.target).hasClass("j-overlay")){
            $("body").removeClass("jucier-modal-open");
        }
    });

    $(".j-close").each(function(index){
        var elm = this;
        $(elm).hide();

        var parent =  $(elm).parent();

        var close = document.createElement("a");
        close.className = "j-close-ng";
        close.setAttribute("href", "#");
        close.innerHTML = "<span>Close</span>";
        close.onclick = function(){
            $("body").removeClass("jucier-modal-open");
            $(elm).trigger("click");
            setTimeout(function(){
                //$("html").scrollTop(JUCIER_SET_BODY_SCROLL_POSITION);
                window.scrollTo(0, JUCIER_SET_BODY_SCROLL_POSITION);
            },400);
        };
        $(parent).prepend(close);

        $(".j-message p:contains('By:')").addClass("ng-article-meta");
    });


    $(".feed-item").on("click", function(){
        processJucierClick(true);
    });

    $(".j-previous").on("click", function(){
        processJucierClick(false);
    });

    $(".j-next").on("click", function(){
        processJucierClick(false);
    });
}

