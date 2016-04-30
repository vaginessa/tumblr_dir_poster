const _ = require(`lodash`)
const enumerate = require(`./src/enumerate`)
const fs = require(`fs`)
const log = require(`./src/log`)
const path = require(`path`)
const tumblr = require(`./src/tumblr`)
const validate = require(`./src/validate`)

let inited = false
function init(consumerKey, consumerSecret, token, tokenSecret) {
  tumblr.init(consumerKey, consumerSecret, token, tokenSecret)
  inited = true
}
function checkInited() {
  if (!inited) {
    log.error(`Module not initialised, please call .init() with setup info first`)
    throw `Not initialised`
  }
}

function processDir(directory) {

  try {checkInited()} catch (e) {process.exit(1)}

  log(`Processing directory ${directory}...`)

  // Get full paths to data files in directory
  const dataPaths = _.map(
    enumerate.getDataFiles(directory),
    name => path.join(directory, name)
  )
  log(`Processing ${dataPaths.length} data files...`)
  for (let dataPath of dataPaths) {log.debug(dataPath)}

  // Process each one
  for (let dataPath of dataPaths) {
    processDataFile(dataPath)
  }

}

function processDataFile(dataFilePath) {

  try {checkInited()} catch (e) {process.exit(1)}

  log(`Processing data file ${dataFilePath}...`)

  let data = null
  let originalData = null

  return (new Promise((resolve, reject) => {

    // Parse it
    try {
      data = require(dataFilePath)
    } catch (e) {
      return reject(`Failed to parse data file ${dataFilePath}: ${e.stack}`)
    }
    log.debug(`Parsed: ${JSON.stringify(data)}`)
    originalData = JSON.parse(JSON.stringify(data))

    return resolve()

  })
  .then(() => {

    // Leave alone if processed before
    if (data.processed) {
      log(`Data file processed previously, so not processing again. Finished!`)
      throw `PROCESSED`
    }

  })
  .then(() => {

    // Validate it
    log(`Validating data...`)
    try {
      validate.validatePostData(data)
    } catch (e) {
      throw `Invalid post data: ${e}`
    }
    log(`Data all good`)

  })
  .then(() => {

    // Add extra data
    log.debug(`Adding extra data`)
    data.dataFilePath = dataFilePath

  })
  .then(() => tumblr.post(data))
  .then(tumblrResp => {

    // Delete stuff if necessary
    if (data.deleteDataFileAfterPosting === true) {
      log(`data.deleteDataFileAfterPosting is set, so deleting data file ${data.dataFilePath}...`)
      try {fs.unlinkSync(dataFilePath)}
      catch (e) {log.error(`Failed to delete data file ${data.dataFilePath}: ${e}${!!e.stack ? ': ' + e.stack : ''}`)}
    } else {
      log.debug(`Not deleting data file: set data.deleteDataFileAfterPosting to do this`)
      log.debug(`Adding "processed": true to the data file since we're not removing it`)
      originalData.processed = true
      fs.writeFileSync(data.dataFilePath, JSON.stringify(originalData, undefined, 2))
    }

    if (!!data.img && data.deleteContentFilesAfterPosting === true) {
      log(`data.deleteContentFilesAfterPosting is set, so deleting img file ${data.img}...`)
      try {fs.unlinkSync(dataFilePath)}
      catch (e) {log.error(`Failed to delete img file ${data.img}: ${e}${!!e.stack ? ': ' + e.stack : ''}`)}
    } else {
      log.debug(`Not deleting img file: set data.deleteContentFilesAfterPosting to do this`)
    }

  })
  .catch(err => {
    if (err === `PROCESSED`) {return}
    log.error(`Error processing data file ${dataFilePath}: ${err}${!!err.stack ? ': ' + err.stack : ''}`)
  }))

}

module.exports = {init, processDir}
