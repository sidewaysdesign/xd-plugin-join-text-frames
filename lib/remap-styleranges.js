function remapStyleSet(styles, textContent, dividerChar) {
  const splitArray = textContent.split(dividerChar)

  // array of index values to refer to original style ranges
  let lengthSet = [].concat(...styles.map((a, myindex) => [...new Array(a.length)].map(b => myindex)))
  const dividerPos = [-1].concat(charLocations(dividerChar, textContent))
  // console.log(dividerPos);
  let mappedStyleRanges = []
  const singleMapped = splitArray.map((a, index) => {
    return lengthSet.slice(dividerPos[index] + 1, dividerPos[index] + 1 + a.length)
  })
  const regroupedIndices = regroupEqualSeries(singleMapped).map(a => Object.values(a))
  const groupedStyles = regroupedIndices.map((a, index) => {
    return a.map(a => {
      return { ...styles[index], length: a.length }
    })
  })
  return groupedStyles
}

function regroupEqualSeries(arr) {
  return arr.map(a =>
    a.reduce((r, c, i, a) => {
      r[c] = [...(r[c] || []), c]
      // r[c] = a[i + 1] != c && r[c].length == 1 ? r[c][0] : r[c];
      return r
    }, {})
  )
}
function charLocations(substring, string) {
  var a = [],
    i = -1
  while ((i = string.indexOf(substring, i + 1)) >= 0) a.push(i)
  return a
}

module.exports = {
  remapStyleSet,
  regroupEqualSeries,
  charLocations
}

// ----------

//   const groupedStyles = regroupedIndices.map((a, index) => {
//     let charPointer = 0
//     return a.map(a => {
//       const returnRange = {
//         // text: splitArray[index].slice(charPointer, charPointer + a.length),
//         ...styles[index],
//         length: a.length
//       }
//       charPointer += a.length
//       return returnRange
//     })
//   })
//   return groupedStyles
// }
