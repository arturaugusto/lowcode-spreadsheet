<template>
  <div>
    <div class="columns is-mobile" v-bind:class="row.class" v-for="row in matrixVisible" :key="row.id">
      <div
        v-bind:class="{
          'focused-cell': selInfo.focus.id === cell.id,
          'selected-cell': selectRangeCellsIdsMap[cell.id] && selInfo.focus.id !== cell.id,
        }"
        class="column is-gapless p-0 ss-cell"
        @click="selectCell($event, cell)"
        @mousedown="selectCell($event, cell)"
        @mousemove="selectCell($event, cell)"
        @mouseup="selectCell($event, cell)"
        v-for="cell in row.cells"
        :key="cell.id"
        :ref="cell.id+'_cell'"
      >
        <input
          @keydown="cellInputEventHandler($event, cell)"
          v-if="editingCell.id === cell.id"
          class="cell-input"
          :ref="cell.id"
        >
          <!-- @blur="stopCellEdit($event, cell)" -->
        <div
          @keydown="cellKeyDownHandler($event, cell)"
          v-else>{{cell.val}}
        </div>
      </div>
    </div>
  </div>
  <textarea class="dummy-text-area" @keydown="cellKeyDownHandler($event, {id: undefined})" ref="dummy"></textarea>
  <!-- <textarea ref="blah"></textarea> -->
  <!-- <pre>{{events}}</pre> -->
  <!-- <div>{{selectRange}}</div> -->
</template>

<script>

import {parseArrayString, stringifyArray} from "@/vendor/sheetclip.js";

var randStr = (n) => {
  return new Array(n||10)
    .fill()
    .map(() => {
      let x = (Math.round(Math.random()*35)).toString(36)
      return Math.random() > 0.5 ? x.toUpperCase() : x }
    ).join('')
}


var timeToId = (isoString) => {
  isoString = isoString || new Date().toISOString()
  let [dt, tz] = isoString.split('.')
  return dt.replace(/[-T:]+/g, '')
    .match(/.{2}/g)
    .map(parseFloat)
    .map(x => x < 10 ? (x+10).toString(36).toUpperCase() :
      x <= 25 ? (x+10).toString(36).toUpperCase() : (x-26).toString(36)
    ).join('') + tz.slice(0,3)
}


var cumulativeOffset = function(element) {
    var top = 0, left = 0;
    do {
        top += element.offsetTop  || 0;
        left += element.offsetLeft || 0;
        element = element.offsetParent;
    } while(element);

    return {
        top: top,
        left: left
    };
};

