# text-readline

[![NPM version](https://img.shields.io/npm/v/text-readline.svg)](https://www.npmjs.com/package/text-readline)
[![CircleCI](https://circleci.com/gh/junminahn/text-readline.svg?style=svg)](https://circleci.com/gh/junminahn/text-readline)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](/LICENSE)

Read text file stream line by line passed through Nodejs request

## Installation

```sh
$ npm install text-readline
$ yarn add text-readline
```

## Usage

### Read text lines without filter

```js
const textReadline = require('text-readline');
...
const middleware = async (req, res) => {
  const lines = [];
  const lineProcesser = ({ name, filename, type, lineNumber, line }) => lines.push(line);
  await textReadline(req, lineProcesser);
  ...
}
```

### Read text lines with filter - string

```js
const textReadline = require('text-readline');
...
const middleware = async (req, res) => {
  const lines = [];
  const lineProcesser = ({ name, filename, type, lineNumber, line }) => lines.push(line);
  const filter = 'form-key'
  await textReadline(req, filter, lineProcesser);
  ...
}
```

### Read text lines with filter - object

```js
const textReadline = require('text-readline');
...
const middleware = async (req, res) => {
  const lines = [];
  const lineProcesser = ({ name, filename, type, lineNumber, line }) => lines.push(line);
  const filter = { name: 'form-key', filename: 'mylog.log', type: 'plain' };
  await textReadline(req, filter, lineProcesser);
  ...
}
```

### Read text lines with filter - index

```js
const textReadline = require('text-readline');
...
const middleware = async (req, res) => {
  const lines = [];
  const lineProcesser = ({ name, filename, type, lineNumber, line }) => lines.push(line);
  const filter = { index: 0 };
  await textReadline(req, filter, lineProcesser);
  ...
}
```

### Add more than one stream readers

```js
const textReadline = require('text-readline');
...
const middleware = async (req, res) => {
  const lines = [];
  const lineProcesser = ({ name, filename, type, lineNumber, line }) => lines.push(line);
  const filter = { type: 'plain' };
  const filter2 = { type: 'markdown' };
  textReadline(req, filter, lineProcesser);
  await textReadline(req, filter2, lineProcesser);
  ...
}
```

### [MIT Licensed](LICENSE)
