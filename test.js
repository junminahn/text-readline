const fs = require('fs');
const http = require('http');

const assert = require('assert');
const AssertionError = require('assert').AssertionError;
const FormData = require('form-data');
const enableDestroy = require('server-destroy');

const textReadline = require('./index');

const CRLF = '\n';

const logFile = './example.log';
const mdFile = './README.md';
const jsFile = './index.js';
const logName = 'linux-log';
const logFilename = 'example.log';

const hostname = '127.0.0.1';
const port = 3000;
const serverUrl = `http://${hostname}:${port}/`;

const logContent = fs.readFileSync(logFile, 'utf-8');
const mdContent = fs.readFileSync(mdFile, 'utf-8');

let cbfnNoFilter = () => {};
let cbfn = () => {};
let filter = null;

const server = http.createServer(async (req, res) => {
  textReadline(req, cbfnNoFilter);
  await textReadline(req, filter, cbfn);

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('success');
});

server.listen(port, hostname);
enableDestroy(server);

const createFormData = () => {
  const form = new FormData();
  form.append('eslintrc', fs.createReadStream(jsFile));
  form.append(logName, fs.createReadStream(logFile));
  form.append('readme', fs.createReadStream(mdFile));
  return form;
};

describe('Read text lines without filter', function() {
  it(`should read log and md files`, function(done) {
    const contents = [];
    cbfnNoFilter = ({ line }) => {
      contents.push(line);
    };

    const form = createFormData();
    form.submit(serverUrl, () => {
      const contentString = contents.join(CRLF);
      assert.equal(contentString, logContent + CRLF + mdContent);
      done();
    });
  });
});

describe('Read text lines with filter', function() {
  it(`should read text file filtered by name - string`, function(done) {
    const contents = [];
    filter = logName;
    cbfn = ({ line }) => {
      contents.push(line);
    };

    const form = createFormData();
    form.submit(serverUrl, () => {
      const contentString = contents.join(CRLF);
      assert.equal(contentString, logContent);
      done();
    });
  });

  it(`should read text file filtered by name - object`, function(done) {
    const contents = [];
    filter = { name: logName };
    cbfn = ({ line }) => {
      contents.push(line);
    };

    const form = createFormData();
    form.submit(serverUrl, () => {
      const contentString = contents.join(CRLF);
      assert.equal(contentString, logContent);
      done();
    });
  });

  it(`should read text file filtered by filename`, function(done) {
    const contents = [];
    filter = { filename: 'example.log' };
    cbfn = ({ line }) => {
      contents.push(line);
    };

    const form = createFormData();
    form.submit(serverUrl, () => {
      const contentString = contents.join(CRLF);
      assert.equal(contentString, logContent);
      done();
    });
  });

  it(`should read text file filtered by type`, function(done) {
    const contents = [];
    filter = { type: 'markdown' };
    cbfn = ({ line }) => {
      contents.push(line);
    };

    const form = createFormData();
    form.submit(serverUrl, () => {
      const contentString = contents.join(CRLF);
      assert.equal(contentString, mdContent);
      done();
    });
  });

  it(`should read text file filtered by index`, function(done) {
    const contents = [];
    filter = { index: 1 };
    cbfn = ({ line }) => {
      contents.push(line);
    };

    const form = createFormData();
    form.submit(serverUrl, () => {
      const contentString = contents.join(CRLF);
      assert.equal(contentString, mdContent);
      done();
    });
  });

  it(`should read text file filtered by index & type`, function(done) {
    const contents = [];
    filter = { index: 0, type: 'plain' };
    cbfn = ({ line }) => {
      contents.push(line);
    };

    const form = createFormData();
    form.submit(serverUrl, () => {
      const contentString = contents.join(CRLF);
      assert.equal(contentString, logContent);
      done();
    });
  });

  it(`should contain other properties`, function(done) {
    let lastProps;
    let lineNum = -1;
    filter = { index: 0 };
    cbfn = data => {
      lastProps = data;
      lineNum++;
    };

    const form = createFormData();
    form.submit(serverUrl, () => {
      const { name, filename, type, lineNumber } = lastProps;
      assert.equal(name, logName);
      assert.equal(filename, logFilename);
      assert.equal(type, 'plain');
      assert.equal(lineNumber, lineNum);
      done();
    });
  });
});

server.destroy();
