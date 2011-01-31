// ==UserScript==
// @name        Grooveshark Desktop
// @namespace   http://fluidapp.com
// @description The unofficial Grooveshark desktop client, built withg Fluid. Features dock control, badges for social notifications, premium mode, and Growl notifications.
// @include     http://listen.grooveshark.com/*
// @author      Jake Teton-Landis <just.1.jake@gmail.com>
// ==/UserScript==

/* NOTES 
As Grooveshark will change thier application code without notice, I'm 
abstracting some important functionality, like player control, to provide a 
stable API for possible remote authors, if I ever get themes off the ground.

If you want to hack on this script, I'd reccomend downloading a copy of 
Grooveshark's app.js file. You can use Opera 9.27 and 
http://www.howtocreate.co.uk/tutorials/jsexamples/JSTidy.html to tidy up the 
code.

Unfortunately, core.js does not run in Opera 9.27 so that's too hard to deal 
with.
*/

// HACKY
// function deepCopy(obj) {
// 	return JSON.parse(
// 			JSON.stringify(obj)
// 		);
// }

console.log("writing deepCopy");

// superior
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
			},
			
		},		
		theme: {		// set current list showUI (showUI unimplemented)
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
					gsFluid.theme.set(a.attr("rel"));
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
			showUI: function() {											//TODO!!!!!!
				return false;
			}
		},	
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
						if (GS.player.isPlaying) {
							menu.push( ["Pause", gsFluid.player.togglePlay] );
						} else { 
							menu.push( ["Play", gsFluid.player.togglePlay] ); 
						}
						menu.push( ["Next", gsFluid.player.next] );
						menu.push( ["Previous", gsFluid.player.prev] );
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
			},
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
				if ( gsFluid.player.isPlaying() ) {
					gsFluid.growl.notificationForSong(gsFluid.player.song());
				}
				gsFluid.dock.menu.write( gsFluid.dock.menu.build() );
			}
		
		},		
		remote: {},		// handle the remote (DISTANT FUTURE)
		
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
		},
		
		enablePremium: function() {
			GS.user.IsPremium = 1;
			GS.ad.update();
		},
		
		init: function() {
			console.log("Initializing gsFluid.theme");
			gsFluid.theme.init();
			console.log("running gsFluid.enablePremium");
			gsFluid.enablePremium();
			console.log("Initializing gsFluid.dock");
			gsFluid.dock.init();
			mediaKeysPlugin = { // In my ideal world this works for apple remote too
				forward: gsFluid.player.next,
				backward: gsFluid.player.prev,
				play: gsFluid.player.togglePlay
			};	
		}
}

console.log("Trying to fluid");

(function () {
    if (window.fluid) {
			console.log("Starting Grooveshark Desktop (FLUID)");
			gsFluid.init();
    }
})();