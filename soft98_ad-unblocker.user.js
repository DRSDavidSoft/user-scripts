// ==UserScript==
// @name         Soft98 Disable Ad-unblocker
// @namespace    DRS David Soft <David@Refoua.me>
// @author       David Refoua
// @version      0.9b
// @description  Removes Soft98.ir's annoying message to disable adblocker.
// @run-at:      document-start
// @updateURL    https://raw.githubusercontent.com/DRSDavidSoft/user-scripts/master/soft98_ad-unblocker.user.js
// @downloadURL  https://raw.githubusercontent.com/DRSDavidSoft/user-scripts/master/soft98_ad-unblocker.user.js
// @icon         https://image.flaticon.com/icons/png/128/187/187130.png
// @match        *://*.soft98.ir/*
// @license      MIT
// ==/UserScript==

// SentinelJS is a JavaScript library that lets you detect new DOM nodes
const sentinel = function(){var e,n,t,i=Array.isArray,r={},o={};return{on:function(a,s){if(s){if(!e){var f=document,l=f.head;f.addEventListener("animationstart",function(e,n,t,i){if(n=o[e.animationName])for(e.stopImmediatePropagation(),t=n.length,i=0;i<t;i++)n[i](e.target)},!0),e=f.createElement("style"),l.insertBefore(e,l.firstChild),n=e.sheet,t=n.cssRules}(i(a)?a:[a]).map(function(e,i,a){(i=r[e])||(a="!"==e[0],r[e]=i=a?e.slice(1):"sentinel-"+Math.random().toString(16).slice(2),t[n.insertRule("@keyframes "+i+"{from{transform:none;}to{transform:none;}}",t.length)]._id=e,a||(t[n.insertRule(e+"{animation-duration:0.0001s;animation-name:"+i+";}",t.length)]._id=e),r[e]=i),(o[i]=o[i]||[]).push(s)})}},off:function(e,a){(i(e)?e:[e]).map(function(e,i,s,f){if(i=r[e]){if(s=o[i],a)for(f=s.length;f--;)s[f]===a&&s.splice(f,1);else s=[];if(!s.length){for(f=t.length;f--;)t[f]._id==e&&n.deleteRule(f);delete r[e],delete o[i]}}})},reset:function(){r={},o={},e&&e.parentNode.removeChild(e),e=0}}}(document);

/**
 *
 * Enjoy your ad-blocked Soft98 experience.
 * Coded by: David@Refoua.me – Version BETA9
 *
 */

