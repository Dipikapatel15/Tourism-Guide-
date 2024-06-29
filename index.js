const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
mongoose.connect('mongodb://0.0.0.0:27017/touristDB');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Define a schema and model for the form data
const touristSchema = new mongoose.Schema({
    headName: String,
    adults: Number,
    children: Number,
    budget: Number,
    travelStart: Date,
    travelEnd: Date
});

const Tourist = mongoose.model('Tourist', touristSchema);

// Define a schema and model for the packages
const packageSchema = new mongoose.Schema({
    place: String,
    price_adult: Number,
    price_children: Number
});

const Package = mongoose.model('Package', packageSchema);

// Handle form submission
app.post('/sign_up', async (req, res) => {
    const { headName, adults, children, budget, travelStart, travelEnd } = req.body;
    const newTourist = new Tourist({ headName, adults, children, budget, travelStart, travelEnd });

    try {
        await newTourist.save();
        console.log('Record inserted successfully');

        // Fetch all packages from the database
        const packages = await Package.find();

        // Calculate the total cost for each destination and filter based on the provided budget
        const filteredPlaces = packages.filter(pkg => {
            const totalCost = (pkg.price_adult * adults) + (pkg.price_children * children);
            return totalCost <= budget;
        });

        // Send the filtered places back to the client
        res.json(filteredPlaces);
    } catch (err) {
        console.error('Error saving to database:', err);
        res.status(500).send('Error saving to database');
    }
});

// Start the server
app.listen(3000, () => {
    console.log('Server is listening on port 3000');
});
