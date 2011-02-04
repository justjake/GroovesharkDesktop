// ==UserScript==
// @name        Grooveshark Desktop
// @version		0.02
// @namespace   http://fluidapp.com
// @description The unofficial Grooveshark desktop client, built withg Fluid. Features dock control, badges for social notifications, premium mode, and Growl notifications.
// @include     http://listen.grooveshark.com/*
// @author      Jake Teton-Landis <just.1.jake@gmail.com>
// ==/UserScript==

/* TODO
1. JSON loading of miniController themes
    * how do I handle CSS and unsafe scripts?
    * eval() !?!?!?
*/

console.log("writing functions");

// test get request
// testGet('http://jake.teton-landis.org/projects/gsFluid/resources/themes.js');
var get = function(url) { // syncronous gets
	var req = new XMLHttpRequest();
	req.open('GET', url, false);
	req.send(null);
	return req;
}

// extend Object
Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};
function deepCopy(obj) {
    if (Object.prototype.toString.call(obj) === '[object Array]') {
        var out = [], i = 0, len = obj.length;
        for ( ; i < len; i++ ) {
            out[i] = arguments.callee(obj[i]);
        }
        return out;
    }
    if (typeof obj === 'object') {
        var out = {}, i;
        for ( i in obj ) {
            out[i] = arguments.callee(obj[i]);
        }
        return out;
    }
    return obj;
}

console.log("writing mediaKeysPlugin");

// Media Key Support
mediaKeysPlugin = {}; 

console.log("writing gsFluid");

