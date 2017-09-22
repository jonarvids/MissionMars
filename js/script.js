var box = document.getElementById('box');
if(box) {
    box.addEventListener("click", function() {
        box.setAttribute("scale", {x: 1, y: 1, z: 1})
    });
    box.addEventListener("mouseenter", function() {
        box.setAttribute("color", "blue")
    });
    box.addEventListener("mouseleave", function() {
        box.setAttribute("color", "red")
    });
} else {
    document.write("No box found!");
}