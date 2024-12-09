let audioContext, analyser, microphone, dataArray;

navigator.mediaDevices.getUserMedia({ audio: true })
	.then((stream) => {
		audioContext = new AudioContext();
		analyser = audioContext.createAnalyser();
		microphone = audioContext.createMediaStreamSource(stream);

		microphone.connect(analyser);
		analyser.fftSize = 2048;
		dataArray = new Uint8Array(analyser.frequencyBinCount);

		init();
	})
	.catch(err => {
		alert("Please allow microphone access in your browser and computer privacy settings.");
	});

function get_volume() {
	if (!analyser) return;

	analyser.getByteFrequencyData(dataArray);
	const average = dataArray.reduce((a, b) => a + b) / dataArray.length;

	return average;
}

const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d");

let gameActive = true;

const player = {
	y: -50,
	speedY: 0
}

let obstacles = [];

let spawnObstacle;

function startSpawning() {
	spawnObstacle = setInterval(function(){
		const randomObstacle = {
			height: Math.floor(Math.random() * 20) + 30,
			width: Math.floor(Math.random() * 15) + 40,
			x: 800
		}
		obstacles.push(randomObstacle)
	}, Math.floor(Math.random() * 1500) + 800
	);
}

function init() {
	gameActive = true;
	startSpawning();
	gameloop();
}

function gameover() {
	obstacles = []
	clearInterval(spawnObstacle);
	gameActive = false;
	alert("game over!");
	init();
}

function render() {
	ctx.fillStyle = "#fff"
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	ctx.fillStyle = "#f54040"
	ctx.fillRect(50, player.y * -1, 50, 50)

	ctx.fillStyle = "#000"
	obstacles.forEach(obstacle=> {
		ctx.fillRect(obstacle.x, 300 - obstacle.height, obstacle.width, obstacle.height)
	})

	ctx.fillRect(0, 300, canvas.width, 30)

	const volume = get_volume() * 2;
	ctx.fillStyle = "#43da34"
	ctx.fillRect(0, 300 - volume, 30, volume)
}

function update() {
	volume = get_volume();

	player.speedY -= 0.5;
	player.y += player.speedY;

	if ( player.y < -250 ) {
		player.speedY = 0;
		player.y = -250;

		if (volume > 40) {
			player.speedY = 14;
		} else if (volume > 30) {
			player.speedY = 12;
		} else if (volume > 20) {
			player.speedY = 11;
		}
	}

	for (i in obstacles) {
		obstacles[i].x -= 5;

		if (obstacles[i].x < 100 && obstacles[i].x + obstacles[i].width > 50) {
			if (player.y * -1 >= 250 - obstacles[i].height ) {
				gameover();
			}
		}

		if (obstacles[i].x + obstacles[i].width < 0) {
			obstacles.splice(i, 1);
		}
	}
}

function gameloop() {
	update();
	render();
	if (!gameActive) return;
	window.requestAnimationFrame(gameloop);
}
window.requestAnimationFrame(gameloop);
