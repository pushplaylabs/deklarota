
import getSPByPathTemplate from '../routes/legacy/getSPByPathTemplate'
import initBWlev from './initBWlev'

var getConstr = function(map, model_name) {
  try {
    return getSPByPathTemplate(map.app, map, 'bwlev-' + model_name, true)
  } catch (e) {}
}

export default function getBWlev(BrowseLevel, md, probe_name, parent_bwlev, map_level_num, map) {
  var cache = parent_bwlev && parent_bwlev.children_bwlevs
  var key = md._provoda_id
  if (cache && cache[key]) {
    return cache[key]
  }

  if (!BrowseLevel) {
    throw new Error('provide BrowseLevel constructor')
  }

  var Constr = map && getConstr(map, md.model_name)
  var bwlev = initBWlev(Constr || map.app.CBWL, md, probe_name, map_level_num, map, parent_bwlev)

  if (cache) {
    cache[key] = bwlev
  };

  return bwlev
}
