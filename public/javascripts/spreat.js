/**
 * 
 */

function drawCircle() {
	d3.select("svg").append("circle").attr("cx", "50").attr("cy", "50").attr("r", "40")
	.attr("stroke", "green").attr("stroke-width", "4").attr("fill", "yellow")
	.attr("onclick", "makeBlue(this)")
	d3.select("svg").append("circle").attr("cx", "150").attr("cy", "50").attr("r", "40")
	.attr("stroke", "green").attr("stroke-width", "4").attr("fill", "yellow")
	.attr("onclick", "makeBlue(this)")
	d3.select("svg").append("circle").attr("cx", "250").attr("cy", "50").attr("r", "40")
	.attr("stroke", "green").attr("stroke-width", "4").attr("fill", "yellow")
	.attr("onclick", "makeBlue(this)")
}

function makeBlue(element) {
	d3.select(element).transition().attr("fill", "blue").attr("stroke", "black")
}
