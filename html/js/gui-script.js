window.onload = () => {
    // Controls
    let gameRunning = false;
    let gameOver = false;
    let up, down, left, right;
    let roverHealth, roverBattery, onRocks, onSand;
    let initialGoalPosition = {
        x: 0,
        y: 0
    };

    // Elements
    const hpText = document.getElementById("hpText");
    const hpMeter = document.getElementById("hpMeter");
    const batteryText = document.getElementById("batteryText");
    const batteryMeter = document.getElementById("batteryMeter");
    const roverImages = document.getElementById("roverImages");
    const triangleUp = document.getElementById("triangleUp");
    const triangleDown = document.getElementById("triangleDown");
    const triangleLeft = document.getElementById("triangleLeft");
    const triangleRight = document.getElementById("triangleRight");
    const content = document.getElementById('content');
    const radar = document.getElementById('radar');
    const winloseText = document.getElementById("winloseText");
    const statusTitle = document.getElementById('statusTitle');
    const statusMsg = document.getElementById('statusMsg');

    const socket = io.connect('http://localhost');

    const radarRect = radar.getBoundingClientRect(); 
    const radarX = radarRect.left - content.getBoundingClientRect().left;

    socket.on('gameData', (data) => {
        // Set initial goal position
        initialGoalPosition = data.goalPosition;

        // See if game is over
        if (data.gameOver && data.success) {
            winloseText.style.color = "green";
            winloseText.innerHTML = "UPPDRAG AVKLARAT";
        }
        else if (data.gameOver && !data.success) {
            winloseText.style.color = "red";
            winloseText.innerHTML = "UPPDRAG MISSLYCKAT";
        }

        if (data.gameOver) {
            $('#myModal').modal('show')
            gameRunning = false;
            gameOver = true;
            window.setTimeout(() => {
                gameOver = false;
                winloseText.style.color = "blue";
                winloseText.innerHTML = "TRYCK FÖR ATT STARTA";
            }, 10000);
        }
    });
    
    socket.on('roverData', (data) => {
        // Rover
        if (roverHealth > 60 && data.health <= 60) {
            roverImages.src = "assets/images/roverImage_slightly_damaged.png";
        } else if (roverHealth > 40 && data.health <= 40) {
            roverImages.src = "assets/images/roverImage_damaged.png";
            hpMeter.classList.add('bg-warning');
            hpMeter.classList.remove('bg-success');
        } else if (roverHealth > 20 && data.health <= 20) {
            roverImages.src = "assets/images/roverImage_critical.png";
        } else if (roverHealth > 10 && data.health <= 10) {
            hpMeter.classList.add('bg-danger');
            hpMeter.classList.remove('bg-warning');
        } else if (data.health == 0) {
            roverImages.src = "assets/images/roverImage_dead.png";
        }

        if (roverBattery > 40 && data.battery <= 40) {
            batteryMeter.classList.add('bg-warning');
        } else if (roverBattery > 10 && data.battery <= 10) {
            batteryMeter.classList.add('bg-danger');
            batteryMeter.classList.remove('bg-warning');
        }

        roverHealth = data.health;
        roverBattery = data.battery;
        onSand = data.onSand;
        onRocks = data.onRocks;

        //statusMessage
        if (onRocks === true) {
            statusTitle.innerHTML = "Varning: STENAR";
            statusMsg.innerHTML = "Rovern tar extra skada";
        } else if (onSand === true) {
            statusTitle.innerHTML = "Varning: SAND"
            statusMsg.innerHTML = "Batteriet sjunker snabbare";

        } else {
            statusTitle.innerHTML = "";
            statusMsg.innerHTML = "";
        }

        // HP
        hpText.innerHTML = Math.round(roverHealth).toString() + "%";
        hpMeter.style.width = roverHealth.toString() + "%";

        // Battery
        batteryText.innerHTML = Math.round(roverBattery).toString() + "%";
        batteryMeter.style.width = roverBattery.toString() + "%";

        // Goal
        const dx = initialGoalPosition.x - data.position.x;
        const dy = initialGoalPosition.y - data.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 117;

        let goalPosition = {};
        if (dist > maxDist) {
            goalPosition.x = dx / dist * maxDist;
            goalPosition.y = dy / dist * maxDist;
        } else {
            goalPosition.x = dx;
            goalPosition.y = dy;
        }

        let a = Math.cos(data.rotation);
        let b = Math.sin(data.rotation);
        let x = goalPosition.x;
        let y = goalPosition.y;

        goalPosition.x = x * a - y * b;
        goalPosition.y = x * b + y * a;

        let distanceRotation;
        if (goalPosition.x == 0 && goalPosition.y < 0) {
            distanceRotation = 0;
        } else if (goalPosition.x == 0) {
            distanceRotation= Math.PI;
        } else if (goalPosition.x < 0) {
            distanceRotation = Math.PI / 2 + Math.atan(-goalPosition.y / goalPosition.x);
        } else {
            distanceRotation = Math.PI * 3 / 2 + Math.atan(-goalPosition.y / goalPosition.x);
        }

        let distancePosition = {};
        distancePosition.x = 0;
        distancePosition.y = 35;

        const p = 1 - 2*Math.max(30*Math.min(dist/maxDist, 0.7)-20, 0); 
        const r = Math.PI*(1+Math.sin(p*Math.PI/2))/2;
        a = Math.cos(-distanceRotation + r);
        b = Math.sin(-distanceRotation + r);
        x = distancePosition.x;
        y = distancePosition.y;

        distancePosition.x = x * a - y * b;
        distancePosition.y = x * b + y * a;

        while (content.lastChild.id !== "radar") {
            content.removeChild(content.lastChild);
        }

        const goal = document.createElement("div");
        const distance = document.createElement("div");
        goal.id = "goal";
        distance.id = "distance";

        goalPosition.x += radarX + (radarRect.right - radarRect.left - 25) / 2;
        goalPosition.y += (radar.clientHeight - 25) / 2;
        goal.style.left = goalPosition.x.toString() + 'px';
        goal.style.top = goalPosition.y.toString() + 'px';
        content.appendChild(goal);

        distancePosition.x += goalPosition.x-12.5;
        distancePosition.y += goalPosition.y;
        distance.innerHTML = Math.round(dist-10) + " meter";
        distance.style.left = distancePosition.x.toString() + 'px';
        distance.style.top = distancePosition.y.toString() + 'px';
        content.appendChild(distance);
    });

    document.addEventListener('keydown', (e) => {
        if (!gameOver && gameRunning) {
            switch (e.keyCode) {
                case 87:
                    socket.emit('controls', {
                        direction: 'Up',
                        pressed: true
                    });
                    break;
                case 68:
                    socket.emit('controls', {
                        direction: 'Right',
                        pressed: true
                    });
                    break;
                case 83:
                    socket.emit('controls', {
                        direction: 'Down',
                        pressed: true
                    });
                    break;
                case 65:
                    socket.emit('controls', {
                        direction: 'Left',
                        pressed: true
                    });
                    break;
            }
        }
    });

    document.addEventListener('keyup', (e) => {
        if (!gameOver && gameRunning) {
            switch (e.keyCode) {
                case 87:
                    socket.emit('controls', {
                        direction: 'Up',
                        pressed: false
                    });
                    break;
                case 68:
                    socket.emit('controls', {
                        direction: 'Right',
                        pressed: false
                    });
                    break;
                case 83:
                    socket.emit('controls', {
                        direction: 'Down',
                        pressed: false
                    });
                    break;
                case 65:
                    socket.emit('controls', {
                        direction: 'Left',
                        pressed: false
                    });
                    break;
            }
        } 
    });
    
    socket.on('controls', (data) => {
        if (!gameOver && gameRunning) {
            switch (data.direction) {
                case 'Up':
                    triangleUp.style.borderColor = data.pressed ? 
                        "red" : "white";
                    up = data.pressed;
                    break;
                case 'Right':
                    triangleRight.style.borderColor = data.pressed ? 
                        "red" : "white";
                    right = data.pressed;
                    break;
                case 'Down':
                    triangleDown.style.borderColor = data.pressed ?
                        "red" : "white";
                    back = data.pressed;
                    break;
                case 'Left':
                    triangleLeft.style.borderColor = data.pressed ?
                        "red" : "white";
                    left = data.pressed;
                    break;
            }
        } else if (!gameOver && !data.pressed) {
            $('#myModal').modal('hide');
            gameRunning = true;
            socket.emit('startGame');
        }

    });

    document.addEventListener('keyup', (e) => {
        if (!gameOver && gameRunning) {
            switch (e.keyCode) {
                case 87:
                    triangleUp.style.borderColor = "white";
                    up = false;
                    socket.emit('controls', {
                        direction: 'Up',
                        pressed: false
                    });
                    break;
                case 68:
                    triangleRight.style.borderColor = "white";
                    right = false;
                    socket.emit('controls', {
                        direction: 'Right',
                        pressed: false
                    });
                    break;
                case 83:
                    triangleDown.style.borderColor = "white";
                    down = false;
                    socket.emit('controls', {
                        direction: 'Down',
                        pressed: false
                    });
                    break;
                case 65:
                    triangleLeft.style.borderColor = "white";
                    left = false;
                    socket.emit('controls', {
                        direction: 'Left',
                        pressed: false
                    });
                    break;
            }
        } else if (!gameOver) {
            $('#myModal').modal('hide');
            gameRunning = true;
            onSand = false;
            onRocks = false;
            roverImages.src = "assets/images/roverImage.png";
            hpMeter.classList.add('bg-success');
            hpMeter.classList.remove('bg-warning');
            hpMeter.classList.remove('bg-danger');
            batteryMeter.classList.remove('bg-warning');
            batteryMeter.classList.remove('bg-danger');
            socket.emit('startGame');
        }
    });



    winloseText.style.color = "blue";
    winloseText.innerHTML = "TRYCK FÖR ATT STARTA";
    $('#myModal').modal('show');
}
