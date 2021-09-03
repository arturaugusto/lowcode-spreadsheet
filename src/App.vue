<template>
  <section class="section">

    <!-- Methods -->

    <div v-if="method && !instrument" class="modal" v-bind:class="{'is-active': method && !instrument}">
      <div class="modal-background"></div>
      <div class="modal-card" style="min-width: 100%;min-height: 100%;">
        <header class="modal-card-head">
          <p class="modal-card-title">Modal title</p>
          <button @click="goToMain()" class="delete" aria-label="close"></button>
        </header>
        <section class="modal-card-body" id="modelCardBody">

          {{method}}

          <div class="field">
            <label class="label">Name</label>
            <div class="control">
              <input v-model="method.name" class="input" type="text" placeholder="Method name">
            </div>
          </div>

          <div class="field">
            <label class="label">Expression</label>
            <div class="control">
              <textarea v-model="method.expr" class="textarea" placeholder="expr"></textarea>
            </div>
          </div>


          <!-- Content ... -->
        </section>
        
        <footer class="modal-card-foot">
          <button @click="saveItem('method')" class="button is-success">Save method</button>
          <button @click="deleteItem('method', blur=true)" class="button is-danger">Delete method</button>
          <!-- <button class="button">Cancel</button> -->
        </footer>
      </div>
    </div>




    <!-- Instruments -->

    <div v-if="instrument" class="modal" v-bind:class="{'is-active': instrument}">
      <div class="modal-background"></div>
      <div class="modal-card" style="min-width: 100%;min-height: 100%;">
        <header class="modal-card-head">
          <p class="modal-card-title">Modal title</p>
          <button @click="goToMain()" class="delete" aria-label="close"></button>
        </header>
        <section class="modal-card-body" id="modelCardBody">

          <div v-if="!instrument.modelConfirmed" class="field has-addons">
            <div class="control">
              <span v-if="models && models.length" class="select is-primary field mr-2">
                <select v-model="instrument.model">
                  <option 
                    v-for="model in models"
                    :key="model.id" 
                    :value="model.id">{{model.name}}
                  </option>
                </select>
              </span>
            </div>
            <div class="control">
              <button
                @click="(instrument.modelConfirmed = true)&&saveItem('instrument')
                  .then(() => this.db.rel.find('model', this.instrument.model))
                  .then(response => {
                    this.model = response.models[0]
                    return db.rel.find('func', this.model.funcs)
                  })
                  .then(response => {
                    this.funcs = response.funcs
                  })
                  .catch(() => instrument.modelConfirmed = false)"
                type="submit" class="button is-primary">Confirm</button>
            </div>
          </div>

          <div v-if="instrument.modelConfirmed">

            <p class="subtitle is-5">Model: {{instrument.model}}</p>
            
            <div class="field">
              <label class="label">Serial number</label>
              <div class="control">
                <input v-model="instrument.serialNumber" class="input" type="text" placeholder="Serial number">
              </div>
            </div>

            <div class="tabs">
              <ul>
                <li><a @click="createTest">New test +</a></li>
                <li
                  v-bind:class="{'is-active': test && test.id === testOption.id}"
                  v-for="testOption in tests"
                  :key="testOption.id"
                >
                  <a @click="setTest(testOption)">{{testOption.id}}</a>
                </li>
              </ul>
            </div>

            <!-- <pre>test: {{ test }}</pre> -->
            <!-- <pre>instrument: {{ instrument }}</pre> -->
            <!-- <pre>func: {{ func }}</pre> -->
            <!-- <pre>subTests: {{ subTests }} </pre> -->

            <div v-if="test">
              <span>Avaliable functions: </span>
              <span v-if="funcs && funcs.length" class="select is-primary field mr-2">
                <select v-model="func">
                  <option 
                    v-for="funcOption in funcs"
                    :key="funcOption.id" 
                    :value="funcOption">{{funcOption.name}}
                  </option>
                </select>
              </span>
              <!-- func: {{func}} -->
              <!-- <div>test: {{test}}</div> -->
              
              <div class="block box">
                <!-- subTestsVisible: {{subTestsVisible}} -->
                <!-- {{methods}} -->
                <div v-for="subTestVisible in subTestsVisible" :key="subTestVisible.id">
                  <div class="control">
                    <span>Avaliable methods: </span> <span v-if="methods && methods.length" class="select is-primary field mr-2">
                      <select v-model="subTestVisible.method">
                        <option 
                          v-for="method in methods"
                          :key="method.id"
                          :value="method">{{method.name}}
                        </option>
                      </select>
                    </span>
                  </div>

                  <!-- instruments chooser -->
                  <!-- {{ subTestsVarInstrumentMapsIds }} -->
                  <!-- {{ instruments }} -->
                  <!-- {{ funcs }} -->

                  <div v-if="subTestVisible.method" class="block">     
                    <div 
                      v-for="inputVar in subTestVisible.method.inputVars"
                      :key="inputVar"
                      class="field has-addons has-addons-centered">
                      
                      <p class="control">
                        <span class="button is-static">
                          {{inputVar}}
                        </span>
                      </p>


                      <p class="control mr-2">
                        <span class="select">
                          <select v-model="subTestVisible.varInstrumentMap[inputVar]">
                            <option
                              v-for="instrumentOption in instruments"
                              :key="instrumentOption.id"
                              :value="instrumentOption.id"
                              >{{instrumentOption.serialNumber + ' - ' + 
                              (models||[]).filter(m => m.id === instrument.model)[0]['name'] }}
                            </option>
                          </select>
                        </span>
                      </p>

                      <!-- {{ subTestVisible.varInstrumentMap[inputVar] }} -->
                      
                      <p v-if="subTestVisible.varInstrumentMap[inputVar]" class="control">
                        <span class="select">
                          <select>
                            <option
                              v-for="func in funcs.filter(f => f.model === 
                                (instruments.filter(i => i.id === subTestVisible.varInstrumentMap[inputVar])[0]||{}).model)"
                              :key="func.id"
                            >
                              {{ func.name }}
                            </option>
                          </select>
                        </span>
                      </p>
                      <!-- <p class="control">
                        <a class="button is-primary">
                          Transfer
                        </a>
                      </p> -->
                    </div>
                  </div>

                  <!-- {{subTestVisible}} -->
                  <PouchSpreadsheet
                    v-if="subTestVisible.method && subTestVisible.ss"
                    v-model="subTestVisible.ss"
                    :computedClass="() => Object({})"
                    :schema="{
                      cols: [
                        {
                          name: 'A', type: 'string'
                        },
                        {
                          name: 'B', type: 'string'
                        },
                      ]
                    }"
                    
                  />
                  <!-- <div>subTest: {{subTestVisible}}</div> -->
                  <button
                    @click="saveSubTest(subTestVisible)"
                    class="button is-small is-success mr-2">Save
                  </button>

                  <button
                    @click="(this.subTest=subTestVisible)&&deleteItem('subTest')"
                    class="button is-small is-danger">Delete
                  </button>

                </div>

                <div v-if="func" class="control mt-2">
                  <button @click="createSubTest" class="button is-link">+ New sub test</button>
                </div>
              </div>

              <div class="mt-4">
                <button @click="saveItem('test')" class="button is-success">Save test</button>
                <button @click="deleteItem('test')" class="ml-2 button is-danger">Delete test</button>
              </div>
            </div>

          </div>
        </section>
        <footer class="modal-card-foot">
          <button @click="saveItem('instrument')" class="button is-success">Save instrument</button>
          <button @click="deleteItem('instrument', blur=true)" class="button is-danger">Delete instrument</button>
          <!-- <button class="button">Cancel</button> -->
        </footer>
      </div>
    </div>



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
              return db.rel.find('model', instrument.model)
            })
            .then(response => {
              this.model = response.models[0]
              return db.rel.find('func', this.model.funcs)
            })
            .then(response => {
              this.funcs = response.funcs
              return db.rel.find('test', instrument.tests)
            })
            .then(response => {
              this.tests = response.tests
              if (this.tests.length) this.test = this.tests[0]
              return db.rel.find('subTest', this.test.subTests)
            })
            .then(response => {
              this.subTests = response.subTests
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
              return db.rel.find('func', method.funcs)
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
          {{'Method: ' +  method.name || 'Unnamed method'}}
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

import modelComputedCellContent from './modelComputedCellContent.js'

export default {
  name: 'App',
  components: {
    PouchSpreadsheet
  },
  watch: {
    subTestsVarInstrumentMapsIds: {
      handler (ids, prevIds) {
        if (JSON.stringify(ids) !== JSON.stringify(prevIds)) {
          this.db.rel.find('instrument', ids)
          .then(response => {
            this.instruments = response.instruments
            let modelsUniqIds = [... new Set(this.instruments.map(instrument => instrument.model))]
            return this.db.rel.find('model', modelsUniqIds)
          })
          .then(response => {
            this.models = response.models
            let funcsUniqIds = [... new Set(this.models.map(model => model.funcs).flat())]
            return this.db.rel.find('funcs', funcsUniqIds)
          })
          .then(response => {
            this.funcs = response.funcs
          })
          .catch(err => console.log(err))
        }
      },
      deep: true,
    },
    inputVars: {
      handler (val) {
        if (!this.method) return
        this.method.inputVars = val
      },
      // deep: true,
    }
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
    saveSubTest (subTest) {
      // Object.assign(response.subTests[0], subTest)
      return this.db.rel
        .find('subTest', subTest.id)
        .then(response => {
          let data = response.subTests[0]
          // data.ss = subTest.ss
          delete subTest.id
          delete subTest.rev
          Object.assign(data, subTest)
          return this.db.rel.save('subTest', data)
        })
        .catch(err => console.log(err))
    },
    setTest (testOption) {
      this.test = testOption
      return this.selectSubTests()
    },
    selectSubTests () {
      return this.db.rel
        .find('subTest', this.test.subTests)
        .then(response => {
          this.subTests = response.subTests
        })
        .catch(err =>{
          console.log(err)
        })
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
      ['model', 'instrument', 'method', 'func'].forEach(type => {
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

    // factory functions

    createMethod () {
      return this.db.rel.save('method', {
        id: timeToId.toB64(),
        name: 'new method',
      }).then((response) => {
        return this.db.rel.find('method', response.id)
      }).then((response) => {
        this.method = response.methods[0]
      }).catch(err => {
        console.log(err)
      })
    },
    
    createSubTest () {
      let id = timeToId.toB64()
      let subTest = {
        id: id,
        test: this.test.id,
        func: this.func.id,
        ss: {},
        varInstrumentMap: {},
      }
      this.test.subTests = this.test.subTests || []
      this.test.subTests.push(id)
      return this.saveItem('test')
      .then(() => {
        return this.db.rel.save('subTest', subTest)
      }).then(() => {
        return this.db.rel.find('subTest', this.test.subTests)
      }).then(response => {
        this.subTests = response.subTests
      })
      .catch(err => {
        console.log(err)
      })
    },

    createTest () {
      let id = timeToId.toB64()
      let test = {
        id: id,
        date: '',
        dueDate: '',
        instrument: this.instrument.id,
      }
      this.instrument.tests = this.instrument.tests || []
      this.instrument.tests.push(id)
      return this.saveItem('instrument').then(() => {
        return this.db.rel.save('test', test)
      }).then(() => {
        return this.db.rel.find('test', this.instrument.tests)
      }).then(response => {
        this.tests = response.tests
      }).then(() => {
        this.$nextTick(() => {
          this.test = this.tests.filter(item => item.id === id)[0]
        })
      })
      .catch(err => {
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
    subTestsVarInstrumentMaps () {
      if (!this.subTests) return []
      return this.subTests.map(subTest => {
        return subTest.varInstrumentMap
      })
    },
    subTestsVarInstrumentMapsIds () {
      let allIds = this.subTestsVarInstrumentMaps.map(item => 
        Object.keys(item).map(v => item[v])
      )
      .flat()
      let uniqIds = [...new Set(allIds)]
      return uniqIds
    },
    inputVars () {
      /*
      Determine from expression, whitch variables are expected to be
      provided by user 

      Returns an array
      */

      if (!this.method || !this.method.expr) return []
      
      const exprOperatorsRegex = new RegExp(/[\s+*\-()%^=&|/:]+/)
      const startWithDigitOrReservedRegex = new RegExp(/^[\d_]/)
      const exprTokens = 'log base e pi int ceil floor round modulus abs sign min max sin cos tan sinh cosh tanh asin acos atan asinh acosh atanh'.split(' ')
      
      const leftHandSideTokens = this.method.expr.split('\n')
        .filter(item => item.includes('='))
        .map(item => item.split('=')[0].trim())

      return this.method.expr.split(exprOperatorsRegex)
        // remove empty
        .filter(item => item.trim().length)
        // start with digit
        .filter(item => !item.match(startWithDigitOrReservedRegex))
        .filter(item => !exprTokens.includes(item))
        .filter(item => !leftHandSideTokens.includes(item))
        .map(item => item.trim())
        .reduce((a, c) => a.indexOf(c) === -1 ? a.push(c)&&a : a,[])
    },
    subTestsVisible () {
      if (!this.test) return []
      if (!this.func) return []
      return this.subTests.filter(subTest => {
        return subTest.test === this.test.id && subTest.func === this.func.id
      })
    }
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
