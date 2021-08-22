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
          <!-- {{func}} -->
          
          <span v-if="funcs && funcs.length" class="select is-primary field mr-2">
            <select v-model="func">
              <option 
                v-for="funcOption in funcs"
                :key="funcOption.id" 
                :value="funcOption">{{funcOption.name}}
              </option>
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

            <div v-for="funcSheet in funcs" :key="funcSheet.id" class="">
              <PouchSpreadsheet
                v-if="func && funcSheet.id === func.id"
                :docsPrefix="func.id"
                :schema="{
                  cols: [
                    // {
                    //   name: 'A', type: 'list', options: ['lala', 'bah']
                    // },
                    // {
                    //   name: 'B', type: 'string'
                    // },
                    {
                      name: 'X', type: 'string'
                    },
                    {
                      name: 'D', type: 'string'
                    }
                  ]
                }"
                :db="db"
              />
            </div>
            <div class="mt-4">
              <button @click="saveItem('func')" class="button is-success">Save function</button>
              <button @click="deleteItem('func')" class="button is-danger">Delete function</button>
            </div>
          </div>

          <!-- Content ... -->
        </section>
        <footer class="modal-card-foot">
          <button @click="saveItem('model')" class="button is-success">Save model</button>
          <button @click="deleteItem('model', blur=true)" class="button is-danger">Delete model</button>
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
import PouchSpreadsheet from './components/PouchSpreadsheet.vue'
import PouchDB from 'pouchdb'
import pouchdbUpsert from 'pouchdb-upsert'
import relationalPouch from 'relational-pouch'
import schema from './schema.js'

PouchDB.plugin(pouchdbUpsert)
PouchDB.plugin(relationalPouch)

import timeToId from './timeToId.js'

export default {
  name: 'App',
  components: {
    PouchSpreadsheet
  },
  watch: {
    // func: {
    //   handler () {
    //     console.log('change...')
    //   },
    //   deep: true,
    // }
  },
  mounted () {
    this.db = new PouchDB('my_database')

    this.schema = schema

    this.db.setSchema(this.schema)
    
    window.DB = this.db

    // get list of existing models
    this.db.rel.find('model').then((response) => {
      this.models = response.models
    })
    this.startSync()
  },
  methods: {
    startSync () {
      // listen changes and manage _rev for local data
      this.syncHandler = this.db.changes({
        since: this.seq || 'now',
        include_docs: true,
        live: true
      }).on('change', (change) => {
        // console.log('change:', change)
        this.seq = change.seq
        let docInfoObj = this.db.rel.parseDocID(change.id)
        let type = docInfoObj.type
        let id = docInfoObj.id
        
        // manage UI state when delete something
        if (change.deleted) {
          let plural = this.schema.filter(item => item.singular === type)[0].plural

          if (this[plural] && this[plural].length) {
            // find item position
            let index = this[plural].map(item => item.id).indexOf(id)
            // show only non deleted itens
            this[plural] = this[plural].filter(item => item.id !== id)
            // set editing item to same position, previous or null only 
            // if exists local type item of 
            if (this[type]) {
              this[type] = this[plural][index] || this[plural][index -1] || null
            }
          } else {
            this[type] = null
          }
        }
        
        // manage UI state when something is updated
        if (this[type] && this[type].id === id && change.doc.data) {
          Object.assign(this[type], change.doc.data) // TODO: this line is necessary?
          this[type].id = id
          this[type].rev = change.doc._rev
        }
      })
    },
    cancelItemEdit (type) {
      let targetSchema = this.schema.filter(item => item.singular === type)[0]
      if (!targetSchema) {
        console.warn('Cannot cancel `'+type+'` because it do not exists in schema.')
        return
      }

      // clean local state linked relations
      if (targetSchema.relations) {
        Object.keys(targetSchema.relations).forEach(relationPlural => {
          let relationSchema = this.schema.filter(item => item.plural === relationPlural)[0]
          this[relationSchema.singular] = null
          this[relationPlural] = []
        })
      }
      
      return this.db.rel.find(type).then((response) => {
        this[type] = null
        let plural = this.schema.filter(item => item.singular === type)[0].plural
        this[plural] = response[plural]
      })
    },
    checkIfItemExists (type) {
      if (!this[type]) {
        console.warn(type + ' is not avaliable on `this`.')
        return false
      }
      return true
    },
    deleteItem (type, blur) {
      /*
      type: String - type of object
      blur: Bool - to set null to object
      */
      if (!this.checkIfItemExists(type)) return
      if (blur) this.syncHandler.cancel()
      return this.db.rel.del(type, this[type]).then(() => {
        if (blur) this[type] = null
      }).catch(err => {
        console.log(err)
      }).finally(() => {
        if (blur) this.startSync()
      })
    },
    saveItem (type) {
      if (!this.checkIfItemExists(type)) return
      // upsert data
      return this.db.rel.find(type, this[type].id).then(response => {
        let plural = this.schema.filter(item => item.singular === type)[0].plural
        if (JSON.stringify(response[plural][0]) !== JSON.stringify(this[type])) {
          return this.db.rel.save(type, this[type])
        } else {
          console.log('no changes')
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
        if (targetSchema === undefined) {
          console.error('`' + target + '`not found. Tip: type must be singular')
        }

        return this.db.rel.find(target, ids).then((response) => {

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
      return traverse(type, ids)
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
        // name: '',
        name: id,
        unit: '',
        model: this.model.id,
      }
      this.model.funcs = this.model.funcs || []
      this.model.funcs.push(id)
      return this.saveItem('model').then(() => {
        return this.db.rel.save('func', func)
      }).then(() => {
        return this.pull('func', this.model.funcs)
      }).then(() => {
        this.$nextTick(() => {
          this.func = this.funcs.filter(item => item.id === id)[0]
        })
      })
      .catch(err => {
        console.log(err)
      })
    },
  },
  computed: {
  },
  data () {
    return {
      seq: 0, // used to cancel/restart sync

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
