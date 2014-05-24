/**
 * 
 */

function drawCircles() {
	var xs = [ 50, 150, 250 ]
	d3.select("svg").selectAll("circle").data(xs).enter().append("circle")
			.attr("cx", function(d) {
				return d
			}).attr("cy", "50").attr("r", "40").attr("stroke", "green").attr(
					"stroke-width", "4").attr("fill", "yellow").attr("onclick",
					"makeBlue(this)")
}

function makeBlue(element) {
	d3.select(element).transition().attr("fill", "blue")
			.attr("stroke", "black")
}
