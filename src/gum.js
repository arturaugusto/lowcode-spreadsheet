// import {invt, pdf} from './invt.js'

const calc = (payload, mc) => {
  let MC = mc()
  MC.sensitivityAnalysis(payload).then(res => {
    // console.log(res)
  })
  return payload
}

export default { calc }