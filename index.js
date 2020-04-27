'use strict';

const readline = require('readline');

const regex1 = new RegExp('^multipart/form-data; *boundary=(.+)$');
const regex2 = new RegExp('^Content-Disposition: form-data; name="(.+)"; filename="(.+)"$');
const regex3 = new RegExp('^Content-Type: text/(.+)$');

const isString = value => typeof value === 'string';
const isFunction = value => typeof value === 'function';
const isNil = value => value === undefined || value === null;

const textReadline = async (input, filter, cbfn) => {
  if (!cbfn) {
    cbfn = filter;
    filter = null;
  }

  if (!isFunction(cbfn)) {
    return;
  }

  if (isString(filter)) {
    filter = { name: filter };
  }

  const contentType = input.headers['content-type'];
  const match = regex1.exec(contentType);
  const boundary = match[1];

  if (!boundary) return;

  const __boundary = '--' + boundary;
  const __boundary__ = __boundary + '--';

  const rl = readline.createInterface({
    input,
    crlfDelay: Infinity,
  });

  let name;
  let filename;
  let type;
  let lineNumber;
  let index = -1;
  let step = 0;

  let i = 0;
  for await (const line of rl) {
    if (step === 0 && line === __boundary) {
      step++;
    } else if (step === 1) {
      const match = regex2.exec(line);
      if (!match) step = 0;
      else {
        name = match[1];
        filename = match[2];
        step++;
      }
    } else if (step === 2) {
      const match = regex3.exec(line);
      if (!match) step = 0;
      else {
        type = match[1];
        step++;
      }
    } else if (step === 3 && line === '') {
      step++;
      index++;
      lineNumber = 0;
    } else if (step === 4) {
      if (line === __boundary__) {
        break;
      }

      if (line === __boundary) {
        step = 1;
      } else {
        let isMatch = true;

        if (filter) {
          if (isMatch && !isNil(filter.name)) isMatch = filter.name === name;
          if (isMatch && !isNil(filter.filename)) isMatch = filter.filename === filename;
          if (isMatch && !isNil(filter.type)) isMatch = filter.type === type;
          if (isMatch && !isNil(filter.index)) isMatch = filter.index === index;
        }

        if (isMatch) cbfn({ name, filename, type, index, line, lineNumber: lineNumber++ });
      }
    }
  }
};

module.exports = textReadline;
