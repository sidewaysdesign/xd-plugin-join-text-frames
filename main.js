/*
 * Join multiple text frames into a single frame.
 *
 * Visit http://adobexdplatform.com/ for API docs and more sample code.
 */

const { remapStyleSet, regroupEqualSeries, charLocations } = require('./lib/remap-styleranges')
const { Text } = require('scenegraph')
let commands = require('commands')
const { error } = require('./lib/dialogs.js')
const { getSplitDialog, createSplitDialog, handleSplitSubmit } = require('/lib/dialogs-split')
const { getSettings, saveSettings, readSettings } = require('./lib/preferences')

const fs = require('uxp').storage.localFileSystem
const defaultSettings = {
  split: {
    direction: 'vertical',
    makestack: true
  }
}
function joinTextFramesFunction(selection) {
  let allFrames = extractTextFrames(selection.items)
  if (notValidJoinSelection(allFrames)) return
  allFrames = sortByAxis(sortByAxis(allFrames, 'x'), 'y')
  const anchorFrame = allFrames[0]
  transformOffsetNode(anchorFrame, minAxisValue(allFrames, 'x'), minAxisValue(allFrames, 'y'))
  mergeIntoAnchorFrame(anchorFrame, joinTextContent(allFrames), widestFrameValue(allFrames))
  cleanUp(allFrames, selection.items)
}

async function splitTextFramesFunction(selection) {
  const selectedTextFrames = extractTextFrames(selection.items)
  if (notValidSplitSelection(selectedTextFrames)) return

  const params = await getSplitParameters()
  if (!params) return // User canceled

  const insertionPoint = selection.insertionParent
  const rootTextFrame = selectedTextFrames[0]
  const rootStyles = rootTextFrame.styleRanges
  console.log('ORIG', rootStyles[0])
  const rootCtrInParent = rootTextFrame.transform.transformPoint(rootTextFrame.localCenterPoint)

  const dividerChar = '|'
  const textContent = rootTextFrame.text
  const splitArray = textContent.split(dividerChar)
  const dividerwidth = getDividerWidth(dividerChar, rootStyles, insertionPoint)
  // create new series of text frames based on style
  const remappedStyleRanges = remapStyleSet(rootStyles, textContent, dividerChar)
  console.log('remappedStyleRanges-->', remappedStyleRanges[0])
  const splitFrames = splitArray.map((a, index) => {
    const node = new Text()
    node.text = a
    node.type = params.splitdirection === 'horizontal' ? 'autoWidth' : 'autoHeight'
    node.height = rootTextFrame.localBounds.height
    node.styleRanges = remappedStyleRanges[index]
    // if split horizontal
    node.placeInParentCoordinates(rootTextFrame.localCenterPoint, { x: rootCtrInParent.x, y: rootCtrInParent.y })
    insertionPoint.addChild(node)
    return node
  })
  // collect widths of each text element
  const framesWidthArray = splitFrames.map((a, i) => a.boundsInParent.width)
  // filter offset values for each along selected axis
  const offsetArray = framesWidthArray.map((a, i) => framesWidthArray.slice(0, i).reduce((a, c) => a + c + dividerwidth, 0))
  // transform frames along selected axis
  splitFrames.forEach((a, i) => {
    a.moveInParentCoordinates(offsetArray[i], 0)
  })
  rootTextFrame.removeFromParent()
  //   console.log(offsetArray)
}
function splitStyleRange() {}
function getDividerWidth(dividerChar, rootStyles, insertionPoint) {
  const node = new Text()
  node.text = dividerChar
  node.type = 'autoWidth'
  node.styleRanges = rootStyles
  insertionPoint.addChild(node)
  const dividerWidth = node.boundsInParent.width
  node.removeFromParent()
  return dividerWidth
}
async function getSplitParameters() {
  const prefs = await getSettings(defaultSettings)
  const dialog = getSplitDialog(prefs)
  // Show the dialog and get a result when the user closes it
  const result = await dialog.showModal()
  if (result === 'reasonCanceled') return false // Exit if the user cancels the modal
  return result
}
function mergeIntoAnchorFrame(node, text, width) {
  let newLayoutBox = node.layoutBox
  node.text = text
  newLayoutBox.type = 'autoHeight'
  newLayoutBox.width = width
  newLayoutBox.height = 0
  node.layoutBox = newLayoutBox
}
function cleanUp(items, selItems) {
  for (let i = 1; i < items.length; i++) {
    items[i].removeFromParent()
  }
  removeEmptyGroups(selItems)
}
function joinTextContent(items) {
  return items.map(o => o.text.trim()).join(' ')
}
function widestFrameValue(items) {
  return Math.max.apply(
    Math,
    items.map(o => o.boundsInParent.width + 0.5) // adding 0.5 mitigates sub-pixel rounding errors
  )
}
function minAxisValue(items, axis) {
  return Math.min.apply(
    Math,
    items.map(o => o.boundsInParent[axis])
  )
}
function transformOffsetNode(node, x, y) {
  // console.log('transformOffsetNode', node)
  let parentCenter = node.boundsInParent
  node.placeInParentCoordinates({ x: parentCenter.x - x, y: parentCenter.y - y + node.localBounds.y }, parentCenter)
}
function sortByAxis(items, axis) {
  items.sort((a, b) => (a.globalBounds[axis] > b.globalBounds[axis] ? 1 : -1))
  return items
}
function removeEmptyGroups(items) {
  const walkit = items => {
    items.forEach(node => {
      if (node.constructor.name === 'Group') {
        if (node.children.length) {
          walkit(node.children)
        } else {
          node.removeFromParent()
        }
      }
    })
  }
  walkit(items)
  return
}
function extractTextFrames(items) {
  let textFrames = []
  const walkit = items => {
    items.forEach(node => {
      if (node.constructor.name === 'Text') {
        textFrames.push(node)
      }
      if (node.constructor.name === 'Group') {
        walkit(node.children)
      }
    })
  }
  walkit(items)
  return textFrames
}
function notValidSplitSelection(frames) {
  let valid = false
  if (frames.length !== 1) {
    error('Error: ', 'Please ensure only one text frame is selected to split, and try again.')
    valid = true
  }
  return valid
}
function notValidJoinSelection(frames) {
  let valid = false
  if (frames.length < 2) {
    error('Error: ', 'Please select at least two text frames to join, and try again.')
    valid = true
  }
  return valid
}

module.exports = {
  commands: {
    joinTextFrames: joinTextFramesFunction,
    splitTextFrames: splitTextFramesFunction
  }
}
