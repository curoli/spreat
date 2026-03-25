spreat
======

Spreat is a static browser game prototype for a chain-reaction board game on a
hexagonal grid.

Rules
-----

Board game where two (or more) players place atoms on hexagons until these
explode and distribute atoms around, causing chain reactions.

The board consists of hexagons arranged in a honeycomb pattern. Players take
turns. During each turn, a player places a new atom they own on a hexagon that
is either empty or occupied by the player's own atoms.

As soon as a hexagon acquires at least as many atoms as it has nearest
neighbours, it explodes and one atom is distributed to each neighbour while
turning any atoms already on these neighbours into atoms of the player who
triggered the explosion.

An explosion can cause neighbours to immediately explode, too, and trigger a
chain reaction.

The goal is to turn all other players' atoms into your own.

Run locally
-----------

This project no longer depends on Play Framework. It is a static web project.
You can either open `index.html` directly in a browser or serve the directory
with any simple static file server.

Examples:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/`.

Project structure
-----------------

- `index.html` is the static entry page.
- `public/javascripts/spreat.js` contains the game logic and rendering.
- `public/javascripts/d3.js` is the bundled D3 dependency.

History
-------

This game has been modeled after two games I encountered years ago, both being
played on a checkerboard.

The first was called Sprengmeister (German for "demolition master") running on
an Atari ST. In Sprengmeister, explosions happened one at a time, so a
symmetric distribution of atoms may become unsymmetric during explosions.

The second was called Atomic, and I don't remember whether it was on Atari ST
or Intel x86. I also don't remember whether it handled explosions consecutively
or concurrently, but I do remember that it had some bugs and crashed on
occasion.

Oliver Ruebenacker, June 5, Cambridge, MA, USA
