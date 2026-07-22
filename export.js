const { Client } = require('pg');
const fs = require('fs');

const client = new Client({
  host: 'aws-1-ap-southeast-1.pooler.supabase.com',   // paste exact host from Supabase Connect modal
  port: 5432,
  user: 'postgres.pjyjonyvwvllppoetbyb',       // paste exact user from Supabase Connect modal
  password: 'Anime@252199',                // no special characters
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  fs.mkdirSync('export', { recursive: true });

  const tablesRes = await client.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
  `);

  const schemaInfo = {};

  for (const row of tablesRes.rows) {
    const table = row.table_name;

    const colsRes = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1
      ORDER BY ordinal_position;
    `, [table]);
    schemaInfo[table] = colsRes.rows;

    const dataRes = await client.query(`SELECT * FROM "${table}"`);
    fs.writeFileSync(`export/${table}.json`, JSON.stringify(dataRes.rows, null, 2));
    console.log(`✓ ${table}: ${dataRes.rows.length} rows`);
  }

  fs.writeFileSync('export/_schema.json', JSON.stringify(schemaInfo, null, 2));
  console.log('\nDone. Schema info saved to export/_schema.json');

  await client.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});