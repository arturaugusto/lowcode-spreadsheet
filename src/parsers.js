const exprReplace = (expr, payloadData) => {
  /*
  expr: String VI-VC
  payloadData: [Object]
  */
  // determine variable tree. Eg:
  /*
    {
      "VI": [
        "VI.Resol",
        "VI.Spec"
      ],
      "VC": [
        "VC.Resol",
        "VC.Spec"
      ]
    }  
  */
  let tree = payloadData.reduce((a, c) => {
    let targetVar = c.var.split('.')[0]
    if (!a[targetVar]) {
      a[targetVar] = []
    }
    a[targetVar].push(c.var)
    return a
  }, {})

  // add pareteses to vars. Eg:
  // "(VI)-(VC)"

  expr = Object.keys(tree).reduce((a, c) => 
    a.replace(new RegExp(`\\b${c}\\b`, 'g'), `(${c})`)
  , expr)

  // now joins with sum of quantities. Eg:
  // (VI.Resol+VI.Spec)-(VC.Resol+VC.Spec)
  let res = Object.keys(tree).reduce((a, c) => 
    a.replace(new RegExp(`\\b${c}\\b`, 'g'), `${tree[c].join('+')}`)
  , expr)
  
  return res
}

const isCellTrueValue = (val) => {
  /*
  val: String
  return: Boolean
  */
  if (val !== undefined && val !== null) return Boolean(val.trim())
  return false
}

const reshapeMatrix = (matrix) => {
  /*
  matrix: [{cells:[Object]}]
  return: [Object]
  */
  return matrix.map(row => {
    return row.cells.reduce((a, c) => {
      a[c.col] = c.val
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
        if (isCellTrueValue(c[k])) a[k].push(c[k])
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
    if (isCellTrueValue(c[targetCol])) {
      a.push([c])
    } else {
      if (a.length) {
        a[a.length-1].push(c)
      } else {
        a.push(c)
      }
    }
    return a
  }, [])
}


// const getSubtestData = (subTest) => {
//   /*
//   subTest
//   return [[Object]]
//   */
//   let matrix = reshapeMatrix(subTest.ss.matrix)
//   let byRange = groupBy(matrix, 'range')
//   return byRange.map(rangeGroup => {
//     let byPoint = groupBy(rangeGroup, 'point')
//     return keysToArrays(byPoint)
//   })  
// }


const getComponents = (subTest, funcs, methods) => {
  let method = methods.filter(item => item.id === subTest.method)[0]
  // necessary fields from method necessary to computation
  // let methodFields = {expr: method.expr}

  let groupedSubTestData = groupBy(reshapeMatrix(subTest.ss.matrix), 'range')
  
  return groupedSubTestData.map(subTestRangeDataMatrix => {
    if (!subTestRangeDataMatrix[0]) return []
    let range = subTestRangeDataMatrix[0].range
    let data = keysToArrays(groupBy(subTestRangeDataMatrix, 'point')).map(subTestRangePointDataMatrix => {
      
      let point = subTestRangePointDataMatrix.point[0]

      let data = Object.keys(subTest.varFuncMap).map(k => {
        let funcId = subTest.varFuncMap[k]

        // get selected function for var
        let func = funcs.filter(func => func.id === funcId)[0]
        let funcRangeMatrixGroups = groupBy(reshapeMatrix(func.ss.matrix), 'range')
        
        // get range for var value
        let varValue = parseFloat(subTestRangePointDataMatrix[k][0])
        var i, subRange
        for (i = 0; i < funcRangeMatrixGroups.length; i++) {
          if (parseFloat(funcRangeMatrixGroups[i][0].range) >= varValue) {
            subRange = funcRangeMatrixGroups[i]
            break
          }
        }
        
        // readouts.
        // TODO: uncertanty from desvPad
        // console.log(subTestRangePointDataMatrix[k])
        
        // console.log(varValue, k, subRange)
        // console.log(varValue, k, JSON.stringify(subRange, 0, 2))
        
        // TODO: interpolate uncertainties. Use i var from loop
        // to do this

        return subRange.map(item => Object({
          var: `${k}.${item.uncDesc}`,
          dist: `${item.dist}`,
          args: [
            isNaN(parseFloat(item.a)) ? null : parseFloat(item.a),// TODO: Parse string to formula
            isNaN(parseFloat(item.b)) ? null : parseFloat(item.b),// TODO: Parse string to formula
            isNaN(parseFloat(item.c)) ? null : parseFloat(item.c),// TODO: Parse string to formula
          ],
        }))
      }).flat()

      return Object({
        point: point,
        payload: {
          expr: exprReplace(method.expr, data),
          p: 0.95, // TODO: take it from user
          data: data,
        }
      })
    })

    return Object({
      range: range,
      data: data,
    })

  })
}

export default { getComponents, exprReplace }