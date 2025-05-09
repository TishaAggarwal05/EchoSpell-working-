# EchoSpell
Where Speech Becomes Magic — A Fantasy-Themed Speech Therapy Platform for Kids

In the enchanted land of EchoSpell, every word holds power, and every sound unlocks new adventures.
EchoSpell is a gamified, fantasy-themed speech therapy web app that transforms traditional articulation practice into an immersive journey. Children don the role of young spellcasters-in-training, mastering magical phonemes to unlock new levels and sharpen their pronunciation skills — all while having fun. This fantasy layer isn’t just decorative; it plays a vital role in keeping kids engaged, motivated, and emotionally invested in their speech development journey.

✨ Features
🧠 Initial Phoneme Assessment
Powered by Azure Speech API, EchoSpell listens to what the child says and analyzes the phonemes for pronunciation accuracy.

👤 Personalized Phoneme Profile
Based on the initial assessment, each child receives a customized profile highlighting problematic phonemes.

🎯 LLM-Generated Focused Speech Exercises
Using the LLaMA 3 model, personalized speech exercises are generated dynamically to focus on the child’s specific articulation challenges.

📊 Dynamic Level Progression
Each time the child practices, their performance shapes the next level — keeping the journey adaptive and continuously challenging.

📈 Phoneme Progress Tracking
A visual chart tracks the improvement of each phoneme over time, showing growth and motivating continued practice.

📖 Chapter-Based Visual Aids
Each chapter presents a helpful popup — a visual guide with a description of how to pronounce the phoneme correctly, available anytime for reference.


Link to demo video: https://youtu.be/dVInueYDnJU

Live website: https://echospell.onrender.com/

(Please reach out on tishaarora.0010@gmail.com to start the gpu)

🚀 Getting Started


## To setup the .ipynb file (FOR GPU)

ADD_AUTH_TOKEN: Your ngrok token

YOUR_NGROK_URL: your static ngrok url


## To setup .env file
NGROK_URI = YOUR_NGROK_URL/chat

SESSION_SECRET = your mongo session secret

MONGODB_URI = your mongo url

PORT = specify port

## to run website

in bash write following commands

npm i

nodemon index2.js

 Tech Stack
Frontend: HTML, CSS, JavaScript, EJS

Backend: Node.js, Express.js

Database: MongoDB

APIs & Services:

Azure Speech API – for phoneme detection and pronunciation scoring

LLaMA 3 – for generating personalized, phoneme-focused speech exercises

Other Tools:

Chart.js (or equivalent) for progress visualization

Animation libraries for interactive chapter popups and fantasy theming
