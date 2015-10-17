
var color = '#1d1d1d';
var bg = $('body').css('background-color');
var lastTime = Date.now();
var bubbleArr = [];
var xArr = [];
var squareArr = [];
var popArr = [];
var multiplier = 2;

var numCircles = 8;
var numX = 6;
var numSquares = 8;

var squareRange = {
	max: 16,
	min: 8
};
var circleRange = {
	max: 17,
	min: 8
};
var xRange = {
	max: 12,
	min: 5
};

var popRange = {
	max: 5,
	min: 3
};

var popAmtRange = {
	max: 6,
	min: 4
};


var bctx;
var canvas;

var clickEvent = false;
var cursorX = -1000;
var cursorY = -1000;
var pagePosition = 0;

$(document).ready(function(){

	// set favicon based on time of day
	setFavicon();

	// start canvas animations
	init();

	var win = window;
	// listeners to route to each project page
	$('.proj').on('click', function(){
		var link = $(this).find('img').attr('id');
		getReadyToChange(function(){
			win.location.assign(link);
		});
	});

	// listeners to change page color for each project
	$('.proj').hover(function(){
		var id = $(this).find('img').attr('id');
		changeSiteColor(id);
	});


});

var idArray = ['hackfsu', 'domi', 'site', 'runaway', 'battletrip', 'jot', 'technole'];

// made for scrolling on mobile
// not ready for production yet, a little too 
// jumpy when selecting the different boxes to show the background on 
function updateBoxBackgrounds() {

    var viewHeight = $(window).height();
    var scrollTop = $(window).scrollTop(); 

    var fullHeight = document.body.scrollHeight;

    var scrollMax = fullHeight - viewHeight;
    var padding = (scrollMax / 1.3) - (scrollTop / 1.3);
    var boxHeight = 150;
    var boxBottom = viewHeight - padding + scrollTop;
    var boxTop = boxBottom - boxHeight;

    //$('#line').css('top', boxTop);
    //$('#line').css('height', boxHeight);

    var visibleDivs = [];
    for(var i = 0; i < idArray.length; i++){
    	var id = idArray[i];
    	var y = $('#'+id).offset().top;

    	if(y > boxTop && y < boxBottom){
    		visibleDivs.push(idArray[i]);
    	}
    }

    //console.log('set bg: ' + visibleDivs[visibleDivs.length - 1]);

    // choose last div in array which is the furthest
    // one down the page that's in the box
    var choose = visibleDivs[visibleDivs.length - 1];
    addOrRemoveBG(choose);
}

function addOrRemoveBG(id){
	// id passed in is the only one to set
	for(var i = 0; i < idArray.length; i++){
		var notId = idArray[i];
		$('#'+notId).parent().removeClass('mobile-show-bg');
	}

	// only show current box
	$('#'+id).parent().addClass('mobile-show-bg');

}

// set favicon based on time of day
function setFavicon(){
	var time = new Date();
	time = time.getHours();
	var favicon;
	// night is set between 6pm and 5am
	if(time >= 18 || time < 5){
		favicon = 'favicon-moon.png';
	} else {
		favicon = 'favicon-sunrise.png';
	}

	var favLink = '<link rel="shortcut icon" href="/public/img/'+favicon+'">';
	$('head').append(favLink);
}

// ability to have different colors for each project
function changeSiteColor(id){
	var color;
	switch(id){
		case 'domi':
		case 'hackfsu': color = '#E88873';	// peach
			break;		
		case 'runaway':
		case 'battletrip':
		case 'site': color = '#91BF94';	// mint
			break;
		case 'technole':
		case 'jot': color = '#9EBFB3';		// baby blue
			break;
		default:
			break;
	}

	// reset all applicable css color styles
	$('body').css('background', color);
	$('.proj').css('background', color);
	$('.proj .overlay').css('background', color);
	$('.head-img:after').css('background', 'linear-gradient(transparent, '+color+'#605D67 90%)');
}

