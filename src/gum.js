import {invt} from './invt.js'

function meanAndSd (arr) {
  let n = arr.length
  let mean = arr.reduce((a, c) => a + c, 0) / n
  let sd = Math.sqrt(arr.map(x => Math.pow(x - mean, 2)).reduce((a, c) => a + c) / (n-1), 0)
  return [mean, sd]
}

const expectationAndVariance = (item) => {
  if (item.dist === 'Input') {
    let floatArray = item.args.map(parseFloat).filter(x => !isNaN(x))

    // let [y, sd] = meanAndSd(floatArray.map(x => parseFloat(x)*prfx[item.pref]))
    let [y, sd] = meanAndSd(floatArray.map(x => parseFloat(x)))

    let u = sd / Math.sqrt(floatArray.length)
    
    // TODO: detect the prec to avoid cuting unsnificante digits at some situations
    return {y: y, u: u}
  }
  if (item.dist === 'Resol') {
    return {y: 0, u: Math.sqrt(Math.pow(item.args[1]*2, 2) / 12)}
  }
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

const calc = (payload, mc) => {
  // console.log(payload)
  let MC = mc()
  let budgetMatrix = payload.data.map(item => {
    let obj = Object({
      var: item.var,
      dist: item.dist,
      args: item.args,
      veff: item.dist === 'StudentsT' ? item.args[2] : 
           (item.dist === 'Input'     ? item.args.length-1 : Infinity)
    })
    
    let yuObj = expectationAndVariance(obj)
    obj.y = yuObj.y
    obj.u = yuObj.u

    return obj
  })
  
  let analysisArgument = {
    var_estimates: budgetMatrix.map(x => x.y),
    expr: payload.expr,
    data: payload.data,
    p: 0, // dont use p, TODO: remove
  }

// MC.sens_ana_js({"expr": "VI", "var_estimates": [1], p: 0, data: [{
//       "var": "VI",
//       "dist": "Uniform",
//       "args": [
//         -0.01,
//         0.01,
//         0
//       ]
//     }
// ]})

  return MC.sensitivityAnalysis(analysisArgument).then(coefs => {
    coefs.forEach((coef, i) => {
      budgetMatrix[i].coef = coef
      budgetMatrix[i].ux = coef*budgetMatrix[i].u
    })

    let u = Math.sqrt(budgetMatrix.map(x => x.ux*x.ux).reduce((a, c) => a+c, 0))

    let veff = Math.pow(u, 4) / budgetMatrix.reduce((a, c) => {
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