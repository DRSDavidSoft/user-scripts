// ==UserScript==
// @name         Soft98 Disable Ad-unblocker
// @namespace    DRS David Soft <David@Refoua.me>
// @author       David Refoua
// @version      0.5b
// @description  Removes Soft98.ir's annoying message to disable adblocker.
// @run-at:      document-start
// @updateURL    https://raw.githubusercontent.com/DRSDavidSoft/user-scripts/master/soft98_ad-unblocker.user.js
// @downloadURL  https://raw.githubusercontent.com/DRSDavidSoft/user-scripts/master/soft98_ad-unblocker.user.js
// @icon         https://image.flaticon.com/icons/png/128/187/187130.png
// @match        *://*.soft98.ir/*
// @license      MIT
// ==/UserScript==

/**
 *
 * Enjoy your ad-blocked Soft98 experience.
 * Coded by: David@Refoua.me – Version BETA5
 *
 */

(function() {

	'use strict';

	// I have commented my approach as a challenge for Soft98
	// which means a new challenge for me once they solve it.

	const unblocker = {

		/** Define a list of elements that we need to interact with */
		links:  ".download-list-link, .card-title-link, .card-footer .btn-success",
		ads:	".a1d2x, .a1d2x-image, .a1d2x__inner, #a1d2x-header, .a1d2x-sidebar, .adx, .adx-image, .adx > *, .adxb, .adx__inner, .adx-link, .adx-download, #kaprila_soft98_ir_related",

		/** Hold the original `href` attribute */
		_href:  [ ],

		/** Hold the shits (I mean ads) */
		_shits: [ ],

		/** Ad-unblocker initialization */
		init: function () {

			/**
			 * First things first, we need to restore the idiot's mistakes
			 * (e.g. the sad attempts to sabotage my script)
			 */

			// This is a clever way to bypass Soft98's way to override global methods
			this.resetHandles();

			// console.log(document.querySelectorAll('body'));

			this.brag();

			var _ads = this.getElements(this.ads);
			//console.log(_ads);

			// Keep track of the shits (I mean ads)
			this._shits = _ads;

			var _links = this.getElements(this.links);

			/** Save the links to the happiness */
			for (var s in _links) if ( _links.hasOwnProperty(s) ) {
				var query = [
					_links[s], _links[s].getAttribute('href')
				]
				this._href.push(query);
			}

			// Two can play your game, Soft98
			/*
			this._tID = window.setInterval(
				function() { this.runAtReady( this.restoreHappiness.bind(this, this._href) ) }.bind(this),
				1000
			);
			*/

			/** Remove all shit from this page */
			this.shitRemover(_ads);

			/** Make sure we do the thing */
			this.runAtReady( this.restoreHappiness.bind(this, this._href) );

			/**
			 * Let the child play with his toys
			 */
			//this.restoreHandles();

		},

		shitRemover: function(nodes) {

			var contentWrapper = '<span class="shit"></span>';

			for ( var shit in nodes ) if ( nodes.hasOwnProperty(shit) ) {
				var actualShit = nodes[shit], shitNode = actualShit;

				do {
					actualShit = actualShit.parentNode;
					if ( !actualShit ) break;
					else if ( actualShit.classList.contains('card') && actualShit.classList.contains('bg-light') ) {
						if ( typeof $ == 'function' ) { $(actualShit).prev('hr').remove(); $(actualShit).next('hr').remove(); }
						// if (actualShit.parentNode) actualShit.parentNode.removeChild(actualShit);
						if ( typeof $ == 'function' ) { $(actualShit).wrapInner(contentWrapper); }
						break;
					}
				} while ( actualShit != document.body );

				//if ( shitNode && shitNode.parentNode )
				//	shitNode.parentElement.removeChild(shitNode);

				if ( shitNode && typeof $ == 'function' && !$(shitNode).is('img') )
				{ $(shitNode).wrapInner(contentWrapper); }

			}

			var emptyImg = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==',
				minWidth = 15, minHeight = 15; // cat & mouse (cat = me, mouse = soft98)

			if ( typeof $ == 'function' ) { $('.shit').parent().filter('.card').wrap(contentWrapper); }

			// if ( typeof $ == 'function' ) { $('.shit, .shit *').filter("img").attr('src', emptyImg).css({'min-width': (minWidth + 1) + 'px', 'min-height': (minHeight + 1) + 'px'}); }

			// TODO: I'll probably come up with something a bit more clever in the next version.
			if ( typeof $ == 'function' ) { $('.shit, .shit *').css({'overflow': 'hidden', 'border': '0', /*'max-width': (minWidth + 5) + 'px', 'max-height': (minHeight + 5) + 'px',*/ 'padding': '0', 'margin': '0', 'color': 'transparent', 'background': 'transparent', 'box-shadow': 'none'}); }

			if ( typeof $ == 'function' ) { $('.shit').css({'opacity': '0', 'transform': 'scale(0)'}).filter(':not(:has(.shit))').css({'display': 'inline-block'}); }

			if ( typeof $ == 'function' ) { $('.container').filter(this.ads).add('.shit .card').css({'position': 'absolute', 'z-index': '-200', 'border': '0', 'color': 'transparent', 'background': 'transparent', 'box-shadow': 'none'}); $('.shit + .card').css({'margin-top': '0'}); $("#kaprila_soft98_ir_related").remove(); }

			if ( typeof $ == 'function' ) { $('.nav-item:contains(تبلیغات), .download-list-item:has(a[href*=kaprila]), .download-list-item-buysellads').remove(); }

			// TODO: merge these lines
			if ( typeof $ == 'function' ) { $('.shit, .shit *').on('click dblclick contextmenu', function(e) { e.preventDefault(); }).filter("[href]").attr('href', '#'); }

		},

		restoreHappiness: function(victims) {

			// TODO: remove this call
			this.resetHandles();

			// Sorry, but I couldn't help myself
			document.getElementById('logo-link').style.backgroundImage = 'url(https://user-images.githubusercontent.com/4673812/50543067-1f2b7680-0be1-11e9-9daa-92828b24448e.png)';

			// Restore health to the link victims
			for (var i in victims) if ( victims.hasOwnProperty(i) ) {
				var poorChild = victims[i], origLocation = poorChild[1];

				// Undo Soft98's cruel violence to the poor links
				var fixedLink = poorChild[0];
				fixedLink.setAttribute('data-toggle', 'freedom');
				$(fixedLink).off('click').attr('href', origLocation);

			}

			// Shut the fuck up, toast
			var annoyer = document.getElementById("toast");
			if (annoyer && annoyer.innerHTML.length > 0 && annoyer.innerHTML.indexOf('reload') > -1)
				annoyer.parentElement.removeChild(annoyer);

			// Clean up more shit from Soft98
			this.shitRemover( this.getElements(this.ads) );

		},

		// Send some messages to show off my abilities and mock Soft98
		brag: function() {

			console.clear();

			var shit = 'Soft98-Ads'.split(','),
				css = 'font-size: 200%; font-family: sans-serif; padding: 0 20px;'
					+ 'background-color: #0097e6; color: #f5f6fa;'
					+ 'text-shadow: 1px 1px 0 rgba(0,0,0, .5);'
					+ 'border-radius: 1em;';

			for ( var i in shit ) {
				console.info( `%c${shit[i].trim()} fucker is enabled!`, css );
			}

			console.log("%cAll Pirates, Come Aboard!", 'font-weight: bold; color: blue');

			return "Be Happy ☺";

		},

		/** Helper function to check Soft98 traps */
		trapCheck: function(nodeList) {

			console.clear();

			// Call this like:
			// unblocker.trapCheck(unblocker._shits);
			// var u = $(document).data("fucker"), r = u.trapCheck(u._shits);
			$(nodeList).each(function() {

				var $obj = $(this),
					css = $obj.attr("style"),
					left = $obj.offset().left;

				var trips = [];

				if ($obj.is(":hidden")) trips.push("was hidden");
				if (left < 0 || left > $(window).width()) trips.push("outside screen");
				//if (-1 !== $obj.css("visibility").indexOf("hidden")) trips.push("not visible");
				if (-1 !== $obj.css("visibility").search(/hidden|collapse/)) trips.push("not visible");
				if (-1 === $obj.css("transform").search(/none/)) trips.push("transform tripped");
				if ($obj.css("opacity") < 1) trips.push("opacity tripped");
				if ($obj.width() < 15) trips.push("small width");
				if ($obj.height() < 15) trips.push("small height");
				// if (css && -1 !== css.indexOf("adguard")) trips.push("adguard detected");
				if (-1 !== (String($obj.css("content")) + $obj.attr("style")).search(/adguard/)) trips.push("adguard detected");
				if ($obj.is("img") && !$obj.attr("src")) trips.push("source-less image");
				// if (!$.trim($obj.html())) trips.push("no content");
				if (!$obj.is("img") && !$obj.is("iframe") && !$.trim($obj.html())) trips.push("no content");

				if ( trips.length > 0 ) {
					// Group the tripped warnings
					console.group(this);

					for ( var i = 0; i < trips.length; i++ )
						console.warn(trips[i]);

					console.groupEnd();
				}

			})

		},

		/** We keep a track of the `document` methods in here */
		handles: {
			store: {}, // the modified methods
			list:  [
				'querySelector', 'querySelectorAll', 'getElementsByTagName',
				'getElementsByClassName', 'getElementById'
			]
		},

		/** Helper function to reset right methods */
		resetHandles: function()
		{

			// Why do you make me do this...?
			if (!Object.getPrototypeOf)
			{
				Object.getPrototypeOf = function getPrototypeOf(object) {
					console.info("%cWhy do you make me do this? %c:(", 'color: red', 'font-weight: bold');
					return object.__proto__;
				};
			}

			/** Find a reference to a document */
			var original = ({}).constructor.getPrototypeOf(document);

			/** my approach is to copy original methods from the new document constructor */
			for ( var i in this.handles.list ) {

				var name = this.handles.list[i],
					call = document[name];
				this.handles.store[name] = call;

				// Let's see the magic!
				document[name] = original[name];
			}

		},

		/** Helper function to restore modified methods */
		restoreHandles: function()
		{

			/** We bring the modified methods back, so Soft98 cannot check for them */
			for ( var i in this.handles.list ) {

				var name = this.handles.list[i],
					method = this.handles.store[name];

				document[name] = method;
			}

		},

		/** Helper function to get a list of elements */
		getElements: function(selectors)
		{

			var ret = [];

			for ( var i = 0, arr = selectors.split(','); i < arr.length; i++ )
			{
				var selector = arr[i].trim(),
					_elements = document.querySelectorAll(selector);

				for ( var node in _elements )
					if ( _elements.hasOwnProperty(node) )
						ret.push(_elements[node]);

			}

			return ret;

		},

		/** Helper function to execute callback at DOM ready */
		runAtReady: function (fn) {
			if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading") fn();
			else document.addEventListener('DOMContentLoaded', fn);
		}

	}

	// Start the chaos
	unblocker.init();

	// Attach the unblocker handle to the global namespace... using a funny name ;)
	$(document).data("fucker", unblocker);

})();
