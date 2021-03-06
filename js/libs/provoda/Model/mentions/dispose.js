import checkAndDisposeModel from '../checkAndDisposeModel'

const disposeOneMention = function(owner, target, name) {
  // owner.children_models[name] == target

  target.__mentions_as_rel[name].delete(owner)

  if (owner == target) {
    return
  }

  if (!target.__mentions_as_rel[name].size) {
    checkAndDisposeModel(target, target.getAttr('$meta$removed'))
  }
}

const disposeMentions = function(self) {
  for (var name in self.children_models) {
    if (!self.children_models.hasOwnProperty(name)) {
      continue
    }

    var cur = self.children_models[name]
    if (cur == null) {
      continue
    }

    if (!Array.isArray(cur)) {
      disposeOneMention(self, cur, name)
    } else {
      for (var i = 0; i < cur.length; i++) {
        disposeOneMention(self, cur[i], name)
      }
    }
  }
}

export default disposeMentions
