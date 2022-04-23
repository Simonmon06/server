const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema

const orderSchema = new mongoose.Schema(
  {
    item: {
      type: ObjectId,
      ref: "Item",
    },
    session: {},
    orderedBy: { type: ObjectId, ref: "User" },
  },
  { timestamps: true }
)

module.exports=mongoose.model("Order", orderSchema)
