<template>
  <div class="hello">
    <div class="columns is-mobile" v-for="row in rows" :key="row.id">
      <div
        v-bind:class="
          {
            'focused-cell': selInfo.focus.id === cell.id,
            'selected-cell': selectRangeCellsIdsMap[cell.id] && selInfo.focus.id !== cell.id,
            
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
  <textarea @keydown="cellKeyDownHandler($event, {id: undefined})" ref="dummy"></textarea>
  <!-- <div>{{rangeSelected}}</div> -->
  <!-- <div>{{selectRange}}</div> -->
</template>

<script>

import {parseArrayString, stringifyArray} from "@/vendor/sheetclip.js";

export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  methods: {
    startEditingCell (cell) {
      this.editingCell = cell
      this.editingCellBackup = JSON.parse(JSON.stringify(this.editingCell))
      this.$nextTick(() => {
        this.$refs[cell.id].focus()
      })
    },
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
      // prevent loose focus
      if (event.target === this.$refs.dummy && event.key === 'Tab') event.preventDefault()

      const cellId = cell.id || this.selInfo.focus.id

      const cellLinks = this.cellLinksByCellIdMap[cellId]

      if (!cellLinks.id) return

      this.f2Bool = event.key === 'F2' || this.f2Bool

      // range select
      if (event.shiftKey && ['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].indexOf(event.key) !== -1) {
        let extendOriginCell = this.selInfo.end.id ? this.selInfo.end : cellLinks.self
        let candidateCell = {id: undefined}

        if (event.key === 'ArrowUp')    {candidateCell = this.cellLinksByCellIdMap[extendOriginCell.id].top     }
        if (event.key === 'ArrowDown')  {candidateCell = this.cellLinksByCellIdMap[extendOriginCell.id].bottom  }
        if (event.key === 'ArrowLeft')  {candidateCell = this.cellLinksByCellIdMap[extendOriginCell.id].left    }
        if (event.key === 'ArrowRight') {candidateCell = this.cellLinksByCellIdMap[extendOriginCell.id].right   }
        
        this.selInfo.end = candidateCell.id ? candidateCell : this.selInfo.end

        return
      } else {
        
        if (['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].indexOf(event.key) !== -1) {
          this.selInfo.end = {id: undefined}
        }
      }

      // handle ctrl key

      if (event.ctrlKey) {
        let selectedData = !this.rangeSelected ? [[this.selInfo.focus.val]] : this.rows.filter(row => {
          return row.cells.filter(cell => this.selectRangeCellsIdsMap[cell.id]).length
        }).map(row => row.cells.filter(cell => this.selectRangeCellsIdsMap[cell.id]).map(cell => cell.val))

        this.$refs.dummy.value = stringifyArray(selectedData)
        // when user press ctrl+c, will copy selected text
        this.$refs.dummy.select()

        if (event.key === 'v') {
          window.setTimeout(() => {
            let dataToPaste = parseArrayString(this.$refs.dummy.value)
            
            let parteOrigin = this.cellLinksByCellIdMap[this.selInfo.focus.id]
            
            dataToPaste.forEach(() => {
              
              console.log(this.rows[parteOrigin.row_i].cells[parteOrigin.cell_i])
            })

          }, 80)
        }
        return
      }

      // start editing current cell.
      if (event.key.length === 1 || event.key === 'F2') {

        this.startEditingCell(cellLinks.self)
        
        // if pressed key is a single character, clear input before focus
        if (event.key.length === 1) this.editingCell.val = ''

        return
      }

      if (event.key === 'ArrowUp') {
        if (cellLinks.top.id) {
          this.selInfo.focus = cellLinks.top
          this.selInfo.origin = cellLinks.top
          return
        }
      }

      if (event.key === 'ArrowDown') {
        if (cellLinks.bottom.id) {
          this.selInfo.focus = cellLinks.bottom
          this.selInfo.origin = cellLinks.bottom
          return
        }
      }

      if (event.key === 'ArrowLeft') {
        if (cellLinks.left.id) {
          this.selInfo.focus = cellLinks.left
          this.selInfo.origin = cellLinks.left
          return
        }
      }

      if (event.key === 'ArrowRight') {
        if (cellLinks.right.id) {
          this.selInfo.focus = cellLinks.right
          this.selInfo.origin = cellLinks.right

          return
        }
      }

      const cellIsOnRangeSelected = (cell) => {
        return this.selectRangeCellsIdsMap[cell.id]
      }

      if (event.key === 'Tab' && !event.shiftKey) {
        // on tab overflow get next line first cell
        // TODO: refactor to prevent similar code
        if (this.rangeSelected && !cellIsOnRangeSelected(cellLinks.right)) {
          
          // find cell to get focus when we press tab and goes to other line
          let candidateCell = this.selectedCellsLinkFlat
            .filter(link => link.row_i === cellLinks.row_i + 1)[0]

          if (candidateCell !== undefined) {
            // if reach end of row, go to first from next row
            this.selInfo.focus = candidateCell
          } else {
            // if reach end of selection, go to first
            this.selInfo.focus = this.selectedCellsLinkFlat[0]
          }
          return
        }
        if (cellLinks.right.id) {
          this.selInfo.focus = cellLinks.right
          return
        }
        return
      }
      
      if (event.key === 'Tab' && event.shiftKey) {
        // on tab overflow get pŕev line last cell
        // TODO: refactor to prevent similar code
        if (this.rangeSelected && !cellIsOnRangeSelected(cellLinks.left)) {
          
          // find cell to get focus when we press tab and goes to other line
          let candidatesCells = this.selectedCellsLinkFlat
            .filter(link => link.row_i === cellLinks.row_i - 1)
          let candidateCell = candidatesCells[candidatesCells.length-1]

          if (candidateCell !== undefined) {
            // if reach begin of row, go to last from prev row
            this.selInfo.focus = candidateCell
          } else {
            // if reach end of selection, go to first
            this.selInfo.focus = this.selectedCellsLinkFlat[this.selectedCellsLinkFlat.length-1]
          }
          return
        }
        if (cellLinks.left.id) {
          if (this.rangeSelected && !this.selectRangeCellsIdsMap[cellLinks.left.id]) return
          this.selInfo.focus = cellLinks.left
          return
        }
      }

      if (event.key === 'Enter' && event.shiftKey) {
        // on tab overflow get pŕev col last cell
        // TODO: refactor to prevent similar code
        if (this.rangeSelected && !cellIsOnRangeSelected(cellLinks.top)) {
          
          // find cell to get focus when we press tab and goes to other line
          let candidatesCells = this.selectedCellsLinkFlat
            .filter(link => link.cell_i === cellLinks.cell_i - 1)
          let candidateCell = candidatesCells[candidatesCells.length-1]

          if (candidateCell !== undefined) {
            // if reach begin of col, go to last from prev col
            this.selInfo.focus = candidateCell
          } else {
            // if reach end of selection, go to first
            this.selInfo.focus = this.selectedCellsLinkFlat[this.selectedCellsLinkFlat.length-1]
          }
          return
        }

        if (cellLinks.top.id) {
          this.selInfo.focus = cellLinks.top
          if (!this.rangeSelected) this.selInfo.origin = cellLinks.top
          return
        }
      }

      if (event.key === 'Enter' && !event.shiftKey) {
        // on tab overflow get next col first cell
        // TODO: refactor to prevent similar code
        if (this.rangeSelected && !cellIsOnRangeSelected(cellLinks.bottom)) {
          
          let candidateCell = this.selectedCellsLinkFlat
            .filter(link => link.cell_i === cellLinks.cell_i + 1)[0]

          if (candidateCell !== undefined) {
            // if reach end of col, go to first cell from next col
            this.selInfo.focus = candidateCell
          } else {
            // if reach end of selection, go to first
            this.selInfo.focus = this.selectedCellsLinkFlat[0]
          }
          return
        }
        if (cellLinks.bottom.id) {
          this.selInfo.focus = cellLinks.bottom
          if (!this.rangeSelected) this.selInfo.origin = cellLinks.bottom
          
          return
        }
      }
    },
    selectCell (event, cell) {

      if (event.type === 'click') {
        if (this.editingCell.id) return
        this.$refs.dummy.focus()
      }

      if (event.type === "mousedown") {

        // stop editing only if mousedown on other cell
        if (this.editingCell.id && event.target === this.$refs[this.selInfo.focus.id]) return
        
        if (event.timeStamp - this.mousedownTimeStamp <= 300) {
          this.mousedownTimeStamp = -Infinity
          event.preventDefault()
          // double click enable selecting text, the same as pressing f2
          this.f2Bool = true
          this.startEditingCell(cell)
        }
        
        this.mousedownTimeStamp = event.timeStamp


        this.$refs.dummy.focus()
        if (event.shiftKey) {
          this.selInfo.end = cell
          if (!this.selInfo.origin.id) {
            this.selInfo.focus = cell
            this.selInfo.origin = cell
          }
        } else {
          this.selInfo.end = {id: undefined}
          this.selInfo.focus = cell
          this.selInfo.origin = cell
        }
      }

      if (event.type === "mousemove") {
        if (this.editingCell.id) return
        if (event.buttons === 1) {
          this.selInfo.end = cell
          this.$refs.dummy.focus()
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
    rangeSelected () {
      if (!this.selInfo.end.id) return false
      return this.selInfo.origin.id !== this.selInfo.end.id
    },
    selectionRangeCoords () {
      if (!this.selInfo.origin.id || !this.selInfo.end.id) {
        return {
          startx: 0,
          starty: 0,
          endx: this.rows[0].cells.length,
          endy: this.rows.length,
        }
      }

      let originCellLinks = this.cellLinksByCellIdMap[this.selInfo.origin.id]
      let endCellLinks = this.cellLinksByCellIdMap[this.selInfo.end.id]

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
      if (!this.selInfo.end.id) return {}
      
      let {startx, starty, endx, endy} = this.selectionRangeCoords

      return this.cellLinksArrayFlat.filter(cell => {
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
            self:  cell,
            left:   cell_i ?                        row.cells[cell_i-1]               : {id: undefined},
            right:  cell_i < row.cells.length -1 ?  row.cells[cell_i+1]               : {id: undefined},
            top:    row_i ?                         this.rows[row_i-1].cells[cell_i]  : {id: undefined},
            bottom: row_i < this.rows.length -1 ?   this.rows[row_i+1].cells[cell_i]  : {id: undefined},
          })
        )
      ).flat()
    },
    cellLinksArrayFlat () {
      return this.cellLinksArray.flat()
    },
    cellLinksByCellIdMap () {
      return this.cellLinksArrayFlat
        .reduce((a, c) => (a[c.id] = c)&&a, {})
      ;
    },
    selectedCellsLinkFlat () {
      return this.cellLinksArrayFlat.filter(link => this.selectRangeCellsIdsMap[link.self.id])
    }
  },
  data () {
    return {
      mousedownTimeStamp: -Infinity,
      f2Bool: false,
      editingCell: {id: undefined},
      editingCellBackup: {id: undefined},
      selInfo: {
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
