function createJobs (execlib) {
  'use strict';

  var ret = {};

  require('./updateuserprofilecreator')(execlib, ret);
  require('./updateuserprofilefromhashcreator')(execlib, ret);

  return ret;
}
module.exports = createJobs;
