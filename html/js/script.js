function worldForward(body, localForward = {x: 0, y: 0, z: -1}) {
    return body.quaternion.vmult(localForward);
}

function worldUp(body, localUp = {x: 0, y: 1, z: 0}) {
    return body.quaternion.vmult(localUp);
}

function rotationAroundYAxis(worldForward, worldUp) {
    // Compute rotation
    if (worldForward.x == 0 && worldForward.z < 0) {
        return 0;
    } else if (worldForward.x == 0) {
        return Math.PI;
    } else if (worldForward.x < 0) {
        return Math.PI / 2 + Math.atan(-worldForward.z / worldForward.x);
    }
    return Math.PI * 3 / 2 + Math.atan(-worldForward.z / worldForward.x);
}

function initGame(app) {
    // Update app data
    app.gameData = {
        goalPosition: {
            x: app.bodies.goal.position.x,
            y: app.bodies.goal.position.z
        } 
    };
    app.roverData = {
        position: {}
    };
    app.initialRoverPosition = {
        x: app.bodies.rover.position.x,
        y: app.bodies.rover.position.z
    };
    app.initialRoverRotation = rotationAroundYAxis(
        worldForward(app.bodies.rover),
        worldUp(app.bodies.rover));
    
    // Create materials for rover and ground
    app.bodies.rover.material  = new CANNON.Material("roverMaterial");
    app.bodies.ground.material = new CANNON.Material("groundMaterial");

    // Add contact material between ground and rover to the world
    app.world.addContactMaterial(
        new CANNON.ContactMaterial(
            app.bodies.rover.material, 
            app.bodies.ground.material, 
            {
                friction: 0.0,
                restitution: 0.3,
                contactEquationStiffness: 1e8,
                contactEquationRelaxation: 3
            }));

    // Add damping to rover
    app.bodies.rover.linearDamping  = 0.9;
    app.bodies.rover.angularDamping = 0.9999;

    // Remove collision response from sand, rocks, and the goal
    const sandElems  = document.querySelectorAll("#sand");
    const rocksElems = document.querySelectorAll("#rocks");
    for (i = 0; i < sand.length; i++) {
        sandElems[i].body.collisionResponse = false;
    }
    for (i = 0; i < rocks.length; i++) {
        rocksElems[i].body.collisionResponse = false;
    }
    app.bodies.goal.collisionResponse = false;

    // Add collision event listener to rover
    app.bodies.rover.addEventListener("collide", (e) => {
        if (e.body.el.id == "landscape") {
            app.roverData.health -= 5;
        } else if (e.body.el.id == "goal") {
            app.gameData.gameOver = true;
            app.gameData.success = true;
        }
    });

    // Add key press and release event listeners for controls
    document.addEventListener('keydown', (e) => {
        switch (e.keyCode) {
            case 87:
                app.goForward = true;
                break;
            case 68:
                app.turnRight = true;
                break;
            case 83:
                app.goBackwards = true;
                break;
            case 65:
                app.turnLeft = true;
                break;
        }
    });
    document.addEventListener('keyup', (e) => {
        switch (e.keyCode) {
            case 87:
                app.goForward = false;
                break;
            case 68:
                app.turnRight = false;
                break;
            case 83:
                app.goBackwards = false;
                break;
            case 65:
                app.turnLeft = false;
                break;
        }
    });

    // Initiate connection to server
    app.socket = io.connect(document.URL);

    // Listen for the controls event from the GUI
    app.socket.on('controls', function (data) {
        window.setTimeout(() => {
            switch (data.direction) {
                case 'Up':
                    app.goForward = data.pressed;
                    break;
                case 'Down':
                    app.goBackwards = data.pressed;
                    break;
                case 'Left':
                    app.turnLeft = data.pressed;
                    break;
                case 'Right':
                    app.turnRight = data.pressed;
                    break;
            }
        }, 3000);
    });
    
    app.socket.on('startGame', (e) => {
        // Start game
        startGame(app);
    });
}

function startGame(app) {
    // Set rover position
    app.bodies.rover.position.x = app.initialRoverPosition.x;
    app.bodies.rover.position.z = app.initialRoverPosition.y;
    app.bodies.rover.quaternion.setFromAxisAngle({x: 0, y: 1, z: 0}, app.initialRoverRotation);
   
    // Reset game and rover data
    app.gameData.gameOver = false;
    app.gameData.success  = false;
    app.roverData.health  = 100;
    app.roverData.battery = 100;
    app.roverData.onSand  = false;
    app.roverData.onRocks = false;

    // Send game data to initialize goal position in the GUI
    app.socket.emit('gameData', app.gameData);

    // Send rover data ever so often to the GUI
    app.roverDataEmitId = window.setInterval(() => {
        app.socket.emit('roverData', app.roverData);
    }, 50);

    // Goo into game loop
    app.dt = 0;
    app.timestamp = Date.now();
    gameLoop(app);
}

