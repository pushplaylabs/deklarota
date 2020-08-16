var isEmpty = require('lodash.isempty')
var isString = require('lodash.isstring')
var isRegExp = require('lodash.isregexp')
var isObject = require('lodash.isobject')
var isFunction = require('lodash.isfunction')
const lookup = require('module-lookup-amd')
var npath = require('path')

const PLUGIN = 'babel-plugin-replace-imports'
const ERRORS = {
    0: 'options are required.',
    1: 'option is required.',
    2: 'option must be a RegExp.',
    3: 'option must be a String or a Function',
    4: 'options item must be an Object.',
}

const optionLabels = {
    test: 'test',
    replacer: 'replacer',
}


function getErrorMessage(code, text) {
    const msg = `${text ? `«${text}»` : ''} ${ERRORS[code]}`.trim()
    return `\n${PLUGIN}: ${msg}`
};


function init({ types }) {
    function throwError(code, text) {
        const msg = getErrorMessage(code, text)
        throw new Error(msg)
    };

    function getOption(option) {
        if (!isObject(option) || isRegExp(option) || Array.isArray(option)) {throwError(4)}
        return option
    };

    function getTestOption(option) {
        if (!isRegExp(option) && isEmpty(option)) {throwError(1, optionLabels.test)}
        if (!isRegExp(option)) {throwError(2, optionLabels.test)}
        return option
    };

    function getReplacerListOption(option) {
        if (isFunction(option)) {return [ option ]}
        if (isEmpty(option)) {throwError(1, optionLabels.replacer)}
        return Array.isArray(option) ? option : [ option ]
    };

    function getReplacerOption(option) {
        if (!(isString(option) || isFunction(option))) {throwError(3, optionLabels.replacer)}
        return option
    };


    const findPath = (directory, want, clientPath) => {
      return lookup({
        directory: directory,
        partial: want,
        filename: clientPath,
        config: {
          baseUrl: directory,
          paths: {
            // jquery: 'js/common-libs/jquery-2.1.4',
            angbo: 'js/libs/provoda/StatementsAngularParser.min',
            _updateAttr: 'js/libs/provoda/_internal/_updateAttr',
            _getAttr: 'js/libs/provoda/_internal/_getAttr',
            _updateRel: 'js/libs/provoda/_internal/_updateRel',
            _getRel: 'js/libs/provoda/_internal/_getRel',
          },
          map: {
            '*': {
              su: 'js/seesu',

              pv: 'js/libs/provoda/provoda',
              __lib: 'js/libs/provoda',
              View: 'js/libs/provoda/View',
              js: 'js',
              spv: 'js/libs/spv',
              app_serv: 'js/app_serv',
              localizer: 'js/libs/localizer',
              view_serv: 'js/views/modules/view_serv',
              cache_ajax: 'js/libs/cache_ajax',
              env: 'js/env',

              hex_md5: 'js/common-libs/md5',
              'Promise': 'js/common-libs/Promise-3.1.0.mod'
            }
          },
        } // Or an object
      })
    }

    const withDot = (str) => {
      if (!str) {
        return str
      }

      if (str.startsWith('.')) {
        return str
      }

      return './' + str
    }

    return {
        visitor: {
            ImportDeclaration: (path, context) => {
                const { opts } = context
                if (path.node.__processed) {return}
                if (isEmpty(opts)) {throwError(0)}


                const source = path.node.source.value

                // console.log('resolved', findPath(opts.directory, source, filePath))


                const transforms = []
                let options = opts

                if (!Array.isArray(options)) {options = [ opts ]}

                for (let i = 0; i < options.length; i++) {
                    const opt = getOption(options[i])
                    // const regex = getTestOption(opt[optionLabels.test])

                    // const repl = getReplacerOption(replacer)
                    const filePath = context.file.opts.filename || opts.filePath

                    var newVal = findPath(opt.directory, source, filePath)
                    // source.replace(regex, repl)
                    if (!newVal) {
                      continue
                    }

                    var okValue = withDot(
                      npath.relative(npath.dirname(filePath), newVal).replace('.js', '')
                    )


                    console.log({
                      directory: opt.directory,
                      source: source,
                      filePath,
                      newVal,
                      okValue,

                    })

                    // continue

                    const importDeclaration = types.importDeclaration(
                        path.node.specifiers,
                        types.stringLiteral(okValue)
                    )
                    importDeclaration.__processed = true
                    transforms.push(importDeclaration)

                }

                if (transforms.length > 0) {path.replaceWithMultiple(transforms)}
            }
        }
    }
}


module.exports = init
