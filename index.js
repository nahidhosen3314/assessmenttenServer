const express = require("express");
const dotenv = require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const app = express();

// port
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

console.log();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@clusterdev.vuqw7lb.mongodb.net/?retryWrites=true&w=majority&appName=ClusterDev`;
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
        //await client.connect();

        // database and collections
        const database = client.db("happyTravelDB");
        const userCollection = database.collection("Users");
        const touristCollection = database.collection("Tourists");
        const CountryCollection = database.collection("Countries");

        // create single user
        app.post("/users", async (req, res) => {
            const user = await userCollection.insertOne(req.body);
            res.send(user);
        });

        // add tourist spot
        app.post("/tourists", async (req, res) => {
            const tourist = await touristCollection.insertOne(req.body);
            res.send(tourist);
        });

        // get all the places
        app.get("/tourists", async (req, res) => {
            const tourists = await touristCollection.find().toArray();
            res.send(tourists);
        });
        
        // get single the places
        app.get("/tourists/:id", async (req, res) => {
            const id = req.params.id;
            const tourist = await touristCollection.findOne({
                _id: new ObjectId(id),
            });
            res.send(tourist);
        });

        // get places by country
        app.get("/tourists/country/:name", async (req, res) => {
            const tourist = await touristCollection
                .find({country: req.params.name})
                .toArray();
            res.send(tourist);
        })

        // get specific user added the places
        app.get("/mylist/:id", async (req, res) => {
            const mylist = await touristCollection
                .find({
                    user_id: req.params.id,
                })
                .toArray();
            res.send(mylist);
        });

        // get mylist specific item
        app.get("/update-mylist/:id", async (req, res) => {
            const data = await touristCollection.findOne({
                _id: new ObjectId(req.params.id),
            });
            res.send(data);
        });

        // update mylist item
        app.put("/update-mylist/:id", async (req, res) => {
            const {
                areaImage,
                area,
                country,
                location,
                description,
                avg_cost,
                seasonality,
                duration,
                total_visitors,
            } = req.body;

            const mylist = await touristCollection.updateOne(
                {
                    _id: new ObjectId(req.params.id),
                },
                {
                    $set: {
                        areaImage,
                        area,
                        country,
                        location,
                        description,
                        avg_cost,
                        seasonality,
                        duration,
                        total_visitors,
                    },
                },
                { upsert: true }
            );
            res.send(mylist);
        });

        // find one and delete item from mylist
        app.delete("/mylist/:id", async (req, res) => {
            const mylistItem = await touristCollection.deleteOne({
                _id: new ObjectId(req.params.id),
            });
            res.send(mylistItem);
        });

        // get all the countries category
        app.get("/countries", async (req, res) => {
            const countries = await CountryCollection.find().toArray();
            res.send(countries);
        })

        // get single country
        app.get("/countries/:name", async (req, res) => {
            
            const singleCountry = await CountryCollection.findOne({
                country: req.params.name
            });
            res.send(singleCountry);
        })
        

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        //await client.close();
    }
}
run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
