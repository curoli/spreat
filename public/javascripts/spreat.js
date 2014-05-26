/**
 * 
 */

var pad = 10
var rx = 50
var ry = (2/3) * rx * Math.sqrt(3)

function hexagonPoints(cxy) {
	var cx = cxy.x
	var cy = cxy.y
	var x = [ cx + rx, cx, cx - rx, cx - rx, cx, cx + rx ]
	var y = [ cy - 0.5 * ry, cy - ry, cy - 0.5 * ry, cy + 0.5 * ry, cy + ry,
			cy + 0.5 * ry ]
	return x[0] + ", " + y[0] + " " + x[1] + ", " + y[1] + " " + x[2] + ", "
			+ y[2] + " " + x[3] + ", " + y[3] + " " + x[4] + ", " + y[4] + " "
			+ x[5] + ", " + y[5]
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
