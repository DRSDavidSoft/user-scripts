// ==UserScript==
// @name         Always use English Google
// @description  Automatically click on the "Google offered in: English" Link
// @author       DRS David Soft
// @match        https://www.google.com/*
// @include      http://*.google.tld/*
// @include      https://*.google.tld/*
// @include      https://*.google.*/*
// @include      http://*.google.*/*
// @run-at       document-end
// @updateURL    https://raw.githubusercontent.com/DRSDavidSoft/user-scripts/master/google_always-english.user.js
// @downloadURL  https://raw.githubusercontent.com/DRSDavidSoft/user-scripts/master/google_always-english.user.js
// @icon         https://image.flaticon.com/icons/png/128/281/281764.png
// @grant        none
// ==/UserScript==

(() => {

    const links = document.querySelectorAll('[id*="additional_languages"] a, #slim_appbar a');

    links.forEach(_ => {

        const text = _.innerText || '',
              href = _.getAttribute('href') || '';

        if ( text.trim() === 'English' || href.match(/\/setprefs?.*(hl=en)/gi) || text.trim() === 'Change to English' ) {
            if ( !this.url ) {
                this.url = href;
                console.log("🛵 Redirecting to English Google...\n", href);
                location.replace(href);
            }
        }

    })

})();
