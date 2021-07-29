<template>
  <section class="section">
    <input v-model="cols">
    <div class="container">
      <HelloWorld :schema="{
        'cols': cols.split(',').map((x) => Object({name: x}))
      }"/>
    </div>
  </section>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'

export default {
  name: 'App',
  components: {
    HelloWorld
  },
  mounted () {
    window.setTimeout(() => {
      this.cols += ',C,D'
    }, 2000)
  },
  data () {
    return {
      cols: 'A,B'
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
