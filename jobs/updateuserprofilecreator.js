function createUpdateUserProfileJob (execlib, mylib) {
  'use strict';

  var lib = execlib.lib,
    qlib = lib.qlib,
    q = lib.q,
    JobOnDestroyable = qlib.JobOnDestroyable;

  function UpdateUserProfileJob (service, username, profileupdatehash, defer) {
    JobOnDestroyable.call(this, service, defer);
    this.username = username;
    this.profileupdatehash = profileupdatehash;
    this.updateresult = null;
  }
  lib.inherit(UpdateUserProfileJob, JobOnDestroyable);
  UpdateUserProfileJob.prototype.destroy = function () {
    this.updateresult = null;
    this.profileupdatehash = null;
    this.username = null;
    JobOnDestroyable.prototype.destroy.call(this);
  };
  UpdateUserProfileJob.prototype.go = function () {
    var ok = this.okToGo();
    if (!ok.ok) {
      return ok.val;
    }
    this.destroyable.doUpdateUserProfile(this.username, this.profileupdatehash).then(
      this.onUserProfileUpdated.bind(this),
      this.reject.bind(this)
    );
    return ok.val;
  };
  UpdateUserProfileJob.prototype.onUserProfileUpdated = function (updateresult) {
    if (!this.okToProceed()) {
      return;
    }
    this.updateresult = updateresult;
    if (!this.destroyable.socialDBOpsUpdateNeeds) {
      this.resolve(this.updateresult);
      return;
    }
    if (this.anyUpdateHintNeedsUserRecord()) {
      this.destroyable.getUserProfile(this.username).then(
        this.invokeUpdateHints.bind(this),
        this.reject.bind(this)
      );
      return;
    }
    this.invokeUpdateHints();
  };
  UpdateUserProfileJob.prototype.anyUpdateHintNeedsUserRecord = function () {
    var doesneedobj, ret;
    if (!this.destroyable.socialDBOpsUpdateNeeds) {
      return false;
    }
    doesneedobj = {
      doesneed: false,
      update: this.profileupdatehash
    };
    lib.traverseShallow(
      this.destroyable.socialDBOpsUpdateNeeds,
      needsuserrecorder.bind(null, doesneedobj)
    );
    ret = doesneedobj.doesneed;
    doesneedobj = null;
    return ret;
  };

  function needsuserrecorder (doesneedobj, hint, hintname) {
    if (!(hintname in doesneedobj.update)) {
      return;
    }
    if (!hint) {
      return;
    }
    if (hint.needsuserrecord) {
      doesneedobj.doesneed = true;
    }
  }

  UpdateUserProfileJob.prototype.invokeUpdateHints = function (userrecord) {
    var psobj;
    if (!this.okToProceed()) {
      return;
    }
    if (!this.destroyable.socialDBOpsUpdateNeeds) {
      this.resolve(this.updateresult);
      return;
    }
    psobj = {
      promises: [],
      userrecord: userrecord,
      update: this.profileupdatehash
    };
    lib.traverseShallow(
      this.destroyable.socialDBOpsUpdateNeeds, 
      hintactivator.bind(null, psobj)
    );
    q.all(psobj.promises).then(
      this.resolve.bind(this, this.updateresult),
      this.reject.bind(this)
    );
    psobj = null;
  };

  function hintactivator (psobj, hint, hintname) {
    var actres;
    if (!(hintname in psobj.update)) {
      return;
    }
    if (!hint) {
      return;
    }
    if (hint.needsuserrecord) {
      actres = hint.cb(psobj.userrecord);
    } else {
      actres = hint();
    }
    if (q.isThenable(actres)) {
      psobj.promises.push(actres);
    }
  }

  mylib.UpdateUserProfileJob = UpdateUserProfileJob;
}
module.exports = createUpdateUserProfileJob;
