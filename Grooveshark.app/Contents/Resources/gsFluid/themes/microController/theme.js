/*	microController Theme 0.9
 *	for Grooveshark Desktop
 *   
 *	Jake Teton-Landis
 */

{
	metadata: {
		fullname:	"microController Default Theme",
		author:		"Jake Teton-Landis",
		email:		"just.1.jake@gmail.com",
		homepage:	"http://jake.teton-landis.org/projects/gsFluid",
	
		preview:	"preview.png",
		shortname:	"microController",
		
		version: 0.8,
		gsFluidMinVersion: 0.04
	},							
	r: null,			// stores the path to theme files after the theme is loaded							
	customJS: false,	// specify custom javascript in `custom.js`
						// allows you to supply custom javascript for your theme
						// in adition to the functions below.
				
	width: 	250,		// dimensions of your theme & the thus the window
	height:	250,
	resources: /\$resources\//g, 		// every instance of this regex (here, '$resources/') in your HTML and CSS 
									// will be replaced with the actual resource path to your theme
									
	minimizeButtonDestination:	'#controls', // selector where we put the minimize toggle button.
	drag:						'.coverart', // selector for what the window can be dragged by
	/**
	 * Called when album art changes.
     * @param {String} artworkURL URL of the new album art.
     */
	artworkChanged: function( artworkURL ) {
		console.log(artworkURL);
		if ( (artworkURL === 0) || (artworkURL == 'http://beta.grooveshark.com/static/amazonart/mdefault.png') || (artworkURL === "") || (artworkURL == 'http://beta.grooveshark.com/static/amazonart/m') ) {
			artworkURL = gsFluid.theme.current.r + 'NoAlbumArt.png';
		}
		$('#microController .coverart').css('background-image', 'url("'+artworkURL+'")' );
	},
	/**
	 * Called when Grooveshark's playback state changes
	 * 0: stopped/no queue
	 * 1: playing
	 * 2: paused
     * @param {Number} Number indicating playback state. 
     */
	playStateChanged: function( playState ) {
		if (playState === 2) {
			$('#microController .play').addClass('paused');
		} else if (playState === 1) {
			$('#microController .play').removeClass('paused');
		}
	},
	/**
	 * Called periodically (currently every 500 milliseconds).
	 * Allows you to poll for state changes and update your display accordingly. 
	 * Good for drawing progress bars.
	 * See gsFluid.player.progress() for easy access to progress information.
     */
	statusUpdate: function () {
		var prog = gsFluid.player.progress();
		if (gsFluid.player.progress() == 0) { prog = 1 }
		$('#microController #progress').css('width', prog*100 + '%');
	},
	/**
	 * Called when your theme has loaded. Do your setup here.
     */
	themeReady: function() {
		$('#microController .play').mouseup(function(e){
			gsFluid.player.togglePlay();
		});
		if ( !gsFluid.player.isPlaying() ) {
			$('#microController .play').addClass('paused');
		}
		// next
		$('#microController .next').mouseup( gsFluid.player.next );
		// prev
		$('#microController .prev').mouseup( gsFluid.player.prev );
		
		// update first
		this.artworkChanged( gsFluid.player.song().coverart );
		this.songChanged( gsFluid.player.song() );
	},
	/**
	 * Called when the current song changes. The song object is the same as the output
	 * of gsFluid.player.song()
	 * song.title: 	The title of the song
	 * song.album: 	The album of the song
	 * song.artist: the song's artist
	 * song.coverart: URL to coverart of song.
	 * song.duration: Estimated length of the song.
	 * (If there is no song) song.none == true
     * @param {Song} song object
     */
	songChanged: function( song ) {
		if (song.none) {
			song.title = "Nothing Playing";
			song.artist = "";
			song.album = "";
		}
		$('#microController #data .title').text( song.title );
		$('#microController #data .artist').text( song.artist );
		$('#microController #data .album').text( song.album );
	}
}