// kick off canvas animations and interval timer
function init(){
	canvas = document.getElementById('effects');
	canvas.width = document.getElementById('landing').offsetWidth;
	canvas.height = window.innerHeight * 1;

	bctx = canvas.getContext('2d');

	// Listeners
	document.onmousemove = function(e) {
		updateCursorLocation(e);
	}

	document.onclick = function(e) {
		clickEvent = true;
	}

	// create the three shapes
	initShape(numCircles, drawCircle, bubbleArr, circleRange);
	initShape(numX, drawX, xArr, xRange);
	initShape(numSquares, drawSquare, squareArr, squareRange);

	var showCanvas = true;
	// this is if I want to remove canvas on mobile
	// we'll keep it for now
	/*if(canvas.width <  550) {
		$('#effects').css('display', 'none');
		showCanvas = false;
	} */

	// set timer for every 30ms
	// time is to account for microincrements past real time done by js
	var updateInterval = window.setInterval(function(){
		var currTime = Date.now();

		// either showing the canvas or updating box backgrounds
		if(showCanvas){
			if(currTime - lastTime < 100){
				update(currTime - lastTime);
			}

			lastTime = currTime;
		} else {
			//updateBoxBackgrounds();
		}
		
	}, 30);

}

// updates cursor variables
var updateCursorLocation = function(e) {
	cursorX = e.pageX;
	cursorY = e.pageY;
}

// checks if the mouse has hovered over a given x,y
var isHovered = function(arr, i, x, y) {
	var distance = calculateDistance(x, y, arr[i].x, arr[i].y);
	if (distance < arr[i].size) {
		return true;
	}
	return false;
}

// used by isHovered()
var calculateDistance = function(x1, y1, x2, y2) {
	return Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2));
}

// initialize popping effect
function initPop(x, y){
	var amt = Math.floor(randomSize(popAmtRange));
	for(var i = 0; i < amt; i++){
		
		var size = Math.floor(randomSize(popRange));
		var opacity = 0.35;

		var deg = (i + 1) * (360 / amt);

		drawPop(x, y, size, opacity, color, deg);

		popArr.push({
			x: x,
			y: y,
			size: size,
			dr: 0,
			c: color,
			opacity: opacity,
			dir: deg,
			done: false,
			moveUp: false
		});
	}
}

// on interval update the pop effects location
function updatePops(delta){
	for(var i = 0; i < popArr.length; i++){
		popArr[i].size += 0.8;
		if(popArr[i].size >= 8){
			popArr.splice(i, 1);
			i--;
		} else {
			drawPop(popArr[i].x, popArr[i].y, popArr[i].size, popArr[i].opacity, popArr[i].c, popArr[i].dir);
			
			var radians = toRadians(popArr[i].dir);
			popArr[i].y += ((Math.sin(radians) * popArr[i].size) / 2);
			popArr[i].x += ((Math.cos(radians) * popArr[i].size) / 2);
		}
		
	}
}

function initShape(numShape, drawFunc, arr, range){
	for(var i = 0; i < numShape; i++){
		var r = randomSize(range);

		if(i < numShape * 0.33){
			var x = getXinField(0.2, 0);
		} else if (i < numShape * 0.66){
			var x = getXinField(0.6, 0.2);
		} else {
			var x = getXinField(0.2, 0.8);
		}

		var y = Math.random() * window.innerHeight;
		var opacity = 0.35;

		drawFunc(x, y, r, color, opacity);
		arr.push({
			x: x,
			y: y,
			size: r,
			dr: 0,
			c: color,
			hover: false,
			opacity: opacity,
			popped: false,
			smiley: false,
			moveUp: false
		});
	}
}

function update(delta){
	bctx.clearRect(0, 0, canvas.width, canvas.height);
	updateShape(delta, xArr, drawX);
	updateShape(delta, bubbleArr, drawCircle);
	updateShape(delta, squareArr, drawSquare);
	updatePops(delta);
}

