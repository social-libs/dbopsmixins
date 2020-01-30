function createLib (execlib) {
  'use strict';

  return execlib.loadDependencies('client', ['allex:data:lib'], require('./libindex').bind(null, execlib));
}

module.exports = createLib;
