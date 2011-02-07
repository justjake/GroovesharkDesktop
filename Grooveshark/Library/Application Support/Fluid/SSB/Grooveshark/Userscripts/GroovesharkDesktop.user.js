// ==UserScript==
// @name        Grooveshark Desktop
// @version		0.044
// @namespace   http://fluidapp.com
// @description The unofficial Grooveshark desktop client, built withg Fluid. Features dock control, badges for social notifications, premium mode, and Growl notifications.
// @include     http://listen.grooveshark.com/*
// @author      Jake Teton-Landis <just.1.jake@gmail.com>
// ==/UserScript==

/* TODO
make app display spash screen until my userscript is loaded
Re-premium on login/logout
make cursor a mouse pointer when dragging, its a text selector right now
store/load prefs
make sure load order is good
make this shit cross-platform
*/

console.log("writing functions");

// test get request
// testGet('http://jake.teton-landis.org/projects/gsFluid/resources/themes.js');
var get = function(url) { // syncronous gets
	var req = new XMLHttpRequest();
	try {
		req.open('GET', url, false);
		req.send(null);
		return req;
	} catch(err) {
		console.log("GET failed with error", err);
		return false;
	}
};

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
/** @namespace */
gsFluid = {			// global object
		/** @constant */
		version: 0.044,
		// hasInitiated: false,
		/** @namespace Contains functions for determining the state of Grooveshark */
		player: {		// pause play prev next
			lastSong: false,
			lastState: false,
			state: function() {
				if (GS.player.isPlaying) {return 1;}
				if (GS.player.isPaused)  {return 2;}
				return 0;
			},
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
			/**
			Returns data on the currently playing song
			song.title:		The title of the song
			song.album:		The album of the song
			song.artist:	the song's artist
			song.coverart:	URL to coverart of song.
			song.duration:	Estimated length of the song.
			song.id:		Song's unique identification number
			(If there is no song) song.none == true
			@type SongObject
			*/
			song: function() {
				if (GS.player.currentSong !== null) {
					return {
						title: GS.player.currentSong.SongName,
						album: GS.player.currentSong.AlbumName,
						artist: GS.player.currentSong.ArtistName,
						// return empty string if no cover art
						coverart: (GS.player.currentSong.CoverArtFilename === null) ? "" : GS.player.currentSong.artPath+'m'+GS.player.currentSong.CoverArtFilename,
						duration: Math.floor(GS.player.currentSong.EstimateDuration)/1000, //in seconds
						id: GS.player.currentSong.SongID 
					};
				} else {
					return {
						title:		"Not Playing",
						album:		"",
						artist:		"",
						coverart:	"",
						duration:	0,
						id:			null,
						none:		true
					};
				}
			}, 	//end song
			progress: function(){
				var stat = GS.player.getPlaybackStatus();
				if ( stat ) {
					u = Math.min(1, stat.position / stat.duration);
					return isNaN(u) ? 0 : u;
				}
				return false;
			},
			event: function() {
				var s = gsFluid.player.song(), state = gsFluid.player.state();
				console.log("gsFluid.event");
				// store the last song
				if ( !gsFluid.player.lastSong ) {
					gsFluid.player.lastSong = s;
				}
				// store playstate
				if (gsFluid.player.lastState === false) {
					gsFluid.player.lastState = state;
				}
				
				// player state
				if (gsFluid.player.lastState !== state ) {
					gsFluid.player.lastState = state;
					console.log("gsFluid.playStateChanged");
					$.publish("gsFluid.playStateChanged", state );
				}
				
				// on album art change
				if (gsFluid.player.lastSong.coverart !== s.coverart) {
					console.log("gsFluid.artworkChanged");
					$.publish("gsFluid.artworkChanged", s.coverart);
				}
				
				// on track change
				if ( gsFluid.player.lastSong.id !== s.id ) {
					gsFluid.player.lastSong = s;
					console.log("gsFluid.songChanged");
					$.publish("gsFluid.songChanged", s );
				}
			},
			init: function(){
				$.subscribe('gs.player.playing', gsFluid.player.event);
				$.subscribe('gs.player.paused', gsFluid.player.event);
				$.subscribe('gs.player.stopped', gsFluid.player.event);
			}
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
				var i, lights;
				gsFluid.css.load( gsFluid.resources.r + 'webapp/webapp.css');
				// preload traffic lights
				lights = ["close_active.png",
					"close_over.png",
					"max_active.png",
					"max_over.png",
					"min_down.png",
					"close_down.png",
					"lights.css",
					"max_down.png",
					"min_active.png",
					"min_over.png"];
				for (i = lights.length - 1; i >= 0; i--){
					gsFluid.css.preloadImg( gsFluid.resources.r + gsFluid.resources.lights + lights[i] );
				}
			}
		},
		native: {
			lightbox: {
				open: function (a,b, gsFluidOrigin) { // FROM GROOVESHARK'S app.js CODE
					var c = this.queue.indexOf(a), d = _.orEqual(this.priorities[a], 0);
					b = _.orEqual(b, null);
					var f = this;
					if (this.curType === a) {return false;}
					this.queuedOptions[a] = b;
					if (d < this.currentPriority) { this.queue.indexOf(a) === - 1 && this.queue.push(a); }
					else {
						this.curType && this.queue.indexOf(this.curType) === - 1 && this.queue.push(this.curType);
						if (! (this.queue.length && c !== - 1 && c > - 1)) {
							this.curType = a;
							this.currentPriority = d;
							this.isOpen = true;
							// what does this do???!?!??!?
							if (!gsFluidOrigin) {
								$("#lightbox_wrapper .lbcontainer." + a)[$.String.underscore("gs_lightbox_" + a)](b);
							}
							$("#lightbox .lbcontainer." + a).show(1, (function () {
								f.positionLightbox();
								$(this).find("form input:first:visible").focus();
							} )).siblings().hide();
							// if (!gsFluidOrigin) {
								this.trackLightboxView(a);
							// }
							if ($("#lightbox_wrapper").is(":visible")) {
								this.queue.indexOf(a) === - 1 && this.queue.unshift(a);
							} else {
								this.queue.indexOf(a) === - 1 && this.queue.push(a);
							}
							$("#theme_home .flash object").css("visibility", "hidden");
							$("#lightbox_wrapper,#lightbox_overlay").show();
							this.notCloseable.indexOf(this.curType) == - 1 ? $("#lightbox_close").show() : $("#lightbox_close").hide();
						}
					}
				}, // end open
				close: function ( gsFluidOrigin ) {
					var a, b;
					a = this.queue.shift();
					if (_.defined(a)) {
						$("#lightbox_wrapper .lbcontainer." + a).hide();
						if ( !gsFluidOrigin ) {
							a !== "login" && $("#lightbox_wrapper .lbcontainer." + a).empty().controller().destroy();
						}
					}
					this.currentPriority = this.curType = false;
					if (this.queue.length > 0) {
						this.queue = this.sortQueueByPriority(this.queue);
						a = this.queue.shift();
						b = this.queuedOptions[a];
						this.open(a, b);
					} else {
						this.isOpen = this.currentPriority = this.curType = false;
						$("#lightbox_wrapper,#lightbox_overlay").hide();
						$("#theme_home .flash object").css("visibility", "visible");
					}
				}, //end close
				closeclick: function( a, b ) {
					b.preventDefault();
					console.log("lightbox close");
					if ($("#lightbox_wrapper .lbcontainer.gsFluid").css('display') === "block") {
						GS.lightbox.close(true);
						gsFluid.lightbox.remove();
					} else {
						GS.lightbox.close();	
					}		  
				},
				init: function() {
					// replace functions
					GS.lightbox.open = gsFluid.native.lightbox.open;
					GS.lightbox.close = gsFluid.native.lightbox.close;
					GS.Controllers.LightboxController.prototype[".close click"] = gsFluid.native.lightbox.closeclick;
				}
			},// end gsFluid.native.lightbox
			theme: {		// set current list showUI (showUI unimplemented)
				n: { // holds replacements
					themeButtonClick: function(a) {
						console.log("switch theme trusted (FROM UI)", a.attr("rel"));
						gsFluid.native.theme.set(a.attr("rel"));
						GS.guts.logEvent("themeChangePerformed", {theme : $(".title", a).text()});
					},
					setCurrentTheme: function(themeid, b, fluidtrusted) {
						if (fluidtrusted) { 
							GS.theme._setCurrentTheme(themeid, b); 
						} else { 
							if (gsFluid.pref.p.nativeThemeID) {
								GS.theme._setCurrentTheme(gsFluid.pref.p.nativeThemeID, true); 
							} else {
							GS.theme._setCurrentTheme(93, true); 
							}
						}
					}
				}, // end native.theme.n
				set: function(themeID) {
					console.log("Setting theme from gsFluid");
					GS.theme.setCurrentTheme(themeID, true, true);
					//@ TODO: save theme to preferences
					gsFluid.pref.p.nativeThemeID = themeID;
				},
				current: function(){
					// Returns the whole theme object
					// use currentTheme().themeID to get the ID
					return GS.theme.currentTheme;
				},
				list: function() {
					return GS.theme.themes;
				},
				showUI: function() {
					// PRIVATE API ACCESS
					GS.lightbox.open("theme");
				},
				init: function() {
					// remap themeing function to prevent ad themes
					eval("GS.theme._setCurrentTheme = "+GS.theme.setCurrentTheme.toString());
					GS.theme.setCurrentTheme = gsFluid.native.theme.n.setCurrentTheme;

					// make theme UI trusted
					GS.Controllers.Lightbox.ThemesController.prototype["a.theme click"] = gsFluid.native.theme.n.themeButtonClick;
				}
			},	// end gsFluid.native.theme
			auth: {		// make sure we're always premium mode.
				 _loginSuccess: function (b,c,d,f) {
					if (f && f.userID == 0 || ! f) { return this._loginFailed(b, d, f); }
					console.log("login.success", f);
					f.authType = b;
					b == "reauth" && f.userID === GS.user.UserID || GS.service.getUserByID(f.userID, this.callback(this._updateUser, f));
					a.isFunction(c) && c(f);
					gsFluid.enablePremium(); // modification
					return f;
				}, 
				_loginFailed: function (b,c,d) {
					d || (d = {});
					d.authType = b;
					console.log("login.failed", d);
					b == "reauth" && this._logoutSuccess({});
					a.isFunction(c) && c(d);
					gsFluid.enablePremium(); // modification
					return d;
				},				
				init: function() {
					GS.auth._loginSucces = gsFluid.native.auth._loginSuccess;
					GS.auth._loginFailed = gsFluid.native.auth._loginFailed;
				}
			},
			init: function() {
				gsFluid.native.theme.init();
				gsFluid.native.lightbox.init();
				//@ TODO: needs fixing
//				gsFluid.native.auth.init();
			}
		},// end gsFluid.native
	
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
				document.title = 'Grooveshark';
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
						// We're doing better things now.
						// window.fluid.hide();
						gsFluid.window.toggleMinimize();
					}).appendTo($el);

				var maximize = lightProto.clone().addClass('maximizeButton').mouseup(function(){
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
					}
					
					gsFluid.window.aboutToResize = true;
					gsFluid.window.minimizedDimensions = {w: window.outerWidth, h: window.outerHeight, x: window.screenLeft, y: window.screenTop};
					window.resizeTo(window.outerWidth, 108); // small, should show only the playbar and titlebar
				}
			},//end toggleSmall
			toggleMaximize: function() {
				if ( gsFluid.window.minimizedDimensions ) {
					gsFluid.window.aboutToResize = true;
					window.resizeTo(gsFluid.window.minimizedDimensions.w, gsFluid.window.minimizedDimensions.h);
					window.moveTo(gsFluid.window.minimizedDimensions.x, gsFluid.window.minimizedDimensions.y);
					gsFluid.window.minimizedDimensions = false;
				} else {
					gsFluid.window.aboutToResize = true;
					gsFluid.window.minimizedDimensions = {w: window.outerWidth, h: window.outerHeight, x: window.screenLeft, y: window.screenTop};
					window.resizeTo(5000,5000); // should be big enough.
				}
			},//end toggleMaximize		
			resizeTrackingCallback: function(){
				if (!gsFluid.theme.active) {
					if (gsFluid.window.aboutToResize) {
						gsFluid.window.aboutToResize = false;
					} else {
						gsFluid.window.minimizedDimensions = false;
					}
				} else {
					return false;
				}
			},
			init: function() {
				// the window is now draggable by the header bar  
				//traffic lights
				gsFluid.window.drawTrafficLights( $('#header') );
				
				gsFluid.window.makeBar( $('#header') );
				
				// move header contents right so we can make some traffic lights
				$('#grooveshark').css('left', 80);
				$('#nav').css('left', 215);
				
				// manage handling previous sizing with minify/maximize
				$.subscribe("window.resize", gsFluid.window.resizeTrackingCallback);
			} // end init
		}, // end gsFluid.window
		
		// @THEME
		theme: {
			selected:	false,  // currently selected theme
			current:	false,	// current theme object
			active:		false,	// is the theme active?
			repo:		false,	// stores theme data downloaded from gsFluid.resources.r/themes/list.json,
								// or the themes themselves after downloading
			get: function( themeRef ) { // themeRefs are the info stubs in repositories
				if ( gsFluid.theme.validateRef(themeRef) ){
					var i, req, imgurls, theme, themePath = gsFluid.theme.repo.path + themeRef.shortname + '/';
					// load base theme.js file
					req = get(themePath + 'theme.js');
					// themes aren't strict JSON yet so we can't use this
					// theme = JSON.parse(req.responseText);
					// instead, eval()
					eval('theme = ' + req.responseText);
					theme.r = themePath;
					
					// get HTML, make replacements, attatch to theme
					req = get(themePath + 'theme.html');
					theme.html = req.responseText.replace(theme.resources, themePath);

					// get CSS, make replacements, attatch to theme
					req = get(themePath + 'theme.css');
					theme.css = req.responseText.replace(theme.resources, themePath);
					
					// get images from CSS so we can quickload them later
					imgurls = theme.css.match(/url\((".*?")\)/g);
					for ( i = imgurls.length - 1; i >= 0; i--){
						// get the url
						imgurls[i] = imgurls[i].split('"')[1];
					}
					theme.images = imgurls;
					
					// get custom JS, if we use it
					if (theme.customJS) {
						req = get(themePath + 'custom.js');
						theme.customJS = req.responseText;
					}
					
					// set resources path
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
					console.log("getRep: No URL");
					return false;
				}
				console.log("Attempting to retrieve theme repo at", url);
				var req = get(url);
				if (req) {
					var data = JSON.parse(req.responseText);
					if (typeof data === 'object' && data.path && data.name && (Object.size(data.themes) > 0) ) {
						// we need a no-theme theme in the repo so we can select to not use a theme.
						data.themes["false"] = false;
						gsFluid.theme.repo = data;
						return true;
					} else {
						console.log(data, "is an invalid theme repo");
						return false;
					}
				} else {
					console.log("getRepo: GET to", url, "failed");
					return false;
				}
				
			},
			validate: function( theme ) {
				try {
					if ( 
						(theme.html.length > 0) && 
						(theme.css.length > 0) && 
						theme.width && 
						theme.height && 
						theme.metadata && 
						// validates metadata; this is the most important bit
						theme.metadata.shortname &&
						theme.metadata.fullname &&
						theme.metadata.preview &&
						// (theme.metadata.gsFluidMinVersion <= gsFluid.version) &&
						theme.minimizeButtonDestination &&
						theme.resources &&
						theme.drag
					) {
						return true;
					}
					if (theme.metadata.gsFluidMinVersion > gsFluid.version) {
						console.log("This theme is too new for your version of Grooveshark Desktop \n please upgrade to the newest version by visiting http://jake.teton-landis.org/projects/gsFluid", theme);
						return false;
					}
				} catch(err) {
					console.log("theme", theme, "failed validation with error", err);
					return false;
				}
				console.log("theme", theme, "failed validation");
				return false;
			},
			validateRef: function( themeRef ){
				if (themeRef) { // discard false out of hand and with silence
					try {
						if (
							(themeRef.fullname.length > 0) &&
							(themeRef.shortname.length > 0)
						) {
							return true;
						}
					} catch(err) { 
						console.log("themeRef", themeRef, "failed validation with error", err);	
						return false;	
					}
					console.log("themeRef", themeRef, "failed validation");	
					return false;
				}
				return false;
			},
			apply: function( theme ){
				// validate theme
				if ( gsFluid.theme.validate(theme) ) {
					var i;
					// Hide everything
					//$('#mainContainer').hide();
					$('#mainContainer').css({
						'visibility': 'hidden'
					});
					// preload CSS images
					try {
						for ( i = theme.images.length - 1; i >= 0; i--){
							gsFluid.css.preloadImg( theme.images[i] );
						}
					} catch (err) {
						console.log("Trouble preloading images", theme.images, " for theme", theme);
					}
					// add custom CSS
					$('head').append('<style id="microControllerCSS" type="text/css" media="screen">'+theme.css+'</style>');
					// add custom HTML
					$('body').prepend(theme.html).addClass('microControllerEnabled');

					if (theme.customJS) {
						$('head').append('<script id="microControllerJS" type="text/javascript">'+theme.customJS+'</script>');						
					}
					// SET UP ACTIONS USING SUPPLIED SELECTORS
					//menubar
					gsFluid.window.makeBar( $('#microController '+theme.drag) );
					
					gsFluid.theme.current = theme;
					gsFluid.theme.active = true;
					
					// initiate theme's functions
					gsFluid.theme.statusUpdateInterval = setInterval( "gsFluid.theme.current.statusUpdate()", 500 );
					$.subscribe("gsFluid.artworkChanged", gsFluid.theme.current.artworkChanged);
					$.subscribe("gsFluid.songChanged", gsFluid.theme.current.songChanged);
					$.subscribe("gsFluid.playStateChanged", gsFluid.theme.current.playStateChanged);
					gsFluid.theme.current.themeReady();
					
					// success!
					return true;
				} else {
					console.log("Invalid theme", theme);
					return false;
				}
			}, // end applyTheme
			remove: function() {
				// remove progressbar updater
				clearInterval( gsFluid.theme.statusUpdateInterval );
				
				$('#microControllerCSS').remove();
				$('#microController').remove();
				$('#microControllerJS').remove();
				$('#mainContainer').css({
					'visibility': 'visible'
				});   
				gsFluid.theme.active = false;
			}, // end remove
			select: function( themeOrRef ) {
				if (themeOrRef) {
					if ( gsFluid.theme.validateRef(themeOrRef) ) {
						gsFluid.theme.selected = gsFluid.theme.get(themeOrRef);
						gsFluid.pref.p.themeShortname = gsFluid.theme.selected.metadata.shortname;
						gsFluid.pref.save();
						return true;
					} else if ( gsFluid.theme.validate(themeOrRef) ) {
						gsFluid.theme.selected = themeOrRef;
						gsFluid.pref.p.themeShortname = gsFluid.theme.selected.metadata.shortname;
						gsFluid.pref.save();
						return true;
					}
					console.log("Selecting theme", themeOrRef, "failed");
					return false;
				} else {
					console.log("Clearing theme selection");
					gsFluid.theme.selected = false;
					gsFluid.pref.p.themeShortname = false;
				}
			}, // end select
			init: function() {
				gsFluid.theme.getRepo( gsFluid.resources.r+'themes.js' );
				if (gsFluid.pref.p.themeShortname) {
					gsFluid.theme.select( gsFluid.theme.repo.themes[gsFluid.pref.p.themeShortname]);
				}
			} // end init
		}, //end gsFluid.theme
		lightbox: {
			el: {
				title: null,
				content: null
			},
			lbcontainer: '<div class="lbcontainer gsFluid"  > <!-- "gs_lightbox_gsFluid" style="display: none; " -->  <div id="lightbox_header">  <div class="cap right">  <div class="cap left">  <div class="inner">  <h3>Grooveshark Desktop Mini</h3>   </div>  </div>  </div>  </div>  <div id="lightbox_content" class="gsFluid">  <div id="gsFluid_content" class="gsFluid">  <!--$CONTENT_HERE-->  </div>  <div id="lightbox_footer">  <div class="shadow"></div>  <div class="highlight"></div>  <ul class="right">  <li class="first last">  <button class="btn btn_style4 close" type="button">  <div>  <span>Close</span>  </div>  </button>  </li>  </ul>  <div class="clear"></div>  </div>  <div class="clear"></div>  </div> </div>',
			show: function( HTMLview, title ) {
				// PRIVATE API USE
				gsFluid.lightbox.el.content.html( HTMLview );
				gsFluid.lightbox.el.title.text( title );
				GS.lightbox.open("gsFluid",null,true);
			},
			close: function() {
				// PRIVATE API USE
				GS.lightbox.close(true);
				gsFluid.lightbox.remove();
			},
			remove: function() {
				gsFluid.lightbox.el.content.empty();
			},
			init: function(){
				$(gsFluid.lightbox.lbcontainer).appendTo( $('#lightbox') );
				gsFluid.lightbox.el.content = $("#gsFluid_content");
				gsFluid.lightbox.el.title = $(".lbcontainer.gsFluid .inner h3");
			}
		}, //end gsFluid.lightbox
		ui: {
			init: function() {
				$('<li class="last"><button class="btn btn_style1" id="gsFluid_theme_button"><span class="label">Mini Themes</span></button></li>').addClass('.gsFluidButton').appendTo( $('#userOptions') );
				$('li.locales').removeClass('last');
				gsFluid.ui.themebutton = $("#gsFluid_theme_button").mouseup( gsFluid.ui.themeButtonClick );
			},
			themeButtonClick: function(e){
				gsFluid.lightbox.show( gsFluid.ui.listForRepo(gsFluid.theme.repo), "Grooveshark Destkop Mini" );
				$('.gsFluid_theme > a').click(function(){
					$(this).parent().siblings().children().removeClass('selected');
					$(this).addClass('selected');
					gsFluid.theme.select( gsFluid.theme.repo.themes[$(this).attr('rel')] );
				});
			},
			listForRepo: function( repo ){
				var html = '<div class="lightbox_content_block"> 	<p>Theme selections will be saved via a cookie. Press the minimize button to activate the microcontroller.</p> 	<div class="clear noHeight"></div> </div> <div class="lightbox_content_block separatedContent"> 	<div class="shadow"></div>';
				html += '<ul>';
				for (theme in repo.themes) {
					if (gsFluid.theme.validateRef(repo.themes[theme]) ) {
						html+='<li class="gsFluid_theme">';
						html+=	'<a rel="'+repo.themes[theme].shortname+'">';
						html+=		'<img src="'+repo.path+repo.themes[theme].shortname+'/'+repo.themes[theme].preview+'" alt="'+repo.themes[theme].fullname+'" />';
						html+=		'<div class="gsFluid_name">'+repo.themes[theme].fullname+'</div>';
						html+=		'<div class="gsFluid_author">'+repo.themes[theme].author+'</div>';
						html+=	'</a>';
						html+='</li>';
					} else if (gsFluid.theme.validate(repo.themes[theme]) ) {
						html+='<li class="gsFluid_theme">';										// this theme is selected! make it look like it!
						try {
							html+=	'<a rel="'+repo.themes[theme].metadata.shortname+'" class="' + ( (gsFluid.theme.selected.metadata.shortname == repo.themes[theme].metadata.shortname) ? "selected" : "") + '">';
						} catch(er) {
							html+=	'<a rel="'+repo.themes[theme].metadata.shortname+'" >';
						}
						html+=		'<img src="'+repo.path+repo.themes[theme].metadata.shortname+'/'+repo.themes[theme].metadata.preview+'" alt="'+repo.themes[theme].fullname+'" />';
						html+=		'<div class="gsFluid_name">'+repo.themes[theme].metadata.fullname+'</div>';
						html+=		'<div class="gsFluid_author">'+repo.themes[theme].metadata.author+'</div>';
						html+=	'</a>';
						html+='</li>';
					}
				}
				html+='<li class="gsFluid_theme">';
				html+=	'<a rel="'+false+'" class="'+( (gsFluid.theme.selected === false) ? "selected" : "")+'">';
				html+=		'<img src="'+gsFluid.resources.r+'img/noMinTheme.png" alt="Standard minify behavior" />';
				html+=		'<div class="gsFluid_name">No Theme</div>';
				html+=	'</a>';
				html+='</li>';
				html += '</ul>';
				html += '<div class="clear noHeight"></div></div>';
				return html;
			}
		}, // WHY SO BROKEN
		
		pref: {
			p: false, // stores the active preference hash
			load: function(){
				// TODO load JSON cookie to pref.p
				var p = $.cookie('gsFluidPreferences');
				p = ( (p === null) || (p === 'false') ) ? "{}" : p;
				gsFluid.pref.p = JSON.parse(p);
			},
			save: function(){
				// TODO save pref.p to JSON cookie
				$.cookie('gsFluidPreferences', JSON.stringify(gsFluid.pref.p) );
			},
			clear: function( wipeAll ){
				gsFluid.pref.p = false;
				if (wipeAll) {
					// TODO clear preference cookie as well	
					$.cookie('gsFluidPreferences', null);
				}
			},
			setPreferenceForKey: function( key, value ) {
				gsFluid.pref.p[key] = value;
			},
			preferenceForKey: function( key ) {
				return gsFluid.pref.p[key];
			},
			init: function(){
				// LOAD COOKIE SUPPORT, using get() for syncronicity
				var req = get(gsFluid.resources.r+'js/jquerycookie.js');
				if (req) {
					$('<script type="text/javascript">'+req.responseText+'</script>').appendTo('head');
					gsFluid.pref.load();
					// save preferences on close
					$(window).unload(gsFluid.pref.save);
				} else {
					console.log("Pref script load failed");
				}
				// read preference object from JSON cookie
				// TODO apply settings
				// how about each other init gets its own settings???
				// that seems better.
			}		
		},
		// TODO finish platform detection and switching so we can run this as
		// a fluid instance, a prism webapp, and maybe even a Chrome userscript
		platform: { // this should run first to detect availible featres
			prefMethod: 'json_cookie', // how should we store preferences?
			fluid: 		true, // enables dock support
			mozilla: 	false,
			horizontalChrome: false,
			init: function(){
				var p = {};
				if ( window.fluid ) {p.fluid = true;}
			}
		},
		
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
			// TODO rewrite init to load preferences first
			console.log("Initializing gsFluid, the unofficial Grooveshark Desktop client \n Copyright (c) 2011 Jake Teton-Landis <just.1.jake@gmail.com> \n version:", gsFluid.version);
			try {
				console.log("Checking enviroment");
				gsFluid.platform.init();
			
				console.log("Retrieving preferences...");
				gsFluid.pref.init();
			
				console.log("Initializing gsFluid.player");
				gsFluid.player.init();
			
				console.log("Initializing gsFluid.native");
				gsFluid.native.init();
			
				console.log("Initializing gsFluid.enablePremium");
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
			
				console.log("Initializing gsFluid.css");
				gsFluid.css.init();
			
				console.log("Initializing gsFluid.lightbox");
				gsFluid.lightbox.init();
			
				console.log("Initializing gsFluid.ui");
				gsFluid.ui.init();
				
				console.log("gsFluid loaded successfully!");
				return true;
			} catch (error) {
				console.log("+ ====================== +\n  ERROR LOADING gsFluid:", error, "\n+ ====================== +");
			}
		}
}; // end gsFluid

// This script is currently for Fluid.app SSBs only
(function () {
    if (window.fluid) {
		gsFluid.isFluidInstance = true;
		gsFluid.init();
    }
})();