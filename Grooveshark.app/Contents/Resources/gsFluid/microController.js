/*	microController Theme 0.8
 *	for Grooveshark Desktop
 *   
 *	Jake Teton-Landis
 */

var microControllerExample = {
	metadata: {
		title:	"microController",
		author:	"Jake Teton-Landis",
		email:	"just.1.jake@gmail.com", 
		url:	"http://jake.teton-landis.org",
		img:	null,			// theme preview. Full URL.
		
		version: 0.8,
		gsFluidMinVersion: 0.04
	},
	// usesCustomJS: false,		// allows you to supply custom javascript for your theme
	customJS: false,			// note that if you use custom js, no controls will be
	width: 	250,				// automatically created for you except the drag bar
	height:	250,
	resources: /\$resources\//g, 	//every instance of '$resources/' will be replaced with the actual resource path
	
									// HTML content of the theme.
									// linebreaks within strings must be escaped with \ in regular javascript
	html:	' \
	<div id="microController">    \
		<div class="coverart">\
			<img src="$resources/themes/microController/album.jpg"  />\
		</div>\
\
		<!--<div class="dragbar"></div>-->\
\
		<div id="progress"></div>\
		<div id="data">\
			<div class="title">Caring is Creepy</div>\
			<div class="album">Oh, Inverted World</div>\
			<div class="artist">The Shins</div>\
		</div>                \
		<div id="controls">\
			<a href="/#/" class="prev"></a>\
			<a href="/#/" class="play"></a>\
			<a href="/#/" class="next"></a>\
		</div>	\
	</div>\
	',
	
										// CSS content of the theme
										// note that everything is specified as a child of #microController
										// that is so your styles don't mess with / get messed with by
										// grooveshark in general.
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
	#microController #controls .minimizeButton {\
		margin-top: 0;\
		margin-left: 18px;\
		background: url("$resources/themes/microController/fc_expand.png") no-repeat center;\
	} #microController .minimizeButton:hover {\
		background: url("$resources/themes/microController/fc_expand.png") no-repeat center;\
	} #microController .minimizeButton:active {\
		background: url("$resources/themes/microController/fc_expand_on.png") no-repeat center;\
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
		bottom: 52px;\
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
		top: 198px;\
		height: 2px;\
		/*border-top: 1px solid rgba(255,255,255,.8);\
		border-bottom: 1px solid rgba(255,255,255,.8);*/\
		border-right: 2px solid rgb(158,240,55);\
		width: 100%;\
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
	#microController #controls .pause.pause {\
		background-image: url($resources/themes/microController/fc_pause.png) !important;\
	} \
	#microController #controls .play.pause:active {\
		background-image: url($resources/themes/microController/fc_pause_on.png) !important;\
	}\
	',   				// these controls automatically bound to the supplied selectors\
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
	noartfile: '$resources/themes/microController/NoAlbumArt.png',  // file to use if there is no cover art
	song:	{title: '.title', artist: '.artist', album: '.album'}	// selectors to update with current song info. Be specific, this is .text(valiue) replacement
}