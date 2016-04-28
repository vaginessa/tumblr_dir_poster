const _ = require('lodash')
const fs = require(`fs`)
const log = require(`./log`)
const path = require(`path`)

const ALL_POST_TYPES = [
  `text`,
  `quote`,
  `link`,
  `answer`,
  `video`,
  `audio`,
  `photo`,
  `chat`,
]
const REQUIRED_FIELDS_FOR_TYPES = {
  caption: [`photo`, `audio`, `video`],
  img: [`photo`],
}
const SUPPORTED_POST_TYPES = [`photo`]

const ALL_POST_STATES = [`published`, `draft`, `queue`, `private`]

const MAX_POST_CAPTION_LENGTH = 1000
const MAX_POST_TAGS = 20

function validateDir(directory) {

  if (!path.isAbsolute(directory)) {
    throw `Directory path not absolute`
  }

  let isDir = true
  try {isDir = fs.statSync(directory).isDirectory()}
  catch (e) {
    throw `Directory path doesn't exist`
  }
  if (!isDir) {
    throw `Directory path not a directory`
  }

}

function validatePostData(data) {

  // Validate blog
  if (!data.blog) {throw `Missing post 'blog'`}
  log.debug(`✔ data.blog: ${data.blog}`)

  // Validate type
  if (!data.type) {throw `Missing post 'type'`}
  if (SUPPORTED_POST_TYPES.indexOf(data.type) === -1) {
    throw `Unsupported post type: ${data.type}`
  }
  log.debug(`✔ data.type: ${data.type}`)

  // Validate state
  if (!!data.state) {
    if (ALL_POST_STATES.indexOf(data.state) === -1) {
      throw `Unsupported post state: ${data.state}`
    }
    log.debug(`✔ data.state: ${data.state}`)
  } else {
    log.debug(`o data.state`)
  }

  // Validate tags
  if (!!data.tags) {
    if (!_.isArray(data.tags)) {throw `Post tags must be an array`}
    if (data.tags.length > MAX_POST_TAGS) {
      throw `Post can have no more than ${MAX_POST_TAGS} tags`
    }
    log.debug(`✔ data.tags: ${data.tags}`)
  } else {
    log.debug(`o data.tags`)
  }

  // Validate caption
  if (REQUIRED_FIELDS_FOR_TYPES.caption.indexOf(data.type) !== -1) {
    if (!!data.caption) {
      if (data.caption.length > MAX_POST_CAPTION_LENGTH) {
        throw `Post caption cannot be longer than ${MAX_POST_CAPTION_LENGTH} characters`
      }
      log.debug(`✔ data.caption: ${data.caption}`)
    } else {
      log.debug(`o data.caption`)
    }
  } else {
    log.debug(`_ data.caption`)
  }

  // Validate img
  if (REQUIRED_FIELDS_FOR_TYPES.img.indexOf(data.type) !== -1) {
    if (!!data.img) {
      if (!path.isAbsolute(data.img)) {
        throw `Post img not an absolute path`
      }
      let isFile = true
      try {
        isFile = fs.statSync(data.img).isFile()
      } catch (e) {
        throw `Post img path doesn't exist`
      }
      if (!isFile) {
        throw `Post img doesn't exist`
      }
      log.debug(`✔ data.img: ${data.img}`)
    } else {
      throw `Missing post 'img'`
    }
  } else {
    log.debug(`_ data.img`)
  }

}

module.exports = {validateDir, validatePostData}
