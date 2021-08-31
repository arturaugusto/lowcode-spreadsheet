export default [
  {
    singular: 'method',
    plural: 'methods',
    subTests: {hasMany: {type: 'subTest', options: {async: true}}},
  },
  {
    singular: 'model',
    plural: 'models',
    relations: {
      funcs: {hasMany: {type: 'func', options: {async: true}}},
      instruments: {hasMany: {type: 'instrument', options: {async: true}}},
    }
  },
  {
    singular: 'instrument',
    plural: 'instruments',
    relations: {
      models: {belongsTo: {type: 'model', options: {async: true}}},
      tests: {hasMany: {type: 'test', options: {async: true}}},
    }
  },
  {
    singular: 'test',
    plural: 'tests',
    relations: {
      subTests: {hasMany: {type: 'subTest', options: {async: true}}},
      instruments: {belongsTo: {type: 'instrument', options: {async: true}}},
    }
  },
  {
    singular: 'subTest',
    plural: 'subTests',
    relations: {
      tests: {belongsTo: {type: 'test', options: {async: true}}},
      methods: {belongsTo: {type: 'method', options: {async: true}}},
    }
  },
  {
    singular: 'func',
    plural: 'funcs',
    relations: {
      models: {belongsTo: {type: 'model', options: {async: true}}},
    }
  },
]