function gameLoop(app) {
    // Constants
    const linAcc = 5;
    const angAcc = 5;
    const maxLinSpeed = 2.65; // [length units] / [s]
    const maxAngSpeed = 0.70; // [length units] / [s]
    const batteryConstDrain = 0.05; // [bp] / [s]
    
    // Update time
    const timestamp = Date.now();
    app.dt          = timestamp - app.timestamp;
    app.timestamp   = timestamp;

    // Check if game is over
    if (app.gameData.gameOver) {
        // Set initial position and rotation for rover
        app.roverData.position.x = app.initialRoverPosition.x;
        app.roverData.position.y = app.initialRoverPosition.y;
        app.roverData.rotation = app.initialRoverRotation;

        // Clear rover data emit interval
        clearInterval(app.roverDataEmitId);

        // Tell the GUI that the game is over and wait for the next game
        app.socket.emit('gameData', app.gameData);
        app.socket.on('startGame', () => {
            startGame(app);
        });

        return;
    }

    // Compute rover's world forward and up vectors
    const forward = worldForward(app.bodies.rover);
    const up      = worldUp(app.bodies.rover);

    // Save rover data
    app.roverData.position.x = app.bodies.rover.position.x;
    app.roverData.position.y = app.bodies.rover.position.z;
    app.roverData.rotation   = rotationAroundYAxis(forward, up)

    // Compute linear and angular delta velocities
    const linDelta = forward.mult(linAcc * app.dt / 1000);
    const angDelta = up.mult(angAcc * app.dt / 1000);

    // Update the rover's velocities
    if (app.goForward) {
        app.bodies.rover.velocity.x += linDelta.x;
        app.bodies.rover.velocity.y += linDelta.y;
        app.bodies.rover.velocity.z += linDelta.z;
    } else if (app.goBackwards) {
        app.bodies.rover.velocity.x -= linDelta.x;
        app.bodies.rover.velocity.y -= linDelta.y;
        app.bodies.rover.velocity.z -= linDelta.z;
    } else if (app.turnLeft) {
        app.bodies.rover.angularVelocity.x += angDelta.x;
        app.bodies.rover.angularVelocity.y += angDelta.y;
        app.bodies.rover.angularVelocity.z += angDelta.z;
    } else if (app.turnRight) {
        app.bodies.rover.angularVelocity.x -= angDelta.x;
        app.bodies.rover.angularVelocity.y -= angDelta.y;
        app.bodies.rover.angularVelocity.z -= angDelta.z;
    }

    // Set initial health and battery drain factors
    let healthLinDrain = 0; // [hp] / [s]
    let healthAngDrain = 0; // [hp] / [s]
    let batteryLinDrain = 0.1; // [bp] / [s]
    let batteryAngDrain = 0.5; // [bp] / [s]

    // Check if the rover is in contact with different materials
    const contacts = app.world.contacts;
    for (i = 0; i < contacts.length; i++) {
      let idA = contacts[i].bi.el.id;
      let idB = contacts[i].bj.el.id;

      if (idA == "rover" || idB == "rover") { 
        app.roverData.onSand  = idA == "sand" || idB == "sand";
        app.roverData.onRocks = idA == "rocks" || idB == "rocks";
          
        if (app.roverData.onSand) {
           batteryLinDrain = 0.5;
           batteryAngDrain = 1.5;
        } else if (app.roverData.onRocks) {
           healthLinDrain = 3;
           healthAngDrain = 5;
        }
      }
    }

    // Compute linear and angular speeds [length units] / [s]
    const curLinSpeed = app.bodies.rover.velocity.length();
    const curAngSpeed = app.bodies.rover.angularVelocity.length();

    // Compute normalized factors [constant]
    const linFactor = Math.floor(curLinSpeed / maxLinSpeed * 100) / 100;
    const angFactor = Math.floor(curAngSpeed / maxAngSpeed * 100) / 100;

    // Drain health and battery
    app.roverData.health  -= linFactor * healthLinDrain * app.dt / 1000; // [hp]
    app.roverData.health  -= angFactor * healthAngDrain * app.dt / 1000; // [hp]
    app.roverData.battery -= linFactor * batteryLinDrain * app.dt / 1000; // [bp]
    app.roverData.battery -= angFactor * batteryAngDrain * app.dt / 1000; // [bp]
    app.roverData.battery -= batteryConstDrain * app.dt / 1000; // [bp]

    // Makes sure health and battery levels don't go below 0
    app.roverData.health  = Math.max(app.roverData.health, 0);
    app.roverData.battery = Math.max(app.roverData.battery, 0);

    // If either health or battery is zero, then the game is over
    if (app.roverData.health == 0 || app.roverData.battery == 0) {
        app.gameData.gameOver = true;
        app.gameData.success  = false;
    }

    requestAnimationFrame(() => {
        gameLoop(app);
    });
}

window.onload = () => {
    const sceneElem  = document.querySelector("a-scene");
    const groundElem = document.getElementById("ground");
    const roverElem  = document.getElementById("rover");
    const goalElem   = document.getElementById("goal");

    groundElem.addEventListener('body-loaded', () => {
        roverElem.addEventListener('body-loaded', () => {
            app = {
                world: sceneElem.systems.physics.driver.world,
                bodies: {
                    ground: groundElem.body,
                    rover: roverElem.body,
                    goal: goalElem.body
                }
            };
            initGame(app);
        });
    });
}
