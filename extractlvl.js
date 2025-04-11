const mongoose = require("mongoose");
const Level = require("./models/levels");

const fetchDatalvl = async (id, phonemez,difficulty) => {
    try {
        console.log("meow:",id)
        const userId = new mongoose.Types.ObjectId(id);
        const Data= await Level.findById(userId)
        console.log("extract mein Data:",Data) 
        return processPhonemes(Data.Assessment.data,phonemez,difficulty); // Pass Data directly
    } catch (err) {
        console.error("Error fetching data:", err);
        throw err; // Re-throw error to be caught in the route handler
    }
};

const processPhonemes = (data,phonemez,difficulty) => {
    let phonemeData = {}; // Store phoneme accuracy values

    console.log("type:", typeof data);
    console.log("isarray:", Array.isArray(data));


    data.forEach((entry) => {
        if (!Array.isArray(entry)) return; // Ensure `entry` is an array

        entry.forEach((wordObj) => { // Iterate over words in inner array
            console.log("Processing:", wordObj.Word);
            
            if (wordObj.Phonemes) {
                wordObj.Phonemes.forEach((phonemeObj) => {
                    const phoneme = phonemeObj.Phoneme;
                    if(phoneme===phonemez){
                        const accuracy = phonemeObj.PronunciationAssessment?.AccuracyScore; // Safe access

                        if (accuracy !== undefined) {
                            if (!phonemeData[phoneme]) {
                                phonemeData[phoneme] = [];
                            }
                            phonemeData[phoneme].push(accuracy);
                            
                        }
                    }
                    
                });
            }
        });
    });
    console.log(phonemeData)
//     { w: [ 20, 43, 43 ] }
// Average Accuracy for Each Phoneme: { w: '35.33' }
// Phonemes below threshold: [ [ 'w', '35.33' ] ]
// Low Accuracy Data: [ [ 'w', '35.33' ] ]

      
    // Calculate average accuracy for each phoneme
    let avgPhonemeAccuracy = {};
    for (let phoneme in phonemeData) {
        let accuracies = phonemeData[phoneme];
        let avgAccuracy =
            (accuracies.reduce((sum, score) => sum + score, 0) / accuracies.length).toFixed(2);
        avgPhonemeAccuracy[phoneme] = avgAccuracy;
    }

    console.log("Average Accuracy for Each Phoneme:", avgPhonemeAccuracy);
    const threshold=50;
    if (difficulty==="Easy"){threshold=40;}
    else if(difficulty==="Medium"){threshold=65;}
    else{
        threshold= 75;
    }
    const rate = rateByThreshold(avgPhonemeAccuracy, threshold, phonemez);
    return { score: avgPhonemeAccuracy[phonemez],  rate };
};



const rateByThreshold = (avgAccuracies, threshold, phonemez) => {
    const score = parseFloat(avgAccuracies[phonemez]);

    if (isNaN(score)) return null; // if phonemez doesn't exist

    if (score < threshold) {
        return "L";
    } else if (score > 80) {
        return "W";
    } else {
        return "M";
    }
};

module.exports = fetchDatalvl;
