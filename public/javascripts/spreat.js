/**
 * 
 */

var pad = 10
var rx = 50
var ry = (2/3) * rx * Math.sqrt(3)

function hexagonPoints(cxy) {
	var xyStrings = []
	for(var ic = 0; ic < 6; ic++) {
		var angle = (2*ic + 1)*Math.PI/6
		xyStrings.push((cxy.x + ry*Math.cos(angle)) + "," + (cxy.y + ry*Math.sin(angle)))
	}
	return xyStrings.join(" ")
}

function drawBoard() {
	var xs = []
	for (var ix = 0; ix < 3; ix++) {
		for (var iy = 0; iy < 3; iy++) {
			xs.push({
				x : pad + rx + ix * 2 * rx + iy * rx,
				y : pad + rx + iy * 1.5 * ry
			})
		}
	}
	d3.select("svg").selectAll("polygon").data(xs).enter().append("polygon")
			.transition().attr("points", function(d) {
				return hexagonPoints(d)
			}).attr("stroke", "green").attr("stroke-width", "4").attr("fill",
					"yellow").attr("onclick", "makeBlue(this)")
}

function makeBlue(element) {
	d3.select(element).transition().attr("fill", "blue")
			.attr("stroke", "black")
}
