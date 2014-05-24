/**
 * 
 */

function drawCircles() {
	var xs = [ {
		x : 50,
		y : 50
	}, {
		x : 100,
		y : 150
	}, {
		x : 150,
		y : 50
	}, {
		x : 200,
		y : 150
	}, {
		x : 250,
		y : 50
	} ]
	d3.select("svg").selectAll("circle").data(xs).enter().append("circle")
			.transition().attr("cx", function(d) {
				return d.x
			}).attr("cy", function(d) {
				return d.y
			}).attr("r", "40").attr("stroke", "green")
			.attr("stroke-width", "4").attr("fill", "yellow").attr("onclick",
					"makeBlue(this)")
}

function makeBlue(element) {
	d3.select(element).transition().attr("fill", "blue")
			.attr("stroke", "black")
}
