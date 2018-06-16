// ==UserScript==
// @name         Soft98 Ad-unblocker
// @namespace    DRS David Soft <David@Refoua.me>
// @author       David Refoua
// @version      0.1b
// @description  Removes Soft98.ir's annoying message to disable adblocker.
// @run-at:      document-start
// @updateURL    https://raw.githubusercontent.com/DRSDavidSoft/user-scripts/master/soft98_ad-unblocker.user.js
// @downloadURL  https://raw.githubusercontent.com/DRSDavidSoft/user-scripts/master/soft98_ad-unblocker.user.js
// @match        https://soft98.ir/*
// @match        https://*.soft98.ir/*
// @match        http://soft98.ir/*
// @match        http://*.soft98.ir/*
// @license      MIT
// ==/UserScript==

/**
 *
 * Enjoy your ad-blocked Soft98 experince.
 * Coded by: David@Refoua.me – Version BETA1
 *
 */

(function() {

    var linksOfDepression = ".download-list-link, .card-title-link, .card-footer .btn-success".split(','),
        linksOfHappiness = [];

    var fuckAds = '.adx-image';

    for (var i = 0; i < linksOfDepression.length; i++) {

        var s = linksOfDepression[i].trim(),
            nodeList = document.querySelectorAll(s);

        for (var j in nodeList) if ( nodeList.hasOwnProperty(j) ) {
            var query = [
                nodeList[j], nodeList[j].getAttribute('href')
            ]
            linksOfHappiness.push(query);
        }

    }

    var runAtReady = function (fn) {
        if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading") fn();
        else document.addEventListener('DOMContentLoaded', fn);
    };

    var shitRemover = function() {

        // Clean up more shit from Soft98
        var listOfShit = '.adx, .adx-image, .adx__inner, #adx-special, .adx-sidebar',
            nodesOfShit = document.querySelectorAll(listOfShit);

        for ( var shit in nodesOfShit ) if ( nodesOfShit.hasOwnProperty(shit) ) {
            var actualShit = nodesOfShit[ shit ], shitNode = actualShit; // enough shit alredy? :D

            do {
                actualShit = actualShit.parentNode;
                if ( !actualShit ) break;
                else if ( actualShit.classList.contains('card') && actualShit.classList.contains('bg-light') ) {
                    if ( typeof $ == 'function' ) { $(actualShit).prev('hr').remove(); $(actualShit).next('hr').remove(); }
                    if (actualShit.parentNode) actualShit.parentNode.removeChild(actualShit);
                    break;
                }
            } while ( actualShit != document.body );

            if ( shitNode && shitNode.parentNode )
                shitNode.parentElement.removeChild(shitNode);

        }

    }

    var restoreHappiness = function(victimsOfSoft98) {

        for (var i in victimsOfSoft98) if ( victimsOfSoft98.hasOwnProperty(i) ) {
            var poorChild = victimsOfSoft98[i], origLocation = poorChild.pop();

            // Remove Soft98's cruel violence to the poor links
            var fixedLink = poorChild.shift();
            fixedLink.setAttribute('data-toggle', 'freedom');
            $(fixedLink).off('click').attr('href', origLocation);

        }

        // Shut the fuck up, toast
        var annoyer = document.getElementById("toast");
        if (annoyer && annoyer.innerHTML.length > 0 && annoyer.innerHTML.indexOf('reload') > -1)
            annoyer.parentElement.removeChild(annoyer);

        shitRemover();

    }

    shitRemover();

    runAtReady( restoreHappiness.bind( document.body, linksOfHappiness ) );

})();
