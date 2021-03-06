
import spv from '../../spv'
import parse from './NestingSourceDr/parse'
import asString from './multiPath/asString'
var splitByDot = spv.splitByDot

function itself(item) {return item}

var selfRef = {rel_type: 'self'}

var enc_states = {
  '^': (function() {
    // parent

    var parent_count_regexp = /^\^+/gi

    return function parent(string, nil_allowed) {
      //example: '^visible'

      var state_name = string.replace(parent_count_regexp, '')
      var count = string.length - state_name.length
      return {
        rel_type: 'parent',
        full_name: string,
        state_name: state_name,
        full_state_name: state_name,
        base_state_name: state_name && splitByDot(state_name)[0],
        ancestors: count,
        nil_allowed: nil_allowed !== false
      }
    }
  })(),
  '@': function nesting(string, nil_allowed) {
    // nesting

    //example:  '@some:complete:list'
    var nesting_and_state_name = string.slice(1)
    var parts = nesting_and_state_name.split(':')

    var nesting_name = parts.pop()
    var state_name = parts.pop()
    var zip_func = parts.pop()

    var nesting_source = parse(nesting_name)

    return {
      rel_type: 'nesting',
      full_name: string,
      state_name: state_name,
      full_state_name: state_name,
      base_state_name: state_name && splitByDot(state_name)[0],


      nesting_source: nesting_source,
      nesting_name: nesting_source.selector.join('.'),
      zip_name: zip_func,
      zip_func: zip_func || itself,
      nil_allowed: nil_allowed !== false

    }
  },
  '#': function(string, nil_allowed) {
    // root

    //example: '#vk_id'
    var state_name = string.slice(1)
    if (!state_name) {
      throw new Error('should be state_name')
    }

    return {
      rel_type: 'root',
      full_name: string,
      state_name: state_name,
      full_state_name: state_name,
      base_state_name: state_name && splitByDot(state_name)[0],
      nil_allowed: nil_allowed !== false

    }
  }
}

var simulateLegacyPath = {
  '^': function(multi_path) {
    return {
      rel_type: 'parent',
      full_name: asString(multi_path),
      state_name: multi_path.state.path,
      full_state_name: multi_path.state.path,
      base_state_name: multi_path.state.base,

      ancestors: multi_path.from_base.steps,
    }
  },
  '@': function(multi_path) {
    return {
      rel_type: 'nesting',
      full_name: asString(multi_path),
      state_name: multi_path.state.path,
      full_state_name: multi_path.state.path,
      base_state_name: multi_path.state.base,


      nesting_source: {
        start_point: false,
        selector: multi_path.nesting.path,
      },
      nesting_name: multi_path.nesting.path.join('.'),
      zip_name: multi_path.zip_name,
      zip_func: multi_path.zip_name || itself,
    }
  },
  '#': function(multi_path) {

    return {
      rel_type: 'root',
      full_name: asString(multi_path),
      state_name: multi_path.state.path,
      full_state_name: multi_path.state.path,
      base_state_name: multi_path.state.base,
    }
  }
}

var fromMultiPath = function(multi_path, as_string, original) {

  if (multi_path.base_itself) {
    return selfRef
  }

  if (multi_path.resource.path) {
    throw new Error('dont use route: for attr.comp (runtime not implemented)')
  }

  if (multi_path.from_base.type && multi_path.nesting.path) {
    throw new Error('dont use asc: and rel: for attr.comp (runtime not implemented)')
  }

  if (multi_path.nesting.path && !multi_path.zip_name) {
    console.warn('zip name `@one:` or `@all:` should be provided for ' + original)
  }

  if (multi_path.from_base.type == 'parent') {
    return simulateLegacyPath['^'](multi_path)
  }

  if (multi_path.from_base.type == 'root') {
    return simulateLegacyPath['#'](multi_path)
  }

  if (multi_path.nesting.path) {
    return simulateLegacyPath['@'](multi_path)
  }

  return null
}

var getParsedState = spv.memorize(function getParsedState(state_name) {
  // isSpecialState
  var required = state_name.charAt(0) === '&'
  var rest = required ? state_name.slice(1) : state_name
  var start = rest.charAt(0)
  if (enc_states[start]) {
    return enc_states[start](rest, required)
  } else {
    return null
  }
})

export const clearCache = () => {
  getParsedState.__clear()
}

getParsedState.fromMultiPath = fromMultiPath
export default getParsedState
