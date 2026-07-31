const fs = require('fs');
const path = require('path');

function parseQuiz(inputPath, outputPath, topicId) {
    const rawData = fs.readFileSync(inputPath, 'utf8');
    
    // Split into header and questions
    const blocks = rawData.split(/\*\*Q\d+\.\*\*/);
    
    if (blocks.length < 2) {
        console.error("No questions found in " + inputPath);
        return;
    }

    const header = blocks[0].trim();
    let title_en = "Untitled Quiz";
    let title_hi = "शीर्षकहीन प्रश्नोत्तरी";
    let desc_en = "";
    let desc_hi = "";

    // Parse header
    if (header.includes("Quiz Title (English)")) {
        const lines = header.split('\n').map(l => l.trim()).filter(l => l);
        title_en = lines.find(l => l.startsWith('Quiz Title (English):'))?.replace('Quiz Title (English):', '').trim() || title_en;
        title_hi = lines.find(l => l.startsWith('Quiz Title (Hindi):'))?.replace('Quiz Title (Hindi):', '').trim() || title_hi;
        desc_en = lines.find(l => l.startsWith('Quiz Description (English):'))?.replace('Quiz Description (English):', '').trim() || desc_en;
        desc_hi = lines.find(l => l.startsWith('Quiz Description (Hindi):'))?.replace('Quiz Description (Hindi):', '').trim() || desc_hi;
    } else if (header.includes("Mauryan & Satavahana")) {
        const lines = header.split('\n').map(l => l.trim()).filter(l => l);
        title_en = lines[0].replace('1. ', '').trim();
        title_hi = lines[1].replace('2. ', '').trim();
        desc_en = lines[2].replace('3. ', '').trim();
        desc_hi = lines[3].replace('4. ', '').trim();
    } else {
        // Generic fallback for Prehistoric quiz if it uses old format
        const lines = header.split('\n').map(l => l.trim()).filter(l => l);
        if (lines.length >= 4) {
            title_en = lines[0].replace(/^\d+\.\s*/, '').trim();
            title_hi = lines[1].replace(/^\d+\.\s*/, '').trim();
            desc_en = lines[2].replace(/^\d+\.\s*/, '').trim();
            desc_hi = lines[3].replace(/^\d+\.\s*/, '').trim();
        }
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
        const correctMatch = block.match(/\*\*Correct:\*\*\s*([A-D])/i);
        const correctLetter = correctMatch ? correctMatch[1].toUpperCase() : 'A';
        const correctOption = { 'A': 1, 'B': 2, 'C': 3, 'D': 4 }[correctLetter];

        // Extract explanations
        const expEnMatch = block.match(/\*\*Explanation \(EN\):\*\*\s*(.+)/i);
        const expHiMatch = block.match(/\*\*Explanation \(HI\):\*\*\s*(.+)/i);
        
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
        
        // Split question text into Hindi and English.
        const enStartRegex = /\n(Consider|Which|Match|According|In|Identify|Arrange|What|The|How|Based|From|By|Assertion|Reason)\b/i;
        const enMatch = qText.match(enStartRegex);
        
        let qHi = qText;
        let qEn = qText;

        if (enMatch) {
            qHi = qText.substring(0, enMatch.index).trim();
            qEn = qText.substring(enMatch.index).trim();
            
            // Check for shared lists
            const hasListHi = /\n(1\.|a\.|सूची-I|List-I)/i.test('\n' + qHi);
            const hasListEn = /\n(1\.|a\.|सूची-I|List-I)/i.test('\n' + qEn);

            if (hasListEn && !hasListHi) {
                const listMatch = ('\n' + qEn).match(/\n(1\.|a\.|सूची-I|List-I)/i);
                if (listMatch) {
                    // match.index is relative to ('\n' + qEn) which is exactly correct for qEn
                    const sharedList = qEn.substring(listMatch.index);
                    qHi += '\n\n' + sharedList.trim();
                }
            }
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

const args = process.argv.slice(2);
if (args.length >= 3) {
    parseQuiz(args[0], args[1], parseInt(args[2]));
} else {
    console.log("Usage: node parse_quizzes.js <inputFile> <outputFile> <topicId>");
}
