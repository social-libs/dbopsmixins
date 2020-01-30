module.exports = {
  updateUserProfile: [{
    name: 'Username', 
    type: 'string'
  },{
    name: 'Update hash',
    type: 'object'
  }],
  updateUserProfileFromHash: [{
    name: 'Username', 
    type: 'string'
  },{
    name: 'Update hash',
    type: 'object'
  }],
  getUserProfile: [{
    name: 'Username', 
    type: 'string'
  }],
  getUserProfileNotifications: true
};
