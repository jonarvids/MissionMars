window.onload = function () {
    
    var scene = document.querySelector("a-scene");
    var world = scene.systems.physics.driver.world; 

    // Create the vehicle
    var rover = document.getElementById("rover");        
    vehicle = new CANNON.RaycastVehicle({
        chassisBody: rover.body,
    });

    // Wheel options
    var options = {
        radius: 0.5,
        directionLocal: new CANNON.Vec3(0, 0, -1),
        suspensionStiffness: 30,
        suspensionRestLength: 0.3,
        frictionSlip: 5,
        dampingRelaxation: 2.3,
        dampingCompression: 4.4,
        maxSuspensionForce: 100000,
        rollInfluence:  0.01,
        axleLocal: new CANNON.Vec3(0, 1, 0),
        chassisConnectionPointLocal: new CANNON.Vec3(1, 1, 0),
        maxSuspensionTravel: 0.3,
        customSlidingRotationalSpeed: -30,
        useCustomSlidingRotationalSpeed: true
    };
    // Add wheels to the vehicle and then add the vehicle to the world
    options.chassisConnectionPointLocal.set(1, 1, 0);
    vehicle.addWheel(options);
    options.chassisConnectionPointLocal.set(1, -1, 0);
    vehicle.addWheel(options);
    options.chassisConnectionPointLocal.set(-1, 1, 0);
    vehicle.addWheel(options);
    options.chassisConnectionPointLocal.set(-1, -1, 0);
    vehicle.addWheel(options);
    vehicle.addToWorld(world);

    // Give the wheel bodies which can not be displayed at the moment...
    var wheelBodies = [];
    for(var i=0; i<vehicle.wheelInfos.length; i++){
        var wheel = vehicle.wheelInfos[i];
        var cylinderShape = new CANNON.Cylinder(wheel.radius, wheel.radius, wheel.radius / 2, 20);
        var wheelBody = new CANNON.Body({ mass: 1 });
        var q = new CANNON.Quaternion();
        q.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2);
        wheelBody.addShape(cylinderShape, new CANNON.Vec3(), q);
        wheelBodies.push(wheelBody);
    }

    // Update wheels
    world.addEventListener('postStep', function(){
        for (var i = 0; i < vehicle.wheelInfos.length; i++) {
            vehicle.updateWheelTransform(i);
            var t = vehicle.wheelInfos[i].worldTransform;
            wheelBodies[i].position.copy(t.position);
            wheelBodies[i].quaternion.copy(t.quaternion);
        }
    });
};


document.onkeydown = handler;
document.onkeyup = handler;

var maxSteerVal = 0.75;
var maxForce = 500;
var brakeForce = 1000000;

function handler(event) {
    
    var up = (event.type == 'keyup');

    if(!up && event.type !== 'keydown'){
        return;
    }

    vehicle.setBrake(0, 0);
    vehicle.setBrake(0, 1);
    vehicle.setBrake(0, 2);
    vehicle.setBrake(0, 3);

    switch(event.keyCode){

    case 38: // forward
        vehicle.applyEngineForce(up ? 0 : -maxForce, 2);
        vehicle.applyEngineForce(up ? 0 : -maxForce, 3);
        break;

    case 40: // backward
        vehicle.applyEngineForce(up ? 0 : maxForce, 2);
        vehicle.applyEngineForce(up ? 0 : maxForce, 3);
        break;

    case 66: // b
        vehicle.setBrake(brakeForce, 0);
        vehicle.setBrake(brakeForce, 1);
        vehicle.setBrake(brakeForce, 2);
        vehicle.setBrake(brakeForce, 3);
        break;

    case 39: // right
        vehicle.setSteeringValue(up ? 0 : -maxSteerVal, 0);
        vehicle.setSteeringValue(up ? 0 : -maxSteerVal, 1);
        break;

    case 37: // left
        vehicle.setSteeringValue(up ? 0 : maxSteerVal, 0);
        vehicle.setSteeringValue(up ? 0 : maxSteerVal, 1);
        break;

    }
}