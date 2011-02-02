/*	microController Theme 0.9
 *	for Grooveshark Desktop
 *   
 *	Jake Teton-Landis
 */

{
	metadata: {
		title:	"microController",
		author:	"Jake Teton-Landis",
		email:	"just.1.jake@gmail.com", 
		url:	"http://jake.teton-landis.org",
		
		version: 0.8,
		gsFluidMinVersion: 0.04
	},							
								
	customJS: false,	// specify custom javascript in `custom.js`
						// allows you to supply custom javascript for your theme
						// note that if you use custom js, no controls will be
						// automatically created for you except the drag bar
				
	width: 	250,		// dimensions of your theme & the thus the window
	height:	250,
	resources: /\$resources/g, 		// every instance of this regex (here, '$resources/') in your HTML and CSS 
									// will be replaced with the actual resource path to your theme
									
minimizeButtonDestination: '#controls',	// selector where we put the minimize toggle button.
// these controls automatically bound to the supplied selectors
	drag:	'.coverart',	// drag: what can the window be dragged by?
	pause:	'pause',		// pause is not a selector, but an actual class that is applied to .play when necissary
	play:	'.play',		// pause/play button
	next:	'.next',
	prev:	'.prev',
	art:	'.coverart',	// the first <img> in this selector will become the cover art
	progress: {						//progress bar
		selector: 	'#progress',	
		property: 	'width',		// what CSS property do you want modified?
		units: 		'%',			// the CSS unit ending
		min: 		0,				// min ammount of said units
		max: 		100
		
		// progress formula:
		// (max - min) * ( songPosition / songDuration ) + min + units 
		// example comutation: (100 - 0) * (72585.57823129251 / 301662.0408163265) + 0 + '%' yields a percentage width
	},
	noartfile: 'NoAlbumArt.png',  // file to use if there is no cover art
	song:	{title: '.title', artist: '.artist', album: '.album'}	// selectors to update with current song info. Be specific, this is .text(valiue) replacement
}