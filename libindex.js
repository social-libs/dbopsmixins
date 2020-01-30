function createLib (execlib, datalib) {
  'use strict';

  return execlib.lib.extend({
    mixins: {
      service: require('./servicecreator')(execlib, datalib)
    }
  }, require('./webindex')(execlib));
}

module.exports = createLib;
