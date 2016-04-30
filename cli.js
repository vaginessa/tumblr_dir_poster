#!/usr/bin/env node
const _ = require(`lodash`)
const argparse = require(`argparse`)
const log = require(`./src/log`)
const packageJson = require(`./package.json`)
const poster = require(`./poster`)
const validate = require(`./src/validate`)

log(`Starting ${packageJson.name}...`)

// Parse arguments
log(`Parsing command line arguments...`)

const argumentParser = new argparse.ArgumentParser({
  addHelp: true,
  description: packageJson.description,
  prog: packageJson.name,
})
argumentParser.addArgument([`-d`, `--dir`], {
  required: true,
  help: `Absolute path to the directory to monitor.`,
})
argumentParser.addArgument([`-c`, `--credentials`], {
  required: true,
  help: `Path to credentials file for Tumblr posting. Should be a .json file containing the fields consumerKey, consumerSecret, token and tokenSecret.`,
})
const args = argumentParser.parseArgs()

// Parse credentials
log(`Parsing credentials file ${args.credentials}...`)
let credentials = null
try {credentials = require(args.credentials)}
catch (e) {
  log.error(`Failed to parse credentials file ${args.credentials}: ${e}`)
  process.exit(1)
}

// Validate arguments
log(`Validating arguments...`)

try {validate.validateDir(args.dir)}
catch (e) {
  log.error(e)
  process.exit(1)
}

log(`Validating Tumblr credentials...`)
for (let requiredCredential of [`consumerKey`, `consumerSecret`, `token`, `tokenSecret`]) {
  if (credentials[requiredCredential] === undefined) {
    log.error(`Credentials file must provide ${requiredCredential}`)
    process.exit(1)
  }
  if (!_.isString(credentials[requiredCredential])) {
    log.error(`Invalid credential: ${requiredCredential} must be a string`)
    process.exit(1)
  }
  log.debug(`✔ ${requiredCredential}`)
}

// Init
poster.init(
  credentials.consumerKey,
  credentials.consumerSecret,
  credentials.token,
  credentials.tokenSecret
)

// Run
log(`All good, doing the work...`)
poster.processDir(args.dir)
