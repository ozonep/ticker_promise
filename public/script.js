"use strict";

var ul = document.getElementById("ul");
var jUl = $("#ul");
var pos = ul.offsetLeft;
var li = document.getElementsByClassName("news");
var request;

$.ajax({
    url: "headings.json",
    method: "GET",
    success: function(result) {
        for (var i = 0; i < result.length; i++) {
            console.log("Testing", result.length);
            jUl.append("<li class='news'><a href='" + result[i].href + "'>" + result[i].title + "</a></li>");
        }
        request = requestAnimationFrame(move);
        addEventListenerByTag();
    }
});


function move(){
    pos--;
    if(pos === -li[0].offsetWidth){
        pos = pos + li[0].offsetWidth;
        ul.appendChild(li[0]);
    }
    ul.style.left= pos + "px";
    request = requestAnimationFrame(move);
}

function addEventListenerByTag() {
    var links = document.getElementsByTagName("a");
    for (var i = 0; i < links.length; i++) {
        links[i].addEventListener("mouseenter", function() {
            cancelAnimationFrame(request);
        }, false);
        links[i].addEventListener("mouseleave", function() {
            request = requestAnimationFrame(move);
        }, false);
    }
}




