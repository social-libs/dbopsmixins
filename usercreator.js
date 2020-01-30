function createUserMixin (execlib) {
  'use strict';

  var lib = execlib.lib,
    qlib = lib.qlib;

  function UserMixin (prophash) {
  }
  UserMixin.prototype.destroy = function () {
  };
  UserMixin.prototype.updateUserProfile = function (username, profileupdatehash, defer) {
    qlib.promise2defer(this.__service.updateUserProfile(username, profileupdatehash), defer);
  };
  UserMixin.prototype.updateUserProfileFromHash = function (username, profileupdatehash, defer) {
    qlib.promise2defer(this.__service.updateUserProfileFromHash(username, profileupdatehash), defer);
  };
  UserMixin.prototype.getUserProfile = function (username, defer) {
    qlib.promise2defer(this.__service.getUserProfile(username), defer);
  };
  /*
  UserMixin.prototype.getUserProfileNotifications = function (defer) {
    qlib.promise2defer(this.__service.socialDBOpsProfileUpdateDefer.promise, defer);
  };
  */

  UserMixin.visibleStateFields = ['lastSocialProfileUpdate'];

  UserMixin.addMethods = function (klass) {
    lib.inheritMethods(klass, UserMixin
      ,'updateUserProfile'
      ,'updateUserProfileFromHash'
      ,'getUserProfile'
      ,'getUserProfileNotifications'
    );
  };

  return UserMixin;
}

module.exports = createUserMixin;

