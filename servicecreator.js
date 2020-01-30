function createSocialDBOpsServiceMixin (execlib, datalib) {
  'use strict';

  var execSuite = execlib.execSuite,
    lib = execlib.lib,
    q = lib.q,
    qlib = lib.qlib,
    jobs = require('./jobs')(execlib);

  function qtruereturner () {
    return q(true);
  }

  function ProfileUpdateStore (socialservice) {
    lib.Destroyable.call(this);
    this.socialservice = socialservice;
    socialservice.destroyed.attachForSingleShot(this.destroy.bind(this));
  }
  lib.inherit(ProfileUpdateStore, lib.Destroyable);
  ProfileUpdateStore.prototype.__cleanUp = function () {
    this.socialservice = null;
  };
  ProfileUpdateStore.prototype.beginInit = qtruereturner;
  ProfileUpdateStore.prototype.endInit = qtruereturner;
  ProfileUpdateStore.prototype.update = function (filter, updhash) {
    if (!this.socialservice) {
      return q.reject(new lib.Error('NO_SOCIAL_SERVICE', 'Social service is destroyed'));
    }
    this.socialservice.onSocialProfileUpdate(filter.fieldvalue, updhash);
    return qtruereturner();
  };
  ProfileUpdateStore.prototype.delete = qtruereturner;
  ProfileUpdateStore.prototype.create = qtruereturner;


  function SocialDBOpsServiceMixin (prophash) {
    if (!prophash.usersdbresolvername) {
      throw new Error('SocialDBOpsServiceMixin needs the usersdbresolvername property in its constructor property hash');
    }
    this.socialDBOpsDecoder = new datalib.DataDecoder(new ProfileUpdateStore(this));
    //this.socialDBOpsProfileUpdateDefer = q.defer();
    this.socialDBOpsJobs = new qlib.JobCollection();
    this.socialDBOpsUpdateNeeds = prophash.socialdbopsupdateneeds || {};
    this.findRemote(prophash.usersdbresolvername, null, 'UsersDBResolver');
    this.state.data.listenFor('UsersDBResolver', this.socialDBOpsOnUsersDBResolver.bind(this), true);
  }
  SocialDBOpsServiceMixin.prototype.destroy = function () {
    this.socialDBOpsUpdateNeeds = null;
    if (this.socialDBOpsJobs) {
      this.socialDBOpsJobs.destroy();
    }
    this.socialDBOpsJobs = null;
    //this.socialDBOpsProfileUpdateDefer = null;
    if (this.socialDBOpsDecoder) {
      this.socialDBOpsDecoder.destroy();
    }
    this.socialDBOpsDecoder = null;
  };
  SocialDBOpsServiceMixin.prototype.updateUserProfile = function (username, profileupdatehash) {
    return this.socialDBOpsJobs.run('.', new this.socialDBOpsJobCtors.UpdateUserProfileJob(this, username, profileupdatehash));
  };
  SocialDBOpsServiceMixin.prototype.updateUserProfileFromHash = function (username, profileupdatehash) {
    return this.socialDBOpsJobs.run('.', new this.socialDBOpsJobCtors.UpdateUserProfileFromHashJob(this, username, profileupdatehash));
  };
  SocialDBOpsServiceMixin.prototype.doUpdateUserProfile = execSuite.dependentServiceMethod([], ['UsersDBResolver'], function (ursink, username, profileupdatehash, defer) {
    qlib.promise2defer(ursink.call('updateUserUnsafe', username, profileupdatehash, {op:'set'}), defer);
  });
  SocialDBOpsServiceMixin.prototype.getUserProfile = execSuite.dependentServiceMethod([], ['UsersDBResolver'], function (ursink, username, defer) {
    qlib.promise2defer(ursink.call('fetchUser', {username: username}).then(
      qlib.resultpropertyreturner('profile')
    ), defer);
  });
  SocialDBOpsServiceMixin.prototype.socialDBOpsOnUsersDBResolver = function (dbopssink) {
    dbopssink.subConnect('db', {role: 'user', name: 'user'}).then(
      onResolverDB.bind(null, this.socialDBOpsDecoder)
    );
  };
  SocialDBOpsServiceMixin.prototype.onSocialProfileUpdate = function (filter, updhash) {
    this.state.set('lastSocialProfileUpdate', [filter, updhash]);
  };


  function onResolverDB (decoder, dbsink) {
    dbsink.sessionCall('query', {continuous: true}).then(
      null,
      null,
      decoder.onStream.bind(decoder)
    );
    decoder = null;
  }


  SocialDBOpsServiceMixin.addMethods = function (klass) {
    lib.inheritMethods(klass, SocialDBOpsServiceMixin
      ,'updateUserProfile'
      ,'updateUserProfileFromHash'
      ,'doUpdateUserProfile'
      ,'getUserProfile'
      ,'socialDBOpsOnUsersDBResolver'
      ,'onSocialProfileUpdate'
    );
    klass.prototype.socialDBOpsJobCtors = jobs;
  };

  return SocialDBOpsServiceMixin;
}

module.exports = createSocialDBOpsServiceMixin;

