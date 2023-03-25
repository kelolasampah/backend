const { Order } = require("../models/order");
const express = require("express");
const { OrderItem } = require("../models/order-item");
const logger = require("../helpers/logger");
const router = express.Router();

router.get("/", async (req, res) => {
  const orderList = await Order.find()
    .populate("user", "name")
    .sort({ dateOrdered: -1 });

  if (!orderList) {
    return res.status(500).json({ success: false });
  }
  res.send(orderList);
});

router.get("/:id", async (req, res) => {
  const order = await Order.find(req.params.id)
    .populate("user", "name")
    .populate({
      path: "orderItems",
      populate: {
        path: "product",
        populate: [
          {
            path: "category",
            populate: "group",
          },
          {
            path: "merchant",
            select: [
              "phone",
              "regency",
              "province",
              "country",
              "merchant",
              "description",
            ],
          },
        ],
      },
    });

  if (!order) {
    return res.status(500).json({ success: false });
  }
  res.send(order);
});

router.get("/userid/:userid", async (req, res) => {
  const orderList = await Order.find({user: req.params.userid})
  .populate({
    path: "orderItems",
    populate: {
      path: "product",
      populate: [
        {
          path: "category",
          populate: "group",
        },
        {
          path: "merchant",
          select: [
            "phone",
            "regency",
            "province",
            "country",
            "merchant",
            "description",
          ],
        },
      ],
    },
  });

  if (!orderList) {
    return res.status(500).json({ success: false });
  }
  res.send(orderList);
});

router.get("/merchant/:merchant", async (req, res) => {
  let orderList = await Order.find().populate({
    path: "orderItems",
    populate: {
      path: "product",
      populate: [
        {
          path: "category",
          populate: "group",
        },
        {
          path: "merchant",
          select: [
            "phone",
            "regency",
            "province",
            "country",
            "merchant",
            "description",
          ],
        },
      ],
    },
  });

  orderList = orderList.filter((t) => {
    return t.orderItems.some((u) => {
      return u.product.merchant.merchant === req.params.merchant;
    });
  });

  if (!orderList) {
    return res.status(500).json({ success: false });
  }
  res.send(orderList);
});

router.post("/", async (req, res) => {
  const orderItemsIds = Promise.all(
    req.body.orderItems.map(async (orderitem) => {
      let newOrderItem = new OrderItem({
        quantity: orderitem.quantity,
        product: orderitem.product,
      });

      newOrderItem = await newOrderItem.save();

      return newOrderItem._id;
    })
  );

  const orderItemsIdsResolved = await orderItemsIds;

  const totalPrices = await Promise.all(
    orderItemsIdsResolved.map(async (orderItemId) => {
      const orderItem = await OrderItem.findById(orderItemId).populate(
        "product",
        "price"
      );

      const totalPrice = orderItem.product.price * orderItem.quantity;

      return totalPrice;
    })
  );

  const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

  logger.info(totalPrices);

  let order = new Order({
    orderItems: orderItemsIdsResolved,
    shippingAddress1: req.body.shippingAddress1,
    shippingAddress2: req.body.shippingAddress2,
    zip: req.body.zip,
    village: req.body.village,
    district: req.body.district,
    regency: req.body.regency,
    province: req.body.province,
    country: req.body.country,
    phone: req.body.phone,
    status: req.body.status,
    totalPrice: totalPrice,
    user: req.body.user,
  });
  order = await order.save();

  if (!order) return res.status(400).send("The order cannot be created!");

  req.app.io.of("/").emit("io_to_admin", {
    channel: "order",
    message: order,
  });

  res.status(200).send(order);
});

router.put("/:id", async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    {
      status: req.body.status,
    },
    { new: true }
  );

  if (!order) return res.status(400).send("The order cannot be update!");

  res.send(order);
});

router.delete("/:id", (req, res) => {
  Order.findByIdAndRemove(req.params.id)
    .then(async (order) => {
      if (order) {
        await order.orderItems.map(async (orderItem) => {
          await OrderItem.findByIdAndRemove(orderItem);
        });
        return res
          .status(200)
          .json({ success: true, message: "The order is deleted!" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "Order not found!" });
      }
    })
    .catch((err) => {
      return res.status(500).json({ success: false, error: err });
    });
});

router.get("/get/totalsales", async (req, res) => {
  const totalSales = await Order.aggregate([
    { $group: { _id: null, totalsales: { $sum: "$totalPrice" } } },
  ]);

  if (!totalSales) {
    return res.status(400).send("The order sales cannot be generated");
  }

  res.send({ totalsales: totalSales.pop().totalsales });
});

router.get("/get/count", async (req, res) => {
  const orderCount = await Order.countDocuments();

  if (!orderCount) {
    return res.status(500).json({ success: false });
  }
  res.send({
    orderCount: orderCount,
  });
});

router.get("/get/count/:userid", async (req, res) => {
  const orderCount = await Order.countDocuments({
    merchant: req.params.userid,
  });

  if (!orderCount) {
    return res.status(500).json({ success: false });
  }
  res.send({
    orderCount: orderCount,
  });
});

router.get("/get/userorders/:userid", async (req, res) => {
  const userOrderList = await Order.find({ user: req.params.userid })
    .populate({
      path: "orderItems",
      populate: {
        path: "product",
        populate: [
          {
            path: "category",
            populate: "group",
          },
          {
            path: "merchant",
            select: [
              "phone",
              "regency",
              "province",
              "country",
              "merchant",
              "description",
            ],
          },
        ],
      },
    })
    .sort({ dateOrdered: -1 });

  if (!userOrderList) {
    return res.status(500).json({ success: false });
  }
  res.send(userOrderList);
});

module.exports = router;
