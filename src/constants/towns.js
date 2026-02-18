/**
 * Martha's Vineyard towns for filtering
 * Used by TownPicker component and LocationContext
 */
export const MV_TOWNS = [
  { value: null, label: 'All Vineyard' },
  { value: 'Oak Bluffs', label: 'Oak Bluffs' },
  { value: 'Edgartown', label: 'Edgartown' },
  { value: 'Vineyard Haven', label: 'Vineyard Haven' },
  { value: 'West Tisbury', label: 'West Tisbury' },
  { value: 'Chilmark', label: 'Chilmark' },
  { value: 'Aquinnah', label: 'Aquinnah' },
]

/**
 * Nantucket towns for filtering
 */
export const NANTUCKET_TOWNS = [
  { value: null, label: 'All Nantucket' },
  { value: 'Nantucket', label: 'Nantucket' },
  { value: 'Siasconset', label: 'Sconset' },
  { value: 'Madaket', label: 'Madaket' },
  { value: 'Wauwinet', label: 'Wauwinet' },
]

/**
 * Cape Cod towns (ferry-adjacent — natural expansion from the islands)
 */
export const CAPE_COD_TOWNS = [
  { value: null, label: 'All Cape' },
  { value: 'Falmouth', label: 'Falmouth' },
  { value: 'Woods Hole', label: 'Woods Hole' },
  { value: 'Hyannis', label: 'Hyannis' },
  { value: 'Mashpee', label: 'Mashpee' },
  { value: 'Sandwich', label: 'Sandwich' },
  { value: 'Barnstable', label: 'Barnstable' },
  { value: 'Provincetown', label: 'P-town' },
  { value: 'Chatham', label: 'Chatham' },
]

/**
 * All towns across islands + Cape
 */
export const ALL_TOWNS = [
  { value: null, label: 'All Areas' },
  ...MV_TOWNS.slice(1),
  ...NANTUCKET_TOWNS.slice(1),
  ...CAPE_COD_TOWNS.slice(1),
]
