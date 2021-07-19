<template>
  <div class="hello">
    {{selectRange.focus}}
    <div class="columns is-mobile" v-for="row in rows" :key="row.id">
      <div
        v-bind:class="
          {
            'focused-cell': selectRange.focus.id === cell.id,
            'selected-cell': selectRangeCellsIdsMap[cell.id] && selectRange.focus.id !== cell.id,
            
          }"
        class="column is-2 is-gapless p-0"
        @click="selectCell($event, cell)"
        @mousedown="selectCell($event, cell)"
        @mousemove="selectCell($event, cell)"
        @mouseup="selectCell($event, cell)"
        v-for="cell in row.cells"
        :key="cell.id"
        >
          <input
            @blur="stopCellEdit(cell)"
            @keydown="cellInputEventHandler($event, cell)"
            v-if="editingCell.id === cell.id"
            :ref="cell.id"
            class="cell-input"
            v-model="cell.val"
          >
          <span
            @keydown="cellKeyDownHandler($event, cell)"
            v-else>{{cell.val}}</span>
      </div>
    </div>
  </div>
  <br>
  <input @keydown.prevent="cellKeyDownHandler($event, {})" ref="dummy">
  <div>{{selectionRangeCoords}}</div>
  <div>{{selectRange}}</div>
</template>

