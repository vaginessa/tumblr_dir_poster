const log = require(`./log`)
const tumblr = require(`tumblr.js`)

let t = null

function init(consumerKey, consumerSecret, token, tokenSecret) {

  log(`Initialising tumblr module...`)
  log.debug(`consumerKey: ${consumerKey}`)
  log.debug(`consumerSecret: ***`)
  log.debug(`token: ${token}`)
  log.debug(`tokenSecret: ***`)

  t = new tumblr.Client({
    consumer_key: consumerKey,
    consumer_secret: consumerSecret,
    token: token,
    token_secret: tokenSecret
  })

}

function post(data) {
  log(`Attempting to post data from file ${data.dataFilePath} to Tumblr:${data.blog}...`)

  if (!t) {throw `tumblr module not initialised`}
  log.debug(`tumblr module initialised, posting...`)

  switch (data.type) {
    case `photo`: return postPhoto(data)
    case `text`: return postText(data)
    default: throw `Unsupported post type ${data.type}: this shouldn't have got through validation...`
  }

}

function postPhoto(data) {
  log(`Posting photo at ${data.img} to Tumblr:${data.blog}...`)

  return (new Promise((resolve, reject) => {

    t.photo(data.blog, {
      state: data.state || `published`,
      tags: (data.tags || []).join(`,`),
      caption: data.caption || ``,
      data: data.img,
    }, postResponseHandler(resolve, reject))

  }))

}

function postText(data) {
  log(`Posting text to Tumblr:${data.blog}...`)

  return (new Promise((resolve, reject) => {

    t.text(data.blog, {
      state: data.state || `published`,
      tags: (data.tags || []).join(`,`),
      caption: data.caption || ``,
      title: data.title || ``,
      body: data.text || ``,
    }, postResponseHandler(resolve, reject))

  }))

}

function postResponseHandler(resolve, reject) {
  return (err, resp) => {
    if (err) {return reject(`Failed to post from file ${data.dataFilePath} to Tumblr: ${err}`)}
    log(`Successfully posted Tumblr post ID ${resp.id}`)
    return resolve(resp)
  }
}

module.exports = {init, post}
