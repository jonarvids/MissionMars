window.onload = () => {
    // Controls
    let up, down, left, right;
    let roverHealth, roverBattery, missionComplete, onRocks, onSand;

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

    socket.on('roverData', (data) => {
        // Rover
        if (roverHealth >= 80 && data.health < 80) {
            roverImages.src = "assets/images/roverImage.png";
        } else if (roverHealth >= 60 && data.health < 60) {
            roverImages.src = "assets/images/roverImage_slightly_damaged.png";
        } else if (roverHealth >= 40 && data.health < 40) {
            roverImages.src = "assets/images/roverImage_damaged.png";
            hpMeter.classList.add('bg-warning');
            hpMeter.classList.remove('bg-success');
        } else if (roverHealth >= 20 && data.health < 20) {
            roverImages.src = "assets/images/roverImage_critical.png";
        } else if (roverHealth >= 10 && data.health < 10) {
            hpMeter.classList.add('bg-danger');
            hpMeter.classList.remove('bg-warning');
        } else if (data.health == 0) {
            roverImages.src = "assets/images/roverImage_dead.png";
        }

        if (roverBattery < 33) {
            batteryMeter.classList.add('bg-danger');
        }

        roverHealth = data.health;
        roverBattery = data.battery;
        missionComplete = data.missionComplete;
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


        //win
        if (missionComplete === true) {
            $('#myModal').modal('show')
        }

        //lose
        if (roverHealth === 0 || roverBattery === 0) {
            winloseText.style.color = "red";
            winloseText.innerHTML = "UPPDRAG MISSLYCKAT";

            $('#myModal').modal('show')
        }

        // HP
        hpText.innerHTML = Math.round(roverHealth).toString() + "%";
        hpMeter.style.width = roverHealth.toString() + "%";

        // Battery
        batteryText.innerHTML = Math.round(roverBattery).toString() + "%";
        batteryMeter.style.width = roverBattery.toString() + "%";

        // Goal
        const dx = data.goalPosition.x - data.position.x;
        const dy = data.goalPosition.y - data.position.y;
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

        a = Math.cos(-distanceRotation);
        b = Math.sin(-distanceRotation);
        x = distancePosition.x;
        y = distancePosition.y;

        distancePosition.x = x * a - y * b;
        distancePosition.y = x * b + y * a;

        while (content.lastChild.id !== "radar") {
            content.removeChild(content.lastChild);
        }

        const goal = document.createElement("div");
        const distance = document.createElement("div")
        goal.id = "goal";
        distance.id = "distance";

        const radarRect = radar.getBoundingClientRect(); 
        const radarX = radarRect.left - content.getBoundingClientRect().left;
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
        if (e.keyCode === 38 /* up */ ||
            e.keyCode === 87 /* w */ ||
            e.keyCode === 90 /* z */ ) {
            triangleUp.style.borderColor = "red";
            up = true;
            socket.emit('controls', {
                direction: 'Up',
                pressed: true
            });


        }

        if (e.keyCode === 39 /* right */ ||
            e.keyCode === 68 /* d */ ) {
            triangleRight.style.borderColor = "red";
            right = true;
            socket.emit('controls', {
                direction: 'Right',
                pressed: true
            });
        }

        if (e.keyCode === 40 /* down */ ||
            e.keyCode === 83 /* s */ ) {
            triangleDown.style.borderColor = "red";
            back = true;
            socket.emit('controls', {
                direction: 'Down',
                pressed: true
            });
        }

        if (e.keyCode === 37 /* left */ ||
            e.keyCode === 65 /* a */ ||
            e.keyCode === 81 /* q */ ) {
            triangleLeft.style.borderColor = "red";
            left = true;
            socket.emit('controls', {
                direction: 'Left',
                pressed: true
            });
        }
    });

    document.addEventListener('keyup', (e) => {
        if (e.keyCode === 38 /* up */ ||
            e.keyCode === 87 /* w */ ||
            e.keyCode === 90 /* z */ ) {
            triangleUp.style.borderColor = "white";
            up = false;
            socket.emit('controls', {
                direction: 'Up',
                pressed: false
            });
        }

        if (e.keyCode === 39 /* right */ ||
            e.keyCode === 68 /* d */ ) {
            triangleRight.style.borderColor = "white";
            right = false;
            socket.emit('controls', {
                direction: 'Right',
                pressed: false
            });
        }

        if (e.keyCode === 40 /* down */ ||
            e.keyCode === 83 /* s */ ) {
            triangleDown.style.borderColor = "white";
            down = false;
            socket.emit('controls', {
                direction: 'Down',
                pressed: false
            });
        }

        if (e.keyCode === 37 /* left */ ||
            e.keyCode === 65 /* a */ ||
            e.keyCode === 81 /* q */ ) {
            triangleLeft.style.borderColor = "white";
            left = false;
            socket.emit('controls', {
                direction: 'Left',
                pressed: false
            });
        }
    });
}
