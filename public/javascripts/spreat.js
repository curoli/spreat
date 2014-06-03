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
var atomShapes
var player1 = {
	color : "yellow"
}
var player2 = {
	color : "blue"
}
var players = [ player1, player2 ]
var iCurrentPlayer = 0
var waitingToMove = true

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
					fill : "#aaaaaa",
					hasOwner : false
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
}

function onFieldClick(event) {
	if (waitingToMove) {
		waitingToMove = false
		var mousePos = d3.mouse(this)
		var iField = parseInt(this.getAttribute("iField"))
		var field = fields[iField]
		var currentPlayer = players[iCurrentPlayer]
		if (!field.hasOwner || (field.owner == currentPlayer)) {
			field.hasOwner = true
			field.owner = currentPlayer
			var atom = {}
			atom.x = mousePos[0]
			atom.y = mousePos[1]
			atom.iField = iField
			atom.owner = currentPlayer
			atoms.push(atom)
			field.atoms.push(atom)
			refreshAtomShapes()
			drawAtoms(100)
			packAtomsOnField(field)
			drawAtoms(500)
			redistributeAtoms()
			iCurrentPlayer = (iCurrentPlayer + 1) % players.length
		}
		if (atomShapes.length > 0) {
			atomShapes = atomShapes.each("end", function() {
				waitingToMove = true
			})
		} else {
			waitingToMove = true
		}
	}
}

function drawFields() {
	var fieldShapes = d3.select("svg").selectAll("polygon").data(fields)
	fieldShapes.enter().append("polygon").on("click", onFieldClick)
			.transition().attr("points", function(d) {
				return hexagonPoints(d)
			}).attr("stroke", "#ffffff").attr("stroke-width", "3").attr("fill",
					function(d) {
						return d.fill
					}).attr("iField", function(d) {
				return d.iField
			})
	fieldShapes = fieldShapes.on("click", onFieldClick).transition().attr(
			"points", function(d) {
				return hexagonPoints(d)
			}).attr("stroke", "#ffffff").attr("stroke-width", "3").attr("fill",
			function(d) {
				return d.fill
			}).attr("iField", function(d) {
		return d.iField
	})

}

function refreshAtomShapes() {
	var atomShapes = d3.select("svg").selectAll("circle").data(atoms)
	atomShapes.enter().append("circle")
	atomShapes = atomShapes.transition().duration(0)
}

function drawAtoms(duration) {
	atomShapes = atomShapes.transition().duration(duration).attr("cx", function(d) {
		return d.x
	}).attr("cy", function(d) {
		return d.y
	}).attr("r", rAtom).attr("stroke", "#000000").attr("stroke-width", 1).attr(
			"fill", function(d) {
				return d.owner.color
			})
}

function drawNewBoard() {
	initFields()
	drawFields()
	refreshAtomShapes()
	drawAtoms(100)
	waitingForMove = true
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

function packAtomsOnField(field) {
	var atoms = field.atoms
	var dAtom = 2 * rAtom + 2
	var rField = rx - rAtom - 3
	if (atoms.length > 0) {
		for (var i = 0; i < 3; i++) {
			for (var i1 = 0; i1 < atoms.length; i1++) {
				var atom1 = atoms[i1]
				for (var i2 = 0; i2 < atoms.length; i2++) {
					if (i1 != i2) {
						var atom2 = atoms[i2]
						shiftAtomToR(atom1, atom2, dAtom, true)
					}
				}
				shiftAtomToR(atom1, field, rField, false)
			}
		}
	}
}

function redistributeAtoms() {
	var durationPack = 100
	var durationSpread = 1000
	var delay = 200
	var currentPlayer = players[iCurrentPlayer]
	var keepGoing = true
	var nDistributions = 0
	var nDistributionsMax = 700
	while (keepGoing && nDistributions <= nDistributionsMax) {
		nDistributions++
		keepGoing = false
		for (var iField = 0; iField < fields.length; iField++) {
			var field = fields[iField]
			if (field.atoms.length >= field.iNeighbours.length) {
				for (var iFieldAtom = 0; iFieldAtom < field.iNeighbours.length; iFieldAtom++) {
					var iNeighbour = field.iNeighbours[iFieldAtom]
					field.atoms[iFieldAtom].iField = iNeighbour
					var neighbour = fields[iNeighbour]
					neighbour.hasOwner = true
					neighbour.owner = currentPlayer
				}
				keepGoing = true
			}
			field.atoms = []
		}
		for (var iAtom = 0; iAtom < atoms.length; iAtom++) {
			var atom = atoms[iAtom]
			var field = fields[atom.iField]
			field.atoms.push(atom)
		}
		for (var iField = 0; iField < fields.length; iField++) {
			var field = fields[iField]
			if (field.atoms.length > 0) {
				for (var iFieldAtom = 0; iFieldAtom < field.atoms.length; iFieldAtom++) {
					var atom = field.atoms[iFieldAtom]
					atom.owner = field.owner
				}
				packAtomsOnField(field)
			} else {
				field.hasOwner = false
			}
		}
		drawAtoms(1000)
	}
}
