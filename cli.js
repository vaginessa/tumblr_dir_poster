#!/usr/bin/env node
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
const args = argumentParser.parseArgs()

// Validate arguments
log(`Validating arguments...`)

try {validate.validateDir(args.dir)}
catch (e) {
  log.error(e)
  process.exit(1)
}

// Run
log(`All good, doing the work...`)
poster.processDir(args.dir)
