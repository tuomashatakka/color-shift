#!/usr/local/bin/node
import { readdirSync as readdir, existsSync as exists, mkdirSync as mkdir, statSync as stats, writeFile } from 'fs'
import { resolve, join, dirname  } from 'path'
import { fileURLToPath } from 'url'
import babel from '@babel/core'

global.__filename = fileURLToPath(import.meta.url)
global.__dirname  = dirname(global.__filename)


const DEST_PATH = resolve(__dirname, '../dist')
const SRC_PATH  = resolve(__dirname, '../src')
const SRC_FILES = readdir(SRC_PATH)


const directoryExists = path =>
  exists(path) &&
  stats(path).isDirectory()

const createDirectoryIfNotExists = path => {
  const shouldMake = !directoryExists(path)
  if (shouldMake)
    mkdir(path)
  return shouldMake
}

const except = error =>
  console.error("Error:", error)


function transpile (filename) {

  const path = resolve(SRC_PATH, filename)
  const opts = {}
  return new Promise((resolve, reject) => {

    const callback = (error, result) => error
      ? reject(error)
      : resolve(result.code)

    console.log("Transpiling file", path)
    babel.transformFile(path, opts, callback)
  })
}


function write (filename, content) {

  const path = resolve(DEST_PATH, filename).replace(/\.mjs$/, '.js')
  return new Promise((resolve, reject) => {

    const callback = (error, result) => error
      ? reject(error)
      : resolve()

    console.log("Writing file", path)
    writeFile(path, content, callback)
  })
}



// Main
const didCreate = createDirectoryIfNotExists(DEST_PATH)

if (didCreate)
  console.log("Created a destination directory", DEST_PATH)
else
  console.log("Destination directory", DEST_PATH, "already exists")

for (let f of SRC_FILES)
  transpile(f)
    .then(write.bind(null, f))
    .catch(except)
