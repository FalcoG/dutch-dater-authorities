import { writeFile, mkdir } from 'node:fs/promises'
import config from './config.json' with { type: 'json' }
import retrieveWaterAuthorities from './retrieve-water-authorities'
import populateConfig from './populate-config'
import { WaterAuthority, WaterAuthorityTaxes } from '../src/types'

const options = process.argv.slice(2)
const taxYear = options.find(item => item.indexOf('--year') === 0)?.split('=')[1]

/**
 * Generate enriched output
 */
try {
  const authorities_osm_tags = await retrieveWaterAuthorities()

  const metadata: WaterAuthority[] = await Promise.all(
    authorities_osm_tags.map(async tags => {
      const short_name = tags['short_name']
      const gov_code = tags['ref:waterschapscode']
      const wikidata = tags['wikidata']

      if (short_name && gov_code && wikidata) {
        const requestURL = `https://www.wikidata.org/w/rest.php/wikibase/v0/entities/items/${wikidata}`

        const response = await fetch(requestURL)
        const wikidataObject = await response.json()

        const taxes: WaterAuthorityTaxes = config.authorities[gov_code]

        if (!taxes) console.warn(`Missing taxes for water authority ${gov_code} ${short_name} (url: ${tags["website"]})`)

        return {
          gov_code,
          taxes,
          osm_tags: tags,
          wikidata: wikidataObject
        }
      } else {
        throw Error('Incomplete OSM dataset')
      }
    })
  )

  await mkdir('./dist', { recursive: true })

  const promises = [
    writeFile('./dist/output.json', JSON.stringify(metadata))
  ]

  if (taxYear) promises.push(
    populateConfig(metadata, taxYear)
  )

  await Promise.all(promises)
} catch (err) {
  console.error('Critical failure when enriching water authorities')
  console.error(err)
}
