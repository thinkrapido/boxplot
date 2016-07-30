
'use strict';

const _ = require('lodash'),
      path = require('path'),
      fs = require('fs'),
      chokidar = require('chokidar'),

      FILE = path.join(process.cwd(), 'data/data.txt')
      ;

let data = getData(),
    watcher = chokidar.watch(FILE)
    ;

watcher.on('change', () => {
  data = getData();
})

function loadData() {

  let out = [],
      content = fs.readFileSync(FILE, { encoding: 'utf8' })
      ;

  content = content.split("\n");

  _.forEach(content, line => {
    line = line.trim();
    if (!!line) {
      out.push(line);
    }
  })

  return out;

}

function interpolate(data) {
  if (!!(data.length % 2)) {
    return data[Math.floor(data.length / 2)];
  }
  let idx = data.length / 2,
      lower = data[idx - 1],
      upper = data[idx],
      out = (upper + lower) / 2;
      ;
  return out;
}

function calcQ2(data) {
  return interpolate(data);
}

function calcQ1(data, Q2) {
  if (!!(data.length % 2)) {
    data = _.slice(data, 0, Math.floor(data.length / 2));
  }
  else {
    data = _.slice(data, 0, data.length / 2);
  }
  return interpolate(data);
}

function calcQ3(data, Q2) {
  if (!!(data.length % 2)) {
    data = _.slice(data, Math.ceil(data.length / 2));
  }
  else {
    data = _.slice(data, data.length / 2 + 1);
  }
  return interpolate(data);
}

function calcIRQ(Q1, Q3) {
  return Q3 - Q1;
}

function calcMin(data, Q1, IRQ) {
  let margin = Q1 - 1.5 * IRQ;
  data = _.filter(data, item => {
    return item >= margin;
  });
  return Math.min.apply(null, data);
}

function calcMax(data, Q3, IRQ) {
  let margin = Q3 + 1.5 * IRQ;
  data = _.filter(data, item => {
    return item <= margin;
  });
  return Math.max.apply(null, data);
}

function calcOutlier(data, min, max) {
  return _.filter(data, item => {
    return item < min || item > max;
  })
}

function calculateLine(line) {

  line = line.split(',');

  let out = {};

  out.date = line.shift().trim();

  let data = _(line).map(item => { return parseFloat(item); }).sortBy().value();

  out.Q2 = calcQ2(data);
  out.Q1 = calcQ1(data, out.Q2);
  out.Q3 = calcQ3(data, out.Q2);
  out.IRQ = calcIRQ(out.Q1, out.Q3);
  out.min = calcMin(data, out.Q1, out.IRQ);
  out.max = calcMax(data, out.Q3, out.IRQ);
  out.outlier = calcOutlier(data, out.min, out.max);

  return out;
}

function getData() {

  var data = loadData();

  data = _.map(data, line => {
    return calculateLine(line);
  });

  return data;

}

module.exports = { get: () => { return data; } };
