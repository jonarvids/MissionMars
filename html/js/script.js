let socket = io.connect('http://mission-mars.local');

socket.on('update', function (data) {
	up = down = left = right = false;

	switch (data.direction) {
		case 'Forward':
			up = data.pressed;
			break;
		case 'Back':
			down = data.pressed;
			break;
		case 'Left':
			left = data.pressed;
			break;
		case 'Right':
			right = data.pressed;
			break;
	}
});

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


document.addEventListener('keydown',press)
function press(e){
  if (e.keyCode === 38 /* up */ || e.keyCode === 87 /* w */ || e.keyCode === 90 /* z */){
    up = true
  }
  if (e.keyCode === 39 /* right */ || e.keyCode === 68 /* d */){
    right = true
  }
  if (e.keyCode === 40 /* down */ || e.keyCode === 83 /* s */){
    down = true
  }
  if (e.keyCode === 37 /* left */ || e.keyCode === 65 /* a */ || e.keyCode === 81 /* q */){
    left = true
  }
}
document.addEventListener('keyup',release)
function release(e){
  if (e.keyCode === 38 /* up */ || e.keyCode === 87 /* w */ || e.keyCode === 90 /* z */){
    up = false
  }
  if (e.keyCode === 39 /* right */ || e.keyCode === 68 /* d */){
    right = false
  }
  if (e.keyCode === 40 /* down */ || e.keyCode === 83 /* s */){
    down = false
  }
  if (e.keyCode === 37 /* left */ || e.keyCode === 65 /* a */ || e.keyCode === 81 /* q */){
    left = false
  }
}



function gameLoop(){
  var rover = document.getElementById('rover').object3D;

  if (up){
  rover.translateZ( 0.05 );
  }
  if(down){
      rover.translateZ(-0.05);
  }
  if(left){
      rover.rotateY(0.05);
  }
  if(right){
      rover.rotateY(-0.05);
  }
    


requestAnimationFrame(gameLoop)
}
 requestAnimationFrame(gameLoop)




