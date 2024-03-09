async function retrieveWaterAuthorities() {
  const raw = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: `
    [out:json];
rel[admin_level=2]["ISO3166-1"="NL"];map_to_area->.region;

(
  relation["boundary"="administrative"]["designation"="waterschap"](area.region);
);

out meta;
`
  })

  const response: { elements: Array<{ tags: any[] }>} = await raw.json()

  const list = response.elements.filter((element) => {
    return element.tags['designation'] === 'waterschap' && element.tags['boundary'] === 'administrative'
  })

  return list.map((element) => element.tags)
}

export default retrieveWaterAuthorities
