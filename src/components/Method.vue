<template>
  <div class="modal is-active">
    <div class="modal-background"></div>
    <div class="modal-card" style="min-width: 100%;min-height: 100%;">
      <header class="modal-card-head">
        <p class="modal-card-title">Modal title</p>
        <button @click="$emit('goToMain')" class="delete" aria-label="close"></button>
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

        <p class="title is-5 pt-6">Variables traits</p>

        <div v-for="inputVar in method.inputVars" :key="inputVar" class="field has-addons">
          
          <p class="control">
            <span class="button is-static">
              {{inputVar}}
            </span>
          </p>

          <div class="control">
            <span class="select is-primary field mr-2">
              <select v-model="method.traits[inputVar]">
                <option value="isItem">Test bench item</option>
                <option value="isUUT">Item under test</option>
              </select>
            </span>
          </div>
        </div>

        <p class="title is-5 pt-6">Report Template</p>



        <div class="field">
          <label class="label">Template</label>
          <div class="control">
            <textarea v-model="method.template" class="textarea" placeholder=""></textarea>
          </div>
        </div>        

        <!-- Content ... -->
        <!-- <p>input vars</p>
        {{ method.inputVars }}

        <p>all vars</p>
        {{ allVars }} -->
      </section>
      
      <footer class="modal-card-foot">
        <button @click="$emit('saveItem', 'method', method)" class="button is-success">Save method</button>
        <button @click="$emit('deleteItem', 'method', blur=true)" class="button is-danger">Delete method</button>
        <!-- <button class="button">Cancel</button> -->
      </footer>

    </div>
  </div>
</template>
<script>
// import PouchSpreadsheet from '@/components/PouchSpreadsheet.vue'
// import parsers from '@/parsers.js'
import exprParsers from '@/exprParsers.js'


export default {
  name: 'Method',
  components: {
    // PouchSpreadsheet,
  },
  props: {
    parentMethod: Object,
  },
  emits: ['saveItem', 'goToMain', 'deleteItem'],
  watch: {
    inputVars: {
      handler (val) {
        if (!this.method) return
        this.method.inputVars = val
        this.method.traits = this.method.traits || {}

      },
      // deep: true,
    },
  },
  data () {
    return {
      method: {},

    }
  },
  mounted () {
    this.method = JSON.parse(JSON.stringify(this.parentMethod))
    // console.log(this.method)
    this.method.template = this.method.template || ''
    this.method.formarters = this.method.formarters || []
  },
  methods: {
  },
  computed: {
    inputVars () {
      /*
      Determine from expression, whitch variables are expected to be
      provided by user 

      Returns an array
      */

      if (!this.method || !this.method.expr) return []

      return exprParsers.inputVars(this.method.expr)
    },
    allVars () {
      if (!this.method || !this.method.expr) return []
      return exprParsers.allVars(this.method.expr)
    },

  },
}
</script>

<style scoped>
textarea {
  font-family:Consolas,Monaco,Lucida Console,Liberation Mono,DejaVu Sans Mono,Bitstream Vera Sans Mono,Courier New, monospace;
}  
</style>