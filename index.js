const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();
const cors = require('cors');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gchbg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run(){
    try{
        await client.connect();
        
        const database = client.db('best_cycle');
        const productsCollection = database.collection('products');
        const orderCollection = database.collection('orders');
        const reviewCollection = database.collection('reviews');
        const usersCollection = database.collection('users');

        //post api
        app.post('/addProduct', async(req, res)=>{
          const product = req.body;
          const result = await productsCollection.insertOne(product);
          res.json(result);
        })

        //get api
        app.get('/allProduct', async(req, res)=>{
          const result = await productsCollection.find({}).limit(6).toArray();
          res.send(result);
        })

        app.get('/explore', async(req, res)=>{
          const result = await productsCollection.find({}).toArray();
          res.send(result);
        })

        app.delete('/deleteproduct/:id', async(req, res)=>{
          const id = req.params.id;
          const query = {_id: ObjectId(id)};
          const result = await productsCollection.deleteOne(query);
          res.json(result);
        })

        //get single api
        app.get('/singleService/:id', async(req, res)=>{
          const id = req.params.id;
          const query = {_id: ObjectId(id)};
          const result = await productsCollection.findOne(query);
          res.send(result);
        })

        //post reviews api
        app.post('/addreview', async(req, res)=>{
          const review = req.body;
          const result = await reviewCollection.insertOne(review);
          res.json(result);
        })

        //get reviews api
        app.get('/showreview', async(req, res)=>{
          const result = await reviewCollection.find({}).toArray();
          res.json(result);
        })

        //Order Posting API
        app.post('/placeOrder', async(req, res)=>{
          const order = req.body;
          const result = await orderCollection.insertOne(order);
          res.json(result);
        })

        app.get('/allOrders', async(req, res)=>{
          const result = await orderCollection.find({}).toArray();
          res.json(result);
        })

        //Order getting Api
        app.get('/myOrder', async(req, res)=>{
          const email = req.query.email;
          const query = { email: email };
          const result = await orderCollection.find(query).toArray();
          res.json(result);
        })

         //Order Deleting API 
         app.delete('/deleteOrder/:id', async(req, res)=>{
          const id = req.params.id;
          const query = {_id: ObjectId(id)};
          const result = await orderCollection.deleteOne(query);
          res.json(result);
        })

        //Update Status
        app.put('/updateStatus/:id', async(req, res)=>{
          const id = req.params.id;
          const updatedStatus = req.body.status;
          const filter = {_id: ObjectId(id)};
          const options = { upsert : true };
          const updatedDoc = {
              $set: {
                  status: updatedStatus
              }
          };
          const result = await orderCollection.updateOne(filter, updatedDoc, options);
          res.json(result);
          
      })

      //Admin checking Api
      app.get('/users/:email', async(req, res)=>{
        const email = req.params.email;
        const query = { email: email };
        const user = await usersCollection.findOne(query);
        let isAdmin = false;
        if(user?.role === 'admin'){
            isAdmin = true;
        }
        res.json({ admin: isAdmin });
      })

      //post api for users
      app.post('/users', async(req, res)=>{
        const product = req.body;
        const result = await usersCollection.insertOne(product);
        res.json(result);
      })

      //Update Api
      app.put('/users', async(req, res)=>{
        const user = req.body;
        const filter = { email: user.email };
        const options = { upsert: true };
        const updateDoc = { $set: user };
        const result = await usersCollection.updateOne(filter, updateDoc, options);
        res.json(result);
      })

      //Add Admin
      app.put('/users/admin', async(req, res)=>{
        const user = req.body;
        const filter = { email: user.email };
        const updateDoc = { $set: { role: 'admin' } };
        const result = await usersCollection.updateOne(filter, updateDoc);
        res.json(result);
      })

    }
    finally{
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Best_Cycle is going good!')
})

app.listen(port, () => {
  console.log(`listening at :${port}`)
})