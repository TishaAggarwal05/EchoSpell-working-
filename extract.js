const mongoose = require("mongoose");
const Phoneme = require("./models/users");

const fetchData = async (id) => {
    try {
        console.log("meow:",id)
        const userId = new mongoose.Types.ObjectId(id);
        const Data= await Phoneme.findById(userId)
        console.log("extract mein Data:",Data) 
        return processPhonemes(Data.initialAssessment.data); // Pass Data directly
    } catch (err) {
        console.error("Error fetching data:", err);
        throw err; // Re-throw error to be caught in the route handler
    }
};

const processPhonemes = (data) => {
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
                    const accuracy = phonemeObj.PronunciationAssessment?.AccuracyScore; // Safe access

                    if (accuracy !== undefined) {
                        if (!phonemeData[phoneme]) {
                            phonemeData[phoneme] = [];
                        }
                        phonemeData[phoneme].push(accuracy);
                        
                    }
                });
            }
        });
    });
    console.log(phonemeData)
    //sample:
    // {
    //     dh: [ 47 ],
    //     ih: [ 39, 42 ],
    //     s: [ 23, 27 ],
    //     p: [ 94 ],
    //     iy: [ 81 ],
    //     t: [ 47, 79 ],
    //     ax: [ 29 ],
    //     z: [ 23 ],
    //     h: [ 53 ],
    //     aa: [ 70 ]
    //   }
      
    // Calculate average accuracy for each phoneme
    let avgPhonemeAccuracy = {};
    for (let phoneme in phonemeData) {
        let accuracies = phonemeData[phoneme];
        let avgAccuracy =
            (accuracies.reduce((sum, score) => sum + score, 0) / accuracies.length).toFixed(2);
        avgPhonemeAccuracy[phoneme] = avgAccuracy;
    }

    console.log("Average Accuracy for Each Phoneme:", avgPhonemeAccuracy);
    const lowAccur=filterByThreshold(avgPhonemeAccuracy, 70); // Example threshold = 70
    return {lowAccur, avgPhonemeAccuracy }
};



const filterByThreshold = (avgPhonemeAccuracy, threshold) => {
    let lowAccuracyPhonemes = Object.entries(avgPhonemeAccuracy).filter(
        ([phoneme, avg]) => avg < threshold
    );
    
    console.log("Phonemes below threshold:", lowAccuracyPhonemes);
    return lowAccuracyPhonemes;
};

module.exports = fetchData;
