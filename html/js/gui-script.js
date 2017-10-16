//Controls
var up, down, left, right;

document.addEventListener('keydown', press)

function press(e) {
    if (e.keyCode === 38 /* up */ || e.keyCode === 87 /* w */ || e.keyCode === 90 /* z */ ) {
        up = true;
        document.getElementById("triangleUp").style.borderColor = "red";
        console.log("up");


        //to test hp
        var currentHp = parseInt(document.getElementById("hpMeter").style.width);

        var damageTaken = 10;
        var newHp = (currentHp - damageTaken);

        var hpText = document.getElementById("hpText").innerHTML = (newHp.toString() + "%");

        console.log("New hp = " + newHp + "%");

        document.getElementById("hpMeter").style.width = (newHp.toString() + "%");

        //Rover
        if (newHp >= 80) {
            console.log("över 90");
            document.getElementById("roverImages").src = "assets/images/roverImage.png"

        } else if (newHp < 80 && newHp >= 60) {
            console.log("Under 90");
            document.getElementById("roverImages").src = "assets/images/roverImage_slightly_damaged.png"

        } else if (newHp < 60 && newHp >= 40) {
            document.getElementById("roverImages").src = "assets/images/roverImage_damaged.png"

        } else if (newHp < 40 && newHp >= 20) {
            document.getElementById("hpMeter").classList.add('bg-warning');

            document.getElementById("hpMeter").classList.remove('bg-success');

            document.getElementById("roverImages").src = "assets/images/roverImage_critical.png"

        } else if (newHp === 0) {

            document.getElementById("roverImages").src = "assets/images/roverImage_dead.png"
        }


        if (newHp <= 50 && newHp > 20) {
            document.getElementById("hpMeter").classList.add('bg-warning');

            document.getElementById("hpMeter").classList.remove('bg-success');
        }
        if (newHp <= 20) {
            document.getElementById("hpMeter").classList.add('bg-danger');

            document.getElementById("hpMeter").classList.remove('bg-warning');
        }


    }

    if (e.keyCode === 39 /* right */ || e.keyCode === 68 /* d */ ) {
        console.log("right")
        right = true;
        document.getElementById("triangleRight").style.borderColor = "red";
    }

    if (e.keyCode === 40 /* down */ || e.keyCode === 83 /* s */ ) {
        console.log("down")
        back = true;
        document.getElementById("triangleDown").style.borderColor = "red";
    }
    if (e.keyCode === 37 /* left */ || e.keyCode === 65 /* a */ || e.keyCode === 81 /* q */ ) {
        console.log("left")
        left = true;
        document.getElementById("triangleLeft").style.borderColor = "red";
    }
}

document.addEventListener('keyup', release)

function release(e) {
    if (e.keyCode === 38 /* up */ || e.keyCode === 87 /* w */ || e.keyCode === 90 /* z */ ) {
        document.getElementById("triangleUp").style.borderColor = "white";
        up = false;
    }
    if (e.keyCode === 39 /* right */ || e.keyCode === 68 /* d */ ) {
        document.getElementById("triangleRight").style.borderColor = "white";
        right = false;
    }
    if (e.keyCode === 40 /* down */ || e.keyCode === 83 /* s */ ) {
        document.getElementById("triangleDown").style.borderColor = "white";
        down = false;
    }
    if (e.keyCode === 37 /* left */ || e.keyCode === 65 /* a */ || e.keyCode === 81 /* q */ ) {
        document.getElementById("triangleLeft").style.borderColor = "white";
        left = false;
    }
}

//Health & Rover
function healthBar() {
    var currentHp = parseInt(document.getElementById("hpMeter").style.width);

    var damageTaken = 10;
    var newHp = (currentHp - damageTaken);

    var hpText = document.getElementById("hpText").innerHTML = (newHp.toString() + "%");

    console.log("New hp = " + newHp + "%");

    document.getElementById("hpMeter").style.width = (newHp.toString() + "%");


    //Rover
    if (newHp >= 80) {
        console.log("över 90");
        document.getElementById("roverImages").src = "assets/images/roverImage.png"

    } else if (newHp < 80 && newHp >= 60) {
        console.log("Under 90");
        document.getElementById("roverImages").src = "assets/images/roverImage_slightly_damaged.png"

    } else if (newHp < 60 && newHp >= 40) {
        document.getElementById("roverImages").src = "assets/images/roverImage_damaged.png"

    } else if (newHp < 40 && newHp >= 20) {
        document.getElementById("hpMeter").classList.add('bg-warning');

        document.getElementById("hpMeter").classList.remove('bg-success');

        document.getElementById("roverImages").src = "assets/images/roverImage_critical.png"

    } else if (newHp === 0) {

        document.getElementById("roverImages").src = "assets/images/roverImage_dead.png"
    }


    if (newHp <= 50 && newHp > 20) {
        document.getElementById("hpMeter").classList.add('bg-warning');

        document.getElementById("hpMeter").classList.remove('bg-success');
    }
    if (newHp <= 20) {
        document.getElementById("hpMeter").classList.add('bg-danger');

        document.getElementById("hpMeter").classList.remove('bg-warning');
    }


}


//Battery
