const groupParsedComponentsUnnormalize = (groupParsedComponents, expr, mc) => {

  return groupParsedComponents.map(range => {
    let points = range.data.map(point => {
      
      let correctValuesObjArray = point.res.budgetMatrix.reduce((a, c) => {
        // returns: [ { value: 0, name: 'VI' }, { value: 0, name: 'VC' } ]
        let name = c.var.split('.')[0]
        let varObj = a.length ? a.filter(item => item.name === name)[0] : null
        
        if (!varObj) {
          varObj = {
            value: 0,
            name: name,
          }
          a.push(varObj)
        }

        varObj.value = varObj.value + c.y

        return a
        
      }, [])

      let exprEval = toSingleLine(expr, mc, correctValuesObjArray.map(x => x.name), correctValuesObjArray.map(x => x.value))

      return Object.assign(
        {},
        exprEval.state,
        {
          value: point.point,
          p: point.res.p,
          u: point.res.u,
          U: point.res.U,
          k: point.res.k,
          veff: point.res.veff,
        }
      )
    })

    return Object({name: range.name, points: points})
  })
  // return {ranges: groupParsedComponents}
}

const toSingleLine = (expr, mc, var_params, var_values) => {
  let lines = expr.split('\n')

  let state = {}
  let paramsValuesMap
  if (mc) {
    paramsValuesMap = var_params.reduce((a, c, i) => {
      a[c] = var_values[i]
      return a
    }, {})
    Object.assign(state, paramsValuesMap)
  }
  
  let res = lines.reduce((a, c) => {
    let [lhs, rhs] = c.split('=').map(x => x.trim())

    let exprLine = rhs || lhs

    Object.keys(a.state).forEach(k => {
      exprLine = exprLine.replace(new RegExp(`\\b${k}\\b`, 'g'), `(${a.state[k]})`)
    })

    if (lhs && rhs) {
      if (mc) {
        let paramsExtended = Object.keys(a.state)
        let valuesExtended = paramsExtended.map(k => a.state[k])
        a.state[lhs] = mc.simple_eval({expr: exprLine, var_params: paramsExtended, var_values: valuesExtended})
      } else {
        a.state[lhs] = exprLine
      }
    } else {
      a.expr = exprLine
    }

    return a
    
  }, {expr: undefined, state: state})
  
  if (mc) {
    let y = mc.simple_eval({expr: res.expr, var_params: [], var_values: []})
    res.state.y = y
  }
  return res
}

const inputVars = (expr) => {
  /*
  expr: String
  return: [String]
  */
  const leftHandSideTokens = expr.split('\n')
    .filter(item => item.includes('='))
    .map(item => item.split('=')[0].trim())

  return allVars(expr)
    .filter(item => !leftHandSideTokens.includes(item))
}

const allVars = (expr) => {
  /*
  expr: String
  return: [String]
  */
  const exprOperatorsRegex = new RegExp(/[\s+*\-()%^=&|/:]+/)
  const startWithDigitOrReservedRegex = new RegExp(/^[\d_]/)
  const exprTokens = 'log base e pi int ceil floor round modulus abs sign min max sin cos tan sinh cosh tanh asin acos atan asinh acosh atanh'.split(' ')

  return expr.split(exprOperatorsRegex)
    // remove empty
    .filter(item => item.trim().length)
    // start with digit
    .filter(item => !item.match(startWithDigitOrReservedRegex))
    .filter(item => !exprTokens.includes(item))
    .map(item => item.trim())
    .reduce((a, c) => a.indexOf(c) === -1 ? a.push(c)&&a : a,[])
}

export default { groupParsedComponentsUnnormalize, toSingleLine, inputVars, allVars }