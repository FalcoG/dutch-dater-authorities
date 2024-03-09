import { writeFile, mkdir } from 'node:fs/promises'
import config from './config.json' with { type: 'json' }
import retrieveWaterAuthorities from './retrieve-water-authorities'

/**
 * Generate enriched output
 */
try {
  const authorities_osm_tags = await retrieveWaterAuthorities()

  const metadata = await Promise.all(
    authorities_osm_tags.map(async tags => {
      const short_name = tags['short_name'];
      const gov_code = tags['ref:waterschapscode'];
      const wikidata = tags['wikidata'];

      if (short_name && gov_code && wikidata) {
        const requestURL = `https://www.wikidata.org/w/rest.php/wikibase/v0/entities/items/${wikidata}`

        const response = await fetch(requestURL)
        const wikidataObject = await response.json()

        const taxes = config.authorities[gov_code]

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

  await mkdir('dist', { recursive: true });
  await writeFile('dist/output.json', JSON.stringify(metadata));
} catch (err) {
  console.error('Critical failure when enriching water authorities')
  console.error(err)
}
