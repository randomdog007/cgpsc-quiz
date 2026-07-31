const fs = require('fs');
const path = require('path');

function parseQuiz(inputPath, outputPath, topicId) {
    const content = fs.readFileSync(inputPath, 'utf8');
    const blocks = content.split(/\*\*Q\d+\.\*\*/);
    
    const header = blocks[0].trim();
    let title_en = "Quiz";
    let title_hi = "क्विज़";
    let desc_en = "Description";
    let desc_hi = "विवरण";

    const titleEnMatch = header.match(/Title \(English\):\s*(.+)/i) || header.match(/(.+)/);
    const titleHiMatch = header.match(/Title \(Hindi\):\s*(.+)/i) || header.match(/\n(.+)/);
    const descEnMatch = header.match(/Description \(English\):\s*([\s\S]+?)Quiz Description/i) || header.match(/This quiz[\s\S]+?(?=यह क्विज़)/i);
    const descHiMatch = header.match(/Description \(Hindi\):\s*([\s\S]+)/i) || header.match(/यह क्विज़[\s\S]+/i);

    if (header.includes("Quiz Title (English)")) {
        title_en = titleEnMatch ? titleEnMatch[1].trim() : title_en;
        title_hi = titleHiMatch ? titleHiMatch[1].trim() : title_hi;
        desc_en = descEnMatch ? descEnMatch[1].trim() : desc_en;
        desc_hi = descHiMatch ? descHiMatch[0].replace(/Quiz Description \(Hindi\):\s*/i, '').trim() : desc_hi;
    } else {
        const lines = header.split('\n').map(l => l.trim()).filter(l => l && !l.match(/^\d+\./));
        title_en = lines[0] || title_en;
        title_hi = lines[1] || title_hi;
        const descText = lines.slice(2).join('\n');
        const splitIdx = descText.indexOf('यह क्विज़');
        if (splitIdx !== -1) {
            desc_en = descText.substring(0, splitIdx).trim();
            desc_hi = descText.substring(splitIdx).trim();
        } else {
            desc_en = descText;
            desc_hi = descText;
        }
    }

    // specific override for the new format
    if (header.includes("Mauryan & Satavahana")) {
        const lines = header.split('\n').map(l => l.trim()).filter(l => l);
        title_en = lines[0].replace('1. ', '').trim();
        title_hi = lines[1].replace('2. ', '').trim();
        desc_en = lines[2].replace('3. ', '').trim();
        desc_hi = lines[3].replace('4. ', '').trim();
    }

    const quiz = {
        topic_id: topicId,
        title: title_en,
        title_hi: title_hi,
        description: desc_en,
        description_hi: desc_hi,
        difficulty: "Medium",
        total_questions: blocks.length - 1,
        time_limit_mins: 30,
        is_previous_year: false
    };

    const questions = [];

    for (let i = 1; i < blocks.length; i++) {
        const block = blocks[i].trim();
        
        // Extract correct option
        const correctMatch = block.match(/\*\*Correct:\*\*\s*([A-D])/);
        const correctLetter = correctMatch ? correctMatch[1] : 'A';
        const correctOption = { 'A': 1, 'B': 2, 'C': 3, 'D': 4 }[correctLetter];

        // Extract explanations
        const expEnMatch = block.match(/\*\*Explanation \(EN\):\*\*\s*(.+)/);
        const expHiMatch = block.match(/\*\*Explanation \(HI\):\*\*\s*(.+)/);
        
        let expEn = expEnMatch ? expEnMatch[1].trim() : "";
        let expHi = expHiMatch ? expHiMatch[1].trim() : "";

        // Extract options
        const optionsStr = block.substring(0, correctMatch ? correctMatch.index : block.length);
        const optA = optionsStr.match(/\(A\)\s*(.+)/);
        const optB = optionsStr.match(/\(B\)\s*(.+)/);
        const optC = optionsStr.match(/\(C\)\s*(.+)/);
        const optD = optionsStr.match(/\(D\)\s*(.+)/);
        
        const processOpt = (optMatch) => {
            if (!optMatch) return { en: "", hi: "" };
            let val = optMatch[1].trim();
            if (val.includes(' / ')) {
                const parts = val.split(' / ');
                return { hi: parts[0].trim(), en: parts[1].trim() };
            }
            return { en: val, hi: val };
        };

        const parsedA = processOpt(optA);
        const parsedB = processOpt(optB);
        const parsedC = processOpt(optC);
        const parsedD = processOpt(optD);

        // Extract question text
        const qEndIdx = optA ? optA.index : optionsStr.length;
        let qText = optionsStr.substring(0, qEndIdx).trim();
        
        // Try to split question text into Hindi and English.
        const enStartRegex = /\n(Consider|Which|Match|According|In|Identify|Arrange|What|The|How|Based|From|By|Assertion|Reason)\b/i;
        const enMatch = qText.match(enStartRegex);
        
        let qHi = qText;
        let qEn = qText;

        if (enMatch) {
            qHi = qText.substring(0, enMatch.index).trim();
            qEn = qText.substring(enMatch.index).trim();
        }

        questions.push({
            question: qEn,
            question_hi: qHi,
            option_a: parsedA.en,
            option_a_hi: parsedA.hi,
            option_b: parsedB.en,
            option_b_hi: parsedB.hi,
            option_c: parsedC.en,
            option_c_hi: parsedC.hi,
            option_d: parsedD.en,
            option_d_hi: parsedD.hi,
            correct_option: correctOption,
            explanation: expEn,
            explanation_hi: expHi
        });
    }

    const outputObj = { quiz, questions };
    fs.writeFileSync(outputPath, JSON.stringify([outputObj], null, 2), 'utf8');
    console.log(`Successfully wrote ${outputPath} with ${questions.length} questions.`);
}

parseQuiz(
    path.join(__dirname, 'scratch', 'cg_maurya_satavahana_raw.txt'),
    path.join(__dirname, 'cg_maurya_satavahana_quiz.json'),
    1131
);
