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
  for (dataPath of dataPaths) {log.debug(dataPath)}

  // Process each one
  for (dataPath of dataPaths) {
    processDataFile(dataPath)
  }

}

function processDataFile(dataFilePath) {

  try {checkInited()} catch (e) {process.exit(1)}

  log(`Processing data file ${dataFilePath}...`)

  let data = null

  return (new Promise((resolve, reject) => {

    // Parse it
    try {
      data = require(dataFilePath)
    } catch (e) {
      return reject(`Failed to parse data file ${dataFilePath}: ${e.stack}`)
    }
    log.debug(`Parsed: ${JSON.stringify(data)}`)

    return resolve()

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
    if (data.deleteAfterPosting === true) {
      log(`data.deleteAfterPosting is set, so deleting data and content files...`)
      if (!!data.img) {
        log.debug(`Deleting content file ${data.img}...`)
        fs.unlinkSync(data.img)
      }
      log.debug(`Deleting data file ${dataFilePath}...`)
      fs.unlinkSync(dataFilePath)
    } else {
      log.debug(`Not requested to delete, so not deleting`)
    }

  })
  .catch(err => {
    log.error(`Error processing data file ${dataFilePath}: ${err}${!!err.stack ? ': ' + err.stack : ''}`)
  }))

}

module.exports = {init, processDir}