(function() {

	'use strict';

	// I've openly documented my approach for Soft98 as a challenge,
	// which means a new challenge for me, once they solve it.

	const unblocker = {

		/** Define a list of elements that we need to interact with */
		links:  ".download-list-link, .card-title-link, .card-footer .btn-success",
		ads:	"#kaprila_soft98_ir_related, #sidebar-sticky", // .a1d1x, .a1d1x-min, .a1d1x-image, .a1d1x__inner, #a1d1x-header, #a1d1x-special, .a1d1x-sidebar, .a1d1xb, .a1d1x-link, .a1d1x-download
		a1d1x:	"a1d1x",

		/** Selector for the annoying, nagging, useless elements */
		annoyer: "[class*=t][class*=st][class*=fade], .tooltip",

		/** Hold the original `href` attribute */
		_href:  [ ],

		/** Hold the shits (ehmm... I mean ads) */
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

			// Since Soft98 increments their class names, we have to also adjust our keyword
			this.adjustKeyword();

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
						this.ads = this.ads.replace(new RegExp(this.a1d1x, 'g'), ad_class);
						found = true;
					}
				}
			}

			var _ads = this.getElements(this.ads);
			
			// We found the little shits! Hooray!
			if ( _ads.length > 0 ) found = true;
			
			this.found_ = found;

			// Get a hold of current actual useful links on this page
			this.preserveHappiness();

			// Keep track of the shits (I mean ads)
			this._shits = _ads;

			// Prevent the annoying disable ad-blocker message
			sentinel.on(this.links, this.preserveHappiness.bind(this));
			sentinel.on(this.annoyer, this.restoreHappiness.bind(this, this._href));

			// Two can play your game, Soft98
			/*
			this._tID = window.setInterval(
				function() { this.runAtReady( this.restoreHappiness.bind(this, this._href) ) }.bind(this),
				1000
			);
			*/

			/** Remove all shit from this page */
			this.shitRemover(_ads);

			/** Make sure we've restored the actual links when the page is loaded */
			this.runAtReady( this.restoreHappiness.bind(this, this._href) );

			/** Restore the links, if any, right now too */
			this.restoreHappiness(this._href);

		},

		/** The root of the shits (I mean ads) must be found */
		findRoot: function(nodes) {
			var roots = $();

			$(nodes).each(function() {
				var $this = $(this);
				while ( $this.parent().length > 0 && ( $this.parent().is(this._ads) || $this.parents("#sidebar .card").length > 0 ) ) $this = $this.parent();
				if ( roots.has($this).length == 0 ) roots = roots.add($this);
			});

			return roots;
		},

		/** Deduce the deuce class names (i.e. find the ads) */
		adjustKeyword: function()
		{

			var regex = new RegExp( '(' + this.a1d1x.replace(/\d+/g, '\\d*') + ')', 'g' ),
				found = [], lookup = [], _s = [];

			var _all = document.querySelectorAll('[id],[class]'),
				_strings = [];

			for ( var i in _all ) if ( _all.hasOwnProperty(i) )
			{
				var _search = [];

				if ( _all[i].id ) _search.push(_all[i].id);

				if ( _all[i].className )
				{
					var cl = _all[i].className.split(/\s+/g);
					for ( var j in cl ) _search.push(cl[j]);
				}

				for ( var x in _search ) if ( _search.hasOwnProperty(x) && _strings.indexOf(_search[x]) == -1 && !!_search[x] )
					_strings.push(_search[x]);

			}

			for ( var i in _strings ) if ( _strings.hasOwnProperty(i) )
			{
				var _m;

				if ( _m = _strings[i].match(regex) )
				{
					if ( found.indexOf(_m[0]) == -1 ) found.push(_m[0]);
					lookup.push(_strings[i]);
				}
			}

			for ( var i in lookup ) if ( lookup.hasOwnProperty(i) )
			{
				var __s, __;

				for ( var k in __s = ['.', '#'] ) if ( __s.hasOwnProperty(k) )
				{
					if ( !!document.querySelector( __ = __s[k] + lookup[i] ) && _s.indexOf(__) == -1 )
						_s.push(__);
				}

			}

			this.ads = this.ads.split(/,\s*/g);

			for ( var i in _s ) if ( _s.hasOwnProperty(i) )
				if ( this.ads.indexOf(_s[i]) == -1 ) this.ads.push(_s[i]);

			this.ads = this.ads.sort().join(', ');

			if ( found.length > 0 )
			{
				this.a1d1x = found[0];
				if ( found.length > 1 )
				{
					console.warn('%cWARNING: %cfound more than 1 keyword: ', 'font-weight: bold', '');
					console.warn(found);
				}
			}

		},

		/** Cleanse the beautiful Soft98 webpage of any type of shit (I mean ads) */
		shitRemover: function(nodes) {

			$('.nav-item').each(function() {
				var isAds = false;
				$(this).find('.nav-link, .dropdown-item').each(function() {
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

			if ( shitRoots.length > 0 )
				console.info("Deleting ads element roots:", shitRoots);

			shitRoots.filter('.card').siblings('hr').remove();
			// shitRoots.wrap(contentWrapper);
			shitRoots.remove();

			var shits = $('.'+_hClass).children().addBack();

			// var emptyImg = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==',
			//	minWidth = 15, minHeight = 15; // cat & mouse (cat = me, mouse = soft98)

			// $(shits).filter("img").attr('src', emptyImg).css({'min-width': (minWidth + 1) + 'px', 'min-height': (minHeight + 1) + 'px'});

			// $(shits).css({'overflow': 'hidden', 'border': '0', /*'max-width': (minWidth + 5) + 'px', 'max-height': (minHeight + 5) + 'px',*/ 'padding': '0', 'margin': '0', 'color': 'transparent', 'background': 'transparent', 'box-shadow': 'none'});

			// $('.'+_hClass).css({'opacity': '0', 'transform': 'scale(0)'}).css({'display': 'inline-block'});

			// $(`.${_hClass} card`).css({'margin-top': '0'});

			// $('.'+_hClass).css({'position': 'absolute', 'z-index': '-200', 'border': '0', 'color': 'transparent', 'background': 'transparent', 'box-shadow': 'none'});

			$(shits).on('click dblclick contextmenu', function(e) { e.preventDefault(); }).filter("[href]").attr('href', '#');

		},

		/** Keep a track of useful links on Soft98 (e.g. download links) */
		preserveHappiness: function() {

			var exist = [], added = [], lost = [];

			for ( var l in this._href ) exist.push(this._href[l][0]);
			
			var _links = this.getElements(this.links);

			/** Save the links to the happiness */
			for (var s in _links) if ( _links.hasOwnProperty(s) && !!_links[s] ) {

				var query = [
					_links[s], _links[s].getAttribute('href')
				]
				
				if ( exist.indexOf(_links[s]) == -1 )
				{
					this._href.push(query);

					_links[s].addEventListener("mouseenter", this.restoreHappiness.bind(this, this._href));

					if ( location.href != _links[s].getAttribute('href') ) added.push(_links[s]);
					else if ( _links[s].className.indexOf('card-title-link') == -1 ) lost.push(_links[s]);
				}

			}

			// this.restoreHappiness.call(this, this._href);

			if ( added.length > 0 )
				console.warn("Preserving " + added.length + " link(s)", added);

			if ( lost.length > 0 )
			{
				console.error("Lost original links of " + lost.length + " link(s)", lost);

				// this.runAtReady( this.fetchHappiness.bind(this) );
				this.fetchHappiness.call(this)
			}

			this.runAtReady( this.restoreHappiness.bind(this, this._href) );

			if ( added.length > 0 && lost.length == 0 ) this.brag(!!this.found_);

			return [added, lost];

		},

		/** Restore the actual useful links to their former glory, before Soft98's attempt to ruin them */
		restoreHappiness: function(victims) {

			this.resetHandles();

			var stillLost = false;

			// Restore health to the link victims
			for (var i in victims) if ( victims.hasOwnProperty(i) ) {
				var poorChild = victims[i], origLocation = poorChild[1];

				// Undo Soft98's cruel violence to the poor links
				var fixedLink = poorChild[0];

				if (!fixedLink) continue;

				if ( (location.href == origLocation /* fixedLink.getAttribute('href') */) && fixedLink.className.indexOf('card-title-link') == -1 )
				{
					fixedLink.style.color = '#d95f47';

					var attrs = {
						title: "متأسفانه لینک از بین رفته است"
					};

					for ( var l in attrs ) fixedLink.setAttribute(l, attrs[l]);

					stillLost = true;

					continue;
				}

				if ( origLocation !== fixedLink.getAttribute('href') && origLocation.indexOf('#') !== 0 )
					console.warn("Restored original link!", origLocation);

				var attrs = {
					'data-toggle' : "freedom", 'title': '',
					'href': origLocation
				};

				for ( var l in attrs ) fixedLink.setAttribute(l, attrs[l]);

				fixedLink.style.color = '';
				if ( typeof $ == 'function' ) $(fixedLink).off('click');

			}

			// Shut the fuck up, toast
			var annoyer = document.querySelector(this.annoyer);

			if (annoyer && annoyer.innerHTML.length > 0 && (annoyer.innerHTML.indexOf('reload') > -1 || annoyer.innerHTML.indexOf('F5') > -1))
				annoyer.parentElement.removeChild(annoyer);

			// Clean up more shit from Soft98
			this.shitRemover( this.getElements(this.ads) );

			return !stillLost;

		},

		/** Sometimes, we need to start over from scratch. Particularly if <some> person is trying to be a dickhead */
		fetchHappiness: function() {
			var _h = this;

			if ( this.isFetching ) return;
			else this.isFetching = true;

			console.info("Trying to restore original links...");

			var request = new XMLHttpRequest();
			request.open('GET', location.href, true);

			this.runAtReady( this.enhanceLogo.bind(this) );

			request.onload = function() {
				if (this.status != 200) {
					console.error("Unexpected http code: ", this.status, " when trying to fetch links!");

					_h.isFetching = false;
					window.setTimeout( _h.fetchHappiness.bind(_h), 3000 );
					_h.runAtReady( _h.revertLogo.bind(_h) );

				} else {

					if ( typeof $ != 'function' )
					{
						_h.isFetching = false;
						window.setTimeout( _h.fetchHappiness.bind(_h), 3000 );
						_h.runAtReady( _h.revertLogo.bind(_h) );	

						console.error("WARNING: jQuery is not ready :(");
						return;
					}

					var $l = $(this.response).find(_h.links);
				
					for ( var i in _h._href ) if ( _h._href.hasOwnProperty(i) )
					{
						var originalText = _h._href[i][0].innerHTML.trim(),
							ln = [];
	
						$l.filter( function() { return this.innerHTML.indexOf(originalText) > -1 } ).each(function() {
							var nh = (this.getAttribute('href') || '').trim();
							if (nh.length > 0 && ln.indexOf(nh) == -1) ln.push(nh); // console.log(this.innerHTML, this.getAttribute('href'));
						});

						if ( ln.length == 0 )
							console.error("ERROR: no match found for: ", originalText);
						else if ( ln.length > 1 )
							console.warn("WARNING: multiple matched found for: ", originalText, ln.join("\n"));
						else {
							if ( _h._href[i][1] == ln[0] ) continue;
							console.info("Found match for:", originalText, ln[0]);
							// _h._href[i][0].setAttribute('href', ln[0]);
							_h._href[i][1] = ln[0];
						}
					}

					var r = _h.restoreHappiness.call(_h);

					if (r) _h.brag(!!_h.found_);
					else console.error("Unable to restore all links! :(");

					_h.runAtReady( _h.restoreHappiness.bind(_h, _h._href) );

				}
			};

			request.onerror = function() {
				console.error("Failed to fetch links!");

				_h.isFetching = false;
				window.setTimeout( _h.fetchHappiness.bind(_h), 3000 );
				_h.runAtReady( _h.revertLogo.bind(_h) );
			};

			request.send();

		},

		/** Send some messages to show off my abilities and mock Soft98 */
		brag: function(isSuccess) {

			if ( this.enoughShowOff ) return; else this.enoughShowOff = true;

			console.clear();

			var shit = 'Soft98-Ads'.split(','),
				css = 'font-size: 200%; font-family: sans-serif; padding: 0 20px;'
					+ ( isSuccess ?
						'background-color: #0097e6; color: #f5f6fa;' :
						'background-color: #c0392b; color: #ecf0f1;' )
					+ 'text-shadow: 1px 1px 0 rgba(0,0,0, .5);'
					+ 'border-radius: 1em;';

			var status = isSuccess ? 'is enabled!' : 'failed to work :('

			for ( var i in shit ) {
				console.info( `%c${shit[i].trim()} fucker ${status}`, css );
			}

			if ( !isSuccess ) return "till next time, suckers!";

			this.runAtReady( this.enhanceLogo.bind(this) );

			console.log("%cAll Pirates, Come Aboard!", 'font-weight: bold; color: blue');

			return "Be Happy ☺";

		},

		/** I know, this logo is wayyy better than original. */
		enhanceLogo: function() {

			this.originalLogoUrl = document.getElementById('logo-link').style.backgroundImage;

			// Sorry, but I couldn't help myself
			document.getElementById('logo-link').style.backgroundImage = 'url(https://user-images.githubusercontent.com/4673812/50543067-1f2b7680-0be1-11e9-9daa-92828b24448e.png)';

		},

		/** In case we failed miserably, and might need to revert back the logo :( */
		revertLogo: function() {
			if (!!this.originalLogoUrl) return;
			document.getElementById('logo-link').style.backgroundImage = this.originalLogoUrl;
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
				// if (-1 !== $obj.css("visibility").indexOf("hidden")) trips.push("not visible");
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

			/** My approach is to copy original methods from the new document constructor */
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

	// Attach the unblocker handle to the global namespace using an... interesting name
	// $(document).data("fucker", unblocker);

	// If you find the word "fuck" in Soft98's inappropriately named "jquery.js", now you know why.
	// document.fucker = unblocker;

})();
