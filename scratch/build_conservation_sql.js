const fs = require('fs');
const readline = require('readline');
const path = require('path');

const logPath = 'C:\\\\Users\\\\bhave\\\\.gemini\\\\antigravity\\\\brain\\\\4268ea40-8193-4174-834a-9f325105f337\\\\.system_generated\\\\logs\\\\transcript_full.jsonl';

async function processLog() {
    const fileStream = fs.createReadStream(logPath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let lastUserInput = null;
    for await (const line of rl) {
        try {
            const entry = JSON.parse(line);
            if (entry.type === 'USER_INPUT' && entry.content && entry.content.includes("Forest Policy & Conservation – Conservation Efforts Master Quiz")) {
                lastUserInput = entry.content;
            }
        } catch(e) {}
    }

    if (!lastUserInput) {
        console.error("Could not find the user input.");
        return;
    }

    // Extract CSV part
    const lines = lastUserInput.split('\n');
    let csvLines = [];
    let capture = false;
    for (const line of lines) {
        if (line.trim().startsWith('Q(EN)')) {
            capture = true;
            continue; // Skip header
        }
        if (capture) {
            if (line.trim() === '' || line.startsWith('<EPHEMERAL_MESSAGE>')) {
                // stop on empty line or ephemeral msg
                break;
            }
            csvLines.push(line);
        }
    }

    // Parse CSV handling quotes and newlines
    let csvString = csvLines.join('\n');
    const records = [];
    let currentRecord = [];
    let currentField = '';
    let inQuotes = false;
    
    for (let i = 0; i < csvString.length; i++) {
        let c = csvString[i];
        if (inQuotes) {
            if (c === '"') {
                if (i + 1 < csvString.length && csvString[i+1] === '"') {
                    currentField += '"';
                    i++;
                } else {
                    inQuotes = false;
                }
            } else {
                currentField += c;
            }
        } else {
            if (c === '"') {
                inQuotes = true;
            } else if (c === ',') {
                currentRecord.push(currentField);
                currentField = '';
            } else if (c === '\n') {
                currentRecord.push(currentField);
                if (currentRecord.length >= 12) {
                    records.push(currentRecord);
                }
                currentRecord = [];
                currentField = '';
            } else {
                currentField += c;
            }
        }
    }
    if (currentField || currentRecord.length > 0) {
        currentRecord.push(currentField);
        if (currentRecord.length >= 12) records.push(currentRecord);
    }

    console.log(`Parsed ${records.length} records.`);

    // Build SQL
    // Topic ID for "Forest Policy & Conservation" is 1199 (from previous knowledge)
    let sql = `INSERT INTO quizzes (id, topic_id, title, title_hi, description, description_hi, difficulty, total_questions, time_limit_mins, is_previous_year, created_at) VALUES\n`;
    sql += `(1304, 1199, 'Forest Policy & Conservation – Conservation Efforts Master Quiz', 'वन नीति एवं संरक्षण – संरक्षण प्रयास मास्टर क्विज़', 'Exhaustive CGPSC Prelims-level quiz testing knowledge of Chhattisgarh''s forest and wildlife conservation efforts, including Biosphere/Tiger reserves, CAMPA, Joint Forest Management, and specialized animal protection projects.', 'यह विस्तृत सीजीपीएससी प्रीलिम्स-स्तरीय क्विज़ छत्तीसगढ़ के वन और वन्यजीव संरक्षण प्रयासों के ज्ञान का परीक्षण करता है, जिसमें बायोस्फीयर/टाइगर रिजर्व, कैम्पा (CAMPA), संयुक्त वन प्रबंधन और विशेष पशु संरक्षण परियोजनाएं शामिल हैं।', 'Hard', ${records.length}, ${Math.ceil(records.length * 1.5)}, 0, CURRENT_TIMESTAMP);\n\n`;

    sql += `INSERT INTO questions (quiz_id, topic_id, question, question_hi, option_a, option_a_hi, option_b, option_b_hi, option_c, option_c_hi, option_d, option_d_hi, correct_option, explanation, explanation_hi, sort_order) VALUES\n`;
    
    let valueStrings = [];
    let sortOrder = 1;
    for (const r of records) {
        if (r.length < 13) continue;
        const q_en = r[0].replace(/'/g, "''").replace(/\\n/g, "\\n");
        const q_hi = r[1].replace(/'/g, "''").replace(/\\n/g, "\\n");
        const oa_en = r[2].replace(/'/g, "''");
        const oa_hi = r[3].replace(/'/g, "''");
        const ob_en = r[4].replace(/'/g, "''");
        const ob_hi = r[5].replace(/'/g, "''");
        const oc_en = r[6].replace(/'/g, "''");
        const oc_hi = r[7].replace(/'/g, "''");
        const od_en = r[8].replace(/'/g, "''");
        const od_hi = r[9].replace(/'/g, "''");
        const correct = parseInt(r[10]);
        const exp_en = r[11].replace(/'/g, "''");
        const exp_hi = r[12] ? r[12].replace(/'/g, "''") : '';
        
        valueStrings.push(`(1304, 1199, '${q_en}', '${q_hi}', '${oa_en}', '${oa_hi}', '${ob_en}', '${ob_hi}', '${oc_en}', '${oc_hi}', '${od_en}', '${od_hi}', ${correct}, '${exp_en}', '${exp_hi}', ${sortOrder++})`);
    }
    
    sql += valueStrings.join(',\n') + ';\n';
    
    fs.writeFileSync(path.join(__dirname, 'import_conservation.sql'), sql, 'utf8');
    console.log("Wrote import_conservation.sql");
}

processLog();
