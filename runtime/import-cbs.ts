import process from 'node:process'

import { createRequire } from 'node:module'
import {mkdir, writeFile} from "node:fs/promises";
const require = createRequire(import.meta.url)
const parallelLimit = require('async/parallelLimit')

const odataID = '80892ned'

const queryWikidataSparql = (query: string) => {
  return fetch(
    `https://query.wikidata.org/sparql?query=${query}&format=json`,
    {
      headers: new Headers({'User-Agent': 'WaterBot/0.1 (https://github.com/FalcoG/dutch-water-authorities)'})
    }
  )

}
const importCbsDataset = async () => {
  const openDataIndexResponse = await fetch(`https://opendata.cbs.nl/ODataApi/OData/${odataID}`)
  const openDataIndex = await openDataIndexResponse.json()

  const waterAuthoritiesIndex = openDataIndex.value.find(entry => {
    return entry.name === 'Waterschappen'
  })

  if (!waterAuthoritiesIndex)
    throw Error('Unable to retrieve CBS water authorities')

  const waterAuthoritiesResponse = await fetch(waterAuthoritiesIndex.url)
  const waterAuthorities = await waterAuthoritiesResponse.json()

  const asyncMap = waterAuthorities.value.map(value => {
    return async () => {
      try {
        const searchName = value.Title.replace(/ \(WS\)|WS |Hhs/g, '')

        const query = encodeURIComponent(`
        SELECT DISTINCT * WHERE {
          SERVICE wikibase:mwapi {
            bd:serviceParam
              wikibase:endpoint "www.wikidata.org";
              wikibase:api "Search";
              mwapi:srsearch "${searchName}".
            ?entity wikibase:apiOutput mwapi:title.
          } 
        } LIMIT 1`)

        const response = await queryWikidataSparql(query)
        const object = await response.json()
        const results = object.results.bindings

        if (!results.length) {
          console.warn(`Missing wikidata entry for ${value.Title}`)

          return
        }

        const entity = results[0].entity.value

        return {
          wikidata: entity,
          cbs_water_authorities: value,
        }
      } catch (e) {
        console.error(`Unable to finish map for ${value.Title}`, e)
      }
    }
  }).filter(item => item != undefined)

  // NOTE: 5 parallel connections allowed to Wikidata's SPARQL!
  return await parallelLimit(asyncMap, 5)
}

importCbsDataset().then(async (result) => {
  await mkdir('./dist', { recursive: true })
  return writeFile('./dist/automated-data.json', JSON.stringify(result))
})

// beta node esm runtime doesn't log error properly without this
process.on('uncaughtException', err => {
  console.error(err)
  process.exit(1)
})
