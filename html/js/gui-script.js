window.onload = () => {
    // Controls
    let up, down, left, right;
    let roverHealth, roverBattery;

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
    const winloseText = document.getElementById("winloseText");

    const socket = io.connect('http://localhost');

    socket.connect('http://localhost').on('roverData', (data) => {
        roverHealth = data.health;
        roverBattery = data.battery;

        // HP
        hpText.innerHTML = Math.round(roverHealth).toString() + "%";
        hpMeter.style.width = roverHealth.toString() + "%";

        // Battery
        batteryText.innerHTML = Math.round(roverBattery).toString() + "%";
        batteryMeter.style.width = roverBattery.toString() + "%";

        // Rover
        if (roverHealth >= 80) {
            roverImages.src = "assets/images/roverImage.png";
        } else if (roverHealth >= 60) {
            roverImages.src = "assets/images/roverImage_slightly_damaged.png";
        } else if (roverHealth >= 40) {
            roverImages.src = "assets/images/roverImage_damaged.png";
        } else if (roverHealth >= 20) {
            hpMeter.classList.add('bg-warning');
            hpMeter.classList.remove('bg-success');
            roverImages.src = "assets/images/roverImage_critical.png";
        } else if (roverHealth > 0) {
            hpMeter.classList.add('bg-danger');
            hpMeter.classList.remove('bg-warning');
        } else {
            roverImages.src = "assets/images/roverImage_dead.png";
        }

        if (roverBattery < 33) {
            roverBattery.classList.add('bg-danger');
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.keyCode === 38 /* up */ ||
            e.keyCode === 87 /* w */ ||
            e.keyCode === 90 /* z */ ) {
            triangleUp.style.borderColor = "red";
            up = true;
            socket.emit('control', {
                direction: 'Up',
                pressed: true
            });

            //Test code to open modal please remove
            winloseText.style.color = "red";
            winloseText.innerHTML = "UPPDRAG MISSLYCKAT";

            $('#myModal').modal('show')


        }

        if (e.keyCode === 39 /* right */ ||
            e.keyCode === 68 /* d */ ) {
            triangleRight.style.borderColor = "red";
            right = true;
            socket.emit('control', {
                direction: 'Right',
                pressed: true
            });
        }

        if (e.keyCode === 40 /* down */ ||
            e.keyCode === 83 /* s */ ) {
            triangleDown.style.borderColor = "red";
            back = true;
            socket.emit('control', {
                direction: 'Down',
                pressed: true
            });
        }

        if (e.keyCode === 37 /* left */ ||
            e.keyCode === 65 /* a */ ||
            e.keyCode === 81 /* q */ ) {
            triangleLeft.style.borderColor = "red";
            left = true;
            socket.emit('control', {
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
            socket.emit('control', {
                direction: 'Up',
                pressed: false
            });
        }

        if (e.keyCode === 39 /* right */ ||
            e.keyCode === 68 /* d */ ) {
            triangleRight.style.borderColor = "white";
            right = false;
            socket.emit('control', {
                direction: 'Right',
                pressed: false
            });
        }

        if (e.keyCode === 40 /* down */ ||
            e.keyCode === 83 /* s */ ) {
            triangleDown.style.borderColor = "white";
            down = false;
            socket.emit('control', {
                direction: 'Down',
                pressed: false
            });
        }

        if (e.keyCode === 37 /* left */ ||
            e.keyCode === 65 /* a */ ||
            e.keyCode === 81 /* q */ ) {
            triangleLeft.style.borderColor = "white";
            left = false;
            socket.emit('control', {
                direction: 'Left',
                pressed: false
            });
        }
    });
}
