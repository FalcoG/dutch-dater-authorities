# dutch-water-authorities 🌊
## Updating prices
### Update config with new tax year
To prevent manual labour for a new year of tax changes, you can run a command to populate the config. It can fill the config with entries using the following command:
```
$ npm run dev -- --year=2024
```
### Finding and setting taxes
The current formula for calculating taxes is;

For an individual homeowner:
``
system_tax + (property_tax_pct * home_value) + (waste_unit * 1)
``

For a household (2 or more people):
``
system_tax + (property_tax * home_value) + (waste_unit * 3)
``

To find out the taxes you will have to look them up at every water authority's website.

The naming can vary when the same tax is being meant. This list should help decoding it.

- **system_tax** (in euro):
  - Ingezetene per woonruimte
  - Voor een huishouden: € xxx,xx
- **property_tax** (percentage):
  - Voor een woning of bedrijf: x,xxxx% van de WOZ-waarde van het pand
  - In the following case please calculate it back to a percentage ([tax per 100000] / 1000): 
    - Gebouwd per €100.000 van WOZ waarde woning 
- **waste_unit_tax** (in euro):
  - Verontreinigingsheffing per vervuilingseenheid
  - Eenpersoonshuishoudens betalen € xxx,xx.
