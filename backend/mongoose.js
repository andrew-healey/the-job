const SALT_ROUNDS = 12;
module.exports = new Promise(async (resolve, reject) => {
  const bcrypt=require("bcrypt");
  const mongoose = require("mongoose");
  require("dotenv").config();

  mongoose.connect(process.env.DATABASE.replace(/<password>/, process.env.PASSWORD), {
    useNewUrlParser: true
  });
  const db = mongoose.connection;

  //Model declaration go here
  let User;

  const {
    ObjectId
  } = mongoose.Schema.Types;
  //Schema initializations go here
  const users = new mongoose.Schema({
    username:{
      type: String,
      required:true,
    },
    password:{
      type: String,
      required:true,
    }
  });

  users.statics.create=async function({username,password}){
    const hashPassword=await bcrypt.hash(password,SALT_ROUNDS);
    if(await User.findOne({username})) throw "User already exists";
    const user=new User({username,password:hashPassword});
    await user.save();
    return user;
  };

  users.statics.validate=async function({username,password}){
    const userAccount=await User.findOne({username});
    if(!userAccount) throw "User not found";
    if(await bcrypt.compare(password,userAccount.password))
      return true;
    throw "Invalid password";
  };

  db.on("error", err => reject(err));
  db.on("open", () => {
    console.log("Connected");

    //Model initializations go here
    User=mongoose.model('User',users);

    resolve({
      //Models go here
      User,
    });

  });
});
