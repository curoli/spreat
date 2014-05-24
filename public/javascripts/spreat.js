/**
 * 
 */

var pad = 10
var rx = 50
var ry = 0.5 * rx * Math.sqrt(3)

function drawCircles() {
	var xs = []
	for (var ix = 0; ix < 3; ix++) {
		for (var iy = 0; iy < 3; iy++) {
			xs.push({
				x : pad + rx + ix * 2 * rx + iy * rx,
				y : pad + rx + iy * 2 * ry
			})
		}
	}
	d3.select("svg").selectAll("circle").data(xs).enter().append("circle")
			.transition().attr("cx", function(d) {
				return d.x
			}).attr("cy", function(d) {
				return d.y
			}).attr("r", rx).attr("stroke", "green").attr("stroke-width", "4")
			.attr("fill", "yellow").attr("onclick", "makeBlue(this)")
}

function makeBlue(element) {
	d3.select(element).transition().attr("fill", "blue")
			.attr("stroke", "black")
}