function updateShape(delta, arr, drawFunc){

	// update each circle
	for(var i = 0; i < arr.length; i++){

		if(arr[i].moveUp){
			//console.log(arr[i].y);
 			var newY = Math.abs(arr[i].y - window.innerHeight);
			arr[i].y = arr[i].y - Math.random() * delta * multiplier;
			//arr[i].y -= Math.random() * 1 * delta * scaleToRange(newY) * multiplier;
		} else {
			// set circle speeds
			if (i % 5 == 0){
				arr[i].y = arr[i].y - (1.5 / 30 * delta * multiplier);
			} else if (i % 2 == 0){
				arr[i].y = arr[i].y - (0.9 / 30 * delta * multiplier);
			} else {
				arr[i].y = arr[i].y - (0.3 / 30 * delta * multiplier);
			}
		}

		// if bubble is off the screen, randomly respawn more
		if(arr[i].y < -65 && window.scrollY <= 500 && Math.random() < 0.01 && !arr[i].moveUp){
			arr[i].y = window.innerHeight + 50;
			arr[i].dr = 0;
		}

		drawFunc(arr[i].x, arr[i].y, arr[i].size + arr[i].dr, arr[i].c, arr[i].opacity);
	

		if (arr[i].popped) {
			
			if (arr[i].opacity > 0) {
				arr[i].opacity -= 0.1;
				if (arr[i].opacity < 0) {

					arr[i].opacity = 0;
					arr[i].popped = false;
					arr[i].y = -65;
					arr[i].dr = 0;
					arr[i].opacity = 0.35; 

					// init pop
				}
			}
		} else {
			// Hover effects
			if (isHovered(arr, i, cursorX, cursorY)) {
				arr[i].hover = true;
			}

			if(arr[i].hover){
				if(arr[i].size + arr[i].dr < 3){
					initPop(arr[i].x, arr[i].y);
					console.log('pop!');
					arr[i].popped = true;
					arr[i].hover = false;
				} else {
					arr[i].dr -= 3;
				}
			}
		}
	}

	clickEvent = false;
}

function scaleToRange(num){
	var min = 0;
	var max = window.innerHeight + 200;
	var foo = (num - min) / (max - min);
	console.log(foo);
	return (foo + Math.random());
}


// Returns a random x coordinate with the specified portion of the window 
var getXinField = function(width, offset) {
	return canvas.width * (offset + (Math.random() * width));
}

function randomSize(range){
	return Math.random() * (range.max - range.min) + range.min;
}

function drawPop(x, y, size, opacity, color, dir){
	var radians = toRadians(dir)
	var newY = size * Math.sin(radians);
	var newX = size * Math.cos(radians);
	var toX = x + newX;
	var toY = y + newY;

	bctx.beginPath();
	bctx.moveTo(x, y);
	bctx.lineTo(toX,toY);
	bctx.lineWidth = 4;
	bctx.globalAlpha = opacity;
	bctx.lineCap = 'round';
	bctx.stroke();
}


function toRadians(angle) {
  return angle * (Math.PI / 180);
}


function toDeg(theta, convertedmx, convertedmy){
  theta = theta * 180/Math.PI;
  if(convertedmy< 0){
    if(convertedmx < 0){
      theta += 180;
    }
    else{
      theta += 360;
    }
  }
  else{
    if(convertedmx < 0){
      theta+=180;
    }
  }
  return theta;
}

function drawCircle(x, y, radius, color, opacity){
	bctx.beginPath();
	bctx.arc(x, y, radius, 0, 2 * Math.PI, false);
	bctx.closePath();
	bctx.strokeStyle = color;
	bctx.lineWidth = 4.5;
	bctx.globalAlpha = opacity;
	bctx.stroke();
}

function drawX(x, y, size, color, opacity) {
    bctx.beginPath();
    bctx.moveTo(x - size, y - size);
    bctx.lineTo(x + size, y + size);
    bctx.moveTo(x + size, y - size);
    bctx.lineTo(x - size, y + size);
    bctx.lineWidth = 4;
    bctx.strokeStyle = color;
    bctx.globalAlpha = opacity;
    bctx.stroke();
}


function drawSquare(x, y, size, color, opacity) {
	bctx.beginPath();
	bctx.rect(x, y, size, size);
    bctx.lineWidth = 3.5;
    bctx.strokeStyle = color;
    bctx.globalAlpha = opacity;
    bctx.stroke();
}



function getReadyToChange(callback){
	moveShapeUp(bubbleArr);
	moveShapeUp(squareArr);
	moveShapeUp(xArr);
	$('#landing').fadeOut('slow', callback);

}

function moveShapeUp(arr){
	for(var i = 0; i < arr.length; i++){
		arr[i].moveUp = true;
	}
}