<script>
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  methods: {
    cellInputEventHandler (event, cell) {

      this.f2Bool = event.key === 'F2' || this.f2Bool

      if (event.key === 'Escape') {
        this.editingCell = Object.assign(this.editingCell, this.editingCellBackup)
        this.f2Bool = false
        this.$refs.dummy.focus()
      }

      if ('Tab ArrowDown ArrowUp ArrowLeft ArrowRight Enter'.split(' ').indexOf(event.key) !== -1) {

        if (this.f2Bool && ['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].indexOf(event.key) !== -1) {
          return
        }

        this.f2Bool = false

        // prevent loosing focus
        if (event.key === 'Tab') event.preventDefault()
        this.$refs.dummy.focus()
        this.cellKeyDownHandler(event, cell)
      }
    },
    cellKeyDownHandler (event, cell) {

      const cellId = cell.id || this.selectRange.focus.id

      const cellLinks = this.cellLinksByIdMap[cellId]

      if (!cellLinks.id) return

      this.f2Bool = event.key === 'F2' || this.f2Bool

      // range select
      if (event.shiftKey && ['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].indexOf(event.key) !== -1) {
        let extendOriginCell = this.selectRange.end.id ? this.selectRange.end : cellLinks.focus
        let candidateCell = {id: undefined}

        if (event.key === 'ArrowUp')    {candidateCell = this.cellLinksByIdMap[extendOriginCell.id].top     }
        if (event.key === 'ArrowDown')  {candidateCell = this.cellLinksByIdMap[extendOriginCell.id].bottom  }
        if (event.key === 'ArrowLeft')  {candidateCell = this.cellLinksByIdMap[extendOriginCell.id].left    }
        if (event.key === 'ArrowRight') {candidateCell = this.cellLinksByIdMap[extendOriginCell.id].right   }
        
        this.selectRange.end = candidateCell.id ? candidateCell : this.selectRange.end

        return
      } else {
        
        if (['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].indexOf(event.key) !== -1) {
          this.selectRange.end = {id: undefined}
        }
      }


      // start editing current cell.
      // If pressed key is a single character, set input
      if (event.key.length === 1 || (['F2'].indexOf(event.key) !== -1)) {

        this.editingCell = cellLinks.focus
        this.editingCellBackup = JSON.parse(JSON.stringify(this.editingCell))
        
        if (event.key.length === 1) this.editingCell.val = event.key

        this.$nextTick(() => {
          this.$refs[cellLinks.id].focus()
        })
        return
      }

      if (event.key === 'ArrowUp') {
        if (cellLinks.top.id) {
          this.selectRange.focus = cellLinks.top
          this.selectRange.origin = cellLinks.top
          return
        }
      }

      if (event.key === 'ArrowDown') {
        if (cellLinks.bottom.id) {
          this.selectRange.focus = cellLinks.bottom
          this.selectRange.origin = cellLinks.bottom
          return
        }
      }

      if (event.key === 'ArrowLeft') {
        if (cellLinks.left.id) {
          this.selectRange.focus = cellLinks.left
          this.selectRange.origin = cellLinks.left
          return
        }
      }

      if (event.key === 'ArrowRight') {
        if (cellLinks.right.id) {
          this.selectRange.focus = cellLinks.right
          this.selectRange.origin = cellLinks.right

          return
        }
      }

      if (event.key === 'Tab' && !event.shiftKey) {
        if (cellLinks.right.id) {
          this.selectRange.focus = cellLinks.right
          return
        }
      }
      
      if (event.key === 'Tab' && event.shiftKey) {
        if (cellLinks.left.id) {
          this.selectRange.focus = cellLinks.left
          return
        }
      }

      if (event.key === 'Enter' && event.shiftKey) {
        if (cellLinks.top.id) {
          this.selectRange.focus = cellLinks.top
          return
        }
      }

      if (event.key === 'Enter' && !event.shiftKey) {
        if (cellLinks.bottom.id) {
          this.selectRange.focus = cellLinks.bottom
          return
        }
      }
    },
    selectCell (event, cell) {

      
      if (event.type === "mousemove") {
        if (event.buttons === 1) {
          this.selectRange.end = cell
          this.$refs.dummy.focus()
        }
      }

      if (event.type === 'click') {
        this.$refs.dummy.focus()
      }

      if (event.type === "mousedown") {
        this.$refs.dummy.focus()
        if (event.shiftKey) {
          this.selectRange.end = cell
          if (!this.selectRange.origin.id) {
            this.selectRange.focus = cell
            this.selectRange.origin = cell
          }
        } else {
          this.selectRange.end = {id: undefined}
          this.selectRange.focus = cell
          this.selectRange.origin = cell
        }
      }
    },
    stopCellEdit (cell) {
      if (this.editingCell.id === cell.id) {
        this.editingCell = {id: undefined}
      }
    },
  },
  computed: {
    selectionRangeCoords () {
      if (!this.selectRange.origin.id || !this.selectRange.end.id) {
        return {
          startx: 0,
          starty: 0,
          endx: this.rows[0].cells.length,
          endy: this.rows.length,
        }
      }

      let originCellLinks = this.cellLinksByIdMap[this.selectRange.origin.id]
      let endCellLinks = this.cellLinksByIdMap[this.selectRange.end.id]

      let startx = Math.min(originCellLinks.cell_i, endCellLinks.cell_i)
      let endx = Math.max(originCellLinks.cell_i, endCellLinks.cell_i)

      let starty = Math.min(originCellLinks.row_i, endCellLinks.row_i)
      let endy = Math.max(originCellLinks.row_i, endCellLinks.row_i)
      
      return {
        startx: startx,
        starty: starty,
        endx: endx,
        endy: endy,
      }

    },
    selectRangeCellsIdsMap () {
      if (!this.selectRange.end.id) return {}
      
      let {startx, starty, endx, endy} = this.selectionRangeCoords

      return this.cellLinksArray.filter(cell => {
        return cell && cell.row_i >= starty && cell.row_i <= endy && cell.cell_i >= startx && cell.cell_i <= endx
      }).reduce((a, c) => (a[c.id]=true)&&a, {})
    },
    cellLinksArray () {
      return this.rows.map((row, row_i) => 
        row.cells.map((cell, cell_i) => 
          Object({
            id:     cell.id,
            row_i:  row_i,
            cell_i: cell_i,
            focus:  cell,
            left:   cell_i ?                        row.cells[cell_i-1]               : {id: undefined},
            right:  cell_i < row.cells.length -1 ?  row.cells[cell_i+1]               : {id: undefined},
            top:    row_i ?                         this.rows[row_i-1].cells[cell_i]  : {id: undefined},
            bottom: row_i < this.rows.length -1 ?   this.rows[row_i+1].cells[cell_i]  : {id: undefined},
          })
        )
      ).flat()
    },
    // focusMovementCellLinksArray () {
    //   return this.cellLinksArray.filter(link => {
    //     return link.row_i >= this.selectionRangeCoords.starty &&
    //       link.row_i <= this.selectionRangeCoords.endy &&
    //       link.cell_i >= this.selectionRangeCoords.startx &&
    //       link.cell_i <= this.selectionRangeCoords.endy
    //   })
    // },
    cellLinksByIdMap () {
      return this.cellLinksArray
        .reduce((a, c) => (a[c.id] = c)&&a, {})
      ;
    }
  },
  data () {
    return {
      f2Bool: false,
      editingCell: {id: undefined},
      editingCellBackup: {id: undefined},
      selectRange: {
        origin: {id: undefined},
        focus: {id: undefined},
        end: {id: undefined},
      },
      rows: [
        {
          id: '123',
          cells: [
            {
              id: '1',
              val: 'a'
            },
            {
              id: '2',
              val: 'b'
            },
            {
              id: '3',
              val: 'bk'
            }

          ]
        },
        {
          id: '456',
          cells: [
            {
              id: '4',
              val: 'c'
            },
            {
              id: '5',
              val: 'd'
            },
            {
              id: '6',
              val: 'dx'
            }
          ]
        },
        {
          id: '789',
          cells: [
            {
              id: '7',
              val: 'c'
            },
            {
              id: '8',
              val: 'd'
            },
            {
              id: '9',
              val: 'dx'
            }
          ]
        },
      ]
    }
  }
}
</script>

<style scoped>
  .cell-input {
    width: 100%;
  }
  .selected-cell {
    background: #00ffff69;
  }
  .focused-cell {
    background: aqua;
  }
</style>
