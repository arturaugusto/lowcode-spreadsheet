<template>
  <section class="section">

    <!-- Models -->
    <div v-if="model" class="modal" v-bind:class="{'is-active': model}">
      <div class="modal-background"></div>
      <div class="modal-card" style="min-width: 100%;min-height: 100%;">
        <header class="modal-card-head">
          <p class="modal-card-title">Modal title</p>
          <button @click="cancelItemEdit('model')" class="delete" aria-label="close"></button>
        </header>
        <section class="modal-card-body">

          <!-- {{model}} -->

          <div class="field">
            <label class="label">Name</label>
            <div class="control">
              <input v-model="model.name" class="input" type="text" placeholder="Model name">
            </div>
          </div>
          <!-- {{ funcs }} -->
          <span v-if="funcs && funcs.length" class="select is-primary field mr-2">
            <select @change="onFuncSelChange($event)">
              <option v-for="func in funcs" :key="func.id" :value="func.id">{{func.name}}</option>
            </select>
          </span>

          <span class="control">
            <button @click="createFunc" class="button is-success">New function</button>
          </span>

          <div v-if="func" class="box has-background-white-ter">
            <div class="columns is-desktop">

              <div class="column is-10">
                <div class="control">
                  <label class="label">Function name</label>
                  <input v-model="func.name" class="input" type="text" placeholder="Function name">
                </div>
              </div>

              <div class="column is-2">
                <div class="control">
                  <label class="label">Unit</label>
                  <input v-model="func.unit" class="input" type="text" placeholder="Unit" style="max-width: 128px;">
                </div>
              </div>
            </div>

            <div class="">
              <HelloWorld
                :schema="{'cols': [{name: 'A', type: 'list', options: ['lala', 'bah']}, {name: 'B', type: 'string'},{name: 'C', type: 'string'},{name: 'D', type: 'string'}]}"
              />
            </div>
            <button @click="saveItem('func')" class="button is-success">Save changes</button>
          </div>

          <!-- Content ... -->
        </section>
        <footer class="modal-card-foot">
          <button @click="saveItem('model')" class="button is-success">Save changes</button>
          <!-- <button class="button">Cancel</button> -->
        </footer>
      </div>
    </div>


    <div class="container">
      <button @click="createModel" class="button is-large is-fullwidth is-primary is-outlined">Large</button>
    </div>

    <!-- search itens -->


    <div class="mt-2">
      <article class="panel is-primary">
        <p class="panel-heading is-rounded">
          Primary
        </p>
        <p class="panel-tabs">
          <a class="is-active">All</a>
          <a>Public</a>
          <a>Private</a>
          <a>Sources</a>
          <a>Forks</a>
        </p>
        <div class="panel-block">
          <p class="control has-icons-left">
            <input class="input is-primary" type="text" placeholder="Search">
            <span class="icon is-left">
              <i class="fas fa-search" aria-hidden="true"></i>
            </span>
          </p>
        </div>
        <a v-for="model in models" :key="model.id" class="panel-block" @click="pull('model', model.id)">
          <span class="panel-icon">
            <i class="fas fa-book" aria-hidden="true"></i>
          </span>
          {{model.name || 'Unnamed model'}}
        </a>
      </article>
    </div>

  </section>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'
import PouchDB from 'pouchdb'
import pouchdbUpsert from 'pouchdb-upsert'
import relationalPouch from 'relational-pouch'
// import pouchdbFind from 'pouchdb-find'

PouchDB.plugin(pouchdbUpsert)
PouchDB.plugin(relationalPouch)
// PouchDB.plugin(pouchdbFind)

import timeToId from './timeToId.js'

