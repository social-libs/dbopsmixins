function createUpdateUserProfileFromHashJob (execlib, mylib) {
  'use strict';

  var lib = execlib.lib,
    qlib = lib.qlib,
    q = lib.q,
    JobOnDestroyable = qlib.JobOnDestroyable;

  function UpdateUserProfileFromHashJob (service, username, profileupdatehash, defer) {
    JobOnDestroyable.call(this, service, defer);
    this.username = username;
    this.profileupdatehash = profileupdatehash;
    this.updatekeys = null;
  }
  lib.inherit(UpdateUserProfileFromHashJob, JobOnDestroyable);
  UpdateUserProfileFromHashJob.prototype.destroy = function () {
    this.updatekeys = null;
    this.profileupdatehash = null;
    this.username = null;
    JobOnDestroyable.prototype.destroy.call(this);
  };
  UpdateUserProfileFromHashJob.prototype.go = function () {
    var ok = this.okToGo();
    if (!ok.ok) {
      return ok.val;
    }
    if (this.updatekeys) {
      return ok.val;
    }
    if (!(lib.isVal(this.profileupdatehash) && 'object' === typeof this.profileupdatehash)) {
      this.resolve(true);
      return ok.val;
    }
    this.updatekeys = Object.keys(this.profileupdatehash);
    this.doUpdateKey();
    return ok.val;
  };
  UpdateUserProfileFromHashJob.prototype.doUpdateKey = function () {
    var key, profsubhash;
    if (!this.okToProceed()) {
      return;
    }
    key = this.updatekeys.shift();
    if (!key) {
      this.resolve(true);
      return;
    }
    profsubhash = {};
    profsubhash[key] = this.profileupdatehash[key];
    (new mylib.UpdateUserProfileJob(this.destroyable, this.username, profsubhash)).go().then(
      this.doUpdateKey.bind(this),
      this.reject.bind(this)
    );
  };

  mylib.UpdateUserProfileFromHashJob = UpdateUserProfileFromHashJob;
}
module.exports = createUpdateUserProfileFromHashJob;

