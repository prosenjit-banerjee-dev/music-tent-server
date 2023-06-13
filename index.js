const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;
const jwt = require("jsonwebtoken");

//middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tbmpk5j.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    //  dynamic
    const classesCollection = client.db("musicDB").collection("classes");
    const selectClassCollection = client
      .db("musicDB")
      .collection("selectedClasses");
    const usersCollection = client.db("musicDB").collection("users");

    // pre build
    const instructorCollection = client.db("musicDB").collection("instructors");
    const testimonialCollection = client
      .db("musicDB")
      .collection("testimonials");
    const popularClassesCollection = client
      .db("musicDB")
      .collection("popularClasses");

    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1hr",
      });
      res.send({ token });
    });

    //popular  Classes
    app.get("/popularClasses", async (req, res) => {
      const result = await popularClassesCollection.find().toArray();
      res.send(result);
    });
    //instructor collections
    app.get("/instructors", async (req, res) => {
      const result = await instructorCollection.find().toArray();
      res.send(result);
    });
    //classes collections
    app.get("/classes", async (req, res) => {
      const result = await classesCollection.find().toArray();
      res.send(result);
    });
    app.get("/classes/approved", async (req, res) => {
      const query = { status: "approved" };
      const result = await classesCollection.find().toArray();
      res.send(result);
    });
    app.post("/classes", async (req, res) => {
      const classes = req.body;
      const result = await classesCollection.insertOne(classes);
      res.send(result);
    });

    app.patch("/classes/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = { _id: new ObjectId(id) };
      const query = req.body.status;
      console.log(query);
      if (query === "approved") {
        const updateStatus = {
          $set: {
            status: "approved",
          },
        };
        const result = await classesCollection.updateOne(filter, updateStatus);
        return res.send(result);
      }
      if (query === "deny") {
        const updateStatus = {
          $set: {
            status: "deny",
          },
        };
        const result = await classesCollection.updateOne(filter, updateStatus);
        return res.send(result);
      }
    });
    // Select Classes
    app.get("/selectedclasses", async (req, res) => {
      const email = req.query.email;
      console.log(email);
      if (!email) {
        res.send([]);
      }
      const query = { email: email };
      const result = await selectClassCollection.find(query).toArray();
      res.send(result);
    });
    app.post("/selectedclasses", async (req, res) => {
      const myClass = req.body;
      const result = await selectClassCollection.insertOne(myClass);
      res.send(result);
    });
    //users collections
    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });
    app.post("/users", async (req, res) => {
      const user = req.body;
      console.log(user);
      const query = { email: user.email };
      const alreadyUsers = await usersCollection.findOne(query);
      if (alreadyUsers) {
        return res.send({ message: "This user is already exists!" });
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });
    app.patch("/users/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = { _id: new ObjectId(id) };
      const query = req.body.role;
      console.log(query);
      if (query === "instructor") {
        const updateRole = {
          $set: {
            role: "instructor",
          },
        };
        const result = await usersCollection.updateOne(filter, updateRole);
        return res.send(result);
      }
      if (query === "admin") {
        const updateRole = {
          $set: {
            role: "admin",
          },
        };
        const result = await usersCollection.updateOne(filter, updateRole);
        return res.send(result);
      }
      // const alreadyAdmin = await usersCollection.findOne(query);
      // if (alreadyAdmin) {
      //   return res.send({ message: "This user is already admin!" });
      // }
    });

    //Testimonials
    app.get("/testimonials", async (req, res) => {
      const result = await testimonialCollection.find().toArray();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Music Tent server is running");
});

app.listen(port, () => {
  console.log(`MUsic tent server is running on port: ${port}`);
});
