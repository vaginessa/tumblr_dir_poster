const _ = require(`lodash`)
const fs = require(`fs`)
const log = require(`./log`)
const path = require(`path`)

const DATA_FILE_REGEX = `.post.json$`

function getAllFiles(directory) {
  log.debug(`Listing files in ${directory}...`)

  const files = _.filter(
    fs.readdirSync(directory),
    name => fs.statSync(path.join(directory, name)).isFile()
  )
  log.debug(`Found ${files.length} files in ${directory}`)
  return files

}

function getDataFiles(directory) {
  log.debug(`Enumerating post data files in ${directory}...`)

  // Get all files
  const allFiles = getAllFiles(directory)

  // Get the ones that fit the pattern
  const dataFiles = _.filter(
    allFiles,
    name => !!name.match(new RegExp(DATA_FILE_REGEX))
  )
  log.debug(`Found ${dataFiles.length} files matching /${DATA_FILE_REGEX}/`)
  return dataFiles

}

module.exports = {getDataFiles}
