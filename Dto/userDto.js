class LoginDTO {
    _id;
    mobileNo;
    fullName;
    email;
    avatar;
    role;
    createdAt;
    updatedAt;
  
    constructor(data) {
      this._id = data._id;
      this.fullName = data.fullName;
      this.email = data.email;
      this.avatar = data.avatar;
      this.mobileNo = data.mobileNo;
      this.role = data.role;
      this.createdAt = data.createdAt;
      this.updatedAt = data.updatedAt;
    }
  }
  module.exports = { LoginDTO };
  