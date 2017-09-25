AFRAME.registerComponent("follow", {

    schema: {
        target: { type: 'selector' },
        speed: { type: 'number' }
    },

    init: function () {
        var directionVec3 = new THREE.Vector3();
    },

    tick: function (time, delta) {
        var directionVec3 = this.directionVec3;
        var el = this.el;
        var data = this.data;


        var targetPosition = data.target.object3D.position;
        var currentPosition = el.object3D.position;

        console.log(data.target.object3D.position);

        if (targetPosition != null) {
            // Subtract the vectors to get the direction the entity should head in.
            directionVec3.copy(targetPosition).sub(currentPosition);
            // Calculate the distance.
            var distance = directionVec3.length();
            // Don't go any closer if a close proximity has been reached.
            if (distance < 1) { return; }
            // Scale the direction vector's magnitude down to match the speed.
            var factor = data.speed / distance;
            ['x', 'y', 'z'].forEach(function (axis) {
                directionVec3[axis] *= factor * (timeDelta / 1000);
            });
            // Translate the entity in the direction towards the target.
            el.setAttribute('position', {
                x: currentPosition.x + directionVec3.x,
                y: currentPosition.y + directionVec3.y,
                z: currentPosition.z + directionVec3.z
            });
        }
    },
});