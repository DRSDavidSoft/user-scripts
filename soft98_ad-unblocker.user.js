// ==UserScript==
// @name         Soft98 Disable Ad-unblocker
// @namespace    DRS David Soft <David@Refoua.me>
// @author       David Refoua
// @version      0.6b
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
 * Coded by: David@Refoua.me – Version BETA6
 *
 */

(function() {

	'use strict';

	// I have commented my approach as a challenge for Soft98
	// which means a new challenge for me once they solve it.

	const unblocker = {

		/** Define a list of elements that we need to interact with */
		links:  ".download-list-link, .card-title-link, .card-footer .btn-success",
		ads:	".a1d2x, .a1d2x-image, .a1d2x__inner, #a1d2x-header, #a1d2x-special, .a1d2x-sidebar, .a1d2xb, .a1d2x-link, .a1d2x-download, #kaprila_soft98_ir_related",

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

			var found = false;

			if ( typeof $ == 'function' ) {
				var class_names = { 'img':'', 'a':'' };
				var $header_ad = $("#logo.col-lg+div.col-lg a img"), $parent = $header_ad.parent("a");
				if ($header_ad.length > 0 && $parent.length > 0) {
					$header_ad.add($parent).each(function() {
						var classes = $(this).prop("classList"), tag = this.tagName.toLowerCase();
						for (var i in classes) if (classes.hasOwnProperty(i) ) {
							if (tag == 'img' && classes[i].match(/\b\w+\-image\b/i)) class_names[tag] = classes[i];
							if (tag == 'a'   && classes[i].match(/\b\w+\-link\b/i))  class_names[tag] = classes[i];
							// class_names.indexOf(classes[i]) === -1) class_names.push(classes[i]);
						}
					});
					// console.log(class_names);
				}
				if ( class_names.img.length > 0 && class_names.a.length > 0 ) {
					var ad_img = class_names.img.match(/^(?<name>.+)\-image$/i),
						ad_link = class_names.a.match(/^(?<name>.+)\-link$/i);
					if ( ad_img && ad_link && ad_img.groups['name'] === ad_link.groups['name'] ) {
						var ad_class = ad_img.groups['name'];
						this.ads = this.ads.replace(new RegExp('a1d2x', 'g'), ad_class);
						found = true;
					}
				}
			}

			this.brag();

			if (!found) console.error("Could not find the ads class.");

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

		findRoot: function(nodes) {
			var roots = $();

			$(nodes).each(function() {
				var $this = $(this);
				while ( $this.parent().length > 0 && ( $this.parent().is(this._ads) || $this.parents("#sidebar .card").length > 0 ) ) $this = $this.parent();
				if ( roots.has($this).length == 0 ) roots = roots.add($this);
			});

			return roots;
		},

		shitRemover: function(nodes) {

			if ( typeof $ != 'function' ) return;

			$('.nav-item').each(function() {
				var isAds = false;
				$(this).find('.nav-link').each(function() {
					if ( $(this).text().replace(/ـ/g, '').indexOf('تبلیغ') !== -1 )
						isAds = true;
				});
				if (isAds) $(this).remove();
			});

			$('.download-list-item:has(a[href*=kaprila]), .download-list-item-buysellads, #kaprila_soft98_ir_related, #footer-bitcoin').remove();

			var _hClass = "shit";

			var contentWrapper = `<span class="${_hClass}"></span>`,
				shitRoots = this.findRoot(nodes)
				.filter(function(i){ return $(this).parents('.'+_hClass).length === 0; });

			console.log(shitRoots);

			shitRoots.filter('.card').siblings('hr').remove();
			// shitRoots.wrap(contentWrapper);
			shitRoots.remove();

			var shits = $('.'+_hClass).children().addBack();

			var emptyImg = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==',
				minWidth = 15, minHeight = 15; // cat & mouse (cat = me, mouse = soft98)

			// $(shits).filter("img").attr('src', emptyImg).css({'min-width': (minWidth + 1) + 'px', 'min-height': (minHeight + 1) + 'px'});

			// $(shits).css({'overflow': 'hidden', 'border': '0', /*'max-width': (minWidth + 5) + 'px', 'max-height': (minHeight + 5) + 'px',*/ 'padding': '0', 'margin': '0', 'color': 'transparent', 'background': 'transparent', 'box-shadow': 'none'});

			// $('.'+_hClass).css({'opacity': '0', 'transform': 'scale(0)'}).css({'display': 'inline-block'});

			// $(`.${_hClass} card`).css({'margin-top': '0'});

			// $('.'+_hClass).css({'position': 'absolute', 'z-index': '-200', 'border': '0', 'color': 'transparent', 'background': 'transparent', 'box-shadow': 'none'});

			$(shits).on('click dblclick contextmenu', function(e) { e.preventDefault(); }).filter("[href]").attr('href', '#');

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
			$(nodeList).children().addBack().each(function() {

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

    // document.fucker = unblocker;

})();
