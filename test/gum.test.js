import gum from '../src/gum.js'


let payload = {
  "expr": "(VI.Resol+VI.Spec+VI.Readout)-(VC.Resol+VC.Spec)",
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
        0,
        0.08,
        null
      ]
    },
    {
      "var": "VI.Readout",
      "dist": "Uniform",
      "args": [
        1,
        1,
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
        0,
        0.08,
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
  gum.calc(payload, MC_MOCK).then(res => {
    let expected = {
      "budgetMatrix": [
        {
          "var": "VI.Resol",
          "dist": "Rect",
          "args": [
            -0.1,
            0.1,
            null
          ],
          "veff": Infinity,
          "y": 0,
          "u": 0.05773502691896258,
          "coef": 1,
          "ux": 0.05773502691896258
        },
        {
          "var": "VI.Spec",
          "dist": "Normal",
          "args": [
            0,
            0.08,
            null
          ],
          "veff": Infinity,
          "y": 0,
          "u": 0.08,
          "coef": 1,
          "ux": 0.08
        },
        {
          "var": "VI.Readout",
          "dist": "Uniform",
          "args": [
            1,
            1,
            null
          ],
          "veff": Infinity,
          "y": 1,
          "u": 0,
          "coef": 1,
          "ux": 0
        },
        {
          "var": "VC.Resol",
          "dist": "Rect",
          "args": [
            -0.1,
            0.1,
            null
          ],
          "veff": Infinity,
          "y": 0,
          "u": 0.05773502691896258,
          "coef": 1,
          "ux": 0.05773502691896258
        },
        {
          "var": "VC.Spec",
          "dist": "Normal",
          "args": [
            0,
            0.08,
            null
          ],
          "veff": Infinity,
          "y": 0,
          "u": 0.08,
          "coef": 1,
          "ux": 0.08
        }
      ],
      "expr": "(VI.Resol+VI.Spec+VI.Readout)-(VC.Resol+VC.Spec)",
      "p": 0.95,
      "u": 0.13952299690970899,
      "U": 0.2734650739430296,
      "k": 1.96,
      "veff": 1000
    }
    // console.log(JSON.stringify(res, 0, 2))
    expect(res).toStrictEqual(expected)
  })
});