<template>
  <div class="modal is-active">
    <div class="modal-background"></div>
    <div class="modal-card" style="min-width: 100%;min-height: 100%;">
      <header class="modal-card-head">
        <p class="modal-card-title">Modal title</p>
        <button @click="$emit('goToMain')" class="delete" aria-label="close"></button>
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
          <div class="mt-2">
            <!-- <button @click="saveFunc" class="button is-small is-success">Save function</button> -->
            <button @click="deleteFunc" class="button is-danger is-small ml-2">Delete function</button>
          </div>
        </div>

        <!-- Content ... -->
      </section>
      
      <footer class="modal-card-foot">
        <button @click="saveFunc().then($emit('saveItem', 'model', model))" class="button is-success">Save model</button>
        <button @click="$emit('deleteItem', 'model', blur=true)" class="button is-danger">Delete model</button>
        <!-- <button class="button">Cancel</button> -->
      </footer>
    </div>
  </div>
</template>
<script>
import PouchSpreadsheet from '@/components/PouchSpreadsheet.vue'
import modelComputedCellContent from '@/modelComputedCellContent.js'
import timeToId from '@/timeToId.js'


export default {
  name: 'Model',
  components: {
    PouchSpreadsheet,
  },
  props: {
    db: Object,
    parentModel: Object,
  },
  emits: ['saveItem', 'goToMain', 'deleteItem'],
  data () {
    return {
      model: {},
      func: null,
      funcs: [],
    }
  },
  mounted () {
    this.modelComputedCellContent = modelComputedCellContent
    this.model = JSON.parse(JSON.stringify(this.parentModel))
    this.findFuncs()
    .then(response => {
      this.func = response.funcs[0]
    })
  },
  methods: {
    deleteFunc () {
      return this.db.rel.del('func', this.func)
      .then(this.findFuncs)
      .catch(err => console.log(err))
    },
    findFuncs () {
      return this.db.rel.find('func', this.model.funcs)
      .then(response => {
        this.funcs = response.funcs
        return Promise.resolve(response)
      })
    },
    saveFunc () {
      return this.db.rel.save('func', this.func)
      .then(response => {
        this.func.rev = response.rev
      })
      .catch(err => console.log(err))
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
      return this.db.rel.save('model', this.model).then(response => {
        this.model.rev = response.rev
        return this.db.rel.save('func', func)
      }).then(response => {
        func.rev = response.rev
        return this.findFuncs()
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
}
</script>