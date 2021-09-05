<template>
  <section class="section">

    <!-- Methods -->
    <Method 
      :db="db"
      @goToMain="goToMain"
      :parentMethod="method"
      @saveItem="saveItem"
      @deleteItem="deleteItem"
      v-if="method && !instrument"
    />


    <!-- Instruments -->
    <Instrument
      :db="db"
      @goToMain="goToMain"
      :parentInstrument="instrument"
      :methods="methods"
      @saveItem="saveItem"
      @deleteItem="deleteItem"
      v-if="instrument"
    />



    <!-- Models -->

    <div v-if="model && !instrument" class="modal" v-bind:class="{'is-active': model && !instrument}">
      <div class="modal-background"></div>
      <div class="modal-card" style="min-width: 100%;min-height: 100%;">
        <header class="modal-card-head">
          <p class="modal-card-title">Modal title</p>
          <button @click="goToMain()" class="delete" aria-label="close"></button>
        </header>
        <section class="modal-card-body" id="modelCardBody">

          <!-- {{model}} -->

          <div class="field">
            <label class="label">Name</label>
            <div class="control">
              <input v-model="model.name" class="input" type="text" placeholder="Model name">
            </div>
          </div>
          
          <!-- {{ funcs }} -->

          <!-- {{func}} -->
          
          <span>Avaliable functions: </span><span v-if="funcs && funcs.length" class="select is-primary field mr-2">
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
            <!-- {{func}} -->
            <div v-for="funcSheet in funcs" :key="funcSheet.id" class="">
              <PouchSpreadsheet
                v-if="func && funcSheet.id === func.id"
                v-model="func.ss"
                :computedClass="modelComputedCellContent"
                :schema="{
                  cols: [
                    // {
                    //   name: 'A', type: 'list', options: ['lala', 'bah']
                    // },
                    {name: 'Description', type: 'string'},
                    {name: 'Range', type: 'string'},
                    {name: 'Start', type: 'string'},
                    {name: 'Full Range', type: 'string'},
                    {name: 'Uncertainty', type: 'string'},
                    {name: 'Distribution', type: 'string'},
                    {name: 'Uncertainty', type: 'string'},
                    {name: 'a', type: 'string'},
                    {name: 'b', type: 'string'},
                    {name: 'c', type: 'string'},
                    {name: 'Influence Quantity', type: 'string'},
                    {name: 'IQ Start', type: 'string'},
                    {name: 'IQ End', type: 'string'},
                  ]
                }"
                
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

    <div class="container block">
      <button @click="createModel" class="button is-large is-fullwidth is-primary is-outlined">Model</button>
    </div>
    
    <div class="container block">
      <button @click="createInstrument" class="button is-large is-fullwidth is-primary is-outlined">Item</button>
    </div>

    <div class="container block">
      <button @click="createMethod" class="button is-large is-fullwidth is-primary is-outlined">Method</button>
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
        <a v-for="model in models"
          :key="model.id"
          class="panel-block"
          @click="db.rel
            .find('model', model.id)
            .then(response => {
              this.model = response.models[0]
              return db.rel.find('func', model.funcs)
            })
            .then(response => {
              this.funcs = response.funcs
              if (this.funcs.length) this.func = this.funcs[0]
            })
            .catch(err => console.log(err))"
          >
          <span class="panel-icon">
            <i class="fas fa-book" aria-hidden="true"></i>
          </span>
          {{model.name || 'Unnamed model'}}
        </a>

        <a v-for="instrument in instruments"
          :key="instrument.id"
          class="panel-block"
          @click="db.rel
            .find('instrument', instrument.id)
            .then(response => {
              this.instrument = response.instruments[0]
            })
            .catch(err => console.log(err))"
          >
          <span class="panel-icon">
            <i class="fas fa-book" aria-hidden="true"></i>
          </span>
          {{'instrument: ' + instrument.serialNumber || 'Unnamed instrument'}}
        </a>

        <a v-for="method in methods"
          :key="method.id"
          class="panel-block"
          @click="db.rel
            .find('method', method.id)
            .then(response => {
              this.method = response.methods[0]
            })
            .catch(err => console.log(err))"
          >
          <span class="panel-icon">
            <i class="fas fa-book" aria-hidden="true"></i>
          </span>
          {{'Method: ' +  method.name || 'Unnamed method'}}
        </a>


      </article>
    </div>

  </section>
