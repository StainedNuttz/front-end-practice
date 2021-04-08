(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const autoNumeric = require('autonumeric');
const parsingTime = require('parse-json');

const form = document.querySelector('#inputs form');
const formSubmit = document.querySelector('#inputs form button[type="submit"]');

const loading = document.querySelector('#loading');
const results = document.querySelector('#results');

const totalPay = document.querySelector('#total-pay');
const totalInterest = document.querySelector('#total-interest');
const lastPayDate = document.querySelector('#last-pay-date');
const perTime = document.querySelector('#per-time');
const mainPay = document.querySelector('#main-pay');

const loanAmount = document.querySelector('#loan-amount');
const interest = document.querySelector('#interest');
const loanTerm = document.querySelector('#loan-term');
const schedule = document.querySelector('#schedule');
const startDate = document.querySelector('#start-date');

const inputsToCheck = [loanAmount, interest, loanTerm, schedule, startDate];

new autoNumeric(loanAmount, { minimumValue: 0});
new autoNumeric(interest, { minimumValue: 0, maximumValue: 99 });
new autoNumeric(loanTerm, { digitGroupSeparator: '', decimalPlaces: 0 });

const currency = Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const today = new Date().toISOString().split('T')[0];
startDate.setAttribute('min', today);
startDate.setAttribute('value', today);

formSubmit.addEventListener('click', validateInputs);

function showLoading() {
  loading.classList.replace('hidden', 'flex');

  formSubmit.setAttribute('disabled', 'disabled');
  formSubmit.classList.add('cursor-not-allowed');

  results.classList.replace('grid', 'hidden')

  inputsToCheck.forEach(function(input) {
    input.setAttribute('disabled', 'disabled');
    input.classList.add('cursor-not-allowed');
  });
}

function hideLoading() {
  loading.classList.replace('flex', 'hidden');

  formSubmit.removeAttribute('disabled')
  formSubmit.classList.remove('cursor-not-allowed');

  results.classList.replace('hidden', 'grid')

  inputsToCheck.forEach(function (input) {
    input.removeAttribute('disabled', 'disabled');
    input.classList.remove('cursor-not-allowed');
  });
}

function calculateResults() {
  hideLoading();
  
  // NUMBER OF PAYMENTS PER YEAR
  let scheduleToPay;
  let perTimeName;

  // get the schedule before the calculation as we need the
  // correct one for the main calculation
  switch (schedule.value) {
    case 'daily':
      scheduleToPay = 365;
      perTimeName = 'day';
      break;
    case 'weekly':
      scheduleToPay = 52;
      perTimeName = 'week';
      break;
    case 'biweekly':
      scheduleToPay = 26;
      perTimeName = 'two weeks';
      break;
    case 'monthly':
      scheduleToPay = 12;
      perTimeName = 'month';
      break;
    case 'quarterly':
      scheduleToPay = 4;
      perTimeName = 'quarter (1/4 year)'
      break;
    case 'annually':
      scheduleToPay = 1;
      perTimeName = 'year';
      break;
  }

  // pv = loan amount
  // i = interest rate per month in decimal form
  // n = term of loan in months

  const pv = AutoNumeric.getNumber(loanAmount);
  const i = (AutoNumeric.getNumber(interest) / scheduleToPay) / 100;
  const n = (loanTerm.value * scheduleToPay);

  const formula = (pv * i) * ((Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1));


  const mainPayValue = currency.format(formula.toFixed(2)).toString().split('$')[1];
  mainPay.innerHTML = `<span class="text-lg absolute" style="left: -10px">$</span>${mainPayValue}`;
  perTime.innerHTML = `per ${perTimeName}`;

  totalInterest.innerHTML = currency.format(formula * loanTerm.value * scheduleToPay - pv);
  totalPay.innerHTML = currency.format(formula * loanTerm.value * scheduleToPay);

  const inputtedDate = new Date(startDate.value);
  inputtedDate.setFullYear(inputtedDate.getFullYear() + parseInt(loanTerm.value));

  const arrayDate = inputtedDate.toDateString().split(' ');
  arrayDate.shift();
  lastPayDate.innerHTML = arrayDate.join(' ');
}

function validateInputs(e) {
  const errors = [];

  e.preventDefault();

  // Loop through input fields and push any invalid inputs into errors array
  inputsToCheck.forEach(function(input) {
    const parent = getParent(input);
    const errorSpan = parent.querySelector('span.error');

    if (input.value === '' || (input === schedule && input.value == "Select payment schedule")) {
      errors.push(input);
      // If the input field already has error elements, hide/remove them!
    } else if (errorSpan !== null) {
        errorSpan.classList.add('hidden');
        input.classList.remove('border-red-600');
    }
  });

  // If any errors
  if (errors.length > 0) {
    errors.forEach(function(error) {
      const parent = getParent(error);
      const errorSpan = parent.querySelector('span.error');

      if (errorSpan === null) {
        const newSpan = createError();
         
        switch (error) {
          case schedule:
            newSpan.innerText = "Please select a payment schedule";
            break;
          case startDate: 
            newSpan.innerText = "Please select a starting date for the loan";
            break;
          case loanAmount:
            newSpan.innerText = "Please enter in the loan amount";
            break;
          case loanTerm:
            newSpan.innerText = "Please enter in the loan term in years";
            break;
          case interest:
            newSpan.innerText = "Please enter in the APR interest rate";
            break;
          default: 
            newSpan.innerText = "Please enter a value";
        } 

        parent.appendChild(newSpan);

      } else if (errorSpan.classList.contains('hidden')) {
        errorSpan.classList.remove('hidden');
      }

      error.classList.add('border-red-600');
    });
  } else {
    showLoading();
    setTimeout(calculateResults, 2000);
  }
}

function createError() {
  const span = document.createElement('span');
  span.classList.add('text-xs', 'text-red-600', 'error');

  return span;
}

function getParent(input) {
  let parent;

  if (input === interest || input === loanAmount) {
    parent = input.parentElement.parentElement;
  } else {
    parent = input.parentElement;
  }

  return parent;
}
},{"autonumeric":15,"parse-json":22}],2:[function(require,module,exports){
(function (process){(function (){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.codeFrameColumns = codeFrameColumns;
exports.default = _default;

var _highlight = _interopRequireWildcard(require("@babel/highlight"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

let deprecationWarningShown = false;

function getDefs(chalk) {
  return {
    gutter: chalk.grey,
    marker: chalk.red.bold,
    message: chalk.red.bold
  };
}

const NEWLINE = /\r\n|[\n\r\u2028\u2029]/;

function getMarkerLines(loc, source, opts) {
  const startLoc = Object.assign({
    column: 0,
    line: -1
  }, loc.start);
  const endLoc = Object.assign({}, startLoc, loc.end);
  const {
    linesAbove = 2,
    linesBelow = 3
  } = opts || {};
  const startLine = startLoc.line;
  const startColumn = startLoc.column;
  const endLine = endLoc.line;
  const endColumn = endLoc.column;
  let start = Math.max(startLine - (linesAbove + 1), 0);
  let end = Math.min(source.length, endLine + linesBelow);

  if (startLine === -1) {
    start = 0;
  }

  if (endLine === -1) {
    end = source.length;
  }

  const lineDiff = endLine - startLine;
  const markerLines = {};

  if (lineDiff) {
    for (let i = 0; i <= lineDiff; i++) {
      const lineNumber = i + startLine;

      if (!startColumn) {
        markerLines[lineNumber] = true;
      } else if (i === 0) {
        const sourceLength = source[lineNumber - 1].length;
        markerLines[lineNumber] = [startColumn, sourceLength - startColumn + 1];
      } else if (i === lineDiff) {
        markerLines[lineNumber] = [0, endColumn];
      } else {
        const sourceLength = source[lineNumber - i].length;
        markerLines[lineNumber] = [0, sourceLength];
      }
    }
  } else {
    if (startColumn === endColumn) {
      if (startColumn) {
        markerLines[startLine] = [startColumn, 0];
      } else {
        markerLines[startLine] = true;
      }
    } else {
      markerLines[startLine] = [startColumn, endColumn - startColumn];
    }
  }

  return {
    start,
    end,
    markerLines
  };
}

function codeFrameColumns(rawLines, loc, opts = {}) {
  const highlighted = (opts.highlightCode || opts.forceColor) && (0, _highlight.shouldHighlight)(opts);
  const chalk = (0, _highlight.getChalk)(opts);
  const defs = getDefs(chalk);

  const maybeHighlight = (chalkFn, string) => {
    return highlighted ? chalkFn(string) : string;
  };

  const lines = rawLines.split(NEWLINE);
  const {
    start,
    end,
    markerLines
  } = getMarkerLines(loc, lines, opts);
  const hasColumns = loc.start && typeof loc.start.column === "number";
  const numberMaxWidth = String(end).length;
  const highlightedLines = highlighted ? (0, _highlight.default)(rawLines, opts) : rawLines;
  let frame = highlightedLines.split(NEWLINE).slice(start, end).map((line, index) => {
    const number = start + 1 + index;
    const paddedNumber = ` ${number}`.slice(-numberMaxWidth);
    const gutter = ` ${paddedNumber} |`;
    const hasMarker = markerLines[number];
    const lastMarkerLine = !markerLines[number + 1];

    if (hasMarker) {
      let markerLine = "";

      if (Array.isArray(hasMarker)) {
        const markerSpacing = line.slice(0, Math.max(hasMarker[0] - 1, 0)).replace(/[^\t]/g, " ");
        const numberOfMarkers = hasMarker[1] || 1;
        markerLine = ["\n ", maybeHighlight(defs.gutter, gutter.replace(/\d/g, " ")), " ", markerSpacing, maybeHighlight(defs.marker, "^").repeat(numberOfMarkers)].join("");

        if (lastMarkerLine && opts.message) {
          markerLine += " " + maybeHighlight(defs.message, opts.message);
        }
      }

      return [maybeHighlight(defs.marker, ">"), maybeHighlight(defs.gutter, gutter), line.length > 0 ? ` ${line}` : "", markerLine].join("");
    } else {
      return ` ${maybeHighlight(defs.gutter, gutter)}${line.length > 0 ? ` ${line}` : ""}`;
    }
  }).join("\n");

  if (opts.message && !hasColumns) {
    frame = `${" ".repeat(numberMaxWidth + 1)}${opts.message}\n${frame}`;
  }

  if (highlighted) {
    return chalk.reset(frame);
  } else {
    return frame;
  }
}

function _default(rawLines, lineNumber, colNumber, opts = {}) {
  if (!deprecationWarningShown) {
    deprecationWarningShown = true;
    const message = "Passing lineNumber and colNumber is deprecated to @babel/code-frame. Please use `codeFrameColumns`.";

    if (process.emitWarning) {
      process.emitWarning(message, "DeprecationWarning");
    } else {
      const deprecationError = new Error(message);
      deprecationError.name = "DeprecationWarning";
      console.warn(new Error(message));
    }
  }

  colNumber = Math.max(colNumber, 0);
  const location = {
    start: {
      column: colNumber,
      line: lineNumber
    }
  };
  return codeFrameColumns(rawLines, location, opts);
}
}).call(this)}).call(this,require('_process'))
},{"@babel/highlight":6,"_process":40}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isIdentifierStart = isIdentifierStart;
exports.isIdentifierChar = isIdentifierChar;
exports.isIdentifierName = isIdentifierName;
let nonASCIIidentifierStartChars = "\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u037f\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u052f\u0531-\u0556\u0559\u0560-\u0588\u05d0-\u05ea\u05ef-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u0860-\u086a\u08a0-\u08b4\u08b6-\u08c7\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u09fc\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0af9\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c39\u0c3d\u0c58-\u0c5a\u0c60\u0c61\u0c80\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d04-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d54-\u0d56\u0d5f-\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e86-\u0e8a\u0e8c-\u0ea3\u0ea5\u0ea7-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f5\u13f8-\u13fd\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f8\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1878\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191e\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1c80-\u1c88\u1c90-\u1cba\u1cbd-\u1cbf\u1ce9-\u1cec\u1cee-\u1cf3\u1cf5\u1cf6\u1cfa\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2118-\u211d\u2124\u2126\u2128\u212a-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309b-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312f\u3131-\u318e\u31a0-\u31bf\u31f0-\u31ff\u3400-\u4dbf\u4e00-\u9ffc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua69d\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua7bf\ua7c2-\ua7ca\ua7f5-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua8fd\ua8fe\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\ua9e0-\ua9e4\ua9e6-\ua9ef\ua9fa-\ua9fe\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa7e-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uab30-\uab5a\uab5c-\uab69\uab70-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc";
let nonASCIIidentifierChars = "\u200c\u200d\xb7\u0300-\u036f\u0387\u0483-\u0487\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u0610-\u061a\u064b-\u0669\u0670\u06d6-\u06dc\u06df-\u06e4\u06e7\u06e8\u06ea-\u06ed\u06f0-\u06f9\u0711\u0730-\u074a\u07a6-\u07b0\u07c0-\u07c9\u07eb-\u07f3\u07fd\u0816-\u0819\u081b-\u0823\u0825-\u0827\u0829-\u082d\u0859-\u085b\u08d3-\u08e1\u08e3-\u0903\u093a-\u093c\u093e-\u094f\u0951-\u0957\u0962\u0963\u0966-\u096f\u0981-\u0983\u09bc\u09be-\u09c4\u09c7\u09c8\u09cb-\u09cd\u09d7\u09e2\u09e3\u09e6-\u09ef\u09fe\u0a01-\u0a03\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a66-\u0a71\u0a75\u0a81-\u0a83\u0abc\u0abe-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ae2\u0ae3\u0ae6-\u0aef\u0afa-\u0aff\u0b01-\u0b03\u0b3c\u0b3e-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b55-\u0b57\u0b62\u0b63\u0b66-\u0b6f\u0b82\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd7\u0be6-\u0bef\u0c00-\u0c04\u0c3e-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c62\u0c63\u0c66-\u0c6f\u0c81-\u0c83\u0cbc\u0cbe-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0ce2\u0ce3\u0ce6-\u0cef\u0d00-\u0d03\u0d3b\u0d3c\u0d3e-\u0d44\u0d46-\u0d48\u0d4a-\u0d4d\u0d57\u0d62\u0d63\u0d66-\u0d6f\u0d81-\u0d83\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0de6-\u0def\u0df2\u0df3\u0e31\u0e34-\u0e3a\u0e47-\u0e4e\u0e50-\u0e59\u0eb1\u0eb4-\u0ebc\u0ec8-\u0ecd\u0ed0-\u0ed9\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e\u0f3f\u0f71-\u0f84\u0f86\u0f87\u0f8d-\u0f97\u0f99-\u0fbc\u0fc6\u102b-\u103e\u1040-\u1049\u1056-\u1059\u105e-\u1060\u1062-\u1064\u1067-\u106d\u1071-\u1074\u1082-\u108d\u108f-\u109d\u135d-\u135f\u1369-\u1371\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17b4-\u17d3\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u18a9\u1920-\u192b\u1930-\u193b\u1946-\u194f\u19d0-\u19da\u1a17-\u1a1b\u1a55-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1ab0-\u1abd\u1abf\u1ac0\u1b00-\u1b04\u1b34-\u1b44\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1b82\u1ba1-\u1bad\u1bb0-\u1bb9\u1be6-\u1bf3\u1c24-\u1c37\u1c40-\u1c49\u1c50-\u1c59\u1cd0-\u1cd2\u1cd4-\u1ce8\u1ced\u1cf4\u1cf7-\u1cf9\u1dc0-\u1df9\u1dfb-\u1dff\u203f\u2040\u2054\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2cef-\u2cf1\u2d7f\u2de0-\u2dff\u302a-\u302f\u3099\u309a\ua620-\ua629\ua66f\ua674-\ua67d\ua69e\ua69f\ua6f0\ua6f1\ua802\ua806\ua80b\ua823-\ua827\ua82c\ua880\ua881\ua8b4-\ua8c5\ua8d0-\ua8d9\ua8e0-\ua8f1\ua8ff-\ua909\ua926-\ua92d\ua947-\ua953\ua980-\ua983\ua9b3-\ua9c0\ua9d0-\ua9d9\ua9e5\ua9f0-\ua9f9\uaa29-\uaa36\uaa43\uaa4c\uaa4d\uaa50-\uaa59\uaa7b-\uaa7d\uaab0\uaab2-\uaab4\uaab7\uaab8\uaabe\uaabf\uaac1\uaaeb-\uaaef\uaaf5\uaaf6\uabe3-\uabea\uabec\uabed\uabf0-\uabf9\ufb1e\ufe00-\ufe0f\ufe20-\ufe2f\ufe33\ufe34\ufe4d-\ufe4f\uff10-\uff19\uff3f";
const nonASCIIidentifierStart = new RegExp("[" + nonASCIIidentifierStartChars + "]");
const nonASCIIidentifier = new RegExp("[" + nonASCIIidentifierStartChars + nonASCIIidentifierChars + "]");
nonASCIIidentifierStartChars = nonASCIIidentifierChars = null;
const astralIdentifierStartCodes = [0, 11, 2, 25, 2, 18, 2, 1, 2, 14, 3, 13, 35, 122, 70, 52, 268, 28, 4, 48, 48, 31, 14, 29, 6, 37, 11, 29, 3, 35, 5, 7, 2, 4, 43, 157, 19, 35, 5, 35, 5, 39, 9, 51, 157, 310, 10, 21, 11, 7, 153, 5, 3, 0, 2, 43, 2, 1, 4, 0, 3, 22, 11, 22, 10, 30, 66, 18, 2, 1, 11, 21, 11, 25, 71, 55, 7, 1, 65, 0, 16, 3, 2, 2, 2, 28, 43, 28, 4, 28, 36, 7, 2, 27, 28, 53, 11, 21, 11, 18, 14, 17, 111, 72, 56, 50, 14, 50, 14, 35, 349, 41, 7, 1, 79, 28, 11, 0, 9, 21, 107, 20, 28, 22, 13, 52, 76, 44, 33, 24, 27, 35, 30, 0, 3, 0, 9, 34, 4, 0, 13, 47, 15, 3, 22, 0, 2, 0, 36, 17, 2, 24, 85, 6, 2, 0, 2, 3, 2, 14, 2, 9, 8, 46, 39, 7, 3, 1, 3, 21, 2, 6, 2, 1, 2, 4, 4, 0, 19, 0, 13, 4, 159, 52, 19, 3, 21, 2, 31, 47, 21, 1, 2, 0, 185, 46, 42, 3, 37, 47, 21, 0, 60, 42, 14, 0, 72, 26, 230, 43, 117, 63, 32, 7, 3, 0, 3, 7, 2, 1, 2, 23, 16, 0, 2, 0, 95, 7, 3, 38, 17, 0, 2, 0, 29, 0, 11, 39, 8, 0, 22, 0, 12, 45, 20, 0, 35, 56, 264, 8, 2, 36, 18, 0, 50, 29, 113, 6, 2, 1, 2, 37, 22, 0, 26, 5, 2, 1, 2, 31, 15, 0, 328, 18, 190, 0, 80, 921, 103, 110, 18, 195, 2749, 1070, 4050, 582, 8634, 568, 8, 30, 114, 29, 19, 47, 17, 3, 32, 20, 6, 18, 689, 63, 129, 74, 6, 0, 67, 12, 65, 1, 2, 0, 29, 6135, 9, 1237, 43, 8, 8952, 286, 50, 2, 18, 3, 9, 395, 2309, 106, 6, 12, 4, 8, 8, 9, 5991, 84, 2, 70, 2, 1, 3, 0, 3, 1, 3, 3, 2, 11, 2, 0, 2, 6, 2, 64, 2, 3, 3, 7, 2, 6, 2, 27, 2, 3, 2, 4, 2, 0, 4, 6, 2, 339, 3, 24, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 7, 2357, 44, 11, 6, 17, 0, 370, 43, 1301, 196, 60, 67, 8, 0, 1205, 3, 2, 26, 2, 1, 2, 0, 3, 0, 2, 9, 2, 3, 2, 0, 2, 0, 7, 0, 5, 0, 2, 0, 2, 0, 2, 2, 2, 1, 2, 0, 3, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 1, 2, 0, 3, 3, 2, 6, 2, 3, 2, 3, 2, 0, 2, 9, 2, 16, 6, 2, 2, 4, 2, 16, 4421, 42717, 35, 4148, 12, 221, 3, 5761, 15, 7472, 3104, 541, 1507, 4938];
const astralIdentifierCodes = [509, 0, 227, 0, 150, 4, 294, 9, 1368, 2, 2, 1, 6, 3, 41, 2, 5, 0, 166, 1, 574, 3, 9, 9, 370, 1, 154, 10, 176, 2, 54, 14, 32, 9, 16, 3, 46, 10, 54, 9, 7, 2, 37, 13, 2, 9, 6, 1, 45, 0, 13, 2, 49, 13, 9, 3, 2, 11, 83, 11, 7, 0, 161, 11, 6, 9, 7, 3, 56, 1, 2, 6, 3, 1, 3, 2, 10, 0, 11, 1, 3, 6, 4, 4, 193, 17, 10, 9, 5, 0, 82, 19, 13, 9, 214, 6, 3, 8, 28, 1, 83, 16, 16, 9, 82, 12, 9, 9, 84, 14, 5, 9, 243, 14, 166, 9, 71, 5, 2, 1, 3, 3, 2, 0, 2, 1, 13, 9, 120, 6, 3, 6, 4, 0, 29, 9, 41, 6, 2, 3, 9, 0, 10, 10, 47, 15, 406, 7, 2, 7, 17, 9, 57, 21, 2, 13, 123, 5, 4, 0, 2, 1, 2, 6, 2, 0, 9, 9, 49, 4, 2, 1, 2, 4, 9, 9, 330, 3, 19306, 9, 135, 4, 60, 6, 26, 9, 1014, 0, 2, 54, 8, 3, 82, 0, 12, 1, 19628, 1, 5319, 4, 4, 5, 9, 7, 3, 6, 31, 3, 149, 2, 1418, 49, 513, 54, 5, 49, 9, 0, 15, 0, 23, 4, 2, 14, 1361, 6, 2, 16, 3, 6, 2, 1, 2, 4, 262, 6, 10, 9, 419, 13, 1495, 6, 110, 6, 6, 9, 4759, 9, 787719, 239];

function isInAstralSet(code, set) {
  let pos = 0x10000;

  for (let i = 0, length = set.length; i < length; i += 2) {
    pos += set[i];
    if (pos > code) return false;
    pos += set[i + 1];
    if (pos >= code) return true;
  }

  return false;
}

function isIdentifierStart(code) {
  if (code < 65) return code === 36;
  if (code <= 90) return true;
  if (code < 97) return code === 95;
  if (code <= 122) return true;

  if (code <= 0xffff) {
    return code >= 0xaa && nonASCIIidentifierStart.test(String.fromCharCode(code));
  }

  return isInAstralSet(code, astralIdentifierStartCodes);
}

function isIdentifierChar(code) {
  if (code < 48) return code === 36;
  if (code < 58) return true;
  if (code < 65) return false;
  if (code <= 90) return true;
  if (code < 97) return code === 95;
  if (code <= 122) return true;

  if (code <= 0xffff) {
    return code >= 0xaa && nonASCIIidentifier.test(String.fromCharCode(code));
  }

  return isInAstralSet(code, astralIdentifierStartCodes) || isInAstralSet(code, astralIdentifierCodes);
}

function isIdentifierName(name) {
  let isFirst = true;

  for (let _i = 0, _Array$from = Array.from(name); _i < _Array$from.length; _i++) {
    const char = _Array$from[_i];
    const cp = char.codePointAt(0);

    if (isFirst) {
      if (!isIdentifierStart(cp)) {
        return false;
      }

      isFirst = false;
    } else if (!isIdentifierChar(cp)) {
      return false;
    }
  }

  return !isFirst;
}
},{}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "isIdentifierName", {
  enumerable: true,
  get: function () {
    return _identifier.isIdentifierName;
  }
});
Object.defineProperty(exports, "isIdentifierChar", {
  enumerable: true,
  get: function () {
    return _identifier.isIdentifierChar;
  }
});
Object.defineProperty(exports, "isIdentifierStart", {
  enumerable: true,
  get: function () {
    return _identifier.isIdentifierStart;
  }
});
Object.defineProperty(exports, "isReservedWord", {
  enumerable: true,
  get: function () {
    return _keyword.isReservedWord;
  }
});
Object.defineProperty(exports, "isStrictBindOnlyReservedWord", {
  enumerable: true,
  get: function () {
    return _keyword.isStrictBindOnlyReservedWord;
  }
});
Object.defineProperty(exports, "isStrictBindReservedWord", {
  enumerable: true,
  get: function () {
    return _keyword.isStrictBindReservedWord;
  }
});
Object.defineProperty(exports, "isStrictReservedWord", {
  enumerable: true,
  get: function () {
    return _keyword.isStrictReservedWord;
  }
});
Object.defineProperty(exports, "isKeyword", {
  enumerable: true,
  get: function () {
    return _keyword.isKeyword;
  }
});

var _identifier = require("./identifier");

var _keyword = require("./keyword");
},{"./identifier":3,"./keyword":5}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isReservedWord = isReservedWord;
exports.isStrictReservedWord = isStrictReservedWord;
exports.isStrictBindOnlyReservedWord = isStrictBindOnlyReservedWord;
exports.isStrictBindReservedWord = isStrictBindReservedWord;
exports.isKeyword = isKeyword;
const reservedWords = {
  keyword: ["break", "case", "catch", "continue", "debugger", "default", "do", "else", "finally", "for", "function", "if", "return", "switch", "throw", "try", "var", "const", "while", "with", "new", "this", "super", "class", "extends", "export", "import", "null", "true", "false", "in", "instanceof", "typeof", "void", "delete"],
  strict: ["implements", "interface", "let", "package", "private", "protected", "public", "static", "yield"],
  strictBind: ["eval", "arguments"]
};
const keywords = new Set(reservedWords.keyword);
const reservedWordsStrictSet = new Set(reservedWords.strict);
const reservedWordsStrictBindSet = new Set(reservedWords.strictBind);

function isReservedWord(word, inModule) {
  return inModule && word === "await" || word === "enum";
}

function isStrictReservedWord(word, inModule) {
  return isReservedWord(word, inModule) || reservedWordsStrictSet.has(word);
}

function isStrictBindOnlyReservedWord(word) {
  return reservedWordsStrictBindSet.has(word);
}

function isStrictBindReservedWord(word, inModule) {
  return isStrictReservedWord(word, inModule) || isStrictBindOnlyReservedWord(word);
}

function isKeyword(word) {
  return keywords.has(word);
}
},{}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.shouldHighlight = shouldHighlight;
exports.getChalk = getChalk;
exports.default = highlight;

var _helperValidatorIdentifier = require("@babel/helper-validator-identifier");

const jsTokens = require("js-tokens");

const Chalk = require("chalk");

const sometimesKeywords = new Set(["as", "async", "from", "get", "of", "set"]);

function getDefs(chalk) {
  return {
    keyword: chalk.cyan,
    capitalized: chalk.yellow,
    jsxIdentifier: chalk.yellow,
    punctuator: chalk.yellow,
    number: chalk.magenta,
    string: chalk.green,
    regex: chalk.magenta,
    comment: chalk.grey,
    invalid: chalk.white.bgRed.bold
  };
}

const NEWLINE = /\r\n|[\n\r\u2028\u2029]/;
const BRACKET = /^[()[\]{}]$/;
let tokenize;
{
  const JSX_TAG = /^[a-z][\w-]*$/i;

  const getTokenType = function (token, offset, text) {
    if (token.type === "name") {
      if ((0, _helperValidatorIdentifier.isKeyword)(token.value) || (0, _helperValidatorIdentifier.isStrictReservedWord)(token.value, true) || sometimesKeywords.has(token.value)) {
        return "keyword";
      }

      if (JSX_TAG.test(token.value) && (text[offset - 1] === "<" || text.substr(offset - 2, 2) == "</")) {
        return "jsxIdentifier";
      }

      if (token.value[0] !== token.value[0].toLowerCase()) {
        return "capitalized";
      }
    }

    if (token.type === "punctuator" && BRACKET.test(token.value)) {
      return "bracket";
    }

    if (token.type === "invalid" && (token.value === "@" || token.value === "#")) {
      return "punctuator";
    }

    return token.type;
  };

  tokenize = function* (text) {
    let match;

    while (match = jsTokens.default.exec(text)) {
      const token = jsTokens.matchToToken(match);
      yield {
        type: getTokenType(token, match.index, text),
        value: token.value
      };
    }
  };
}

function highlightTokens(defs, text) {
  let highlighted = "";

  for (const {
    type,
    value
  } of tokenize(text)) {
    const colorize = defs[type];

    if (colorize) {
      highlighted += value.split(NEWLINE).map(str => colorize(str)).join("\n");
    } else {
      highlighted += value;
    }
  }

  return highlighted;
}

function shouldHighlight(options) {
  return !!Chalk.supportsColor || options.forceColor;
}

function getChalk(options) {
  return options.forceColor ? new Chalk.constructor({
    enabled: true,
    level: 1
  }) : Chalk;
}

function highlight(code, options = {}) {
  if (shouldHighlight(options)) {
    const chalk = getChalk(options);
    const defs = getDefs(chalk);
    return highlightTokens(defs, code);
  } else {
    return code;
  }
}
},{"@babel/helper-validator-identifier":4,"chalk":8,"js-tokens":19}],7:[function(require,module,exports){
'use strict';
const colorConvert = require('color-convert');

const wrapAnsi16 = (fn, offset) => function () {
	const code = fn.apply(colorConvert, arguments);
	return `\u001B[${code + offset}m`;
};

const wrapAnsi256 = (fn, offset) => function () {
	const code = fn.apply(colorConvert, arguments);
	return `\u001B[${38 + offset};5;${code}m`;
};

const wrapAnsi16m = (fn, offset) => function () {
	const rgb = fn.apply(colorConvert, arguments);
	return `\u001B[${38 + offset};2;${rgb[0]};${rgb[1]};${rgb[2]}m`;
};

function assembleStyles() {
	const codes = new Map();
	const styles = {
		modifier: {
			reset: [0, 0],
			// 21 isn't widely supported and 22 does the same thing
			bold: [1, 22],
			dim: [2, 22],
			italic: [3, 23],
			underline: [4, 24],
			inverse: [7, 27],
			hidden: [8, 28],
			strikethrough: [9, 29]
		},
		color: {
			black: [30, 39],
			red: [31, 39],
			green: [32, 39],
			yellow: [33, 39],
			blue: [34, 39],
			magenta: [35, 39],
			cyan: [36, 39],
			white: [37, 39],
			gray: [90, 39],

			// Bright color
			redBright: [91, 39],
			greenBright: [92, 39],
			yellowBright: [93, 39],
			blueBright: [94, 39],
			magentaBright: [95, 39],
			cyanBright: [96, 39],
			whiteBright: [97, 39]
		},
		bgColor: {
			bgBlack: [40, 49],
			bgRed: [41, 49],
			bgGreen: [42, 49],
			bgYellow: [43, 49],
			bgBlue: [44, 49],
			bgMagenta: [45, 49],
			bgCyan: [46, 49],
			bgWhite: [47, 49],

			// Bright color
			bgBlackBright: [100, 49],
			bgRedBright: [101, 49],
			bgGreenBright: [102, 49],
			bgYellowBright: [103, 49],
			bgBlueBright: [104, 49],
			bgMagentaBright: [105, 49],
			bgCyanBright: [106, 49],
			bgWhiteBright: [107, 49]
		}
	};

	// Fix humans
	styles.color.grey = styles.color.gray;

	for (const groupName of Object.keys(styles)) {
		const group = styles[groupName];

		for (const styleName of Object.keys(group)) {
			const style = group[styleName];

			styles[styleName] = {
				open: `\u001B[${style[0]}m`,
				close: `\u001B[${style[1]}m`
			};

			group[styleName] = styles[styleName];

			codes.set(style[0], style[1]);
		}

		Object.defineProperty(styles, groupName, {
			value: group,
			enumerable: false
		});

		Object.defineProperty(styles, 'codes', {
			value: codes,
			enumerable: false
		});
	}

	const ansi2ansi = n => n;
	const rgb2rgb = (r, g, b) => [r, g, b];

	styles.color.close = '\u001B[39m';
	styles.bgColor.close = '\u001B[49m';

	styles.color.ansi = {
		ansi: wrapAnsi16(ansi2ansi, 0)
	};
	styles.color.ansi256 = {
		ansi256: wrapAnsi256(ansi2ansi, 0)
	};
	styles.color.ansi16m = {
		rgb: wrapAnsi16m(rgb2rgb, 0)
	};

	styles.bgColor.ansi = {
		ansi: wrapAnsi16(ansi2ansi, 10)
	};
	styles.bgColor.ansi256 = {
		ansi256: wrapAnsi256(ansi2ansi, 10)
	};
	styles.bgColor.ansi16m = {
		rgb: wrapAnsi16m(rgb2rgb, 10)
	};

	for (let key of Object.keys(colorConvert)) {
		if (typeof colorConvert[key] !== 'object') {
			continue;
		}

		const suite = colorConvert[key];

		if (key === 'ansi16') {
			key = 'ansi';
		}

		if ('ansi16' in suite) {
			styles.color.ansi[key] = wrapAnsi16(suite.ansi16, 0);
			styles.bgColor.ansi[key] = wrapAnsi16(suite.ansi16, 10);
		}

		if ('ansi256' in suite) {
			styles.color.ansi256[key] = wrapAnsi256(suite.ansi256, 0);
			styles.bgColor.ansi256[key] = wrapAnsi256(suite.ansi256, 10);
		}

		if ('rgb' in suite) {
			styles.color.ansi16m[key] = wrapAnsi16m(suite.rgb, 0);
			styles.bgColor.ansi16m[key] = wrapAnsi16m(suite.rgb, 10);
		}
	}

	return styles;
}

// Make the export immutable
Object.defineProperty(module, 'exports', {
	enumerable: true,
	get: assembleStyles
});

},{"color-convert":11}],8:[function(require,module,exports){
(function (process){(function (){
'use strict';
const escapeStringRegexp = require('escape-string-regexp');
const ansiStyles = require('ansi-styles');
const stdoutColor = require('supports-color').stdout;

const template = require('./templates.js');

const isSimpleWindowsTerm = process.platform === 'win32' && !(process.env.TERM || '').toLowerCase().startsWith('xterm');

// `supportsColor.level` → `ansiStyles.color[name]` mapping
const levelMapping = ['ansi', 'ansi', 'ansi256', 'ansi16m'];

// `color-convert` models to exclude from the Chalk API due to conflicts and such
const skipModels = new Set(['gray']);

const styles = Object.create(null);

function applyOptions(obj, options) {
	options = options || {};

	// Detect level if not set manually
	const scLevel = stdoutColor ? stdoutColor.level : 0;
	obj.level = options.level === undefined ? scLevel : options.level;
	obj.enabled = 'enabled' in options ? options.enabled : obj.level > 0;
}

function Chalk(options) {
	// We check for this.template here since calling `chalk.constructor()`
	// by itself will have a `this` of a previously constructed chalk object
	if (!this || !(this instanceof Chalk) || this.template) {
		const chalk = {};
		applyOptions(chalk, options);

		chalk.template = function () {
			const args = [].slice.call(arguments);
			return chalkTag.apply(null, [chalk.template].concat(args));
		};

		Object.setPrototypeOf(chalk, Chalk.prototype);
		Object.setPrototypeOf(chalk.template, chalk);

		chalk.template.constructor = Chalk;

		return chalk.template;
	}

	applyOptions(this, options);
}

// Use bright blue on Windows as the normal blue color is illegible
if (isSimpleWindowsTerm) {
	ansiStyles.blue.open = '\u001B[94m';
}

for (const key of Object.keys(ansiStyles)) {
	ansiStyles[key].closeRe = new RegExp(escapeStringRegexp(ansiStyles[key].close), 'g');

	styles[key] = {
		get() {
			const codes = ansiStyles[key];
			return build.call(this, this._styles ? this._styles.concat(codes) : [codes], this._empty, key);
		}
	};
}

styles.visible = {
	get() {
		return build.call(this, this._styles || [], true, 'visible');
	}
};

ansiStyles.color.closeRe = new RegExp(escapeStringRegexp(ansiStyles.color.close), 'g');
for (const model of Object.keys(ansiStyles.color.ansi)) {
	if (skipModels.has(model)) {
		continue;
	}

	styles[model] = {
		get() {
			const level = this.level;
			return function () {
				const open = ansiStyles.color[levelMapping[level]][model].apply(null, arguments);
				const codes = {
					open,
					close: ansiStyles.color.close,
					closeRe: ansiStyles.color.closeRe
				};
				return build.call(this, this._styles ? this._styles.concat(codes) : [codes], this._empty, model);
			};
		}
	};
}

ansiStyles.bgColor.closeRe = new RegExp(escapeStringRegexp(ansiStyles.bgColor.close), 'g');
for (const model of Object.keys(ansiStyles.bgColor.ansi)) {
	if (skipModels.has(model)) {
		continue;
	}

	const bgModel = 'bg' + model[0].toUpperCase() + model.slice(1);
	styles[bgModel] = {
		get() {
			const level = this.level;
			return function () {
				const open = ansiStyles.bgColor[levelMapping[level]][model].apply(null, arguments);
				const codes = {
					open,
					close: ansiStyles.bgColor.close,
					closeRe: ansiStyles.bgColor.closeRe
				};
				return build.call(this, this._styles ? this._styles.concat(codes) : [codes], this._empty, model);
			};
		}
	};
}

const proto = Object.defineProperties(() => {}, styles);

function build(_styles, _empty, key) {
	const builder = function () {
		return applyStyle.apply(builder, arguments);
	};

	builder._styles = _styles;
	builder._empty = _empty;

	const self = this;

	Object.defineProperty(builder, 'level', {
		enumerable: true,
		get() {
			return self.level;
		},
		set(level) {
			self.level = level;
		}
	});

	Object.defineProperty(builder, 'enabled', {
		enumerable: true,
		get() {
			return self.enabled;
		},
		set(enabled) {
			self.enabled = enabled;
		}
	});

	// See below for fix regarding invisible grey/dim combination on Windows
	builder.hasGrey = this.hasGrey || key === 'gray' || key === 'grey';

	// `__proto__` is used because we must return a function, but there is
	// no way to create a function with a different prototype
	builder.__proto__ = proto; // eslint-disable-line no-proto

	return builder;
}

function applyStyle() {
	// Support varags, but simply cast to string in case there's only one arg
	const args = arguments;
	const argsLen = args.length;
	let str = String(arguments[0]);

	if (argsLen === 0) {
		return '';
	}

	if (argsLen > 1) {
		// Don't slice `arguments`, it prevents V8 optimizations
		for (let a = 1; a < argsLen; a++) {
			str += ' ' + args[a];
		}
	}

	if (!this.enabled || this.level <= 0 || !str) {
		return this._empty ? '' : str;
	}

	// Turns out that on Windows dimmed gray text becomes invisible in cmd.exe,
	// see https://github.com/chalk/chalk/issues/58
	// If we're on Windows and we're dealing with a gray color, temporarily make 'dim' a noop.
	const originalDim = ansiStyles.dim.open;
	if (isSimpleWindowsTerm && this.hasGrey) {
		ansiStyles.dim.open = '';
	}

	for (const code of this._styles.slice().reverse()) {
		// Replace any instances already present with a re-opening code
		// otherwise only the part of the string until said closing code
		// will be colored, and the rest will simply be 'plain'.
		str = code.open + str.replace(code.closeRe, code.open) + code.close;

		// Close the styling before a linebreak and reopen
		// after next line to fix a bleed issue on macOS
		// https://github.com/chalk/chalk/pull/92
		str = str.replace(/\r?\n/g, `${code.close}$&${code.open}`);
	}

	// Reset the original `dim` if we changed it to work around the Windows dimmed gray issue
	ansiStyles.dim.open = originalDim;

	return str;
}

function chalkTag(chalk, strings) {
	if (!Array.isArray(strings)) {
		// If chalk() was called by itself or with a string,
		// return the string itself as a string.
		return [].slice.call(arguments, 1).join(' ');
	}

	const args = [].slice.call(arguments, 2);
	const parts = [strings.raw[0]];

	for (let i = 1; i < strings.length; i++) {
		parts.push(String(args[i - 1]).replace(/[{}\\]/g, '\\$&'));
		parts.push(String(strings.raw[i]));
	}

	return template(chalk, parts.join(''));
}

Object.defineProperties(Chalk.prototype, styles);

module.exports = Chalk(); // eslint-disable-line new-cap
module.exports.supportsColor = stdoutColor;
module.exports.default = module.exports; // For TypeScript

}).call(this)}).call(this,require('_process'))
},{"./templates.js":9,"_process":40,"ansi-styles":7,"escape-string-regexp":17,"supports-color":14}],9:[function(require,module,exports){
'use strict';
const TEMPLATE_REGEX = /(?:\\(u[a-f\d]{4}|x[a-f\d]{2}|.))|(?:\{(~)?(\w+(?:\([^)]*\))?(?:\.\w+(?:\([^)]*\))?)*)(?:[ \t]|(?=\r?\n)))|(\})|((?:.|[\r\n\f])+?)/gi;
const STYLE_REGEX = /(?:^|\.)(\w+)(?:\(([^)]*)\))?/g;
const STRING_REGEX = /^(['"])((?:\\.|(?!\1)[^\\])*)\1$/;
const ESCAPE_REGEX = /\\(u[a-f\d]{4}|x[a-f\d]{2}|.)|([^\\])/gi;

const ESCAPES = new Map([
	['n', '\n'],
	['r', '\r'],
	['t', '\t'],
	['b', '\b'],
	['f', '\f'],
	['v', '\v'],
	['0', '\0'],
	['\\', '\\'],
	['e', '\u001B'],
	['a', '\u0007']
]);

function unescape(c) {
	if ((c[0] === 'u' && c.length === 5) || (c[0] === 'x' && c.length === 3)) {
		return String.fromCharCode(parseInt(c.slice(1), 16));
	}

	return ESCAPES.get(c) || c;
}

function parseArguments(name, args) {
	const results = [];
	const chunks = args.trim().split(/\s*,\s*/g);
	let matches;

	for (const chunk of chunks) {
		if (!isNaN(chunk)) {
			results.push(Number(chunk));
		} else if ((matches = chunk.match(STRING_REGEX))) {
			results.push(matches[2].replace(ESCAPE_REGEX, (m, escape, chr) => escape ? unescape(escape) : chr));
		} else {
			throw new Error(`Invalid Chalk template style argument: ${chunk} (in style '${name}')`);
		}
	}

	return results;
}

function parseStyle(style) {
	STYLE_REGEX.lastIndex = 0;

	const results = [];
	let matches;

	while ((matches = STYLE_REGEX.exec(style)) !== null) {
		const name = matches[1];

		if (matches[2]) {
			const args = parseArguments(name, matches[2]);
			results.push([name].concat(args));
		} else {
			results.push([name]);
		}
	}

	return results;
}

function buildStyle(chalk, styles) {
	const enabled = {};

	for (const layer of styles) {
		for (const style of layer.styles) {
			enabled[style[0]] = layer.inverse ? null : style.slice(1);
		}
	}

	let current = chalk;
	for (const styleName of Object.keys(enabled)) {
		if (Array.isArray(enabled[styleName])) {
			if (!(styleName in current)) {
				throw new Error(`Unknown Chalk style: ${styleName}`);
			}

			if (enabled[styleName].length > 0) {
				current = current[styleName].apply(current, enabled[styleName]);
			} else {
				current = current[styleName];
			}
		}
	}

	return current;
}

module.exports = (chalk, tmp) => {
	const styles = [];
	const chunks = [];
	let chunk = [];

	// eslint-disable-next-line max-params
	tmp.replace(TEMPLATE_REGEX, (m, escapeChar, inverse, style, close, chr) => {
		if (escapeChar) {
			chunk.push(unescape(escapeChar));
		} else if (style) {
			const str = chunk.join('');
			chunk = [];
			chunks.push(styles.length === 0 ? str : buildStyle(chalk, styles)(str));
			styles.push({inverse, styles: parseStyle(style)});
		} else if (close) {
			if (styles.length === 0) {
				throw new Error('Found extraneous } in Chalk template literal');
			}

			chunks.push(buildStyle(chalk, styles)(chunk.join('')));
			chunk = [];
			styles.pop();
		} else {
			chunk.push(chr);
		}
	});

	chunks.push(chunk.join(''));

	if (styles.length > 0) {
		const errMsg = `Chalk template literal is missing ${styles.length} closing bracket${styles.length === 1 ? '' : 's'} (\`}\`)`;
		throw new Error(errMsg);
	}

	return chunks.join('');
};

},{}],10:[function(require,module,exports){
/* MIT license */
var cssKeywords = require('color-name');

// NOTE: conversions should only return primitive values (i.e. arrays, or
//       values that give correct `typeof` results).
//       do not use box values types (i.e. Number(), String(), etc.)

var reverseKeywords = {};
for (var key in cssKeywords) {
	if (cssKeywords.hasOwnProperty(key)) {
		reverseKeywords[cssKeywords[key]] = key;
	}
}

var convert = module.exports = {
	rgb: {channels: 3, labels: 'rgb'},
	hsl: {channels: 3, labels: 'hsl'},
	hsv: {channels: 3, labels: 'hsv'},
	hwb: {channels: 3, labels: 'hwb'},
	cmyk: {channels: 4, labels: 'cmyk'},
	xyz: {channels: 3, labels: 'xyz'},
	lab: {channels: 3, labels: 'lab'},
	lch: {channels: 3, labels: 'lch'},
	hex: {channels: 1, labels: ['hex']},
	keyword: {channels: 1, labels: ['keyword']},
	ansi16: {channels: 1, labels: ['ansi16']},
	ansi256: {channels: 1, labels: ['ansi256']},
	hcg: {channels: 3, labels: ['h', 'c', 'g']},
	apple: {channels: 3, labels: ['r16', 'g16', 'b16']},
	gray: {channels: 1, labels: ['gray']}
};

// hide .channels and .labels properties
for (var model in convert) {
	if (convert.hasOwnProperty(model)) {
		if (!('channels' in convert[model])) {
			throw new Error('missing channels property: ' + model);
		}

		if (!('labels' in convert[model])) {
			throw new Error('missing channel labels property: ' + model);
		}

		if (convert[model].labels.length !== convert[model].channels) {
			throw new Error('channel and label counts mismatch: ' + model);
		}

		var channels = convert[model].channels;
		var labels = convert[model].labels;
		delete convert[model].channels;
		delete convert[model].labels;
		Object.defineProperty(convert[model], 'channels', {value: channels});
		Object.defineProperty(convert[model], 'labels', {value: labels});
	}
}

convert.rgb.hsl = function (rgb) {
	var r = rgb[0] / 255;
	var g = rgb[1] / 255;
	var b = rgb[2] / 255;
	var min = Math.min(r, g, b);
	var max = Math.max(r, g, b);
	var delta = max - min;
	var h;
	var s;
	var l;

	if (max === min) {
		h = 0;
	} else if (r === max) {
		h = (g - b) / delta;
	} else if (g === max) {
		h = 2 + (b - r) / delta;
	} else if (b === max) {
		h = 4 + (r - g) / delta;
	}

	h = Math.min(h * 60, 360);

	if (h < 0) {
		h += 360;
	}

	l = (min + max) / 2;

	if (max === min) {
		s = 0;
	} else if (l <= 0.5) {
		s = delta / (max + min);
	} else {
		s = delta / (2 - max - min);
	}

	return [h, s * 100, l * 100];
};

convert.rgb.hsv = function (rgb) {
	var rdif;
	var gdif;
	var bdif;
	var h;
	var s;

	var r = rgb[0] / 255;
	var g = rgb[1] / 255;
	var b = rgb[2] / 255;
	var v = Math.max(r, g, b);
	var diff = v - Math.min(r, g, b);
	var diffc = function (c) {
		return (v - c) / 6 / diff + 1 / 2;
	};

	if (diff === 0) {
		h = s = 0;
	} else {
		s = diff / v;
		rdif = diffc(r);
		gdif = diffc(g);
		bdif = diffc(b);

		if (r === v) {
			h = bdif - gdif;
		} else if (g === v) {
			h = (1 / 3) + rdif - bdif;
		} else if (b === v) {
			h = (2 / 3) + gdif - rdif;
		}
		if (h < 0) {
			h += 1;
		} else if (h > 1) {
			h -= 1;
		}
	}

	return [
		h * 360,
		s * 100,
		v * 100
	];
};

convert.rgb.hwb = function (rgb) {
	var r = rgb[0];
	var g = rgb[1];
	var b = rgb[2];
	var h = convert.rgb.hsl(rgb)[0];
	var w = 1 / 255 * Math.min(r, Math.min(g, b));

	b = 1 - 1 / 255 * Math.max(r, Math.max(g, b));

	return [h, w * 100, b * 100];
};

convert.rgb.cmyk = function (rgb) {
	var r = rgb[0] / 255;
	var g = rgb[1] / 255;
	var b = rgb[2] / 255;
	var c;
	var m;
	var y;
	var k;

	k = Math.min(1 - r, 1 - g, 1 - b);
	c = (1 - r - k) / (1 - k) || 0;
	m = (1 - g - k) / (1 - k) || 0;
	y = (1 - b - k) / (1 - k) || 0;

	return [c * 100, m * 100, y * 100, k * 100];
};

/**
 * See https://en.m.wikipedia.org/wiki/Euclidean_distance#Squared_Euclidean_distance
 * */
function comparativeDistance(x, y) {
	return (
		Math.pow(x[0] - y[0], 2) +
		Math.pow(x[1] - y[1], 2) +
		Math.pow(x[2] - y[2], 2)
	);
}

convert.rgb.keyword = function (rgb) {
	var reversed = reverseKeywords[rgb];
	if (reversed) {
		return reversed;
	}

	var currentClosestDistance = Infinity;
	var currentClosestKeyword;

	for (var keyword in cssKeywords) {
		if (cssKeywords.hasOwnProperty(keyword)) {
			var value = cssKeywords[keyword];

			// Compute comparative distance
			var distance = comparativeDistance(rgb, value);

			// Check if its less, if so set as closest
			if (distance < currentClosestDistance) {
				currentClosestDistance = distance;
				currentClosestKeyword = keyword;
			}
		}
	}

	return currentClosestKeyword;
};

convert.keyword.rgb = function (keyword) {
	return cssKeywords[keyword];
};

convert.rgb.xyz = function (rgb) {
	var r = rgb[0] / 255;
	var g = rgb[1] / 255;
	var b = rgb[2] / 255;

	// assume sRGB
	r = r > 0.04045 ? Math.pow(((r + 0.055) / 1.055), 2.4) : (r / 12.92);
	g = g > 0.04045 ? Math.pow(((g + 0.055) / 1.055), 2.4) : (g / 12.92);
	b = b > 0.04045 ? Math.pow(((b + 0.055) / 1.055), 2.4) : (b / 12.92);

	var x = (r * 0.4124) + (g * 0.3576) + (b * 0.1805);
	var y = (r * 0.2126) + (g * 0.7152) + (b * 0.0722);
	var z = (r * 0.0193) + (g * 0.1192) + (b * 0.9505);

	return [x * 100, y * 100, z * 100];
};

convert.rgb.lab = function (rgb) {
	var xyz = convert.rgb.xyz(rgb);
	var x = xyz[0];
	var y = xyz[1];
	var z = xyz[2];
	var l;
	var a;
	var b;

	x /= 95.047;
	y /= 100;
	z /= 108.883;

	x = x > 0.008856 ? Math.pow(x, 1 / 3) : (7.787 * x) + (16 / 116);
	y = y > 0.008856 ? Math.pow(y, 1 / 3) : (7.787 * y) + (16 / 116);
	z = z > 0.008856 ? Math.pow(z, 1 / 3) : (7.787 * z) + (16 / 116);

	l = (116 * y) - 16;
	a = 500 * (x - y);
	b = 200 * (y - z);

	return [l, a, b];
};

convert.hsl.rgb = function (hsl) {
	var h = hsl[0] / 360;
	var s = hsl[1] / 100;
	var l = hsl[2] / 100;
	var t1;
	var t2;
	var t3;
	var rgb;
	var val;

	if (s === 0) {
		val = l * 255;
		return [val, val, val];
	}

	if (l < 0.5) {
		t2 = l * (1 + s);
	} else {
		t2 = l + s - l * s;
	}

	t1 = 2 * l - t2;

	rgb = [0, 0, 0];
	for (var i = 0; i < 3; i++) {
		t3 = h + 1 / 3 * -(i - 1);
		if (t3 < 0) {
			t3++;
		}
		if (t3 > 1) {
			t3--;
		}

		if (6 * t3 < 1) {
			val = t1 + (t2 - t1) * 6 * t3;
		} else if (2 * t3 < 1) {
			val = t2;
		} else if (3 * t3 < 2) {
			val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
		} else {
			val = t1;
		}

		rgb[i] = val * 255;
	}

	return rgb;
};

convert.hsl.hsv = function (hsl) {
	var h = hsl[0];
	var s = hsl[1] / 100;
	var l = hsl[2] / 100;
	var smin = s;
	var lmin = Math.max(l, 0.01);
	var sv;
	var v;

	l *= 2;
	s *= (l <= 1) ? l : 2 - l;
	smin *= lmin <= 1 ? lmin : 2 - lmin;
	v = (l + s) / 2;
	sv = l === 0 ? (2 * smin) / (lmin + smin) : (2 * s) / (l + s);

	return [h, sv * 100, v * 100];
};

convert.hsv.rgb = function (hsv) {
	var h = hsv[0] / 60;
	var s = hsv[1] / 100;
	var v = hsv[2] / 100;
	var hi = Math.floor(h) % 6;

	var f = h - Math.floor(h);
	var p = 255 * v * (1 - s);
	var q = 255 * v * (1 - (s * f));
	var t = 255 * v * (1 - (s * (1 - f)));
	v *= 255;

	switch (hi) {
		case 0:
			return [v, t, p];
		case 1:
			return [q, v, p];
		case 2:
			return [p, v, t];
		case 3:
			return [p, q, v];
		case 4:
			return [t, p, v];
		case 5:
			return [v, p, q];
	}
};

convert.hsv.hsl = function (hsv) {
	var h = hsv[0];
	var s = hsv[1] / 100;
	var v = hsv[2] / 100;
	var vmin = Math.max(v, 0.01);
	var lmin;
	var sl;
	var l;

	l = (2 - s) * v;
	lmin = (2 - s) * vmin;
	sl = s * vmin;
	sl /= (lmin <= 1) ? lmin : 2 - lmin;
	sl = sl || 0;
	l /= 2;

	return [h, sl * 100, l * 100];
};

// http://dev.w3.org/csswg/css-color/#hwb-to-rgb
convert.hwb.rgb = function (hwb) {
	var h = hwb[0] / 360;
	var wh = hwb[1] / 100;
	var bl = hwb[2] / 100;
	var ratio = wh + bl;
	var i;
	var v;
	var f;
	var n;

	// wh + bl cant be > 1
	if (ratio > 1) {
		wh /= ratio;
		bl /= ratio;
	}

	i = Math.floor(6 * h);
	v = 1 - bl;
	f = 6 * h - i;

	if ((i & 0x01) !== 0) {
		f = 1 - f;
	}

	n = wh + f * (v - wh); // linear interpolation

	var r;
	var g;
	var b;
	switch (i) {
		default:
		case 6:
		case 0: r = v; g = n; b = wh; break;
		case 1: r = n; g = v; b = wh; break;
		case 2: r = wh; g = v; b = n; break;
		case 3: r = wh; g = n; b = v; break;
		case 4: r = n; g = wh; b = v; break;
		case 5: r = v; g = wh; b = n; break;
	}

	return [r * 255, g * 255, b * 255];
};

convert.cmyk.rgb = function (cmyk) {
	var c = cmyk[0] / 100;
	var m = cmyk[1] / 100;
	var y = cmyk[2] / 100;
	var k = cmyk[3] / 100;
	var r;
	var g;
	var b;

	r = 1 - Math.min(1, c * (1 - k) + k);
	g = 1 - Math.min(1, m * (1 - k) + k);
	b = 1 - Math.min(1, y * (1 - k) + k);

	return [r * 255, g * 255, b * 255];
};

convert.xyz.rgb = function (xyz) {
	var x = xyz[0] / 100;
	var y = xyz[1] / 100;
	var z = xyz[2] / 100;
	var r;
	var g;
	var b;

	r = (x * 3.2406) + (y * -1.5372) + (z * -0.4986);
	g = (x * -0.9689) + (y * 1.8758) + (z * 0.0415);
	b = (x * 0.0557) + (y * -0.2040) + (z * 1.0570);

	// assume sRGB
	r = r > 0.0031308
		? ((1.055 * Math.pow(r, 1.0 / 2.4)) - 0.055)
		: r * 12.92;

	g = g > 0.0031308
		? ((1.055 * Math.pow(g, 1.0 / 2.4)) - 0.055)
		: g * 12.92;

	b = b > 0.0031308
		? ((1.055 * Math.pow(b, 1.0 / 2.4)) - 0.055)
		: b * 12.92;

	r = Math.min(Math.max(0, r), 1);
	g = Math.min(Math.max(0, g), 1);
	b = Math.min(Math.max(0, b), 1);

	return [r * 255, g * 255, b * 255];
};

convert.xyz.lab = function (xyz) {
	var x = xyz[0];
	var y = xyz[1];
	var z = xyz[2];
	var l;
	var a;
	var b;

	x /= 95.047;
	y /= 100;
	z /= 108.883;

	x = x > 0.008856 ? Math.pow(x, 1 / 3) : (7.787 * x) + (16 / 116);
	y = y > 0.008856 ? Math.pow(y, 1 / 3) : (7.787 * y) + (16 / 116);
	z = z > 0.008856 ? Math.pow(z, 1 / 3) : (7.787 * z) + (16 / 116);

	l = (116 * y) - 16;
	a = 500 * (x - y);
	b = 200 * (y - z);

	return [l, a, b];
};

convert.lab.xyz = function (lab) {
	var l = lab[0];
	var a = lab[1];
	var b = lab[2];
	var x;
	var y;
	var z;

	y = (l + 16) / 116;
	x = a / 500 + y;
	z = y - b / 200;

	var y2 = Math.pow(y, 3);
	var x2 = Math.pow(x, 3);
	var z2 = Math.pow(z, 3);
	y = y2 > 0.008856 ? y2 : (y - 16 / 116) / 7.787;
	x = x2 > 0.008856 ? x2 : (x - 16 / 116) / 7.787;
	z = z2 > 0.008856 ? z2 : (z - 16 / 116) / 7.787;

	x *= 95.047;
	y *= 100;
	z *= 108.883;

	return [x, y, z];
};

convert.lab.lch = function (lab) {
	var l = lab[0];
	var a = lab[1];
	var b = lab[2];
	var hr;
	var h;
	var c;

	hr = Math.atan2(b, a);
	h = hr * 360 / 2 / Math.PI;

	if (h < 0) {
		h += 360;
	}

	c = Math.sqrt(a * a + b * b);

	return [l, c, h];
};

convert.lch.lab = function (lch) {
	var l = lch[0];
	var c = lch[1];
	var h = lch[2];
	var a;
	var b;
	var hr;

	hr = h / 360 * 2 * Math.PI;
	a = c * Math.cos(hr);
	b = c * Math.sin(hr);

	return [l, a, b];
};

convert.rgb.ansi16 = function (args) {
	var r = args[0];
	var g = args[1];
	var b = args[2];
	var value = 1 in arguments ? arguments[1] : convert.rgb.hsv(args)[2]; // hsv -> ansi16 optimization

	value = Math.round(value / 50);

	if (value === 0) {
		return 30;
	}

	var ansi = 30
		+ ((Math.round(b / 255) << 2)
		| (Math.round(g / 255) << 1)
		| Math.round(r / 255));

	if (value === 2) {
		ansi += 60;
	}

	return ansi;
};

convert.hsv.ansi16 = function (args) {
	// optimization here; we already know the value and don't need to get
	// it converted for us.
	return convert.rgb.ansi16(convert.hsv.rgb(args), args[2]);
};

convert.rgb.ansi256 = function (args) {
	var r = args[0];
	var g = args[1];
	var b = args[2];

	// we use the extended greyscale palette here, with the exception of
	// black and white. normal palette only has 4 greyscale shades.
	if (r === g && g === b) {
		if (r < 8) {
			return 16;
		}

		if (r > 248) {
			return 231;
		}

		return Math.round(((r - 8) / 247) * 24) + 232;
	}

	var ansi = 16
		+ (36 * Math.round(r / 255 * 5))
		+ (6 * Math.round(g / 255 * 5))
		+ Math.round(b / 255 * 5);

	return ansi;
};

convert.ansi16.rgb = function (args) {
	var color = args % 10;

	// handle greyscale
	if (color === 0 || color === 7) {
		if (args > 50) {
			color += 3.5;
		}

		color = color / 10.5 * 255;

		return [color, color, color];
	}

	var mult = (~~(args > 50) + 1) * 0.5;
	var r = ((color & 1) * mult) * 255;
	var g = (((color >> 1) & 1) * mult) * 255;
	var b = (((color >> 2) & 1) * mult) * 255;

	return [r, g, b];
};

convert.ansi256.rgb = function (args) {
	// handle greyscale
	if (args >= 232) {
		var c = (args - 232) * 10 + 8;
		return [c, c, c];
	}

	args -= 16;

	var rem;
	var r = Math.floor(args / 36) / 5 * 255;
	var g = Math.floor((rem = args % 36) / 6) / 5 * 255;
	var b = (rem % 6) / 5 * 255;

	return [r, g, b];
};

convert.rgb.hex = function (args) {
	var integer = ((Math.round(args[0]) & 0xFF) << 16)
		+ ((Math.round(args[1]) & 0xFF) << 8)
		+ (Math.round(args[2]) & 0xFF);

	var string = integer.toString(16).toUpperCase();
	return '000000'.substring(string.length) + string;
};

convert.hex.rgb = function (args) {
	var match = args.toString(16).match(/[a-f0-9]{6}|[a-f0-9]{3}/i);
	if (!match) {
		return [0, 0, 0];
	}

	var colorString = match[0];

	if (match[0].length === 3) {
		colorString = colorString.split('').map(function (char) {
			return char + char;
		}).join('');
	}

	var integer = parseInt(colorString, 16);
	var r = (integer >> 16) & 0xFF;
	var g = (integer >> 8) & 0xFF;
	var b = integer & 0xFF;

	return [r, g, b];
};

convert.rgb.hcg = function (rgb) {
	var r = rgb[0] / 255;
	var g = rgb[1] / 255;
	var b = rgb[2] / 255;
	var max = Math.max(Math.max(r, g), b);
	var min = Math.min(Math.min(r, g), b);
	var chroma = (max - min);
	var grayscale;
	var hue;

	if (chroma < 1) {
		grayscale = min / (1 - chroma);
	} else {
		grayscale = 0;
	}

	if (chroma <= 0) {
		hue = 0;
	} else
	if (max === r) {
		hue = ((g - b) / chroma) % 6;
	} else
	if (max === g) {
		hue = 2 + (b - r) / chroma;
	} else {
		hue = 4 + (r - g) / chroma + 4;
	}

	hue /= 6;
	hue %= 1;

	return [hue * 360, chroma * 100, grayscale * 100];
};

convert.hsl.hcg = function (hsl) {
	var s = hsl[1] / 100;
	var l = hsl[2] / 100;
	var c = 1;
	var f = 0;

	if (l < 0.5) {
		c = 2.0 * s * l;
	} else {
		c = 2.0 * s * (1.0 - l);
	}

	if (c < 1.0) {
		f = (l - 0.5 * c) / (1.0 - c);
	}

	return [hsl[0], c * 100, f * 100];
};

convert.hsv.hcg = function (hsv) {
	var s = hsv[1] / 100;
	var v = hsv[2] / 100;

	var c = s * v;
	var f = 0;

	if (c < 1.0) {
		f = (v - c) / (1 - c);
	}

	return [hsv[0], c * 100, f * 100];
};

convert.hcg.rgb = function (hcg) {
	var h = hcg[0] / 360;
	var c = hcg[1] / 100;
	var g = hcg[2] / 100;

	if (c === 0.0) {
		return [g * 255, g * 255, g * 255];
	}

	var pure = [0, 0, 0];
	var hi = (h % 1) * 6;
	var v = hi % 1;
	var w = 1 - v;
	var mg = 0;

	switch (Math.floor(hi)) {
		case 0:
			pure[0] = 1; pure[1] = v; pure[2] = 0; break;
		case 1:
			pure[0] = w; pure[1] = 1; pure[2] = 0; break;
		case 2:
			pure[0] = 0; pure[1] = 1; pure[2] = v; break;
		case 3:
			pure[0] = 0; pure[1] = w; pure[2] = 1; break;
		case 4:
			pure[0] = v; pure[1] = 0; pure[2] = 1; break;
		default:
			pure[0] = 1; pure[1] = 0; pure[2] = w;
	}

	mg = (1.0 - c) * g;

	return [
		(c * pure[0] + mg) * 255,
		(c * pure[1] + mg) * 255,
		(c * pure[2] + mg) * 255
	];
};

convert.hcg.hsv = function (hcg) {
	var c = hcg[1] / 100;
	var g = hcg[2] / 100;

	var v = c + g * (1.0 - c);
	var f = 0;

	if (v > 0.0) {
		f = c / v;
	}

	return [hcg[0], f * 100, v * 100];
};

convert.hcg.hsl = function (hcg) {
	var c = hcg[1] / 100;
	var g = hcg[2] / 100;

	var l = g * (1.0 - c) + 0.5 * c;
	var s = 0;

	if (l > 0.0 && l < 0.5) {
		s = c / (2 * l);
	} else
	if (l >= 0.5 && l < 1.0) {
		s = c / (2 * (1 - l));
	}

	return [hcg[0], s * 100, l * 100];
};

convert.hcg.hwb = function (hcg) {
	var c = hcg[1] / 100;
	var g = hcg[2] / 100;
	var v = c + g * (1.0 - c);
	return [hcg[0], (v - c) * 100, (1 - v) * 100];
};

convert.hwb.hcg = function (hwb) {
	var w = hwb[1] / 100;
	var b = hwb[2] / 100;
	var v = 1 - b;
	var c = v - w;
	var g = 0;

	if (c < 1) {
		g = (v - c) / (1 - c);
	}

	return [hwb[0], c * 100, g * 100];
};

convert.apple.rgb = function (apple) {
	return [(apple[0] / 65535) * 255, (apple[1] / 65535) * 255, (apple[2] / 65535) * 255];
};

convert.rgb.apple = function (rgb) {
	return [(rgb[0] / 255) * 65535, (rgb[1] / 255) * 65535, (rgb[2] / 255) * 65535];
};

convert.gray.rgb = function (args) {
	return [args[0] / 100 * 255, args[0] / 100 * 255, args[0] / 100 * 255];
};

convert.gray.hsl = convert.gray.hsv = function (args) {
	return [0, 0, args[0]];
};

convert.gray.hwb = function (gray) {
	return [0, 100, gray[0]];
};

convert.gray.cmyk = function (gray) {
	return [0, 0, 0, gray[0]];
};

convert.gray.lab = function (gray) {
	return [gray[0], 0, 0];
};

convert.gray.hex = function (gray) {
	var val = Math.round(gray[0] / 100 * 255) & 0xFF;
	var integer = (val << 16) + (val << 8) + val;

	var string = integer.toString(16).toUpperCase();
	return '000000'.substring(string.length) + string;
};

convert.rgb.gray = function (rgb) {
	var val = (rgb[0] + rgb[1] + rgb[2]) / 3;
	return [val / 255 * 100];
};

},{"color-name":13}],11:[function(require,module,exports){
var conversions = require('./conversions');
var route = require('./route');

var convert = {};

var models = Object.keys(conversions);

function wrapRaw(fn) {
	var wrappedFn = function (args) {
		if (args === undefined || args === null) {
			return args;
		}

		if (arguments.length > 1) {
			args = Array.prototype.slice.call(arguments);
		}

		return fn(args);
	};

	// preserve .conversion property if there is one
	if ('conversion' in fn) {
		wrappedFn.conversion = fn.conversion;
	}

	return wrappedFn;
}

function wrapRounded(fn) {
	var wrappedFn = function (args) {
		if (args === undefined || args === null) {
			return args;
		}

		if (arguments.length > 1) {
			args = Array.prototype.slice.call(arguments);
		}

		var result = fn(args);

		// we're assuming the result is an array here.
		// see notice in conversions.js; don't use box types
		// in conversion functions.
		if (typeof result === 'object') {
			for (var len = result.length, i = 0; i < len; i++) {
				result[i] = Math.round(result[i]);
			}
		}

		return result;
	};

	// preserve .conversion property if there is one
	if ('conversion' in fn) {
		wrappedFn.conversion = fn.conversion;
	}

	return wrappedFn;
}

models.forEach(function (fromModel) {
	convert[fromModel] = {};

	Object.defineProperty(convert[fromModel], 'channels', {value: conversions[fromModel].channels});
	Object.defineProperty(convert[fromModel], 'labels', {value: conversions[fromModel].labels});

	var routes = route(fromModel);
	var routeModels = Object.keys(routes);

	routeModels.forEach(function (toModel) {
		var fn = routes[toModel];

		convert[fromModel][toModel] = wrapRounded(fn);
		convert[fromModel][toModel].raw = wrapRaw(fn);
	});
});

module.exports = convert;

},{"./conversions":10,"./route":12}],12:[function(require,module,exports){
var conversions = require('./conversions');

/*
	this function routes a model to all other models.

	all functions that are routed have a property `.conversion` attached
	to the returned synthetic function. This property is an array
	of strings, each with the steps in between the 'from' and 'to'
	color models (inclusive).

	conversions that are not possible simply are not included.
*/

function buildGraph() {
	var graph = {};
	// https://jsperf.com/object-keys-vs-for-in-with-closure/3
	var models = Object.keys(conversions);

	for (var len = models.length, i = 0; i < len; i++) {
		graph[models[i]] = {
			// http://jsperf.com/1-vs-infinity
			// micro-opt, but this is simple.
			distance: -1,
			parent: null
		};
	}

	return graph;
}

// https://en.wikipedia.org/wiki/Breadth-first_search
function deriveBFS(fromModel) {
	var graph = buildGraph();
	var queue = [fromModel]; // unshift -> queue -> pop

	graph[fromModel].distance = 0;

	while (queue.length) {
		var current = queue.pop();
		var adjacents = Object.keys(conversions[current]);

		for (var len = adjacents.length, i = 0; i < len; i++) {
			var adjacent = adjacents[i];
			var node = graph[adjacent];

			if (node.distance === -1) {
				node.distance = graph[current].distance + 1;
				node.parent = current;
				queue.unshift(adjacent);
			}
		}
	}

	return graph;
}

function link(from, to) {
	return function (args) {
		return to(from(args));
	};
}

function wrapConversion(toModel, graph) {
	var path = [graph[toModel].parent, toModel];
	var fn = conversions[graph[toModel].parent][toModel];

	var cur = graph[toModel].parent;
	while (graph[cur].parent) {
		path.unshift(graph[cur].parent);
		fn = link(conversions[graph[cur].parent][cur], fn);
		cur = graph[cur].parent;
	}

	fn.conversion = path;
	return fn;
}

module.exports = function (fromModel) {
	var graph = deriveBFS(fromModel);
	var conversion = {};

	var models = Object.keys(graph);
	for (var len = models.length, i = 0; i < len; i++) {
		var toModel = models[i];
		var node = graph[toModel];

		if (node.parent === null) {
			// no possible conversion, or this node is the source model.
			continue;
		}

		conversion[toModel] = wrapConversion(toModel, graph);
	}

	return conversion;
};


},{"./conversions":10}],13:[function(require,module,exports){
'use strict'

module.exports = {
	"aliceblue": [240, 248, 255],
	"antiquewhite": [250, 235, 215],
	"aqua": [0, 255, 255],
	"aquamarine": [127, 255, 212],
	"azure": [240, 255, 255],
	"beige": [245, 245, 220],
	"bisque": [255, 228, 196],
	"black": [0, 0, 0],
	"blanchedalmond": [255, 235, 205],
	"blue": [0, 0, 255],
	"blueviolet": [138, 43, 226],
	"brown": [165, 42, 42],
	"burlywood": [222, 184, 135],
	"cadetblue": [95, 158, 160],
	"chartreuse": [127, 255, 0],
	"chocolate": [210, 105, 30],
	"coral": [255, 127, 80],
	"cornflowerblue": [100, 149, 237],
	"cornsilk": [255, 248, 220],
	"crimson": [220, 20, 60],
	"cyan": [0, 255, 255],
	"darkblue": [0, 0, 139],
	"darkcyan": [0, 139, 139],
	"darkgoldenrod": [184, 134, 11],
	"darkgray": [169, 169, 169],
	"darkgreen": [0, 100, 0],
	"darkgrey": [169, 169, 169],
	"darkkhaki": [189, 183, 107],
	"darkmagenta": [139, 0, 139],
	"darkolivegreen": [85, 107, 47],
	"darkorange": [255, 140, 0],
	"darkorchid": [153, 50, 204],
	"darkred": [139, 0, 0],
	"darksalmon": [233, 150, 122],
	"darkseagreen": [143, 188, 143],
	"darkslateblue": [72, 61, 139],
	"darkslategray": [47, 79, 79],
	"darkslategrey": [47, 79, 79],
	"darkturquoise": [0, 206, 209],
	"darkviolet": [148, 0, 211],
	"deeppink": [255, 20, 147],
	"deepskyblue": [0, 191, 255],
	"dimgray": [105, 105, 105],
	"dimgrey": [105, 105, 105],
	"dodgerblue": [30, 144, 255],
	"firebrick": [178, 34, 34],
	"floralwhite": [255, 250, 240],
	"forestgreen": [34, 139, 34],
	"fuchsia": [255, 0, 255],
	"gainsboro": [220, 220, 220],
	"ghostwhite": [248, 248, 255],
	"gold": [255, 215, 0],
	"goldenrod": [218, 165, 32],
	"gray": [128, 128, 128],
	"green": [0, 128, 0],
	"greenyellow": [173, 255, 47],
	"grey": [128, 128, 128],
	"honeydew": [240, 255, 240],
	"hotpink": [255, 105, 180],
	"indianred": [205, 92, 92],
	"indigo": [75, 0, 130],
	"ivory": [255, 255, 240],
	"khaki": [240, 230, 140],
	"lavender": [230, 230, 250],
	"lavenderblush": [255, 240, 245],
	"lawngreen": [124, 252, 0],
	"lemonchiffon": [255, 250, 205],
	"lightblue": [173, 216, 230],
	"lightcoral": [240, 128, 128],
	"lightcyan": [224, 255, 255],
	"lightgoldenrodyellow": [250, 250, 210],
	"lightgray": [211, 211, 211],
	"lightgreen": [144, 238, 144],
	"lightgrey": [211, 211, 211],
	"lightpink": [255, 182, 193],
	"lightsalmon": [255, 160, 122],
	"lightseagreen": [32, 178, 170],
	"lightskyblue": [135, 206, 250],
	"lightslategray": [119, 136, 153],
	"lightslategrey": [119, 136, 153],
	"lightsteelblue": [176, 196, 222],
	"lightyellow": [255, 255, 224],
	"lime": [0, 255, 0],
	"limegreen": [50, 205, 50],
	"linen": [250, 240, 230],
	"magenta": [255, 0, 255],
	"maroon": [128, 0, 0],
	"mediumaquamarine": [102, 205, 170],
	"mediumblue": [0, 0, 205],
	"mediumorchid": [186, 85, 211],
	"mediumpurple": [147, 112, 219],
	"mediumseagreen": [60, 179, 113],
	"mediumslateblue": [123, 104, 238],
	"mediumspringgreen": [0, 250, 154],
	"mediumturquoise": [72, 209, 204],
	"mediumvioletred": [199, 21, 133],
	"midnightblue": [25, 25, 112],
	"mintcream": [245, 255, 250],
	"mistyrose": [255, 228, 225],
	"moccasin": [255, 228, 181],
	"navajowhite": [255, 222, 173],
	"navy": [0, 0, 128],
	"oldlace": [253, 245, 230],
	"olive": [128, 128, 0],
	"olivedrab": [107, 142, 35],
	"orange": [255, 165, 0],
	"orangered": [255, 69, 0],
	"orchid": [218, 112, 214],
	"palegoldenrod": [238, 232, 170],
	"palegreen": [152, 251, 152],
	"paleturquoise": [175, 238, 238],
	"palevioletred": [219, 112, 147],
	"papayawhip": [255, 239, 213],
	"peachpuff": [255, 218, 185],
	"peru": [205, 133, 63],
	"pink": [255, 192, 203],
	"plum": [221, 160, 221],
	"powderblue": [176, 224, 230],
	"purple": [128, 0, 128],
	"rebeccapurple": [102, 51, 153],
	"red": [255, 0, 0],
	"rosybrown": [188, 143, 143],
	"royalblue": [65, 105, 225],
	"saddlebrown": [139, 69, 19],
	"salmon": [250, 128, 114],
	"sandybrown": [244, 164, 96],
	"seagreen": [46, 139, 87],
	"seashell": [255, 245, 238],
	"sienna": [160, 82, 45],
	"silver": [192, 192, 192],
	"skyblue": [135, 206, 235],
	"slateblue": [106, 90, 205],
	"slategray": [112, 128, 144],
	"slategrey": [112, 128, 144],
	"snow": [255, 250, 250],
	"springgreen": [0, 255, 127],
	"steelblue": [70, 130, 180],
	"tan": [210, 180, 140],
	"teal": [0, 128, 128],
	"thistle": [216, 191, 216],
	"tomato": [255, 99, 71],
	"turquoise": [64, 224, 208],
	"violet": [238, 130, 238],
	"wheat": [245, 222, 179],
	"white": [255, 255, 255],
	"whitesmoke": [245, 245, 245],
	"yellow": [255, 255, 0],
	"yellowgreen": [154, 205, 50]
};

},{}],14:[function(require,module,exports){
'use strict';
module.exports = {
	stdout: false,
	stderr: false
};

},{}],15:[function(require,module,exports){
/**
 * AutoNumeric.js v4.6.0
 * © 2009-2019 Robert J. Knothe, Alexandre Bonneau
 * Released under the MIT License.
 */
!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.AutoNumeric=t():e.AutoNumeric=t()}(this,function(){return n={},a.m=i=[function(e,t,i){"use strict";i.r(t);var n={allowedTagList:["b","caption","cite","code","const","dd","del","div","dfn","dt","em","h1","h2","h3","h4","h5","h6","input","ins","kdb","label","li","option","output","p","q","s","sample","span","strong","td","th","u"]};Object.freeze(n.allowedTagList),Object.defineProperty(n,"allowedTagList",{configurable:!1,writable:!1}),n.keyCode={Backspace:8,Tab:9,Enter:13,Shift:16,Ctrl:17,Alt:18,Pause:19,CapsLock:20,Esc:27,Space:32,PageUp:33,PageDown:34,End:35,Home:36,LeftArrow:37,UpArrow:38,RightArrow:39,DownArrow:40,Insert:45,Delete:46,num0:48,num1:49,num2:50,num3:51,num4:52,num5:53,num6:54,num7:55,num8:56,num9:57,a:65,b:66,c:67,d:68,e:69,f:70,g:71,h:72,i:73,j:74,k:75,l:76,m:77,n:78,o:79,p:80,q:81,r:82,s:83,t:84,u:85,v:86,w:87,x:88,y:89,z:90,OSLeft:91,OSRight:92,ContextMenu:93,numpad0:96,numpad1:97,numpad2:98,numpad3:99,numpad4:100,numpad5:101,numpad6:102,numpad7:103,numpad8:104,numpad9:105,MultiplyNumpad:106,PlusNumpad:107,MinusNumpad:109,DotNumpad:110,SlashNumpad:111,F1:112,F2:113,F3:114,F4:115,F5:116,F6:117,F7:118,F8:119,F9:120,F10:121,F11:122,F12:123,NumLock:144,ScrollLock:145,HyphenFirefox:173,MyComputer:182,MyCalculator:183,Semicolon:186,Equal:187,Comma:188,Hyphen:189,Dot:190,Slash:191,Backquote:192,LeftBracket:219,Backslash:220,RightBracket:221,Quote:222,Command:224,AltGraph:225,AndroidDefault:229},Object.freeze(n.keyCode),Object.defineProperty(n,"keyCode",{configurable:!1,writable:!1}),n.fromCharCodeKeyCode={0:"LaunchCalculator",8:"Backspace",9:"Tab",13:"Enter",16:"Shift",17:"Ctrl",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",48:"0",49:"1",50:"2",51:"3",52:"4",53:"5",54:"6",55:"7",56:"8",57:"9",91:"OS",92:"OSRight",93:"ContextMenu",96:"0",97:"1",98:"2",99:"3",100:"4",101:"5",102:"6",103:"7",104:"8",105:"9",106:"*",107:"+",109:"-",110:".",111:"/",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",173:"-",182:"MyComputer",183:"MyCalculator",186:";",187:"=",188:",",189:"-",190:".",191:"/",192:"`",219:"[",220:"\\",221:"]",222:"'",224:"Meta",225:"AltGraph"},Object.freeze(n.fromCharCodeKeyCode),Object.defineProperty(n,"fromCharCodeKeyCode",{configurable:!1,writable:!1}),n.keyName={Unidentified:"Unidentified",AndroidDefault:"AndroidDefault",Alt:"Alt",AltGr:"AltGraph",CapsLock:"CapsLock",Ctrl:"Control",Fn:"Fn",FnLock:"FnLock",Hyper:"Hyper",Meta:"Meta",OSLeft:"OS",OSRight:"OS",Command:"OS",NumLock:"NumLock",ScrollLock:"ScrollLock",Shift:"Shift",Super:"Super",Symbol:"Symbol",SymbolLock:"SymbolLock",Enter:"Enter",Tab:"Tab",Space:" ",LeftArrow:"ArrowLeft",UpArrow:"ArrowUp",RightArrow:"ArrowRight",DownArrow:"ArrowDown",End:"End",Home:"Home",PageUp:"PageUp",PageDown:"PageDown",Backspace:"Backspace",Clear:"Clear",Copy:"Copy",CrSel:"CrSel",Cut:"Cut",Delete:"Delete",EraseEof:"EraseEof",ExSel:"ExSel",Insert:"Insert",Paste:"Paste",Redo:"Redo",Undo:"Undo",Accept:"Accept",Again:"Again",Attn:"Attn",Cancel:"Cancel",ContextMenu:"ContextMenu",Esc:"Escape",Execute:"Execute",Find:"Find",Finish:"Finish",Help:"Help",Pause:"Pause",Play:"Play",Props:"Props",Select:"Select",ZoomIn:"ZoomIn",ZoomOut:"ZoomOut",BrightnessDown:"BrightnessDown",BrightnessUp:"BrightnessUp",Eject:"Eject",LogOff:"LogOff",Power:"Power",PowerOff:"PowerOff",PrintScreen:"PrintScreen",Hibernate:"Hibernate",Standby:"Standby",WakeUp:"WakeUp",Compose:"Compose",Dead:"Dead",F1:"F1",F2:"F2",F3:"F3",F4:"F4",F5:"F5",F6:"F6",F7:"F7",F8:"F8",F9:"F9",F10:"F10",F11:"F11",F12:"F12",Print:"Print",num0:"0",num1:"1",num2:"2",num3:"3",num4:"4",num5:"5",num6:"6",num7:"7",num8:"8",num9:"9",a:"a",b:"b",c:"c",d:"d",e:"e",f:"f",g:"g",h:"h",i:"i",j:"j",k:"k",l:"l",m:"m",n:"n",o:"o",p:"p",q:"q",r:"r",s:"s",t:"t",u:"u",v:"v",w:"w",x:"x",y:"y",z:"z",A:"A",B:"B",C:"C",D:"D",E:"E",F:"F",G:"G",H:"H",I:"I",J:"J",K:"K",L:"L",M:"M",N:"N",O:"O",P:"P",Q:"Q",R:"R",S:"S",T:"T",U:"U",V:"V",W:"W",X:"X",Y:"Y",Z:"Z",Semicolon:";",Equal:"=",Comma:",",Hyphen:"-",Minus:"-",Plus:"+",Dot:".",Slash:"/",Backquote:"`",LeftParenthesis:"(",RightParenthesis:")",LeftBracket:"[",RightBracket:"]",Backslash:"\\",Quote:"'",numpad0:"0",numpad1:"1",numpad2:"2",numpad3:"3",numpad4:"4",numpad5:"5",numpad6:"6",numpad7:"7",numpad8:"8",numpad9:"9",NumpadDot:".",NumpadDotAlt:",",NumpadMultiply:"*",NumpadPlus:"+",NumpadMinus:"-",NumpadSubtract:"-",NumpadSlash:"/",NumpadDotObsoleteBrowsers:"Decimal",NumpadMultiplyObsoleteBrowsers:"Multiply",NumpadPlusObsoleteBrowsers:"Add",NumpadMinusObsoleteBrowsers:"Subtract",NumpadSlashObsoleteBrowsers:"Divide",_allFnKeys:["F1","F2","F3","F4","F5","F6","F7","F8","F9","F10","F11","F12"],_someNonPrintableKeys:["Tab","Enter","Shift","ShiftLeft","ShiftRight","Control","ControlLeft","ControlRight","Alt","AltLeft","AltRight","Pause","CapsLock","Escape"],_directionKeys:["PageUp","PageDown","End","Home","ArrowDown","ArrowLeft","ArrowRight","ArrowUp"]},Object.freeze(n.keyName._allFnKeys),Object.freeze(n.keyName._someNonPrintableKeys),Object.freeze(n.keyName._directionKeys),Object.freeze(n.keyName),Object.defineProperty(n,"keyName",{configurable:!1,writable:!1}),Object.freeze(n);var d=n;function a(e){return function(e){if(Array.isArray(e))return o(e)}(e)||function(e){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(e))return Array.from(e)}(e)||s(e)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function r(){return(r=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var i=arguments[t];for(var n in i)Object.prototype.hasOwnProperty.call(i,n)&&(e[n]=i[n])}return e}).apply(this,arguments)}function h(e,t){return function(e){if(Array.isArray(e))return e}(e)||function(e,t){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(e)){var i=[],n=!0,a=!1,r=void 0;try{for(var s,o=e[Symbol.iterator]();!(n=(s=o.next()).done)&&(i.push(s.value),!t||i.length!==t);n=!0);}catch(e){a=!0,r=e}finally{try{n||null==o.return||o.return()}finally{if(a)throw r}}return i}}(e,t)||s(e,t)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function s(e,t){if(e){if("string"==typeof e)return o(e,t);var i=Object.prototype.toString.call(e).slice(8,-1);return"Object"===i&&e.constructor&&(i=e.constructor.name),"Map"===i||"Set"===i?Array.from(i):"Arguments"===i||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(i)?o(e,t):void 0}}function o(e,t){(null==t||t>e.length)&&(t=e.length);for(var i=0,n=new Array(t);i<t;i++)n[i]=e[i];return n}function l(e){return(l="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}var M=function(){function s(){!function(e){if(!(e instanceof s))throw new TypeError("Cannot call a class as a function")}(this)}return function(e,t){for(var i=0;i<t.length;i++){var n=t[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}(s,[{key:"isNull",value:function(e){return null===e}},{key:"isUndefined",value:function(e){return void 0===e}},{key:"isUndefinedOrNullOrEmpty",value:function(e){return null==e||""===e}},{key:"isString",value:function(e){return"string"==typeof e||e instanceof String}},{key:"isEmptyString",value:function(e){return""===e}},{key:"isBoolean",value:function(e){return"boolean"==typeof e}},{key:"isTrueOrFalseString",value:function(e){var t=String(e).toLowerCase();return"true"===t||"false"===t}},{key:"isObject",value:function(e){return"object"===l(e)&&null!==e&&!Array.isArray(e)}},{key:"isEmptyObj",value:function(e){for(var t in e)if(Object.prototype.hasOwnProperty.call(e,t))return!1;return!0}},{key:"isNumberStrict",value:function(e){return"number"==typeof e}},{key:"isNumber",value:function(e){return!this.isArray(e)&&!isNaN(parseFloat(e))&&isFinite(e)}},{key:"isDigit",value:function(e){return/\d/.test(e)}},{key:"isNumberOrArabic",value:function(e){var t=this.arabicToLatinNumbers(e,!1,!0,!0);return this.isNumber(t)}},{key:"isInt",value:function(e){return"number"==typeof e&&parseFloat(e)===parseInt(e,10)&&!isNaN(e)}},{key:"isFunction",value:function(e){return"function"==typeof e}},{key:"isIE11",value:function(){return"undefined"!=typeof window&&!!window.MSInputMethodContext&&!!document.documentMode}},{key:"contains",value:function(e,t){return!(!this.isString(e)||!this.isString(t)||""===e||""===t)&&-1!==e.indexOf(t)}},{key:"isInArray",value:function(e,t){return!(!this.isArray(t)||t===[]||this.isUndefined(e))&&-1!==t.indexOf(e)}},{key:"isArray",value:function(e){if("[object Array]"===Object.prototype.toString.call([]))return Array.isArray(e)||"object"===l(e)&&"[object Array]"===Object.prototype.toString.call(e);throw new Error("toString message changed for Object Array")}},{key:"isElement",value:function(e){return"undefined"!=typeof Element&&e instanceof Element}},{key:"isInputElement",value:function(e){return this.isElement(e)&&"input"===e.tagName.toLowerCase()}},{key:"decimalPlaces",value:function(e){var t=h(e.split("."),2)[1];return this.isUndefined(t)?0:t.length}},{key:"indexFirstNonZeroDecimalPlace",value:function(e){var t=h(String(Math.abs(e)).split("."),2)[1];if(this.isUndefined(t))return 0;var i=t.lastIndexOf("0");return-1===i?i=0:i+=2,i}},{key:"keyCodeNumber",value:function(e){return void 0===e.which?e.keyCode:e.which}},{key:"character",value:function(e){var t;if("Unidentified"===e.key||void 0===e.key||this.isSeleniumBot()){var i=this.keyCodeNumber(e);if(i===d.keyCode.AndroidDefault)return d.keyName.AndroidDefault;var n=d.fromCharCodeKeyCode[i];t=s.isUndefinedOrNullOrEmpty(n)?String.fromCharCode(i):n}else{var a;switch(e.key){case"Add":t=d.keyName.NumpadPlus;break;case"Apps":t=d.keyName.ContextMenu;break;case"Crsel":t=d.keyName.CrSel;break;case"Decimal":t=e.char?e.char:d.keyName.NumpadDot;break;case"Del":t="firefox"===(a=this.browser()).name&&a.version<=36||"ie"===a.name&&a.version<=9?d.keyName.Dot:d.keyName.Delete;break;case"Divide":t=d.keyName.NumpadSlash;break;case"Down":t=d.keyName.DownArrow;break;case"Esc":t=d.keyName.Esc;break;case"Exsel":t=d.keyName.ExSel;break;case"Left":t=d.keyName.LeftArrow;break;case"Meta":case"Super":t=d.keyName.OSLeft;break;case"Multiply":t=d.keyName.NumpadMultiply;break;case"Right":t=d.keyName.RightArrow;break;case"Spacebar":t=d.keyName.Space;break;case"Subtract":t=d.keyName.NumpadMinus;break;case"Up":t=d.keyName.UpArrow;break;default:t=e.key}}return t}},{key:"browser",value:function(){var e,t=navigator.userAgent,i=t.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i)||[];return/trident/i.test(i[1])?{name:"ie",version:(e=/\brv[ :]+(\d+)/g.exec(t)||[])[1]||""}:"Chrome"===i[1]&&null!==(e=t.match(/\b(OPR|Edge)\/(\d+)/))?{name:e[1].replace("OPR","opera"),version:e[2]}:(i=i[2]?[i[1],i[2]]:[navigator.appName,navigator.appVersion,"-?"],null!==(e=t.match(/version\/(\d+)/i))&&i.splice(1,1,e[1]),{name:i[0].toLowerCase(),version:i[1]})}},{key:"isSeleniumBot",value:function(){return!0===window.navigator.webdriver}},{key:"isNegative",value:function(e,t,i){var n=1<arguments.length&&void 0!==t?t:"-",a=!(2<arguments.length&&void 0!==i)||i;return e===n||""!==e&&(s.isNumber(e)?e<0:a?this.contains(e,n):this.isNegativeStrict(e,n))}},{key:"isNegativeStrict",value:function(e,t){var i=1<arguments.length&&void 0!==t?t:"-";return e.charAt(0)===i}},{key:"isNegativeWithBrackets",value:function(e,t,i){return e.charAt(0)===t&&this.contains(e,i)}},{key:"isZeroOrHasNoValue",value:function(e){return!/[1-9]/g.test(e)}},{key:"setRawNegativeSign",value:function(e){return this.isNegativeStrict(e,"-")?e:"-".concat(e)}},{key:"replaceCharAt",value:function(e,t,i){return"".concat(e.substr(0,t)).concat(i).concat(e.substr(t+i.length))}},{key:"clampToRangeLimits",value:function(e,t){return Math.max(t.minimumValue,Math.min(t.maximumValue,e))}},{key:"countNumberCharactersOnTheCaretLeftSide",value:function(e,t,i){for(var n=new RegExp("[0-9".concat(i,"-]")),a=0,r=0;r<t;r++)n.test(e[r])&&a++;return a}},{key:"findCaretPositionInFormattedNumber",value:function(e,t,i,n){var a,r=i.length,s=e.length,o=0;for(a=0;a<r&&o<s&&o<t;a++)(e[o]===i[a]||"."===e[o]&&i[a]===n)&&o++;return a}},{key:"countCharInText",value:function(e,t){for(var i=0,n=0;n<t.length;n++)t[n]===e&&i++;return i}},{key:"convertCharacterCountToIndexPosition",value:function(e){return Math.max(e,e-1)}},{key:"getElementSelection",value:function(e){var t,i={};try{t=this.isUndefined(e.selectionStart)}catch(e){t=!1}try{if(t){var n=window.getSelection().getRangeAt(0);i.start=n.startOffset,i.end=n.endOffset,i.length=i.end-i.start}else i.start=e.selectionStart,i.end=e.selectionEnd,i.length=i.end-i.start}catch(e){i.start=0,i.end=0,i.length=0}return i}},{key:"setElementSelection",value:function(e,t,i){var n=2<arguments.length&&void 0!==i?i:null;if(this.isUndefinedOrNullOrEmpty(n)&&(n=t),this.isInputElement(e))e.setSelectionRange(t,n);else if(!s.isNull(e.firstChild)){var a=document.createRange();a.setStart(e.firstChild,t),a.setEnd(e.firstChild,n);var r=window.getSelection();r.removeAllRanges(),r.addRange(a)}}},{key:"throwError",value:function(e){throw new Error(e)}},{key:"warning",value:function(e,t){1<arguments.length&&void 0!==t&&!t||console.warn("Warning: ".concat(e))}},{key:"isWheelUpEvent",value:function(e){return e.deltaY||this.throwError("The event passed as a parameter is not a valid wheel event, '".concat(e.type,"' given.")),e.deltaY<0}},{key:"isWheelDownEvent",value:function(e){return e.deltaY||this.throwError("The event passed as a parameter is not a valid wheel event, '".concat(e.type,"' given.")),0<e.deltaY}},{key:"forceDecimalPlaces",value:function(e,t){var i=h(String(e).split("."),2),n=i[0],a=i[1];return a?"".concat(n,".").concat(a.substr(0,t)):e}},{key:"roundToNearest",value:function(e,t){var i=1<arguments.length&&void 0!==t?t:1e3;return 0===e?0:(0===i&&this.throwError("The `stepPlace` used to round is equal to `0`. This value must not be equal to zero."),Math.round(e/i)*i)}},{key:"modifyAndRoundToNearestAuto",value:function(e,t,i){e=Number(this.forceDecimalPlaces(e,i));var n=Math.abs(e);if(0<=n&&n<1){var a,r=Math.pow(10,-i);if(0===e)return t?r:-r;var s,o=i,l=this.indexFirstNonZeroDecimalPlace(e);return a=o-1<=l?r:Math.pow(10,-(l+1)),s=t?e+a:e-a,this.roundToNearest(s,a)}e=parseInt(e,10);var u,c=Math.abs(e).toString().length;switch(c){case 1:u=0;break;case 2:case 3:u=1;break;case 4:case 5:u=2;break;default:u=c-3}var h,m=Math.pow(10,u);return(h=t?e+m:e-m)<=10&&-10<=h?h:this.roundToNearest(h,m)}},{key:"addAndRoundToNearestAuto",value:function(e,t){return this.modifyAndRoundToNearestAuto(e,!0,t)}},{key:"subtractAndRoundToNearestAuto",value:function(e,t){return this.modifyAndRoundToNearestAuto(e,!1,t)}},{key:"arabicToLatinNumbers",value:function(e,t,i,n){var a=!(1<arguments.length&&void 0!==t)||t,r=2<arguments.length&&void 0!==i&&i,s=3<arguments.length&&void 0!==n&&n;if(this.isNull(e))return e;var o=e.toString();if(""===o)return e;if(null===o.match(/[٠١٢٣٤٥٦٧٨٩۴۵۶]/g))return a&&(o=Number(o)),o;r&&(o=o.replace(/٫/,".")),s&&(o=o.replace(/٬/g,"")),o=o.replace(/[٠١٢٣٤٥٦٧٨٩]/g,function(e){return e.charCodeAt(0)-1632}).replace(/[۰۱۲۳۴۵۶۷۸۹]/g,function(e){return e.charCodeAt(0)-1776});var l=Number(o);return isNaN(l)?l:(a&&(o=l),o)}},{key:"triggerEvent",value:function(e,t,i,n,a){var r,s=1<arguments.length&&void 0!==t?t:document,o=2<arguments.length&&void 0!==i?i:null,l=!(3<arguments.length&&void 0!==n)||n,u=!(4<arguments.length&&void 0!==a)||a;window.CustomEvent?r=new CustomEvent(e,{detail:o,bubbles:l,cancelable:u}):(r=document.createEvent("CustomEvent")).initCustomEvent(e,l,u,{detail:o}),s.dispatchEvent(r)}},{key:"parseStr",value:function(e){var t,i,n,a,r={};if(0===e&&1/e<0&&(e="-0"),e=e.toString(),this.isNegativeStrict(e,"-")?(e=e.slice(1),r.s=-1):r.s=1,-1<(t=e.indexOf("."))&&(e=e.replace(".","")),t<0&&(t=e.length),(i=-1===e.search(/[1-9]/i)?e.length:e.search(/[1-9]/i))===(n=e.length))r.e=0,r.c=[0];else{for(a=n-1;"0"===e.charAt(a);--a)--n;for(--n,r.e=t-i-1,r.c=[],t=0;i<=n;i+=1)r.c[t]=+e.charAt(i),t+=1}return r}},{key:"testMinMax",value:function(e,t){var i=t.c,n=e.c,a=t.s,r=e.s,s=t.e,o=e.e;if(!i[0]||!n[0])return i[0]?a:n[0]?-r:0;if(a!==r)return a;var l=a<0;if(s!==o)return o<s^l?1:-1;for(a=-1,r=(s=i.length)<(o=n.length)?s:o,a+=1;a<r;a+=1)if(i[a]!==n[a])return i[a]>n[a]^l?1:-1;return s===o?0:o<s^l?1:-1}},{key:"randomString",value:function(e){var t=0<arguments.length&&void 0!==e?e:5;return Math.random().toString(36).substr(2,t)}},{key:"domElement",value:function(e){return s.isString(e)?document.querySelector(e):e}},{key:"getElementValue",value:function(e){return"input"===e.tagName.toLowerCase()?e.value:this.text(e)}},{key:"setElementValue",value:function(e,t){var i=1<arguments.length&&void 0!==t?t:null;"input"===e.tagName.toLowerCase()?e.value=i:e.textContent=i}},{key:"setInvalidState",value:function(e,t){var i=1<arguments.length&&void 0!==t?t:"Invalid";""!==i&&!this.isNull(i)||this.throwError("Cannot set the invalid state with an empty message."),e.setCustomValidity(i)}},{key:"setValidState",value:function(e){e.setCustomValidity("")}},{key:"cloneObject",value:function(e){return r({},e)}},{key:"camelize",value:function(e,t,i,n){var a=1<arguments.length&&void 0!==t?t:"-",r=!(2<arguments.length&&void 0!==i)||i,s=!(3<arguments.length&&void 0!==n)||n;if(this.isNull(e))return null;r&&(e=e.replace(/^data-/,""));var o=e.split(a).map(function(e){return"".concat(e.charAt(0).toUpperCase()).concat(e.slice(1))});return o=o.join(""),s&&(o="".concat(o.charAt(0).toLowerCase()).concat(o.slice(1))),o}},{key:"text",value:function(e){var t=e.nodeType;return t===Node.ELEMENT_NODE||t===Node.DOCUMENT_NODE||t===Node.DOCUMENT_FRAGMENT_NODE?e.textContent:t===Node.TEXT_NODE?e.nodeValue:""}},{key:"setText",value:function(e,t){var i=e.nodeType;i!==Node.ELEMENT_NODE&&i!==Node.DOCUMENT_NODE&&i!==Node.DOCUMENT_FRAGMENT_NODE||(e.textContent=t)}},{key:"filterOut",value:function(e,t){var i=this;return e.filter(function(e){return!i.isInArray(e,t)})}},{key:"trimPaddedZerosFromDecimalPlaces",value:function(e){if(""===(e=String(e)))return"";var t=h(e.split("."),2),i=t[0],n=t[1];if(this.isUndefinedOrNullOrEmpty(n))return i;var a=n.replace(/0+$/g,"");return""===a?i:"".concat(i,".").concat(a)}},{key:"getHoveredElement",value:function(){var e=a(document.querySelectorAll(":hover"));return e[e.length-1]}},{key:"arrayTrim",value:function(e,t){var i=e.length;return 0===i||i<t?e:t<0?[]:(e.length=parseInt(t,10),e)}},{key:"arrayUnique",value:function(){var e;return a(new Set((e=[]).concat.apply(e,arguments)))}},{key:"mergeMaps",value:function(){for(var e=arguments.length,t=new Array(e),i=0;i<e;i++)t[i]=arguments[i];return new Map(t.reduce(function(e,t){return e.concat(a(t))},[]))}},{key:"objectKeyLookup",value:function(e,t){var i=Object.entries(e).find(function(e){return e[1]===t}),n=null;return void 0!==i&&(n=i[0]),n}},{key:"insertAt",value:function(e,t,i){if(i>(e=String(e)).length)throw new Error("The given index is out of the string range.");if(1!==t.length)throw new Error("The given string `char` should be only one character long.");return""===e&&0===i?t:"".concat(e.slice(0,i)).concat(t).concat(e.slice(i))}},{key:"scientificToDecimal",value:function(e){var t=Number(e);if(isNaN(t))return NaN;if(e=String(e),!this.contains(e,"e")&&!this.contains(e,"E"))return e;var i=h(e.split(/e/i),2),n=i[0],a=i[1],r=n<0;r&&(n=n.replace("-",""));var s=+a<0;s&&(a=a.replace("-",""));var o,l=h(n.split(/\./),2),u=l[0],c=l[1];return o=s?(o=u.length>a?this.insertAt(u,".",u.length-a):"0.".concat("0".repeat(a-u.length)).concat(u),"".concat(o).concat(c||"")):c?(n="".concat(u).concat(c),a<c.length?this.insertAt(n,".",+a+u.length):"".concat(n).concat("0".repeat(a-c.length))):(n=n.replace(".",""),"".concat(n).concat("0".repeat(Number(a)))),r&&(o="-".concat(o)),o}}]),s}(),u=function(){function t(e){if(function(e){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this),null===e)throw new Error("Invalid AST")}return function(e,t){for(var i=0;i<t.length;i++){var n=t[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}(t.prototype,[{key:"evaluate",value:function(e){if(null==e)throw new Error("Invalid AST sub-tree");if("number"===e.type)return e.value;if("unaryMinus"===e.type)return-this.evaluate(e.left);var t=this.evaluate(e.left),i=this.evaluate(e.right);switch(e.type){case"op_+":return Number(t)+Number(i);case"op_-":return t-i;case"op_*":return t*i;case"op_/":return t/i;default:throw new Error("Invalid operator '".concat(e.type,"'"))}}}]),t}(),c=function(){function a(){!function(e){if(!(e instanceof a))throw new TypeError("Cannot call a class as a function")}(this)}return function(e,t){for(var i=0;i<t.length;i++){var n=t[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}(a,[{key:"createNode",value:function(e,t,i){var n=new a;return n.type=e,n.left=t,n.right=i,n}},{key:"createUnaryNode",value:function(e){var t=new a;return t.type="unaryMinus",t.left=e,t.right=null,t}},{key:"createLeaf",value:function(e){var t=new a;return t.type="number",t.value=e,t}}]),a}();function m(e,t,i){!function(e){if(!(e instanceof m))throw new TypeError("Cannot call a class as a function")}(this),this.type=e,this.value=t,this.symbol=i}var g=function(){function t(e){!function(e){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this),this.text=e,this.textLength=e.length,this.index=0,this.token=new m("Error",0,0)}return function(e,t){for(var i=0;i<t.length;i++){var n=t[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}(t.prototype,[{key:"_skipSpaces",value:function(){for(;" "===this.text[this.index]&&this.index<=this.textLength;)this.index++}},{key:"getIndex",value:function(){return this.index}},{key:"getNextToken",value:function(e){var t=0<arguments.length&&void 0!==e?e:".";if(this._skipSpaces(),this.textLength===this.index)return this.token.type="EOT",this.token;if(M.isDigit(this.text[this.index]))return this.token.type="num",this.token.value=this._getNumber(t),this.token;switch(this.token.type="Error",this.text[this.index]){case"+":this.token.type="+";break;case"-":this.token.type="-";break;case"*":this.token.type="*";break;case"/":this.token.type="/";break;case"(":this.token.type="(";break;case")":this.token.type=")"}if("Error"===this.token.type)throw new Error("Unexpected token '".concat(this.token.symbol,"' at position '").concat(this.token.index,"' in the token function"));return this.token.symbol=this.text[this.index],this.index++,this.token}},{key:"_getNumber",value:function(e){this._skipSpaces();for(var t=this.index;this.index<=this.textLength&&M.isDigit(this.text[this.index]);)this.index++;for(this.text[this.index]===e&&this.index++;this.index<=this.textLength&&M.isDigit(this.text[this.index]);)this.index++;if(this.index===t)throw new Error("No number has been found while it was expected");return this.text.substring(t,this.index).replace(e,".")}}]),t}(),v=function(){function i(e){var t=1<arguments.length&&void 0!==arguments[1]?arguments[1]:".";return function(e){if(!(e instanceof i))throw new TypeError("Cannot call a class as a function")}(this),this.text=e,this.decimalCharacter=t,this.lexer=new g(e),this.token=this.lexer.getNextToken(this.decimalCharacter),this._exp()}return function(e,t){for(var i=0;i<t.length;i++){var n=t[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}(i.prototype,[{key:"_exp",value:function(){var e=this._term(),t=this._moreExp();return c.createNode("op_+",e,t)}},{key:"_moreExp",value:function(){var e,t;switch(this.token.type){case"+":return this.token=this.lexer.getNextToken(this.decimalCharacter),e=this._term(),t=this._moreExp(),c.createNode("op_+",t,e);case"-":return this.token=this.lexer.getNextToken(this.decimalCharacter),e=this._term(),t=this._moreExp(),c.createNode("op_-",t,e)}return c.createLeaf(0)}},{key:"_term",value:function(){var e=this._factor(),t=this._moreTerms();return c.createNode("op_*",e,t)}},{key:"_moreTerms",value:function(){var e,t;switch(this.token.type){case"*":return this.token=this.lexer.getNextToken(this.decimalCharacter),e=this._factor(),t=this._moreTerms(),c.createNode("op_*",t,e);case"/":return this.token=this.lexer.getNextToken(this.decimalCharacter),e=this._factor(),t=this._moreTerms(),c.createNode("op_/",t,e)}return c.createLeaf(1)}},{key:"_factor",value:function(){var e,t,i;switch(this.token.type){case"num":return i=this.token.value,this.token=this.lexer.getNextToken(this.decimalCharacter),c.createLeaf(i);case"-":return this.token=this.lexer.getNextToken(this.decimalCharacter),t=this._factor(),c.createUnaryNode(t);case"(":return this.token=this.lexer.getNextToken(this.decimalCharacter),e=this._exp(),this._match(")"),e;default:throw new Error("Unexpected token '".concat(this.token.symbol,"' with type '").concat(this.token.type,"' at position '").concat(this.token.index,"' in the factor function"))}}},{key:"_match",value:function(e){var t=this.lexer.getIndex()-1;if(this.text[t]!==e)throw new Error("Unexpected token '".concat(this.token.symbol,"' at position '").concat(t,"' in the match function"));this.token=this.lexer.getNextToken(this.decimalCharacter)}}]),i}();function p(e){return function(e){if(Array.isArray(e))return y(e)}(e)||function(e){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(e))return Array.from(e)}(e)||f(e)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function S(e,t){return function(e){if(Array.isArray(e))return e}(e)||function(e,t){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(e)){var i=[],n=!0,a=!1,r=void 0;try{for(var s,o=e[Symbol.iterator]();!(n=(s=o.next()).done)&&(i.push(s.value),!t||i.length!==t);n=!0);}catch(e){a=!0,r=e}finally{try{n||null==o.return||o.return()}finally{if(a)throw r}}return i}}(e,t)||f(e,t)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function f(e,t){if(e){if("string"==typeof e)return y(e,t);var i=Object.prototype.toString.call(e).slice(8,-1);return"Object"===i&&e.constructor&&(i=e.constructor.name),"Map"===i||"Set"===i?Array.from(i):"Arguments"===i||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(i)?y(e,t):void 0}}function y(e,t){(null==t||t>e.length)&&(t=e.length);for(var i=0,n=new Array(t);i<t;i++)n[i]=e[i];return n}function b(){return(b=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var i=arguments[t];for(var n in i)Object.prototype.hasOwnProperty.call(i,n)&&(e[n]=i[n])}return e}).apply(this,arguments)}function w(e){return(w="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function P(e,t){for(var i=0;i<t.length;i++){var n=t[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}var O,k=function(){function B(){var s=this,e=0<arguments.length&&void 0!==arguments[0]?arguments[0]:null,t=1<arguments.length&&void 0!==arguments[1]?arguments[1]:null,i=2<arguments.length&&void 0!==arguments[2]?arguments[2]:null;!function(e){if(!(e instanceof B))throw new TypeError("Cannot call a class as a function")}(this);var n=B._setArgumentsValues(e,t,i),a=n.domElement,r=n.initialValue,o=n.userOptions;if(this.domElement=a,this.defaultRawValue="",this._setSettings(o,!1),this._checkElement(),this.savedCancellableValue=null,this.historyTable=[],this.historyTableIndex=-1,this.onGoingRedo=!1,this.parentForm=this._getParentForm(),!this.runOnce&&this.settings.formatOnPageLoad)this._formatDefaultValueOnPageLoad(r);else{var l;if(M.isNull(r))switch(this.settings.emptyInputBehavior){case B.options.emptyInputBehavior.min:l=this.settings.minimumValue;break;case B.options.emptyInputBehavior.max:l=this.settings.maximumValue;break;case B.options.emptyInputBehavior.zero:l="0";break;case B.options.emptyInputBehavior.focus:case B.options.emptyInputBehavior.press:case B.options.emptyInputBehavior.always:case B.options.emptyInputBehavior.null:l="";break;default:l=this.settings.emptyInputBehavior}else l=r;this._setElementAndRawValue(l)}this.runOnce=!0,this.hasEventListeners=!1,(this.isInputElement||this.isContentEditable)&&(this.settings.noEventListeners||this._createEventListeners(),this._setWritePermissions(!0)),this._saveInitialValues(r),this.sessionStorageAvailable=this.constructor._storageTest(),this.storageNamePrefix="AUTO_",this._setPersistentStorageName(),this.validState=!0,this.isFocused=!1,this.isWheelEvent=!1,this.isDropEvent=!1,this.isEditing=!1,this.rawValueOnFocus=void 0,this.internalModification=!1,this.attributeToWatch=this._getAttributeToWatch(),this.getterSetter=Object.getOwnPropertyDescriptor(this.domElement.__proto__,this.attributeToWatch),this._addWatcher(),this.settings.createLocalList&&this._createLocalList(),this.constructor._addToGlobalList(this),this.global={set:function(t,e){var i=1<arguments.length&&void 0!==e?e:null;s.autoNumericLocalList.forEach(function(e){e.set(t,i)})},setUnformatted:function(t,e){var i=1<arguments.length&&void 0!==e?e:null;s.autoNumericLocalList.forEach(function(e){e.setUnformatted(t,i)})},get:function(e){var t=0<arguments.length&&void 0!==e?e:null,i=[];return s.autoNumericLocalList.forEach(function(e){i.push(e.get())}),s._executeCallback(i,t),i},getNumericString:function(e){var t=0<arguments.length&&void 0!==e?e:null,i=[];return s.autoNumericLocalList.forEach(function(e){i.push(e.getNumericString())}),s._executeCallback(i,t),i},getFormatted:function(e){var t=0<arguments.length&&void 0!==e?e:null,i=[];return s.autoNumericLocalList.forEach(function(e){i.push(e.getFormatted())}),s._executeCallback(i,t),i},getNumber:function(e){var t=0<arguments.length&&void 0!==e?e:null,i=[];return s.autoNumericLocalList.forEach(function(e){i.push(e.getNumber())}),s._executeCallback(i,t),i},getLocalized:function(e){var t=0<arguments.length&&void 0!==e?e:null,i=[];return s.autoNumericLocalList.forEach(function(e){i.push(e.getLocalized())}),s._executeCallback(i,t),i},reformat:function(){s.autoNumericLocalList.forEach(function(e){e.reformat()})},unformat:function(){s.autoNumericLocalList.forEach(function(e){e.unformat()})},unformatLocalized:function(e){var t=0<arguments.length&&void 0!==e?e:null;s.autoNumericLocalList.forEach(function(e){e.unformatLocalized(t)})},update:function(){for(var e=arguments.length,t=new Array(e),i=0;i<e;i++)t[i]=arguments[i];s.autoNumericLocalList.forEach(function(e){e.update.apply(e,t)})},isPristine:function(){var t=!(0<arguments.length&&void 0!==arguments[0])||arguments[0],i=!0;return s.autoNumericLocalList.forEach(function(e){i&&!e.isPristine(t)&&(i=!1)}),i},clear:function(e){var t=0<arguments.length&&void 0!==e&&e;s.autoNumericLocalList.forEach(function(e){e.clear(t)})},remove:function(){s.autoNumericLocalList.forEach(function(e){e.remove()})},wipe:function(){s.autoNumericLocalList.forEach(function(e){e.wipe()})},nuke:function(){s.autoNumericLocalList.forEach(function(e){e.nuke()})},has:function(e){return e instanceof B?s.autoNumericLocalList.has(e.node()):s.autoNumericLocalList.has(e)},addObject:function(e){var t,i;i=e instanceof B?(t=e.node(),e):B.getAutoNumericElement(t=e),s._hasLocalList()||s._createLocalList();var n,a=i._getLocalList();0===a.size&&(i._createLocalList(),a=i._getLocalList()),(n=a instanceof Map?M.mergeMaps(s._getLocalList(),a):(s._addToLocalList(t,i),s._getLocalList())).forEach(function(e){e._setLocalList(n)})},removeObject:function(e,t){var i,n,a=1<arguments.length&&void 0!==t&&t;n=e instanceof B?(i=e.node(),e):B.getAutoNumericElement(i=e);var r=s.autoNumericLocalList;s.autoNumericLocalList.delete(i),r.forEach(function(e){e._setLocalList(s.autoNumericLocalList)}),a||i!==s.node()?n._createLocalList():n._setLocalList(new Map)},empty:function(e){var t=0<arguments.length&&void 0!==e&&e;s.autoNumericLocalList.forEach(function(e){t?e._createLocalList():e._setLocalList(new Map)})},elements:function(){var t=[];return s.autoNumericLocalList.forEach(function(e){t.push(e.node())}),t},getList:function(){return s.autoNumericLocalList},size:function(){return s.autoNumericLocalList.size}},this.options={reset:function(){return s.settings={rawValue:s.defaultRawValue},s.update(B.defaultSettings),s},allowDecimalPadding:function(e){return s.update({allowDecimalPadding:e}),s},alwaysAllowDecimalCharacter:function(e){return s.update({alwaysAllowDecimalCharacter:e}),s},caretPositionOnFocus:function(e){return s.settings.caretPositionOnFocus=e,s},createLocalList:function(e){return s.settings.createLocalList=e,s.settings.createLocalList?s._hasLocalList()||s._createLocalList():s._deleteLocalList(),s},currencySymbol:function(e){return s.update({currencySymbol:e}),s},currencySymbolPlacement:function(e){return s.update({currencySymbolPlacement:e}),s},decimalCharacter:function(e){return s.update({decimalCharacter:e}),s},decimalCharacterAlternative:function(e){return s.settings.decimalCharacterAlternative=e,s},decimalPlaces:function(e){return M.warning("Using `options.decimalPlaces()` instead of calling the specific `options.decimalPlacesRawValue()`, `options.decimalPlacesShownOnFocus()` and `options.decimalPlacesShownOnBlur()` methods will reset those options.\nPlease call the specific methods if you do not want to reset those.",s.settings.showWarnings),s.update({decimalPlaces:e}),s},decimalPlacesRawValue:function(e){return s.update({decimalPlacesRawValue:e}),s},decimalPlacesShownOnBlur:function(e){return s.update({decimalPlacesShownOnBlur:e}),s},decimalPlacesShownOnFocus:function(e){return s.update({decimalPlacesShownOnFocus:e}),s},defaultValueOverride:function(e){return s.update({defaultValueOverride:e}),s},digitalGroupSpacing:function(e){return s.update({digitalGroupSpacing:e}),s},digitGroupSeparator:function(e){return s.update({digitGroupSeparator:e}),s},divisorWhenUnfocused:function(e){return s.update({divisorWhenUnfocused:e}),s},emptyInputBehavior:function(e){return null===s.rawValue&&e!==B.options.emptyInputBehavior.null&&(M.warning("You are trying to modify the `emptyInputBehavior` option to something different than `'null'` (".concat(e,"), but the element raw value is currently set to `null`. This would result in an invalid `rawValue`. In order to fix that, the element value has been changed to the empty string `''`."),s.settings.showWarnings),s.rawValue=""),s.update({emptyInputBehavior:e}),s},eventBubbles:function(e){return s.settings.eventBubbles=e,s},eventIsCancelable:function(e){return s.settings.eventIsCancelable=e,s},failOnUnknownOption:function(e){return s.settings.failOnUnknownOption=e,s},formatOnPageLoad:function(e){return s.settings.formatOnPageLoad=e,s},formulaMode:function(e){return s.settings.formulaMode=e,s},historySize:function(e){return s.settings.historySize=e,s},invalidClass:function(e){return s.settings.invalidClass=e,s},isCancellable:function(e){return s.settings.isCancellable=e,s},leadingZero:function(e){return s.update({leadingZero:e}),s},maximumValue:function(e){return s.update({maximumValue:e}),s},minimumValue:function(e){return s.update({minimumValue:e}),s},modifyValueOnWheel:function(e){return s.settings.modifyValueOnWheel=e,s},negativeBracketsTypeOnBlur:function(e){return s.update({negativeBracketsTypeOnBlur:e}),s},negativePositiveSignPlacement:function(e){return s.update({negativePositiveSignPlacement:e}),s},negativeSignCharacter:function(e){return s.update({negativeSignCharacter:e}),s},noEventListeners:function(e){return e===B.options.noEventListeners.noEvents&&s.settings.noEventListeners===B.options.noEventListeners.addEvents&&s._removeEventListeners(),s.update({noEventListeners:e}),s},onInvalidPaste:function(e){return s.settings.onInvalidPaste=e,s},outputFormat:function(e){return s.settings.outputFormat=e,s},overrideMinMaxLimits:function(e){return s.update({overrideMinMaxLimits:e}),s},positiveSignCharacter:function(e){return s.update({positiveSignCharacter:e}),s},rawValueDivisor:function(e){return s.update({rawValueDivisor:e}),s},readOnly:function(e){return s.settings.readOnly=e,s._setWritePermissions(),s},roundingMethod:function(e){return s.update({roundingMethod:e}),s},saveValueToSessionStorage:function(e){return s.update({saveValueToSessionStorage:e}),s},symbolWhenUnfocused:function(e){return s.update({symbolWhenUnfocused:e}),s},selectNumberOnly:function(e){return s.settings.selectNumberOnly=e,s},selectOnFocus:function(e){return s.settings.selectOnFocus=e,s},serializeSpaces:function(e){return s.settings.serializeSpaces=e,s},showOnlyNumbersOnFocus:function(e){return s.update({showOnlyNumbersOnFocus:e}),s},showPositiveSign:function(e){return s.update({showPositiveSign:e}),s},showWarnings:function(e){return s.settings.showWarnings=e,s},styleRules:function(e){return s.update({styleRules:e}),s},suffixText:function(e){return s.update({suffixText:e}),s},unformatOnHover:function(e){return s.settings.unformatOnHover=e,s},unformatOnSubmit:function(e){return s.settings.unformatOnSubmit=e,s},valuesToStrings:function(e){return s.update({valuesToStrings:e}),s},watchExternalChanges:function(e){return s.update({watchExternalChanges:e}),s},wheelOn:function(e){return s.settings.wheelOn=e,s},wheelStep:function(e){return s.settings.wheelStep=e,s}},this._triggerEvent(B.events.initialized,this.domElement,{newValue:M.getElementValue(this.domElement),newRawValue:this.rawValue,error:null,aNElement:this})}var e,t;return t=[{key:"version",value:function(){return"4.6.0"}},{key:"_setArgumentsValues",value:function(e,t,i){M.isNull(e)&&M.throwError("At least one valid parameter is needed in order to initialize an AutoNumeric object");var n,a,r,s=M.isElement(e),o=M.isString(e),l=M.isObject(t),u=Array.isArray(t)&&0<t.length,c=M.isNumberOrArabic(t)||""===t,h=this._isPreDefinedOptionValid(t),m=M.isNull(t),g=M.isEmptyString(t),d=M.isObject(i),v=Array.isArray(i)&&0<i.length,p=M.isNull(i),f=this._isPreDefinedOptionValid(i);return s&&m&&p?(n=e,a=r=null):s&&c&&p?(n=e,r=t,a=null):s&&l&&p?(n=e,r=null,a=t):s&&h&&p?(n=e,r=null,a=this._getOptionObject(t)):s&&u&&p?(n=e,r=null,a=this.mergeOptions(t)):s&&(m||g)&&d?(n=e,r=null,a=i):s&&(m||g)&&v?(n=e,r=null,a=this.mergeOptions(i)):o&&m&&p?(n=document.querySelector(e),a=r=null):o&&l&&p?(n=document.querySelector(e),r=null,a=t):o&&h&&p?(n=document.querySelector(e),r=null,a=this._getOptionObject(t)):o&&u&&p?(n=document.querySelector(e),r=null,a=this.mergeOptions(t)):o&&(m||g)&&d?(n=document.querySelector(e),r=null,a=i):o&&(m||g)&&v?(n=document.querySelector(e),r=null,a=this.mergeOptions(i)):o&&c&&p?(n=document.querySelector(e),r=t,a=null):o&&c&&d?(n=document.querySelector(e),r=t,a=i):o&&c&&f?(n=document.querySelector(e),r=t,a=this._getOptionObject(i)):o&&c&&v?(n=document.querySelector(e),r=t,a=this.mergeOptions(i)):s&&c&&d?(n=e,r=t,a=i):s&&c&&f?(n=e,r=t,a=this._getOptionObject(i)):s&&c&&v?(n=e,r=t,a=this.mergeOptions(i)):M.throwError("The parameters given to the AutoNumeric object are not valid, '".concat(e,"', '").concat(t,"' and '").concat(i,"' given.")),M.isNull(n)&&M.throwError("The selector '".concat(e,"' did not select any valid DOM element. Please check on which element you called AutoNumeric.")),{domElement:n,initialValue:r,userOptions:a}}},{key:"mergeOptions",value:function(e){var t=this,i={};return e.forEach(function(e){b(i,t._getOptionObject(e))}),i}},{key:"_isPreDefinedOptionValid",value:function(e){return Object.prototype.hasOwnProperty.call(B.predefinedOptions,e)}},{key:"_getOptionObject",value:function(e){var t;return M.isString(e)?null==(t=B.getPredefinedOptions()[e])&&M.warning("The given pre-defined option [".concat(e,"] is not recognized by autoNumeric. Please check that pre-defined option name."),!0):t=e,t}},{key:"_doesFormHandlerListExists",value:function(){var e=w(window.aNFormHandlerMap);return"undefined"!==e&&"object"===e}},{key:"_createFormHandlerList",value:function(){window.aNFormHandlerMap=new Map}},{key:"_checkValuesToStringsArray",value:function(e,t){return M.isInArray(String(e),t)}},{key:"_checkValuesToStringsSettings",value:function(e,t){return this._checkValuesToStringsArray(e,Object.keys(t.valuesToStrings))}},{key:"_checkStringsToValuesSettings",value:function(e,t){return this._checkValuesToStringsArray(e,Object.values(t.valuesToStrings))}},{key:"_unformatAltHovered",value:function(e){e.hoveredWithAlt=!0,e.unformat()}},{key:"_reformatAltHovered",value:function(e){e.hoveredWithAlt=!1,e.reformat()}},{key:"_getChildANInputElement",value:function(e){var t=this,i=e.getElementsByTagName("input"),n=[];return Array.prototype.slice.call(i,0).forEach(function(e){t.test(e)&&n.push(e)}),n}},{key:"test",value:function(e){return this._isInGlobalList(M.domElement(e))}},{key:"_createWeakMap",value:function(e){window[e]=new WeakMap}},{key:"_createGlobalList",value:function(){this.autoNumericGlobalListName="autoNumericGlobalList",this._createWeakMap(this.autoNumericGlobalListName)}},{key:"_doesGlobalListExists",value:function(){var e=w(window[this.autoNumericGlobalListName]);return"undefined"!==e&&"object"===e}},{key:"_addToGlobalList",value:function(e){this._doesGlobalListExists()||this._createGlobalList();var t=e.node();if(this._isInGlobalList(t)){if(this._getFromGlobalList(t)===this)return;M.warning("A reference to the DOM element you just initialized already exists in the global AutoNumeric element list. Please make sure to not initialize the same DOM element multiple times.",e.getSettings().showWarnings)}window[this.autoNumericGlobalListName].set(t,e)}},{key:"_removeFromGlobalList",value:function(e){this._doesGlobalListExists()&&window[this.autoNumericGlobalListName].delete(e.node())}},{key:"_getFromGlobalList",value:function(e){return this._doesGlobalListExists()?window[this.autoNumericGlobalListName].get(e):null}},{key:"_isInGlobalList",value:function(e){return!!this._doesGlobalListExists()&&window[this.autoNumericGlobalListName].has(e)}},{key:"validate",value:function(e,t,i){var n=!(1<arguments.length&&void 0!==t)||t,a=2<arguments.length&&void 0!==i?i:null;!M.isUndefinedOrNullOrEmpty(e)&&M.isObject(e)||M.throwError("The userOptions are invalid ; it should be a valid object, [".concat(e,"] given."));var r,s=M.isObject(a);s||M.isNull(a)||M.throwError("The 'originalOptions' parameter is invalid ; it should either be a valid option object or `null`, [".concat(e,"] given.")),M.isNull(e)||this._convertOldOptionsToNewOnes(e),r=n?b({},this.getDefaultConfig(),e):e,M.isTrueOrFalseString(r.showWarnings)||M.isBoolean(r.showWarnings)||M.throwError("The debug option 'showWarnings' is invalid ; it should be either 'true' or 'false', [".concat(r.showWarnings,"] given."));var o,l=/^[0-9]+$/,u=/[0-9]+/,c=/^-?[0-9]+(\.?[0-9]+)?$/,h=/^[0-9]+(\.?[0-9]+)?$/;M.isTrueOrFalseString(r.allowDecimalPadding)||M.isBoolean(r.allowDecimalPadding)||r.allowDecimalPadding===B.options.allowDecimalPadding.floats||M.throwError("The decimal padding option 'allowDecimalPadding' is invalid ; it should either be `false`, `true` or `'floats'`, [".concat(r.allowDecimalPadding,"] given.")),r.allowDecimalPadding!==B.options.allowDecimalPadding.never&&"false"!==r.allowDecimalPadding||r.decimalPlaces===B.options.decimalPlaces.none&&r.decimalPlacesShownOnBlur===B.options.decimalPlacesShownOnBlur.none&&r.decimalPlacesShownOnFocus===B.options.decimalPlacesShownOnFocus.none||M.warning("Setting 'allowDecimalPadding' to [".concat(r.allowDecimalPadding,"] will override the current 'decimalPlaces*' settings [").concat(r.decimalPlaces,", ").concat(r.decimalPlacesShownOnBlur," and ").concat(r.decimalPlacesShownOnFocus,"]."),r.showWarnings),M.isTrueOrFalseString(r.alwaysAllowDecimalCharacter)||M.isBoolean(r.alwaysAllowDecimalCharacter)||M.throwError("The option 'alwaysAllowDecimalCharacter' is invalid ; it should either be `true` or `false`, [".concat(r.alwaysAllowDecimalCharacter,"] given.")),M.isNull(r.caretPositionOnFocus)||M.isInArray(r.caretPositionOnFocus,[B.options.caretPositionOnFocus.start,B.options.caretPositionOnFocus.end,B.options.caretPositionOnFocus.decimalLeft,B.options.caretPositionOnFocus.decimalRight])||M.throwError("The display on empty string option 'caretPositionOnFocus' is invalid ; it should either be `null`, 'focus', 'press', 'always' or 'zero', [".concat(r.caretPositionOnFocus,"] given.")),o=s?a:this._correctCaretPositionOnFocusAndSelectOnFocusOptions(e),M.isNull(o)||o.caretPositionOnFocus===B.options.caretPositionOnFocus.doNoForceCaretPosition||o.selectOnFocus!==B.options.selectOnFocus.select||M.warning("The 'selectOnFocus' option is set to 'select', which is in conflict with the 'caretPositionOnFocus' which is set to '".concat(o.caretPositionOnFocus,"'. As a result, if this has been called when instantiating an AutoNumeric object, the 'selectOnFocus' option is forced to 'doNotSelect'."),r.showWarnings),M.isInArray(r.digitGroupSeparator,[B.options.digitGroupSeparator.comma,B.options.digitGroupSeparator.dot,B.options.digitGroupSeparator.normalSpace,B.options.digitGroupSeparator.thinSpace,B.options.digitGroupSeparator.narrowNoBreakSpace,B.options.digitGroupSeparator.noBreakSpace,B.options.digitGroupSeparator.noSeparator,B.options.digitGroupSeparator.apostrophe,B.options.digitGroupSeparator.arabicThousandsSeparator,B.options.digitGroupSeparator.dotAbove,B.options.digitGroupSeparator.privateUseTwo])||M.throwError("The thousand separator character option 'digitGroupSeparator' is invalid ; it should be ',', '.', '٬', '˙', \"'\", '', ' ', ' ', ' ', ' ' or empty (''), [".concat(r.digitGroupSeparator,"] given.")),M.isTrueOrFalseString(r.showOnlyNumbersOnFocus)||M.isBoolean(r.showOnlyNumbersOnFocus)||M.throwError("The 'showOnlyNumbersOnFocus' option is invalid ; it should be either 'true' or 'false', [".concat(r.showOnlyNumbersOnFocus,"] given.")),M.isInArray(r.digitalGroupSpacing,[B.options.digitalGroupSpacing.two,B.options.digitalGroupSpacing.twoScaled,B.options.digitalGroupSpacing.three,B.options.digitalGroupSpacing.four])||2<=r.digitalGroupSpacing&&r.digitalGroupSpacing<=4||M.throwError("The grouping separator option for thousands 'digitalGroupSpacing' is invalid ; it should be '2', '2s', '3', or '4', [".concat(r.digitalGroupSpacing,"] given.")),M.isInArray(r.decimalCharacter,[B.options.decimalCharacter.comma,B.options.decimalCharacter.dot,B.options.decimalCharacter.middleDot,B.options.decimalCharacter.arabicDecimalSeparator,B.options.decimalCharacter.decimalSeparatorKeySymbol])||M.throwError("The decimal separator character option 'decimalCharacter' is invalid ; it should be '.', ',', '·', '⎖' or '٫', [".concat(r.decimalCharacter,"] given.")),r.decimalCharacter===r.digitGroupSeparator&&M.throwError("autoNumeric will not function properly when the decimal character 'decimalCharacter' [".concat(r.decimalCharacter,"] and the thousand separator 'digitGroupSeparator' [").concat(r.digitGroupSeparator,"] are the same character.")),M.isNull(r.decimalCharacterAlternative)||M.isString(r.decimalCharacterAlternative)||M.throwError("The alternate decimal separator character option 'decimalCharacterAlternative' is invalid ; it should be a string, [".concat(r.decimalCharacterAlternative,"] given.")),""===r.currencySymbol||M.isString(r.currencySymbol)||M.throwError("The currency symbol option 'currencySymbol' is invalid ; it should be a string, [".concat(r.currencySymbol,"] given.")),M.isInArray(r.currencySymbolPlacement,[B.options.currencySymbolPlacement.prefix,B.options.currencySymbolPlacement.suffix])||M.throwError("The placement of the currency sign option 'currencySymbolPlacement' is invalid ; it should either be 'p' (prefix) or 's' (suffix), [".concat(r.currencySymbolPlacement,"] given.")),M.isInArray(r.negativePositiveSignPlacement,[B.options.negativePositiveSignPlacement.prefix,B.options.negativePositiveSignPlacement.suffix,B.options.negativePositiveSignPlacement.left,B.options.negativePositiveSignPlacement.right,B.options.negativePositiveSignPlacement.none])||M.throwError("The placement of the negative sign option 'negativePositiveSignPlacement' is invalid ; it should either be 'p' (prefix), 's' (suffix), 'l' (left), 'r' (right) or 'null', [".concat(r.negativePositiveSignPlacement,"] given.")),M.isTrueOrFalseString(r.showPositiveSign)||M.isBoolean(r.showPositiveSign)||M.throwError("The show positive sign option 'showPositiveSign' is invalid ; it should be either 'true' or 'false', [".concat(r.showPositiveSign,"] given.")),M.isString(r.suffixText)&&(""===r.suffixText||!M.isNegative(r.suffixText,r.negativeSignCharacter)&&!u.test(r.suffixText))||M.throwError("The additional suffix option 'suffixText' is invalid ; it should not contains the negative sign '".concat(r.negativeSignCharacter,"' nor any numerical characters, [").concat(r.suffixText,"] given.")),M.isString(r.negativeSignCharacter)&&1===r.negativeSignCharacter.length&&!M.isUndefinedOrNullOrEmpty(r.negativeSignCharacter)&&!u.test(r.negativeSignCharacter)||M.throwError("The negative sign character option 'negativeSignCharacter' is invalid ; it should be a single character, and cannot be any numerical characters, [".concat(r.negativeSignCharacter,"] given.")),M.isString(r.positiveSignCharacter)&&1===r.positiveSignCharacter.length&&!M.isUndefinedOrNullOrEmpty(r.positiveSignCharacter)&&!u.test(r.positiveSignCharacter)||M.throwError("The positive sign character option 'positiveSignCharacter' is invalid ; it should be a single character, and cannot be any numerical characters, [".concat(r.positiveSignCharacter,"] given.\nIf you want to hide the positive sign character, you need to set the `showPositiveSign` option to `true`.")),r.negativeSignCharacter===r.positiveSignCharacter&&M.throwError("The positive 'positiveSignCharacter' and negative 'negativeSignCharacter' sign characters cannot be identical ; [".concat(r.negativeSignCharacter,"] given."));var m=S(M.isNull(r.negativeBracketsTypeOnBlur)?["",""]:r.negativeBracketsTypeOnBlur.split(","),2),g=m[0],d=m[1];(M.contains(r.digitGroupSeparator,r.negativeSignCharacter)||M.contains(r.decimalCharacter,r.negativeSignCharacter)||M.contains(r.decimalCharacterAlternative,r.negativeSignCharacter)||M.contains(g,r.negativeSignCharacter)||M.contains(d,r.negativeSignCharacter)||M.contains(r.suffixText,r.negativeSignCharacter))&&M.throwError("The negative sign character option 'negativeSignCharacter' is invalid ; it should not be equal or a part of the digit separator, the decimal character, the decimal character alternative, the negative brackets or the suffix text, [".concat(r.negativeSignCharacter,"] given.")),(M.contains(r.digitGroupSeparator,r.positiveSignCharacter)||M.contains(r.decimalCharacter,r.positiveSignCharacter)||M.contains(r.decimalCharacterAlternative,r.positiveSignCharacter)||M.contains(g,r.positiveSignCharacter)||M.contains(d,r.positiveSignCharacter)||M.contains(r.suffixText,r.positiveSignCharacter))&&M.throwError("The positive sign character option 'positiveSignCharacter' is invalid ; it should not be equal or a part of the digit separator, the decimal character, the decimal character alternative, the negative brackets or the suffix text, [".concat(r.positiveSignCharacter,"] given.")),M.isNull(r.overrideMinMaxLimits)||M.isInArray(r.overrideMinMaxLimits,[B.options.overrideMinMaxLimits.ceiling,B.options.overrideMinMaxLimits.floor,B.options.overrideMinMaxLimits.ignore,B.options.overrideMinMaxLimits.invalid])||M.throwError("The override min & max limits option 'overrideMinMaxLimits' is invalid ; it should either be 'ceiling', 'floor', 'ignore' or 'invalid', [".concat(r.overrideMinMaxLimits,"] given.")),r.overrideMinMaxLimits!==B.options.overrideMinMaxLimits.invalid&&r.overrideMinMaxLimits!==B.options.overrideMinMaxLimits.ignore&&(0<r.minimumValue||r.maximumValue<0)&&M.warning("You've set a `minimumValue` or a `maximumValue` excluding the value `0`. AutoNumeric will force the users to always have a valid value in the input, hence preventing them to clear the field. If you want to allow for temporary invalid values (ie. out-of-range), you should use the 'invalid' option for the 'overrideMinMaxLimits' setting."),M.isString(r.maximumValue)&&c.test(r.maximumValue)||M.throwError("The maximum possible value option 'maximumValue' is invalid ; it should be a string that represents a positive or negative number, [".concat(r.maximumValue,"] given.")),M.isString(r.minimumValue)&&c.test(r.minimumValue)||M.throwError("The minimum possible value option 'minimumValue' is invalid ; it should be a string that represents a positive or negative number, [".concat(r.minimumValue,"] given.")),parseFloat(r.minimumValue)>parseFloat(r.maximumValue)&&M.throwError("The minimum possible value option is greater than the maximum possible value option ; 'minimumValue' [".concat(r.minimumValue,"] should be smaller than 'maximumValue' [").concat(r.maximumValue,"].")),M.isInt(r.decimalPlaces)&&0<=r.decimalPlaces||M.isString(r.decimalPlaces)&&l.test(r.decimalPlaces)||M.throwError("The number of decimal places option 'decimalPlaces' is invalid ; it should be a positive integer, [".concat(r.decimalPlaces,"] given.")),M.isNull(r.decimalPlacesRawValue)||M.isInt(r.decimalPlacesRawValue)&&0<=r.decimalPlacesRawValue||M.isString(r.decimalPlacesRawValue)&&l.test(r.decimalPlacesRawValue)||M.throwError("The number of decimal places for the raw value option 'decimalPlacesRawValue' is invalid ; it should be a positive integer or `null`, [".concat(r.decimalPlacesRawValue,"] given.")),this._validateDecimalPlacesRawValue(r),M.isNull(r.decimalPlacesShownOnFocus)||l.test(String(r.decimalPlacesShownOnFocus))||M.throwError("The number of expanded decimal places option 'decimalPlacesShownOnFocus' is invalid ; it should be a positive integer or `null`, [".concat(r.decimalPlacesShownOnFocus,"] given.")),!M.isNull(r.decimalPlacesShownOnFocus)&&Number(r.decimalPlaces)>Number(r.decimalPlacesShownOnFocus)&&M.warning("The extended decimal places 'decimalPlacesShownOnFocus' [".concat(r.decimalPlacesShownOnFocus,"] should be greater than the 'decimalPlaces' [").concat(r.decimalPlaces,"] value. Currently, this will limit the ability of your user to manually change some of the decimal places. Do you really want to do that?"),r.showWarnings),(M.isNull(r.divisorWhenUnfocused)||h.test(r.divisorWhenUnfocused))&&0!==r.divisorWhenUnfocused&&"0"!==r.divisorWhenUnfocused&&1!==r.divisorWhenUnfocused&&"1"!==r.divisorWhenUnfocused||M.throwError("The divisor option 'divisorWhenUnfocused' is invalid ; it should be a positive number higher than one, preferably an integer, [".concat(r.divisorWhenUnfocused,"] given.")),M.isNull(r.decimalPlacesShownOnBlur)||l.test(r.decimalPlacesShownOnBlur)||M.throwError("The number of decimals shown when unfocused option 'decimalPlacesShownOnBlur' is invalid ; it should be a positive integer or `null`, [".concat(r.decimalPlacesShownOnBlur,"] given.")),M.isNull(r.symbolWhenUnfocused)||M.isString(r.symbolWhenUnfocused)||M.throwError("The symbol to show when unfocused option 'symbolWhenUnfocused' is invalid ; it should be a string, [".concat(r.symbolWhenUnfocused,"] given.")),M.isTrueOrFalseString(r.saveValueToSessionStorage)||M.isBoolean(r.saveValueToSessionStorage)||M.throwError("The save to session storage option 'saveValueToSessionStorage' is invalid ; it should be either 'true' or 'false', [".concat(r.saveValueToSessionStorage,"] given.")),M.isInArray(r.onInvalidPaste,[B.options.onInvalidPaste.error,B.options.onInvalidPaste.ignore,B.options.onInvalidPaste.clamp,B.options.onInvalidPaste.truncate,B.options.onInvalidPaste.replace])||M.throwError("The paste behavior option 'onInvalidPaste' is invalid ; it should either be 'error', 'ignore', 'clamp', 'truncate' or 'replace' (cf. documentation), [".concat(r.onInvalidPaste,"] given.")),M.isInArray(r.roundingMethod,[B.options.roundingMethod.halfUpSymmetric,B.options.roundingMethod.halfUpAsymmetric,B.options.roundingMethod.halfDownSymmetric,B.options.roundingMethod.halfDownAsymmetric,B.options.roundingMethod.halfEvenBankersRounding,B.options.roundingMethod.upRoundAwayFromZero,B.options.roundingMethod.downRoundTowardZero,B.options.roundingMethod.toCeilingTowardPositiveInfinity,B.options.roundingMethod.toFloorTowardNegativeInfinity,B.options.roundingMethod.toNearest05,B.options.roundingMethod.toNearest05Alt,B.options.roundingMethod.upToNext05,B.options.roundingMethod.downToNext05])||M.throwError("The rounding method option 'roundingMethod' is invalid ; it should either be 'S', 'A', 's', 'a', 'B', 'U', 'D', 'C', 'F', 'N05', 'CHF', 'U05' or 'D05' (cf. documentation), [".concat(r.roundingMethod,"] given.")),M.isNull(r.negativeBracketsTypeOnBlur)||M.isInArray(r.negativeBracketsTypeOnBlur,[B.options.negativeBracketsTypeOnBlur.parentheses,B.options.negativeBracketsTypeOnBlur.brackets,B.options.negativeBracketsTypeOnBlur.chevrons,B.options.negativeBracketsTypeOnBlur.curlyBraces,B.options.negativeBracketsTypeOnBlur.angleBrackets,B.options.negativeBracketsTypeOnBlur.japaneseQuotationMarks,B.options.negativeBracketsTypeOnBlur.halfBrackets,B.options.negativeBracketsTypeOnBlur.whiteSquareBrackets,B.options.negativeBracketsTypeOnBlur.quotationMarks,B.options.negativeBracketsTypeOnBlur.guillemets])||M.throwError("The brackets for negative values option 'negativeBracketsTypeOnBlur' is invalid ; it should either be '(,)', '[,]', '<,>', '{,}', '〈,〉', '｢,｣', '⸤,⸥', '⟦,⟧', '‹,›' or '«,»', [".concat(r.negativeBracketsTypeOnBlur,"] given.")),(M.isString(r.emptyInputBehavior)||M.isNumber(r.emptyInputBehavior))&&(M.isInArray(r.emptyInputBehavior,[B.options.emptyInputBehavior.focus,B.options.emptyInputBehavior.press,B.options.emptyInputBehavior.always,B.options.emptyInputBehavior.min,B.options.emptyInputBehavior.max,B.options.emptyInputBehavior.zero,B.options.emptyInputBehavior.null])||c.test(r.emptyInputBehavior))||M.throwError("The display on empty string option 'emptyInputBehavior' is invalid ; it should either be 'focus', 'press', 'always', 'min', 'max', 'zero', 'null', a number, or a string that represents a number, [".concat(r.emptyInputBehavior,"] given.")),r.emptyInputBehavior===B.options.emptyInputBehavior.zero&&(0<r.minimumValue||r.maximumValue<0)&&M.throwError("The 'emptyInputBehavior' option is set to 'zero', but this value is outside of the range defined by 'minimumValue' and 'maximumValue' [".concat(r.minimumValue,", ").concat(r.maximumValue,"].")),c.test(String(r.emptyInputBehavior))&&(this._isWithinRangeWithOverrideOption(r.emptyInputBehavior,r)||M.throwError("The 'emptyInputBehavior' option is set to a number or a string that represents a number, but its value [".concat(r.emptyInputBehavior,"] is outside of the range defined by the 'minimumValue' and 'maximumValue' options [").concat(r.minimumValue,", ").concat(r.maximumValue,"]."))),M.isTrueOrFalseString(r.eventBubbles)||M.isBoolean(r.eventBubbles)||M.throwError("The event bubbles option 'eventBubbles' is invalid ; it should be either 'true' or 'false', [".concat(r.eventBubbles,"] given.")),M.isTrueOrFalseString(r.eventIsCancelable)||M.isBoolean(r.eventIsCancelable)||M.throwError("The event is cancelable option 'eventIsCancelable' is invalid ; it should be either 'true' or 'false', [".concat(r.eventIsCancelable,"] given.")),!M.isBoolean(r.invalidClass)&&/^-?[_a-zA-Z]+[_a-zA-Z0-9-]*$/.test(r.invalidClass)||M.throwError("The name of the 'invalidClass' option is not a valid CSS class name ; it should not be empty, and should follow the '^-?[_a-zA-Z]+[_a-zA-Z0-9-]*$' regex, [".concat(r.invalidClass,"] given.")),M.isInArray(r.leadingZero,[B.options.leadingZero.allow,B.options.leadingZero.deny,B.options.leadingZero.keep])||M.throwError("The leading zero behavior option 'leadingZero' is invalid ; it should either be 'allow', 'deny' or 'keep', [".concat(r.leadingZero,"] given.")),M.isTrueOrFalseString(r.formatOnPageLoad)||M.isBoolean(r.formatOnPageLoad)||M.throwError("The format on initialization option 'formatOnPageLoad' is invalid ; it should be either 'true' or 'false', [".concat(r.formatOnPageLoad,"] given.")),M.isTrueOrFalseString(r.formulaMode)||M.isBoolean(r.formulaMode)||M.throwError("The formula mode option 'formulaMode' is invalid ; it should be either 'true' or 'false', [".concat(r.formulaMode,"] given.")),l.test(r.historySize)&&0!==r.historySize||M.throwError("The history size option 'historySize' is invalid ; it should be a positive integer, [".concat(r.historySize,"] given.")),M.isTrueOrFalseString(r.selectNumberOnly)||M.isBoolean(r.selectNumberOnly)||M.throwError("The select number only option 'selectNumberOnly' is invalid ; it should be either 'true' or 'false', [".concat(r.selectNumberOnly,"] given.")),M.isTrueOrFalseString(r.selectOnFocus)||M.isBoolean(r.selectOnFocus)||M.throwError("The select on focus option 'selectOnFocus' is invalid ; it should be either 'true' or 'false', [".concat(r.selectOnFocus,"] given.")),M.isNull(r.defaultValueOverride)||""===r.defaultValueOverride||c.test(r.defaultValueOverride)||M.throwError("The unformatted default value option 'defaultValueOverride' is invalid ; it should be a string that represents a positive or negative number, [".concat(r.defaultValueOverride,"] given.")),M.isTrueOrFalseString(r.unformatOnSubmit)||M.isBoolean(r.unformatOnSubmit)||M.throwError("The remove formatting on submit option 'unformatOnSubmit' is invalid ; it should be either 'true' or 'false', [".concat(r.unformatOnSubmit,"] given.")),M.isNull(r.valuesToStrings)||M.isObject(r.valuesToStrings)||M.throwError("The option 'valuesToStrings' is invalid ; it should be an object, ideally with 'key -> value' entries, [".concat(r.valuesToStrings,"] given.")),M.isNull(r.outputFormat)||M.isInArray(r.outputFormat,[B.options.outputFormat.string,B.options.outputFormat.number,B.options.outputFormat.dot,B.options.outputFormat.negativeDot,B.options.outputFormat.comma,B.options.outputFormat.negativeComma,B.options.outputFormat.dotNegative,B.options.outputFormat.commaNegative])||M.throwError("The custom locale format option 'outputFormat' is invalid ; it should either be null, 'string', 'number', '.', '-.', ',', '-,', '.-' or ',-', [".concat(r.outputFormat,"] given.")),M.isTrueOrFalseString(r.isCancellable)||M.isBoolean(r.isCancellable)||M.throwError("The cancellable behavior option 'isCancellable' is invalid ; it should be either 'true' or 'false', [".concat(r.isCancellable,"] given.")),M.isTrueOrFalseString(r.modifyValueOnWheel)||M.isBoolean(r.modifyValueOnWheel)||M.throwError("The increment/decrement on mouse wheel option 'modifyValueOnWheel' is invalid ; it should be either 'true' or 'false', [".concat(r.modifyValueOnWheel,"] given.")),M.isTrueOrFalseString(r.watchExternalChanges)||M.isBoolean(r.watchExternalChanges)||M.throwError("The option 'watchExternalChanges' is invalid ; it should be either 'true' or 'false', [".concat(r.watchExternalChanges,"] given.")),M.isInArray(r.wheelOn,[B.options.wheelOn.focus,B.options.wheelOn.hover])||M.throwError("The wheel behavior option 'wheelOn' is invalid ; it should either be 'focus' or 'hover', [".concat(r.wheelOn,"] given.")),(M.isString(r.wheelStep)||M.isNumber(r.wheelStep))&&("progressive"===r.wheelStep||h.test(r.wheelStep))&&0!==Number(r.wheelStep)||M.throwError("The wheel step value option 'wheelStep' is invalid ; it should either be the string 'progressive', or a number or a string that represents a positive number (excluding zero), [".concat(r.wheelStep,"] given.")),M.isInArray(r.serializeSpaces,[B.options.serializeSpaces.plus,B.options.serializeSpaces.percent])||M.throwError("The space replacement character option 'serializeSpaces' is invalid ; it should either be '+' or '%20', [".concat(r.serializeSpaces,"] given.")),M.isTrueOrFalseString(r.noEventListeners)||M.isBoolean(r.noEventListeners)||M.throwError("The option 'noEventListeners' that prevent the creation of event listeners is invalid ; it should be either 'true' or 'false', [".concat(r.noEventListeners,"] given.")),M.isNull(r.styleRules)||M.isObject(r.styleRules)&&(Object.prototype.hasOwnProperty.call(r.styleRules,"positive")||Object.prototype.hasOwnProperty.call(r.styleRules,"negative")||Object.prototype.hasOwnProperty.call(r.styleRules,"ranges")||Object.prototype.hasOwnProperty.call(r.styleRules,"userDefined"))||M.throwError("The option 'styleRules' is invalid ; it should be a correctly structured object, with one or more 'positive', 'negative', 'ranges' or 'userDefined' attributes, [".concat(r.styleRules,"] given.")),M.isNull(r.styleRules)||!Object.prototype.hasOwnProperty.call(r.styleRules,"userDefined")||M.isNull(r.styleRules.userDefined)||r.styleRules.userDefined.forEach(function(e){Object.prototype.hasOwnProperty.call(e,"callback")&&!M.isFunction(e.callback)&&M.throwError("The callback defined in the `userDefined` attribute is not a function, ".concat(w(e.callback)," given."))}),(M.isNull(r.rawValueDivisor)||h.test(r.rawValueDivisor))&&0!==r.rawValueDivisor&&"0"!==r.rawValueDivisor&&1!==r.rawValueDivisor&&"1"!==r.rawValueDivisor||M.throwError("The raw value divisor option 'rawValueDivisor' is invalid ; it should be a positive number higher than one, preferably an integer, [".concat(r.rawValueDivisor,"] given.")),M.isTrueOrFalseString(r.readOnly)||M.isBoolean(r.readOnly)||M.throwError("The option 'readOnly' is invalid ; it should be either 'true' or 'false', [".concat(r.readOnly,"] given.")),M.isTrueOrFalseString(r.unformatOnHover)||M.isBoolean(r.unformatOnHover)||M.throwError("The option 'unformatOnHover' is invalid ; it should be either 'true' or 'false', [".concat(r.unformatOnHover,"] given.")),M.isTrueOrFalseString(r.failOnUnknownOption)||M.isBoolean(r.failOnUnknownOption)||M.throwError("The debug option 'failOnUnknownOption' is invalid ; it should be either 'true' or 'false', [".concat(r.failOnUnknownOption,"] given.")),M.isTrueOrFalseString(r.createLocalList)||M.isBoolean(r.createLocalList)||M.throwError("The debug option 'createLocalList' is invalid ; it should be either 'true' or 'false', [".concat(r.createLocalList,"] given."))}},{key:"_validateDecimalPlacesRawValue",value:function(e){M.isNull(e.decimalPlacesRawValue)||(e.decimalPlacesRawValue<e.decimalPlaces&&M.warning("The number of decimal places to store in the raw value [".concat(e.decimalPlacesRawValue,"] is lower than the ones to display [").concat(e.decimalPlaces,"]. This will likely confuse your users.\nTo solve that, you'd need to either set `decimalPlacesRawValue` to `null`, or set a number of decimal places for the raw value equal of bigger than `decimalPlaces`."),e.showWarnings),e.decimalPlacesRawValue<e.decimalPlacesShownOnFocus&&M.warning("The number of decimal places to store in the raw value [".concat(e.decimalPlacesRawValue,"] is lower than the ones shown on focus [").concat(e.decimalPlacesShownOnFocus,"]. This will likely confuse your users.\nTo solve that, you'd need to either set `decimalPlacesRawValue` to `null`, or set a number of decimal places for the raw value equal of bigger than `decimalPlacesShownOnFocus`."),e.showWarnings),e.decimalPlacesRawValue<e.decimalPlacesShownOnBlur&&M.warning("The number of decimal places to store in the raw value [".concat(e.decimalPlacesRawValue,"] is lower than the ones shown when unfocused [").concat(e.decimalPlacesShownOnBlur,"]. This will likely confuse your users.\nTo solve that, you'd need to either set `decimalPlacesRawValue` to `null`, or set a number of decimal places for the raw value equal of bigger than `decimalPlacesShownOnBlur`."),e.showWarnings))}},{key:"areSettingsValid",value:function(e){var t=!0;try{this.validate(e,!0)}catch(e){t=!1}return t}},{key:"getDefaultConfig",value:function(){return B.defaultSettings}},{key:"getPredefinedOptions",value:function(){return B.predefinedOptions}},{key:"_generateOptionsObjectFromOptionsArray",value:function(e){var t,i=this;return M.isUndefinedOrNullOrEmpty(e)||0===e.length?t=null:(t={},1===e.length&&Array.isArray(e[0])?e[0].forEach(function(e){b(t,i._getOptionObject(e))}):1<=e.length&&e.forEach(function(e){b(t,i._getOptionObject(e))})),t}},{key:"format",value:function(e){if(M.isUndefined(e)||null===e)return null;var t;t=M.isElement(e)?M.getElementValue(e):e,M.isString(t)||M.isNumber(t)||M.throwError('The value "'.concat(t,'" being "set" is not numeric and therefore cannot be used appropriately.'));for(var i=arguments.length,n=new Array(1<i?i-1:0),a=1;a<i;a++)n[a-1]=arguments[a];var r=this._generateOptionsObjectFromOptionsArray(n),s=b({},this.getDefaultConfig(),r);s.isNegativeSignAllowed=t<0,s.isPositiveSignAllowed=0<=t,this._setBrackets(s),this._cachesUsualRegularExpressions(s,{});var o=this._toNumericValue(t,s);return isNaN(Number(o))&&M.throwError("The value [".concat(o,"] that you are trying to format is not a recognized number.")),this._isWithinRangeWithOverrideOption(o,s)||(M.triggerEvent(B.events.formatted,document,{oldValue:null,newValue:null,oldRawValue:null,newRawValue:null,isPristine:null,error:"Range test failed",aNElement:null},!0,!0),M.throwError("The value [".concat(o,"] being set falls outside of the minimumValue [").concat(s.minimumValue,"] and maximumValue [").concat(s.maximumValue,"] range set for this element"))),s.valuesToStrings&&this._checkValuesToStringsSettings(t,s)?s.valuesToStrings[t]:(this._correctNegativePositiveSignPlacementOption(s),this._calculateDecimalPlacesOnInit(s),M.isUndefinedOrNullOrEmpty(s.rawValueDivisor)||0===s.rawValueDivisor||""===o||null===o||(o*=s.rawValueDivisor),o=this._roundFormattedValueShownOnFocus(o,s),o=this._modifyNegativeSignAndDecimalCharacterForFormattedValue(o,s),o=this._addGroupSeparators(o,s,!1,o))}},{key:"formatAndSet",value:function(e,t){var i=1<arguments.length&&void 0!==t?t:null,n=this.format(e,i);return M.setElementValue(e,n),n}},{key:"unformat",value:function(e){if(M.isNumberStrict(e))return e;var t;if(""===(t=M.isElement(e)?M.getElementValue(e):e))return"";if(M.isUndefined(t)||null===t)return null;(M.isArray(t)||M.isObject(t))&&M.throwError("A number or a string representing a number is needed to be able to unformat it, [".concat(t,"] given."));for(var i=arguments.length,n=new Array(1<i?i-1:0),a=1;a<i;a++)n[a-1]=arguments[a];var r=this._generateOptionsObjectFromOptionsArray(n),s=b({},this.getDefaultConfig(),r);if(s.isNegativeSignAllowed=!1,s.isPositiveSignAllowed=!0,t=t.toString(),s.valuesToStrings&&this._checkStringsToValuesSettings(t,s))return M.objectKeyLookup(s.valuesToStrings,t);if(M.isNegative(t,s.negativeSignCharacter))s.isNegativeSignAllowed=!0,s.isPositiveSignAllowed=!1;else if(!M.isNull(s.negativeBracketsTypeOnBlur)){var o=S(s.negativeBracketsTypeOnBlur.split(","),2);s.firstBracket=o[0],s.lastBracket=o[1],t.charAt(0)===s.firstBracket&&t.charAt(t.length-1)===s.lastBracket&&(s.isNegativeSignAllowed=!0,s.isPositiveSignAllowed=!1,t=this._removeBrackets(t,s,!1))}return t=this._convertToNumericString(t,s),new RegExp("[^+-0123456789.]","gi").test(t)?NaN:(this._correctNegativePositiveSignPlacementOption(s),s.decimalPlacesRawValue?s.originalDecimalPlacesRawValue=s.decimalPlacesRawValue:s.originalDecimalPlacesRawValue=s.decimalPlaces,this._calculateDecimalPlacesOnInit(s),M.isUndefinedOrNullOrEmpty(s.rawValueDivisor)||0===s.rawValueDivisor||""===t||null===t||(t/=s.rawValueDivisor),t=(t=this._roundRawValue(t,s)).replace(s.decimalCharacter,"."),t=this._toLocale(t,s.outputFormat,s))}},{key:"unformatAndSet",value:function(e,t){var i=1<arguments.length&&void 0!==t?t:null,n=this.unformat(e,i);return M.setElementValue(e,n),n}},{key:"localize",value:function(e,t){var i,n,a=1<arguments.length&&void 0!==t?t:null;return""===(i=M.isElement(e)?M.getElementValue(e):e)?"":(M.isNull(a)&&(a=B.defaultSettings),i=this.unformat(i,a),0===Number(i)&&a.leadingZero!==B.options.leadingZero.keep&&(i="0"),n=M.isNull(a)?a.outputFormat:B.defaultSettings.outputFormat,this._toLocale(i,n,a))}},{key:"localizeAndSet",value:function(e,t){var i=1<arguments.length&&void 0!==t?t:null,n=this.localize(e,i);return M.setElementValue(e,n),n}},{key:"isManagedByAutoNumeric",value:function(e){return this._isInGlobalList(M.domElement(e))}},{key:"getAutoNumericElement",value:function(e){var t=M.domElement(e);return this.isManagedByAutoNumeric(t)?this._getFromGlobalList(t):null}},{key:"set",value:function(e,t,i,n){var a,r=2<arguments.length&&void 0!==i?i:null,s=!(3<arguments.length&&void 0!==n)||n,o=M.domElement(e);return this.isManagedByAutoNumeric(o)?this.getAutoNumericElement(o).set(t,r,s):(a=!(!M.isNull(r)&&Object.prototype.hasOwnProperty.call(r,"showWarnings"))||r.showWarnings,M.warning("Impossible to find an AutoNumeric object for the given DOM element or selector.",a),null)}},{key:"getNumericString",value:function(e,t){var i=1<arguments.length&&void 0!==t?t:null;return this._get(e,"getNumericString",i)}},{key:"getFormatted",value:function(e,t){var i=1<arguments.length&&void 0!==t?t:null;return this._get(e,"getFormatted",i)}},{key:"getNumber",value:function(e,t){var i=1<arguments.length&&void 0!==t?t:null;return this._get(e,"getNumber",i)}},{key:"_get",value:function(e,t,i){var n=2<arguments.length&&void 0!==i?i:null,a=M.domElement(e);return this.isManagedByAutoNumeric(a)||M.throwError("Impossible to find an AutoNumeric object for the given DOM element or selector."),this.getAutoNumericElement(a)[t](n)}},{key:"getLocalized",value:function(e,t,i){var n=1<arguments.length&&void 0!==t?t:null,a=2<arguments.length&&void 0!==i?i:null,r=M.domElement(e);return this.isManagedByAutoNumeric(r)||M.throwError("Impossible to find an AutoNumeric object for the given DOM element or selector."),this.getAutoNumericElement(r).getLocalized(n,a)}},{key:"_stripAllNonNumberCharacters",value:function(e,t,i,n){return this._stripAllNonNumberCharactersExceptCustomDecimalChar(e,t,i,n).replace(t.decimalCharacter,".")}},{key:"_stripAllNonNumberCharactersExceptCustomDecimalChar",value:function(e,t,i,n){var a=(e=(e=this._normalizeCurrencySuffixAndNegativeSignCharacters(e,t)).replace(t.allowedAutoStrip,"")).match(t.numRegAutoStrip);if(e=a?[a[1],a[2],a[3]].join(""):"",t.leadingZero===B.options.leadingZero.allow||t.leadingZero===B.options.leadingZero.keep){var r="",s=S(e.split(t.decimalCharacter),2),o=s[0],l=s[1],u=o;M.contains(u,t.negativeSignCharacter)&&(r=t.negativeSignCharacter,u=u.replace(t.negativeSignCharacter,"")),""===r&&u.length>t.mIntPos&&"0"===u.charAt(0)&&(u=u.slice(1)),""!==r&&u.length>t.mIntNeg&&"0"===u.charAt(0)&&(u=u.slice(1)),e="".concat(r).concat(u).concat(M.isUndefined(l)?"":t.decimalCharacter+l)}return(i&&t.leadingZero===B.options.leadingZero.deny||!n&&t.leadingZero===B.options.leadingZero.allow)&&(e=e.replace(t.stripReg,"$1$2")),e}},{key:"_toggleNegativeBracket",value:function(e,t,i){return i?this._removeBrackets(e,t):this._addBrackets(e,t)}},{key:"_addBrackets",value:function(e,t){return M.isNull(t.negativeBracketsTypeOnBlur)?e:"".concat(t.firstBracket).concat(e.replace(t.negativeSignCharacter,"")).concat(t.lastBracket)}},{key:"_removeBrackets",value:function(e,t,i){var n,a=!(2<arguments.length&&void 0!==i)||i;return M.isNull(t.negativeBracketsTypeOnBlur)||e.charAt(0)!==t.firstBracket?e:(n=(n=e.replace(t.firstBracket,"")).replace(t.lastBracket,""),a?(n=n.replace(t.currencySymbol,""),this._mergeCurrencySignNegativePositiveSignAndValue(n,t,!0,!1)):"".concat(t.negativeSignCharacter).concat(n))}},{key:"_setBrackets",value:function(e){if(M.isNull(e.negativeBracketsTypeOnBlur))e.firstBracket="",e.lastBracket="";else{var t=S(e.negativeBracketsTypeOnBlur.split(","),2),i=t[0],n=t[1];e.firstBracket=i,e.lastBracket=n}}},{key:"_convertToNumericString",value:function(e,t){e=this._removeBrackets(e,t,!1),e=(e=this._normalizeCurrencySuffixAndNegativeSignCharacters(e,t)).replace(new RegExp("[".concat(t.digitGroupSeparator,"]"),"g"),""),"."!==t.decimalCharacter&&(e=e.replace(t.decimalCharacter,".")),M.isNegative(e)&&e.lastIndexOf("-")===e.length-1&&(e=e.replace("-",""),e="-".concat(e)),t.showPositiveSign&&(e=e.replace(t.positiveSignCharacter,""));var i=t.leadingZero!==B.options.leadingZero.keep,n=M.arabicToLatinNumbers(e,i,!1,!1);return isNaN(n)||(e=n.toString()),e}},{key:"_normalizeCurrencySuffixAndNegativeSignCharacters",value:function(e,t){return e=String(e),t.currencySymbol!==B.options.currencySymbol.none&&(e=e.replace(t.currencySymbol,"")),t.suffixText!==B.options.suffixText.none&&(e=e.replace(t.suffixText,"")),t.negativeSignCharacter!==B.options.negativeSignCharacter.hyphen&&(e=e.replace(t.negativeSignCharacter,"-")),e}},{key:"_toLocale",value:function(e,t,i){if(M.isNull(t)||t===B.options.outputFormat.string)return e;var n;switch(t){case B.options.outputFormat.number:n=Number(e);break;case B.options.outputFormat.dotNegative:n=M.isNegative(e)?e.replace("-","")+"-":e;break;case B.options.outputFormat.comma:case B.options.outputFormat.negativeComma:n=e.replace(".",",");break;case B.options.outputFormat.commaNegative:n=e.replace(".",","),n=M.isNegative(n)?n.replace("-","")+"-":n;break;case B.options.outputFormat.dot:case B.options.outputFormat.negativeDot:n=e;break;default:M.throwError("The given outputFormat [".concat(t,"] option is not recognized."))}return t!==B.options.outputFormat.number&&"-"!==i.negativeSignCharacter&&(n=n.replace("-",i.negativeSignCharacter)),n}},{key:"_modifyNegativeSignAndDecimalCharacterForFormattedValue",value:function(e,t){return"-"!==t.negativeSignCharacter&&(e=e.replace("-",t.negativeSignCharacter)),"."!==t.decimalCharacter&&(e=e.replace(".",t.decimalCharacter)),e}},{key:"_isElementValueEmptyOrOnlyTheNegativeSign",value:function(e,t){return""===e||e===t.negativeSignCharacter}},{key:"_orderValueCurrencySymbolAndSuffixText",value:function(e,t,i){var n;if(t.emptyInputBehavior===B.options.emptyInputBehavior.always||i)switch(t.negativePositiveSignPlacement){case B.options.negativePositiveSignPlacement.left:case B.options.negativePositiveSignPlacement.prefix:case B.options.negativePositiveSignPlacement.none:n=e+t.currencySymbol+t.suffixText;break;default:n=t.currencySymbol+e+t.suffixText}else n=e;return n}},{key:"_addGroupSeparators",value:function(e,t,i,n,a){var r,s=4<arguments.length&&void 0!==a?a:null;if(r=M.isNull(s)?M.isNegative(e,t.negativeSignCharacter)||M.isNegativeWithBrackets(e,t.firstBracket,t.lastBracket):s<0,e=this._stripAllNonNumberCharactersExceptCustomDecimalChar(e,t,!1,i),this._isElementValueEmptyOrOnlyTheNegativeSign(e,t))return this._orderValueCurrencySymbolAndSuffixText(e,t,!0);var o,l=M.isZeroOrHasNoValue(e);switch(r&&(e=e.replace("-","")),t.digitalGroupSpacing=t.digitalGroupSpacing.toString(),t.digitalGroupSpacing){case B.options.digitalGroupSpacing.two:o=/(\d)((\d)(\d{2}?)+)$/;break;case B.options.digitalGroupSpacing.twoScaled:o=/(\d)((?:\d{2}){0,2}\d{3}(?:(?:\d{2}){2}\d{3})*?)$/;break;case B.options.digitalGroupSpacing.four:o=/(\d)((\d{4}?)+)$/;break;case B.options.digitalGroupSpacing.three:default:o=/(\d)((\d{3}?)+)$/}var u,c=S(e.split(t.decimalCharacter),2),h=c[0],m=c[1];if(t.decimalCharacterAlternative&&M.isUndefined(m)){var g=S(e.split(t.decimalCharacterAlternative),2);h=g[0],m=g[1]}if(""!==t.digitGroupSeparator)for(;o.test(h);)h=h.replace(o,"$1".concat(t.digitGroupSeparator,"$2"));return e=0===(u=i?t.decimalPlacesShownOnFocus:t.decimalPlacesShownOnBlur)||M.isUndefined(m)?h:(m.length>u&&(m=m.substring(0,u)),"".concat(h).concat(t.decimalCharacter).concat(m)),e=B._mergeCurrencySignNegativePositiveSignAndValue(e,t,r,l),M.isNull(s)&&(s=n),null!==t.negativeBracketsTypeOnBlur&&(s<0||M.isNegativeStrict(e,t.negativeSignCharacter))&&(e=this._toggleNegativeBracket(e,t,i)),t.suffixText?"".concat(e).concat(t.suffixText):e}},{key:"_mergeCurrencySignNegativePositiveSignAndValue",value:function(e,t,i,n){var a,r="";if(i?r=t.negativeSignCharacter:t.showPositiveSign&&!n&&(r=t.positiveSignCharacter),t.currencySymbolPlacement===B.options.currencySymbolPlacement.prefix)if(t.negativePositiveSignPlacement!==B.options.negativePositiveSignPlacement.none&&(i||!i&&t.showPositiveSign&&!n))switch(t.negativePositiveSignPlacement){case B.options.negativePositiveSignPlacement.prefix:case B.options.negativePositiveSignPlacement.left:a="".concat(r).concat(t.currencySymbol).concat(e);break;case B.options.negativePositiveSignPlacement.right:a="".concat(t.currencySymbol).concat(r).concat(e);break;case B.options.negativePositiveSignPlacement.suffix:a="".concat(t.currencySymbol).concat(e).concat(r)}else a=t.currencySymbol+e;else if(t.currencySymbolPlacement===B.options.currencySymbolPlacement.suffix)if(t.negativePositiveSignPlacement!==B.options.negativePositiveSignPlacement.none&&(i||!i&&t.showPositiveSign&&!n))switch(t.negativePositiveSignPlacement){case B.options.negativePositiveSignPlacement.suffix:case B.options.negativePositiveSignPlacement.right:a="".concat(e).concat(t.currencySymbol).concat(r);break;case B.options.negativePositiveSignPlacement.left:a="".concat(e).concat(r).concat(t.currencySymbol);break;case B.options.negativePositiveSignPlacement.prefix:a="".concat(r).concat(e).concat(t.currencySymbol)}else a=e+t.currencySymbol;return a}},{key:"_truncateZeros",value:function(e,t){var i;switch(t){case 0:i=/(\.(?:\d*[1-9])?)0*$/;break;case 1:i=/(\.\d(?:\d*[1-9])?)0*$/;break;default:i=new RegExp("(\\.\\d{".concat(t,"}(?:\\d*[1-9])?)0*"))}return e=e.replace(i,"$1"),0===t&&(e=e.replace(/\.$/,"")),e}},{key:"_roundRawValue",value:function(e,t){return this._roundValue(e,t,t.decimalPlacesRawValue)}},{key:"_roundFormattedValueShownOnFocus",value:function(e,t){return this._roundValue(e,t,Number(t.decimalPlacesShownOnFocus))}},{key:"_roundFormattedValueShownOnBlur",value:function(e,t){return this._roundValue(e,t,Number(t.decimalPlacesShownOnBlur))}},{key:"_roundFormattedValueShownOnFocusOrBlur",value:function(e,t,i){return i?this._roundFormattedValueShownOnFocus(e,t):this._roundFormattedValueShownOnBlur(e,t)}},{key:"_roundValue",value:function(e,t,i){if(M.isNull(e))return e;if(e=""===e?"0":e.toString(),t.roundingMethod===B.options.roundingMethod.toNearest05||t.roundingMethod===B.options.roundingMethod.toNearest05Alt||t.roundingMethod===B.options.roundingMethod.upToNext05||t.roundingMethod===B.options.roundingMethod.downToNext05)return this._roundCloseTo05(e,t);var n,a=S(B._prepareValueForRounding(e,t),2),r=a[0],s=(e=a[1]).lastIndexOf("."),o=-1===s,l=S(e.split("."),2),u=l[0];if(!(0<l[1]||t.allowDecimalPadding!==B.options.allowDecimalPadding.never&&t.allowDecimalPadding!==B.options.allowDecimalPadding.floats))return 0===Number(e)?u:"".concat(r).concat(u);n=t.allowDecimalPadding===B.options.allowDecimalPadding.always||t.allowDecimalPadding===B.options.allowDecimalPadding.floats?i:0;var c,h=o?e.length-1:s,m=e.length-1-h,g="";if(m<=i){if(g=e,m<n){o&&(g="".concat(g).concat(t.decimalCharacter));for(var d="000000";m<n;)g+=d=d.substring(0,n-m),m+=d.length}else n<m?g=this._truncateZeros(g,n):0===m&&0===n&&(g=g.replace(/\.$/,""));return 0===Number(g)?g:"".concat(r).concat(g)}c=o?i-1:Number(i)+Number(s);var v,p=Number(e.charAt(c+1)),f=e.substring(0,c+1).split("");if(v="."===e.charAt(c)?e.charAt(c-1)%2:e.charAt(c)%2,this._shouldRoundUp(p,t,r,v))for(var y=f.length-1;0<=y;--y)if("."!==f[y]){if(f[y]=+f[y]+1,f[y]<10)break;0<y&&(f[y]="0")}return f=f.slice(0,c+1),g=this._truncateZeros(f.join(""),n),0===Number(g)?g:"".concat(r).concat(g)}},{key:"_roundCloseTo05",value:function(e,t){switch(t.roundingMethod){case B.options.roundingMethod.toNearest05:case B.options.roundingMethod.toNearest05Alt:e=(Math.round(20*e)/20).toString();break;case B.options.roundingMethod.upToNext05:e=(Math.ceil(20*e)/20).toString();break;default:e=(Math.floor(20*e)/20).toString()}return M.contains(e,".")?e.length-e.indexOf(".")<3?e+"0":e:e+".00"}},{key:"_prepareValueForRounding",value:function(e,t){var i="";return M.isNegativeStrict(e,"-")&&(i="-",e=e.replace("-","")),e.match(/^\d/)||(e="0".concat(e)),0===Number(e)&&(i=""),(0<Number(e)&&t.leadingZero!==B.options.leadingZero.keep||0<e.length&&t.leadingZero===B.options.leadingZero.allow)&&(e=e.replace(/^0*(\d)/,"$1")),[i,e]}},{key:"_shouldRoundUp",value:function(e,t,i,n){return 4<e&&t.roundingMethod===B.options.roundingMethod.halfUpSymmetric||4<e&&t.roundingMethod===B.options.roundingMethod.halfUpAsymmetric&&""===i||5<e&&t.roundingMethod===B.options.roundingMethod.halfUpAsymmetric&&"-"===i||5<e&&t.roundingMethod===B.options.roundingMethod.halfDownSymmetric||5<e&&t.roundingMethod===B.options.roundingMethod.halfDownAsymmetric&&""===i||4<e&&t.roundingMethod===B.options.roundingMethod.halfDownAsymmetric&&"-"===i||5<e&&t.roundingMethod===B.options.roundingMethod.halfEvenBankersRounding||5===e&&t.roundingMethod===B.options.roundingMethod.halfEvenBankersRounding&&1===n||0<e&&t.roundingMethod===B.options.roundingMethod.toCeilingTowardPositiveInfinity&&""===i||0<e&&t.roundingMethod===B.options.roundingMethod.toFloorTowardNegativeInfinity&&"-"===i||0<e&&t.roundingMethod===B.options.roundingMethod.upRoundAwayFromZero}},{key:"_truncateDecimalPlaces",value:function(e,t,i,n){i&&(e=this._roundFormattedValueShownOnFocus(e,t));var a=S(e.split(t.decimalCharacter),2),r=a[0],s=a[1];if(s&&s.length>n)if(0<n){var o=s.substring(0,n);e="".concat(r).concat(t.decimalCharacter).concat(o)}else e=r;return e}},{key:"_checkIfInRangeWithOverrideOption",value:function(e,t){if(M.isNull(e)&&t.emptyInputBehavior===B.options.emptyInputBehavior.null||t.overrideMinMaxLimits===B.options.overrideMinMaxLimits.ignore||t.overrideMinMaxLimits===B.options.overrideMinMaxLimits.invalid)return[!0,!0];e=(e=e.toString()).replace(",",".");var i,n=M.parseStr(t.minimumValue),a=M.parseStr(t.maximumValue),r=M.parseStr(e);switch(t.overrideMinMaxLimits){case B.options.overrideMinMaxLimits.floor:i=[-1<M.testMinMax(n,r),!0];break;case B.options.overrideMinMaxLimits.ceiling:i=[!0,M.testMinMax(a,r)<1];break;default:i=[-1<M.testMinMax(n,r),M.testMinMax(a,r)<1]}return i}},{key:"_isWithinRangeWithOverrideOption",value:function(e,t){var i=S(this._checkIfInRangeWithOverrideOption(e,t),2),n=i[0],a=i[1];return n&&a}},{key:"_cleanValueForRangeParse",value:function(e){return e=e.toString().replace(",","."),M.parseStr(e)}},{key:"_isMinimumRangeRespected",value:function(e,t){return-1<M.testMinMax(M.parseStr(t.minimumValue),this._cleanValueForRangeParse(e))}},{key:"_isMaximumRangeRespected",value:function(e,t){return M.testMinMax(M.parseStr(t.maximumValue),this._cleanValueForRangeParse(e))<1}},{key:"_readCookie",value:function(e){for(var t=e+"=",i=document.cookie.split(";"),n="",a=0;a<i.length;a+=1){for(n=i[a];" "===n.charAt(0);)n=n.substring(1,n.length);if(0===n.indexOf(t))return n.substring(t.length,n.length)}return null}},{key:"_storageTest",value:function(){var e="modernizr";try{return sessionStorage.setItem(e,e),sessionStorage.removeItem(e),!0}catch(e){return!1}}},{key:"_correctNegativePositiveSignPlacementOption",value:function(e){if(M.isNull(e.negativePositiveSignPlacement))if(M.isUndefined(e)||!M.isUndefinedOrNullOrEmpty(e.negativePositiveSignPlacement)||M.isUndefinedOrNullOrEmpty(e.currencySymbol))e.negativePositiveSignPlacement=B.options.negativePositiveSignPlacement.left;else switch(e.currencySymbolPlacement){case B.options.currencySymbolPlacement.suffix:e.negativePositiveSignPlacement=B.options.negativePositiveSignPlacement.prefix;break;case B.options.currencySymbolPlacement.prefix:e.negativePositiveSignPlacement=B.options.negativePositiveSignPlacement.left}}},{key:"_correctCaretPositionOnFocusAndSelectOnFocusOptions",value:function(e){return M.isNull(e)?null:(!M.isUndefinedOrNullOrEmpty(e.caretPositionOnFocus)&&M.isUndefinedOrNullOrEmpty(e.selectOnFocus)&&(e.selectOnFocus=B.options.selectOnFocus.doNotSelect),M.isUndefinedOrNullOrEmpty(e.caretPositionOnFocus)&&!M.isUndefinedOrNullOrEmpty(e.selectOnFocus)&&e.selectOnFocus===B.options.selectOnFocus.select&&(e.caretPositionOnFocus=B.options.caretPositionOnFocus.doNoForceCaretPosition),e)}},{key:"_calculateDecimalPlacesOnInit",value:function(e){this._validateDecimalPlacesRawValue(e),e.decimalPlacesShownOnFocus===B.options.decimalPlacesShownOnFocus.useDefault&&(e.decimalPlacesShownOnFocus=e.decimalPlaces),e.decimalPlacesShownOnBlur===B.options.decimalPlacesShownOnBlur.useDefault&&(e.decimalPlacesShownOnBlur=e.decimalPlaces),e.decimalPlacesRawValue===B.options.decimalPlacesRawValue.useDefault&&(e.decimalPlacesRawValue=e.decimalPlaces);var t=0;e.rawValueDivisor&&e.rawValueDivisor!==B.options.rawValueDivisor.none&&(t=String(e.rawValueDivisor).length-1)<0&&(t=0),e.decimalPlacesRawValue=Math.max(Math.max(e.decimalPlacesShownOnBlur,e.decimalPlacesShownOnFocus)+t,Number(e.originalDecimalPlacesRawValue)+t)}},{key:"_calculateDecimalPlacesOnUpdate",value:function(e,t){var i=1<arguments.length&&void 0!==t?t:null;this._validateDecimalPlacesRawValue(e),M.isNull(i)&&M.throwError("When updating the settings, the previous ones should be passed as an argument.");var n="decimalPlaces"in e;if(n||"decimalPlacesRawValue"in e||"decimalPlacesShownOnFocus"in e||"decimalPlacesShownOnBlur"in e||"rawValueDivisor"in e){n?("decimalPlacesShownOnFocus"in e&&e.decimalPlacesShownOnFocus!==B.options.decimalPlacesShownOnFocus.useDefault||(e.decimalPlacesShownOnFocus=e.decimalPlaces),"decimalPlacesShownOnBlur"in e&&e.decimalPlacesShownOnBlur!==B.options.decimalPlacesShownOnBlur.useDefault||(e.decimalPlacesShownOnBlur=e.decimalPlaces),"decimalPlacesRawValue"in e&&e.decimalPlacesRawValue!==B.options.decimalPlacesRawValue.useDefault||(e.decimalPlacesRawValue=e.decimalPlaces)):(M.isUndefined(e.decimalPlacesShownOnFocus)&&(e.decimalPlacesShownOnFocus=i.decimalPlacesShownOnFocus),M.isUndefined(e.decimalPlacesShownOnBlur)&&(e.decimalPlacesShownOnBlur=i.decimalPlacesShownOnBlur));var a=0;e.rawValueDivisor&&e.rawValueDivisor!==B.options.rawValueDivisor.none&&(a=String(e.rawValueDivisor).length-1)<0&&(a=0),e.decimalPlaces||e.decimalPlacesRawValue?e.decimalPlacesRawValue=Math.max(Math.max(e.decimalPlacesShownOnBlur,e.decimalPlacesShownOnFocus)+a,Number(e.decimalPlacesRawValue)+a):e.decimalPlacesRawValue=Math.max(Math.max(e.decimalPlacesShownOnBlur,e.decimalPlacesShownOnFocus)+a,Number(i.originalDecimalPlacesRawValue)+a)}}},{key:"_cachesUsualRegularExpressions",value:function(e,t){var i;i=e.negativeSignCharacter!==B.options.negativeSignCharacter.hyphen?"([-\\".concat(e.negativeSignCharacter,"]?)"):"(-?)",t.aNegRegAutoStrip=i,e.allowedAutoStrip=new RegExp("[^-0123456789\\".concat(e.decimalCharacter,"]"),"g"),e.numRegAutoStrip=new RegExp("".concat(i,"(?:\\").concat(e.decimalCharacter,"?([0-9]+\\").concat(e.decimalCharacter,"[0-9]+)|([0-9]*(?:\\").concat(e.decimalCharacter,"[0-9]*)?))")),e.stripReg=new RegExp("^".concat(t.aNegRegAutoStrip,"0*([0-9])")),e.formulaChars=new RegExp("[0-9".concat(e.decimalCharacter,"+\\-*/() ]"))}},{key:"_convertOldOptionsToNewOnes",value:function(e){var t={aSep:"digitGroupSeparator",nSep:"showOnlyNumbersOnFocus",dGroup:"digitalGroupSpacing",aDec:"decimalCharacter",altDec:"decimalCharacterAlternative",aSign:"currencySymbol",pSign:"currencySymbolPlacement",pNeg:"negativePositiveSignPlacement",aSuffix:"suffixText",oLimits:"overrideMinMaxLimits",vMax:"maximumValue",vMin:"minimumValue",mDec:"decimalPlacesOverride",eDec:"decimalPlacesShownOnFocus",scaleDecimal:"decimalPlacesShownOnBlur",aStor:"saveValueToSessionStorage",mRound:"roundingMethod",aPad:"allowDecimalPadding",nBracket:"negativeBracketsTypeOnBlur",wEmpty:"emptyInputBehavior",lZero:"leadingZero",aForm:"formatOnPageLoad",sNumber:"selectNumberOnly",anDefault:"defaultValueOverride",unSetOnSubmit:"unformatOnSubmit",outputType:"outputFormat",debug:"showWarnings",allowDecimalPadding:!0,alwaysAllowDecimalCharacter:!0,caretPositionOnFocus:!0,createLocalList:!0,currencySymbol:!0,currencySymbolPlacement:!0,decimalCharacter:!0,decimalCharacterAlternative:!0,decimalPlaces:!0,decimalPlacesRawValue:!0,decimalPlacesShownOnBlur:!0,decimalPlacesShownOnFocus:!0,defaultValueOverride:!0,digitalGroupSpacing:!0,digitGroupSeparator:!0,divisorWhenUnfocused:!0,emptyInputBehavior:!0,eventBubbles:!0,eventIsCancelable:!0,failOnUnknownOption:!0,formatOnPageLoad:!0,formulaMode:!0,historySize:!0,isCancellable:!0,leadingZero:!0,maximumValue:!0,minimumValue:!0,modifyValueOnWheel:!0,negativeBracketsTypeOnBlur:!0,negativePositiveSignPlacement:!0,negativeSignCharacter:!0,noEventListeners:!0,onInvalidPaste:!0,outputFormat:!0,overrideMinMaxLimits:!0,positiveSignCharacter:!0,rawValueDivisor:!0,readOnly:!0,roundingMethod:!0,saveValueToSessionStorage:!0,selectNumberOnly:!0,selectOnFocus:!0,serializeSpaces:!0,showOnlyNumbersOnFocus:!0,showPositiveSign:!0,showWarnings:!0,styleRules:!0,suffixText:!0,symbolWhenUnfocused:!0,unformatOnHover:!0,unformatOnSubmit:!0,valuesToStrings:!0,watchExternalChanges:!0,wheelOn:!0,wheelStep:!0,allowedAutoStrip:!0,formulaChars:!0,isNegativeSignAllowed:!0,isPositiveSignAllowed:!0,mIntNeg:!0,mIntPos:!0,numRegAutoStrip:!0,originalDecimalPlaces:!0,originalDecimalPlacesRawValue:!0,stripReg:!0};for(var i in e)if(Object.prototype.hasOwnProperty.call(e,i)){if(!0===t[i])continue;Object.prototype.hasOwnProperty.call(t,i)?(M.warning("You are using the deprecated option name '".concat(i,"'. Please use '").concat(t[i],"' instead from now on. The old option name will be dropped very soon™."),!0),e[t[i]]=e[i],delete e[i]):e.failOnUnknownOption&&M.throwError("Option name '".concat(i,"' is unknown. Please fix the options passed to autoNumeric"))}"mDec"in e&&M.warning("The old `mDec` option has been deprecated in favor of more accurate options ; `decimalPlaces`, `decimalPlacesRawValue`, `decimalPlacesShownOnFocus` and `decimalPlacesShownOnBlur`.",!0)}},{key:"_setNegativePositiveSignPermissions",value:function(e){e.isNegativeSignAllowed=e.minimumValue<0,e.isPositiveSignAllowed=0<=e.maximumValue}},{key:"_toNumericValue",value:function(e,t){var i;return M.isNumber(Number(e))?i=M.scientificToDecimal(e):(i=this._convertToNumericString(e.toString(),t),M.isNumber(Number(i))||(M.warning('The given value "'.concat(e,'" cannot be converted to a numeric one and therefore cannot be used appropriately.'),t.showWarnings),i=NaN)),i}},{key:"_checkIfInRange",value:function(e,t,i){var n=M.parseStr(e);return-1<M.testMinMax(t,n)&&M.testMinMax(i,n)<1}},{key:"_shouldSkipEventKey",value:function(e){var t=M.isInArray(e,d.keyName._allFnKeys),i=e===d.keyName.OSLeft||e===d.keyName.OSRight,n=e===d.keyName.ContextMenu,a=M.isInArray(e,d.keyName._someNonPrintableKeys),r=e===d.keyName.NumLock||e===d.keyName.ScrollLock||e===d.keyName.Insert||e===d.keyName.Command,s=e===d.keyName.Unidentified;return t||i||n||a||s||r}},{key:"_serialize",value:function(e,t,i,n,a){var r,s=this,o=1<arguments.length&&void 0!==t&&t,l=2<arguments.length&&void 0!==i?i:"unformatted",u=3<arguments.length&&void 0!==n?n:"+",c=4<arguments.length&&void 0!==a?a:null,h=[];return"object"===w(e)&&"form"===e.nodeName.toLowerCase()&&Array.prototype.slice.call(e.elements).forEach(function(t){if(t.name&&!t.disabled&&-1===["file","reset","submit","button"].indexOf(t.type))if("select-multiple"===t.type)Array.prototype.slice.call(t.options).forEach(function(e){e.selected&&(o?h.push({name:t.name,value:e.value}):h.push("".concat(encodeURIComponent(t.name),"=").concat(encodeURIComponent(e.value))))});else if(-1===["checkbox","radio"].indexOf(t.type)||t.checked){var e,i;if(s.isManagedByAutoNumeric(t))switch(l){case"unformatted":i=s.getAutoNumericElement(t),M.isNull(i)||(e=s.unformat(t,i.getSettings()));break;case"localized":if(i=s.getAutoNumericElement(t),!M.isNull(i)){var n=M.cloneObject(i.getSettings());M.isNull(c)||(n.outputFormat=c),e=s.localize(t,n)}break;case"formatted":default:e=t.value}else e=t.value;M.isUndefined(e)&&M.throwError("This error should never be hit. If it has, something really wrong happened!"),o?h.push({name:t.name,value:e}):h.push("".concat(encodeURIComponent(t.name),"=").concat(encodeURIComponent(e)))}}),o?r=h:(r=h.join("&"),"+"===u&&(r=r.replace(/%20/g,"+"))),r}},{key:"_serializeNumericString",value:function(e,t){var i=1<arguments.length&&void 0!==t?t:"+";return this._serialize(e,!1,"unformatted",i)}},{key:"_serializeFormatted",value:function(e,t){var i=1<arguments.length&&void 0!==t?t:"+";return this._serialize(e,!1,"formatted",i)}},{key:"_serializeLocalized",value:function(e,t,i){var n=1<arguments.length&&void 0!==t?t:"+",a=2<arguments.length&&void 0!==i?i:null;return this._serialize(e,!1,"localized",n,a)}},{key:"_serializeNumericStringArray",value:function(e,t){var i=1<arguments.length&&void 0!==t?t:"+";return this._serialize(e,!0,"unformatted",i)}},{key:"_serializeFormattedArray",value:function(e,t){var i=1<arguments.length&&void 0!==t?t:"+";return this._serialize(e,!0,"formatted",i)}},{key:"_serializeLocalizedArray",value:function(e,t,i){var n=1<arguments.length&&void 0!==t?t:"+",a=2<arguments.length&&void 0!==i?i:null;return this._serialize(e,!0,"localized",n,a)}}],P((e=B).prototype,[{key:"_saveInitialValues",value:function(e){this.initialValueHtmlAttribute=M.scientificToDecimal(this.domElement.getAttribute("value")),M.isNull(this.initialValueHtmlAttribute)&&(this.initialValueHtmlAttribute=""),this.initialValue=e,M.isNull(this.initialValue)&&(this.initialValue="")}},{key:"_createEventListeners",value:function(){var t=this;this.formulaMode=!1,this._onFocusInFunc=function(e){t._onFocusIn(e)},this._onFocusInAndMouseEnterFunc=function(e){t._onFocusInAndMouseEnter(e)},this._onFocusFunc=function(){t._onFocus()},this._onKeydownFunc=function(e){t._onKeydown(e)},this._onKeypressFunc=function(e){t._onKeypress(e)},this._onKeyupFunc=function(e){t._onKeyup(e)},this._onFocusOutAndMouseLeaveFunc=function(e){t._onFocusOutAndMouseLeave(e)},this._onPasteFunc=function(e){t._onPaste(e)},this._onWheelFunc=function(e){t._onWheel(e)},this._onDropFunc=function(e){t._onDrop(e)},this._onKeydownGlobalFunc=function(e){t._onKeydownGlobal(e)},this._onKeyupGlobalFunc=function(e){t._onKeyupGlobal(e)},this.domElement.addEventListener("focusin",this._onFocusInFunc,!1),this.domElement.addEventListener("focus",this._onFocusInAndMouseEnterFunc,!1),this.domElement.addEventListener("focus",this._onFocusFunc,!1),this.domElement.addEventListener("mouseenter",this._onFocusInAndMouseEnterFunc,!1),this.domElement.addEventListener("keydown",this._onKeydownFunc,!1),this.domElement.addEventListener("keypress",this._onKeypressFunc,!1),this.domElement.addEventListener("keyup",this._onKeyupFunc,!1),this.domElement.addEventListener("blur",this._onFocusOutAndMouseLeaveFunc,!1),this.domElement.addEventListener("mouseleave",this._onFocusOutAndMouseLeaveFunc,!1),this.domElement.addEventListener("paste",this._onPasteFunc,!1),this.domElement.addEventListener("wheel",this._onWheelFunc,!1),this.domElement.addEventListener("drop",this._onDropFunc,!1),this._setupFormListener(),this.hasEventListeners=!0,B._doesGlobalListExists()||(document.addEventListener("keydown",this._onKeydownGlobalFunc,!1),document.addEventListener("keyup",this._onKeyupGlobalFunc,!1))}},{key:"_removeEventListeners",value:function(){this.domElement.removeEventListener("focusin",this._onFocusInFunc,!1),this.domElement.removeEventListener("focus",this._onFocusInAndMouseEnterFunc,!1),this.domElement.removeEventListener("focus",this._onFocusFunc,!1),this.domElement.removeEventListener("mouseenter",this._onFocusInAndMouseEnterFunc,!1),this.domElement.removeEventListener("blur",this._onFocusOutAndMouseLeaveFunc,!1),this.domElement.removeEventListener("mouseleave",this._onFocusOutAndMouseLeaveFunc,!1),this.domElement.removeEventListener("keydown",this._onKeydownFunc,!1),this.domElement.removeEventListener("keypress",this._onKeypressFunc,!1),this.domElement.removeEventListener("keyup",this._onKeyupFunc,!1),this.domElement.removeEventListener("paste",this._onPasteFunc,!1),this.domElement.removeEventListener("wheel",this._onWheelFunc,!1),this.domElement.removeEventListener("drop",this._onDropFunc,!1),this._removeFormListener(),this.hasEventListeners=!1,document.removeEventListener("keydown",this._onKeydownGlobalFunc,!1),document.removeEventListener("keyup",this._onKeyupGlobalFunc,!1)}},{key:"_updateEventListeners",value:function(){this.settings.noEventListeners||this.hasEventListeners||this._createEventListeners(),this.settings.noEventListeners&&this.hasEventListeners&&this._removeEventListeners()}},{key:"_setupFormListener",value:function(){var e=this;M.isNull(this.parentForm)||(this._onFormSubmitFunc=function(){e._onFormSubmit()},this._onFormResetFunc=function(){e._onFormReset()},this._hasParentFormCounter()?this._incrementParentFormCounter():(this._initializeFormCounterToOne(),this.parentForm.addEventListener("submit",this._onFormSubmitFunc,!1),this.parentForm.addEventListener("reset",this._onFormResetFunc,!1),this._storeFormHandlerFunction()))}},{key:"_removeFormListener",value:function(){if(!M.isNull(this.parentForm)){var e=this._getParentFormCounter();1===e?(this.parentForm.removeEventListener("submit",this._getFormHandlerFunction().submitFn,!1),this.parentForm.removeEventListener("reset",this._getFormHandlerFunction().resetFn,!1),this._removeFormDataSetInfo()):1<e?this._decrementParentFormCounter():M.throwError("The AutoNumeric object count on the form is incoherent.")}}},{key:"_hasParentFormCounter",value:function(){return"anCount"in this.parentForm.dataset}},{key:"_getParentFormCounter",value:function(){return Number(this.parentForm.dataset.anCount)}},{key:"_initializeFormCounterToOne",value:function(e){var t=0<arguments.length&&void 0!==e?e:null;this._getFormElement(t).dataset.anCount=1}},{key:"_incrementParentFormCounter",value:function(e){var t=0<arguments.length&&void 0!==e?e:null;this._getFormElement(t).dataset.anCount++}},{key:"_decrementParentFormCounter",value:function(){this.parentForm.dataset.anCount--}},{key:"_hasFormHandlerFunction",value:function(e){var t=0<arguments.length&&void 0!==e?e:null;return"anFormHandler"in this._getFormElement(t).dataset}},{key:"_getFormElement",value:function(e){var t=0<arguments.length&&void 0!==e?e:null;return M.isNull(t)?this.parentForm:t}},{key:"_storeFormHandlerFunction",value:function(e){var t=0<arguments.length&&void 0!==e?e:null;this.constructor._doesFormHandlerListExists()||this.constructor._createFormHandlerList();var i=M.randomString();this._getFormElement(t).dataset.anFormHandler=i,window.aNFormHandlerMap.set(i,{submitFn:this._onFormSubmitFunc,resetFn:this._onFormResetFunc})}},{key:"_getFormHandlerKey",value:function(){this._hasFormHandlerFunction()||M.throwError("Unable to retrieve the form handler name");var e=this.parentForm.dataset.anFormHandler;return""===e&&M.throwError("The form handler name is invalid"),e}},{key:"_getFormHandlerFunction",value:function(){var e=this._getFormHandlerKey();return window.aNFormHandlerMap.get(e)}},{key:"_removeFormDataSetInfo",value:function(){this._decrementParentFormCounter(),window.aNFormHandlerMap.delete(this._getFormHandlerKey()),this.parentForm.removeAttribute("data-an-count"),this.parentForm.removeAttribute("data-an-form-handler")}},{key:"_setWritePermissions",value:function(e){0<arguments.length&&void 0!==e&&e&&this.domElement.readOnly||this.settings.readOnly?this._setReadOnly():this._setReadWrite()}},{key:"_setReadOnly",value:function(){this.isInputElement?this.domElement.readOnly=!0:this.domElement.setAttribute("contenteditable",!1)}},{key:"_setReadWrite",value:function(){this.isInputElement?this.domElement.readOnly=!1:this.domElement.setAttribute("contenteditable",!0)}},{key:"_addWatcher",value:function(){var t=this;if(!M.isUndefined(this.getterSetter)){var e=this.getterSetter,i=e.set,n=e.get;Object.defineProperty(this.domElement,this.attributeToWatch,{configurable:!0,get:function(){return n.call(t.domElement)},set:function(e){i.call(t.domElement,e),t.settings.watchExternalChanges&&!t.internalModification&&t.set(e)}})}}},{key:"_removeWatcher",value:function(){var t=this;if(!M.isUndefined(this.getterSetter)){var e=this.getterSetter,i=e.set,n=e.get;Object.defineProperty(this.domElement,this.attributeToWatch,{configurable:!0,get:function(){return n.call(t.domElement)},set:function(e){i.call(t.domElement,e)}})}}},{key:"_getAttributeToWatch",value:function(){var e;if(this.isInputElement)e="value";else{var t=this.domElement.nodeType;t===Node.ELEMENT_NODE||t===Node.DOCUMENT_NODE||t===Node.DOCUMENT_FRAGMENT_NODE?e="textContent":t===Node.TEXT_NODE&&(e="nodeValue")}return e}},{key:"_historyTableAdd",value:function(){var e=0===this.historyTable.length;if(e||this.rawValue!==this._historyTableCurrentValueUsed()){var t=!0;if(!e){var i=this.historyTableIndex+1;i<this.historyTable.length&&this.rawValue===this.historyTable[i].value?t=!1:M.arrayTrim(this.historyTable,this.historyTableIndex+1)}if(this.historyTableIndex++,t){var n=M.getElementSelection(this.domElement);this.selectionStart=n.start,this.selectionEnd=n.end,this.historyTable.push({value:this.rawValue,start:this.selectionStart+1,end:this.selectionEnd+1}),1<this.historyTable.length&&(this.historyTable[this.historyTableIndex-1].start=this.selectionStart,this.historyTable[this.historyTableIndex-1].end=this.selectionEnd)}this.historyTable.length>this.settings.historySize&&this._historyTableForget()}}},{key:"_historyTableUndoOrRedo",value:function(e){var t;if(0<arguments.length&&void 0!==e&&!e?(t=this.historyTableIndex+1<this.historyTable.length)&&this.historyTableIndex++:(t=0<this.historyTableIndex)&&this.historyTableIndex--,t){var i=this.historyTable[this.historyTableIndex];this.set(i.value,null,!1),M.setElementSelection(this.domElement,i.start,i.end)}}},{key:"_historyTableUndo",value:function(){this._historyTableUndoOrRedo(!0)}},{key:"_historyTableRedo",value:function(){this._historyTableUndoOrRedo(!1)}},{key:"_historyTableForget",value:function(e){for(var t=0<arguments.length&&void 0!==e?e:1,i=[],n=0;n<t;n++)i.push(this.historyTable.shift()),this.historyTableIndex--,this.historyTableIndex<0&&(this.historyTableIndex=0);return 1===i.length?i[0]:i}},{key:"_historyTableCurrentValueUsed",value:function(){var e=this.historyTableIndex;return e<0&&(e=0),M.isUndefinedOrNullOrEmpty(this.historyTable[e])?"":this.historyTable[e].value}},{key:"_parseStyleRules",value:function(){var n=this;M.isUndefinedOrNullOrEmpty(this.settings.styleRules)||""===this.rawValue||(M.isUndefinedOrNullOrEmpty(this.settings.styleRules.positive)||(0<=this.rawValue?this._addCSSClass(this.settings.styleRules.positive):this._removeCSSClass(this.settings.styleRules.positive)),M.isUndefinedOrNullOrEmpty(this.settings.styleRules.negative)||(this.rawValue<0?this._addCSSClass(this.settings.styleRules.negative):this._removeCSSClass(this.settings.styleRules.negative)),M.isUndefinedOrNullOrEmpty(this.settings.styleRules.ranges)||0===this.settings.styleRules.ranges.length||this.settings.styleRules.ranges.forEach(function(e){n.rawValue>=e.min&&n.rawValue<e.max?n._addCSSClass(e.class):n._removeCSSClass(e.class)}),M.isUndefinedOrNullOrEmpty(this.settings.styleRules.userDefined)||0===this.settings.styleRules.userDefined.length||this.settings.styleRules.userDefined.forEach(function(e){if(M.isFunction(e.callback))if(M.isString(e.classes))e.callback(n.rawValue)?n._addCSSClass(e.classes):n._removeCSSClass(e.classes);else if(M.isArray(e.classes))if(2===e.classes.length)e.callback(n.rawValue)?(n._addCSSClass(e.classes[0]),n._removeCSSClass(e.classes[1])):(n._removeCSSClass(e.classes[0]),n._addCSSClass(e.classes[1]));else if(2<e.classes.length){var i=e.callback(n.rawValue);M.isArray(i)?e.classes.forEach(function(e,t){M.isInArray(t,i)?n._addCSSClass(e):n._removeCSSClass(e)}):M.isInt(i)?e.classes.forEach(function(e,t){t===i?n._addCSSClass(e):n._removeCSSClass(e)}):M.isNull(i)?e.classes.forEach(function(e){n._removeCSSClass(e)}):M.throwError("The callback result is not an array nor a valid array index, ".concat(w(i)," given."))}else M.throwError("The classes attribute is not valid for the `styleRules` option.");else M.isUndefinedOrNullOrEmpty(e.classes)?e.callback(n):M.throwError("The callback/classes structure is not valid for the `styleRules` option.");else M.warning("The given `styleRules` callback is not a function, ".concat("undefined"==typeof callback?"undefined":w(callback)," given."),n.settings.showWarnings)}))}},{key:"_addCSSClass",value:function(e){this.domElement.classList.add(e)}},{key:"_removeCSSClass",value:function(e){this.domElement.classList.remove(e)}},{key:"update",value:function(){for(var t=this,e=arguments.length,i=new Array(e),n=0;n<e;n++)i[n]=arguments[n];Array.isArray(i)&&Array.isArray(i[0])&&(i=i[0]);var a=M.cloneObject(this.settings),r=this.rawValue,s={};M.isUndefinedOrNullOrEmpty(i)||0===i.length?s=null:1<=i.length&&i.forEach(function(e){t.constructor._isPreDefinedOptionValid(e)&&(e=t.constructor._getOptionObject(e)),b(s,e)});try{this._setSettings(s,!0),this._setWritePermissions(),this._updateEventListeners(),this.set(r)}catch(e){return this._setSettings(a,!0),M.throwError("Unable to update the settings, those are invalid: [".concat(e,"]")),this}return this}},{key:"getSettings",value:function(){return this.settings}},{key:"set",value:function(e,t,i){var n,a=1<arguments.length&&void 0!==t?t:null,r=!(2<arguments.length&&void 0!==i)||i;if(M.isUndefined(e))return M.warning("You are trying to set an 'undefined' value ; an error could have occurred.",this.settings.showWarnings),this;if(M.isNull(a)||this._setSettings(a,!0),null===e&&this.settings.emptyInputBehavior!==B.options.emptyInputBehavior.null)return M.warning("You are trying to set the `null` value while the `emptyInputBehavior` option is set to ".concat(this.settings.emptyInputBehavior,". If you want to be able to set the `null` value, you need to change the 'emptyInputBehavior' option to `'null'`."),this.settings.showWarnings),this;if(null===e)return this._setElementAndRawValue(null,null,r),this._saveValueToPersistentStorage(),this;if(n=this.constructor._toNumericValue(e,this.settings),isNaN(Number(n)))return M.warning("The value you are trying to set results in `NaN`. The element value is set to the empty string instead.",this.settings.showWarnings),this.setValue("",r),this;if(""===n)switch(this.settings.emptyInputBehavior){case B.options.emptyInputBehavior.zero:n=0;break;case B.options.emptyInputBehavior.min:n=this.settings.minimumValue;break;case B.options.emptyInputBehavior.max:n=this.settings.maximumValue;break;default:M.isNumber(this.settings.emptyInputBehavior)&&(n=Number(this.settings.emptyInputBehavior))}if(""===n)return s=this.settings.emptyInputBehavior===B.options.emptyInputBehavior.always?this.settings.currencySymbol:"",this._setElementAndRawValue(s,"",r),this;var s,o=S(this.constructor._checkIfInRangeWithOverrideOption(n,this.settings),2),l=o[0],u=o[1];if(l&&u&&this.settings.valuesToStrings&&this._checkValuesToStrings(n))return this._setElementAndRawValue(this.settings.valuesToStrings[n],n,r),this._saveValueToPersistentStorage(),this;if(M.isZeroOrHasNoValue(n)&&(n="0"),l&&u){var c=this.constructor._roundRawValue(n,this.settings);return c=this._trimLeadingAndTrailingZeros(c.replace(this.settings.decimalCharacter,".")),n=this._getRawValueToFormat(n),n=this.isFocused?this.constructor._roundFormattedValueShownOnFocus(n,this.settings):(this.settings.divisorWhenUnfocused&&(n=(n/=this.settings.divisorWhenUnfocused).toString()),this.constructor._roundFormattedValueShownOnBlur(n,this.settings)),n=this.constructor._modifyNegativeSignAndDecimalCharacterForFormattedValue(n,this.settings),n=this.constructor._addGroupSeparators(n,this.settings,this.isFocused,this.rawValue,c),!this.isFocused&&this.settings.symbolWhenUnfocused&&(n="".concat(n).concat(this.settings.symbolWhenUnfocused)),(this.settings.decimalPlacesShownOnFocus||this.settings.divisorWhenUnfocused)&&this._saveValueToPersistentStorage(),this._setElementAndRawValue(n,c,r),this._setValidOrInvalidState(c),this}return this._triggerRangeEvents(l,u),M.throwError("The value [".concat(n,"] being set falls outside of the minimumValue [").concat(this.settings.minimumValue,"] and maximumValue [").concat(this.settings.maximumValue,"] range set for this element")),this._removeValueFromPersistentStorage(),this.setValue("",r),this}},{key:"setUnformatted",value:function(e,t){var i=1<arguments.length&&void 0!==t?t:null;if(null===e||M.isUndefined(e))return this;M.isNull(i)||this._setSettings(i,!0);var n=this.constructor._removeBrackets(e,this.settings),a=this.constructor._stripAllNonNumberCharacters(n,this.settings,!0,this.isFocused);return M.isNumber(a)||M.throwError("The value is not a valid one, it's not a numeric string nor a recognized currency."),this.constructor._isWithinRangeWithOverrideOption(a,this.settings)?this.setValue(e):M.throwError("The value is out of the range limits [".concat(this.settings.minimumValue,", ").concat(this.settings.maximumValue,"].")),this}},{key:"setValue",value:function(e,t){var i=!(1<arguments.length&&void 0!==t)||t;return this._setElementAndRawValue(e,i),this}},{key:"_setRawValue",value:function(e,t){var i=!(1<arguments.length&&void 0!==t)||t;if(this.rawValue!==e){var n=this.rawValue;this.rawValue=e,!M.isNull(this.settings.rawValueDivisor)&&0!==this.settings.rawValueDivisor&&""!==e&&null!==e&&this._isUserManuallyEditingTheValue()&&(this.rawValue/=this.settings.rawValueDivisor),this._triggerEvent(B.events.rawValueModified,this.domElement,{oldRawValue:n,newRawValue:this.rawValue,isPristine:this.isPristine(!0),error:null,aNElement:this}),this._parseStyleRules(),i&&this._historyTableAdd()}}},{key:"_setElementValue",value:function(e,t){var i=!(1<arguments.length&&void 0!==t)||t,n=M.getElementValue(this.domElement);return e!==n&&(this.internalModification=!0,M.setElementValue(this.domElement,e),this.internalModification=!1,i&&this._triggerEvent(B.events.formatted,this.domElement,{oldValue:n,newValue:e,oldRawValue:this.rawValue,newRawValue:this.rawValue,isPristine:this.isPristine(!1),error:null,aNElement:this})),this}},{key:"_setElementAndRawValue",value:function(e,t,i){var n=1<arguments.length&&void 0!==t?t:null,a=!(2<arguments.length&&void 0!==i)||i;return M.isNull(n)?n=e:M.isBoolean(n)&&(a=n,n=e),this._setElementValue(e),this._setRawValue(n,a),this}},{key:"_getRawValueToFormat",value:function(e){return M.isNull(this.settings.rawValueDivisor)||0===this.settings.rawValueDivisor||""===e||null===e?e:e*this.settings.rawValueDivisor}},{key:"_checkValuesToStrings",value:function(e){return this.constructor._checkValuesToStringsArray(e,this.valuesToStringsKeys)}},{key:"_isUserManuallyEditingTheValue",value:function(){return this.isFocused&&this.isEditing||this.isDropEvent}},{key:"_executeCallback",value:function(e,t){!M.isNull(t)&&M.isFunction(t)&&t(e,this)}},{key:"_triggerEvent",value:function(e,t,i){var n=1<arguments.length&&void 0!==t?t:document,a=2<arguments.length&&void 0!==i?i:null;M.triggerEvent(e,n,a,this.settings.eventBubbles,this.settings.eventIsCancelable)}},{key:"get",value:function(e){var t=0<arguments.length&&void 0!==e?e:null;return this.getNumericString(t)}},{key:"getNumericString",value:function(e){var t,i=0<arguments.length&&void 0!==e?e:null;return t=M.isNull(this.rawValue)?null:M.trimPaddedZerosFromDecimalPlaces(this.rawValue),this._executeCallback(t,i),t}},{key:"getFormatted",value:function(e){var t=0<arguments.length&&void 0!==e?e:null;"value"in this.domElement||"textContent"in this.domElement||M.throwError("Unable to get the formatted string from the element.");var i=M.getElementValue(this.domElement);return this._executeCallback(i,t),i}},{key:"getNumber",value:function(e){var t,i=0<arguments.length&&void 0!==e?e:null;return t=null===this.rawValue?null:this.constructor._toLocale(this.getNumericString(),"number",this.settings),this._executeCallback(t,i),t}},{key:"getLocalized",value:function(e,t){var i,n,a=0<arguments.length&&void 0!==e?e:null,r=1<arguments.length&&void 0!==t?t:null;M.isFunction(a)&&M.isNull(r)&&(r=a,a=null),(i=M.isEmptyString(this.rawValue)?"":""+Number(this.rawValue))&&0===Number(i)&&this.settings.leadingZero!==B.options.leadingZero.keep&&(i="0"),n=M.isNull(a)?this.settings.outputFormat:a;var s=this.constructor._toLocale(i,n,this.settings);return this._executeCallback(s,r),s}},{key:"reformat",value:function(){return this.set(this.rawValue),this}},{key:"unformat",value:function(){return this._setElementValue(this.getNumericString()),this}},{key:"unformatLocalized",value:function(e){var t=0<arguments.length&&void 0!==e?e:null;return this._setElementValue(this.getLocalized(t)),this}},{key:"isPristine",value:function(e){return 0<arguments.length&&void 0!==e&&!e?this.initialValueHtmlAttribute===this.getFormatted():this.initialValue===this.getNumericString()}},{key:"select",value:function(){return this.settings.selectNumberOnly?this.selectNumber():this._defaultSelectAll(),this}},{key:"_defaultSelectAll",value:function(){M.setElementSelection(this.domElement,0,M.getElementValue(this.domElement).length)}},{key:"selectNumber",value:function(){var e,t,i=M.getElementValue(this.domElement),n=i.length,a=this.settings.currencySymbol.length,r=this.settings.currencySymbolPlacement,s=M.isNegative(i,this.settings.negativeSignCharacter)?1:0,o=this.settings.suffixText.length;if(e=r===B.options.currencySymbolPlacement.suffix?0:this.settings.negativePositiveSignPlacement===B.options.negativePositiveSignPlacement.left&&1==s&&0<a?a+1:a,r===B.options.currencySymbolPlacement.prefix)t=n-o;else switch(this.settings.negativePositiveSignPlacement){case B.options.negativePositiveSignPlacement.left:t=n-(o+a);break;case B.options.negativePositiveSignPlacement.right:t=0<a?n-(a+s+o):n-(a+o);break;default:t=n-(a+o)}return M.setElementSelection(this.domElement,e,t),this}},{key:"selectInteger",value:function(){var e=0,t=0<=this.rawValue;this.settings.currencySymbolPlacement!==B.options.currencySymbolPlacement.prefix&&(this.settings.currencySymbolPlacement!==B.options.currencySymbolPlacement.suffix||this.settings.negativePositiveSignPlacement!==B.options.negativePositiveSignPlacement.prefix&&this.settings.negativePositiveSignPlacement!==B.options.negativePositiveSignPlacement.none)||(this.settings.showPositiveSign&&t||!t&&this.settings.currencySymbolPlacement===B.options.currencySymbolPlacement.prefix&&this.settings.negativePositiveSignPlacement===B.options.negativePositiveSignPlacement.left)&&(e+=1),this.settings.currencySymbolPlacement===B.options.currencySymbolPlacement.prefix&&(e+=this.settings.currencySymbol.length);var i=M.getElementValue(this.domElement),n=i.indexOf(this.settings.decimalCharacter);return-1===n&&(n=this.settings.currencySymbolPlacement===B.options.currencySymbolPlacement.suffix?i.length-this.settings.currencySymbol.length:i.length,t||this.settings.negativePositiveSignPlacement!==B.options.negativePositiveSignPlacement.suffix&&this.settings.currencySymbolPlacement!==B.options.currencySymbolPlacement.suffix||--n,n-=this.settings.suffixText.length),M.setElementSelection(this.domElement,e,n),this}},{key:"selectDecimal",value:function(){var e,t,i=M.getElementValue(this.domElement).indexOf(this.settings.decimalCharacter);return e=-1===i?i=0:(i+=1,t=this.isFocused?this.settings.decimalPlacesShownOnFocus:this.settings.decimalPlacesShownOnBlur,i+Number(t)),M.setElementSelection(this.domElement,i,e),this}},{key:"node",value:function(){return this.domElement}},{key:"parent",value:function(){return this.domElement.parentNode}},{key:"detach",value:function(e){var t,i=0<arguments.length&&void 0!==e?e:null;return t=M.isNull(i)?this.domElement:i.node(),this._removeFromLocalList(t),this}},{key:"attach",value:function(e,t){var i=!(1<arguments.length&&void 0!==t)||t;return this._addToLocalList(e.node()),i&&e.update(this.settings),this}},{key:"formatOther",value:function(e,t){var i=1<arguments.length&&void 0!==t?t:null;return this._formatOrUnformatOther(!0,e,i)}},{key:"unformatOther",value:function(e,t){var i=1<arguments.length&&void 0!==t?t:null;return this._formatOrUnformatOther(!1,e,i)}},{key:"_formatOrUnformatOther",value:function(e,t,i){var n,a,r=2<arguments.length&&void 0!==i?i:null;if(n=M.isNull(r)?this.settings:this._cloneAndMergeSettings(r),M.isElement(t)){var s=M.getElementValue(t);return a=e?B.format(s,n):B.unformat(s,n),M.setElementValue(t,a),null}return e?B.format(t,n):B.unformat(t,n)}},{key:"init",value:function(e,t){var n=this,a=!(1<arguments.length&&void 0!==t)||t,i=!1,r=[];if(M.isString(e)?r=p(document.querySelectorAll(e)):M.isElement(e)?(r.push(e),i=!0):M.isArray(e)?r=e:M.throwError("The given parameters to the 'init' function are invalid."),0===r.length)return M.warning("No valid DOM elements were given hence no AutoNumeric object were instantiated.",!0),[];var s=this._getLocalList(),o=[];return r.forEach(function(e){var t=n.settings.createLocalList;a&&(n.settings.createLocalList=!1);var i=new B(e,M.getElementValue(e),n.settings);a&&(i._setLocalList(s),n._addToLocalList(e,i),n.settings.createLocalList=t),o.push(i)}),i?o[0]:o}},{key:"clear",value:function(e){if(0<arguments.length&&void 0!==e&&e){var t={emptyInputBehavior:B.options.emptyInputBehavior.focus};this.set("",t)}else this.set("");return this}},{key:"remove",value:function(){this._removeValueFromPersistentStorage(),this._removeEventListeners(),this._removeWatcher(),this._removeFromLocalList(this.domElement),this.constructor._removeFromGlobalList(this)}},{key:"wipe",value:function(){this._setElementValue("",!1),this.remove()}},{key:"nuke",value:function(){this.remove(),this.domElement.parentNode.removeChild(this.domElement)}},{key:"form",value:function(e){if(0<arguments.length&&void 0!==e&&e||M.isUndefinedOrNullOrEmpty(this.parentForm)){var t=this._getParentForm();if(!M.isNull(t)&&t!==this.parentForm){var i=this._getFormAutoNumericChildren(this.parentForm);this.parentForm.dataset.anCount=i.length,this._hasFormHandlerFunction(t)?this._incrementParentFormCounter(t):(this._storeFormHandlerFunction(t),this._initializeFormCounterToOne(t))}this.parentForm=t}return this.parentForm}},{key:"_getFormAutoNumericChildren",value:function(e){var t=this;return p(e.querySelectorAll("input")).filter(function(e){return t.constructor.isManagedByAutoNumeric(e)})}},{key:"_getParentForm",value:function(){if("body"===this.domElement.tagName.toLowerCase())return null;var e,t=this.domElement;do{if(t=t.parentNode,M.isNull(t))return null;if("body"===(e=t.tagName?t.tagName.toLowerCase():""))break}while("form"!==e);return"form"===e?t:null}},{key:"formNumericString",value:function(){return this.constructor._serializeNumericString(this.form(),this.settings.serializeSpaces)}},{key:"formFormatted",value:function(){return this.constructor._serializeFormatted(this.form(),this.settings.serializeSpaces)}},{key:"formLocalized",value:function(e){var t,i=0<arguments.length&&void 0!==e?e:null;return t=M.isNull(i)?this.settings.outputFormat:i,this.constructor._serializeLocalized(this.form(),this.settings.serializeSpaces,t)}},{key:"formArrayNumericString",value:function(){return this.constructor._serializeNumericStringArray(this.form(),this.settings.serializeSpaces)}},{key:"formArrayFormatted",value:function(){return this.constructor._serializeFormattedArray(this.form(),this.settings.serializeSpaces)}},{key:"formArrayLocalized",value:function(e){var t,i=0<arguments.length&&void 0!==e?e:null;return t=M.isNull(i)?this.settings.outputFormat:i,this.constructor._serializeLocalizedArray(this.form(),this.settings.serializeSpaces,t)}},{key:"formJsonNumericString",value:function(){return JSON.stringify(this.formArrayNumericString())}},{key:"formJsonFormatted",value:function(){return JSON.stringify(this.formArrayFormatted())}},{key:"formJsonLocalized",value:function(e){var t=0<arguments.length&&void 0!==e?e:null;return JSON.stringify(this.formArrayLocalized(t))}},{key:"formUnformat",value:function(){return this.constructor._getChildANInputElement(this.form()).forEach(function(e){B.getAutoNumericElement(e).unformat()}),this}},{key:"formUnformatLocalized",value:function(){return this.constructor._getChildANInputElement(this.form()).forEach(function(e){B.getAutoNumericElement(e).unformatLocalized()}),this}},{key:"formReformat",value:function(){return this.constructor._getChildANInputElement(this.form()).forEach(function(e){B.getAutoNumericElement(e).reformat()}),this}},{key:"formSubmitNumericString",value:function(e){var t=0<arguments.length&&void 0!==e?e:null;return M.isNull(t)?(this.formUnformat(),this.form().submit(),this.formReformat()):M.isFunction(t)?t(this.formNumericString()):M.throwError("The given callback is not a function."),this}},{key:"formSubmitFormatted",value:function(e){var t=0<arguments.length&&void 0!==e?e:null;return M.isNull(t)?this.form().submit():M.isFunction(t)?t(this.formFormatted()):M.throwError("The given callback is not a function."),this}},{key:"formSubmitLocalized",value:function(e,t){var i=0<arguments.length&&void 0!==e?e:null,n=1<arguments.length&&void 0!==t?t:null;return M.isNull(n)?(this.formUnformatLocalized(),this.form().submit(),this.formReformat()):M.isFunction(n)?n(this.formLocalized(i)):M.throwError("The given callback is not a function."),this}},{key:"formSubmitArrayNumericString",value:function(e){return M.isFunction(e)?e(this.formArrayNumericString()):M.throwError("The given callback is not a function."),this}},{key:"formSubmitArrayFormatted",value:function(e){return M.isFunction(e)?e(this.formArrayFormatted()):M.throwError("The given callback is not a function."),this}},{key:"formSubmitArrayLocalized",value:function(e,t){var i=1<arguments.length&&void 0!==t?t:null;return M.isFunction(e)?e(this.formArrayLocalized(i)):M.throwError("The given callback is not a function."),this}},{key:"formSubmitJsonNumericString",value:function(e){return M.isFunction(e)?e(this.formJsonNumericString()):M.throwError("The given callback is not a function."),this}},{key:"formSubmitJsonFormatted",value:function(e){return M.isFunction(e)?e(this.formJsonFormatted()):M.throwError("The given callback is not a function."),this}},{key:"formSubmitJsonLocalized",value:function(e,t){var i=1<arguments.length&&void 0!==t?t:null;return M.isFunction(e)?e(this.formJsonLocalized(i)):M.throwError("The given callback is not a function."),this}},{key:"_createLocalList",value:function(){this.autoNumericLocalList=new Map,this._addToLocalList(this.domElement)}},{key:"_deleteLocalList",value:function(){delete this.autoNumericLocalList}},{key:"_setLocalList",value:function(e){this.autoNumericLocalList=e}},{key:"_getLocalList",value:function(){return this.autoNumericLocalList}},{key:"_hasLocalList",value:function(){return this.autoNumericLocalList instanceof Map&&0!==this.autoNumericLocalList.size}},{key:"_addToLocalList",value:function(e,t){var i=1<arguments.length&&void 0!==t?t:null;M.isNull(i)&&(i=this),M.isUndefined(this.autoNumericLocalList)?M.throwError("The local list provided does not exists when trying to add an element. [".concat(this.autoNumericLocalList,"] given.")):this.autoNumericLocalList.set(e,i)}},{key:"_removeFromLocalList",value:function(e){M.isUndefined(this.autoNumericLocalList)?this.settings.createLocalList&&M.throwError("The local list provided does not exists when trying to remove an element. [".concat(this.autoNumericLocalList,"] given.")):this.autoNumericLocalList.delete(e)}},{key:"_mergeSettings",value:function(){for(var e=arguments.length,t=new Array(e),i=0;i<e;i++)t[i]=arguments[i];b.apply(void 0,[this.settings].concat(t))}},{key:"_cloneAndMergeSettings",value:function(){for(var e={},t=arguments.length,i=new Array(t),n=0;n<t;n++)i[n]=arguments[n];return b.apply(void 0,[e,this.settings].concat(i)),e}},{key:"_updatePredefinedOptions",value:function(e,t){var i=1<arguments.length&&void 0!==t?t:null;return M.isNull(i)?this.update(e):(this._mergeSettings(e,i),this.update(this.settings)),this}},{key:"french",value:function(e){var t=0<arguments.length&&void 0!==e?e:null;return this._updatePredefinedOptions(B.getPredefinedOptions().French,t),this}},{key:"northAmerican",value:function(e){var t=0<arguments.length&&void 0!==e?e:null;return this._updatePredefinedOptions(B.getPredefinedOptions().NorthAmerican,t),this}},{key:"british",value:function(e){var t=0<arguments.length&&void 0!==e?e:null;return this._updatePredefinedOptions(B.getPredefinedOptions().British,t),this}},{key:"swiss",value:function(e){var t=0<arguments.length&&void 0!==e?e:null;return this._updatePredefinedOptions(B.getPredefinedOptions().Swiss,t),this}},{key:"japanese",value:function(e){var t=0<arguments.length&&void 0!==e?e:null;return this._updatePredefinedOptions(B.getPredefinedOptions().Japanese,t),this}},{key:"spanish",value:function(e){var t=0<arguments.length&&void 0!==e?e:null;return this._updatePredefinedOptions(B.getPredefinedOptions().Spanish,t),this}},{key:"chinese",value:function(e){var t=0<arguments.length&&void 0!==e?e:null;return this._updatePredefinedOptions(B.getPredefinedOptions().Chinese,t),this}},{key:"brazilian",value:function(e){var t=0<arguments.length&&void 0!==e?e:null;return this._updatePredefinedOptions(B.getPredefinedOptions().Brazilian,t),this}},{key:"_runCallbacksFoundInTheSettingsObject",value:function(){for(var e in this.settings)if(Object.prototype.hasOwnProperty.call(this.settings,e)){var t=this.settings[e];if("function"==typeof t)this.settings[e]=t(this,e);else{var i=this.domElement.getAttribute(e);i=M.camelize(i),"function"==typeof this.settings[i]&&(this.settings[e]=i(this,e))}}}},{key:"_setTrailingNegativeSignInfo",value:function(){this.isTrailingNegative=this.settings.currencySymbolPlacement===B.options.currencySymbolPlacement.prefix&&this.settings.negativePositiveSignPlacement===B.options.negativePositiveSignPlacement.suffix||this.settings.currencySymbolPlacement===B.options.currencySymbolPlacement.suffix&&(this.settings.negativePositiveSignPlacement===B.options.negativePositiveSignPlacement.left||this.settings.negativePositiveSignPlacement===B.options.negativePositiveSignPlacement.right)}},{key:"_modifyNegativeSignAndDecimalCharacterForRawValue",value:function(e){return"."!==this.settings.decimalCharacter&&(e=e.replace(this.settings.decimalCharacter,".")),"-"!==this.settings.negativeSignCharacter&&this.settings.isNegativeSignAllowed&&(e=e.replace(this.settings.negativeSignCharacter,"-")),e.match(/\d/)||(e+="0"),e}},{key:"_initialCaretPosition",value:function(e){M.isNull(this.settings.caretPositionOnFocus)&&this.settings.selectOnFocus===B.options.selectOnFocus.doNotSelect&&M.throwError("`_initialCaretPosition()` should never be called when the `caretPositionOnFocus` option is `null`.");var t=this.rawValue<0,i=M.isZeroOrHasNoValue(e),n=e.length,a=0,r=0,s=!1,o=0;this.settings.caretPositionOnFocus!==B.options.caretPositionOnFocus.start&&(a=(e=(e=(e=e.replace(this.settings.negativeSignCharacter,"")).replace(this.settings.positiveSignCharacter,"")).replace(this.settings.currencySymbol,"")).length,s=M.contains(e,this.settings.decimalCharacter),this.settings.caretPositionOnFocus!==B.options.caretPositionOnFocus.decimalLeft&&this.settings.caretPositionOnFocus!==B.options.caretPositionOnFocus.decimalRight||(o=s?(r=e.indexOf(this.settings.decimalCharacter),this.settings.decimalCharacter.length):(r=a,0)));var l="";t?l=this.settings.negativeSignCharacter:this.settings.showPositiveSign&&!i&&(l=this.settings.positiveSignCharacter);var u,c=l.length,h=this.settings.currencySymbol.length;if(this.settings.currencySymbolPlacement===B.options.currencySymbolPlacement.prefix){if(this.settings.caretPositionOnFocus===B.options.caretPositionOnFocus.start)if(this.settings.negativePositiveSignPlacement!==B.options.negativePositiveSignPlacement.none&&(t||!t&&this.settings.showPositiveSign&&!i))switch(this.settings.negativePositiveSignPlacement){case B.options.negativePositiveSignPlacement.prefix:case B.options.negativePositiveSignPlacement.left:case B.options.negativePositiveSignPlacement.right:u=c+h;break;case B.options.negativePositiveSignPlacement.suffix:u=h}else u=h;else if(this.settings.caretPositionOnFocus===B.options.caretPositionOnFocus.end)if(this.settings.negativePositiveSignPlacement!==B.options.negativePositiveSignPlacement.none&&(t||!t&&this.settings.showPositiveSign&&!i))switch(this.settings.negativePositiveSignPlacement){case B.options.negativePositiveSignPlacement.prefix:case B.options.negativePositiveSignPlacement.left:case B.options.negativePositiveSignPlacement.right:u=n;break;case B.options.negativePositiveSignPlacement.suffix:u=h+a}else u=n;else if(this.settings.caretPositionOnFocus===B.options.caretPositionOnFocus.decimalLeft)if(this.settings.negativePositiveSignPlacement!==B.options.negativePositiveSignPlacement.none&&(t||!t&&this.settings.showPositiveSign&&!i))switch(this.settings.negativePositiveSignPlacement){case B.options.negativePositiveSignPlacement.prefix:case B.options.negativePositiveSignPlacement.left:case B.options.negativePositiveSignPlacement.right:u=c+h+r;break;case B.options.negativePositiveSignPlacement.suffix:u=h+r}else u=h+r;else if(this.settings.caretPositionOnFocus===B.options.caretPositionOnFocus.decimalRight)if(this.settings.negativePositiveSignPlacement!==B.options.negativePositiveSignPlacement.none&&(t||!t&&this.settings.showPositiveSign&&!i))switch(this.settings.negativePositiveSignPlacement){case B.options.negativePositiveSignPlacement.prefix:case B.options.negativePositiveSignPlacement.left:case B.options.negativePositiveSignPlacement.right:u=c+h+r+o;break;case B.options.negativePositiveSignPlacement.suffix:u=h+r+o}else u=h+r+o}else if(this.settings.currencySymbolPlacement===B.options.currencySymbolPlacement.suffix)if(this.settings.caretPositionOnFocus===B.options.caretPositionOnFocus.start)if(this.settings.negativePositiveSignPlacement!==B.options.negativePositiveSignPlacement.none&&(t||!t&&this.settings.showPositiveSign&&!i))switch(this.settings.negativePositiveSignPlacement){case B.options.negativePositiveSignPlacement.suffix:case B.options.negativePositiveSignPlacement.right:case B.options.negativePositiveSignPlacement.left:u=0;break;case B.options.negativePositiveSignPlacement.prefix:u=c}else u=0;else if(this.settings.caretPositionOnFocus===B.options.caretPositionOnFocus.end)if(this.settings.negativePositiveSignPlacement!==B.options.negativePositiveSignPlacement.none&&(t||!t&&this.settings.showPositiveSign&&!i))switch(this.settings.negativePositiveSignPlacement){case B.options.negativePositiveSignPlacement.suffix:case B.options.negativePositiveSignPlacement.right:case B.options.negativePositiveSignPlacement.left:u=a;break;case B.options.negativePositiveSignPlacement.prefix:u=c+a}else u=a;else if(this.settings.caretPositionOnFocus===B.options.caretPositionOnFocus.decimalLeft)if(this.settings.negativePositiveSignPlacement!==B.options.negativePositiveSignPlacement.none&&(t||!t&&this.settings.showPositiveSign&&!i))switch(this.settings.negativePositiveSignPlacement){case B.options.negativePositiveSignPlacement.suffix:case B.options.negativePositiveSignPlacement.right:case B.options.negativePositiveSignPlacement.left:u=r;break;case B.options.negativePositiveSignPlacement.prefix:u=c+r}else u=r;else if(this.settings.caretPositionOnFocus===B.options.caretPositionOnFocus.decimalRight)if(this.settings.negativePositiveSignPlacement!==B.options.negativePositiveSignPlacement.none&&(t||!t&&this.settings.showPositiveSign&&!i))switch(this.settings.negativePositiveSignPlacement){case B.options.negativePositiveSignPlacement.suffix:case B.options.negativePositiveSignPlacement.right:case B.options.negativePositiveSignPlacement.left:u=r+o;break;case B.options.negativePositiveSignPlacement.prefix:u=c+r+o}else u=r+o;return u}},{key:"_triggerRangeEvents",value:function(e,t){e||this._triggerEvent(B.events.minRangeExceeded,this.domElement),t||this._triggerEvent(B.events.maxRangeExceeded,this.domElement)}},{key:"_setInvalidState",value:function(){this.isInputElement?M.setInvalidState(this.domElement):this._addCSSClass(this.settings.invalidClass),this._triggerEvent(B.events.invalidValue,this.domElement),this.validState=!1}},{key:"_setValidState",value:function(){this.isInputElement?M.setValidState(this.domElement):this._removeCSSClass(this.settings.invalidClass),this.validState||this._triggerEvent(B.events.correctedValue,this.domElement),this.validState=!0}},{key:"_setValidOrInvalidState",value:function(e){if(this.settings.overrideMinMaxLimits===B.options.overrideMinMaxLimits.invalid){var t=this.constructor._isMinimumRangeRespected(e,this.settings),i=this.constructor._isMaximumRangeRespected(e,this.settings);t&&i?this._setValidState():this._setInvalidState(),this._triggerRangeEvents(t,i)}}},{key:"_keepAnOriginalSettingsCopy",value:function(){this.originalDigitGroupSeparator=this.settings.digitGroupSeparator,this.originalCurrencySymbol=this.settings.currencySymbol,this.originalSuffixText=this.settings.suffixText}},{key:"_trimLeadingAndTrailingZeros",value:function(e){if(""===e||null===e)return e;if(this.settings.leadingZero!==B.options.leadingZero.keep){if(0===Number(e))return"0";e=e.replace(/^(-)?0+(?=\d)/g,"$1")}return M.contains(e,".")&&(e=e.replace(/(\.[0-9]*?)0+$/,"$1")),e.replace(/\.$/,"")}},{key:"_setPersistentStorageName",value:function(){this.settings.saveValueToSessionStorage&&(""===this.domElement.name||M.isUndefined(this.domElement.name)?this.rawValueStorageName="".concat(this.storageNamePrefix).concat(this.domElement.id):this.rawValueStorageName="".concat(this.storageNamePrefix).concat(decodeURIComponent(this.domElement.name)))}},{key:"_saveValueToPersistentStorage",value:function(){this.settings.saveValueToSessionStorage&&(this.sessionStorageAvailable?sessionStorage.setItem(this.rawValueStorageName,this.rawValue):document.cookie="".concat(this.rawValueStorageName,"=").concat(this.rawValue,"; expires= ; path=/"))}},{key:"_getValueFromPersistentStorage",value:function(){return this.settings.saveValueToSessionStorage?this.sessionStorageAvailable?sessionStorage.getItem(this.rawValueStorageName):this.constructor._readCookie(this.rawValueStorageName):(M.warning("`_getValueFromPersistentStorage()` is called but `settings.saveValueToSessionStorage` is false. There must be an error that needs fixing.",this.settings.showWarnings),null)}},{key:"_removeValueFromPersistentStorage",value:function(){if(this.settings.saveValueToSessionStorage)if(this.sessionStorageAvailable)sessionStorage.removeItem(this.rawValueStorageName);else{var e=new Date;e.setTime(e.getTime()-864e5);var t="; expires=".concat(e.toUTCString());document.cookie="".concat(this.rawValueStorageName,"='' ;").concat(t,"; path=/")}}},{key:"_getDefaultValue",value:function(e){var t=e.getAttribute("value");return M.isNull(t)?"":t}},{key:"_onFocusInAndMouseEnter",value:function(e){if(this.isEditing=!1,!this.formulaMode&&this.settings.unformatOnHover&&"mouseenter"===e.type&&e.altKey)this.constructor._unformatAltHovered(this);else if("focus"===e.type&&(this.isFocused=!0,this.rawValueOnFocus=this.rawValue),"focus"===e.type&&this.settings.unformatOnHover&&this.hoveredWithAlt&&this.constructor._reformatAltHovered(this),"focus"===e.type||"mouseenter"===e.type&&!this.isFocused){var t=null;this.settings.emptyInputBehavior===B.options.emptyInputBehavior.focus&&this.rawValue<0&&null!==this.settings.negativeBracketsTypeOnBlur&&this.settings.isNegativeSignAllowed&&(t=this.constructor._removeBrackets(M.getElementValue(this.domElement),this.settings));var i=this._getRawValueToFormat(this.rawValue);if(""!==i){var n=this.constructor._roundFormattedValueShownOnFocusOrBlur(i,this.settings,this.isFocused);t=this.settings.showOnlyNumbersOnFocus===B.options.showOnlyNumbersOnFocus.onlyNumbers?(this.settings.digitGroupSeparator="",this.settings.currencySymbol="",this.settings.suffixText="",n.replace(".",this.settings.decimalCharacter)):M.isNull(n)?"":this.constructor._addGroupSeparators(n.replace(".",this.settings.decimalCharacter),this.settings,this.isFocused,i)}M.isNull(t)?this.valueOnFocus="":this.valueOnFocus=t,this.lastVal=this.valueOnFocus;var a=this.constructor._isElementValueEmptyOrOnlyTheNegativeSign(this.valueOnFocus,this.settings),r=this.constructor._orderValueCurrencySymbolAndSuffixText(this.valueOnFocus,this.settings,!0),s=a&&""!==r&&this.settings.emptyInputBehavior===B.options.emptyInputBehavior.focus;s&&(t=r),M.isNull(t)||this._setElementValue(t),s&&r===this.settings.currencySymbol&&this.settings.currencySymbolPlacement===B.options.currencySymbolPlacement.suffix&&M.setElementSelection(e.target,0)}}},{key:"_onFocus",value:function(){this.settings.isCancellable&&this._saveCancellableValue()}},{key:"_onFocusIn",value:function(e){this.settings.selectOnFocus?this.select():M.isNull(this.settings.caretPositionOnFocus)||M.setElementSelection(e.target,this._initialCaretPosition(M.getElementValue(this.domElement)))}},{key:"_enterFormulaMode",value:function(){this.settings.formulaMode&&(this.formulaMode=!0,M.setElementValue(this.domElement,"="),M.setElementSelection(this.domElement,1))}},{key:"_exitFormulaMode",value:function(){var e,t=M.getElementValue(this.domElement);t=t.replace(/^\s*=/,"");try{var i=new v(t,this.settings.decimalCharacter);e=(new u).evaluate(i)}catch(e){return this._triggerEvent(B.events.invalidFormula,this.domElement,{formula:t,aNElement:this}),this.reformat(),void(this.formulaMode=!1)}this._triggerEvent(B.events.validFormula,this.domElement,{formula:t,result:e,aNElement:this}),this.set(e),this.formulaMode=!1}},{key:"_acceptNonPrintableKeysInFormulaMode",value:function(){return this.eventKey===d.keyName.Backspace||this.eventKey===d.keyName.Delete||this.eventKey===d.keyName.LeftArrow||this.eventKey===d.keyName.RightArrow||this.eventKey===d.keyName.Home||this.eventKey===d.keyName.End}},{key:"_onKeydown",value:function(e){if(this.formatted=!1,this.isEditing=!0,this.formulaMode||this.isFocused||!this.settings.unformatOnHover||!e.altKey||this.domElement!==M.getHoveredElement()){if(this._updateEventKeyInfo(e),this.keydownEventCounter+=1,1===this.keydownEventCounter&&(this.initialValueOnFirstKeydown=M.getElementValue(e.target),this.initialRawValueOnFirstKeydown=this.rawValue),this.formulaMode){if(this.eventKey===d.keyName.Esc)return this.formulaMode=!1,void this.reformat();if(this.eventKey===d.keyName.Enter)return void this._exitFormulaMode();if(this._acceptNonPrintableKeysInFormulaMode())return}else if(this.eventKey===d.keyName.Equal)return void this._enterFormulaMode();if(this.domElement.readOnly||this.settings.readOnly||this.domElement.disabled)this.processed=!0;else{this.eventKey===d.keyName.Esc&&(e.preventDefault(),this.settings.isCancellable&&this.rawValue!==this.savedCancellableValue&&(this.set(this.savedCancellableValue),this._triggerEvent(B.events.native.input,e.target)),this.select());var t=M.getElementValue(e.target);if(this.eventKey===d.keyName.Enter&&this.rawValue!==this.rawValueOnFocus&&(this._triggerEvent(B.events.native.change,e.target),this.valueOnFocus=t,this.rawValueOnFocus=this.rawValue,this.settings.isCancellable&&this._saveCancellableValue()),this._updateInternalProperties(e),this._processNonPrintableKeysAndShortcuts(e))this.processed=!0;else if(this.eventKey===d.keyName.Backspace||this.eventKey===d.keyName.Delete){var i=this._processCharacterDeletion();if(this.processed=!0,!i)return void e.preventDefault();this._formatValue(e),(t=M.getElementValue(e.target))!==this.lastVal&&this.throwInput&&(this._triggerEvent(B.events.native.input,e.target),e.preventDefault()),this.lastVal=t,this.throwInput=!0}}}else this.constructor._unformatAltHovered(this)}},{key:"_onKeypress",value:function(e){if(this.formulaMode){if(this._acceptNonPrintableKeysInFormulaMode())return;if(this.settings.formulaChars.test(this.eventKey))return;e.preventDefault()}else if(this.eventKey!==d.keyName.Insert){var t=this.processed;if(this._updateInternalProperties(e),!this._processNonPrintableKeysAndShortcuts(e))if(t)e.preventDefault();else{if(this._processCharacterInsertion()){this._formatValue(e);var i=M.getElementValue(e.target);if(i!==this.lastVal&&this.throwInput)this._triggerEvent(B.events.native.input,e.target),e.preventDefault();else{if((this.eventKey===this.settings.decimalCharacter||this.eventKey===this.settings.decimalCharacterAlternative)&&M.getElementSelection(e.target).start===M.getElementSelection(e.target).end&&M.getElementSelection(e.target).start===i.indexOf(this.settings.decimalCharacter)){var n=M.getElementSelection(e.target).start+1;M.setElementSelection(e.target,n)}e.preventDefault()}return this.lastVal=M.getElementValue(e.target),this.throwInput=!0,void this._setValidOrInvalidState(this.rawValue)}e.preventDefault()}}}},{key:"_onKeyup",value:function(e){if(this.isEditing=!1,this.keydownEventCounter=0,!this.formulaMode)if(this.settings.isCancellable&&this.eventKey===d.keyName.Esc)e.preventDefault();else{if(this.eventKey===d.keyName.Z||this.eventKey===d.keyName.z){if(e.ctrlKey&&e.shiftKey)return e.preventDefault(),this._historyTableRedo(),void(this.onGoingRedo=!0);if(e.ctrlKey&&!e.shiftKey){if(!this.onGoingRedo)return e.preventDefault(),void this._historyTableUndo();this.onGoingRedo=!1}}if(this.onGoingRedo&&(e.ctrlKey||e.shiftKey)&&(this.onGoingRedo=!1),(e.ctrlKey||e.metaKey)&&this.eventKey===d.keyName.x){var t=M.getElementSelection(this.domElement).start,i=this.constructor._toNumericValue(M.getElementValue(e.target),this.settings);this.set(i),this._setCaretPosition(t)}if(this.eventKey===d.keyName.Alt&&this.settings.unformatOnHover&&this.hoveredWithAlt)this.constructor._reformatAltHovered(this);else if(!e.ctrlKey&&!e.metaKey||this.eventKey!==d.keyName.Backspace&&this.eventKey!==d.keyName.Delete){this._updateInternalProperties(e);var n=this._processNonPrintableKeysAndShortcuts(e);delete this.valuePartsBeforePaste;var a=M.getElementValue(e.target);if(!(n||""===a&&""===this.initialValueOnFirstKeydown)&&(a===this.settings.currencySymbol?this.settings.currencySymbolPlacement===B.options.currencySymbolPlacement.suffix?M.setElementSelection(e.target,0):M.setElementSelection(e.target,this.settings.currencySymbol.length):this.eventKey===d.keyName.Tab&&M.setElementSelection(e.target,0,a.length),(a===this.settings.suffixText||""===this.rawValue&&""!==this.settings.currencySymbol&&""!==this.settings.suffixText)&&M.setElementSelection(e.target,0),null!==this.settings.decimalPlacesShownOnFocus&&this._saveValueToPersistentStorage(),this.formatted||this._formatValue(e),this._setValidOrInvalidState(this.rawValue),this._saveRawValueForAndroid(),a!==this.initialValueOnFirstKeydown&&this._triggerEvent(B.events.formatted,e.target,{oldValue:this.initialValueOnFirstKeydown,newValue:a,oldRawValue:this.initialRawValueOnFirstKeydown,newRawValue:this.rawValue,isPristine:this.isPristine(!1),error:null,aNElement:this}),1<this.historyTable.length)){var r=M.getElementSelection(this.domElement);this.selectionStart=r.start,this.selectionEnd=r.end,this.historyTable[this.historyTableIndex].start=this.selectionStart,this.historyTable[this.historyTableIndex].end=this.selectionEnd}}else{var s=M.getElementValue(e.target);this._setRawValue(this._formatOrUnformatOther(!1,s))}}}},{key:"_saveRawValueForAndroid",value:function(){if(this.eventKey===d.keyName.AndroidDefault){var e=this.constructor._stripAllNonNumberCharactersExceptCustomDecimalChar(this.getFormatted(),this.settings,!0,this.isFocused);e=this.constructor._convertToNumericString(e,this.settings),this._setRawValue(e)}}},{key:"_onFocusOutAndMouseLeave",value:function(e){if(this.isEditing=!1,"mouseleave"!==e.type||!this.formulaMode)if(this.settings.unformatOnHover&&"mouseleave"===e.type&&this.hoveredWithAlt)this.constructor._reformatAltHovered(this);else if("mouseleave"===e.type&&!this.isFocused||"blur"===e.type){"blur"===e.type&&this.formulaMode&&this._exitFormulaMode(),this._saveValueToPersistentStorage(),this.settings.showOnlyNumbersOnFocus===B.options.showOnlyNumbersOnFocus.onlyNumbers&&(this.settings.digitGroupSeparator=this.originalDigitGroupSeparator,this.settings.currencySymbol=this.originalCurrencySymbol,this.settings.suffixText=this.originalSuffixText);var t=this._getRawValueToFormat(this.rawValue),i=M.isNull(t),n=S(this.constructor._checkIfInRangeWithOverrideOption(t,this.settings),2),a=n[0],r=n[1],s=!1;if(""===t||i||(this._triggerRangeEvents(a,r),this.settings.valuesToStrings&&this._checkValuesToStrings(t)&&(this._setElementValue(this.settings.valuesToStrings[t]),s=!0)),!s){var o;if(o=i||""===t?t:String(t),""===t||i){if(""===t)switch(this.settings.emptyInputBehavior){case B.options.emptyInputBehavior.zero:this._setRawValue("0"),o=this.constructor._roundValue("0",this.settings,0);break;case B.options.emptyInputBehavior.min:this._setRawValue(this.settings.minimumValue),o=this.constructor._roundFormattedValueShownOnFocusOrBlur(this.settings.minimumValue,this.settings,this.isFocused);break;case B.options.emptyInputBehavior.max:this._setRawValue(this.settings.maximumValue),o=this.constructor._roundFormattedValueShownOnFocusOrBlur(this.settings.maximumValue,this.settings,this.isFocused);break;default:M.isNumber(this.settings.emptyInputBehavior)&&(this._setRawValue(this.settings.emptyInputBehavior),o=this.constructor._roundFormattedValueShownOnFocusOrBlur(this.settings.emptyInputBehavior,this.settings,this.isFocused))}}else a&&r&&!this.constructor._isElementValueEmptyOrOnlyTheNegativeSign(t,this.settings)?(o=this._modifyNegativeSignAndDecimalCharacterForRawValue(o),this.settings.divisorWhenUnfocused&&!M.isNull(o)&&(o=(o/=this.settings.divisorWhenUnfocused).toString()),o=this.constructor._roundFormattedValueShownOnBlur(o,this.settings),o=this.constructor._modifyNegativeSignAndDecimalCharacterForFormattedValue(o,this.settings)):this._triggerRangeEvents(a,r);var l=this.constructor._orderValueCurrencySymbolAndSuffixText(o,this.settings,!1);this.constructor._isElementValueEmptyOrOnlyTheNegativeSign(o,this.settings)||i&&this.settings.emptyInputBehavior===B.options.emptyInputBehavior.null||(l=this.constructor._addGroupSeparators(o,this.settings,!1,t)),l===t&&""!==t&&this.settings.allowDecimalPadding!==B.options.allowDecimalPadding.never&&this.settings.allowDecimalPadding!==B.options.allowDecimalPadding.floats||(this.settings.symbolWhenUnfocused&&""!==t&&null!==t&&(l="".concat(l).concat(this.settings.symbolWhenUnfocused)),this._setElementValue(l))}this._setValidOrInvalidState(this.rawValue),"blur"===e.type&&this._onBlur(e)}}},{key:"_onPaste",value:function(e){if(e.preventDefault(),!(this.settings.readOnly||this.domElement.readOnly||this.domElement.disabled)){var t,i;window.clipboardData&&window.clipboardData.getData?t=window.clipboardData.getData("Text"):e.clipboardData&&e.clipboardData.getData?t=e.clipboardData.getData("text/plain"):M.throwError("Unable to retrieve the pasted value. Please use a modern browser (ie. Firefox or Chromium)."),i=e.target.tagName?e.target:e.explicitOriginalTarget;var n=M.getElementValue(i),a=i.selectionStart||0,r=i.selectionEnd||0,s=r-a;if(s===n.length){var o=this._preparePastedText(t),l=M.arabicToLatinNumbers(o,!1,!1,!1);return"."===l||""===l||"."!==l&&!M.isNumber(l)?(this.formatted=!0,void(this.settings.onInvalidPaste===B.options.onInvalidPaste.error&&M.throwError("The pasted value '".concat(t,"' is not a valid paste content.")))):(this.set(l),this.formatted=!0,void this._triggerEvent(B.events.native.input,i))}var u=M.isNegativeStrict(t,this.settings.negativeSignCharacter);u&&(t=t.slice(1,t.length));var c,h,m=this._preparePastedText(t);if("."!==(c="."===m?".":M.arabicToLatinNumbers(m,!1,!1,!1))&&(!M.isNumber(c)||""===c))return this.formatted=!0,void(this.settings.onInvalidPaste===B.options.onInvalidPaste.error&&M.throwError("The pasted value '".concat(t,"' is not a valid paste content.")));var g,d,v=M.isNegativeStrict(this.getNumericString(),this.settings.negativeSignCharacter);g=!(!u||v)&&(v=!0);var p=n.slice(0,a),f=n.slice(r,n.length);d=a!==r?this._preparePastedText(p+f):this._preparePastedText(n),v&&(d=M.setRawNegativeSign(d)),h=M.convertCharacterCountToIndexPosition(M.countNumberCharactersOnTheCaretLeftSide(n,a,this.settings.decimalCharacter)),g&&h++;var y=d.slice(0,h),S=d.slice(h,d.length),b=!1;"."===c&&(M.contains(y,".")&&(b=!0,y=y.replace(".","")),S=S.replace(".",""));var w=!1;switch(""===y&&"-"===S&&(y="-",w=!(S="")),this.settings.onInvalidPaste){case B.options.onInvalidPaste.truncate:case B.options.onInvalidPaste.replace:for(var P=M.parseStr(this.settings.minimumValue),O=M.parseStr(this.settings.maximumValue),k=d,N=0,E=y;N<c.length&&(d=(E+=c[N])+S,this.constructor._checkIfInRange(d,P,O));)k=d,N++;if(h+=N,w&&h++,this.settings.onInvalidPaste===B.options.onInvalidPaste.truncate){d=k,b&&h--;break}for(var _=h,C=k.length;N<c.length&&_<C;)if("."!==k[_]){if(d=M.replaceCharAt(k,_,c[N]),!this.constructor._checkIfInRange(d,P,O))break;k=d,N++,_++}else _++;h=_,b&&h--,d=k;break;case B.options.onInvalidPaste.error:case B.options.onInvalidPaste.ignore:case B.options.onInvalidPaste.clamp:default:if(d="".concat(y).concat(c).concat(S),a===r)h=M.convertCharacterCountToIndexPosition(M.countNumberCharactersOnTheCaretLeftSide(n,a,this.settings.decimalCharacter))+c.length;else if(""===S)h=M.convertCharacterCountToIndexPosition(M.countNumberCharactersOnTheCaretLeftSide(n,a,this.settings.decimalCharacter))+c.length,w&&h++;else{var F=M.convertCharacterCountToIndexPosition(M.countNumberCharactersOnTheCaretLeftSide(n,r,this.settings.decimalCharacter)),x=M.getElementValue(i).slice(a,r);h=F-s+M.countCharInText(this.settings.digitGroupSeparator,x)+c.length}g&&h++,b&&h--}if(M.isNumber(d)&&""!==d){var V=!1,T=!1;try{this.set(d),V=!0}catch(e){var A;switch(this.settings.onInvalidPaste){case B.options.onInvalidPaste.clamp:A=M.clampToRangeLimits(d,this.settings);try{this.set(A)}catch(e){M.throwError("Fatal error: Unable to set the clamped value '".concat(A,"'."))}V=T=!0,d=A;break;case B.options.onInvalidPaste.error:case B.options.onInvalidPaste.truncate:case B.options.onInvalidPaste.replace:M.throwError("The pasted value '".concat(t,"' results in a value '").concat(d,"' that is outside of the minimum [").concat(this.settings.minimumValue,"] and maximum [").concat(this.settings.maximumValue,"] value range."));case B.options.onInvalidPaste.ignore:default:return}}var L,I=M.getElementValue(i);if(V)switch(this.settings.onInvalidPaste){case B.options.onInvalidPaste.clamp:if(T){this.settings.currencySymbolPlacement===B.options.currencySymbolPlacement.suffix?M.setElementSelection(i,I.length-this.settings.currencySymbol.length):M.setElementSelection(i,I.length);break}case B.options.onInvalidPaste.error:case B.options.onInvalidPaste.ignore:case B.options.onInvalidPaste.truncate:case B.options.onInvalidPaste.replace:default:L=M.findCaretPositionInFormattedNumber(d,h,I,this.settings.decimalCharacter),M.setElementSelection(i,L)}V&&n!==I&&this._triggerEvent(B.events.native.input,i)}else this.settings.onInvalidPaste===B.options.onInvalidPaste.error&&M.throwError("The pasted value '".concat(t,"' would result into an invalid content '").concat(d,"'."))}}},{key:"_onBlur",value:function(e){this.isFocused=!1,this.isEditing=!1,this.rawValue!==this.rawValueOnFocus&&this._triggerEvent(B.events.native.change,e.target),this.rawValueOnFocus=void 0}},{key:"_onWheel",value:function(e){this.formulaMode||this.settings.readOnly||this.domElement.readOnly||this.domElement.disabled||this.settings.modifyValueOnWheel&&(this.settings.wheelOn===B.options.wheelOn.focus?this.isFocused?e.shiftKey||this.wheelAction(e):e.shiftKey&&this.wheelAction(e):this.settings.wheelOn===B.options.wheelOn.hover?e.shiftKey?(e.preventDefault(),window.scrollBy(0,M.isNegativeStrict(String(e.deltaY))?-50:50)):this.wheelAction(e):M.throwError("Unknown `wheelOn` option."))}},{key:"wheelAction",value:function(e){this.isWheelEvent=!0;var t,i=e.target.selectionStart||0,n=e.target.selectionEnd||0,a=this.rawValue;if(M.isUndefinedOrNullOrEmpty(a)?0<this.settings.minimumValue||this.settings.maximumValue<0?M.isWheelUpEvent(e)?t=this.settings.minimumValue:M.isWheelDownEvent(e)?t=this.settings.maximumValue:M.throwError("The event is not a 'wheel' event."):t=0:t=a,t=+t,M.isNumber(this.settings.wheelStep)){var r=+this.settings.wheelStep;M.isWheelUpEvent(e)?t+=r:M.isWheelDownEvent(e)&&(t-=r)}else M.isWheelUpEvent(e)?t=M.addAndRoundToNearestAuto(t,this.settings.decimalPlacesRawValue):M.isWheelDownEvent(e)&&(t=M.subtractAndRoundToNearestAuto(t,this.settings.decimalPlacesRawValue));(t=M.clampToRangeLimits(t,this.settings))!==+a&&(this.set(t),this._triggerEvent(B.events.native.input,e.target)),e.preventDefault(),this._setSelection(i,n),this.isWheelEvent=!1}},{key:"_onDrop",value:function(e){if(!this.formulaMode){var t;this.isDropEvent=!0,e.preventDefault(),t=M.isIE11()?"text":"text/plain";var i=e.dataTransfer.getData(t),n=this.unformatOther(i);this.set(n),this.isDropEvent=!1}}},{key:"_onFormSubmit",value:function(){var t=this;return this._getFormAutoNumericChildren(this.parentForm).map(function(e){return t.constructor.getAutoNumericElement(e)}).forEach(function(e){return e._unformatOnSubmit()}),!0}},{key:"_onFormReset",value:function(){var i=this;this._getFormAutoNumericChildren(this.parentForm).map(function(e){return i.constructor.getAutoNumericElement(e)}).forEach(function(e){var t=i._getDefaultValue(e.node());setTimeout(function(){return e.set(t)},0)})}},{key:"_unformatOnSubmit",value:function(){this.settings.unformatOnSubmit&&this._setElementValue(this.rawValue)}},{key:"_onKeydownGlobal",value:function(e){if(M.character(e)===d.keyName.Alt){var t=M.getHoveredElement();if(B.isManagedByAutoNumeric(t)){var i=B.getAutoNumericElement(t);!i.formulaMode&&i.settings.unformatOnHover&&this.constructor._unformatAltHovered(i)}}}},{key:"_onKeyupGlobal",value:function(e){if(M.character(e)===d.keyName.Alt){var t=M.getHoveredElement();if(B.isManagedByAutoNumeric(t)){var i=B.getAutoNumericElement(t);if(i.formulaMode||!i.settings.unformatOnHover)return;this.constructor._reformatAltHovered(i)}}}},{key:"_isElementTagSupported",value:function(){return M.isElement(this.domElement)||M.throwError("The DOM element is not valid, ".concat(this.domElement," given.")),M.isInArray(this.domElement.tagName.toLowerCase(),this.allowedTagList)}},{key:"_isInputElement",value:function(){return"input"===this.domElement.tagName.toLowerCase()}},{key:"_isInputTypeSupported",value:function(){return"text"===this.domElement.type||"hidden"===this.domElement.type||"tel"===this.domElement.type||M.isUndefinedOrNullOrEmpty(this.domElement.type)}},{key:"_checkElement",value:function(){var e=this.domElement.tagName.toLowerCase();this._isElementTagSupported()||M.throwError("The <".concat(e,"> tag is not supported by autoNumeric")),this._isInputElement()?(this._isInputTypeSupported()||M.throwError('The input type "'.concat(this.domElement.type,'" is not supported by autoNumeric')),this.isInputElement=!0):(this.isInputElement=!1,this.isContentEditable=this.domElement.hasAttribute("contenteditable")&&"true"===this.domElement.getAttribute("contenteditable"))}},{key:"_formatDefaultValueOnPageLoad",value:function(e){var t,i=0<arguments.length&&void 0!==e?e:null,n=!0;if(M.isNull(i)?(t=M.getElementValue(this.domElement).trim(),this.domElement.setAttribute("value",t)):t=i,this.isInputElement||this.isContentEditable){var a=this.constructor._toNumericValue(t,this.settings);if(this.domElement.hasAttribute("value")&&""!==this.domElement.getAttribute("value")){if(null!==this.settings.defaultValueOverride&&this.settings.defaultValueOverride.toString()!==t||null===this.settings.defaultValueOverride&&""!==t&&t!==this.domElement.getAttribute("value")||""!==t&&"hidden"===this.domElement.getAttribute("type")&&!M.isNumber(a)){if(this.settings.saveValueToSessionStorage&&(null!==this.settings.decimalPlacesShownOnFocus||this.settings.divisorWhenUnfocused)&&this._setRawValue(this._getValueFromPersistentStorage()),!this.settings.saveValueToSessionStorage){var r=this.constructor._removeBrackets(t,this.settings);(this.settings.negativePositiveSignPlacement===B.options.negativePositiveSignPlacement.suffix||this.settings.negativePositiveSignPlacement!==B.options.negativePositiveSignPlacement.prefix&&this.settings.currencySymbolPlacement===B.options.currencySymbolPlacement.suffix)&&""!==this.settings.negativeSignCharacter&&M.isNegative(t,this.settings.negativeSignCharacter)?this._setRawValue("-".concat(this.constructor._stripAllNonNumberCharacters(r,this.settings,!0,this.isFocused))):this._setRawValue(this.constructor._stripAllNonNumberCharacters(r,this.settings,!0,this.isFocused))}n=!1}}else isNaN(Number(a))||1/0===a?M.throwError("The value [".concat(t,"] used in the input is not a valid value autoNumeric can work with.")):(this.set(a),n=!1);if(""===t)switch(this.settings.emptyInputBehavior){case B.options.emptyInputBehavior.focus:case B.options.emptyInputBehavior.null:case B.options.emptyInputBehavior.press:break;case B.options.emptyInputBehavior.always:this._setElementValue(this.settings.currencySymbol);break;case B.options.emptyInputBehavior.min:this.set(this.settings.minimumValue);break;case B.options.emptyInputBehavior.max:this.set(this.settings.maximumValue);break;case B.options.emptyInputBehavior.zero:this.set("0");break;default:this.set(this.settings.emptyInputBehavior)}else n&&t===this.domElement.getAttribute("value")&&this.set(t)}else null!==this.settings.defaultValueOverride&&this.settings.defaultValueOverride!==t||this.set(t)}},{key:"_calculateVMinAndVMaxIntegerSizes",value:function(){var e=S(this.settings.maximumValue.toString().split("."),1)[0],t=S(this.settings.minimumValue||0===this.settings.minimumValue?this.settings.minimumValue.toString().split("."):[],1)[0];e=e.replace(this.settings.negativeSignCharacter,""),t=t.replace(this.settings.negativeSignCharacter,""),this.settings.mIntPos=Math.max(e.length,1),this.settings.mIntNeg=Math.max(t.length,1)}},{key:"_calculateValuesToStringsKeys",value:function(){this.settings.valuesToStrings?this.valuesToStringsKeys=Object.keys(this.settings.valuesToStrings):this.valuesToStringsKeys=[]}},{key:"_transformOptionsValuesToDefaultTypes",value:function(){for(var e in this.settings)if(Object.prototype.hasOwnProperty.call(this.settings,e)){var t=this.settings[e];"true"!==t&&"false"!==t||(this.settings[e]="true"===t),"number"==typeof t&&(this.settings[e]=t.toString())}}},{key:"_setSettings",value:function(e,t){var i=1<arguments.length&&void 0!==t&&t;!i&&M.isNull(e)||this.constructor._convertOldOptionsToNewOnes(e),i?("decimalPlacesRawValue"in e&&(this.settings.originalDecimalPlacesRawValue=e.decimalPlacesRawValue),"decimalPlaces"in e&&(this.settings.originalDecimalPlaces=e.decimalPlaces),this.constructor._calculateDecimalPlacesOnUpdate(e,this.settings),this._mergeSettings(e)):(this.settings={},this._mergeSettings(this.constructor.getDefaultConfig(),this.domElement.dataset,e,{rawValue:this.defaultRawValue}),this.caretFix=!1,this.throwInput=!0,this.allowedTagList=d.allowedTagList,this.runOnce=!1,this.hoveredWithAlt=!1),this._transformOptionsValuesToDefaultTypes(),this._runCallbacksFoundInTheSettingsObject(),this.constructor._correctNegativePositiveSignPlacementOption(this.settings),this.constructor._correctCaretPositionOnFocusAndSelectOnFocusOptions(this.settings),this.constructor._setNegativePositiveSignPermissions(this.settings),i||(M.isNull(e)||!e.decimalPlaces?this.settings.originalDecimalPlaces=null:this.settings.originalDecimalPlaces=e.decimalPlaces,this.settings.originalDecimalPlacesRawValue=this.settings.decimalPlacesRawValue,this.constructor._calculateDecimalPlacesOnInit(this.settings)),this._calculateVMinAndVMaxIntegerSizes(),this._setTrailingNegativeSignInfo(),this.regex={},this.constructor._cachesUsualRegularExpressions(this.settings,this.regex),this.constructor._setBrackets(this.settings),this._calculateValuesToStringsKeys(),M.isEmptyObj(this.settings)&&M.throwError("Unable to set the settings, those are invalid ; an empty object was given."),this.constructor.validate(this.settings,!1,e),this._keepAnOriginalSettingsCopy()}},{key:"_preparePastedText",value:function(e){return this.constructor._stripAllNonNumberCharacters(e,this.settings,!0,this.isFocused)}},{key:"_updateInternalProperties",value:function(){this.selection=M.getElementSelection(this.domElement),this.processed=!1}},{key:"_updateEventKeyInfo",value:function(e){this.eventKey=M.character(e)}},{key:"_saveCancellableValue",value:function(){this.savedCancellableValue=this.rawValue}},{key:"_setSelection",value:function(e,t){e=Math.max(e,0),t=Math.min(t,M.getElementValue(this.domElement).length),this.selection={start:e,end:t,length:t-e},M.setElementSelection(this.domElement,e,t)}},{key:"_setCaretPosition",value:function(e){this._setSelection(e,e)}},{key:"_getLeftAndRightPartAroundTheSelection",value:function(){var e=M.getElementValue(this.domElement);return[e.substring(0,this.selection.start),e.substring(this.selection.end,e.length)]}},{key:"_getUnformattedLeftAndRightPartAroundTheSelection",value:function(){var e=S(this._getLeftAndRightPartAroundTheSelection(),2),t=e[0],i=e[1];if(""===t&&""===i)return["",""];var n=!0;return this.eventKey!==d.keyName.Hyphen&&this.eventKey!==d.keyName.Minus||0!==Number(t)||(n=!1),this.isTrailingNegative&&(M.isNegative(i,this.settings.negativeSignCharacter)&&!M.isNegative(t,this.settings.negativeSignCharacter)||""===i&&M.isNegative(t,this.settings.negativeSignCharacter,!0))&&(t=t.replace(this.settings.negativeSignCharacter,""),i=i.replace(this.settings.negativeSignCharacter,""),t=t.replace("-",""),i=i.replace("-",""),t="-".concat(t)),[t=B._stripAllNonNumberCharactersExceptCustomDecimalChar(t,this.settings,n,this.isFocused),i=B._stripAllNonNumberCharactersExceptCustomDecimalChar(i,this.settings,!1,this.isFocused)]}},{key:"_normalizeParts",value:function(e,t){var i=!0;this.eventKey!==d.keyName.Hyphen&&this.eventKey!==d.keyName.Minus||0!==Number(e)||(i=!1),this.isTrailingNegative&&M.isNegative(t,this.settings.negativeSignCharacter)&&!M.isNegative(e,this.settings.negativeSignCharacter)&&(e="-".concat(e),t=t.replace(this.settings.negativeSignCharacter,"")),e=B._stripAllNonNumberCharactersExceptCustomDecimalChar(e,this.settings,i,this.isFocused),t=B._stripAllNonNumberCharactersExceptCustomDecimalChar(t,this.settings,!1,this.isFocused),this.settings.leadingZero!==B.options.leadingZero.deny||this.eventKey!==d.keyName.num0&&this.eventKey!==d.keyName.numpad0||0!==Number(e)||M.contains(e,this.settings.decimalCharacter)||""===t||(e=e.substring(0,e.length-1));var n=e+t;if(this.settings.decimalCharacter){var a=n.match(new RegExp("^".concat(this.regex.aNegRegAutoStrip,"\\").concat(this.settings.decimalCharacter)));a&&(n=(e=e.replace(a[1],a[1]+"0"))+t)}return[e,t,n]}},{key:"_setValueParts",value:function(e,t,i){var n=2<arguments.length&&void 0!==i&&i,a=S(this._normalizeParts(e,t),3),r=a[0],s=a[1],o=a[2],l=S(B._checkIfInRangeWithOverrideOption(o,this.settings),2),u=l[0],c=l[1];if(u&&c){var h=B._truncateDecimalPlaces(o,this.settings,n,this.settings.decimalPlacesRawValue).replace(this.settings.decimalCharacter,".");if(""===h||h===this.settings.negativeSignCharacter){var m;switch(this.settings.emptyInputBehavior){case B.options.emptyInputBehavior.focus:case B.options.emptyInputBehavior.press:case B.options.emptyInputBehavior.always:m="";break;case B.options.emptyInputBehavior.min:m=this.settings.minimumValue;break;case B.options.emptyInputBehavior.max:m=this.settings.maximumValue;break;case B.options.emptyInputBehavior.zero:m="0";break;case B.options.emptyInputBehavior.null:m=null;break;default:m=this.settings.emptyInputBehavior}this._setRawValue(m)}else this._setRawValue(this._trimLeadingAndTrailingZeros(h));var g=B._truncateDecimalPlaces(o,this.settings,n,this.settings.decimalPlacesShownOnFocus),d=r.length;return d>g.length&&(d=g.length),1===d&&"0"===r&&this.settings.leadingZero===B.options.leadingZero.deny&&(d=""===s||"0"===r&&""!==s?1:0),this._setElementValue(g,!1),this._setCaretPosition(d),!0}return this._triggerRangeEvents(u,c),!1}},{key:"_getSignPosition",value:function(){var e;if(this.settings.currencySymbol){var t=this.settings.currencySymbol.length,i=M.getElementValue(this.domElement);if(this.settings.currencySymbolPlacement===B.options.currencySymbolPlacement.prefix)e=this.settings.negativeSignCharacter&&i&&i.charAt(0)===this.settings.negativeSignCharacter?[1,t+1]:[0,t];else{var n=i.length;e=[n-t,n]}}else e=[1e3,-1];return e}},{key:"_expandSelectionOnSign",value:function(){var e=S(this._getSignPosition(),2),t=e[0],i=e[1],n=this.selection;n.start<i&&n.end>t&&((n.start<t||n.end>i)&&M.getElementValue(this.domElement).substring(Math.max(n.start,t),Math.min(n.end,i)).match(/^\s*$/)?n.start<t?this._setSelection(n.start,t):this._setSelection(i,n.end):this._setSelection(Math.min(n.start,t),Math.max(n.end,i)))}},{key:"_checkPaste",value:function(){if(!this.formatted&&!M.isUndefined(this.valuePartsBeforePaste)){var e=this.valuePartsBeforePaste,t=S(this._getLeftAndRightPartAroundTheSelection(),2),i=t[0],n=t[1];delete this.valuePartsBeforePaste;var a=i.substr(0,e[0].length)+B._stripAllNonNumberCharactersExceptCustomDecimalChar(i.substr(e[0].length),this.settings,!0,this.isFocused);this._setValueParts(a,n,!0)||(this._setElementValue(e.join(""),!1),this._setCaretPosition(e[0].length))}}},{key:"_processNonPrintableKeysAndShortcuts",value:function(e){if((e.ctrlKey||e.metaKey)&&"keyup"===e.type&&!M.isUndefined(this.valuePartsBeforePaste)||e.shiftKey&&this.eventKey===d.keyName.Insert)return this._checkPaste(),!1;if(this.constructor._shouldSkipEventKey(this.eventKey))return!0;if((e.ctrlKey||e.metaKey)&&this.eventKey===d.keyName.a)return this.settings.selectNumberOnly&&(e.preventDefault(),this.selectNumber()),!0;if((e.ctrlKey||e.metaKey)&&(this.eventKey===d.keyName.c||this.eventKey===d.keyName.v||this.eventKey===d.keyName.x))return"keydown"===e.type&&this._expandSelectionOnSign(),this.eventKey!==d.keyName.v&&this.eventKey!==d.keyName.Insert||("keydown"===e.type||"keypress"===e.type?M.isUndefined(this.valuePartsBeforePaste)&&(this.valuePartsBeforePaste=this._getLeftAndRightPartAroundTheSelection()):this._checkPaste()),"keydown"===e.type||"keypress"===e.type||this.eventKey===d.keyName.c;if(e.ctrlKey||e.metaKey)return!(this.eventKey===d.keyName.Z||this.eventKey===d.keyName.z);if(this.eventKey!==d.keyName.LeftArrow&&this.eventKey!==d.keyName.RightArrow)return M.isInArray(this.eventKey,d.keyName._directionKeys);if("keydown"===e.type&&!e.shiftKey){var t=M.getElementValue(this.domElement);this.eventKey!==d.keyName.LeftArrow||t.charAt(this.selection.start-2)!==this.settings.digitGroupSeparator&&t.charAt(this.selection.start-2)!==this.settings.decimalCharacter?this.eventKey!==d.keyName.RightArrow||t.charAt(this.selection.start+1)!==this.settings.digitGroupSeparator&&t.charAt(this.selection.start+1)!==this.settings.decimalCharacter||this._setCaretPosition(this.selection.start+1):this._setCaretPosition(this.selection.start-1)}return!0}},{key:"_processCharacterDeletionIfTrailingNegativeSign",value:function(e){var t=S(e,2),i=t[0],n=t[1],a=M.getElementValue(this.domElement),r=M.isNegative(a,this.settings.negativeSignCharacter);if(this.settings.currencySymbolPlacement===B.options.currencySymbolPlacement.prefix&&this.settings.negativePositiveSignPlacement===B.options.negativePositiveSignPlacement.suffix&&(this.eventKey===d.keyName.Backspace?(this.caretFix=this.selection.start>=a.indexOf(this.settings.suffixText)&&""!==this.settings.suffixText,"-"===a.charAt(this.selection.start-1)?i=i.substring(1):this.selection.start<=a.length-this.settings.suffixText.length&&(i=i.substring(0,i.length-1))):(this.caretFix=this.selection.start>=a.indexOf(this.settings.suffixText)&&""!==this.settings.suffixText,this.selection.start>=a.indexOf(this.settings.currencySymbol)+this.settings.currencySymbol.length&&(n=n.substring(1,n.length)),M.isNegative(i,this.settings.negativeSignCharacter)&&"-"===a.charAt(this.selection.start)&&(i=i.substring(1)))),this.settings.currencySymbolPlacement===B.options.currencySymbolPlacement.suffix)switch(this.settings.negativePositiveSignPlacement){case B.options.negativePositiveSignPlacement.left:this.caretFix=this.selection.start>=a.indexOf(this.settings.negativeSignCharacter)+this.settings.negativeSignCharacter.length,this.eventKey===d.keyName.Backspace?this.selection.start===a.indexOf(this.settings.negativeSignCharacter)+this.settings.negativeSignCharacter.length&&r?i=i.substring(1):"-"!==i&&(this.selection.start<=a.indexOf(this.settings.negativeSignCharacter)||!r)&&(i=i.substring(0,i.length-1)):("-"===i[0]&&(n=n.substring(1)),this.selection.start===a.indexOf(this.settings.negativeSignCharacter)&&r&&(i=i.substring(1)));break;case B.options.negativePositiveSignPlacement.right:this.caretFix=this.selection.start>=a.indexOf(this.settings.negativeSignCharacter)+this.settings.negativeSignCharacter.length,this.eventKey===d.keyName.Backspace?this.selection.start===a.indexOf(this.settings.negativeSignCharacter)+this.settings.negativeSignCharacter.length?i=i.substring(1):("-"!==i&&this.selection.start<=a.indexOf(this.settings.negativeSignCharacter)-this.settings.currencySymbol.length||""!==i&&!r)&&(i=i.substring(0,i.length-1)):(this.caretFix=this.selection.start>=a.indexOf(this.settings.currencySymbol)&&""!==this.settings.currencySymbol,this.selection.start===a.indexOf(this.settings.negativeSignCharacter)&&(i=i.substring(1)),n=n.substring(1))}return[i,n]}},{key:"_processCharacterDeletion",value:function(){var e,t;if(this.selection.length){this._expandSelectionOnSign();var i=S(this._getUnformattedLeftAndRightPartAroundTheSelection(),2);e=i[0],t=i[1]}else{var n=S(this._getUnformattedLeftAndRightPartAroundTheSelection(),2);if(e=n[0],t=n[1],""===e&&""===t&&(this.throwInput=!1),this.isTrailingNegative&&M.isNegative(M.getElementValue(this.domElement),this.settings.negativeSignCharacter)){var a=S(this._processCharacterDeletionIfTrailingNegativeSign([e,t]),2);e=a[0],t=a[1]}else this.eventKey===d.keyName.Backspace?e=e.substring(0,e.length-1):t=t.substring(1,t.length)}return!!this.constructor._isWithinRangeWithOverrideOption("".concat(e).concat(t),this.settings)&&(this._setValueParts(e,t),!0)}},{key:"_isDecimalCharacterInsertionAllowed",value:function(){return String(this.settings.decimalPlacesShownOnFocus)!==String(B.options.decimalPlacesShownOnFocus.none)&&String(this.settings.decimalPlaces)!==String(B.options.decimalPlaces.none)}},{key:"_processCharacterInsertion",value:function(){var e=S(this._getUnformattedLeftAndRightPartAroundTheSelection(),2),t=e[0],i=e[1];if(this.eventKey!==d.keyName.AndroidDefault&&(this.throwInput=!0),this.eventKey===this.settings.decimalCharacter||this.settings.decimalCharacterAlternative&&this.eventKey===this.settings.decimalCharacterAlternative){if(!this._isDecimalCharacterInsertionAllowed()||!this.settings.decimalCharacter)return!1;if(this.settings.alwaysAllowDecimalCharacter)t=t.replace(this.settings.decimalCharacter,""),i=i.replace(this.settings.decimalCharacter,"");else{if(M.contains(t,this.settings.decimalCharacter))return!0;if(0<i.indexOf(this.settings.decimalCharacter))return!0;0===i.indexOf(this.settings.decimalCharacter)&&(i=i.substr(1))}return this.settings.negativeSignCharacter&&M.contains(i,this.settings.negativeSignCharacter)&&(t="".concat(this.settings.negativeSignCharacter).concat(t),i=i.replace(this.settings.negativeSignCharacter,"")),this._setValueParts(t+this.settings.decimalCharacter,i),!0}if(("-"===this.eventKey||"+"===this.eventKey)&&this.settings.isNegativeSignAllowed)return""===t&&M.contains(i,"-")?i=i.replace("-",""):t=M.isNegativeStrict(t,"-")?t.replace("-",""):"".concat(this.settings.negativeSignCharacter).concat(t),this._setValueParts(t,i),!0;var n=Number(this.eventKey);return 0<=n&&n<=9?(this.settings.isNegativeSignAllowed&&""===t&&M.contains(i,"-")&&(t="-",i=i.substring(1,i.length)),this.settings.maximumValue<=0&&this.settings.minimumValue<this.settings.maximumValue&&!M.contains(M.getElementValue(this.domElement),this.settings.negativeSignCharacter)&&"0"!==this.eventKey&&(t="-".concat(t)),this._setValueParts("".concat(t).concat(this.eventKey),i),!0):this.throwInput=!1}},{key:"_formatValue",value:function(e){var t=M.getElementValue(this.domElement),i=S(this._getUnformattedLeftAndRightPartAroundTheSelection(),1)[0];if((""===this.settings.digitGroupSeparator||""!==this.settings.digitGroupSeparator&&!M.contains(t,this.settings.digitGroupSeparator))&&(""===this.settings.currencySymbol||""!==this.settings.currencySymbol&&!M.contains(t,this.settings.currencySymbol))){var n=S(t.split(this.settings.decimalCharacter),1)[0],a="";M.isNegative(n,this.settings.negativeSignCharacter)&&(a=this.settings.negativeSignCharacter,n=n.replace(this.settings.negativeSignCharacter,""),i=i.replace("-","")),""===a&&n.length>this.settings.mIntPos&&"0"===i.charAt(0)&&(i=i.slice(1)),a===this.settings.negativeSignCharacter&&n.length>this.settings.mIntNeg&&"0"===i.charAt(0)&&(i=i.slice(1)),this.isTrailingNegative||(i="".concat(a).concat(i))}var r=this.constructor._addGroupSeparators(t,this.settings,this.isFocused,this.rawValue),s=r.length;if(r){var o,l=i.split("");if((this.settings.negativePositiveSignPlacement===B.options.negativePositiveSignPlacement.suffix||this.settings.negativePositiveSignPlacement!==B.options.negativePositiveSignPlacement.prefix&&this.settings.currencySymbolPlacement===B.options.currencySymbolPlacement.suffix)&&l[0]===this.settings.negativeSignCharacter&&!this.settings.isNegativeSignAllowed&&(l.shift(),(this.eventKey===d.keyName.Backspace||this.eventKey===d.keyName.Delete)&&this.caretFix&&((this.settings.currencySymbolPlacement===B.options.currencySymbolPlacement.suffix&&this.settings.negativePositiveSignPlacement===B.options.negativePositiveSignPlacement.left||this.settings.currencySymbolPlacement===B.options.currencySymbolPlacement.prefix&&this.settings.negativePositiveSignPlacement===B.options.negativePositiveSignPlacement.suffix)&&(l.push(this.settings.negativeSignCharacter),this.caretFix="keydown"===e.type),this.settings.currencySymbolPlacement===B.options.currencySymbolPlacement.suffix&&this.settings.negativePositiveSignPlacement===B.options.negativePositiveSignPlacement.right))){var u=this.settings.currencySymbol.split(""),c=["\\","^","$",".","|","?","*","+","(",")","["],h=[];u.forEach(function(e,t){t=u[e],M.isInArray(t,c)?h.push("\\"+t):h.push(t)}),this.eventKey===d.keyName.Backspace&&"-"===this.settings.negativeSignCharacter&&h.push("-"),l.push(h.join("")),this.caretFix="keydown"===e.type}for(var m=0;m<l.length;m++)l[m].match("\\d")||(l[m]="\\"+l[m]);o=this.settings.currencySymbolPlacement===B.options.currencySymbolPlacement.suffix?new RegExp("^.*?".concat(l.join(".*?"))):new RegExp("^.*?".concat(this.settings.currencySymbol).concat(l.join(".*?")));var g=r.match(o);g?(s=g[0].length,this.settings.showPositiveSign&&(0===s&&g.input.charAt(0)===this.settings.positiveSignCharacter&&(s=1===g.input.indexOf(this.settings.currencySymbol)?this.settings.currencySymbol.length+1:1),0===s&&g.input.charAt(this.settings.currencySymbol.length)===this.settings.positiveSignCharacter&&(s=this.settings.currencySymbol.length+1)),(0===s&&r.charAt(0)!==this.settings.negativeSignCharacter||1===s&&r.charAt(0)===this.settings.negativeSignCharacter)&&this.settings.currencySymbol&&this.settings.currencySymbolPlacement===B.options.currencySymbolPlacement.prefix&&(s=this.settings.currencySymbol.length+(M.isNegativeStrict(r,this.settings.negativeSignCharacter)?1:0))):(this.settings.currencySymbol&&this.settings.currencySymbolPlacement===B.options.currencySymbolPlacement.suffix&&(s-=this.settings.currencySymbol.length),this.settings.suffixText&&(s-=this.settings.suffixText.length))}r!==t&&(this._setElementValue(r,!1),this._setCaretPosition(s)),this.formatted=!0}}]),P(e,t),B}();function N(e,t){t=t||{bubbles:!1,cancelable:!1,detail:void 0};var i=document.createEvent("CustomEvent");return i.initCustomEvent(e,t.bubbles,t.cancelable,t.detail),i}k.multiple=function(e){var i=1<arguments.length&&void 0!==arguments[1]?arguments[1]:null,t=2<arguments.length&&void 0!==arguments[2]?arguments[2]:null,n=[];if(M.isObject(i)&&(t=i,i=null),M.isString(e))e=p(document.querySelectorAll(e));else if(M.isObject(e)){Object.prototype.hasOwnProperty.call(e,"rootElement")||M.throwError("The object passed to the 'multiple' function is invalid ; no 'rootElement' attribute found.");var a=p(e.rootElement.querySelectorAll("input"));e=Object.prototype.hasOwnProperty.call(e,"exclude")?(Array.isArray(e.exclude)||M.throwError("The 'exclude' array passed to the 'multiple' function is invalid."),M.filterOut(a,e.exclude)):a}else M.isArray(e)||M.throwError("The given parameters to the 'multiple' function are invalid.");if(0===e.length){var r=!0;return!M.isNull(t)&&M.isBoolean(t.showWarnings)&&(r=t.showWarnings),M.warning("No valid DOM elements were given hence no AutoNumeric objects were instantiated.",r),[]}var s=M.isArray(i)&&1<=i.length,o=!1,l=!1;if(s){var u=w(Number(i[0]));(o="number"===u&&!isNaN(Number(i[0])))||"string"!==u&&!isNaN(u)&&"object"!==u||(l=!0)}var c,h=!1;if(M.isArray(t)&&1<=t.length){var m=w(t[0]);"string"!==m&&"object"!==m||(h=!0)}c=l?k.mergeOptions(i):h?k.mergeOptions(t):t;var g,d=M.isNumber(i);return o&&(g=i.length),e.forEach(function(e,t){d?n.push(new k(e,i,c)):o&&t<=g?n.push(new k(e,i[t],c)):n.push(new k(e,null,c))}),n},Array.from||(Array.from=function(e){return[].slice.call(e)}),"undefined"!=typeof window&&"function"!=typeof window.CustomEvent&&(N.prototype=window.Event.prototype,window.CustomEvent=N),k.events={correctedValue:"autoNumeric:correctedValue",initialized:"autoNumeric:initialized",invalidFormula:"autoNumeric:invalidFormula",invalidValue:"autoNumeric:invalidValue",formatted:"autoNumeric:formatted",rawValueModified:"autoNumeric:rawValueModified",minRangeExceeded:"autoNumeric:minExceeded",maxRangeExceeded:"autoNumeric:maxExceeded",native:{input:"input",change:"change"},validFormula:"autoNumeric:validFormula"},Object.freeze(k.events.native),Object.freeze(k.events),Object.defineProperty(k,"events",{configurable:!1,writable:!1}),k.options={allowDecimalPadding:{always:!0,never:!1,floats:"floats"},alwaysAllowDecimalCharacter:{alwaysAllow:!0,doNotAllow:!1},caretPositionOnFocus:{start:"start",end:"end",decimalLeft:"decimalLeft",decimalRight:"decimalRight",doNoForceCaretPosition:null},createLocalList:{createList:!0,doNotCreateList:!1},currencySymbol:{none:"",currencySign:"¤",austral:"₳",australCentavo:"¢",baht:"฿",cedi:"₵",cent:"¢",colon:"₡",cruzeiro:"₢",dollar:"$",dong:"₫",drachma:"₯",dram:"​֏",european:"₠",euro:"€",florin:"ƒ",franc:"₣",guarani:"₲",hryvnia:"₴",kip:"₭",att:"ອັດ",lepton:"Λ.",lira:"₺",liraOld:"₤",lari:"₾",mark:"ℳ",mill:"₥",naira:"₦",peseta:"₧",peso:"₱",pfennig:"₰",pound:"£",real:"R$",riel:"៛",ruble:"₽",rupee:"₹",rupeeOld:"₨",shekel:"₪",shekelAlt:"ש״ח‎‎",taka:"৳",tenge:"₸",togrog:"₮",won:"₩",yen:"¥"},currencySymbolPlacement:{prefix:"p",suffix:"s"},decimalCharacter:{comma:",",dot:".",middleDot:"·",arabicDecimalSeparator:"٫",decimalSeparatorKeySymbol:"⎖"},decimalCharacterAlternative:{none:null,comma:",",dot:"."},decimalPlaces:{none:0,one:1,two:2,three:3,four:4,five:5,six:6},decimalPlacesRawValue:{useDefault:null,none:0,one:1,two:2,three:3,four:4,five:5,six:6},decimalPlacesShownOnBlur:{useDefault:null,none:0,one:1,two:2,three:3,four:4,five:5,six:6},decimalPlacesShownOnFocus:{useDefault:null,none:0,one:1,two:2,three:3,four:4,five:5,six:6},defaultValueOverride:{doNotOverride:null},digitalGroupSpacing:{two:"2",twoScaled:"2s",three:"3",four:"4"},digitGroupSeparator:{comma:",",dot:".",normalSpace:" ",thinSpace:" ",narrowNoBreakSpace:" ",noBreakSpace:" ",noSeparator:"",apostrophe:"'",arabicThousandsSeparator:"٬",dotAbove:"˙",privateUseTwo:"’"},divisorWhenUnfocused:{none:null,percentage:100,permille:1e3,basisPoint:1e4},emptyInputBehavior:{focus:"focus",press:"press",always:"always",zero:"zero",min:"min",max:"max",null:"null"},eventBubbles:{bubbles:!0,doesNotBubble:!1},eventIsCancelable:{isCancelable:!0,isNotCancelable:!1},failOnUnknownOption:{fail:!0,ignore:!1},formatOnPageLoad:{format:!0,doNotFormat:!1},formulaMode:{enabled:!0,disabled:!1},historySize:{verySmall:5,small:10,medium:20,large:50,veryLarge:100,insane:Number.MAX_SAFE_INTEGER},invalidClass:"an-invalid",isCancellable:{cancellable:!0,notCancellable:!1},leadingZero:{allow:"allow",deny:"deny",keep:"keep"},maximumValue:{tenTrillions:"10000000000000",oneBillion:"1000000000",zero:"0"},minimumValue:{tenTrillions:"-10000000000000",oneBillion:"-1000000000",zero:"0"},modifyValueOnWheel:{modifyValue:!0,doNothing:!1},negativeBracketsTypeOnBlur:{parentheses:"(,)",brackets:"[,]",chevrons:"<,>",curlyBraces:"{,}",angleBrackets:"〈,〉",japaneseQuotationMarks:"｢,｣",halfBrackets:"⸤,⸥",whiteSquareBrackets:"⟦,⟧",quotationMarks:"‹,›",guillemets:"«,»",none:null},negativePositiveSignPlacement:{prefix:"p",suffix:"s",left:"l",right:"r",none:null},negativeSignCharacter:{hyphen:"-",minus:"−",heavyMinus:"➖",fullWidthHyphen:"－",circledMinus:"⊖",squaredMinus:"⊟",triangleMinus:"⨺",plusMinus:"±",minusPlus:"∓",dotMinus:"∸",minusTilde:"≂",not:"¬"},noEventListeners:{noEvents:!0,addEvents:!1},onInvalidPaste:{error:"error",ignore:"ignore",clamp:"clamp",truncate:"truncate",replace:"replace"},outputFormat:{string:"string",number:"number",dot:".",negativeDot:"-.",comma:",",negativeComma:"-,",dotNegative:".-",commaNegative:",-",none:null},overrideMinMaxLimits:{ceiling:"ceiling",floor:"floor",ignore:"ignore",invalid:"invalid",doNotOverride:null},positiveSignCharacter:{plus:"+",fullWidthPlus:"＋",heavyPlus:"➕",doublePlus:"⧺",triplePlus:"⧻",circledPlus:"⊕",squaredPlus:"⊞",trianglePlus:"⨹",plusMinus:"±",minusPlus:"∓",dotPlus:"∔",altHebrewPlus:"﬩",normalSpace:" ",thinSpace:" ",narrowNoBreakSpace:" ",noBreakSpace:" "},rawValueDivisor:{none:null,percentage:100,permille:1e3,basisPoint:1e4},readOnly:{readOnly:!0,readWrite:!1},roundingMethod:{halfUpSymmetric:"S",halfUpAsymmetric:"A",halfDownSymmetric:"s",halfDownAsymmetric:"a",halfEvenBankersRounding:"B",upRoundAwayFromZero:"U",downRoundTowardZero:"D",toCeilingTowardPositiveInfinity:"C",toFloorTowardNegativeInfinity:"F",toNearest05:"N05",toNearest05Alt:"CHF",upToNext05:"U05",downToNext05:"D05"},saveValueToSessionStorage:{save:!0,doNotSave:!1},selectNumberOnly:{selectNumbersOnly:!0,selectAll:!1},selectOnFocus:{select:!0,doNotSelect:!1},serializeSpaces:{plus:"+",percent:"%20"},showOnlyNumbersOnFocus:{onlyNumbers:!0,showAll:!1},showPositiveSign:{show:!0,hide:!1},showWarnings:{show:!0,hide:!1},styleRules:{none:null,positiveNegative:{positive:"autoNumeric-positive",negative:"autoNumeric-negative"},range0To100With4Steps:{ranges:[{min:0,max:25,class:"autoNumeric-red"},{min:25,max:50,class:"autoNumeric-orange"},{min:50,max:75,class:"autoNumeric-yellow"},{min:75,max:100,class:"autoNumeric-green"}]},evenOdd:{userDefined:[{callback:function(e){return e%2==0},classes:["autoNumeric-even","autoNumeric-odd"]}]},rangeSmallAndZero:{userDefined:[{callback:function(e){return-1<=e&&e<0?0:0===Number(e)?1:0<e&&e<=1?2:null},classes:["autoNumeric-small-negative","autoNumeric-zero","autoNumeric-small-positive"]}]}},suffixText:{none:"",percentage:"%",permille:"‰",basisPoint:"‱"},symbolWhenUnfocused:{none:null,percentage:"%",permille:"‰",basisPoint:"‱"},unformatOnHover:{unformat:!0,doNotUnformat:!1},unformatOnSubmit:{unformat:!0,keepCurrentValue:!1},valuesToStrings:{none:null,zeroDash:{0:"-"},oneAroundZero:{"-1":"Min",1:"Max"}},watchExternalChanges:{watch:!0,doNotWatch:!1},wheelOn:{focus:"focus",hover:"hover"},wheelStep:{progressive:"progressive"}},O=k.options,Object.getOwnPropertyNames(O).forEach(function(e){"valuesToStrings"===e?Object.getOwnPropertyNames(O.valuesToStrings).forEach(function(e){M.isIE11()||null===O.valuesToStrings[e]||Object.freeze(O.valuesToStrings[e])}):"styleRules"!==e&&(M.isIE11()||null===O[e]||Object.freeze(O[e]))}),Object.freeze(O),Object.defineProperty(k,"options",{configurable:!1,writable:!1}),k.defaultSettings={allowDecimalPadding:k.options.allowDecimalPadding.always,alwaysAllowDecimalCharacter:k.options.alwaysAllowDecimalCharacter.doNotAllow,caretPositionOnFocus:k.options.caretPositionOnFocus.doNoForceCaretPosition,createLocalList:k.options.createLocalList.createList,currencySymbol:k.options.currencySymbol.none,currencySymbolPlacement:k.options.currencySymbolPlacement.prefix,decimalCharacter:k.options.decimalCharacter.dot,decimalCharacterAlternative:k.options.decimalCharacterAlternative.none,decimalPlaces:k.options.decimalPlaces.two,decimalPlacesRawValue:k.options.decimalPlacesRawValue.useDefault,decimalPlacesShownOnBlur:k.options.decimalPlacesShownOnBlur.useDefault,decimalPlacesShownOnFocus:k.options.decimalPlacesShownOnFocus.useDefault,defaultValueOverride:k.options.defaultValueOverride.doNotOverride,digitalGroupSpacing:k.options.digitalGroupSpacing.three,digitGroupSeparator:k.options.digitGroupSeparator.comma,divisorWhenUnfocused:k.options.divisorWhenUnfocused.none,emptyInputBehavior:k.options.emptyInputBehavior.focus,eventBubbles:k.options.eventBubbles.bubbles,eventIsCancelable:k.options.eventIsCancelable.isCancelable,failOnUnknownOption:k.options.failOnUnknownOption.ignore,formatOnPageLoad:k.options.formatOnPageLoad.format,formulaMode:k.options.formulaMode.disabled,historySize:k.options.historySize.medium,invalidClass:k.options.invalidClass,isCancellable:k.options.isCancellable.cancellable,leadingZero:k.options.leadingZero.deny,maximumValue:k.options.maximumValue.tenTrillions,minimumValue:k.options.minimumValue.tenTrillions,modifyValueOnWheel:k.options.modifyValueOnWheel.modifyValue,negativeBracketsTypeOnBlur:k.options.negativeBracketsTypeOnBlur.none,negativePositiveSignPlacement:k.options.negativePositiveSignPlacement.none,negativeSignCharacter:k.options.negativeSignCharacter.hyphen,noEventListeners:k.options.noEventListeners.addEvents,onInvalidPaste:k.options.onInvalidPaste.error,outputFormat:k.options.outputFormat.none,overrideMinMaxLimits:k.options.overrideMinMaxLimits.doNotOverride,positiveSignCharacter:k.options.positiveSignCharacter.plus,rawValueDivisor:k.options.rawValueDivisor.none,readOnly:k.options.readOnly.readWrite,roundingMethod:k.options.roundingMethod.halfUpSymmetric,saveValueToSessionStorage:k.options.saveValueToSessionStorage.doNotSave,selectNumberOnly:k.options.selectNumberOnly.selectNumbersOnly,selectOnFocus:k.options.selectOnFocus.select,serializeSpaces:k.options.serializeSpaces.plus,showOnlyNumbersOnFocus:k.options.showOnlyNumbersOnFocus.showAll,showPositiveSign:k.options.showPositiveSign.hide,showWarnings:k.options.showWarnings.show,styleRules:k.options.styleRules.none,suffixText:k.options.suffixText.none,symbolWhenUnfocused:k.options.symbolWhenUnfocused.none,unformatOnHover:k.options.unformatOnHover.unformat,unformatOnSubmit:k.options.unformatOnSubmit.keepCurrentValue,valuesToStrings:k.options.valuesToStrings.none,watchExternalChanges:k.options.watchExternalChanges.doNotWatch,wheelOn:k.options.wheelOn.focus,wheelStep:k.options.wheelStep.progressive},Object.freeze(k.defaultSettings),Object.defineProperty(k,"defaultSettings",{configurable:!1,writable:!1});var E={digitGroupSeparator:k.options.digitGroupSeparator.dot,decimalCharacter:k.options.decimalCharacter.comma,decimalCharacterAlternative:k.options.decimalCharacterAlternative.dot,currencySymbol:" €",currencySymbolPlacement:k.options.currencySymbolPlacement.suffix,negativePositiveSignPlacement:k.options.negativePositiveSignPlacement.prefix},_={digitGroupSeparator:k.options.digitGroupSeparator.comma,decimalCharacter:k.options.decimalCharacter.dot,currencySymbol:k.options.currencySymbol.dollar,currencySymbolPlacement:k.options.currencySymbolPlacement.prefix,negativePositiveSignPlacement:k.options.negativePositiveSignPlacement.right},C={digitGroupSeparator:k.options.digitGroupSeparator.comma,decimalCharacter:k.options.decimalCharacter.dot,currencySymbol:k.options.currencySymbol.yen,currencySymbolPlacement:k.options.currencySymbolPlacement.prefix,negativePositiveSignPlacement:k.options.negativePositiveSignPlacement.right};M.cloneObject(E).formulaMode=k.options.formulaMode.enabled;var F=M.cloneObject(E);F.minimumValue=0;var x=M.cloneObject(E);x.maximumValue=0,x.negativePositiveSignPlacement=k.options.negativePositiveSignPlacement.prefix;var V=M.cloneObject(E);V.digitGroupSeparator=k.options.digitGroupSeparator.normalSpace;var T=M.cloneObject(V);T.minimumValue=0;var A=M.cloneObject(V);A.maximumValue=0,A.negativePositiveSignPlacement=k.options.negativePositiveSignPlacement.prefix;var L=M.cloneObject(E);L.currencySymbol=k.options.currencySymbol.none,L.suffixText=" ".concat(k.options.suffixText.percentage),L.wheelStep=1e-4,L.rawValueDivisor=k.options.rawValueDivisor.percentage;var I=M.cloneObject(L);I.minimumValue=0;var B=M.cloneObject(L);B.maximumValue=0,B.negativePositiveSignPlacement=k.options.negativePositiveSignPlacement.prefix;var D=M.cloneObject(L);D.decimalPlaces=3;var R=M.cloneObject(I);R.decimalPlaces=3;var U=M.cloneObject(B);U.decimalPlaces=3,M.cloneObject(_).formulaMode=k.options.formulaMode.enabled;var j=M.cloneObject(_);j.minimumValue=0;var z=M.cloneObject(_);z.maximumValue=0,z.negativePositiveSignPlacement=k.options.negativePositiveSignPlacement.prefix;var K=M.cloneObject(z);K.negativeBracketsTypeOnBlur=k.options.negativeBracketsTypeOnBlur.parentheses;var G=M.cloneObject(_);G.currencySymbol=k.options.currencySymbol.none,G.suffixText=k.options.suffixText.percentage,G.wheelStep=1e-4,G.rawValueDivisor=k.options.rawValueDivisor.percentage;var W=M.cloneObject(G);W.minimumValue=0;var H=M.cloneObject(G);H.maximumValue=0,H.negativePositiveSignPlacement=k.options.negativePositiveSignPlacement.prefix;var Z=M.cloneObject(G);Z.decimalPlaces=3;var q=M.cloneObject(W);q.decimalPlaces=3;var $=M.cloneObject(H);$.decimalPlaces=3;var J=M.cloneObject(E);J.currencySymbol=k.options.currencySymbol.lira,k.predefinedOptions={euro:E,euroPos:F,euroNeg:x,euroSpace:V,euroSpacePos:T,euroSpaceNeg:A,percentageEU2dec:L,percentageEU2decPos:I,percentageEU2decNeg:B,percentageEU3dec:D,percentageEU3decPos:R,percentageEU3decNeg:U,dollar:_,dollarPos:j,dollarNeg:z,dollarNegBrackets:K,percentageUS2dec:G,percentageUS2decPos:W,percentageUS2decNeg:H,percentageUS3dec:Z,percentageUS3decPos:q,percentageUS3decNeg:$,French:E,Spanish:E,NorthAmerican:_,British:{digitGroupSeparator:k.options.digitGroupSeparator.comma,decimalCharacter:k.options.decimalCharacter.dot,currencySymbol:k.options.currencySymbol.pound,currencySymbolPlacement:k.options.currencySymbolPlacement.prefix,negativePositiveSignPlacement:k.options.negativePositiveSignPlacement.right},Swiss:{digitGroupSeparator:k.options.digitGroupSeparator.apostrophe,decimalCharacter:k.options.decimalCharacter.dot,currencySymbol:" CHF",currencySymbolPlacement:k.options.currencySymbolPlacement.suffix,negativePositiveSignPlacement:k.options.negativePositiveSignPlacement.prefix},Japanese:C,Chinese:C,Brazilian:{digitGroupSeparator:k.options.digitGroupSeparator.dot,decimalCharacter:k.options.decimalCharacter.comma,currencySymbol:k.options.currencySymbol.real,currencySymbolPlacement:k.options.currencySymbolPlacement.prefix,negativePositiveSignPlacement:k.options.negativePositiveSignPlacement.right},Turkish:J,dotDecimalCharCommaSeparator:{digitGroupSeparator:k.options.digitGroupSeparator.comma,decimalCharacter:k.options.decimalCharacter.dot},commaDecimalCharDotSeparator:{digitGroupSeparator:k.options.digitGroupSeparator.dot,decimalCharacter:k.options.decimalCharacter.comma,decimalCharacterAlternative:k.options.decimalCharacterAlternative.dot},integer:{decimalPlaces:0},integerPos:{minimumValue:k.options.minimumValue.zero,decimalPlaces:0},integerNeg:{maximumValue:k.options.maximumValue.zero,decimalPlaces:0},float:{allowDecimalPadding:k.options.allowDecimalPadding.never},floatPos:{allowDecimalPadding:k.options.allowDecimalPadding.never,minimumValue:k.options.minimumValue.zero,maximumValue:k.options.maximumValue.tenTrillions},floatNeg:{allowDecimalPadding:k.options.allowDecimalPadding.never,minimumValue:k.options.minimumValue.tenTrillions,maximumValue:k.options.maximumValue.zero},numeric:{digitGroupSeparator:k.options.digitGroupSeparator.noSeparator,decimalCharacter:k.options.decimalCharacter.dot,currencySymbol:k.options.currencySymbol.none},numericPos:{digitGroupSeparator:k.options.digitGroupSeparator.noSeparator,decimalCharacter:k.options.decimalCharacter.dot,currencySymbol:k.options.currencySymbol.none,minimumValue:k.options.minimumValue.zero,maximumValue:k.options.maximumValue.tenTrillions},numericNeg:{digitGroupSeparator:k.options.digitGroupSeparator.noSeparator,decimalCharacter:k.options.decimalCharacter.dot,currencySymbol:k.options.currencySymbol.none,minimumValue:k.options.minimumValue.tenTrillions,maximumValue:k.options.maximumValue.zero}},Object.getOwnPropertyNames(k.predefinedOptions).forEach(function(e){Object.freeze(k.predefinedOptions[e])}),Object.freeze(k.predefinedOptions),Object.defineProperty(k,"predefinedOptions",{configurable:!1,writable:!1}),t.default=k}],a.c=n,a.d=function(e,t,i){a.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:i})},a.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},a.t=function(t,e){if(1&e&&(t=a(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var i=Object.create(null);if(a.r(i),Object.defineProperty(i,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var n in t)a.d(i,n,function(e){return t[e]}.bind(null,n));return i},a.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return a.d(t,"a",t),t},a.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},a.p="",a(a.s=0).default;function a(e){if(n[e])return n[e].exports;var t=n[e]={i:e,l:!1,exports:{}};return i[e].call(t.exports,t,t.exports,a),t.l=!0,t.exports}var i,n});

},{}],16:[function(require,module,exports){
'use strict';

var util = require('util');
var isArrayish = require('is-arrayish');

var errorEx = function errorEx(name, properties) {
	if (!name || name.constructor !== String) {
		properties = name || {};
		name = Error.name;
	}

	var errorExError = function ErrorEXError(message) {
		if (!this) {
			return new ErrorEXError(message);
		}

		message = message instanceof Error
			? message.message
			: (message || this.message);

		Error.call(this, message);
		Error.captureStackTrace(this, errorExError);

		this.name = name;

		Object.defineProperty(this, 'message', {
			configurable: true,
			enumerable: false,
			get: function () {
				var newMessage = message.split(/\r?\n/g);

				for (var key in properties) {
					if (!properties.hasOwnProperty(key)) {
						continue;
					}

					var modifier = properties[key];

					if ('message' in modifier) {
						newMessage = modifier.message(this[key], newMessage) || newMessage;
						if (!isArrayish(newMessage)) {
							newMessage = [newMessage];
						}
					}
				}

				return newMessage.join('\n');
			},
			set: function (v) {
				message = v;
			}
		});

		var overwrittenStack = null;

		var stackDescriptor = Object.getOwnPropertyDescriptor(this, 'stack');
		var stackGetter = stackDescriptor.get;
		var stackValue = stackDescriptor.value;
		delete stackDescriptor.value;
		delete stackDescriptor.writable;

		stackDescriptor.set = function (newstack) {
			overwrittenStack = newstack;
		};

		stackDescriptor.get = function () {
			var stack = (overwrittenStack || ((stackGetter)
				? stackGetter.call(this)
				: stackValue)).split(/\r?\n+/g);

			// starting in Node 7, the stack builder caches the message.
			// just replace it.
			if (!overwrittenStack) {
				stack[0] = this.name + ': ' + this.message;
			}

			var lineCount = 1;
			for (var key in properties) {
				if (!properties.hasOwnProperty(key)) {
					continue;
				}

				var modifier = properties[key];

				if ('line' in modifier) {
					var line = modifier.line(this[key]);
					if (line) {
						stack.splice(lineCount++, 0, '    ' + line);
					}
				}

				if ('stack' in modifier) {
					modifier.stack(this[key], stack);
				}
			}

			return stack.join('\n');
		};

		Object.defineProperty(this, 'stack', stackDescriptor);
	};

	if (Object.setPrototypeOf) {
		Object.setPrototypeOf(errorExError.prototype, Error.prototype);
		Object.setPrototypeOf(errorExError, Error);
	} else {
		util.inherits(errorExError, Error);
	}

	return errorExError;
};

errorEx.append = function (str, def) {
	return {
		message: function (v, message) {
			v = v || def;

			if (v) {
				message[0] += ' ' + str.replace('%s', v.toString());
			}

			return message;
		}
	};
};

errorEx.line = function (str, def) {
	return {
		line: function (v) {
			v = v || def;

			if (v) {
				return str.replace('%s', v.toString());
			}

			return null;
		}
	};
};

module.exports = errorEx;

},{"is-arrayish":18,"util":43}],17:[function(require,module,exports){
'use strict';

var matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;

module.exports = function (str) {
	if (typeof str !== 'string') {
		throw new TypeError('Expected a string');
	}

	return str.replace(matchOperatorsRe, '\\$&');
};

},{}],18:[function(require,module,exports){
'use strict';

module.exports = function isArrayish(obj) {
	if (!obj) {
		return false;
	}

	return obj instanceof Array || Array.isArray(obj) ||
		(obj.length >= 0 && obj.splice instanceof Function);
};

},{}],19:[function(require,module,exports){
// Copyright 2014, 2015, 2016, 2017, 2018 Simon Lydell
// License: MIT. (See LICENSE.)

Object.defineProperty(exports, "__esModule", {
  value: true
})

// This regex comes from regex.coffee, and is inserted here by generate-index.js
// (run `npm run build`).
exports.default = /((['"])(?:(?!\2|\\).|\\(?:\r\n|[\s\S]))*(\2)?|`(?:[^`\\$]|\\[\s\S]|\$(?!\{)|\$\{(?:[^{}]|\{[^}]*\}?)*\}?)*(`)?)|(\/\/.*)|(\/\*(?:[^*]|\*(?!\/))*(\*\/)?)|(\/(?!\*)(?:\[(?:(?![\]\\]).|\\.)*\]|(?![\/\]\\]).|\\.)+\/(?:(?!\s*(?:\b|[\u0080-\uFFFF$\\'"~({]|[+\-!](?!=)|\.?\d))|[gmiyus]{1,6}\b(?![\u0080-\uFFFF$\\]|\s*(?:[+\-*%&|^<>!=?({]|\/(?![\/*])))))|(0[xX][\da-fA-F]+|0[oO][0-7]+|0[bB][01]+|(?:\d*\.\d+|\d+\.?)(?:[eE][+-]?\d+)?)|((?!\d)(?:(?!\s)[$\w\u0080-\uFFFF]|\\u[\da-fA-F]{4}|\\u\{[\da-fA-F]+\})+)|(--|\+\+|&&|\|\||=>|\.{3}|(?:[+\-\/%&|^]|\*{1,2}|<{1,2}|>{1,3}|!=?|={1,2})=?|[?~.,:;[\](){}])|(\s+)|(^$|[\s\S])/g

exports.matchToToken = function(match) {
  var token = {type: "invalid", value: match[0], closed: undefined}
       if (match[ 1]) token.type = "string" , token.closed = !!(match[3] || match[4])
  else if (match[ 5]) token.type = "comment"
  else if (match[ 6]) token.type = "comment", token.closed = !!match[7]
  else if (match[ 8]) token.type = "regex"
  else if (match[ 9]) token.type = "number"
  else if (match[10]) token.type = "name"
  else if (match[11]) token.type = "punctuator"
  else if (match[12]) token.type = "whitespace"
  return token
}

},{}],20:[function(require,module,exports){
(function (Buffer){(function (){
'use strict'

const hexify = char => {
  const h = char.charCodeAt(0).toString(16).toUpperCase()
  return '0x' + (h.length % 2 ? '0' : '') + h
}

const parseError = (e, txt, context) => {
  if (!txt) {
    return {
      message: e.message + ' while parsing empty string',
      position: 0,
    }
  }
  const badToken = e.message.match(/^Unexpected token (.) .*position\s+(\d+)/i)
  const errIdx = badToken ? +badToken[2]
    : e.message.match(/^Unexpected end of JSON.*/i) ? txt.length - 1
    : null

  const msg = badToken ? e.message.replace(/^Unexpected token ./, `Unexpected token ${
      JSON.stringify(badToken[1])
    } (${hexify(badToken[1])})`)
    : e.message

  if (errIdx !== null && errIdx !== undefined) {
    const start = errIdx <= context ? 0
      : errIdx - context

    const end = errIdx + context >= txt.length ? txt.length
      : errIdx + context

    const slice = (start === 0 ? '' : '...') +
      txt.slice(start, end) +
      (end === txt.length ? '' : '...')

    const near = txt === slice ? '' : 'near '

    return {
      message: msg + ` while parsing ${near}${JSON.stringify(slice)}`,
      position: errIdx,
    }
  } else {
    return {
      message: msg + ` while parsing '${txt.slice(0, context * 2)}'`,
      position: 0,
    }
  }
}

class JSONParseError extends SyntaxError {
  constructor (er, txt, context, caller) {
    context = context || 20
    const metadata = parseError(er, txt, context)
    super(metadata.message)
    Object.assign(this, metadata)
    this.code = 'EJSONPARSE'
    this.systemError = er
    Error.captureStackTrace(this, caller || this.constructor)
  }
  get name () { return this.constructor.name }
  set name (n) {}
  get [Symbol.toStringTag] () { return this.constructor.name }
}

const kIndent = Symbol.for('indent')
const kNewline = Symbol.for('newline')
// only respect indentation if we got a line break, otherwise squash it
// things other than objects and arrays aren't indented, so ignore those
// Important: in both of these regexps, the $1 capture group is the newline
// or undefined, and the $2 capture group is the indent, or undefined.
const formatRE = /^\s*[{\[]((?:\r?\n)+)([\s\t]*)/
const emptyRE = /^(?:\{\}|\[\])((?:\r?\n)+)?$/

const parseJson = (txt, reviver, context) => {
  const parseText = stripBOM(txt)
  context = context || 20
  try {
    // get the indentation so that we can save it back nicely
    // if the file starts with {" then we have an indent of '', ie, none
    // otherwise, pick the indentation of the next line after the first \n
    // If the pattern doesn't match, then it means no indentation.
    // JSON.stringify ignores symbols, so this is reasonably safe.
    // if the string is '{}' or '[]', then use the default 2-space indent.
    const [, newline = '\n', indent = '  '] = parseText.match(emptyRE) ||
      parseText.match(formatRE) ||
      [, '', '']

    const result = JSON.parse(parseText, reviver)
    if (result && typeof result === 'object') {
      result[kNewline] = newline
      result[kIndent] = indent
    }
    return result
  } catch (e) {
    if (typeof txt !== 'string' && !Buffer.isBuffer(txt)) {
      const isEmptyArray = Array.isArray(txt) && txt.length === 0
      throw Object.assign(new TypeError(
        `Cannot parse ${isEmptyArray ? 'an empty array' : String(txt)}`
      ), {
        code: 'EJSONPARSE',
        systemError: e,
      })
    }

    throw new JSONParseError(e, parseText, context, parseJson)
  }
}

// Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
// because the buffer-to-string conversion in `fs.readFileSync()`
// translates it to FEFF, the UTF-16 BOM.
const stripBOM = txt => String(txt).replace(/^\uFEFF/, '')

module.exports = parseJson
parseJson.JSONParseError = JSONParseError

parseJson.noExceptions = (txt, reviver) => {
  try {
    return JSON.parse(stripBOM(txt), reviver)
  } catch (e) {}
}

}).call(this)}).call(this,{"isBuffer":require("../../../../../../usr/local/lib/node_modules/browserify/node_modules/is-buffer/index.js")})
},{"../../../../../../usr/local/lib/node_modules/browserify/node_modules/is-buffer/index.js":37}],21:[function(require,module,exports){
"use strict";
var LF = '\n';
var CR = '\r';
var LinesAndColumns = (function () {
    function LinesAndColumns(string) {
        this.string = string;
        var offsets = [0];
        for (var offset = 0; offset < string.length;) {
            switch (string[offset]) {
                case LF:
                    offset += LF.length;
                    offsets.push(offset);
                    break;
                case CR:
                    offset += CR.length;
                    if (string[offset] === LF) {
                        offset += LF.length;
                    }
                    offsets.push(offset);
                    break;
                default:
                    offset++;
                    break;
            }
        }
        this.offsets = offsets;
    }
    LinesAndColumns.prototype.locationForIndex = function (index) {
        if (index < 0 || index > this.string.length) {
            return null;
        }
        var line = 0;
        var offsets = this.offsets;
        while (offsets[line + 1] <= index) {
            line++;
        }
        var column = index - offsets[line];
        return { line: line, column: column };
    };
    LinesAndColumns.prototype.indexForLocation = function (location) {
        var line = location.line, column = location.column;
        if (line < 0 || line >= this.offsets.length) {
            return null;
        }
        if (column < 0 || column > this.lengthOfLine(line)) {
            return null;
        }
        return this.offsets[line] + column;
    };
    LinesAndColumns.prototype.lengthOfLine = function (line) {
        var offset = this.offsets[line];
        var nextOffset = line === this.offsets.length - 1 ? this.string.length : this.offsets[line + 1];
        return nextOffset - offset;
    };
    return LinesAndColumns;
}());
exports.__esModule = true;
exports["default"] = LinesAndColumns;

},{}],22:[function(require,module,exports){
'use strict';
const errorEx = require('error-ex');
const fallback = require('json-parse-even-better-errors');
const {default: LinesAndColumns} = require('lines-and-columns');
const {codeFrameColumns} = require('@babel/code-frame');

const JSONError = errorEx('JSONError', {
	fileName: errorEx.append('in %s'),
	codeFrame: errorEx.append('\n\n%s\n')
});

const parseJson = (string, reviver, filename) => {
	if (typeof reviver === 'string') {
		filename = reviver;
		reviver = null;
	}

	try {
		try {
			return JSON.parse(string, reviver);
		} catch (error) {
			fallback(string, reviver);
			throw error;
		}
	} catch (error) {
		error.message = error.message.replace(/\n/g, '');
		const indexMatch = error.message.match(/in JSON at position (\d+) while parsing/);

		const jsonError = new JSONError(error);
		if (filename) {
			jsonError.fileName = filename;
		}

		if (indexMatch && indexMatch.length > 0) {
			const lines = new LinesAndColumns(string);
			const index = Number(indexMatch[1]);
			const location = lines.locationForIndex(index);

			const codeFrame = codeFrameColumns(
				string,
				{start: {line: location.line + 1, column: location.column + 1}},
				{highlightCode: true}
			);

			jsonError.codeFrame = codeFrame;
		}

		throw jsonError;
	}
};

parseJson.JSONError = JSONError;

module.exports = parseJson;

},{"@babel/code-frame":2,"error-ex":16,"json-parse-even-better-errors":20,"lines-and-columns":21}],23:[function(require,module,exports){

/**
 * Array#filter.
 *
 * @param {Array} arr
 * @param {Function} fn
 * @param {Object=} self
 * @return {Array}
 * @throw TypeError
 */

module.exports = function (arr, fn, self) {
  if (arr.filter) return arr.filter(fn, self);
  if (void 0 === arr || null === arr) throw new TypeError;
  if ('function' != typeof fn) throw new TypeError;
  var ret = [];
  for (var i = 0; i < arr.length; i++) {
    if (!hasOwn.call(arr, i)) continue;
    var val = arr[i];
    if (fn.call(self, val, i, arr)) ret.push(val);
  }
  return ret;
};

var hasOwn = Object.prototype.hasOwnProperty;

},{}],24:[function(require,module,exports){
(function (global){(function (){
'use strict';

var filter = require('array-filter');

module.exports = function availableTypedArrays() {
	return filter([
		'BigInt64Array',
		'BigUint64Array',
		'Float32Array',
		'Float64Array',
		'Int16Array',
		'Int32Array',
		'Int8Array',
		'Uint16Array',
		'Uint32Array',
		'Uint8Array',
		'Uint8ClampedArray'
	], function (typedArray) {
		return typeof global[typedArray] === 'function';
	});
};

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"array-filter":23}],25:[function(require,module,exports){
'use strict';

var GetIntrinsic = require('get-intrinsic');

var callBind = require('./');

var $indexOf = callBind(GetIntrinsic('String.prototype.indexOf'));

module.exports = function callBoundIntrinsic(name, allowMissing) {
	var intrinsic = GetIntrinsic(name, !!allowMissing);
	if (typeof intrinsic === 'function' && $indexOf(name, '.prototype.') > -1) {
		return callBind(intrinsic);
	}
	return intrinsic;
};

},{"./":26,"get-intrinsic":31}],26:[function(require,module,exports){
'use strict';

var bind = require('function-bind');
var GetIntrinsic = require('get-intrinsic');

var $apply = GetIntrinsic('%Function.prototype.apply%');
var $call = GetIntrinsic('%Function.prototype.call%');
var $reflectApply = GetIntrinsic('%Reflect.apply%', true) || bind.call($call, $apply);

var $gOPD = GetIntrinsic('%Object.getOwnPropertyDescriptor%', true);
var $defineProperty = GetIntrinsic('%Object.defineProperty%', true);
var $max = GetIntrinsic('%Math.max%');

if ($defineProperty) {
	try {
		$defineProperty({}, 'a', { value: 1 });
	} catch (e) {
		// IE 8 has a broken defineProperty
		$defineProperty = null;
	}
}

module.exports = function callBind(originalFunction) {
	var func = $reflectApply(bind, $call, arguments);
	if ($gOPD && $defineProperty) {
		var desc = $gOPD(func, 'length');
		if (desc.configurable) {
			// original length, plus the receiver, minus any additional arguments (after the receiver)
			$defineProperty(
				func,
				'length',
				{ value: 1 + $max(0, originalFunction.length - (arguments.length - 1)) }
			);
		}
	}
	return func;
};

var applyBind = function applyBind() {
	return $reflectApply(bind, $apply, arguments);
};

if ($defineProperty) {
	$defineProperty(module.exports, 'apply', { value: applyBind });
} else {
	module.exports.apply = applyBind;
}

},{"function-bind":30,"get-intrinsic":31}],27:[function(require,module,exports){
'use strict';

var GetIntrinsic = require('get-intrinsic');

var $gOPD = GetIntrinsic('%Object.getOwnPropertyDescriptor%');
if ($gOPD) {
	try {
		$gOPD([], 'length');
	} catch (e) {
		// IE 8 has a broken gOPD
		$gOPD = null;
	}
}

module.exports = $gOPD;

},{"get-intrinsic":31}],28:[function(require,module,exports){

var hasOwn = Object.prototype.hasOwnProperty;
var toString = Object.prototype.toString;

module.exports = function forEach (obj, fn, ctx) {
    if (toString.call(fn) !== '[object Function]') {
        throw new TypeError('iterator must be a function');
    }
    var l = obj.length;
    if (l === +l) {
        for (var i = 0; i < l; i++) {
            fn.call(ctx, obj[i], i, obj);
        }
    } else {
        for (var k in obj) {
            if (hasOwn.call(obj, k)) {
                fn.call(ctx, obj[k], k, obj);
            }
        }
    }
};


},{}],29:[function(require,module,exports){
'use strict';

/* eslint no-invalid-this: 1 */

var ERROR_MESSAGE = 'Function.prototype.bind called on incompatible ';
var slice = Array.prototype.slice;
var toStr = Object.prototype.toString;
var funcType = '[object Function]';

module.exports = function bind(that) {
    var target = this;
    if (typeof target !== 'function' || toStr.call(target) !== funcType) {
        throw new TypeError(ERROR_MESSAGE + target);
    }
    var args = slice.call(arguments, 1);

    var bound;
    var binder = function () {
        if (this instanceof bound) {
            var result = target.apply(
                this,
                args.concat(slice.call(arguments))
            );
            if (Object(result) === result) {
                return result;
            }
            return this;
        } else {
            return target.apply(
                that,
                args.concat(slice.call(arguments))
            );
        }
    };

    var boundLength = Math.max(0, target.length - args.length);
    var boundArgs = [];
    for (var i = 0; i < boundLength; i++) {
        boundArgs.push('$' + i);
    }

    bound = Function('binder', 'return function (' + boundArgs.join(',') + '){ return binder.apply(this,arguments); }')(binder);

    if (target.prototype) {
        var Empty = function Empty() {};
        Empty.prototype = target.prototype;
        bound.prototype = new Empty();
        Empty.prototype = null;
    }

    return bound;
};

},{}],30:[function(require,module,exports){
'use strict';

var implementation = require('./implementation');

module.exports = Function.prototype.bind || implementation;

},{"./implementation":29}],31:[function(require,module,exports){
'use strict';

var undefined;

var $SyntaxError = SyntaxError;
var $Function = Function;
var $TypeError = TypeError;

// eslint-disable-next-line consistent-return
var getEvalledConstructor = function (expressionSyntax) {
	try {
		return $Function('"use strict"; return (' + expressionSyntax + ').constructor;')();
	} catch (e) {}
};

var $gOPD = Object.getOwnPropertyDescriptor;
if ($gOPD) {
	try {
		$gOPD({}, '');
	} catch (e) {
		$gOPD = null; // this is IE 8, which has a broken gOPD
	}
}

var throwTypeError = function () {
	throw new $TypeError();
};
var ThrowTypeError = $gOPD
	? (function () {
		try {
			// eslint-disable-next-line no-unused-expressions, no-caller, no-restricted-properties
			arguments.callee; // IE 8 does not throw here
			return throwTypeError;
		} catch (calleeThrows) {
			try {
				// IE 8 throws on Object.getOwnPropertyDescriptor(arguments, '')
				return $gOPD(arguments, 'callee').get;
			} catch (gOPDthrows) {
				return throwTypeError;
			}
		}
	}())
	: throwTypeError;

var hasSymbols = require('has-symbols')();

var getProto = Object.getPrototypeOf || function (x) { return x.__proto__; }; // eslint-disable-line no-proto

var needsEval = {};

var TypedArray = typeof Uint8Array === 'undefined' ? undefined : getProto(Uint8Array);

var INTRINSICS = {
	'%AggregateError%': typeof AggregateError === 'undefined' ? undefined : AggregateError,
	'%Array%': Array,
	'%ArrayBuffer%': typeof ArrayBuffer === 'undefined' ? undefined : ArrayBuffer,
	'%ArrayIteratorPrototype%': hasSymbols ? getProto([][Symbol.iterator]()) : undefined,
	'%AsyncFromSyncIteratorPrototype%': undefined,
	'%AsyncFunction%': needsEval,
	'%AsyncGenerator%': needsEval,
	'%AsyncGeneratorFunction%': needsEval,
	'%AsyncIteratorPrototype%': needsEval,
	'%Atomics%': typeof Atomics === 'undefined' ? undefined : Atomics,
	'%BigInt%': typeof BigInt === 'undefined' ? undefined : BigInt,
	'%Boolean%': Boolean,
	'%DataView%': typeof DataView === 'undefined' ? undefined : DataView,
	'%Date%': Date,
	'%decodeURI%': decodeURI,
	'%decodeURIComponent%': decodeURIComponent,
	'%encodeURI%': encodeURI,
	'%encodeURIComponent%': encodeURIComponent,
	'%Error%': Error,
	'%eval%': eval, // eslint-disable-line no-eval
	'%EvalError%': EvalError,
	'%Float32Array%': typeof Float32Array === 'undefined' ? undefined : Float32Array,
	'%Float64Array%': typeof Float64Array === 'undefined' ? undefined : Float64Array,
	'%FinalizationRegistry%': typeof FinalizationRegistry === 'undefined' ? undefined : FinalizationRegistry,
	'%Function%': $Function,
	'%GeneratorFunction%': needsEval,
	'%Int8Array%': typeof Int8Array === 'undefined' ? undefined : Int8Array,
	'%Int16Array%': typeof Int16Array === 'undefined' ? undefined : Int16Array,
	'%Int32Array%': typeof Int32Array === 'undefined' ? undefined : Int32Array,
	'%isFinite%': isFinite,
	'%isNaN%': isNaN,
	'%IteratorPrototype%': hasSymbols ? getProto(getProto([][Symbol.iterator]())) : undefined,
	'%JSON%': typeof JSON === 'object' ? JSON : undefined,
	'%Map%': typeof Map === 'undefined' ? undefined : Map,
	'%MapIteratorPrototype%': typeof Map === 'undefined' || !hasSymbols ? undefined : getProto(new Map()[Symbol.iterator]()),
	'%Math%': Math,
	'%Number%': Number,
	'%Object%': Object,
	'%parseFloat%': parseFloat,
	'%parseInt%': parseInt,
	'%Promise%': typeof Promise === 'undefined' ? undefined : Promise,
	'%Proxy%': typeof Proxy === 'undefined' ? undefined : Proxy,
	'%RangeError%': RangeError,
	'%ReferenceError%': ReferenceError,
	'%Reflect%': typeof Reflect === 'undefined' ? undefined : Reflect,
	'%RegExp%': RegExp,
	'%Set%': typeof Set === 'undefined' ? undefined : Set,
	'%SetIteratorPrototype%': typeof Set === 'undefined' || !hasSymbols ? undefined : getProto(new Set()[Symbol.iterator]()),
	'%SharedArrayBuffer%': typeof SharedArrayBuffer === 'undefined' ? undefined : SharedArrayBuffer,
	'%String%': String,
	'%StringIteratorPrototype%': hasSymbols ? getProto(''[Symbol.iterator]()) : undefined,
	'%Symbol%': hasSymbols ? Symbol : undefined,
	'%SyntaxError%': $SyntaxError,
	'%ThrowTypeError%': ThrowTypeError,
	'%TypedArray%': TypedArray,
	'%TypeError%': $TypeError,
	'%Uint8Array%': typeof Uint8Array === 'undefined' ? undefined : Uint8Array,
	'%Uint8ClampedArray%': typeof Uint8ClampedArray === 'undefined' ? undefined : Uint8ClampedArray,
	'%Uint16Array%': typeof Uint16Array === 'undefined' ? undefined : Uint16Array,
	'%Uint32Array%': typeof Uint32Array === 'undefined' ? undefined : Uint32Array,
	'%URIError%': URIError,
	'%WeakMap%': typeof WeakMap === 'undefined' ? undefined : WeakMap,
	'%WeakRef%': typeof WeakRef === 'undefined' ? undefined : WeakRef,
	'%WeakSet%': typeof WeakSet === 'undefined' ? undefined : WeakSet
};

var doEval = function doEval(name) {
	var value;
	if (name === '%AsyncFunction%') {
		value = getEvalledConstructor('async function () {}');
	} else if (name === '%GeneratorFunction%') {
		value = getEvalledConstructor('function* () {}');
	} else if (name === '%AsyncGeneratorFunction%') {
		value = getEvalledConstructor('async function* () {}');
	} else if (name === '%AsyncGenerator%') {
		var fn = doEval('%AsyncGeneratorFunction%');
		if (fn) {
			value = fn.prototype;
		}
	} else if (name === '%AsyncIteratorPrototype%') {
		var gen = doEval('%AsyncGenerator%');
		if (gen) {
			value = getProto(gen.prototype);
		}
	}

	INTRINSICS[name] = value;

	return value;
};

var LEGACY_ALIASES = {
	'%ArrayBufferPrototype%': ['ArrayBuffer', 'prototype'],
	'%ArrayPrototype%': ['Array', 'prototype'],
	'%ArrayProto_entries%': ['Array', 'prototype', 'entries'],
	'%ArrayProto_forEach%': ['Array', 'prototype', 'forEach'],
	'%ArrayProto_keys%': ['Array', 'prototype', 'keys'],
	'%ArrayProto_values%': ['Array', 'prototype', 'values'],
	'%AsyncFunctionPrototype%': ['AsyncFunction', 'prototype'],
	'%AsyncGenerator%': ['AsyncGeneratorFunction', 'prototype'],
	'%AsyncGeneratorPrototype%': ['AsyncGeneratorFunction', 'prototype', 'prototype'],
	'%BooleanPrototype%': ['Boolean', 'prototype'],
	'%DataViewPrototype%': ['DataView', 'prototype'],
	'%DatePrototype%': ['Date', 'prototype'],
	'%ErrorPrototype%': ['Error', 'prototype'],
	'%EvalErrorPrototype%': ['EvalError', 'prototype'],
	'%Float32ArrayPrototype%': ['Float32Array', 'prototype'],
	'%Float64ArrayPrototype%': ['Float64Array', 'prototype'],
	'%FunctionPrototype%': ['Function', 'prototype'],
	'%Generator%': ['GeneratorFunction', 'prototype'],
	'%GeneratorPrototype%': ['GeneratorFunction', 'prototype', 'prototype'],
	'%Int8ArrayPrototype%': ['Int8Array', 'prototype'],
	'%Int16ArrayPrototype%': ['Int16Array', 'prototype'],
	'%Int32ArrayPrototype%': ['Int32Array', 'prototype'],
	'%JSONParse%': ['JSON', 'parse'],
	'%JSONStringify%': ['JSON', 'stringify'],
	'%MapPrototype%': ['Map', 'prototype'],
	'%NumberPrototype%': ['Number', 'prototype'],
	'%ObjectPrototype%': ['Object', 'prototype'],
	'%ObjProto_toString%': ['Object', 'prototype', 'toString'],
	'%ObjProto_valueOf%': ['Object', 'prototype', 'valueOf'],
	'%PromisePrototype%': ['Promise', 'prototype'],
	'%PromiseProto_then%': ['Promise', 'prototype', 'then'],
	'%Promise_all%': ['Promise', 'all'],
	'%Promise_reject%': ['Promise', 'reject'],
	'%Promise_resolve%': ['Promise', 'resolve'],
	'%RangeErrorPrototype%': ['RangeError', 'prototype'],
	'%ReferenceErrorPrototype%': ['ReferenceError', 'prototype'],
	'%RegExpPrototype%': ['RegExp', 'prototype'],
	'%SetPrototype%': ['Set', 'prototype'],
	'%SharedArrayBufferPrototype%': ['SharedArrayBuffer', 'prototype'],
	'%StringPrototype%': ['String', 'prototype'],
	'%SymbolPrototype%': ['Symbol', 'prototype'],
	'%SyntaxErrorPrototype%': ['SyntaxError', 'prototype'],
	'%TypedArrayPrototype%': ['TypedArray', 'prototype'],
	'%TypeErrorPrototype%': ['TypeError', 'prototype'],
	'%Uint8ArrayPrototype%': ['Uint8Array', 'prototype'],
	'%Uint8ClampedArrayPrototype%': ['Uint8ClampedArray', 'prototype'],
	'%Uint16ArrayPrototype%': ['Uint16Array', 'prototype'],
	'%Uint32ArrayPrototype%': ['Uint32Array', 'prototype'],
	'%URIErrorPrototype%': ['URIError', 'prototype'],
	'%WeakMapPrototype%': ['WeakMap', 'prototype'],
	'%WeakSetPrototype%': ['WeakSet', 'prototype']
};

var bind = require('function-bind');
var hasOwn = require('has');
var $concat = bind.call(Function.call, Array.prototype.concat);
var $spliceApply = bind.call(Function.apply, Array.prototype.splice);
var $replace = bind.call(Function.call, String.prototype.replace);
var $strSlice = bind.call(Function.call, String.prototype.slice);

/* adapted from https://github.com/lodash/lodash/blob/4.17.15/dist/lodash.js#L6735-L6744 */
var rePropName = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g;
var reEscapeChar = /\\(\\)?/g; /** Used to match backslashes in property paths. */
var stringToPath = function stringToPath(string) {
	var first = $strSlice(string, 0, 1);
	var last = $strSlice(string, -1);
	if (first === '%' && last !== '%') {
		throw new $SyntaxError('invalid intrinsic syntax, expected closing `%`');
	} else if (last === '%' && first !== '%') {
		throw new $SyntaxError('invalid intrinsic syntax, expected opening `%`');
	}
	var result = [];
	$replace(string, rePropName, function (match, number, quote, subString) {
		result[result.length] = quote ? $replace(subString, reEscapeChar, '$1') : number || match;
	});
	return result;
};
/* end adaptation */

var getBaseIntrinsic = function getBaseIntrinsic(name, allowMissing) {
	var intrinsicName = name;
	var alias;
	if (hasOwn(LEGACY_ALIASES, intrinsicName)) {
		alias = LEGACY_ALIASES[intrinsicName];
		intrinsicName = '%' + alias[0] + '%';
	}

	if (hasOwn(INTRINSICS, intrinsicName)) {
		var value = INTRINSICS[intrinsicName];
		if (value === needsEval) {
			value = doEval(intrinsicName);
		}
		if (typeof value === 'undefined' && !allowMissing) {
			throw new $TypeError('intrinsic ' + name + ' exists, but is not available. Please file an issue!');
		}

		return {
			alias: alias,
			name: intrinsicName,
			value: value
		};
	}

	throw new $SyntaxError('intrinsic ' + name + ' does not exist!');
};

module.exports = function GetIntrinsic(name, allowMissing) {
	if (typeof name !== 'string' || name.length === 0) {
		throw new $TypeError('intrinsic name must be a non-empty string');
	}
	if (arguments.length > 1 && typeof allowMissing !== 'boolean') {
		throw new $TypeError('"allowMissing" argument must be a boolean');
	}

	var parts = stringToPath(name);
	var intrinsicBaseName = parts.length > 0 ? parts[0] : '';

	var intrinsic = getBaseIntrinsic('%' + intrinsicBaseName + '%', allowMissing);
	var intrinsicRealName = intrinsic.name;
	var value = intrinsic.value;
	var skipFurtherCaching = false;

	var alias = intrinsic.alias;
	if (alias) {
		intrinsicBaseName = alias[0];
		$spliceApply(parts, $concat([0, 1], alias));
	}

	for (var i = 1, isOwn = true; i < parts.length; i += 1) {
		var part = parts[i];
		var first = $strSlice(part, 0, 1);
		var last = $strSlice(part, -1);
		if (
			(
				(first === '"' || first === "'" || first === '`')
				|| (last === '"' || last === "'" || last === '`')
			)
			&& first !== last
		) {
			throw new $SyntaxError('property names with quotes must have matching quotes');
		}
		if (part === 'constructor' || !isOwn) {
			skipFurtherCaching = true;
		}

		intrinsicBaseName += '.' + part;
		intrinsicRealName = '%' + intrinsicBaseName + '%';

		if (hasOwn(INTRINSICS, intrinsicRealName)) {
			value = INTRINSICS[intrinsicRealName];
		} else if (value != null) {
			if (!(part in value)) {
				if (!allowMissing) {
					throw new $TypeError('base intrinsic for ' + name + ' exists, but the property is not available.');
				}
				return void undefined;
			}
			if ($gOPD && (i + 1) >= parts.length) {
				var desc = $gOPD(value, part);
				isOwn = !!desc;

				// By convention, when a data property is converted to an accessor
				// property to emulate a data property that does not suffer from
				// the override mistake, that accessor's getter is marked with
				// an `originalValue` property. Here, when we detect this, we
				// uphold the illusion by pretending to see that original data
				// property, i.e., returning the value rather than the getter
				// itself.
				if (isOwn && 'get' in desc && !('originalValue' in desc.get)) {
					value = desc.get;
				} else {
					value = value[part];
				}
			} else {
				isOwn = hasOwn(value, part);
				value = value[part];
			}

			if (isOwn && !skipFurtherCaching) {
				INTRINSICS[intrinsicRealName] = value;
			}
		}
	}
	return value;
};

},{"function-bind":30,"has":34,"has-symbols":32}],32:[function(require,module,exports){
'use strict';

var origSymbol = typeof Symbol !== 'undefined' && Symbol;
var hasSymbolSham = require('./shams');

module.exports = function hasNativeSymbols() {
	if (typeof origSymbol !== 'function') { return false; }
	if (typeof Symbol !== 'function') { return false; }
	if (typeof origSymbol('foo') !== 'symbol') { return false; }
	if (typeof Symbol('bar') !== 'symbol') { return false; }

	return hasSymbolSham();
};

},{"./shams":33}],33:[function(require,module,exports){
'use strict';

/* eslint complexity: [2, 18], max-statements: [2, 33] */
module.exports = function hasSymbols() {
	if (typeof Symbol !== 'function' || typeof Object.getOwnPropertySymbols !== 'function') { return false; }
	if (typeof Symbol.iterator === 'symbol') { return true; }

	var obj = {};
	var sym = Symbol('test');
	var symObj = Object(sym);
	if (typeof sym === 'string') { return false; }

	if (Object.prototype.toString.call(sym) !== '[object Symbol]') { return false; }
	if (Object.prototype.toString.call(symObj) !== '[object Symbol]') { return false; }

	// temp disabled per https://github.com/ljharb/object.assign/issues/17
	// if (sym instanceof Symbol) { return false; }
	// temp disabled per https://github.com/WebReflection/get-own-property-symbols/issues/4
	// if (!(symObj instanceof Symbol)) { return false; }

	// if (typeof Symbol.prototype.toString !== 'function') { return false; }
	// if (String(sym) !== Symbol.prototype.toString.call(sym)) { return false; }

	var symVal = 42;
	obj[sym] = symVal;
	for (sym in obj) { return false; } // eslint-disable-line no-restricted-syntax, no-unreachable-loop
	if (typeof Object.keys === 'function' && Object.keys(obj).length !== 0) { return false; }

	if (typeof Object.getOwnPropertyNames === 'function' && Object.getOwnPropertyNames(obj).length !== 0) { return false; }

	var syms = Object.getOwnPropertySymbols(obj);
	if (syms.length !== 1 || syms[0] !== sym) { return false; }

	if (!Object.prototype.propertyIsEnumerable.call(obj, sym)) { return false; }

	if (typeof Object.getOwnPropertyDescriptor === 'function') {
		var descriptor = Object.getOwnPropertyDescriptor(obj, sym);
		if (descriptor.value !== symVal || descriptor.enumerable !== true) { return false; }
	}

	return true;
};

},{}],34:[function(require,module,exports){
'use strict';

var bind = require('function-bind');

module.exports = bind.call(Function.call, Object.prototype.hasOwnProperty);

},{"function-bind":30}],35:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor
      ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
          value: ctor,
          enumerable: false,
          writable: true,
          configurable: true
        }
      })
    }
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor
      var TempCtor = function () {}
      TempCtor.prototype = superCtor.prototype
      ctor.prototype = new TempCtor()
      ctor.prototype.constructor = ctor
    }
  }
}

},{}],36:[function(require,module,exports){
'use strict';

var hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';
var callBound = require('call-bind/callBound');

var $toString = callBound('Object.prototype.toString');

var isStandardArguments = function isArguments(value) {
	if (hasToStringTag && value && typeof value === 'object' && Symbol.toStringTag in value) {
		return false;
	}
	return $toString(value) === '[object Arguments]';
};

var isLegacyArguments = function isArguments(value) {
	if (isStandardArguments(value)) {
		return true;
	}
	return value !== null &&
		typeof value === 'object' &&
		typeof value.length === 'number' &&
		value.length >= 0 &&
		$toString(value) !== '[object Array]' &&
		$toString(value.callee) === '[object Function]';
};

var supportsStandardArguments = (function () {
	return isStandardArguments(arguments);
}());

isStandardArguments.isLegacyArguments = isLegacyArguments; // for tests

module.exports = supportsStandardArguments ? isStandardArguments : isLegacyArguments;

},{"call-bind/callBound":25}],37:[function(require,module,exports){
/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */

// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
module.exports = function (obj) {
  return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
}

function isBuffer (obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

// For Node v0.10 support. Remove this eventually.
function isSlowBuffer (obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0))
}

},{}],38:[function(require,module,exports){
'use strict';

var toStr = Object.prototype.toString;
var fnToStr = Function.prototype.toString;
var isFnRegex = /^\s*(?:function)?\*/;
var hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';
var getProto = Object.getPrototypeOf;
var getGeneratorFunc = function () { // eslint-disable-line consistent-return
	if (!hasToStringTag) {
		return false;
	}
	try {
		return Function('return function*() {}')();
	} catch (e) {
	}
};
var generatorFunc = getGeneratorFunc();
var GeneratorFunction = getProto && generatorFunc ? getProto(generatorFunc) : false;

module.exports = function isGeneratorFunction(fn) {
	if (typeof fn !== 'function') {
		return false;
	}
	if (isFnRegex.test(fnToStr.call(fn))) {
		return true;
	}
	if (!hasToStringTag) {
		var str = toStr.call(fn);
		return str === '[object GeneratorFunction]';
	}
	return getProto && getProto(fn) === GeneratorFunction;
};

},{}],39:[function(require,module,exports){
(function (global){(function (){
'use strict';

var forEach = require('foreach');
var availableTypedArrays = require('available-typed-arrays');
var callBound = require('call-bind/callBound');

var $toString = callBound('Object.prototype.toString');
var hasSymbols = require('has-symbols')();
var hasToStringTag = hasSymbols && typeof Symbol.toStringTag === 'symbol';

var typedArrays = availableTypedArrays();

var $indexOf = callBound('Array.prototype.indexOf', true) || function indexOf(array, value) {
	for (var i = 0; i < array.length; i += 1) {
		if (array[i] === value) {
			return i;
		}
	}
	return -1;
};
var $slice = callBound('String.prototype.slice');
var toStrTags = {};
var gOPD = require('es-abstract/helpers/getOwnPropertyDescriptor');
var getPrototypeOf = Object.getPrototypeOf; // require('getprototypeof');
if (hasToStringTag && gOPD && getPrototypeOf) {
	forEach(typedArrays, function (typedArray) {
		var arr = new global[typedArray]();
		if (!(Symbol.toStringTag in arr)) {
			throw new EvalError('this engine has support for Symbol.toStringTag, but ' + typedArray + ' does not have the property! Please report this.');
		}
		var proto = getPrototypeOf(arr);
		var descriptor = gOPD(proto, Symbol.toStringTag);
		if (!descriptor) {
			var superProto = getPrototypeOf(proto);
			descriptor = gOPD(superProto, Symbol.toStringTag);
		}
		toStrTags[typedArray] = descriptor.get;
	});
}

var tryTypedArrays = function tryAllTypedArrays(value) {
	var anyTrue = false;
	forEach(toStrTags, function (getter, typedArray) {
		if (!anyTrue) {
			try {
				anyTrue = getter.call(value) === typedArray;
			} catch (e) { /**/ }
		}
	});
	return anyTrue;
};

module.exports = function isTypedArray(value) {
	if (!value || typeof value !== 'object') { return false; }
	if (!hasToStringTag) {
		var tag = $slice($toString(value), 8, -1);
		return $indexOf(typedArrays, tag) > -1;
	}
	if (!gOPD) { return false; }
	return tryTypedArrays(value);
};

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"available-typed-arrays":24,"call-bind/callBound":25,"es-abstract/helpers/getOwnPropertyDescriptor":27,"foreach":28,"has-symbols":32}],40:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],41:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],42:[function(require,module,exports){
// Currently in sync with Node.js lib/internal/util/types.js
// https://github.com/nodejs/node/commit/112cc7c27551254aa2b17098fb774867f05ed0d9

'use strict';

var isArgumentsObject = require('is-arguments');
var isGeneratorFunction = require('is-generator-function');
var whichTypedArray = require('which-typed-array');
var isTypedArray = require('is-typed-array');

function uncurryThis(f) {
  return f.call.bind(f);
}

var BigIntSupported = typeof BigInt !== 'undefined';
var SymbolSupported = typeof Symbol !== 'undefined';

var ObjectToString = uncurryThis(Object.prototype.toString);

var numberValue = uncurryThis(Number.prototype.valueOf);
var stringValue = uncurryThis(String.prototype.valueOf);
var booleanValue = uncurryThis(Boolean.prototype.valueOf);

if (BigIntSupported) {
  var bigIntValue = uncurryThis(BigInt.prototype.valueOf);
}

if (SymbolSupported) {
  var symbolValue = uncurryThis(Symbol.prototype.valueOf);
}

function checkBoxedPrimitive(value, prototypeValueOf) {
  if (typeof value !== 'object') {
    return false;
  }
  try {
    prototypeValueOf(value);
    return true;
  } catch(e) {
    return false;
  }
}

exports.isArgumentsObject = isArgumentsObject;
exports.isGeneratorFunction = isGeneratorFunction;
exports.isTypedArray = isTypedArray;

// Taken from here and modified for better browser support
// https://github.com/sindresorhus/p-is-promise/blob/cda35a513bda03f977ad5cde3a079d237e82d7ef/index.js
function isPromise(input) {
	return (
		(
			typeof Promise !== 'undefined' &&
			input instanceof Promise
		) ||
		(
			input !== null &&
			typeof input === 'object' &&
			typeof input.then === 'function' &&
			typeof input.catch === 'function'
		)
	);
}
exports.isPromise = isPromise;

function isArrayBufferView(value) {
  if (typeof ArrayBuffer !== 'undefined' && ArrayBuffer.isView) {
    return ArrayBuffer.isView(value);
  }

  return (
    isTypedArray(value) ||
    isDataView(value)
  );
}
exports.isArrayBufferView = isArrayBufferView;


function isUint8Array(value) {
  return whichTypedArray(value) === 'Uint8Array';
}
exports.isUint8Array = isUint8Array;

function isUint8ClampedArray(value) {
  return whichTypedArray(value) === 'Uint8ClampedArray';
}
exports.isUint8ClampedArray = isUint8ClampedArray;

function isUint16Array(value) {
  return whichTypedArray(value) === 'Uint16Array';
}
exports.isUint16Array = isUint16Array;

function isUint32Array(value) {
  return whichTypedArray(value) === 'Uint32Array';
}
exports.isUint32Array = isUint32Array;

function isInt8Array(value) {
  return whichTypedArray(value) === 'Int8Array';
}
exports.isInt8Array = isInt8Array;

function isInt16Array(value) {
  return whichTypedArray(value) === 'Int16Array';
}
exports.isInt16Array = isInt16Array;

function isInt32Array(value) {
  return whichTypedArray(value) === 'Int32Array';
}
exports.isInt32Array = isInt32Array;

function isFloat32Array(value) {
  return whichTypedArray(value) === 'Float32Array';
}
exports.isFloat32Array = isFloat32Array;

function isFloat64Array(value) {
  return whichTypedArray(value) === 'Float64Array';
}
exports.isFloat64Array = isFloat64Array;

function isBigInt64Array(value) {
  return whichTypedArray(value) === 'BigInt64Array';
}
exports.isBigInt64Array = isBigInt64Array;

function isBigUint64Array(value) {
  return whichTypedArray(value) === 'BigUint64Array';
}
exports.isBigUint64Array = isBigUint64Array;

function isMapToString(value) {
  return ObjectToString(value) === '[object Map]';
}
isMapToString.working = (
  typeof Map !== 'undefined' &&
  isMapToString(new Map())
);

function isMap(value) {
  if (typeof Map === 'undefined') {
    return false;
  }

  return isMapToString.working
    ? isMapToString(value)
    : value instanceof Map;
}
exports.isMap = isMap;

function isSetToString(value) {
  return ObjectToString(value) === '[object Set]';
}
isSetToString.working = (
  typeof Set !== 'undefined' &&
  isSetToString(new Set())
);
function isSet(value) {
  if (typeof Set === 'undefined') {
    return false;
  }

  return isSetToString.working
    ? isSetToString(value)
    : value instanceof Set;
}
exports.isSet = isSet;

function isWeakMapToString(value) {
  return ObjectToString(value) === '[object WeakMap]';
}
isWeakMapToString.working = (
  typeof WeakMap !== 'undefined' &&
  isWeakMapToString(new WeakMap())
);
function isWeakMap(value) {
  if (typeof WeakMap === 'undefined') {
    return false;
  }

  return isWeakMapToString.working
    ? isWeakMapToString(value)
    : value instanceof WeakMap;
}
exports.isWeakMap = isWeakMap;

function isWeakSetToString(value) {
  return ObjectToString(value) === '[object WeakSet]';
}
isWeakSetToString.working = (
  typeof WeakSet !== 'undefined' &&
  isWeakSetToString(new WeakSet())
);
function isWeakSet(value) {
  return isWeakSetToString(value);
}
exports.isWeakSet = isWeakSet;

function isArrayBufferToString(value) {
  return ObjectToString(value) === '[object ArrayBuffer]';
}
isArrayBufferToString.working = (
  typeof ArrayBuffer !== 'undefined' &&
  isArrayBufferToString(new ArrayBuffer())
);
function isArrayBuffer(value) {
  if (typeof ArrayBuffer === 'undefined') {
    return false;
  }

  return isArrayBufferToString.working
    ? isArrayBufferToString(value)
    : value instanceof ArrayBuffer;
}
exports.isArrayBuffer = isArrayBuffer;

function isDataViewToString(value) {
  return ObjectToString(value) === '[object DataView]';
}
isDataViewToString.working = (
  typeof ArrayBuffer !== 'undefined' &&
  typeof DataView !== 'undefined' &&
  isDataViewToString(new DataView(new ArrayBuffer(1), 0, 1))
);
function isDataView(value) {
  if (typeof DataView === 'undefined') {
    return false;
  }

  return isDataViewToString.working
    ? isDataViewToString(value)
    : value instanceof DataView;
}
exports.isDataView = isDataView;

function isSharedArrayBufferToString(value) {
  return ObjectToString(value) === '[object SharedArrayBuffer]';
}
isSharedArrayBufferToString.working = (
  typeof SharedArrayBuffer !== 'undefined' &&
  isSharedArrayBufferToString(new SharedArrayBuffer())
);
function isSharedArrayBuffer(value) {
  if (typeof SharedArrayBuffer === 'undefined') {
    return false;
  }

  return isSharedArrayBufferToString.working
    ? isSharedArrayBufferToString(value)
    : value instanceof SharedArrayBuffer;
}
exports.isSharedArrayBuffer = isSharedArrayBuffer;

function isAsyncFunction(value) {
  return ObjectToString(value) === '[object AsyncFunction]';
}
exports.isAsyncFunction = isAsyncFunction;

function isMapIterator(value) {
  return ObjectToString(value) === '[object Map Iterator]';
}
exports.isMapIterator = isMapIterator;

function isSetIterator(value) {
  return ObjectToString(value) === '[object Set Iterator]';
}
exports.isSetIterator = isSetIterator;

function isGeneratorObject(value) {
  return ObjectToString(value) === '[object Generator]';
}
exports.isGeneratorObject = isGeneratorObject;

function isWebAssemblyCompiledModule(value) {
  return ObjectToString(value) === '[object WebAssembly.Module]';
}
exports.isWebAssemblyCompiledModule = isWebAssemblyCompiledModule;

function isNumberObject(value) {
  return checkBoxedPrimitive(value, numberValue);
}
exports.isNumberObject = isNumberObject;

function isStringObject(value) {
  return checkBoxedPrimitive(value, stringValue);
}
exports.isStringObject = isStringObject;

function isBooleanObject(value) {
  return checkBoxedPrimitive(value, booleanValue);
}
exports.isBooleanObject = isBooleanObject;

function isBigIntObject(value) {
  return BigIntSupported && checkBoxedPrimitive(value, bigIntValue);
}
exports.isBigIntObject = isBigIntObject;

function isSymbolObject(value) {
  return SymbolSupported && checkBoxedPrimitive(value, symbolValue);
}
exports.isSymbolObject = isSymbolObject;

function isBoxedPrimitive(value) {
  return (
    isNumberObject(value) ||
    isStringObject(value) ||
    isBooleanObject(value) ||
    isBigIntObject(value) ||
    isSymbolObject(value)
  );
}
exports.isBoxedPrimitive = isBoxedPrimitive;

function isAnyArrayBuffer(value) {
  return typeof Uint8Array !== 'undefined' && (
    isArrayBuffer(value) ||
    isSharedArrayBuffer(value)
  );
}
exports.isAnyArrayBuffer = isAnyArrayBuffer;

['isProxy', 'isExternal', 'isModuleNamespaceObject'].forEach(function(method) {
  Object.defineProperty(exports, method, {
    enumerable: false,
    value: function() {
      throw new Error(method + ' is not supported in userland');
    }
  });
});

},{"is-arguments":36,"is-generator-function":38,"is-typed-array":39,"which-typed-array":44}],43:[function(require,module,exports){
(function (process){(function (){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var getOwnPropertyDescriptors = Object.getOwnPropertyDescriptors ||
  function getOwnPropertyDescriptors(obj) {
    var keys = Object.keys(obj);
    var descriptors = {};
    for (var i = 0; i < keys.length; i++) {
      descriptors[keys[i]] = Object.getOwnPropertyDescriptor(obj, keys[i]);
    }
    return descriptors;
  };

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  if (typeof process !== 'undefined' && process.noDeprecation === true) {
    return fn;
  }

  // Allow for deprecating things in the process of starting up.
  if (typeof process === 'undefined') {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnvRegex = /^$/;

if (process.env.NODE_DEBUG) {
  var debugEnv = process.env.NODE_DEBUG;
  debugEnv = debugEnv.replace(/[|\\{}()[\]^$+?.]/g, '\\$&')
    .replace(/\*/g, '.*')
    .replace(/,/g, '$|^')
    .toUpperCase();
  debugEnvRegex = new RegExp('^' + debugEnv + '$', 'i');
}
exports.debuglog = function(set) {
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (debugEnvRegex.test(set)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
exports.types = require('./support/types');

function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;
exports.types.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;
exports.types.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;
exports.types.isNativeError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

var kCustomPromisifiedSymbol = typeof Symbol !== 'undefined' ? Symbol('util.promisify.custom') : undefined;

exports.promisify = function promisify(original) {
  if (typeof original !== 'function')
    throw new TypeError('The "original" argument must be of type Function');

  if (kCustomPromisifiedSymbol && original[kCustomPromisifiedSymbol]) {
    var fn = original[kCustomPromisifiedSymbol];
    if (typeof fn !== 'function') {
      throw new TypeError('The "util.promisify.custom" argument must be of type Function');
    }
    Object.defineProperty(fn, kCustomPromisifiedSymbol, {
      value: fn, enumerable: false, writable: false, configurable: true
    });
    return fn;
  }

  function fn() {
    var promiseResolve, promiseReject;
    var promise = new Promise(function (resolve, reject) {
      promiseResolve = resolve;
      promiseReject = reject;
    });

    var args = [];
    for (var i = 0; i < arguments.length; i++) {
      args.push(arguments[i]);
    }
    args.push(function (err, value) {
      if (err) {
        promiseReject(err);
      } else {
        promiseResolve(value);
      }
    });

    try {
      original.apply(this, args);
    } catch (err) {
      promiseReject(err);
    }

    return promise;
  }

  Object.setPrototypeOf(fn, Object.getPrototypeOf(original));

  if (kCustomPromisifiedSymbol) Object.defineProperty(fn, kCustomPromisifiedSymbol, {
    value: fn, enumerable: false, writable: false, configurable: true
  });
  return Object.defineProperties(
    fn,
    getOwnPropertyDescriptors(original)
  );
}

exports.promisify.custom = kCustomPromisifiedSymbol

function callbackifyOnRejected(reason, cb) {
  // `!reason` guard inspired by bluebird (Ref: https://goo.gl/t5IS6M).
  // Because `null` is a special error value in callbacks which means "no error
  // occurred", we error-wrap so the callback consumer can distinguish between
  // "the promise rejected with null" or "the promise fulfilled with undefined".
  if (!reason) {
    var newReason = new Error('Promise was rejected with a falsy value');
    newReason.reason = reason;
    reason = newReason;
  }
  return cb(reason);
}

function callbackify(original) {
  if (typeof original !== 'function') {
    throw new TypeError('The "original" argument must be of type Function');
  }

  // We DO NOT return the promise as it gives the user a false sense that
  // the promise is actually somehow related to the callback's execution
  // and that the callback throwing will reject the promise.
  function callbackified() {
    var args = [];
    for (var i = 0; i < arguments.length; i++) {
      args.push(arguments[i]);
    }

    var maybeCb = args.pop();
    if (typeof maybeCb !== 'function') {
      throw new TypeError('The last argument must be of type Function');
    }
    var self = this;
    var cb = function() {
      return maybeCb.apply(self, arguments);
    };
    // In true node style we process the callback on `nextTick` with all the
    // implications (stack, `uncaughtException`, `async_hooks`)
    original.apply(this, args)
      .then(function(ret) { process.nextTick(cb.bind(null, null, ret)) },
            function(rej) { process.nextTick(callbackifyOnRejected.bind(null, rej, cb)) });
  }

  Object.setPrototypeOf(callbackified, Object.getPrototypeOf(original));
  Object.defineProperties(callbackified,
                          getOwnPropertyDescriptors(original));
  return callbackified;
}
exports.callbackify = callbackify;

}).call(this)}).call(this,require('_process'))
},{"./support/isBuffer":41,"./support/types":42,"_process":40,"inherits":35}],44:[function(require,module,exports){
(function (global){(function (){
'use strict';

var forEach = require('foreach');
var availableTypedArrays = require('available-typed-arrays');
var callBound = require('call-bind/callBound');

var $toString = callBound('Object.prototype.toString');
var hasSymbols = require('has-symbols')();
var hasToStringTag = hasSymbols && typeof Symbol.toStringTag === 'symbol';

var typedArrays = availableTypedArrays();

var $slice = callBound('String.prototype.slice');
var toStrTags = {};
var gOPD = require('es-abstract/helpers/getOwnPropertyDescriptor');
var getPrototypeOf = Object.getPrototypeOf; // require('getprototypeof');
if (hasToStringTag && gOPD && getPrototypeOf) {
	forEach(typedArrays, function (typedArray) {
		if (typeof global[typedArray] === 'function') {
			var arr = new global[typedArray]();
			if (!(Symbol.toStringTag in arr)) {
				throw new EvalError('this engine has support for Symbol.toStringTag, but ' + typedArray + ' does not have the property! Please report this.');
			}
			var proto = getPrototypeOf(arr);
			var descriptor = gOPD(proto, Symbol.toStringTag);
			if (!descriptor) {
				var superProto = getPrototypeOf(proto);
				descriptor = gOPD(superProto, Symbol.toStringTag);
			}
			toStrTags[typedArray] = descriptor.get;
		}
	});
}

var tryTypedArrays = function tryAllTypedArrays(value) {
	var foundName = false;
	forEach(toStrTags, function (getter, typedArray) {
		if (!foundName) {
			try {
				var name = getter.call(value);
				if (name === typedArray) {
					foundName = name;
				}
			} catch (e) {}
		}
	});
	return foundName;
};

var isTypedArray = require('is-typed-array');

module.exports = function whichTypedArray(value) {
	if (!isTypedArray(value)) { return false; }
	if (!hasToStringTag) { return $slice($toString(value), 8, -1); }
	return tryTypedArrays(value);
};

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"available-typed-arrays":24,"call-bind/callBound":25,"es-abstract/helpers/getOwnPropertyDescriptor":27,"foreach":28,"has-symbols":32,"is-typed-array":39}]},{},[1]);
