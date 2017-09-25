AFRAME.registerComponent("box", {

    init: function () {
        var el = this.el;

        var scaleState = false;
        el.addEventListener("click", function () {
            if (!scaleState) {
                el.setAttribute("scale", { x: 1, y: 1, z: 1 });
            } else {
                el.setAttribute("scale", { x: 0.5, y: 0.5, z: 0.5 });
            }
            scaleState = !scaleState;
        });
    }
});

AFRAME.registerComponent("follow", {

    schema: {
        target: { type: 'selector' }
    },

    tick: function (time, timeDelta) {
        var directionVec3 = new THREE.Vector3();
        var el = this.el;
        var data = this.data;

        // Get the target's position
        var targetPosition = data.target.object3D.position;

        // Set this element's position to the target's position
        el.setAttribute('position', {
            x: targetPosition.x,
            y: targetPosition.y + 1.6,
            z: targetPosition.z
        });
    },
});