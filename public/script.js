let sdk = window.SpeechSDK;
let recognizer;
let stopRecording;
const subscriptionKeyy = "7hTJEP2PRP6GVLKdMW6G1xnZuSHvtd88ViaxUzCGDkrpO2wevV2pJQQJ99BCACYeBjFXJ3w3AAAYACOGDF8O";
const serviceRegionn = "eastus";

let referenceText = document.getElementById("referenceText").innerText;


let audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();
let speechConfig = sdk.SpeechConfig.fromSubscription(subscriptionKeyy, serviceRegionn);

speechConfig.speechRecognitionLanguage = "en-US";
const pronunciationAssessmentConfig = new sdk.PronunciationAssessmentConfig(
    
    referenceText, // Reference text to compare against
    sdk.PronunciationAssessmentGradingSystem.HundredMark, // 100-point scale
    sdk.PronunciationAssessmentGranularity.Phoneme, // Enable phoneme-level analysis
    true // Enable fluency assessment
);

pronunciationAssessmentConfig.enableProsodyAssessment = true; // Enable prosody (intonation) assessment





function scrollText() {
    const scrollContainer = document.getElementById("scrollContainer");
    scrollContainer.scrollTop += 30; // Adjust scrolling speed
}







function missed_check(missingWords){
    console.log(`You missed: ${missingWords.join(", ")}. Try again!`);
    document.getElementById("recognizedText").innerText = `You missed: ${missingWords.join(", ")}. Try again!`
}


let recognizedText = "";
let totalN_best=[];
async function assessing(callback1){
    return new Promise((resolve, reject) => {
    // This is an event that fires when speech is successfully recognized. It allows you to handle recognized speech data
    recognizer.recognized =async(s, e) => {
        let data = e.result.properties.getProperty(sdk.PropertyId.SpeechServiceResponse_JsonResult);
        // console.log(data);
        let jsonData = JSON.parse(data);
        if (jsonData.DisplayText) {
            recognizedText += jsonData.DisplayText.slice(0, -1) + " ";
            document.getElementById("recognizedText").innerText = recognizedText;
            //scrollText();
        }

        totalN_best.push(jsonData.NBest[0].Words);
        resolve({ recognizedText, totalN_best });
     
        
    };}

    )};
        
const unvis_id= document.getElementById('unvis-id').innerHTML;
const is_initial= document.getElementById('is-initial').innerHTML;

async function sendDataToBackendinit(totalN_best) {
    try {
        const response = await fetch(`/initassessment/${unvis_id}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ totalN_best })
        });
        
        const result = await response.json();
        console.log("Data saved successfully:", result.message);
        window.location.href = result.redirect;
        
    } 
    catch (error) {
        console.error("Error sending data:", error);
    }
}
async function sendDataToBackendlevel(totalN_best) {
    try {
        const unvis_phoneme= document.getElementById('unvis-phoneme').innerHTML;
        const response = await fetch(`/level/${referenceText}/${unvis_id}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ totalN_best })
        });
        
        const result = await response.json();
        console.log("Data saved successfully:", result.message);
        window.location.href = result.redirect;
        
    } 
    catch (error) {
        console.error("Error sending data:", error);
    }
}
    









document.getElementById("startBtn").addEventListener("click", () => {
    // speech is recognized
    document.getElementById("recognizedText").innerText =""
    recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
    
    // (Optional) get the session ID
    recognizer.sessionStarted = (s, e) => {
        console.log(`SESSION ID: ${e.sessionId}`);
    };
    pronunciationAssessmentConfig.applyTo(recognizer);

    
    
    

    recognizer.canceled = (s, e) => {
        console.log(`Error: ${e.errorDetails}`);
        recognizer.stopContinuousRecognitionAsync();
    };

    recognizer.sessionStopped = (s, e) => {
        // document.getElementById("recognizedText").innerText =""

        console.log(totalN_best)
        if(is_initial==="true"){
            sendDataToBackendinit(totalN_best);
        }else{
            sendDataToBackendlevel(totalN_best);
        }
        
        recognizer.stopContinuousRecognitionAsync();
        
        // onRecognizedResult();
    };

    // Start recognition
    recognizer.startContinuousRecognitionAsync();
    assessing(missed_check);

    // Enable Stop button & disable Start button
    document.getElementById("startBtn").disabled = true;
    document.getElementById("stopBtn").disabled = false;

    stopRecording = () => {
        recognizer.stopContinuousRecognitionAsync();
        document.getElementById("startBtn").disabled = false;
        document.getElementById("stopBtn").disabled = true;

        
    };
});



document.getElementById("stopBtn").addEventListener("click", () => {
    if (stopRecording) stopRecording();
    const loadingSpinner = document.getElementById("global-loading-spinner");
    const loadingMessage = document.getElementById("loading-message");
        if (loadingSpinner && loadingMessage) {
          loadingMessage.innerText = "Loading... Please wait!";
          loadingSpinner.style.display = "flex";
        }
});