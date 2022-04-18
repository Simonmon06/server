import mongoose from 'mongoose'
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

export default mongoose.model("Order", orderSchema)
