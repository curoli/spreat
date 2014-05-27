/**
 * 
 */

var boardSize = 5
var pad = 10
var rx = 25
var ry = (2 / 3) * rx * Math.sqrt(3)
var fields = []

function hexagonPoints(cxy) {
	var xyStrings = []
	for (var ic = 0; ic < 6; ic++) {
		var angle = (2 * ic + 1) * Math.PI / 6
		xyStrings.push((cxy.x + ry * Math.cos(angle)) + ","
				+ (cxy.y + ry * Math.sin(angle)))
	}
	return xyStrings.join(" ")
}

function drawBoard() {
	for (var ix = 0; ix < 2 * boardSize + 1; ix++) {
		for (var iy = 0; iy < 2 * boardSize + 1; iy++) {
			if (ix + iy >= boardSize && ix + iy <= 3 * boardSize) {
				fields.push({
					x : pad + rx + (2 * ix - boardSize) * rx + iy * rx,
					y : pad + rx + iy * 1.5 * ry
				})
			}
		}
	}
	d3.select("#numberOfFields").text("Number of fields: " + fields.length)
	d3.select("svg").attr("width", 2 * pad + rx * (4 * boardSize + 2)).attr(
			"height", (2 * pad + rx + ry * (3 * boardSize + 1.5))).selectAll(
			"polygon").data(fields).enter().append("polygon").transition()
			.attr("points", function(d) {
				return hexagonPoints(d)
			}).attr("stroke", "green").attr("stroke-width", "3").attr("fill",
					"yellow").attr("onclick", "makeBlue(this)")
}

function makeBlue(element) {
	d3.select(element).transition().attr("fill", "blue")
}
