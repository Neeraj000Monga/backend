// Start server
const express = require("express");
const cors = require("cors");
require("./db/config");
const User = require("./db/User");
const Product = require("./db/Product");

const Jwt = require("jsonwebtoken");
const JwtKey = "E-Comm";
const app = express();

app.use(express.json());
app.use(cors());

// ****************** register **********************

app.post("/register", async (req, resp) => {
  const user = new User(req.body);
  result = await user.save();
  result = result.toObject();
  delete result.password;
  // =
  Jwt.sign({ result }, JwtKey, { expiresIn: "2h" }, (err, token) => {
    if (err) {
      resp.send({
        result: "Something Went Wrong Please Try After Sometime",
      });
    }
    resp.send({ result, auth: token });
  });
});
// ********************* login ***********************
app.post("/login", async (req, resp) => {
  console.log(req.body);
  if (req.body.email && req.body.password) {
    let user = await User.findOne(req.body).select("-password");
    if (user) {
      // =
      Jwt.sign({ user }, JwtKey, { expiresIn: "2h" }, (err, token) => {
        if (err) {
          resp.send({
            result: "Something Went Wrong Please Try After Sometime",
          });
        }
        resp.send({ user, auth: token });
      });

      // =
    } else {
      resp.send({ result: "No User Found" });
    }
  } else {
    resp.send({ result: "An error occurred" });
  }
});
// ******************* add-product =====================
app.post("/add-product", verifyToken, async (req, resp) => {
  let product = new Product(req.body);
  let result = await product.save();
  resp.send(result);
});

// ******************* products ********************
app.get("/products", verifyToken, async (req, resp) => {
  let products = await Product.find();
  if (products.length > 0) {
    resp.send(products);
  } else {
    resp.send({ result: "No Products Found" });
  }
});

// ******************* delete ********************
app.delete("/product/:id", verifyToken, async (req, resp) => {
  //  resp.send(req.params.id)
  const result = await Product.deleteOne({ _id: req.params.id });
  resp.send(result);
});

// ******************* id ********************
app.get("/product/:id", verifyToken, async (req, resp) => {
  let result = await Product.findOne({ _id: req.params.id });
  if (result) {
    resp.send(result);
  } else {
    resp.send({ result: "No Record Found" });
  }
});

// ******************* updateOne ********************

app.put("/product/:id", verifyToken, async (req, resp) => {
  let result = await Product.updateOne(
    { _id: req.params.id },
    { $set: req.body }
  );
  resp.send(result);
});

app.get("/search/:key", verifyToken, async (req, resp) => {
  let result = await Product.find({
    $or: [
      {
        name: { $regex: req.params.key },
      },
      {
        company: { $regex: req.params.key },
      },
      {
        categoty: { $regex: req.params.key },
      },
    ],
  });
  resp.send(result);
});

function verifyToken(req, resp, next) {
  let token = req.headers["authorization"];
  if (token) {
    token = token.split(" ")[1];
    Jwt.verify(token, JwtKey, (err, valid) => {
      if (err) {
        resp.status(401).send({ result: "Please provide valid token" });
      } else {
        next();
      }
    });
  } else {
    resp.status(403).send({ result: "Please add token with header" });
  }
}

// Start server
app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
// ****************************************************
