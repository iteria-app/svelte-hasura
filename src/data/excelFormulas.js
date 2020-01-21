//import { Parser, ERROR_REF, error as isFormulaError } from 'hot-formula-parser';
//import { Parser } from 'hot-formula-parser/lib/';
//const Parser = require('hot-formula-parser').Parser
import * as utils from '@handsontable/formulajs/lib/utils/common.js';
import * as evalExpression from '@handsontable/formulajs/lib/utils/criteria-eval.js';

export default function newParser() {
    //const parser = new Parser()
    const parser = new window.formulaParser.Parser();

    parser.setFunction('ARRAYNUMBERS', function(params) {
      const arr = params[0]
      const ret = []
var el;
for (var i = 0; i < arr.length; ++i) {
  el = arr[i];
  if (typeof el === 'number') {
    ret.push(el);
  } else if (el === true) {
    ret.push(1);
  } else if (el === false) {
    ret.push(0);
  } else if (typeof el === 'string') {
    var number = utils.parseNumber(el);
    if (number instanceof Error) {
      ret.push(0);
    } else {
      ret.push(number);
    }
  } else if(el) {
    ret.push(1);
  } else {
    ret.push(0);
  }
}
return ret;
})
    parser.setFunction('SORT', function(array) {
      return utils.flatten(array).sort(function(a, b) {
        return a - b;
      });
    })
    parser.setFunction('UNIQUE', function() {
      var result = [];
      var data = utils.flatten(arguments)
      for (var i = 0; i < data.length; ++i) {
        var hasElement = false;
        var element    = data[i];

        // Check if we've already seen this element.
        for (var j = 0; j < result.length; ++j) {
          hasElement = result[j] === element;
          if (hasElement) { break; }
        }

        // If we did not find it, add it to the result.
        if (!hasElement) {
          result.push(element);
        }
      }
      return result;
    })

    parser.setFunction('SUMIF', function(params) {
      var range = params[0]
      const criteria = params[1]
      var sumRange = params.length > 2 ? params[2] : range
range = utils.parseNumberArray(utils.flatten(range));
sumRange = utils.parseNumberArray(utils.flatten(sumRange));

if (range instanceof Error) {
  return range;
}
var result = 0;
var isWildcard = criteria === void 0 || criteria === '*';
var tokenizedCriteria = isWildcard ? null : evalExpression.parse(criteria + '');

const sumVals = typeof(sumRange) != 'undefined' ? sumRange : range
for (var i = 0; i < range.length; i++) {
  var value = range[i];
  var sumValue = sumVals[i];

  if (isWildcard) {
    result += sumValue;
  } else {
    var tokens = [evalExpression.createToken(value, evalExpression.TOKEN_TYPE_LITERAL)].concat(tokenizedCriteria);

    result += (evalExpression.compute(tokens) ? sumValue : 0);
  }
}

return result;
})


parser.setFunction('null', function() {
  return null
});
parser.setFunction('eval', function(params) {
  const formula = params[0];
  const ret = self.evalFormula(formula);
  return ret
});
parser.setFunction('date', function(params) {
  const formula = params[0];
  const ret = self.evalFormula(formula);
  return new Date(ret)
});
parser.setFunction('number', function(params) {
  const formula = params[0];
  const ret = self.evalFormula(formula);
  if (ret == null) {
      if (params.length > 1) {
          return params[1]//default value
      }
      return 0
  }
  if (typeof ret == 'string') {
      if (ret != null && /^(-?[0-9]+(.[0-9]+)?)$/.test(ret)) {
          console.log('validne cislo ', ret, formula);
      } else {
          console.log('nevalidne cislo ', ret, formula);
          return 0
      }
  }
  return ret
});
parser.setFunction('string', function(params) {
  const formula = params[0];
  const ret = self.evalFormula(formula);
  return ret
});
parser.setFunction('prompt', function(params) {
  const label = (params || {})[0] || 'Zadajte';
  return prompt(label)
}); 


/*
    parser.on('callVariable', function(name, done) {
      console.log('formula callVariable ' + name + " begin ")

      if (name.indexOf('data_') == 0) {
        const path = name.split('_')
        if (path <= 1) {
          return done([])
        }
        const collectionName = path[1]
        const fieldName = path.length > 2 ? path[2] : 'aktualna'
        const data = self.kolekciaData(collectionName, fieldName)
        done(data)
        if (typeof(self.model.ensureProperty) != 'undefined') {
        const v = self.model.ensureProperty(name)
        done(v);
        console.log('formula callVariable ' + name + " end " + v)
        console.log('formula callVariable ' + name + " end " + data)
    } else {
        const v = self.model[name]
        done(v);
        console.log('formula callVariable ' + name + " end " + v)
      }
    });
    */
    return parser
}

const parser = newParser()
export const formulaParser = parser
