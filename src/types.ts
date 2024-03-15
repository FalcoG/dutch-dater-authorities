export type WaterAuthorityTaxes = {
  [key: string]: {
    system_tax: number
    waste_unit_tax: number
    property_tax: number
    sources: Array<string>
  }
}

export type WaterAuthoritiesConfig = {
  authorities: WaterAuthority
}

export type WaterAuthority = {
  gov_code: string
  taxes: WaterAuthorityTaxes
  osm_tags: any[]
  wikidata: any[]
}

export type WaterAuthorities = WaterAuthority[]