gsFluid = {			// global object
		version: 0.04,
		// hasInitiated: false,
		player: {		// pause play prev next
			isPlaying: function() {
				return GS.player.isPlaying;
			},
			plause: function() {
				return GS.player.pauseSong();
			},
			play: function() {
				return GS.player.resumeSong();
			},
			togglePlay: function() {
				if (GS.player.isPlaying) { return GS.player.pauseSong(); }
				return GS.player.resumeSong();
			},
			next: function() {
				return GS.player.nextSong();
			},
			prev: function() {
				return GS.player.previousSong();
			},
			// Please use data from abstraction whenever possible
			song: function() {
				console.log("retrieving song data");
				if (GS.player.currentSong !== null) {
					console.log("Hooray, the song is defined");
					return {
						title: GS.player.currentSong.SongName,
						album: GS.player.currentSong.AlbumName,
						artist: GS.player.currentSong.ArtistName,
						// return empty string if no cover art
						coverart: (GS.player.currentSong.CoverArtFilename === null) ? "" : GS.player.currentSong.artPath+'m'+GS.player.currentSong.CoverArtFilename,
						duration: Math.floor(GS.player.currentSong.EstimateDuration)/1000 //in seconds
					};
				} else {
					console.log('No song playing');
					return {
						title: "Not Playing",
						album: "",
						artist: "",
						coverart: "",
						duration: 0,
						none: true
					};
				}
			}, 	//end song
		},	//end gsFluid.player
		css: {
			load: function( url ) {
				if ( 0 < url.length ) {
					return $('<link rel="stylesheet" type="text/css" href="'+url+'">').appendTo('head');
				}
				console.log("Failed to load CSS", url);
				return false;
			},
			preloadImg: function( url ) {
				(new Image()).src = url;
			},
			init: function() {
				gsFluid.css.load( gsFluid.resources.r + 'webapp/webapp.css');
				// preload traffic lights
				var lights = ["close_active.png",
					"close_over.png",
					"max_active.png",
					"max_over.png",
					"min_down.png",
					"close_down.png",
					"lights.css",
					"max_down.png",
					"min_active.png",
					"min_over.png"];
				for (var i = lights.length - 1; i >= 0; i--){
					gsFluid.css.preloadImg( gsFluid.resources.r + gsFluid.resources.lights + lights[i] );
				};
			}
		},
		
		nativetheme: {		// set current list showUI (showUI unimplemented)
			init: function() {
				// remap themeing function to prevent ad themes
				eval("GS.theme._setCurrentTheme = "+GS.theme.setCurrentTheme.toString());
				GS.theme.setCurrentTheme = function(themeid, b, fluidtrusted) {
					if (fluidtrusted) { GS.theme._setCurrentTheme(themeid, b); }
					else { GS.theme._setCurrentTheme(93, true); }
				};
				
				// make theme UI trusted
				GS.Controllers.Lightbox.ThemesController.prototype["a.theme click"] = function(a) {
					console.log("switch theme trusted (FROM UI)", a.attr("rel"));
					gsFluid.nativetheme.set(a.attr("rel"));
					GS.guts.logEvent("themeChangePerformed", {theme : $(".title", a).text()});
				};
			},
			set: function(themeID) {
				console.log("Setting theme from gsFluid");
				GS.theme.setCurrentTheme(themeID, true, true);
			},
			current: function(){
				// Returns the whole theme object
				// use currentTheme().themeID to get the ID
				return GS.theme.currentTheme;
			},
			list: function() {
				return GS.theme.themes;
			},
			showUI: function() {											//TODO!!!!!! // who cares
				return false;
			}
		},	// end gsFluid.nativetheme
		
		dock: {
			menu: { // the dock menu management system is cool, you should use it for your other Fluid Projects
				_current: [],
				build: function() { //returns a new menu-array from Grooveshar state
					var menu = [];
					if (typeof GS.player.currentSong === "undefined") {
						menu.push("No Songs");
					} else {
						if (GS.player.isPlaying) {
							menu.push("Playing");
						} else { menu.push("Paused"); }
						menu.push('  '+gsFluid.player.song().title);
						menu.push('  '+gsFluid.player.song().artist);
						 
						// DOCK CONTROL
						
						// ALL THIS DOES IS CRASH FLUID:
						
						// if (GS.player.isPlaying) {
						// 	menu.push( ["Pause", gsFluid.player.togglePlay] );
						// } else { 
						// 	menu.push( ["Play", gsFluid.player.togglePlay] ); 
						// }
						// menu.push( ["Next", gsFluid.player.next] );
						// menu.push( ["Previous", gsFluid.player.prev] );
					}
					return menu.reverse();
				},
				write: function( menu ) { // writes a menu from menu-array
					var i;
					gsFluid.dock.menu.clear();
					console.log("writing menu", menu);
					gsFluid.dock.menu._current = deepCopy(menu);
					for (i = menu.length - 1; i >= 0; i--) {
						if (typeof menu[i] === typeof [] ) {
							window.fluid.addDockMenuItem(menu[i][0], menu[i][1]);
						} else { window.fluid.addDockMenuItem(menu[i]); }
					}
				},
				clear: function() { //clears the current menu
					var i;
					console.log("clearing dock menu");
					for (i = gsFluid.dock.menu._current.length - 1; i >= 0; i--){
						if (typeof gsFluid.dock.menu._current[i] === typeof [] ) {
							 console.log("removing "+gsFluid.dock.menu._current[i][0]);
							window.fluid.removeDockMenuItem(gsFluid.dock.menu._current[i][0]);
						} else { 
							console.log("removing "+gsFluid.dock.menu._current[i]);
							window.fluid.removeDockMenuItem(gsFluid.dock.menu._current[i]); 
						}
					}
					// run again because we're paranoid ? Maybe later
				}
			}, // end gsFluid.dock.menu
			init: function() {
				// check badge sometimes
				gsFluid.dock.badge();
				setTimeout(15000, gsFluid.dock.badge);
				// subscribe menu & growl
				$.subscribe('gs.player.playing', gsFluid.dock.update);
				$.subscribe('gs.player.paused', gsFluid.dock.update);
				$.subscribe('gs.player.stopped', gsFluid.dock.update);
				// $.subscribe('gs.player.queue.change', gsFluid.dock.update);				
				// write initial menu
				gsFluid.dock.menu.write( gsFluid.dock.menu.build() );
			},
			badge: function() {
				console.log("Badging");
				var $badge = jQuery('.nav_count');
				if ($badge.length) {
					window.fluid.dockBadge = $badge.innerText;
				}
			},
			update: function( data ){
				document.title = 'Grooveshark';
				if ( gsFluid.player.isPlaying() ) {
					gsFluid.growl.notificationForSong(gsFluid.player.song());
				}
				gsFluid.dock.menu.write( gsFluid.dock.menu.build() );
				if ( gsFluid.theme.active ) {
					gsFluid.theme.update();
				}
			}
		
		}, // end gsFluid.dock
						
		growl: {		// I'm putting this in an object incase we add other notifications later
			notificationForSong: function(song) {
				var minutes = Math.floor(song.duration/60);
				var seconds = Math.floor(song.duration-minutes*60);
				seconds+="";
				if ( seconds.length === 0 ) { seconds = "00"; }
				if ( seconds.length === 1 ) { seconds = "0"+seconds; }
				window.fluid.showGrowlNotification( {
					title: song.title,
					description: song.artist+"\n"+song.album+"\n"+minutes+":"+seconds,
					sticky: false,
					identifier: "Grooveshark",
					onclick: function() { window.fluid.activate(); }, // Brings Grooveshark to the front
					icon: song.coverart
				} );
			}
		}, // end gsFluid.growl
		
		window: { // controls windows
			absCoords: function ( localX, localY ) {
				// var windowBufferX = window.outerWidth - window.innerWidth;
				// var windowBufferY = window.outerHeight - window.innerHeight;

				// var transformationX = window.screenLeft + windowBufferX;
				// var transformationY = window.screenTop + windowBufferY;

				return [
					localX + window.screenLeft + window.outerWidth - window.innerWidth,
					localY + window.screenTop + window.outerHeight - window.innerHeight
				];
			},
			
			makeBar: function( $el ) {
				$el = jQuery($el); 
				// you can only make draggable once
				if ($el.data('isDraggable')) {
					return false;
				}
				$el.data('isDraggable', true); 
				// prevents mouse from leaving while dragging downwards  
				// the left: 70px hack is to keep the traffic lights clickable.
				// TODO: do this by drawing the traffic lights over the glass Ceiling
				var  $glass = $('<div id="glassCeiling" />').css({
					'position': 'absolute',
					'left': 0,
					// 'border-left': '1px solid red',
					'top': 0,
					'width': '5000px',
					'height': '5000px',
					'z-index': gsFluid.resources.glassIndex
				}).appendTo($el).hide();
				

				// Move the $el by the amount of change in the mouse position  
				var move = function(event) {  
					if($el.data('mouseMove')) {
						var coords = gsFluid.window.absCoords( event.clientX, event.clientY);	

						var changeX = coords[0] - $el.data('mouseX');  
						var changeY = coords[1] - $el.data('mouseY');// - (window.outerHeight-window.innerHeight);  
						//console.log("change",changeX, changeY);

						var newX = window.screenLeft + changeX;  
						var newY = window.screenTop + changeY;  

						// $el.css('left', newX);  
						// $el.css('top', newY);  
						//window.moveTo(newX, newY);
						window.moveBy(changeX,changeY);

						$el.data('mouseX', coords[0]);  
						$el.data('mouseY', coords[1]);  
						//console.log("window at ",window.screenLeft,window.screenTop);
					}  
				};  

				$el.mousedown(function(event) {    
					$glass.show();
					//console.log('mouse down in ', $el, event);
					$el.data('mouseMove', true);             
					var coords = gsFluid.window.absCoords( event.clientX, event.clientY);
					$el.data('mouseX', coords[0]);  
					$el.data('mouseY', coords[1]);  
				});  

				$el.parents(':last').mouseup(function() {  
					//console.log('mouse up in ', $el, event); 
					$glass.hide();
					$el.data('mouseMove', false); 
				});  

				$el.mouseout(move);  
				$el.mousemove(move);  

				// this isn't jQuery unless it returns the element.
				console.log("This element now is a window draggable", $el);
				return $el;
			}, // end makeBar
			drawTrafficLights: function( $el ) {   
				$el = $($el);
				var lightProto = $('<a />').addClass('trafficLight');
				
				// now uses css
				$('head').append('<link rel="stylesheet" type="text/css" href="'+gsFluid.resources.r+gsFluid.resources.lights+'/lights.css" />');
				
					
				var close = lightProto.clone().addClass('closeButton').mouseup(function(){
						console.log('trying to terminate');
						window.fluid.terminate();
					}).appendTo($el);
				
				var minimize = lightProto.clone().addClass('minimizeButton').mouseup(function(){
							console.log('trying to hide');
							window.fluid.hide();
							
							// we pass 'this' along for a place to save isMinimized and other data
							//gsFluid.window.toggleSmall( this );
							gsFluid.window.toggleMinimize();
							
						}).appendTo($el);

				var maximize = lightProto.clone().addClass('maximizeButton').mouseup(function(){
							console.log('trying to maximize');
							gsFluid.window.toggleMaximize();
						}).appendTo($el);
					
				return $el;
			}, // end gsFluid.window.drawTrafficLights 
			
			toggleMinimize: function() { // wrapper function. delicious abstraction
				if ( gsFluid.theme.selected ) {
					gsFluid.window.toggleMinimizeToTheme( gsFluid.theme.selected );
				} else {
					console.log("No microController theme selected");
					gsFluid.window.toggleSmall();
				}
			}, // end toggleMinimize
			
			//MINTHEME 
			toggleMinimizeToTheme: function ( theme ) {
				if ( gsFluid.window.minimizedDimensions ) {
					$('#microController .minimizeButton').insertAfter( $('#header .closeButton') );
					
					gsFluid.theme.remove();
					
					window.resizeTo(gsFluid.window.minimizedDimensions.w, gsFluid.window.minimizedDimensions.h);
					gsFluid.window.minimizedDimensions = false;    
					    
				} else {
					gsFluid.window.minimizedDimensions = {w: window.outerWidth, h: window.outerHeight, x: window.screenLeft, y: window.screenTop};
					gsFluid.window.aboutToResize = true;
					window.resizeTo(theme.width, theme.height);
					
					// make sure theme works before commiting
					if ( !gsFluid.theme.apply( theme ) ){
						gsFluid.window.toggleMinimizeToTheme();
						return false;
					}
					
					//TODO: find a new place for the following
					$('#header .minimizeButton').appendTo($('#microController '+theme.minimizeButtonDestination));
				}
				
				
			}, //end toggleMinimizeToTheme
			toggleSmall: function() {
				if ( gsFluid.window.minimizedDimensions ) {
					
					window.resizeTo(window.outerWidth, gsFluid.window.minimizedDimensions.h);
					//window.moveTo($store.data('normalSize').x, $store.data('normalSize').y);
					gsFluid.window.minimizedDimensions = false;
					if (gsFluid.window.didHideQueue === true) {
						$('#showQueue').click();
						gsFluid.window.didHideQueue = null;
					}
					
				} else {
					// make sure queue is hidden
					if ( $('#queue').css('display') !== 'none' ) {
						gsFluid.window.didHideQueue = true;
						$('#showQueue').click();
					};
					
					gsFluid.window.aboutToResize = true;
					gsFluid.window.minimizedDimensions = {w: window.outerWidth, h: window.outerHeight, x: window.screenLeft, y: window.screenTop};
					window.resizeTo(window.outerWidth, 109); // small, should show only the playbar and titlebar
				}
			},//end toggleSmall
			toggleMaximize: function() {
				if ( gsFluid.window.minimizedDimensions ) {
					window.resizeTo(gsFluid.window.minimizedDimensions.w, gsFluid.window.minimizedDimensions.h);
					window.moveTo(gsFluid.window.minimizedDimensions.x, gsFluid.window.minimizedDimensions.y);
					gsFluid.window.minimizedDimensions = false;
				} else {
					gsFluid.window.aboutToResize = true;
					gsFluid.window.minimizedDimensions = {w: window.outerWidth, h: window.outerHeight, x: window.screenLeft, y: window.screenTop};
					window.resizeTo(5000,5000); // should be big enough.
				}
			},//end toggleMaximize		
			init: function() {
				// the window is now draggable by the header bar  
				//traffic lights
				gsFluid.window.drawTrafficLights( $('#header') );
				
				gsFluid.window.makeBar( $('#header') );
				
				// move header contents right so we can make some traffic lights
				$('#grooveshark').css('left', 80);
				$('#nav').css('left', 215);
				
				// manage handling previous sizing with minify/maximize
				$(window).resize(function () {  //TODO : make this neater with recognizing when to make false;
					if (!gsFluid.theme.active) {
						if (gsFluid.window.aboutToResize) {
							gsFluid.window.aboutToResize = false;
						} else {
							gsFluid.window.minimizedDimensions = false;
						}
					} else {
						return false;
					}
				});	
			} // end init
		}, // end gsFluid.window
		
		// @THEME
		theme: {
			current:	false,
			active:		false,
			repo:		false,	// stores theme data downloaded from gsFluid.resources.r/themes/list.json,
								// or the theme itself after it is downloaded
			get: function( themeRef ) { // themeRefs are the info stubs in repositories
				if ( gsFluid.theme.validateRef(themeRef) ){
					var theme;
					// load base theme.js file
					var req = get(gsFluid.theme.repo.path + themeRef.shortname + '/theme.js');
					// themes aren't strict JSON yet so we can't use this
					// theme = JSON.parse(req.responseText);
					// instead, eval()
					eval('theme = ' + req.responseText);
					
					// get HTML, make replacements, attatch to theme
					req = get(gsFluid.theme.repo.path + themeRef.shortname + '/theme.html');
					theme.html = req.responseText.replace(theme.resources, gsFluid.theme.repo.path + themeRef.shortname);

					// get CSS, make replacements, attatch to theme
					req = get(gsFluid.theme.repo.path + themeRef.shortname + '/theme.css');
					theme.css = req.responseText.replace(theme.resources, gsFluid.theme.repo.path + themeRef.shortname);

					// get custom JS, if we use it
					if (theme.customJS) {
						req = get(gsFluid.theme.repo.path + themeRef.shortname + '/custom.js');
						theme.customJS = req.responseText;
					}
					// validate
					if ( gsFluid.theme.validate(theme) ){
						gsFluid.theme.repo.themes[themeRef.shortname] = theme;
						return theme;
					} else {
						console.log("Bad theme", theme);
						return false;
					}
				} else {
					console.log("Bad themeRef", themeRef);
					return false;
				}
			},
			getRepo: function( url ){
				if (!url) {
					console.log("No URL");
					return false;
				}
				console.log("Attempting to retrieve theme repo at", url);
				
				$.ajax({
					url:		url,
					global:		false, // don't want to mess with Grooveshark
					cache: 		false,
					dataType: 	"json", 
					success:	function( data, textStatus, req ) {
						// console.log("SUCCESS", data, textStatus);
						if (typeof data === 'object' && data.path && data.name && (Object.size(data.themes) > 0) ) {
							// if everything is ok, then...
							gsFluid.theme.repo = data;
							return true;
						} else {
							console.log("invalid theme repo");
							return false;
						}
					} 
				});
				
			},
			validate: function( theme ) {
				if ( 
					(theme.html.length > 0) && 
					(theme.css.length > 0) && 
					theme.width && 
					theme.height && 
					theme.metadata && 
					(theme.metadata.gsFluidMinVersion <= gsFluid.version) &&
					minimizeButtonDestination &&
					theme.resources 
				) {
					return true;
				}
				if (theme.metadata.gsFluidMinVersion > gsFluid.version) {
					console.log("This theme is too new for your version of Grooveshark Desktop", theme);
					return false;
				}
				console.log("theme", theme, "failed validation");
				return false;
			},
			validateRef: function( themeRef ){
				if (
					(themeRef.fullname.length > 0) &&
					(themeRef.shortname.length > 0)
				) {
					return true;
				}
				console.log("themeRef", themeRef, "failed validation");	
				return false;
			},
			apply: function( theme ){ //TODO: rewrite without replace() to match new theme format
				// validate theme
				if ( gsFluid.theme.validate(theme) ) {
					// Hide everything
					//$('#mainContainer').hide();
					$('#mainContainer').css({
						'visibility': 'hidden'
					});
					// add custom CSS
					$('head').append('<style id="microControllerCSS" type="text/css" media="screen">'+theme.css.replace(theme.resources, gsFluid.resources.r)+'</style>');
					// add custom HTML
					$('body').prepend(theme.html.replace(theme.resources, gsFluid.resources.r)).addClass('microControllerEnabled');

					if (theme.customJS) {
						$('head').append('<script id="microControllerJS" type="text/javascript">'+theme.customJS+'</script>');
						gsFluid.theme.current = theme;
						gsFluid.theme.active = true;
						
					} else {
						var song = gsFluid.player.song();
						// SET UP ACTIONS USING SUPPLIED SELECTORS
						//menubar
						gsFluid.window.makeBar( $('#microController '+theme.drag) );
						// pause/play button
						$('#microController '+theme.play).mouseup(function(e){
							gsFluid.player.togglePlay();
							$(this).toggleClass(gsFluid.theme.current.pause);
						});
						if ( !gsFluid.player.isPlaying() ) {
							$('#microController '+theme.play).addClass(theme.pause);
						}
						// next
						$('#microController '+theme.next).mouseup( gsFluid.player.next );
						// prev
						$('#microController '+theme.prev).mouseup( gsFluid.player.prev );
						
						gsFluid.theme.current = theme;
						gsFluid.theme.active = true;
						
						gsFluid.theme.progressInterval = setInterval( "gsFluid.theme.updateProgress()", 500 );
						
						
						gsFluid.theme.update();
					}
				} else {
					console.log("Invalid theme", theme);
					return false;
				}
			}, // end applyTheme
			updateProgress: function() { 
				// PRIVATE API ACCESS // REFACTOR INTO gsFluid.player.progress
				var stat = GS.player.getPlaybackStatus();
				if ( stat ) {
					var p = gsFluid.theme.current.progress;
					u = (p.max - p.min) * Math.min(1, stat.position / stat.duration) + p.min;
					u = isNaN(u) ? 0 : u;
					// console.log('Progress', u);
					$('#microController '+p.selector).css(p.property, u+p.units);
				}
			},
			update: function() {
				var song = gsFluid.player.song();
				var theme = gsFluid.theme.current;
				// art
				if ( (song.coverart.length === 0) || (song.coverart == 'http://beta.grooveshark.com/static/amazonart/mdefault.png') ) {
					song.coverart = theme.noartfile.replace(theme.resources, gsFluid.resources.r);
				}
				$('#microController '+theme.art+' img').attr('src', song.coverart );
				// song info
				$('#microController '+theme.song.title).text( song.title );
				$('#microController '+theme.song.artist).text( song.artist );
				$('#microController '+theme.song.album).text( song.album );
			
				
			}, //end update
			remove: function() {
				// remove progressbar updater
				clearInterval( gsFluid.theme.progressInterval );
				
				$('#microControllerCSS').remove();
				$('#microController').remove();
				$('#microControllerJS').remove();
				$('#mainContainer').css({
					'visibility': 'visible'
				});   
				gsFluid.theme.active = false;
			}, // end remove
			init: function() {
				gsFluid.theme.getRepo( gsFluid.resources.r+'themes.js' );
			} // end init
			
			
			
			
		}, //end gsFluid.theme
		
		resources: {  //SETTINGS
			glassIndex: -2,
			r: 'http://jake.teton-landis.org/projects/gsFluid/resources/',
		//	repo: 'themes.js',
			lights: 'smalltraffic/'
		}, // end gsFluid.resources
		
		enablePremium: function() {
			GS.user.IsPremium = 1;
			GS.ad.update();
		},
		
		init: function() {
			console.log('Initializing gsFluid, the unofficial Grooveshark Desktop client');
			console.log('(c) 2011 Jake Teton-Landis <just.1.jake@gmail.com>');
			console.log('version:', gsFluid.version);
			
			console.log("Initializing gsFluid.nativetheme");
			gsFluid.nativetheme.init();
			
			console.log("running gsFluid.enablePremium");
			gsFluid.enablePremium();
			
			console.log("Initializing gsFluid.dock");
			gsFluid.dock.init();
			
			mediaKeysPlugin = { // In my ideal world this works for apple remote too
				forward: gsFluid.player.next,
				backward: gsFluid.player.prev,
				play: gsFluid.player.togglePlay
			};	
			
			console.log("Initializing gsFluid.window");
			gsFluid.window.init();
			
			console.log("Initializing gsFluid.theme");
			gsFluid.theme.init();
			
			console.log("Initializing userstyle");
			gsFluid.css.init();
		}
}; // end gsFluid

// This script is currently for Fluid.app SSBs only
(function () {
    if (window.fluid) {
			gsFluid.isFluidInstance = true;
			gsFluid.init();
    }
})();