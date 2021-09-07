
const getMatrixRangeRows = (matrix, targetRange) => {
  /*
  Filter matrix to a subSet corresponding to targetRange

  matrix: [Array]
  targetRange: String
  return: [Array]
  */
  let targetRangeNum = parseFloat(targetRange)
  let res = []
  let rangeFound = false

  for (var i = 0; i < matrix.length; i++) {
    let row = matrix[i]
    let colVal = row['range']
    if (rangeFound && !isNaN(colVal)) break
    rangeFound = rangeFound || !isNaN(colVal) && (targetRangeNum <= colVal)
    if (rangeFound) res.push(row)
  }
  return res
}

const reshapeMatrix = (matrix) => {
  /*
  matrix: [[Object]]
  return: [Object]
  */
  return matrix.map(row => {
    return row.cells.reduce((a, c) => {
      a[c.col] = parseFloat(c.val)
      return a
    }, {})
  })
}

const getSubtestFuncData = (subTest, funcs, methods) => {
  let matrix = reshapeMatrix(subTest.ss.matrix)
  console.log(matrix)
  // matrix.reduce((a, c) => [])

  // let bla = matrix.reduce((a, row) => {
  //   return row['range']
  // }, [])
  // console.log(bla)

  Object.keys(subTest.varFuncMap).map(k => {
    let funcId = subTest.varFuncMap[k]
    let func = funcs.filter(func => func.id === funcId)[0]

    let matrix = reshapeMatrix(func.ss.matrix)
    let res = getMatrixRangeRows(matrix, 10)
    // console.log(res)
  })
  return 1
}

export { getSubtestFuncData }