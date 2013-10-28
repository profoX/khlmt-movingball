var FRAMERATE = 40;
var canvasWidth, canvasHeight;
var canvas, ball, hole;
var dx, dy;
var sx = 5, sy = 5;
var seconds = 0;
var init = false;
var running = false;
var complete = false;
var timer = false;
var timerMs = 0;
var bestTime = -1;

// Modified version (removed hours) from http://stackoverflow.com/questions/6312993/javascript-seconds-to-time-with-format-hhmmss
String.prototype.toMMSS = function () {
	var sec_num = parseInt(this, 10); // don't forget the second parm
	var minutes = Math.floor(sec_num / 60);
	var seconds = sec_num - minutes * 60;

	if (minutes < 10) {minutes = "0" + minutes;}
	if (seconds < 10) {seconds = "0" + seconds;}
	var time = minutes + ':' + seconds;
	return time;
}

// Wait for device API libraries to load
document.addEventListener("deviceready", onDeviceReady, false);
document.addEventListener("DOMContentLoaded", onDOMReady, false);

function onDOMReady() {
	//alert("dom ready");
	canvas = $("canvas")[0];
	//alert("there");
	canvas.width = $(window).width() - 10;
	canvas.height = $(window).height() - 100;
	//alert("foo");
	canvasWidth = canvas.width;
	canvasHeight = canvas.height;
	//alert(canvasWidth + "," + canvasHeight);
	var radius = canvasHeight / 50;
	ball = {
		radius: radius,
		x: Math.round(canvasWidth / 2),
		y: Math.round(canvasHeight / 2),
		color: '#5F91CC',
		color2: '#385D89'
	};
	radius = canvasHeight / 50 + 5;
	hole = {
		radius: radius,
		x: canvasWidth - 30,
		y: canvasHeight - 30,
		color: 'rgba(0, 0, 0, 255)',
		color2: '#385D89'
	};
	reset();
	
	$("#btnPlay").click(function() {
		if (!running) {
			if (complete)
				reset();
			var ms = new Date().getTime() - timerMs;
			window.setTimeout(startTimer, ms % 1000);
		}
	});
	
	$("#btnPause").click(function() {
		if (running) {
			if (timer) {
				window.clearInterval(timer);
				timer = false;
			}
			running = false;
		}
	});
	
	$("#btnStop").click(function() {
		if (running || complete) {
			if (timer) {
				window.clearInterval(timer);
				timer = false;
			}
			running = false;
			reset();
		}
	});
	
	// TEST CODE
	/*window.setInterval(function() {
		updateScene({x: -0.2, y: 0.3})
	}, 1000 / FRAMERATE);*/
	
	init = true;
}

function randomizeHole() {
	var x = (canvasWidth - hole.radius * 2) * Math.random() + 1 + hole.radius;
	var y = (canvasHeight - hole.radius * 2) * Math.random() + 1 + hole.radius;
	hole.x = x;
	hole.y = y;
}

function startTimer() {
	running = true;
	updateTimer();
	if (timer) {
		window.clearInterval(timer);
		timer = false;
	}
	timer = window.setInterval(updateTimer, 1000);
}

function updateTimer() {
	if (running) {
		++seconds;
		timerMs = new Date().getTime();
		var time = seconds.toString().toMMSS();
		$("#timer").html(time);
	}
}

function reset() {
	seconds = 0;
	$("#timer").html("00:00");
	ball.x = Math.round(canvasWidth / 2);
	ball.y = Math.round(canvasHeight / 2);
	randomizeHole();
	draw();
}

// device APIs are available
function onDeviceReady() {
	var watchID = navigator.accelerometer.watchAcceleration(updateScene, onError, {frequency: 1000 / FRAMERATE});
	
	//alert("here");
}

// onSuccess: Get a snapshot of the current acceleration
function onSuccess(acceleration) {
	alert('Acceleration X: ' + acceleration.x + '\n' +
		'Acceleration Y: ' + acceleration.y + '\n' +
		'Acceleration Z: ' + acceleration.z + '\n' +
		'Timestamp: '      + acceleration.timestamp + '\n');
}

// onError: Failed to get the acceleration
function onError() {
	//alert('onError!');
}

function updateScene(acceleration) {
	if (!init || !running)
		return;
	
	dx = acceleration.x;
	dy = acceleration.y;
	if (Math.abs(dx) > 0.12 || Math.abs(dy) > 0.12) {
		ball.x -= dx * sx;
		ball.y += dy * sy;
	}
	
	// Balls may not leave edge of canvas
	ball.x = Math.min(canvasWidth - ball.radius, Math.max(ball.radius, ball.x));
	ball.y = Math.min(canvasHeight - ball.radius, Math.max(ball.radius, ball.y));
	
	draw();
	checkGoal();
}

function checkGoal() {
	var left = ball.x - ball.radius;
	var right = ball.x + ball.radius;
	var top = ball.y - ball.radius;
	var bottom = ball.y + ball.radius;
	
	var goalLeft = hole.x - hole.radius;
	var goalRight = hole.x + hole.radius;
	var goalTop = hole.y - hole.radius;
	var goalBottom = hole.y + hole.radius;
	
	if (left > goalLeft && right < goalRight && top > goalTop && bottom < goalBottom) {
		complete = true;
		running = false;
		window.clearInterval(timer);
		timer = false;
		ball.x = hole.x;
		ball.y = hole.y;
		draw();
		if (bestTime < 0 || bestTime == seconds) {
			bestTime = seconds;
			alert("Congratulations, your time is " + seconds + "s");
		} else if (seconds < bestTime) {
			bestTime = seconds;
			alert("Congratulations, you improved your time! Your time is " + seconds + "s");
		} else if (bestTime < seconds) {
			alert("Congratulations, your time is " + seconds + "s, but your best time remains " + bestTime + "s");
		}
	}
}

function draw() {
	var context = canvas.getContext('2d');
	
	// Clear
	context.fillStyle = "#D3E5AB";
	context.fillRect(0, 0, canvasWidth, canvasHeight);
	
	// Draw goal
	context.beginPath();
	context.arc(hole.x, hole.y, hole.radius, 0, 2 * Math.PI, false);
	context.fillStyle = hole.color;
	context.fill();
	context.lineWidth = 1;
	context.strokeStyle = hole.color2;
	context.stroke();
	
	// Draw ball
	context.beginPath();
	context.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI, false);
	context.fillStyle = ball.color;
	context.fill();
	context.lineWidth = 1;
	context.strokeStyle = ball.color2;
	context.stroke();
}