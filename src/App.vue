<template>
  <section class="section">
    <div class="container">
      <HelloWorld
        :schema="{'cols': cols.split(',').map((x) => Object({name: x}))}"
        :initEvents="events"
      />
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
      this.cols += ',C,E'
    }, 2000)
  },
  data () {
    return {
      cols: 'A,B',
      events: [{"id":"UVIBRGT604Rf","e":{"splice":[0,0,[{"id":"pKr7tvyL","cells":[{"id":"I4Bzuljj","col":"A","val":""},{"id":"UAZo3x7C","col":"B"},{"id":"pIdu0C30","col":"C"},{"id":"nIQjY9n9","col":"D"}]}]],"changeCols":[["pKr7tvyL","I4Bzuljj","A"],["pKr7tvyL","UAZo3x7C","B"]]}},{"id":"UVIBRG3483wZ","e":{"splice":[0,0,[{"id":"MhMAg4vK","cells":[{"id":"yy25CLrO","col":"A","val":"1"},{"id":"ykgKo8Tb","col":"B","val":"2"},{"id":"ruQ4issn","col":"C","val":"3"},{"id":"Qo490eE1","col":"D"}]}]],"changeCols":[["MhMAg4vK","yy25CLrO","A"],["MhMAg4vK","ykgKo8Tb","B"],["MhMAg4vK","ruQ4issn","C"],["MhMAg4vK","Qo490eE1","D"]]}},{"id":"UVIBRG3648xd","e":{"splice":[1,0,[{"id":"YIS2NLh9","cells":[{"id":"d4JzCpXZ","col":"A","val":"4"},{"id":"1oPNj0Rl","col":"B","val":"5"},{"id":"F22M5bf3","col":"C","val":"6"},{"id":"19XTUhhf","col":"D"}]}]],"changeCols":[["YIS2NLh9","d4JzCpXZ","A"],["YIS2NLh9","1oPNj0Rl","B"],["YIS2NLh9","F22M5bf3","C"],["YIS2NLh9","19XTUhhf","D"]]}},{"id":"UVIBRG3798kI","e":{"splice":[2,0,[{"id":"eU9no7kE","cells":[{"id":"fdCp3AN6","col":"A"},{"id":"MPKxLJQ3","col":"B","val":"7"},{"id":"IPwzJhta","col":"C","val":"8"},{"id":"kiR3Hdty","col":"D"}]}]],"changeCols":[["eU9no7kE","fdCp3AN6","A"],["eU9no7kE","MPKxLJQ3","B"],["eU9no7kE","IPwzJhta","C"],["eU9no7kE","kiR3Hdty","D"]]}},{"id":"UVIBRG7002zu","e":{"change":[["yy25CLrO",null,"1"]]}},{"id":"UVIBRG7317e3","e":{"change":[["ykgKo8Tb",null,"2"]]}},{"id":"UVIBRG7778W7","e":{"change":[["ruQ4issn",null,"3"]]}},{"id":"UVIBRGa2464a","e":{"change":[["d4JzCpXZ",null,"4"]]}},{"id":"UVIBRGa677o0","e":{"change":[["1oPNj0Rl",null,"5"]]}},{"id":"UVIBRGb6058s","e":{"change":[["F22M5bf3",null,"6"]]}},{"id":"UVIBRGe473B4","e":{"change":[["MPKxLJQ3",null,"7"]]}},{"id":"UVIBRGf199Vl","e":{"change":[["IPwzJhta",null,"8"]]}}]
    }
  }
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

.ss-cell {
  /*min-width: 30%;*/
  height: 30px;
  border-top:1px solid black;
  border-left:1px solid black;
}

.ss-last-row {
  border-bottom:1px solid black;
}

.ss-row-has-A-data {

}

</style>
