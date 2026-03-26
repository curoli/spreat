(() => {
  const DEFAULT_LAYOUT = {
    pad: 10,
    rx: 25,
  };

  function areNeighbours(ix1, iy1, ix2, iy2) {
    const ixd = ix1 - ix2;
    if (ixd < -1 || ixd > 1) {
      return false;
    }

    const iyd = iy1 - iy2;
    if (iyd < -1 || iyd > 1) {
      return false;
    }

    if (ixd === 0 && iyd === 0) {
      return false;
    }

    const d = ixd + iyd;
    return d >= -1 && d <= 1;
  }

  function isInBoard(boardSize, ix, iy) {
    return ix + iy >= boardSize && ix + iy <= 3 * boardSize;
  }

  function createBoard(boardSize, layout = DEFAULT_LAYOUT) {
    const { pad, rx } = layout;
    const ry = (2 / 3) * rx * Math.sqrt(3);
    const fields = [];

    for (let ix = 0; ix < 2 * boardSize + 1; ix += 1) {
      for (let iy = 0; iy < 2 * boardSize + 1; iy += 1) {
        if (!isInBoard(boardSize, ix, iy)) {
          continue;
        }

        fields.push({
          id: fields.length,
          ix,
          iy,
          x: pad + rx + (2 * ix - boardSize) * rx + iy * rx,
          y: pad + rx + iy * 1.5 * ry,
          neighbors: [],
          owner: null,
          atomCount: 0,
        });
      }
    }

    for (let i1 = 0; i1 < fields.length; i1 += 1) {
      const field1 = fields[i1];
      for (let i2 = 0; i2 < fields.length; i2 += 1) {
        const field2 = fields[i2];
        if (areNeighbours(field1.ix, field1.iy, field2.ix, field2.iy)) {
          field1.neighbors.push(field2.id);
        }
      }
    }

    return {
      boardSize,
      layout: {
        pad,
        rx,
        ry,
      },
      fields,
    };
  }

  function getFieldById(fields, fieldId) {
    return fields.find((field) => field.id === fieldId) || null;
  }

  window.SpreatBoard = {
    DEFAULT_LAYOUT,
    areNeighbours,
    isInBoard,
    createBoard,
    getFieldById,
  };
})();
