// utils/graphData.js
const Chapter = require('./models/chapters.js');
const Level = require('./models/levels.js');
const User = require('./models/users');

async function generateGraphDataForUser(userId) {
    const user = await User.findById(userId).populate({
        path: 'chapters',
        populate: { path: 'levels' }
    });

    const allChapterGraphs = [];

    for (let chapter of user.chapters) {
        const chapterData = {
            phoneme: chapter.phoneme,
            
            labels: [],
            scores: []
        };

        const initialScore= chapter.initialAccur

        // Always push initial score
        chapterData.labels.push("Initial");
        chapterData.scores.push(initialScore);

        // If levels have been played, include them
        if (chapter.levels && chapter.levels.length > 0) {
            chapter.levels.forEach((level, index) => {
                chapterData.labels.push(`L${index + 1}`);
                chapterData.scores.push(level.score ?? 0);
            });
        }

        allChapterGraphs.push(chapterData);
    }

    return allChapterGraphs;
}

module.exports = generateGraphDataForUser;
