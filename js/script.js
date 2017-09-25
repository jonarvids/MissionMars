AFRAME.registerComponent("box", {

    schema: {
        width: { type: 'number', default: 1 },
        height: { type: 'number', default: 1 },
        depth: { type: 'number', default: 1 },
        color: { type: 'color', default: '#FF000' }
    },

    init: function () {

        var data = this.data;
        var el = this.el;

        // Create geometry.
        this.geometry = new THREE.BoxBufferGeometry(data.width, data.height, data.depth);
        // Create material.
        this.material = new THREE.MeshStandardMaterial({color: data.color});
        // Create mesh.
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        // Set mesh on entity.
        el.setObject3D('mesh', this.mesh);

        var scaleState = false;
        el.addEventListener("click", function () {
            if (!scaleState) {
                el.setAttribute("scale", { x: 1, y: 1, z: 1 });
            } else {
                el.setAttribute("scale", { x: 2, y: 2, z: 2 });
            }
            scaleState = !scaleState;
        });
    }
});