const groupParsedComponents = (parsedData, uutVar) => {
  /*
  parsedData: [Object]
  uutVar: String
  return: [Object]
  */
  return parsedData.reduce((a, c) => {
    let group = a.filter(item => item && item.name === c.rangeMap[uutVar])[0]
    if (!group) {
      group = group || {name: c.rangeMap[uutVar], data: []}
      a.push(group)
    }
    group.data.push(c)
    return a
  }, [])
}

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

const isCellTrueValue = (obj, key) => {
  /*
  obj: Object
  key: String
  return: Boolean
  */
  let val = obj[key]
  if (val === undefined || val === null) return false
  let valTrim = val.trim()
  return valTrim !== undefined && valTrim !== null && valTrim !== ""
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
        if (isCellTrueValue(c, k)) a[k].push(c[k])
      }
    })
    return a
  }, {})
}

const keysToArrays = (groupedMatrices, textFields) => {
  /*
  groupedMatrices: [[Object]] or [Object]
  textFields: [String]
  return: [Object]
  */
  return groupedMatrices.map(item => rowsReducer(item.constructor === Array ? item : [item], textFields))
  // return groupedMatrices.map(item => rowsReducer(item, textFields))
}


const groupBy = (reshapedMatrix, targetCol, detector) => {
  /*
  reshapedMatrix: [Object]
  targetCol: String
  detector: Function - Used to detect new group
  return: [[Object]]
  */
  return reshapedMatrix.reduce((a, c) => {
    if (detector(c, targetCol)) {
      a.push([c])
    } else {
      if (a.length) {
        if (a[a.length-1].constructor === Array) {
          a[a.length-1].push(c)
        }
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
  if (!subTest.ss.matrix) return []
  let reshapedMatrix = reshapeMatrix(subTest.ss.matrix)
  if (!reshapedMatrix) return []
  
  // console.log(reshapedMatrix)
  let groupedSubTestData = groupBy(reshapedMatrix, 'point', isCellTrueValue)
  // console.log(groupedSubTestData)
  // let groupedSubTestData = [reshapedMatrix]
  
  return groupedSubTestData.map(subTestRangeDataMatrix => {
    if (!subTestRangeDataMatrix[0]) return []
    let data = keysToArrays(groupBy(subTestRangeDataMatrix, 'point', isCellTrueValue)).map(subTestRangePointDataMatrix => {
      
      let point = subTestRangePointDataMatrix.point[0]

      let rangeMap = {}
      
      let data = Object.keys(subTest.varFuncMap).filter(k => method.inputVars.indexOf(k) !== -1).map(k => {
        
        let funcId = subTest.varFuncMap[k]
        // get selected function for var
        let func = funcs.filter(func => func.id === funcId)[0]
        let funcRangeMatrixGroups = groupBy(reshapeMatrix(func.ss.matrix), 'range', isCellTrueValue)
        
        // get range for var value
        let varValue = parseFloat(subTestRangePointDataMatrix[k][0])
        var i, subRange
        for (i = 0; i < funcRangeMatrixGroups.length; i++) {
          if (parseFloat(funcRangeMatrixGroups[i][0].range) >= varValue) {
            subRange = funcRangeMatrixGroups[i]
            break
          }
        }
        if (!subRange) return []
        
        rangeMap[k] = subRange[0].rangeDesc
        
        let referenceComponents
        if (method.traits[k] === 'isUUT') {
          referenceComponents = subRange.filter(item => {
            // components with Spec on it's name
            // with isUUT trait are ignored
            return item.uncDesc.indexOf('Spec') === -1
          })
        } else {
          referenceComponents = subRange
        }
        
        // readouts.
        // TODO: uncertanty from desvPad
        // console.log(subTestRangePointDataMatrix[k])
        
        // console.log(varValue, k, subRange)
        // console.log(varValue, k, JSON.stringify(subRange, 0, 2))
        
        // TODO: interpolate uncertainties. Use i var from loop
        // to do this

        return referenceComponents.map(item => Object({
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
        rangeMap: rangeMap,
        payload: {
          expr: exprReplace(method.expr, data),
          p: 0.95, // TODO: take it from user
          data: data,
        }
      })
    })

    return data

  }).flat()
}

export default { getComponents, exprReplace, groupParsedComponents }