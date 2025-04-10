const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Phoneme = require('./models/phoneme'); // Correct model import

const app = express();
app.use(express.json());

async function main() {
  await mongoose.connect("mongodb+srv://aggarwaltisha05:BPKZJJE5w1UbflBf@echospell.rgovwms.mongodb.net/EchoSpell");
}
main().catch(err => console.log(err));

const filePath = path.join(__dirname, 'public', 'jsonformatter.json');

// Route to insert JSON file data into MongoDB
app.post('/upload-json', async (req, res) => {
    try {
        // Read JSON file
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

        // Transform each object to match schema (renaming keys)
        const formattedData = data.map(obj => ({
            instruction: obj["instruction"],
            levelname: obj["Level Name"],  // Matches JSON key
            fantasyPrompt: obj["Fantasy Prompt"],  // Matches JSON key
            speechExercise: obj["Speech Exercise"]  // Matches JSON key
        }));

     

        // Insert all documents into MongoDB using the correct model (Phoneme)
        await Phoneme.insertMany(formattedData);

        res.status(201).json({ message: 'Data uploaded successfully', count: formattedData.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));
