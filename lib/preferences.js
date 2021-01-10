const fs = require('uxp').storage.localFileSystem

async function getSettings(defaultObj) {
  console.log('defaultObj', defaultObj)
  return await readSettings(defaultObj)
}

async function readSettings(defaultObj, fileName = 'settings.json') {
  // Find the config file
  const pluginDataFolder = await fs.getDataFolder()
  const entries = await pluginDataFolder.getEntries()
  let aFile
  for (const aItem of entries) {
    if (aItem.name == fileName) {
      aFile = aItem
      break
    }
  }

  let res
  if (aFile) {
    // Read information if there is a file
    const contents = await aFile.read()
    try {
      res = { ...defaultObj, ...JSON.parse(contents) }
    } catch (e) {
      res = defaultObj
    }
  } else {
    // If not, return the default settings and save to a file
    res = defaultObj
    if (defaultObj.constructor.name == 'String') {
      res = JSON.parse(defaultObj)
    }
    saveSettings(res)
  }
  return res
}
async function saveSettings(obj, fileName = 'settings.json') {
  // Write to file
  const pluginDataFolder = await fs.getDataFolder()
  const newFile = await pluginDataFolder.createEntry(fileName, { overwrite: true })
  let str = obj
  if (obj.constructor.name == 'Object') {
    str = JSON.stringify(obj, null, 2)
  }
  newFile.write(str.toString())

  return newFile
}

module.exports = {
  getSettings,
  saveSettings,
  readSettings
}