</template>

<script>
import PouchSpreadsheet from './components/PouchSpreadsheet.vue'
import Instrument from './components/Instrument.vue'
import Method from './components/Method.vue'
import PouchDB from 'pouchdb'
import pouchdbUpsert from 'pouchdb-upsert'
import relationalPouch from 'relational-pouch'
import schema from './schema.js'

PouchDB.plugin(pouchdbUpsert)
PouchDB.plugin(relationalPouch)

import timeToId from './timeToId.js'

import modelComputedCellContent from './modelComputedCellContent.js'

export default {
  name: 'App',
  components: {
    PouchSpreadsheet,
    Method,
    Instrument,
  },
  watch: {
  },
  mounted () {
    this.modelComputedCellContent = modelComputedCellContent
    this.db = new PouchDB('my_database')
    this.schema = schema
    this.db.setSchema(this.schema)
    window.DB = this.db
    this.goToMain()
    this.startSync()
  },
  methods: {
    log (arg) {
      console.log(arg)
    },
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
    goToMain () {
      this.func = null
      this.funcs = [];
      ['model', 'instrument', 'method'].forEach(type => {
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
        
        this.db.rel.find(type).then((response) => {
          this[type] = null
          let plural = this.schema.filter(item => item.singular === type)[0].plural
          this[plural] = response[plural]
        })
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
        if (blur) {
          let plural = this.schema.filter(item => item.singular === type)[0].plural
          let id = this[type].id
          this[type] = null
          if (this[plural]) {
            this[plural] = this[plural].filter(item => item.id !== id)
          }
        }
      }).catch(err => {
        console.log(err)
      }).finally(() => {
        if (blur) this.startSync()
      })
    },
    saveItem (type, data) {
      if (!this.checkIfItemExists(type)) return
      // upsert data
      return this.db.rel.find(type, this[type].id)
      .then(response => {
        let plural = this.schema.filter(item => item.singular === type)[0].plural

        if (JSON.stringify(response[plural][0]) !== JSON.stringify(data)) {
          return this.db.rel.save(type, data)
        } else {
          console.log('no changes')
        }
      }).then(response => {
        this[type] = data
        if (response && response.id === this[type].id) {
          this[type].rev = response.rev
        }
        return new Promise(() => this[type])
      }).catch(function (err) {
        if (err.code === 409) { // conflict
          // handle the conflict
        } else {
          throw err;
        }
      })
    },

    // factory functions

    createMethod () {
      let id = timeToId.toB64()
      let method = {
        id: id,
        name: 'new method',
      }
      return this.db.rel.save('method', method)
      .then((response) => {
        return this.db.rel.find('method', response.id)
      }).then((response) => {
        this.method = response.methods[0]
      }).catch(err => {
        console.log(err)
      })
    },

    createInstrument () {
      return this.db.rel.save('instrument', {
        id: timeToId.toB64(),
        serialNumber: '',
        modelConfirmed: false,
        model: undefined,
        activeTestId: undefined,
      }).then((response) => {
        return this.db.rel.find('instrument', response.id)
      }).then((response) => {
        this.instrument = response.instruments[0]
      }).catch(err => {
        console.log(err)
      })

    },
    createModel () {
      return this.db.rel.save('model', {
        id: timeToId.toB64(),
        name: '',
      }).then((response) => {
        return this.db.rel.find('model', response.id)
      }).then((response) => {
        this.model = response.models[0]
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
        ss: {},
      }
      this.model.funcs = this.model.funcs || []
      this.model.funcs.push(id)
      return this.saveItem('model').then(() => {
        return this.db.rel.save('func', func)
      }).then(() => {
        return this.db.rel.find('func', this.model.funcs)
      }).then(response => {
        this.funcs = response.funcs
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
      
      instrument: null,
      instruments: [],

      test: null,
      tests: [],

      subTest: null,
      subTests: [],

      method: null,
      methods: [],

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

</style>
