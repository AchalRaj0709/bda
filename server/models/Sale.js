const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: [true, 'Order ID is required'],
      unique: true,
      trim: true,
      index: true,
    },
    product: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      index: true,
    },
    region: {
      type: String,
      required: [true, 'Region is required'],
      trim: true,
      index: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    sales: {
      type: Number,
      required: [true, 'Sales amount is required'],
      min: [0, 'Sales cannot be negative'],
    },
    profit: {
      type: Number,
      required: [true, 'Profit amount is required'],
    },
    orderDate: {
      type: Date,
      required: [true, 'Order date is required'],
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound indexes for optimal aggregation performance
saleSchema.index({ category: 1, region: 1, orderDate: -1 });
saleSchema.index({ orderDate: -1, sales: -1 });

module.exports = mongoose.model('Sale', saleSchema);

