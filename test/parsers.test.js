import { getSubtestFuncData } from '../src/parsers.js'


test('lala', () => {
  const funcs = [
    {
      "name": "Model A DC",
      "unit": "V",
      "model": "-Mj0Jwnr",
      "ss": {
        "matrix": [
          {
            "cells": [
              {
                "id": "VqLOg78W",
                "col": "rangeDesc",
                "val": "10 V"
              },
              {
                "id": "g1us9lGO",
                "col": "range",
                "val": "10"
              },
              {
                "id": "kXwt6E5m",
                "col": "rangeStart",
                "val": "1"
              },
              {
                "id": "N59xPAiW",
                "col": "rangeFull",
                "val": "12"
              },
              {
                "id": "Li7W4LkM",
                "col": "uncDesc",
                "val": "Resol"
              },
              {
                "id": "daxH4R7n",
                "col": "dist",
                "val": "Rect"
              },
              {
                "id": "m7CKY7ym",
                "col": "a",
                "val": "-0.01"
              },
              {
                "id": "jorkI37r",
                "col": "b",
                "val": "0.01"
              },
              {
                "id": "4k8M2O87",
                "col": "c"
              },
              {
                "id": "H61wlcn1",
                "col": "influence"
              },
              {
                "id": "jeL9t4aA",
                "col": "influenceStart"
              },
              {
                "id": "hPQG6W4m",
                "col": "influenceEnd"
              }
            ],
            "id": "TT6lehPs"
          },
          {
            "cells": [
              {
                "id": "3Iu6duU7",
                "col": "rangeDesc"
              },
              {
                "id": "PLtIgPA7",
                "col": "range"
              },
              {
                "id": "TUdLCuii",
                "col": "rangeStart"
              },
              {
                "id": "OPErUxGH",
                "col": "rangeFull"
              },
              {
                "id": "G59Gounj",
                "col": "uncDesc",
                "val": "Spec"
              },
              {
                "id": "K1RSnuEl",
                "col": "dist",
                "val": "Normal"
              },
              {
                "id": "EjSQEHJD",
                "col": "a",
                "val": "0.004"
              },
              {
                "id": "6N5ARx0o",
                "col": "b"
              },
              {
                "id": "Y4RsoPnd",
                "col": "c"
              },
              {
                "id": "6SAf16Bo",
                "col": "influence"
              },
              {
                "id": "DwAj787x",
                "col": "influenceStart"
              },
              {
                "id": "JyXIEr83",
                "col": "influenceEnd"
              }
            ],
            "id": "TOF3T11s"
          },
          {
            "cells": [
              {
                "id": "i0IzvKWm",
                "col": "rangeDesc",
                "val": "100 V"
              },
              {
                "id": "3c9ThLps",
                "col": "range",
                "val": "100"
              },
              {
                "id": "U744836l",
                "col": "rangeStart",
                "val": "10"
              },
              {
                "id": "rvDSpley",
                "col": "rangeFull",
                "val": "120"
              },
              {
                "id": "7L9hlhN2",
                "col": "uncDesc",
                "val": "Resol"
              },
              {
                "id": "G2cqQM1x",
                "col": "dist",
                "val": "Rect"
              },
              {
                "id": "kgVmodYQ",
                "col": "a",
                "val": "-0.1"
              },
              {
                "id": "8vhv463V",
                "col": "b",
                "val": "0.1"
              },
              {
                "id": "I74ld55D",
                "col": "c"
              },
              {
                "id": "c1Nxpq65",
                "col": "influence"
              },
              {
                "id": "ta4yjV8i",
                "col": "influenceStart"
              },
              {
                "id": "8XUxBrFV",
                "col": "influenceEnd"
              }
            ],
            "id": "WFaN03nJ"
          },
          {
            "cells": [
              {
                "id": "BH1JRfg6",
                "col": "rangeDesc",
                "val": ""
              },
              {
                "id": "P60Snkd0",
                "col": "range",
                "val": ""
              },
              {
                "id": "dPogyi47",
                "col": "rangeStart",
                "val": ""
              },
              {
                "id": "3hvBrr3K",
                "col": "rangeFull",
                "val": ""
              },
              {
                "id": "9re87C7C",
                "col": "uncDesc",
                "val": "Spec"
              },
              {
                "id": "457MvSnD",
                "col": "dist",
                "val": "Normal"
              },
              {
                "id": "V9lCYmwh",
                "col": "a",
                "val": "0.08"
              },
              {
                "id": "z7z16l4E",
                "col": "b",
                "val": ""
              },
              {
                "id": "ov6tgS6x",
                "col": "c"
              },
              {
                "id": "9kb94DuS",
                "col": "influence"
              },
              {
                "id": "53IFoCm6",
                "col": "influenceStart"
              },
              {
                "id": "4HwAYFZP",
                "col": "influenceEnd"
              }
            ],
            "id": "U7wIMQKq"
          }
        ]
      },
      "id": "-Mj0Jxkp"
    },
    {
      "name": "Model A AC",
      "unit": "V",
      "model": "-Mj0Jwnr",
      "ss": {
        "matrix": [
          {
            "cells": [
              {
                "id": "FSvsx22M",
                "col": "rangeDesc",
                "val": "10 V"
              },
              {
                "id": "3FB2kiuW",
                "col": "range",
                "val": "10"
              },
              {
                "id": "ptEAsgXG",
                "col": "rangeStart",
                "val": "1"
              },
              {
                "id": "XrMU5yu1",
                "col": "rangeFull",
                "val": "12"
              },
              {
                "id": "C6aifSeG",
                "col": "uncDesc",
                "val": "Resol"
              },
              {
                "id": "HYMyh4ri",
                "col": "dist",
                "val": "Rect"
              },
              {
                "id": "xvUeQSp7",
                "col": "a",
                "val": "-0.01"
              },
              {
                "id": "Vkg6Zy5j",
                "col": "b",
                "val": "0.01"
              },
              {
                "id": "CNaPOB3e",
                "col": "c"
              },
              {
                "id": "G5mZTBWr",
                "col": "influence",
                "val": "Freq"
              },
              {
                "id": "nEvbN329",
                "col": "influenceStart",
                "val": "45"
              },
              {
                "id": "R9Bm2yeb",
                "col": "influenceEnd",
                "val": "1000"
              }
            ],
            "id": "C0rVA9nl"
          },
          {
            "cells": [
              {
                "id": "14Yb1b9H",
                "col": "rangeDesc",
                "val": ""
              },
              {
                "id": "DXG768uF",
                "col": "range",
                "val": ""
              },
              {
                "id": "kzTRwJa9",
                "col": "rangeStart",
                "val": ""
              },
              {
                "id": "C02PGyTv",
                "col": "rangeFull",
                "val": ""
              },
              {
                "id": "v4DbMpSa",
                "col": "uncDesc",
                "val": "Spec"
              },
              {
                "id": "R8RM3mi5",
                "col": "dist",
                "val": "Normal"
              },
              {
                "id": "eF0M1g8o",
                "col": "a",
                "val": "0.008"
              },
              {
                "id": "5o3XDO2J",
                "col": "b",
                "val": ""
              },
              {
                "id": "5Rpy1Lk7",
                "col": "c"
              },
              {
                "id": "Rwlt0iwt",
                "col": "influence"
              },
              {
                "id": "seDwzMvt",
                "col": "influenceStart"
              },
              {
                "id": "182Ze3Yd",
                "col": "influenceEnd"
              }
            ],
            "id": "L2c2A6XC"
          },
          {
            "cells": [
              {
                "id": "0Qo5LsSp",
                "col": "rangeDesc",
                "val": "100 V"
              },
              {
                "id": "dcrxB1Sg",
                "col": "range",
                "val": "100"
              },
              {
                "id": "hTwQjHZI",
                "col": "rangeStart",
                "val": "10"
              },
              {
                "id": "Wwe46aTv",
                "col": "rangeFull",
                "val": "120"
              },
              {
                "id": "3Gug9TOO",
                "col": "uncDesc",
                "val": "Resol"
              },
              {
                "id": "qAY3IV1I",
                "col": "dist",
                "val": "Rect"
              },
              {
                "id": "XhcmR5fL",
                "col": "a",
                "val": "-0.1"
              },
              {
                "id": "T9qSimiC",
                "col": "b",
                "val": "0.1"
              },
              {
                "id": "62j3GrTC",
                "col": "c"
              },
              {
                "id": "BUOBhKp9",
                "col": "influence",
                "val": "Freq"
              },
              {
                "id": "l8nK1cCT",
                "col": "influenceStart",
                "val": "45"
              },
              {
                "id": "2t30EuhH",
                "col": "influenceEnd",
                "val": "100"
              }
            ],
            "id": "xMYPELJF"
          },
          {
            "cells": [
              {
                "id": "oU59J4gK",
                "col": "rangeDesc",
                "val": ""
              },
              {
                "id": "0uQRtDTF",
                "col": "range",
                "val": ""
              },
              {
                "id": "9ox0Vy1g",
                "col": "rangeStart",
                "val": ""
              },
              {
                "id": "7EsFO77o",
                "col": "rangeFull",
                "val": ""
              },
              {
                "id": "u9Rmbe05",
                "col": "uncDesc",
                "val": "Spec"
              },
              {
                "id": "flf6bqGA",
                "col": "dist",
                "val": "Normal"
              },
              {
                "id": "14kHg88s",
                "col": "a",
                "val": "0.12"
              },
              {
                "id": "FNLUbgQ4",
                "col": "b",
                "val": ""
              },
              {
                "id": "cAutlVdg",
                "col": "c"
              },
              {
                "id": "IjGxV175",
                "col": "influence"
              },
              {
                "id": "V1zK1XnZ",
                "col": "influenceStart"
              },
              {
                "id": "EcUtXR88",
                "col": "influenceEnd"
              }
            ],
            "id": "M2Yr8n2V"
          }
        ]
      },
      "id": "-Mj0L2XI"
    }
  ]

  const subTest = {
    "test": "-Mj0NOpz",
    "func": "-Mj0Jxkp",
    "ss": {
      "matrix": [
        {
          "cells": [
            {
              "id": "Fun5ba49",
              "col": "range",
              "val": "10"
            },
            {
              "id": "DtSI1LD5",
              "col": "point",
              "val": "2"
            },
            {
              "id": "Z1o7KOHH",
              "col": "VI",
              "val": "2"
            },
            {
              "id": "EkGiE4UO",
              "col": "VC",
              "val": "2.1"
            }
          ],
          "id": "lozFDEY7"
        },
        {
          "cells": [
            {
              "id": "J3Sofz2F",
              "col": "range"
            },
            {
              "id": "2t6hQ66t",
              "col": "point"
            },
            {
              "id": "43TG2ntb",
              "col": "VI",
              "val": "2.1"
            },
            {
              "id": "Axv4b3DC",
              "col": "VC",
              "val": "2.3"
            }
          ],
          "id": "4I5qfdyp"
        },
        {
          "cells": [
            {
              "id": "twAtIKWl",
              "col": "range"
            },
            {
              "id": "oCR3q8U5",
              "col": "point"
            },
            {
              "id": "9dq4XQp5",
              "col": "VI",
              "val": "2"
            },
            {
              "id": "oLHAe3n7",
              "col": "VC",
              "val": "2"
            }
          ],
          "id": "xB9EX758"
        },
        {
          "cells": [
            {
              "id": "825bOGdc",
              "col": "range"
            },
            {
              "id": "W75M65V1",
              "col": "point",
              "val": "5"
            },
            {
              "id": "2p6eccMb",
              "col": "VI",
              "val": "5"
            },
            {
              "id": "MU7OhEyt",
              "col": "VC",
              "val": "5.1"
            }
          ],
          "id": "89y2qDBA"
        },
        {
          "cells": [
            {
              "id": "gddRc31F",
              "col": "range",
              "val": ""
            },
            {
              "id": "ONC3MCF2",
              "col": "point"
            },
            {
              "id": "kFW7ScFF",
              "col": "VI",
              "val": "5.1"
            },
            {
              "id": "20WROuwf",
              "col": "VC",
              "val": "5.4"
            }
          ],
          "id": "koJ5mhr9"
        },
        {
          "cells": [
            {
              "id": "xh62c5zY",
              "col": "range",
              "val": ""
            },
            {
              "id": "4fnVghN5",
              "col": "point",
              "val": ""
            },
            {
              "id": "PD65vObJ",
              "col": "VI",
              "val": "5.2"
            },
            {
              "id": "F8u9atN7",
              "col": "VC",
              "val": "5.1"
            }
          ],
          "id": "5cVmI73s"
        }
      ]
    },
    "varInstrumentMap": {
      "VI": "-Mj0MZA3",
      "VC": "-Mj0MZA3"
    },
    "varFuncMap": {
      "VI": "-Mj0Jxkp",
      "VC": "-Mj0Jxkp"
    },
    "method": "-Mj0Jkwr",
    "id": "-Mj0NPbG"
  }

  const methods = [
    {
      "name": "Comparision",
      "inputVars": [
        "VI",
        "VC"
      ],
      "expr": "VI-VC",
      "id": "-Mj0Jkwr",
      "rev": "2-8e80713d491c684febc5974834e3f5ba"
    }
  ]

  getSubtestFuncData(subTest, funcs, methods)

  expect(1).toBe(1)
});