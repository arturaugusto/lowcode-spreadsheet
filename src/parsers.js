const reshapeMatrix = (matrix) => {
  /*
  matrix: [{cells:[Object]}]
  return: [Object]
  */
  return matrix.map(row => {
    return row.cells.reduce((a, c) => {
      a[c.col] = parseFloat(c.val)
      return a
    }, {})
  })
}

const rowsReducer = (rows, textFields) => {
  /*
  rows: [[Object]]
  textFields: [String]
  return: [Object]
  */
  return rows.reduce((a, c) => {
    Object.keys(c).forEach(k => {
      a[k] = a[k] || []
      if (textFields && textFields.indexOf(k) !== -1) {
        if (c[k] && !c[k].trim()) a[k].push(c[k])
      } else {
        if (!isNaN(c[k])) a[k].push(c[k])
      }
    })
    return a
  }, {})
}

const keysToArrays = (groupedMatrices, textFields) => {
  /*
  groupedMatrices: [[Object]]
  textFields: [String]
  return: [Object]
  */
  return groupedMatrices.map(item => rowsReducer(item, textFields))
}


const groupBy = (reshapedMatrix, targetCol) => {
  /*
  reshapedMatrix: [Object]
  targetCol: String
  return: [[Object]]
  */
  return reshapedMatrix.reduce((a, c) => {
    if (!isNaN(c[targetCol])) {
      a.push([c])
    } else {
      a[a.length-1].push(c)
    }
    return a
  }, [])
}


const getSubtestData = (subTest) => {
  /*
  subTest
  return [[Object]]
  */
  let matrix = reshapeMatrix(subTest.ss.matrix)
  let byRange = groupBy(matrix, 'range')
  return byRange.map(rangeGroup => {
    let byPoint = groupBy(rangeGroup, 'point')
    return keysToArrays(byPoint)
  })  
}

const getSubtestFuncData = (subTest, funcs, methods) => {
  return (Object.keys(subTest.varFuncMap).map(k => {
    let funcId = subTest.varFuncMap[k]
    let func = funcs.filter(func => func.id === funcId)[0]

    let funcMatrix = reshapeMatrix(func.ss.matrix)
    console.log(groupBy(funcMatrix, 'range').filter(item => item[0].range === 100))

  }))
  return 1
}

export { getSubtestFuncData, getSubtestData }