
/*
    Not used
*/
AFRAME.registerComponent("follow", {

    schema: {
        target: { type: 'selector' }
    },

    tick: function (time, timeDelta) {
        var directionVec3 = new THREE.Vector3();
        var data = this.data;

        // Get the target's position
        var targetPosition = data.target.object3D.position;

        // Set this element's position to the target's position
        this.el.setAttribute('position', {
            x: targetPosition.x,
            y: targetPosition.y + 0.75,
            z: targetPosition.z - 0.25
        });
    },
});

var up = false,
    right = false,
    down = false,
    left = false;


document.addEventListener('keydown', press)
function press(e) {
    if (e.keyCode === 38 /* up */ || e.keyCode === 87 /* w */ || e.keyCode === 90 /* z */) {
        up = true
    }
    if (e.keyCode === 39 /* right */ || e.keyCode === 68 /* d */) {
        right = true
    }
    if (e.keyCode === 40 /* down */ || e.keyCode === 83 /* s */) {
        down = true
    }
    if (e.keyCode === 37 /* left */ || e.keyCode === 65 /* a */ || e.keyCode === 81 /* q */) {
        left = true
    }
}

document.addEventListener('keyup', release)
function release(e) {
    if (e.keyCode === 38 /* up */ || e.keyCode === 87 /* w */ || e.keyCode === 90 /* z */) {
        up = false
    }
    if (e.keyCode === 39 /* right */ || e.keyCode === 68 /* d */) {
        right = false
    }
    if (e.keyCode === 40 /* down */ || e.keyCode === 83 /* s */) {
        down = false
    }
    if (e.keyCode === 37 /* left */ || e.keyCode === 65 /* a */ || e.keyCode === 81 /* q */) {
        left = false
    }
}

AFRAME.registerComponent("movement-controls", {

    tick: function (time, delta) {
        var rover = this.el.object3D;

        var velocity = delta / 1000;
        if (up) {
            rover.translateZ(velocity);
        }
        if (down) {
            rover.translateZ(-velocity);
        }
        if (left) {
            rover.rotateY(velocity);
        }
        if (right) {
            rover.rotateY(-velocity);
        }
    }
})


