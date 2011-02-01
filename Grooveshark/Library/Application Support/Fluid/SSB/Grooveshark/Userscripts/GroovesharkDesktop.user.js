// ==UserScript==
// @name        Grooveshark Desktop
// @version		0.02
// @namespace   http://fluidapp.com
// @description The unofficial Grooveshark desktop client, built withg Fluid. Features dock control, badges for social notifications, premium mode, and Growl notifications.
// @include     http://listen.grooveshark.com/*
// @author      Jake Teton-Landis <just.1.jake@gmail.com>
// ==/UserScript==

/* TODO
1. minimize to miniController
2. JSON loading of miniController themes
    * how do I handle CSS and unsafe scripts?
    * eval() !?!?!?
3. Add giant all expansive child to #header when its being dragged to capture
the mouse whenever its still in the window -- no more selecting bullshit
remove that glassCieling on mouseUp
*/

console.log("writing deepCopy");

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
		// hasInitiated: false,
		player: {		// pause play prev next
			isPlaying: function() {
				return GS.player.isPlaying;
			},
			plause: function() {
				return GS.player.pauseSong();
			},
			play: function() {
				return GS.player.playSong();
			},
			togglePlay: function() {
				if (GS.player.isPlaying) { return GS.player.pauseSong(); }
				return GS.player.playSong();
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
				if (typeof GS.player.currentSong !== 'undefined') {
					console.log("Hooray, the song is defined");
					return {
						title: GS.player.currentSong.SongName,
						album: GS.player.currentSong.AlbumName,
						artist: GS.player.currentSong.ArtistName,
						coverart: GS.player.currentSong.artPath+'m'+GS.player.currentSong.CoverArtFilename,
						duration: Math.floor(GS.player.currentSong.EstimateDuration)/1000 //in seconds
					};
				} else {
					return {
						title: "Not Playing",
						album: "",
						artist: "",
						coverart: "",
						duration: 0	
					};
				}
			}, 	//end song
		},	//end gsFluid.player
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
					'top': '39px',
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
				if ( gsFluid.theme.current ) {
					gsFluid.window.toggleMinimizeToTheme( gsFluid.theme.current );
				} else {
					console.log("No microController theme selected");
					gsFluid.window.toggleSmall();
				}
			}, // end toggleMinimize
			
			//MINTHEME 
			toggleMinimizeToTheme: function ( theme ) {
				gsFluid.window.theme = theme;
				if ( gsFluid.window.minimizedDimensions ) {
					// show everything      
					$('#microController .minimizeButton').insertAfter( $('#header .closeButton') );
					
					$('#microControllerCSS').remove();
					$('#microController').remove();
					
					$('#mainContainer').show();   
					window.resizeTo(gsFluid.window.minimizedDimensions.w, gsFluid.window.minimizedDimensions.h);
					//window.moveTo($store.data('normalSize').x, $store.data('normalSize').y);
					gsFluid.window.minimizedDimensions = false;    
					    
				} else {
					gsFluid.window.minimizedDimensions = {w: window.outerWidth, h: window.outerHeight, x: window.screenLeft, y: window.screenTop};
					// hide everything
					$('#mainContainer').hide();     
					gsFluid.window.aboutToResize = true;
					window.resizeTo(theme.width, theme.height); // should be big enough.   
					$('head').append('<style id="microControllerCSS" type="text/css" media="screen">'+theme.css.replace(theme.resources, gsFluid.resources.r)+'</style>');
					$('body').prepend(theme.html.replace(theme.resources, gsFluid.resources.r)).addClass('microControllerEnabled');
					$('html').css('background', 'transparent');
					// $('body').css({
					// 	'background': 'transparent',
					// 	'width': theme.width+'px',
					// 	'height': theme.height+'px'
					// });
					gsFluid.window.makeBar( $('#microController '+theme.drag) );
					$('#header .minimizeButton').appendTo($('#microController '+theme.drag));
				}
				
				
			}, //end toggleMinimizeToTheme
			toggleSmall: function() {
				if ( gsFluid.window.minimizedDimensions ) {
					window.resizeTo(window.outerWidth, gsFluid.window.minimizedDimensions.h);
					//window.moveTo($store.data('normalSize').x, $store.data('normalSize').y);
					gsFluid.window.minimizedDimensions = false;
				} else {
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
				
			}
			
		}, // end gsFluid.window
		theme: {
			current: false
		},
		
		resources: {  
			glassIndex: 100000,
			r: 'http://jake.teton-landis.org/projects/gsFluid/resources/',
			lights: 'smalltraffic/' //'stijo'
		}, // end gsFluid.resources
		
		enablePremium: function() {
			GS.user.IsPremium = 1;
			GS.ad.update();
		},
		
		init: function() {
			// gsFluid.resources = 'file:/' + window.fluid.resourcePath + 'gsFluid/';  // app path resources
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
			// we aren't minimized/maximized after resizing the window
			$(window).resize(function () { 
				if (gsFluid.window.aboutToResize) {
					gsFluid.window.aboutToResize = false;
				} else {
					gsFluid.window.minimizedDimensions = false;
				}
			});
			//gsFluid.theme.current = microControllerExample;
		}
} // end gsFluid


