const mongoose =  require("mongoose");
const { db_name } = require("../constants.js");

const connectDB = async () => {
  try {
   
   const connectionInstance =  await mongoose.connect(`${process.env.mongodb_url}/${db_name}`);

    console.log(`\n database connected... ${connectionInstance.connection.host}`);
    
} catch (error) {
    console.log("Mongodb connect error", error);
    process.exit(1);
  }
};



module.exports = connectDB