<template>
  <div class="modal is-active">
    <div class="modal-background"></div>
    <div class="modal-card" style="min-width: 100%;min-height: 100%;">
      <header class="modal-card-head">
        <p class="modal-card-title">Modal title</p>
        <button @click="$emit('goToMain')" class="delete" aria-label="close"></button>
      </header>
      <section class="modal-card-body">

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
              @click="confirmInstrumentModel"
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

          <!-- {{test ? test.rev : ''}} -->
          <div v-if="test">
            <span>Function: </span>
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
            
            <div v-if="subTests.length" class="block">
              <!-- subTestsVisible: {{subTestsVisible}} -->
              <!-- {{methods}} -->
              <div v-for="(subTestVisible) in subTestsVisible" :key="subTestVisible.id" class="box has-background-grey-lighter  ">
                <!-- {{subTestVisible.rev}} -->
                <div class="control block mt-2">
                  <span>Method: </span> <span v-if="methods && methods.length" class="select is-primary field mr-2">
                    <select v-model="subTestVisible.method">
                      <option 
                        v-for="method in methods.filter(item => item.inputVars && item.inputVars.length)"
                        :key="method.id"
                        :value="method.id">{{method.name}}
                      </option>
                    </select>
                  </span>
                  <span v-else class="has-text-weight-bold">
                    No methods available. Go to main screen and create one first.
                  </span>
                </div>

                <!-- instruments chooser -->
                <!-- {{ subTestsVarInstrumentMaps }} -->
                <!-- {{ subTestsVarInstrumentMapsIds }} -->
                <!-- {{ instruments }} -->
                <!-- {{ funcs }} -->
                <div
                  v-if="methodByIdMap[subTestVisible.method]"
                  class="block"
                >
                  <div 
                    v-for="inputVar in methodByIdMap[subTestVisible.method].inputVars"
                    :key="inputVar"
                    class="field has-addons has-addons-centered">
                    
                    <p class="control">
                      <span class="button is-static">
                        {{inputVar}}
                      </span>
                    </p>

                    <!-- instrument chooser -->
                    <p v-if="models && models.length" class="control mr-2">
                      <span class="select">
                        <select v-model="subTestVisible.varInstrumentMap[inputVar]">
                          <option
                            v-for="instrumentOption in instruments"
                            :key="instrumentOption.id"
                            :value="instrumentOption.id"
                            >{{instrumentOption.serialNumber + ' - ' + 
                            ((models||[]).filter(m => m.id === instrumentOption.model)[0]||{})['name'] }}
                          </option>
                        </select>
                      </span>
                    </p>

                    <!-- {{ subTestVisible.varInstrumentMap[inputVar] }} -->

                    <!-- function chooser -->
                    <p v-if="subTestVisible.varInstrumentMap[inputVar] && funcsForSubTestsVars && funcsForSubTestsVars.length" class="control">
                      <span class="button is-static">
                        Function
                      </span>
                      <span class="select">
                        <select v-model="subTestVisible.varFuncMap[inputVar]">
                          <option
                            v-for="func in funcsForSubTestsVars.filter(f => f.model === 
                              (instruments.filter(i => i.id === subTestVisible.varInstrumentMap[inputVar])[0]||{}).model)"
                            :key="func.id"
                            :value="func.id"
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
                  v-if="subTestVisible && methodByIdMap[subTestVisible.method] && subTestVisible.ss"
                  v-model="subTestVisible.ss"
                  :computedClass="() => Object({})"
                  :schema="{
                    cols: [
                      {name: 'point', type: 'string'},
                    ]
                    .concat(methodByIdMap[subTestVisible.method]
                      .inputVars
                      .map(inputVar => Object({name: inputVar, type: 'string'}))
                    )
                  }"
                  
                />


                <!-- <p class="control mr-2">
                  <span class="select">
                    <select>
                      <option
                        v-for="item in calData[0]"
                        :key="item"
                        :value="item"
                        >{{ item.range }}
                      </option>
                    </select>
                  </span>
                </p> -->


                <!-- <pre>{{calData}}</pre> -->
                <!-- <pre>{{ genTestData(subTestVisible)}}</pre> -->
                <!-- <pre>{{ genTestData(funcs)}}</pre> -->
                <!-- <pre>{{ methods }}</pre> -->

                


                <button
                  @click="calc(subTestVisible)"
                  class="button is-small is-link mt-2">Calc
                </button>

                <!-- <button
                  @click="saveSubTest(subTestVisible)"
                  class="button is-small is-success">Save
                </button> -->

                <button
                  @click="db.rel.del('subTest', subTestVisible)
                    .then(() => this.subTests = this.subTests.filter(item => item.id !== subTestVisible.id))"
                  class="button is-small is-danger ml-1 mt-2">Delete
                </button>


                <!-- {{subTestsComponents[stIndex]}} -->


                <!-- <div>
                  <div
                    v-for="row in subTestVisible.res"
                    :key="row"
                  >
                    <p>{{row.name}}</p>
                    <table class="table is-bordered">
                      <tbody>
                        <tr v-for="rowData in row.data" :key="rowData">
                          <td>
                            {{rowData.point}}
                          </td>
                          <td>
                            {{rowData.res}}
                          </td>
                          <td>
                            <button>Calc</button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div> -->

                <div v-html="subTestVisible.html"></div>

                <hr>
                <pre>{{ subTestVisible.res }}</pre>
                
              </div>

            </div>

            <div class="mt-4">
              <!-- <button @click="saveSubTestsAndTest" class="button is-success">Save test</button> -->
              <button v-if="func" @click="createSubTest" class="button is-link">+ New sub test</button>

              <button
                @click="db.rel.del('test', test)
                  .then(() => this.tests = this.tests.filter(item => item.id !== test.id))"
                class="ml-2 button is-danger">Delete test
              </button>


            </div>
          </div>

        </div>
      </section>
      <footer class="modal-card-foot">
        <button @click="saveSubTestsAndTest().then(response => $emit('saveItem', 'instrument', instrument))" class="button is-success">Save</button>
        <button @click="$emit('deleteItem', 'instrument', blur=true)" class="button is-danger">Delete</button>
        <!-- <button class="button">Cancel</button> -->
      </footer>
    </div>
  </div>
