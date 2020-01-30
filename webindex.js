function createWebLib (execlib) {
  return {
    mixins: {
      user: require('./usercreator')(execlib)
    },
    methoddescriptors: {
      user: require('./methoddescriptors/user')
    }
  };

}

module.exports = createWebLib;
