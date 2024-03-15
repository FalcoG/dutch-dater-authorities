import output from '../runtime/dist/output.json' with { type: 'json' }
import config from '../runtime/config.json' with { type: 'json' }

export const waterAuthorities = output

export const waterAuthoritiesConfig = config

type waterAuthorityInput = keyof typeof config.authorities | typeof output[number]
export const calculateWaterAuthorityTax = (
  propertyValue: number,
  householdSize: number,
  taxYear: number,
  waterAuthority: waterAuthorityInput
) => {
  const authority = typeof waterAuthority === 'string'
    ? output.find((authority) => authority.gov_code === waterAuthority)
    : waterAuthority

  if (!authority)
    throw new Error(`Unable to find water authority with value ${waterAuthority}`)

  const taxInfo = authority.taxes[taxYear]

  if (!taxInfo)
    throw new Error(`Missing tax definition for ${waterAuthority}, year ${taxYear}`)

  try {
    return taxInfo.system_tax
      + (propertyValue * (taxInfo.property_tax/100))
      + (taxInfo.waste_unit_tax * (householdSize === 1 ? 1 : 3))
  } catch (e) {
    throw new Error('Unable to calculate tax')
  }
}
