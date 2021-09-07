/**
 * Defines the content for css content style at some cells for PouchSpreadsheet
 */
export default (rowCells, cell) => {
  if (cell.col === 'a') {
    return Object({'info-content': rowCells.filter(x => x.col === 'dist')[0].val === 'Rect'})
  }
  return {}
}