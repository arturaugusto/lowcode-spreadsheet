export default [
  {
    singular: 'model',
    plural: 'models',
    relations: {
      funcs: {hasMany: {type: 'func', options: {async: true}}},
    }
  },
  {
    singular: 'func',
    plural: 'funcs',
    relations: {
      models: {belongsTo: {type: 'model', options: {async: true}}},
      // fevts: {hasMany: {type: 'fevt', options: {async: true}}},
    }
  },
]