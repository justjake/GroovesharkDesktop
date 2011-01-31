// ==UserScript==
// @name        Grooveshark Desktop Windows
// @version		testing
// @namespace   http://fluidapp.com
// @description Addon script to control windows. Developed for the unofficial Grooveshark desktop client
// @include     *
// @author      Jake Teton-Landis <just.1.jake@gmail.com>
// ==/UserScript==

// This script contains code initally written by Ben Dowling at 
// http://www.coderholic.com/jquery-draggable-implementation/
// That code has been restrucured into the following jQuery plugin

// Make an $el drag the page using jQuery  
var makeWindowbar = function($el) {  
	$el = jQuery($el); 
	// you can only make draggable once
	if ($el.data('isDraggable')) {
		return false;
	}
	$el.data('isDraggable', true);

	// Move the $el by the amount of change in the mouse position  
	var move = function(event) {  
		if($el.data('mouseMove')) {
			var coords = absCoords( event.clientX, event.clientY);	
			
			var changeX = coords[0] - $el.data('mouseX');  
			var changeY = coords[1] - $el.data('mouseY');// - (window.outerHeight-window.innerHeight);  
			console.log("change",changeX, changeY);

			var newX = window.screenLeft + changeX;  
			var newY = window.screenTop + changeY;  

			// $el.css('left', newX);  
			// $el.css('top', newY);  
			//window.moveTo(newX, newY);
			window.moveBy(changeX,changeY);

			$el.data('mouseX', coords[0]);  
			$el.data('mouseY', coords[1]);  
			console.log("window at ",window.screenLeft,window.screenTop);
		}  
	}  

	$el.mousedown(function(event) {  
		//console.log('mouse down in ', $el, event);
		$el.data('mouseMove', true);  
		var coords = absCoords( event.clientX, event.clientY);
		$el.data('mouseX', coords[0]);  
		$el.data('mouseY', coords[1]);  
	});  

	$el.parents(':last').mouseup(function() {  
		//console.log('mouse up in ', $el, event);
		$el.data('mouseMove', false);  
	});  

	$el.mouseout(move);  
	$el.mousemove(move);  

	// this isn't jQuery unless it returns the element.
	console.log("This element now is a window draggable", $el);
	return $el;
}

function absCoords( localX, localY ) {
	// var windowBufferX = window.outerWidth - window.innerWidth;
	// var windowBufferY = window.outerHeight - window.innerHeight;
	
	// var transformationX = window.screenLeft + windowBufferX;
	// var transformationY = window.screenTop + windowBufferY;
		
	return [
		localX + window.screenLeft + window.outerWidth - window.innerWidth,
		localY + window.screenTop + window.outerHeight - window.innerHeight
	];
}

// (function () {
//     if (window.fluid) {
// 			console.log("making Draggables");
// 			gsFluid.init();
//     }
// })();