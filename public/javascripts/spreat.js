/**
 * 
 */

var boardSize = 5
var pad = 10
var rx = 25
var ry = (2 / 3) * rx * Math.sqrt(3)
var rAtom = 7
var fields = []
var atoms = []

function hexagonPoints(cxy) {
	var xyStrings = []
	for (var ic = 0; ic < 6; ic++) {
		var angle = (2 * ic + 1) * Math.PI / 6
		xyStrings.push((cxy.x + ry * Math.cos(angle)) + ","
				+ (cxy.y + ry * Math.sin(angle)))
	}
	return xyStrings.join(" ")
}

function isInBoard(ix, iy) {
	return ix + iy >= boardSize && ix + iy <= 3 * boardSize
}

function areNeighbours(ix1, iy1, ix2, iy2) {
	var ixd = ix1 - ix2
	if (ixd < -1 || ixd > 1) {
		return false
	}
	var iyd = iy1 - iy2
	if (iyd < -1 || iyd > 1) {
		return false
	}
	if (ixd == 0 && iyd == 0) {
		return false
	}
	var d = ixd + iyd
	return d >= -1 && d <= 1
}

function initFields() {
	for (var ix = 0; ix < 2 * boardSize + 1; ix++) {
		for (var iy = 0; iy < 2 * boardSize + 1; iy++) {
			if (isInBoard(ix, iy)) {
				fields.push({
					x : pad + rx + (2 * ix - boardSize) * rx + iy * rx,
					y : pad + rx + iy * 1.5 * ry,
					ix : ix,
					iy : iy,
					iField : fields.length,
					iNeighbours : [],
					atoms : [],
					fill : "yellow"
				})
			}
		}
	}
	for (var i1 = 0; i1 < fields.length; i1++) {
		var field1 = fields[i1]
		for (var i2 = 0; i2 < fields.length; i2++) {
			var field2 = fields[i2]
			if (areNeighbours(field1.ix, field1.iy, field2.ix, field2.iy)) {
				field1.iNeighbours.push(i2)
			}
		}
	}
	// alert(fields.toSource())
	var fieldShapes = d3.select("svg").attr("width",
			2 * pad + rx * (4 * boardSize + 2)).attr("height",
			(2 * pad + rx + ry * (3 * boardSize + 1.5)))
	d3.select("#numberOfFields").text("Number of fields: " + fields.length)
}

function onFieldClick(event) {
	var mousePos = d3.mouse(this)
	var iField = parseInt(this.getAttribute("iField"))
	var field = fields[iField]
	field.fill = "blue"
	for (var i = 0; i < field.iNeighbours.length; i++) {
		var iNeighbour = field.iNeighbours[i]
		fields[iNeighbour].fill = "red"
	}
	var atom = {}
	atom.x = mousePos[0]
	atom.y = mousePos[1]
	atom.fill = "orange"
	atom.iField = iField
	atoms.push(atom)
	field.atoms.push(atom)
	for (var i = 0; i < 3; i++) {
		packAtomsOnField(field, 2 * rAtom + 2, rx - rAtom - 3)
	}
	drawBoard()
}

function drawBoard() {
	var fieldShapes = d3.select("svg").selectAll("polygon").data(fields)
	fieldShapes.enter().append("polygon").on("click", onFieldClick)
			.transition().attr("points", function(d) {
				return hexagonPoints(d)
			}).attr("stroke", "green").attr("stroke-width", "3").attr("fill",
					function(d) {
						return d.fill
					}).attr("iField", function(d) {
				return d.iField
			})
	fieldShapes.on("click", onFieldClick).transition().attr("points",
			function(d) {
				return hexagonPoints(d)
			}).attr("stroke", "green").attr("stroke-width", "3").attr("fill",
			function(d) {
				return d.fill
			}).attr("iField", function(d) {
		return d.iField
	})
	var atomShapes = d3.select("svg").selectAll("circle").data(atoms)
	atomShapes.enter().append("circle").transition().attr("cx", function(d) {
		return d.x
	}).attr("cy", function(d) {
		return d.y
	}).attr("r", 5).attr("stroke", "black").attr("stroke-width", 1).attr(
			"fill", function(d) {
				return d.fill
			})
	atomShapes.transition().attr("cx", function(d) {
		return d.x
	}).attr("cy", function(d) {
		return d.y
	}).attr("r", rAtom).attr("stroke", "black").attr("stroke-width", 1).attr(
			"fill", function(d) {
				return d.fill
			})
}

function drawNewBoard() {
	initFields()
	drawBoard()
}

function shiftAtomToR(atom, anchor, r, shiftIfCloser) {
	var dx = atom.x - anchor.x
	var dy = atom.y - anchor.y
	var distSq = dx * dx + dy * dy
	if (shiftIfCloser && distSq < r * r) {
		if (distSq == 0) {
			atom.x = atom.x + 1
			dx = atom.x - anchor.x
			dy = atom.y - anchor.y
			distSq = dx * dx + dy * dy
		}
		var dist = Math.sqrt(distSq)
		atom.x = anchor.x + (r / dist) * (atom.x - anchor.x)
		atom.y = anchor.y + (r / dist) * (atom.y - anchor.y)
	} else if (!shiftIfCloser && distSq > r * r) {
		var dist = Math.sqrt(distSq)
		atom.x = anchor.x + (r / dist) * (atom.x - anchor.x)
		atom.y = anchor.y + (r / dist) * (atom.y - anchor.y)
	}
}

function packAtomsOnField(field, dAtom, rField) {
	var atoms = field.atoms
	if (atoms.length > 0) {
		for (i1 = 0; i1 < atoms.length; i1++) {
			var atom1 = atoms[i1]
			for (i2 = 0; i2 < atoms.length; i2++) {
				if (i1 != i2) {
					var atom2 = atoms[i2]
					shiftAtomToR(atom1, atom2, dAtom, true)
				}
			}
			shiftAtomToR(atom1, field, rField, false)
		}
	}
}