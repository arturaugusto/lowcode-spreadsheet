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

        <p class="title is-4">Variables features</p>

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



        <!-- Content ... -->
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

export default {
  name: 'Method',
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
  },
}
</script>