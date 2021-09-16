/**
 * @jest-environment node
 */


import gum from '../src/gum.js'

let payload = {
  "expr": "(VI.Resol+VI.Spec)-(VC.Resol+VC.Spec)",
  "p": 0.95,
  "data": [
    {
      "var": "VI.Resol",
      "dist": "Rect",
      "args": [
        -0.1,
        0.1,
        null
      ]
    },
    {
      "var": "VI.Spec",
      "dist": "Normal",
      "args": [
        0.08,
        null,
        null
      ]
    },
    {
      "var": "VC.Resol",
      "dist": "Rect",
      "args": [
        -0.1,
        0.1,
        null
      ]
    },
    {
      "var": "VC.Spec",
      "dist": "Normal",
      "args": [
        0.08,
        null,
        null
      ]
    }
  ]
}

const MC_MOCK = () => {
  var sensitivityAnalysis = (payload) => {
    return new Promise((resolve, reject) => {
      resolve(payload.data.map(() => 1))
    }, () => {
      reject(null)
    })
  }
  return {
    sensitivityAnalysis: sensitivityAnalysis,
  }
}

test('test gum', () => {

  // console.log(gum.calc(payload, MC_MOCK))
  // console.log(JSON.stringify(parsers.getComponents(subTest, funcs, methods), 0, 2))
  // parsers.getComponents(subTest, funcs, methods)
  // expect(expected).toStrictEqual(parsers.getComponents(subTest, funcs, methods))
});