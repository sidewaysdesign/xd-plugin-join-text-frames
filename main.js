/*
 * Join multiple text frames into a single frame.
 *
 * Visit http://adobexdplatform.com/ for API docs and more sample code.
 */

const { error } = require('./lib/dialogs.js')

function joinTextFramesFunction(selection) {
  let allFrames = extractTextFrames(selection.items)
  if (notValidSelection(allFrames)) return
  allFrames = sortByAxis(sortByAxis(allFrames, 'x'), 'y')
  const anchorFrame = allFrames[0]
  transformNodeCoord(anchorFrame, minAxisValue(allFrames, 'x'), minAxisValue(allFrames, 'y'))
  mergeIntoAnchorFrame(anchorFrame, joinTextContent(allFrames), widestFrameValue(allFrames))
  cleanUp(allFrames, selection.items)
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
    items.map(o => o.boundsInParent.width + 0.5)
  )
}
function minAxisValue(items, axis) {
  return Math.min.apply(
    Math,
    items.map(o => o.boundsInParent[axis])
  )
}
function transformNodeCoord(node, x, y) {
  let parentCenter = node.boundsInParent // parent's center in parent's coordinates
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
function notValidSelection(frames) {
  let valid = false
  if (frames.length < 2) {
    error('Error: ', 'Please select at least two text frames to join, and try again.')
    valid = true
  }
  return valid
}

module.exports = {
  commands: {
    joinTextFrames: joinTextFramesFunction
  }
}
