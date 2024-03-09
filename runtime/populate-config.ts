import config from './config.json' with { type: 'json' }
import { writeFile } from 'node:fs/promises'
import { WaterAuthority } from '../src/types'

async function populateConfig (authorities: WaterAuthority[], year: string) {
  await Promise.all(
    authorities.map(async authority => {
      const name = authority.osm_tags['short_name']
      if (config.authorities[authority.gov_code] == null) {
        console.warn(`No entry found for ${name} (ws_${authority.gov_code})`)
        console.info(`Creating ${name}`)
        config.authorities[authority.gov_code] = {}
      }

      if (config.authorities[authority.gov_code][year] == null) {
        console.info(`Creating entry in ${name} for tax year ${year}`)
        config.authorities[authority.gov_code][year] = {
          system_tax: null,
          waste_unit_tax: null,
          property_tax: null,
          sources: [authority.osm_tags['website']]
        }
      }
    })
  )

  await writeFile('config.json', JSON.stringify(config, null, 2))
}

export default populateConfig
