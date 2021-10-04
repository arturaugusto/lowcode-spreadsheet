import {invt} from './invt.js'


const expectationAndVariance = (item) => {
  // if (item.dist === 'Resol') {
  //   return {y: 0, u: Math.sqrt(Math.pow(item.args[1]*2, 2) / 12)}
  // }
  if (item.dist === 'Uniform' || item.dist === 'Rect') {
    let a = item.args[0]
    let b = item.args[1]

    let y = (item.args[0] + item.args[1]) / 2
    let u = Math.sqrt(Math.pow(b - a, 2) / 12)
    return {y: y, u: u}
  }
  if (item.dist === 'Arcsine') {
    let a = item.args[0]
    let b = item.args[1]

    let y = (item.args[0] + item.args[1]) / 2
    let u = Math.sqrt(Math.pow(b - a, 2) / 8)
    return {y: y, u: u}
  }
  if (item.dist === 'Triangular') {
    let a = item.args[0]
    let b = item.args[1]

    let y = (item.args[0] + item.args[1]) / 2
    let u = ((b - a)/2)/Math.sqrt(3)
    return {y: y, u: u}
  }
  if (item.dist === 'CTrap') {
    let a = item.args[0]
    let b = item.args[1]

    let y = (item.args[0] + item.args[1]) / 2
    let u = Math.sqrt(Math.pow(b - a, 2) / 12 + Math.pow(item.args[2], 2) / 9)
    return {y: y, u: u}
  }
  if (item.dist === 'Trap') {
    let a = item.args[0]
    let b = item.args[1]
    
    let y = (item.args[0] + item.args[1]) / 2
    let u = Math.sqrt(Math.pow(b - a, 2) / 24 * (1 + Math.pow(item.args[2], 2)))
    return {y: y, u: u}
  }
  if (item.dist === 'StudentsT') {
    let dof = item.args[2]

    let y = item.args[0]
    let u = item.args[1] * Math.sqrt(((dof  > 2) ? dof / (dof - 2) : (dof > 1) ? Infinity : undefined))
    return {y: y, u: u}
  }
  if (item.dist === 'Normal') {
    let std = item.args[1]
    
    let y = item.args[0]
    let u = std
    return {y: y, u: u}
  }
}

const normalizeQuantity = (quantity) => {

  let res = {
    var: quantity.var.replace(/\./g, '__'),
    dist: quantity.dist,
    args: quantity.args.map(x => x),
  }

  if (quantity.dist === 'Readouts') {
    res.dist = 'Normal'
    res.args[0] = quantity.args[0]
    res.args[1] = quantity.args[1]
  }

  if (quantity.dist === 'Rect') {
    res.dist = 'Uniform'
    if (quantity.args[1] === null) {
      res.args[0] = -quantity.args[0]
      res.args[1] = quantity.args[0]
    }
  }

  // normal with expectation unset, let it be 0
  if (quantity.dist === 'Normal' && quantity.args[1] === null) {
    res.args[0] = 0
    res.args[1] = quantity.args[0]
  }

  if (quantity.dist === 'Triangular') {
    if (quantity.args[1] === null) {
      res.args[0] = -quantity.args[0]
      res.args[1] = quantity.args[0]
    }
    res.args[2] = (res.args[0] + res.args[1])/2
  }

  res.args = res.args.map(x => x === null ? 0 : x)
  return res
}

const calc = (payload, mc) => {
  // console.log(payload)
  let MC = mc()
  let budgetMatrix = payload.data.map(quantity => {
    let quantityExtended = Object({
      var: quantity.var,
      dist: quantity.dist,
      args: quantity.args,
      veff: ['StudentsT', 'Readouts'].indexOf(quantity.dist) !== -1 ? quantity.args[2] : Infinity,
    })
    
    let yuObj = expectationAndVariance(normalizeQuantity(quantityExtended))
    quantityExtended.y = yuObj.y
    quantityExtended.u = yuObj.u

    return quantityExtended
  })
  
  let analysisArgument = {
    var_estimates: budgetMatrix.map(x => x.y),
    expr: payload.expr.replace(/\./g, '__'),
    data: payload.data.map(normalizeQuantity),
    p: 0, // dont use p, TODO: remove
  }

  return MC.sensitivityAnalysis(analysisArgument).then(coefs => {
    coefs.forEach((coef, i) => {
      budgetMatrix[i].coef = coef
      budgetMatrix[i].ux = coef*budgetMatrix[i].u
    })

    // at some situations (eg. zero desvpad normal distribution), the ux can be NaN. 
    // here we just ignore it
    let budgetMatrixValidUnc = budgetMatrix.filter(item => !isNaN(item.ux))

    let u = Math.sqrt(budgetMatrixValidUnc.map(x => x.ux*x.ux).reduce((a, c) => a+c, 0))

    let veff = Math.pow(u, 4) / budgetMatrixValidUnc.reduce((a, c) => {
      if (!isFinite(c.veff)) return a
      return a + Math.pow(c.ux, 4) / c.veff
    }, 0)

    veff = veff > 1000? 1000: Math.ceil(veff)

    let k = Math.abs(invt((1-(payload.p || 0.95))/2, veff))
    k = Math.round(k*100)/100

    let U = u * k

    return {
      budgetMatrix: budgetMatrix,
      expr: payload.expr,
      p: payload.p,
      u: u,
      U: U,
      k: k,
      veff: veff,
    }
  })
}

export default { calc }