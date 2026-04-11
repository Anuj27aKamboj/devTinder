const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      lowercase:true, 
      enum: {
        values: ["ignored", "interested", "rejected", "accepted"],
        message: "{VALUE} is incorrect status type",
      },
    },
  },
  {
    timestamps: true,
  },
);

connectionRequestSchema.index({fromUserId:1, toUserId:1, status: 1 });

connectionRequestSchema.pre("save", function(){
    if(this.fromUserId.equals(this.toUserId)){
        throw new Error("Invalid Connection Requset")
    }
})


module.exports = mongoose.model("ConnectionRequest", connectionRequestSchema);