</template>
<script>
import PouchSpreadsheet from '@/components/PouchSpreadsheet.vue'
import timeToId from '@/timeToId.js'
import parsers from '@/parsers.js'
import exprParsers from '@/exprParsers.js'
import gum from '@/gum.js'
import mustache from 'mustache'
import MarkdownIt from 'markdown-it'
const md = new MarkdownIt()

md.renderer.rules.table_open = function () { 
  return '<table class="table is-bordered is-striped is-hoverable">\n'; 
}; 




export default {
  components: {
    PouchSpreadsheet,
  },
  name: 'Method',
  props: {
    db: Object,
    parentInstrument: Object,
    methods: Array,
  },
  emits: ['saveItem', 'goToMain', 'deleteItem'],

  watch: {
    // subTestsVisible: {
      // handler () {
      //   this.$nextTick(() => {
      //     this.subTestsVisible.forEach(subTest => {
      //       let res = this.parsers.getComponents(subTest, this.funcs, this.methods)
      //       this.subTestsComponents[subTest.id] = res
      //     })
      //     // this.subTestsComponents = JSON.parse(JSON.stringify(res))
      //   })
        
      // },
      // deep: true,
    // },
    subTestsVarInstrumentMapsIds: {
      handler (ids, prevIds) {
        if (JSON.stringify(ids) !== JSON.stringify(prevIds)) {
          // console.log(ids)
          return this.db.rel.find('instrument', ids)
          .then(response => {
            let modelsUniqIds = [... new Set(response.instruments.map(instrument => instrument.model))]
            return this.db.rel.find('model', modelsUniqIds)
          })
          .then(response => {
            let funcsUniqIds = [... new Set(response.models.map(model => model.funcs).flat())]
            return this.db.rel.find('func', funcsUniqIds)
          })
          .then(response => {
            this.funcsForSubTestsVars = response.funcs
          })
          .catch(err => console.log(err))
        }
      },
      deep: true,
    },
  },
  data () {
    return {
      model: null,
      models: [],
      
      func: null,
      funcs: [],
      
      instrument: null,
      instruments: [],

      test: null,
      tests: [],

      subTests: [],

      method: null,

      funcsForSubTestsVars: [],
    }
  },
  beforeMount () {
    this.instrument = JSON.parse(JSON.stringify(this.parentInstrument))
    
    return this.db.rel.find('model', this.instrument.model)
    .then(response => {
      this.model = response.models[0]
      return this.db.rel.find('func', this.model.funcs)
    })
    .then(response => {
      this.funcs = response.funcs
      if (this.funcs) {
        this.func = this.funcs[0]
      }
      return this.db.rel.find('test', this.instrument.tests)
    })
    .then(response => {
      this.tests = response.tests
      if (this.tests.length) {
        this.test = this.tests[0]
        if (this.test.subTests) {
          return this.db.rel.find('subTest', this.test.subTests)
        }
      }
    })
    .then(response => {
      if (response) {
        this.subTests = response.subTests
      }
    })
    .catch(err => console.log(err))



  },
  mounted () {
    this.parsers = parsers
    Promise.all([this.db.rel.find('instrument'), this.db.rel.find('model')])
    .then(responses => {
      this.instruments = responses[0].instruments
      this.models = responses[1].models
    })
  },
  methods: {
    // genTestData (data) {
    //   return JSON.stringify(data, (k, v) => ['events', 'classes', 'rev'].indexOf(k)  !== -1 ? undefined : v, 2)
    // },


    calc (subTest) {
      const MC = () => {
        var sensitivityAnalysis = (payload) => {
          let payloadClone = JSON.parse(JSON.stringify(payload))
          payloadClone.expr = exprParsers.toSingleLine(payload.expr).expr

          return new Promise((resolve) => {
            resolve(window.MC.sens_ana_js(payloadClone))
          })
        }
        return {
          sensitivityAnalysis: sensitivityAnalysis,
        }
      }

      let method = this.methods.filter(item => item.id === subTest.method)[0]

      let uutVar = Object.keys(method.inputVarsFeatures).filter(k => method.traits[k] === 'isUUT')[0]

      let parsedData = this.parsers.getComponents(subTest, this.funcs, this.methods)

      let promises = parsedData.map(pointData => {
        return gum.calc(pointData.payload, MC).then(res => {
          console.log(res)
          pointData.res = res
        })
      })

      Promise.all(promises).then(() => {
        // group by UUT ranges
        // console.log(JSON.stringify(parsedData, 0 ,2))
        
        if (uutVar) {
          subTest.res = parsers.groupParseComponents(parsedData, uutVar)
        } else {
          subTest.res = parsedData
        }
        // console.log(method)
        let reportingData = exprParsers.groupParsedComponentsUnnormalize(subTest.res, method.expr, window.MC)

        subTest.html = md.render(mustache.render(method.template, {ranges: reportingData}))
        console.log('done')
      })
      .catch(err => {
        console.log(err)
      })

    },
    log (arg) {
      console.log(arg)
    },
    compareSubset (a, b) {
      /*
      Deep compare objects removing some keys
      */
      const replacer = (k, v) => k === 'id' ? undefined : v
      return JSON.stringify(a, replacer) === JSON.stringify(b, replacer)
    },
    confirmInstrumentModel () {
      // let p = this.$emit('saveItem', 'instrument', this.instrument)
      this.db.rel.save('instrument', this.instrument)
      .then(response => {
        this.instrument.rev = response.rev
        return this.db.rel.find('model', this.instrument.model)
      })
      .then(response => {
        this.model = response.models[0]
        return this.db.rel.find('func', this.model.funcs)
      })
      .then(response => {
        this.funcs = response.funcs
        this.instrument.modelConfirmed = true
      })
      .catch(err => {
        console.log(err)
        this.instrument.modelConfirmed = false
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
      this.instrument.tests = this.instrument.tests || [];
      this.instrument.tests.push(id)

      return this.db.rel.save('instrument', this.instrument)
      .then(response => {
        this.instrument.rev = response.rev
        return this.db.rel.save('test', test)
      }).then(response => {
        test.rev = response.rev
        return this.db.rel.find('test', this.instrument.tests)
      }).then(response => {
        this.tests = response.tests
        this.$nextTick(() => {
          this.test = this.tests.filter(item => item.id === id)[0]
        })
      })
      .catch(err => {
        console.log(err)
      })
    },
    setTest (testOption) {
      this.test = this.tests.filter(item => item.id === testOption.id)[0]
      return this.selectSubTests()
      // .then(() => {})
    },
    saveTest () {
      return this.db.rel.find('test', this.test.id)
      .then(response => {
        if (!this.compareSubset(response.tests[0], this.test)) {
          return this.db.rel.save('test', this.test)
        }
        console.log('test untouched')
        return Promise.resolve(this.test)
      })
      .then(response => {
        this.test.rev = response.rev
        return Promise.resolve(this.test)
      })
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
    saveSubTest (subTest) {
      return this.db.rel.find('subTest', subTest.id)
      .then(response => {
        if (!this.compareSubset(response.subTests[0], subTest)) {
          return this.db.rel.save('subTest', subTest)
        }
        console.log('subTest untouched')
        return Promise.resolve(subTest)
      })
      .then(response => {
        subTest.rev = response.rev
        return Promise.resolve(subTest)
      })
      .catch(err => console.log(err))
    },
    saveSubTests () {
      return Promise.all(this.subTestsVisible.map(this.saveSubTest))
    },
    saveSubTestsAndTest () {
      return this.saveSubTests().then(this.saveTest).catch(err => this.log(err))
    },
    createSubTest () {

      let id = timeToId.toB64()
      let subTest = {
        id: id,
        test: this.test.id,
        func: this.func.id,
        ss: {},
        varInstrumentMap: {},
        varFuncMap: {},
      }
      
      this.test.subTests = this.test.subTests || []
      this.test.subTests.push(id)

      return this.saveSubTestsAndTest()
      .then(() => {
        return this.db.rel.save('subTest', subTest)
      }).then(response => {
        subTest.rev = response.rev
        this.subTests.push(subTest)
        return this.db.rel.find('subTest', this.test.subTests)
      })
      .catch(err => {
        console.log(err)
      })
    },
  },
  computed: {
    // subTestsComponents () {
    //   return this.subTestsVisible.map(subTest => {
    //     return this.parsers.getComponents(subTest, this.funcs, this.methods)
    //   })
    // },
    methodByIdMap () {
      return this.methods.reduce((a, c) => {
        a[c.id] = c
        return a
      }, {})

    },
    subTestsVarInstrumentMaps () {
      /*
      return array of objects that map variables for selected 
      method at subTests to instrument

      eg:

      [ { "VRp": "-MicZz5f", "Rp": "-MicZz5f", "VI": "-MicZz5f" },
        { "VRp": "-MicZz5f" }, { "VRp": "-MicZz5f" },
        { "Rp": "-MicZz5f", "VRp": "-MicZz5f", "VI": "-MicZz5f" } ]

      */
      if (!this.subTests) return []
      return this.subTests.map(subTest => {
        return subTest.varInstrumentMap
      })
    },
    subTestsVarInstrumentMapsIds () {
      /*
      Uniq ids for `subTestsVarInstrumentMaps`

      [ "-MicZz5f" ]

      */
      let allIds = this.subTestsVarInstrumentMaps.map(item => 
        Object.keys(item).map(v => item[v])
      )
      .flat()
      let uniqIds = [...new Set(allIds)]
      return uniqIds
    },
    subTestsVisible () {
      if (!this.test) return []
      if (!this.func) return []
      return this.subTests.filter(subTest => {
        return subTest.test === this.test.id && subTest.func === this.func.id
      })
    },    
  }
}
</script>