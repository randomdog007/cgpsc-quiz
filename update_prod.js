const { execSync } = require('child_process');
const fs = require('fs');

const runSql = (sql, retries = 3) => {
  console.log(`Executing SQL: ${sql.slice(0, 80)}...`);
  fs.writeFileSync('temp_prod.sql', sql);
  
  for(let i=0; i<retries; i++) {
    try {
      execSync('npx.cmd wrangler d1 execute cgpsc_quiz_db --remote --file="temp_prod.sql"', { stdio: 'pipe' });
      console.log('Success.');
      break;
    } catch(err) {
      console.error(`Attempt ${i+1} failed: ${err.message}`);
      if (i === retries - 1) throw err;
      console.log('Retrying...');
      // Sleep a bit before retry
      execSync('ping 127.0.0.1 -n 3 > nul');
    }
  }
  if (fs.existsSync('temp_prod.sql')) {
    fs.unlinkSync('temp_prod.sql');
  }
};

const updates = [
  // 4875: SRS
  `UPDATE questions SET question = 'According to the latest Sample Registration System (SRS) Statistical Report, which Indian state consistently records the highest Infant Mortality Rate (IMR)?' WHERE id = 4875;`,
  // 4917: PLFS
  `UPDATE questions SET question = 'Consider the following statements regarding the Periodic Labour Force Survey (PLFS):\\n1. It was launched by the National Sample Survey Office (NSSO) in 2017 to provide more frequent employment data.\\n2. According to the latest PLFS Annual Reports (2023-2024), agriculture and allied sectors remain the largest employers in India.\\nWhich of the statement(s) given above is/are correct?' WHERE id = 4917;`,
  // 4953: Rice
  `UPDATE questions SET question = 'Consider the following statements about rice cultivation in India:\\n1. It requires high temperature (above 25┬░C) and high humidity with annual rainfall above 100 cm.\\n2. According to the Ministry of Agriculture''s latest estimates (2023-24), West Bengal is the largest producer of rice in India.\\n3. Aus, Aman, and Boro are three crops of paddy grown in Assam and West Bengal.\\nWhich of the statements given above are correct?' WHERE id = 4953;`,
  // 4958: Jowar
  `UPDATE questions SET question = 'Consider the following statements regarding Jowar (Sorghum) cultivation in India:\\n1. It is the third most important food crop with respect to area and production.\\n2. It is a rain-fed crop mostly grown in moist areas which hardly needs irrigation.\\n3. Maharashtra is the largest producer of Jowar in India as per recent agricultural data.\\nWhich of the statements given above are correct?' WHERE id = 4958;`,
  // 4959: Rice sequence
  `UPDATE questions SET question = 'Arrange the following states in descending order of their rice production (as per the latest Ministry of Agriculture data):\\n1. Punjab\\n2. West Bengal\\n3. Uttar Pradesh\\n4. Andhra Pradesh' WHERE id = 4959;`,
  // 4984: Soybean
  `UPDATE questions SET question = 'According to the latest agricultural production data, which one of the following states is the largest producer of Soybean in India?' WHERE id = 4984;`,
  // 4990: Horticulture
  `UPDATE questions SET question = 'Consider the following statements about Horticulture in India:\\n1. According to FAO data, India is the second-largest producer of fruits and vegetables in the world after China.\\n2. India is a producer of tropical as well as temperate fruits.\\nWhich of the statements given above is/are correct?' WHERE id = 4990;`,
  // 5089: Manganese
  `UPDATE questions SET question = 'According to the latest data from the Indian Bureau of Mines (IBM), which state is the leading producer of Manganese ore in India?' WHERE id = 5089;`,
  // 5092: Bauxite
  `UPDATE questions SET question = 'According to the latest Indian Bureau of Mines (IBM) reports, which state has the largest bauxite reserves and is also the leading producer of bauxite in India?' WHERE id = 5092;`,
  // 5110: Limestone
  `UPDATE questions SET question = 'Arrange the following leading limestone-producing states of India in descending order of their total production (as per the latest Indian Bureau of Mines data):\\n1. Rajasthan\\n2. Madhya Pradesh\\n3. Andhra Pradesh\\n4. Chhattisgarh\\nSelect the correct answer:' WHERE id = 5110;`,
  // 8924: CG Gram
  `UPDATE questions SET question = 'According to the latest Chhattisgarh Economic Survey (2023-24), which district holds the first rank in the production of Gram (Chana), the major pulse crop of Chhattisgarh?' WHERE id = 8924;`,
  // 8932: CG Paddy
  `UPDATE questions SET question = 'As per recent agricultural statistics of Chhattisgarh, which district has the highest percentage of irrigated area, significantly contributing to its status as the top paddy producer?' WHERE id = 8932;`
];

for (const sql of updates) {
  runSql(sql);
}
console.log('Production Updates complete.');
