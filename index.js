const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion } = require("mongodb");
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
    const instructorCollection = client.db("musicDB").collection("instructors");
    const classesCollection = client.db("musicDB").collection("classes");
    const usersCollection = client.db("musicDB").collection("users");

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
    app.post("/classes", async (req, res) => {
      const classes = req.body;
      console.log(classes);
      const result = await classesCollection.insertOne(classes);
      res.send(result);
    });
    //users collections
   
    app.post("/users", async (req, res) => {
      const user = req.body;
      console.log(user);
      const query = { email: user.email };
      const alreadyUsers = await usersCollection.findOne(query);
      console.log('alreadyUsers',alreadyUsers)
      if (alreadyUsers) {
        return res.send({ message: "This user is already exists!" });
      }
      const result = await usersCollection.insertOne(user);
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