export default {
  name: 'App',
  components: {
    HelloWorld
  },
  mounted () {
    this.db = new PouchDB('my_database')

    this.schema = [
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
          fevts: {hasMany: {type: 'fevt', options: {async: true}}},
        }
      },
      {
        singular: 'fevt',
        plural: 'fevts',
        relations: {
          func: {belongsTo: {type: 'func', options: {async: true}}},
        }
      }
    ]

    this.db.setSchema(this.schema)
    
    window.DB = this.db

    // get list of existing models
    this.db.rel.find('model').then((response) => {
      this.models = response.models
    })


    // listen changes and manage _rev for local data
    this.db.changes({
      since: 'now',
      include_docs: true,
      live: true
    }).on('change', (change) => {
      let docInfoObj = this.db.rel.parseDocID(change.id)
      let type = docInfoObj.type
      let id = docInfoObj.id
      if (this[type] && this[type].id === id) {
        // console.log(change)
        // Object.assign(this[type], change.doc.data)
        this[type] = change.doc.data
        this[type].id = id
        this[type].rev = change.doc._rev
      }
    })

  },
  methods: {
    onFuncSelChange (event) {
      this.func = this.funcs.filter(item => item.id === event.target.value)[0]
    },
    cancelItemEdit (type) {
      return this.db.rel.find(type).then((response) => {
        this[type] = null
        let plural = this.schema.filter(item => item.singular === type)[0].plural
        this[plural] = response[plural]
      })
    },
    saveItem (type) {
      if (!this[type]) {
        console.warn(type + ' is not avaliable on `this`.')
        return
      }
      // upsert data
      return this.db.rel.find(type, this[type].id).then(response => {
        let plural = this.schema.filter(item => item.singular === type)[0].plural
        if (JSON.stringify(response[plural][0]) !== JSON.stringify(this[type])) {
          return this.db.rel.save(type, this[type])
        }
      }).then(() => {
        // console.log(response)
      }).catch(function (err) {
        if (err.code === 409) { // conflict
          // handle the conflict
        } else {
          throw err;
        }
      })
    },
    pull (type, ids) {
      const traverse = (target, ids) => {
        let targetSchema = this.schema.filter(item => item.singular === target)[0]

        this.db.rel.find(target, ids).then((response) => {

          let found
          if (ids && ids.constructor === Array) {
            this[targetSchema.plural] = response[targetSchema.plural]
            found = response[targetSchema.plural]
            this[targetSchema.singular] = response[targetSchema.plural][0]
          }

          if (ids && ids.constructor === String) {
            this[target] = response[targetSchema.plural][0]
            found = response[targetSchema.plural][0]
          }

          let relations = targetSchema.relations
          Object.keys(relations).forEach(relation => {
            if (relations[relation]['hasMany']) {
              let targetSingular = relations[relation]['hasMany']['type']
              let targetPlural = this.schema.filter(item => item.singular === targetSingular)[0].plural
              traverse(targetSingular, found[targetPlural])
            }
          })
        })
      }
      traverse(type, ids)
    },

    // factory functions
    
    createModel () {
      return this.db.rel.save('model', {
        id: timeToId.toB64(),
        name: '',
      }).then((response) => {
        this.pull('model', response.id)
      }).catch(err => {
        console.log(err)
      })
    },
    createFunc () {
      let id = timeToId.toB64()
      let func = {
        id: id,
        name: '',
        unit: '',
        model: this.model.id,
      }
      this.model.funcs = this.model.funcs || []
      this.model.funcs.push(id)
      return this.saveItem('model').then(() => {
        return this.db.rel.save('func', func)
      }).then((response) => {
        this.pull('func', this.model.funcs)
        console.log(response)
      }).catch(err => {
        console.log(err)
      })
    },
  },
  computed: {
  },
  data () {
    return {
      model: null,
      models: [],
      func: null,
      funcs: [],
    }
  },
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 60px;
}

.ss-cell-blur {
  text-align: right;
}

.ss-selected-cell {
  background: #a0c3e26e;
}
/*.ss-cell-input {
  width: 100%;
  height: 100%;
}*/

</style>
