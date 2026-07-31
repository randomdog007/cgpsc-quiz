const { execSync } = require('child_process');
const fs = require('fs');

const runSql = (sql) => {
  console.log(`Executing SQL: ${sql.slice(0, 100)}...`);
  fs.writeFileSync('temp.sql', sql);
  execSync('npx.cmd wrangler d1 execute cgpsc_quiz_db --remote --file="temp.sql"');
  fs.unlinkSync('temp.sql');
};

const updates = [
  // ID 4738: ISFR 2023 statements
  `UPDATE questions SET 
    question = 'Consider the following statements regarding the India State of Forest Report (ISFR) 2023:\\n\\n1. It is published biennially by the Forest Survey of India (FSI).\\n2. The total forest and tree cover in India is 25.17% of the geographical area of the country.\\n3. Madhya Pradesh has the maximum forest cover as a percentage of its total geographical area.\\n\\nWhich of the statements given above is/are correct?',
    explanation = 'Statement 1 is correct. Statement 2 is correct (ISFR 2023 states total cover is 25.17%). Statement 3 is incorrect because Mizoram has the highest forest cover as a percentage of its geographical area, whereas Madhya Pradesh has the largest forest cover in terms of absolute area.'
   WHERE id = 4738;`,

  // ID 4745: ISFR 2023 Rankings
  `UPDATE questions SET 
    question = 'Match List I (State) with List II (Forest Cover Area Rank as per ISFR 2023) and select the correct answer using the codes given below:\\n\\nList I (State)\\nA. Madhya Pradesh\\nB. Arunachal Pradesh\\nC. Chhattisgarh\\nD. Odisha\\n\\nList II (Rank)\\n1. Second\\n2. First\\n3. Fourth\\n4. Third',
    explanation = 'According to the ISFR 2023, the states with the largest forest cover by area are Madhya Pradesh (1st), followed by Arunachal Pradesh (2nd), Chhattisgarh (3rd), Odisha (4th), and Maharashtra (5th).'
   WHERE id = 4745;`,

  // ID 4749: ISFR 2023 Carbon Stock
  `UPDATE questions SET 
    question = 'According to ISFR 2023, the total carbon stock in the country''s forests is estimated to be approximately:',
    option_a = '7,124 million tonnes',
    option_b = '7,285 million tonnes',
    option_c = '7,990 million tonnes',
    option_d = '8,150 million tonnes',
    correct_option = 2,
    explanation = 'As per the ISFR 2023, the total carbon stock in the country''s forests is estimated at 7,285.5 million tonnes, which is an increase of 81.5 million tonnes from the previous assessment.'
   WHERE id = 4749;`,

  // ID 4750: ISFR 2023 Bamboo
  `UPDATE questions SET 
    question = 'Which among the following states has reported the highest bamboo-bearing area in India as per the ISFR 2023?',
    explanation = 'According to the ISFR 2023, Madhya Pradesh has the maximum bamboo bearing area, followed by Arunachal Pradesh, Maharashtra, and Odisha. The total bamboo bearing area in the country is estimated to be 1,54,670 sq km.'
   WHERE id = 4750;`
];

for (const sql of updates) {
  runSql(sql);
}
console.log('ISFR Updates complete.');
