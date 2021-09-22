<template>

  <section class="section has-background-primary">
    Beta
  </section>

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
    <Model
      :db="db"
      @goToMain="goToMain"
      :parentModel="model"
      @saveItem="saveItem"
      @deleteItem="deleteItem"
      v-if="model && !instrument"
    />


    <!-- Create itens -->

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
import Model from '@/components/Model.vue'
import Method from '@/components/Method.vue'
import Instrument from '@/components/Instrument.vue'
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
    Model,
    Method,
    Instrument,
  },
  watch: {
  },
  mounted () {
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
        return Promise.resolve(this[type])
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
        templateColsN: 3,
        template: {},
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
        tests: [],
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
  },
  computed: {

  },
  data () {
    return {
      seq: 0, // used to cancel/restart sync

      model: null,
      models: [],
      
      // func: null,
      // funcs: [],
      
      instrument: null,
      instruments: [],

      // test: null,
      // tests: [],

      // subTest: null,
      // subTests: [],

      method: null,
      methods: [],

    }
  },
}
</script>

<style>
#app {
  /*-webkit-font-smoothing: antialiased;*/
  /*-moz-osx-font-smoothing: grayscale;*/
  
}

</style>
