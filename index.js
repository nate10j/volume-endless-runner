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
		alert("For this game to work, Please allow microphone access in your browser and computer privacy settings.");
		console.log(err)
	});

function get_volume() {
	if (!analyser) return;

	analyser.getByteFrequencyData(dataArray);
	const average = dataArray.reduce((a, b) => a + b) / dataArray.length;

	return average * inputSensitivityElement.value;
}

const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d");
const thresholdElement = document.getElementById("threshold");
const inputSensitivityElement = document.getElementById("sensitivity");

let gameActive;

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
	window.requestAnimationFrame(gameloop);
}

function gameover() {
	obstacles = []
	clearInterval(spawnObstacle);
	gameActive = false;
	alert("game over!");
	setTimeout(() => {
		init();
	}, 1000)}

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

	player.speedY -= 2 * delta_time;
	player.y += player.speedY * delta_time;

	if ( player.y < -250 ) {
		player.speedY = 0;
		player.y = -250;

		if (volume > 40 * thresholdElement.value) {
			player.speedY = 28;
		} else if (volume > 30 * thresholdElement.value) {
			player.speedY = 24;
		} else if (volume > 20 * thresholdElement.value) {
			player.speedY = 22;
		}
	}

	for (i in obstacles) {
		obstacles[i].x -= 12 * delta_time;

		if (obstacles[i].x < 100 && obstacles[i].x + obstacles[i].width > 50) {
			if (player.y * -1 >= 250 - obstacles[i].height ) {
				gameover();
				return;
			}
		}

		if (obstacles[i].x + obstacles[i].width < 0) {
			obstacles.splice(i, 1);
		}
	}
}

let delta_time;
let previousTime = 0;

function gameloop(timestamp) {
	if (!gameActive) { return }

	delta_time = (timestamp - previousTime) / (1000 / 60);
	previousTime = timestamp;

	update();
	render();

	window.requestAnimationFrame(gameloop);
}