export default {
  name: 'HelloWorld',
  props: {
    schema: Object,
    initEvents: Array,
  },
  watch: {
    'selInfo.focus': function () {
      let dummyEl = this.$refs.dummy
      let cellEl = this.$refs[this.selInfo.focus.id+'_cell']
      dummyEl.style['top'] = ''+cellEl.offsetTop+'px'
      dummyEl.focus()
      
      let cumulativeOffsetTop = cumulativeOffset(dummyEl).top
      let diff = cumulativeOffsetTop - window.scrollY
      if (diff < 0) {
        window.scrollTo(0, cumulativeOffsetTop)
      }
      if (diff > window.innerHeight) {
        // the 0.8 avoid a glitch when scroll down
        window.scrollTo(0, cumulativeOffsetTop - window.innerHeight + cellEl.clientHeight*0.8)
      }

    },
    cols: function () {
      let event = this.createChangeColsEvent()
      this.doEvent(event)
    }
  },
  created () {
    
  },
  mounted () {
    if (this.initEvents && this.initEvents.length) {
      this.events = this.initEvents
      this.events.forEach(() => {
        this.redo()
      })
    } else {
      this.insertRow(0)
    }
  },
  methods: {
    doChangeCols (item) {
      let rowMatch = this.rows.filter(row => row.id === item[0])[0]
      if (rowMatch) {
        rowMatch.cells.push({id: item[1], col: item[2]})
      }
    },
    createChangeColsEvent () {
      return Object({
        'changeCols': this.rows.map(row => 
          this.cols.filter(colName => 
            row.cells.map(cell => cell.col).indexOf(colName) === -1
          )
          .map(colName => [row.id, randStr(8), colName])
        ).flat()
      })
    },
    insertRow (pos) {
      let rowsDoAdd = 1
      let newData = new Array(rowsDoAdd).fill().map(() => Object({
        id: randStr(8),
        cells: [],
      }))
      
      let start = pos !== undefined ? pos : this.selectionRangeCoords.starty
      
      let insertRowEvent = {'splice': [start, 0, newData]}
      this.doEvent(insertRowEvent)

      let changeColsEvent = this.createChangeColsEvent()
      this.doEvent(changeColsEvent)

      let event = Object.assign(insertRowEvent, changeColsEvent)
      this.addEvent(event)
    },
    doEvent (event) {
      if (event['change']) {
        event['change'].forEach(item => {
          let cell = this.cellLinksByCellIdMap[item[0]].self
          cell.val = item[2]
        })
      }
      if (event['splice']) {
        this.rows.splice(event['splice'][0], 0, ...event['splice'][2])
      }
      if (event['changeCols']) {
        event['changeCols'].forEach(this.doChangeCols)
      }
    },
    redo () {
      if (this.eventIndex === this.events.length) return
      let event = this.events[this.eventIndex].e
      this.doEvent(event)
      this.eventIndex = this.eventIndex + 1
    },
    undo () {
      if (this.eventIndex <= 1) return
      let event = this.events[this.eventIndex - 1].e
      if (event['change']) {
        event['change'].forEach(item => {
          let cell = this.cellLinksByCellIdMap[item[0]].self
          cell.val = item[1]
        })
      }

      if (event['splice']) {
        this.rows.splice(event['splice'][0], event['splice'][2].length)
      }

      if (event['changeCols']) {
        event['changeCols'].forEach(item => {
          let rowMatch = this.rows.filter(row => row.id === item[0])[0]
          if (rowMatch) {
            rowMatch.cells = rowMatch.cells.filter(cell => cell.col !== item[2])
          }
        })
        this.rows = this.rows.filter(row => row.cells.length)
        if (!this.rows.length) {
          this.redo()
        }
      }

      this.eventIndex = this.eventIndex - 1
    },
    addEvent (event) {
      this.events.splice(this.eventIndex)
      this.events.push({id: timeToId()+randStr(2), e: event})
      // this.$refs['blah'].value = JSON.stringify(this.events)
      // console.log(this.events)
      this.eventIndex = this.events.length
    },
    startEditingCell (cell) {
      this.editingCell = cell
      this.editingCellBackup = JSON.parse(JSON.stringify(this.editingCell))
      this.$nextTick(() => {
        this.$refs[cell.id].value = cell.val||''
        this.$refs[cell.id].focus()
      })
    },
    cellInputEventHandler (event, cell) {

      this.f2Bool = event.key === 'F2' || this.f2Bool
      
      if (event.key === 'Escape') {
        this.editingCell = Object.assign(this.editingCell, this.editingCellBackup)
        this.f2Bool = false
        this.editingCell = {id: undefined}
        this.$refs.dummy.focus()
      }


      if ('Tab ArrowDown ArrowUp ArrowLeft ArrowRight Enter'.split(' ').indexOf(event.key) !== -1) {
        

        if (this.f2Bool && ['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].indexOf(event.key) !== -1) {
          return
        }

        // handle when user type someting with a cell focus
        if (this.editingCell.id === cell.id) {
          cell.val = event.target.value
          if (event.target.value !== this.editingCellBackup.val) {
            this.addEvent({'change': [[this.editingCell.id, this.editingCellBackup.val, event.target.value]]})
          }
          this.editingCell = {id: undefined}
        }

        this.f2Bool = false

        // prevent loosing focus
        if (event.key === 'Tab') event.preventDefault()
        this.editingCell = {id: undefined}
        this.$refs.dummy.focus()
        this.cellKeyDownHandler(event, cell)
      }

    },
    cellKeyDownHandler (event, cell) {
      // prevent loose focus
      if (event.target === this.$refs.dummy && event.key === 'Tab') event.preventDefault()

      const cellId = cell.id || this.selInfo.focus.id

      const cellLinks = this.cellLinksByCellIdMap[cellId]

      if (!cellLinks || !cellLinks.id) return

      this.f2Bool = event.key === 'F2' || this.f2Bool

      // range select
      if (['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Home'].indexOf(event.key) !== -1) {
        let originCell
        if (event.shiftKey) {
          originCell = this.rangeSelected ? this.selInfo.end : this.selInfo.focus
        } else {
          originCell = this.selInfo.focus
        }

        if (event.ctrlKey || event.key === 'Home') {
          for (var i = 0; i < 1000; i++) {
            let candidateCell = {id: undefined}

            if (event.key === 'ArrowUp') {
              candidateCell = this.cellLinksByCellIdMap[originCell.id].top
            }
            if (event.key === 'ArrowDown') {
              candidateCell = this.cellLinksByCellIdMap[originCell.id].bottom
            }
            if (event.key === 'ArrowLeft' || event.key === 'Home') {
              candidateCell = this.cellLinksByCellIdMap[originCell.id].left
            }
            if (event.key === 'ArrowRight') {
              candidateCell = this.cellLinksByCellIdMap[originCell.id].right
            }
            if (candidateCell.id) {
              if (event.key !== 'Home') {
                if (candidateCell.val && !originCell.val) {
                  originCell = candidateCell
                  break
                }
                if (!candidateCell.val && originCell.val && i !== 0) {
                  break
                }
              }
              originCell = candidateCell
            } else break

          }

          if (event.shiftKey) {
            this.selInfo.end = originCell
          } else {
            this.selInfo.focus = originCell
            this.selInfo.end = {id: undefined}
            this.selInfo.origin = originCell
          }
          return
        }

        if (event.shiftKey) {
          let extendOriginCell = this.selInfo.end.id ? this.selInfo.end : cellLinks.self
          let candidateCell = {id: undefined}

          if (event.key === 'ArrowUp') {
            candidateCell = this.cellLinksByCellIdMap[extendOriginCell.id].top
          }
          if (event.key === 'ArrowDown') {
            candidateCell = this.cellLinksByCellIdMap[extendOriginCell.id].bottom
          }
          if (event.key === 'ArrowLeft' || event.key === 'Home') {
            candidateCell = this.cellLinksByCellIdMap[extendOriginCell.id].left
          }
          if (event.key === 'ArrowRight') {
            candidateCell = this.cellLinksByCellIdMap[extendOriginCell.id].right
          }
          this.selInfo.end = candidateCell.id ? candidateCell : this.selInfo.end
          return
        } else {
          this.selInfo.end = {id: undefined}
        }
      }

      // handle delete
      if (event.key === 'Delete' || event.key === 'Backspace') {
        if (!this.rangeSelected) {
          this.addEvent({'change': [[this.selInfo.focus.id, this.selInfo.focus.val, '']]})
          this.selInfo.focus.val = ''
        } else {
          let changes = this.selectedCellsLinkFlat.map(item => {
            let change = [item.id, item.self.val, '']
            item.self.val = ''
            return change
          })
          this.addEvent({'change': changes})
        }
      }

      // handle ctrl key
      if (event.key === 'z' && event.ctrlKey) {
        this.undo()
      }
      
      if (event.key === 'y' && event.ctrlKey) {
        this.redo()
      }

      if (event.ctrlKey) {
        
        if (event.key === 'i') {
          this.insertRow()
          return
        }

        let selectedData = !this.rangeSelected ?
          [[this.selInfo.focus.val]] :
          this.matrixVisible.filter(row => {
            return row.cells.filter(cell => this.selectRangeCellsIdsMap[cell.id]).length
          })
          .map(row => row.cells.
            filter(cell => this.selectRangeCellsIdsMap[cell.id])
            .map(cell => cell.val)
          )

        this.$refs.dummy.value = stringifyArray(selectedData)
        
        // when user press ctrl+c, will copy selected text
        this.$refs.dummy.select()

        if (event.key === 'v') {
          window.setTimeout(() => {
            let dataToPaste = parseArrayString(this.$refs.dummy.value)
            
            let pointer = this.rangeSelected ?
              this.selectedCellsLinkFlat[0] : this.cellLinksByCellIdMap[this.selInfo.origin.id]
            
            // Check if we shoud repeate data on selected paste area
            if (this.rangeSelected) {

              let pasteHeigth = this.rangeSelected ?
                this.selectionRangeCoords.endy - this.selectionRangeCoords.starty + 1 : 1

              let pasteWidth = this.rangeSelected ?
                this.selectionRangeCoords.endx - this.selectionRangeCoords.startx + 1 : 1

              let widthRepeat = Math.floor(pasteWidth/dataToPaste[0].length)
              let heigthRepeat = Math.floor(pasteHeigth/dataToPaste.length)
              
              // repeat cell inside rows
              dataToPaste = dataToPaste.map((row) => {
                return new Array(row.length * widthRepeat).fill(undefined).map((_,i) => row[i%row.length])
              })

              // repeat rows
              dataToPaste = new Array(dataToPaste.length * heigthRepeat).fill(undefined).map((_,i) => dataToPaste[i%dataToPaste.length])              
            }

            // iterate over data to set values
            this.selInfo.focus = pointer.self
            this.selInfo.origin = pointer.self
            let changes = dataToPaste.map(row => {
              if (!pointer) return
              let rowOriginId = pointer.self.id
              let rowChanges = row.map(val => {
                if (!pointer) return
                let change = [pointer.self.id, pointer.self.val, val]
                pointer.self.val = val

                // paint the pasted cells
                this.selInfo.end = pointer.self
                
                pointer = this.cellLinksByCellIdMap[pointer.right.id]
                return change
              })
              pointer = undefined
              if (this.cellLinksByCellIdMap[rowOriginId].bottom.id) {
                let bottomId = this.cellLinksByCellIdMap[rowOriginId].bottom.id
                pointer = this.cellLinksByCellIdMap[bottomId]
              }
              return rowChanges
            }).flat().filter(Boolean)
            this.addEvent({'change': changes})

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
        if (!this.rangeSelected) this.selInfo.end = {}
        // on tab overflow get next line first cell
        // TODO: refactor to prevent similar code
        if (this.rangeSelected && !cellIsOnRangeSelected(cellLinks.right) || !this.rangeSelected && !cellLinks.right.id) {
          // if (!this.rangeSelected) this.selInfo.end = {}
          // find cell to get focus when we press tab and goes to other line
          let cellsLinksSource = (this.rangeSelected ? this.selectedCellsLinkFlat : this.cellLinksArrayFlat)
          let candidateCellLink = cellsLinksSource
            .filter(link => link.row_i === cellLinks.row_i + 1)[0]

          if (candidateCellLink !== undefined) {
            // if reach end of row, go to first from next row
            this.selInfo.focus = candidateCellLink.self
          } else {
            // if reach end of selection, go to first
            this.selInfo.focus = cellsLinksSource[0].self
          }
          if (!this.rangeSelected) this.selInfo.origin = this.selInfo.focus
          return
        }
        if (cellLinks.right.id) {
          this.selInfo.focus = cellLinks.right
          if (!this.rangeSelected) this.selInfo.origin = this.selInfo.focus
          return
        }
        return
      }
      
      if (event.key === 'Tab' && event.shiftKey) {
        if (!this.rangeSelected) this.selInfo.end = {}
        // on tab overflow get pŕev line last cell
        // TODO: refactor to prevent similar code
        if (this.rangeSelected && !cellIsOnRangeSelected(cellLinks.left) || !this.rangeSelected && !cellLinks.left.id) {
          
          // find cell to get focus when we press tab and goes to other line
          let cellsLinksSource = (this.rangeSelected ? this.selectedCellsLinkFlat : this.cellLinksArrayFlat)
          let candidatesCells = cellsLinksSource
            .filter(link => link.row_i === cellLinks.row_i - 1)
          let candidateCellLink = candidatesCells[candidatesCells.length-1]

          if (candidateCellLink !== undefined) {
            // if reach begin of row, go to last from prev row
            this.selInfo.focus = candidateCellLink.self
          } else {
            // if reach end of selection, go to first
            this.selInfo.focus = cellsLinksSource[cellsLinksSource.length-1].self
          }
          if (!this.rangeSelected) this.selInfo.origin = this.selInfo.focus
          return
        }
        if (cellLinks.left.id) {
          if (this.rangeSelected && !this.selectRangeCellsIdsMap[cellLinks.left.id]) return
          this.selInfo.focus = cellLinks.left
          if (!this.rangeSelected) this.selInfo.origin = this.selInfo.focus
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
          let candidateCellLink = candidatesCells[candidatesCells.length-1]

          if (candidateCellLink !== undefined) {
            // if reach begin of col, go to last from prev col
            this.selInfo.focus = candidateCellLink.self
          } else {
            // if reach end of selection, go to first
            this.selInfo.focus = this.selectedCellsLinkFlat[this.selectedCellsLinkFlat.length-1].self
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
          
          let candidateCellLink = this.selectedCellsLinkFlat
            .filter(link => link.cell_i === cellLinks.cell_i + 1)[0]

          if (candidateCellLink !== undefined) {
            // if reach end of col, go to first cell from next col
            this.selInfo.focus = candidateCellLink.self
          } else {
            // if reach end of selection, go to first
            this.selInfo.focus = this.selectedCellsLinkFlat[0].self
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
        if (this.editingCell.id && event.target === this.$refs[this.selInfo.focus.id]) {
          return
        }

        // when is editing and click on other cell
        if (this.$refs[this.editingCell.id]) {
          let inputVal = this.$refs[this.editingCell.id].value
          this.cellLinksByCellIdMap[this.editingCell.id].self.val = inputVal
        }

        this.editingCell = {id: undefined}
        
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
    }
  },
  computed: {
    cols () {
      return this.schema.cols.map(col => col.name)
        .concat(this.rows.map(row => row.cells.map(cell => cell.col)))
        .flat()
        .reduce((a, c) => a.indexOf(c) !== -1 ? a : a.push(c)&&a, [])
    },
    matrixVisible () {
      return this.rows.map((row, row_i) => {
        let cells = this.cols.map(col => row.cells
          .filter(x => col === x.col)
          .sort((a, b) => b.id.localeCompare(a.id))[0] // get cell with last id
        )
        
        // create el class based on data
        let elClassMap = cells.reduce((a, c) => {
          a['ss-row-has-'+c.col+'-data'] = Boolean(c.val)
          // a[c.col]=c.val
          return a
        }, {})


        return Object({
          cells: cells,
          id: row.id,
          class: Object.assign({
            'ss-row': true,
            'ss-first-row': row_i === 0,
            'ss-last-row': row_i === this.rows.length - 1,
            'ss-has-data': cells.map(cell => cell.val).filter(Boolean).reduce((a, c) => a || c, false),

          }, elClassMap)
        })


      })
    },
    rangeSelected () {
      if (!this.selInfo.end.id) return false
      return this.selInfo.origin.id !== this.selInfo.end.id
    },
    selectionRangeCoords () {
      if (!this.selInfo.origin.id || !this.selInfo.end.id) {
        let focus = this.cellLinksByCellIdMap[this.selInfo.focus.id]
        return {
          startx: focus.cell_i,
          starty: focus.row_i,
          endx: focus.cell_i,
          endy: focus.row_i,
        }
      }

      let originCellLinks = this.cellLinksByCellIdMap[this.selInfo.origin.id]
      let endCellLinks = this.cellLinksByCellIdMap[this.selInfo.end.id]

      let startx, endx, starty, endy
      if (!originCellLinks || !endCellLinks) {
        startx = 0
        endx = 0
      } else {
        startx = Math.min(originCellLinks.cell_i, endCellLinks.cell_i)
        endx = Math.max(originCellLinks.cell_i, endCellLinks.cell_i)

        starty = Math.min(originCellLinks.row_i, endCellLinks.row_i)
        endy = Math.max(originCellLinks.row_i, endCellLinks.row_i)
      }
      
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
      return this.matrixVisible.map((row, row_i) => 
        row.cells.map((cell, cell_i) => 
          Object({
            id:     cell.id,
            row_i:  row_i,
            cell_i: cell_i,
            self:  cell,
            left:   cell_i ?                        row.cells[cell_i-1]               : {id: undefined},
            right:  cell_i < row.cells.length -1 ?  row.cells[cell_i+1]               : {id: undefined},
            top:    row_i ?                         this.matrixVisible[row_i-1].cells[cell_i]  : {id: undefined},
            bottom: row_i < this.matrixVisible.length -1 ?   this.matrixVisible[row_i+1].cells[cell_i]  : {id: undefined},
          })
        )
      )
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
      eventIndex: 0,
      events: [],
      mousedownTimeStamp: -Infinity,
      f2Bool: false,
      editingCell: {id: undefined},
      editingCellBackup: {id: undefined},
      selInfo: {
        origin: {id: undefined},
        focus: {id: undefined},
        end: {id: undefined},
      },
      rows: []
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

  .dummy-text-area {
    position: absolute;
    left: -10000px;
    z-index: -10;
  }

</style>
