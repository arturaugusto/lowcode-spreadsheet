import parsers from '../src/parsers.js'
import exprParsers from '../src/exprParsers.js'

// this simple mock the eval and return the counter for earch evaluation
const MC_MOCK = () => {
  let count = 0
  return {
    simple_eval: () => {
      return count++
    }
  }
}


test('test groupParsedComponentsUnnormalize', () => {

  const parsedData = [
    {
      "point": "1",
      "rangeMap": {
        "VI": "10 V",
        "VC": "10 V"
      },
      "payload": {
        "expr": "(VI.Resol)-(VC.Resol+VC.Spec)",
        "p": 0.95,
        "data": [
          {
            "var": "VI.Resol",
            "dist": "Rect",
            "args": [
              -0.01,
              0.01,
              null
            ]
          },
          {
            "var": "VC.Resol",
            "dist": "Rect",
            "args": [
              -0.01,
              0.01,
              null
            ]
          },
          {
            "var": "VC.Spec",
            "dist": "Normal",
            "args": [
              0.004,
              0.001,
              null
            ]
          }
        ]
      },
      "res": {
        "budgetMatrix": [
          {
            "var": "VI.Resol",
            "dist": "Rect",
            "args": [
              -0.01,
              0.01,
              null
            ],
            "veff": null,
            "y": 0,
            "u": 0.005773502691896258,
            "coef": 1,
            "ux": 0.005773502691896258
          },
          {
            "var": "VC.Resol",
            "dist": "Rect",
            "args": [
              -0.01,
              0.01,
              null
            ],
            "veff": null,
            "y": 0,
            "u": 0.005773502691896258,
            "coef": 1,
            "ux": 0.005773502691896258
          },
          {
            "var": "VC.Spec",
            "dist": "Normal",
            "args": [
              0.004,
              null,
              null
            ],
            "veff": null,
            "y": 0,
            "u": 0.004,
            "coef": 1,
            "ux": 0.004
          }
        ],
        "expr": "(VI.Resol)-(VC.Resol+VC.Spec)",
        "p": 0.95,
        "u": 0.009092121131323903,
        "U": 0.01782055741739485,
        "k": 1.96,
        "veff": 1000
      }
    }
  ]

  let groupParsedComponents = parsers.groupParseComponents(parsedData, 'VI')

  let expr = `
A = 0
VX = 1
VI-VC+VX`
  let MC = MC_MOCK()


  let expected = [
    {
      "name": "10 V",
      "points": [
        {
          "VI": 0,
          "VC": 0,
          "A": 0,
          "VX": 1,
          "y": 2,
          "value": "1",
          "p": 0.95,
          "u": 0.009092121131323903,
          "U": 0.01782055741739485,
          "k": 1.96,
          "veff": 1000
        }
      ]
    }
  ]

  // console.log(JSON.stringify(exprParsers.groupParsedComponentsUnnormalize(groupParsedComponents, expr, MC), 0, 2))
  expect(expected).toStrictEqual(exprParsers.groupParsedComponentsUnnormalize(groupParsedComponents, expr, MC))
  
});

test('test toSingleLine with eval', () => {
  let MC = MC_MOCK()
  let res = exprParsers.toSingleLine(`VC = VRp/Rp + sin(90)
B = 1/2
VC = A + VC

A = 22
42
VC = B - VC
VI-VC`, MC, ['VI', 'VRp', 'Rp', 'A'], [10, 0, 0, 0])
  // console.log(res)
  expect(res).toStrictEqual({ expr: '(10)-(4)', state: { VI: 10, VRp: 0, Rp: 0, A: 3, VC: 4, B: 1, y: 5 } })
});


test('test toSingleLine', () => {
  let res = exprParsers.toSingleLine(`VC = VRp/Rp + sin(90)
B = 1/2
VC = A + VC


42
VC = B - VC
VI-VC`)
  // console.log(res)
  expect(res).toStrictEqual({"expr": "VI-((1/2) - (A + (VRp/Rp + sin(90))))", "state": {"B": "1/2", "VC": "(1/2) - (A + (VRp/Rp + sin(90)))"}})
});


test('test allVars', () => {
  let res = exprParsers.allVars(`VC = VRp/Rp + sin(90)
VI-VC`)
  expect(res).toStrictEqual([ 'VC', 'VRp', 'Rp', 'VI' ])
});


test('test inputVars', () => {
  let res = exprParsers.inputVars(`VC = VRp/Rp + sin(90)
VI-VC`)
  expect(res).toStrictEqual([ 'VRp', 'Rp', 'VI' ])
});

