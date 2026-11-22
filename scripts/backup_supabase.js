const fs = require('fs');
const path = require('path');

// 1. Read environment variables from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('.env.local not found at:', envPath);
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const getEnv = (key) => {
  const m = envContent.match(new RegExp(key + '=(.*)'));
  return m ? m[1].trim() : '';
};

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const supabaseKey = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(supabaseUrl, supabaseKey);

const targetTables = [
  'area',
  'pilar',
  'subpilar',
  'pertanyaan',
  'kategoriPenilaian',
  'statusBukti',
  'buktiDukung',
  'pilarHasil'
];

async function runBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(__dirname, '..', 'supabase', 'backups', 'backup_20261122_supabase');

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  console.log('Connecting to Supabase:', supabaseUrl);
  console.log('Writing backup to:', backupDir);

  const dump = {
    metadata: {
      source_supabase_url: supabaseUrl,
      backup_timestamp: new Date().toISOString(),
      version: 'REBO_V1_LIVE_DATABASE_BACKUP',
      tables_count: targetTables.length
    },
    tables: {}
  };

  const sqlLines = [
    '-- ============================================================== ',
    '-- REBO DATABASE BACKUP (V1 LIVE PRODUCTION STATE)                ',
    '-- Source: ' + supabaseUrl,
    '-- Date: ' + new Date().toISOString(),
    '-- ==============================================================\n',
    'BEGIN;\n'
  ];

  for (const table of targetTables) {
    process.stdout.write(`Fetching ${table}... `);
    const { data, error } = await supabase.from(table).select('*').limit(5000);

    if (error) {
      console.log(`FAILED (${error.message})`);
      continue;
    }

    dump.tables[table] = data;
    console.log(`SUCCESS (${data.length} rows)`);

    if (data.length > 0) {
      sqlLines.push(`-- -------------------------------------------------------------`);
      sqlLines.push(`-- Data for table: public."${table}" (${data.length} rows)`);
      sqlLines.push(`-- -------------------------------------------------------------`);

      const columns = Object.keys(data[0]);
      for (const row of data) {
        const values = columns.map((col) => {
          const val = row[col];
          if (val === null || val === undefined) return 'NULL';
          if (typeof val === 'number') return val;
          if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
          if (typeof val === 'object') {
            return "'" + JSON.stringify(val).replace(/'/g, "''") + "'";
          }
          return "'" + String(val).replace(/'/g, "''") + "'";
        });

        sqlLines.push(
          `INSERT INTO public."${table}" ("${columns.join('", "')}") VALUES (${values.join(', ')}) ON CONFLICT DO NOTHING;`
        );
      }
      sqlLines.push('');
    }
  }

  sqlLines.push('COMMIT;\n');

  // Write JSON dump
  const jsonPath = path.join(backupDir, 'backup_data.json');
  fs.writeFileSync(jsonPath, JSON.stringify(dump, null, 2), 'utf8');

  // Write SQL dump
  const sqlPath = path.join(backupDir, 'backup_v1_restore.sql');
  fs.writeFileSync(sqlPath, sqlLines.join('\n'), 'utf8');

  console.log('\n==============================================================');
  console.log('✅ BACKUP COMPLETED SUCCESSFULLY!');
  console.log('📁 JSON Snapshot:', jsonPath);
  console.log('📁 SQL Restore:', sqlPath);
  console.log('==============================================================\n');
}

runBackup().catch((err) => {
  console.error('Fatal backup error:', err);
  process.exit(1);
});
