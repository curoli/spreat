/**
 * 
 */

function drawCircle() {
	d3.select("svg").append("circle").attr("cx", "50").attr("cy", "50").attr("r", "40")
	.attr("stroke", "green").attr("stroke-width", "4").attr("fill", "yellow")
	.attr("onclick", "makeBlue()")
}

function makeBlue() {
	d3.select("circle").attr("fill", "blue").attr("stroke", "black")
}
