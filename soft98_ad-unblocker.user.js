// ==UserScript==
// @name         Soft98 Disable Ad-unblocker
// @namespace    DRS David Soft <David@Refoua.me>
// @author       David Refoua
// @version      0.8b
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
 * Coded by: David@Refoua.me – Version BETA8
 *
 */

(function() {

	'use strict';

	// I have commented my approach as a challenge for Soft98
	// which means a new challenge for me once they solve it.

	const unblocker = {

		/** Define a list of elements that we need to interact with */
		links:  ".download-list-link, .card-title-link, .card-footer .btn-success",
		ads:	"#kaprila_soft98_ir_related", // .a1d1x, .a1d1x-min, .a1d1x-image, .a1d1x__inner, #a1d1x-header, #a1d1x-special, .a1d1x-sidebar, .a1d1xb, .a1d1x-link, .a1d1x-download
		a1d1x:	"a1d1x",

		annoyer: "[class*=t][class*=st][class*=fade], .tooltip",

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

			if ( _ads.length > 0 ) found = true;

			this.brag(!!found);

			if (!found) console.error("Could not find the ads class.");

			// Keep track of the shits (I mean ads)
			this._shits = _ads;

			var _links = this.getElements(this.links);

			/** Save the links to the happiness */
			for (var s in _links) if ( _links.hasOwnProperty(s) ) {
				var query = [
					_links[s], _links[s].getAttribute('href')
				]
				this._href.push(query);

				_links[s].addEventListener("mouseenter", this.restoreHappiness.bind(this, this._href));
			}

			// Two can play your game, Soft98
			/*
			this._tID = window.setInterval(
				function() { this.runAtReady( this.restoreHappiness.bind(this, this._href) ) }.bind(this),
				1000
			);
			*/

			sentinel.on(this.annoyer, this.restoreHappiness.bind(this, this._href));

			/** Remove all shit from this page */
			this.shitRemover(_ads);

			/** Make sure we do the thing */
			this.runAtReady( this.restoreHappiness.bind(this, this._href) );

			/**
			 * Restore the happniess now
			 */
			this.restoreHappiness(this._href);

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

		adjustKeyword: function()
		{

			var regex = new RegExp( '(' + this.a1d1x.replace(/\d+/g, '\\d+') + ')', 'g' ),
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

			// Restore health to the link victims
			for (var i in victims) if ( victims.hasOwnProperty(i) ) {
				var poorChild = victims[i], origLocation = poorChild[1];

				// Undo Soft98's cruel violence to the poor links
				var fixedLink = poorChild[0];

				if (!fixedLink) continue;

				if ( origLocation !== fixedLink.getAttribute('href') ) console.warn("Restored original link!", origLocation);

				fixedLink.setAttribute('data-toggle', 'freedom');
				fixedLink.setAttribute('href', origLocation);
				if ( typeof $ == 'function' ) $(fixedLink).off('click');

			}

			// Shut the fuck up, toast
			var annoyer = document.querySelector(this.annoyer);

			if (annoyer && annoyer.innerHTML.length > 0 && (annoyer.innerHTML.indexOf('reload') > -1 || annoyer.innerHTML.indexOf('F5') > -1))
				annoyer.parentElement.removeChild(annoyer);

			// Clean up more shit from Soft98
			this.shitRemover( this.getElements(this.ads) );

		},

		// Send some messages to show off my abilities and mock Soft98
		brag: function(isSuccess) {

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

		// I know, this logo is wayyy better than original.
		enhanceLogo: function() {

			// Sorry, but I couldn't help myself
			document.getElementById('logo-link').style.backgroundImage = 'url(https://user-images.githubusercontent.com/4673812/50543067-1f2b7680-0be1-11e9-9daa-92828b24448e.png)';

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

	// Attach the unblocker handle to the global namespace using an... interesting name
	// $(document).data("fucker", unblocker);

	// document.fucker = unblocker;

})();