microControllerExample = {
	metadata: {
		title:	"microController",
		author:	"Jake Teton-Landis",
		email:	"just.1.jake@gmail.com", 
		url:	"http://jake.teton-landis.org",
		img:	null
	},
	usesCustomJS: false,	// allows you to supply custom javascript for your theme
	customJS: null,			// note that if you use custom js, no controls will be
	width: 	250,			// automatically created for you except the drag bar
	height:	250,
	resources: /\$resources\//g, //found and replaced in CSS and HTML with the resources path
	html:	'\
	<div id="microController">    \
		<div class="coverart">\
			<img src="$resources/themes/microController/album.jpg"  />\
		</div>\
\
		<div class="dragbar"></div>         \
		<div id="data">\
			<div class="title">Caring is Creepy</div>\
			<div class="album">Oh, Inverted World</div>\
			<div class="artist">The Shins</div>\
		</div>                \
		<div id="progress"></div>\
		<div id="controls">\
			<a href="#nope" class="prev"></a>\
			<a href="#nope" class="play"></a>\
			<a href="#nope" class="next"></a>\
		</div>	\
	</div>\
	',	 
	css:'\
	body.microControllerEnabled { \
		min-width: 0; \
		width: 250px; \
		height: 250px; \
		text-align: left; \
		font-size: 13px;\
	} \
	#microController {   \
		position: absolute;\
		width: 250px;\
		height: 250px;\
		background: #222;\
		z-index: 99999999;\
		clear: both\
	}                    \
	#microController .minimizeButton {\
		margin-top: 6px;\
		background: url("$resources/titlebar_larzon83_plus.png");\
	} #microController .minimizeButton:hover {\
		background: url("$resources/titlebar_larzon83_plus.png");\
	} #microController .minimizeButton:active {\
		background: url("$resources/titlebar_larzon83_plus.png");\
	}\
	              \
	#microController .dragbar {  \
		position: absolute;   \
		top: 0;    \
		left: 0;\
		right: 0;\
		z-index: 400;\
		height: 22px;     \
		background: rgba(50,50,50,.1);\
	}\
	                     \
	#microController .coverart {\
		background: blue;\
		width: 250px;\
		height: 250px; \
		position: absolute;      \
		top: 0;\
	}\
	  \
	#microController .coverart img {\
		width: 100%;\
		height: 100%;\
	}                      \
	\
	#microController #data {      \
		border-top: 1px solid rgba(30,30,30,.5);     \
		border-bottom: 1px solid rgba(30,30,30,.5);   \
		background: rgba(30,30,30,.5);\
		        \
		left: 0;\
		right: 0;         \
		top: 158px;     \
		bottom: 51px;\
		padding-top: 3px;\
		\
		text-align: center;     \
		color: rgba(255, 255, 255, .92);   \
		text-shadow: 0px 0px 3px rgba(0,0,0,.8);\
		font-size: 13px;   \
		line-height: 1.4em;\
		font-family: "Helvetica Neue", Helvetica, Sans-serif;\
		position: absolute;                                  \
	}        \
	\
	#microController #data * {\
		text-align: center;\
		line-height: 1.4em\
	}\
	\
	#microController #data .album {\
		display: none;\
	}\
	\
	#microController #progress {    \
		position: absolute;\
		top: 199px;\
		height: 1px;\
		width: 30%;\
		background: #FFF;\
	}\
	\
	\
	#microController #controls {\
		border-top: 1px solid rgba(30,30,30,.5);     \
		border-bottom: 1px solid rgba(30,30,30,.5);   \
		background: rgba(30,30,30,.5);\
		\
		position: absolute;\
		top: 200px;    \
		height: 36px;\
		left:0;\
		right: 0;  \
		padding-left: 37px;   \
		padding-top: 12px;  \
	}               \
	\
	#microController #controls * {    /*125px wide together, including middle spacing*/\
		display: block;\
		width: 25px;\
		height:	25px;\
		float: left;  \
		margin-left: 25px;  \
	}   \
	\
	#microController .prev {\
		background: url($resources/themes/microController/fc_skip_left.png) no-repeat center;\
	} #microController .prev:active { \
		background: url($resources/themes/microController/fc_skip_left_on.png) no-repeat center;\
	}    \
	\
	#microController .next {\
		background: url($resources/themes/microController/fc_skip_right.png) no-repeat center;\
	} #microController .next:active {                            \
		background: url($resources/themes/microController/fc_skip_right_on.png) no-repeat center;\
	}     \
	\
	#microController #controls .play {      \
		margin-top: -2px;\
		height: 30px;\
		background: url($resources/themes/microController/fc_play.png) no-repeat center;\
	} #microController  #controls .play:active {                       \
		background: url($resources/themes/microController/fc_play_on.png) no-repeat center;\
	}    \
	',   				// these controls automatically bound to the supplied selectors\
	drag:	'.dragbar',
	pause:	'.pause',
	play:	'.play',
	next:	'.next',
	prev:	'.prev',
	art:	'.coverart',
	song:	{title: '.title', artist: '.artistName', album: '.albumName'}
}


console.log("Trying to fluid");

(function () {
    if (window.fluid) {
			console.log("Starting Grooveshark Desktop (FLUID)");
			gsFluid.init();
    }
})();