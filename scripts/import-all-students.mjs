/**
 * Import all student CSV data into the live Supabase database
 * via the admin API endpoint.
 *
 * Usage:
 *   node scripts/import-all-students.mjs <SITE_URL>
 *
 * Example:
 *   node scripts/import-all-students.mjs https://sociology-anthropology-ucc.vercel.app
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');

// Admin password from project docs
const ADMIN_KEY = 'SoasaEc2026';

const CSV_FILES = [
  'l100-students.csv',
  'l200-students.csv',
  'l300-students.csv',
  'l400-students.csv',
];

async function main() {
  const siteUrl = process.argv[2];
  if (!siteUrl) {
    console.error('Usage: node scripts/import-all-students.mjs <SITE_URL>');
    console.error('Example: node scripts/import-all-students.mjs https://your-site.vercel.app');
    process.exit(1);
  }

  const baseUrl = siteUrl.replace(/\/+$/, '');
  console.log(`\n🎓 SOASA Student Import Tool`);
  console.log(`   Target: ${baseUrl}`);
  console.log(`   CSV files: ${CSV_FILES.join(', ')}\n`);

  // First, test the connection
  console.log('1️⃣  Testing API connection...');
  try {
    const statusRes = await fetch(`${baseUrl}/api/election/status`);
    if (!statusRes.ok) {
      console.error('❌ API returned error:', statusRes.status);
      const body = await statusRes.text();
      console.error(body);
      process.exit(1);
    }
    const status = await statusRes.json();
    console.log(`   ✅ Connected! Election: "${status.title || 'N/A'}" | Status: ${status.status}`);
    if (status.turnout) {
      console.log(`   Current students in DB: ${status.turnout.eligible}`);
    }
  } catch (err) {
    console.error('❌ Cannot reach API:', err.message);
    process.exit(1);
  }

  // Read and combine all CSV files
  console.log('\n2️⃣  Reading CSV files...');
  let allCsvContent = '';
  let totalStudents = 0;
  let headerAdded = false;

  for (const file of CSV_FILES) {
    const filePath = path.join(DATA_DIR, file);
    if (!fs.existsSync(filePath)) {
      console.warn(`   ⚠️  Skipping ${file} (not found)`);
      continue;
    }
    const content = fs.readFileSync(filePath, 'utf-8').trim();
    const lines = content.split(/\r?\n/).filter(Boolean);
    
    if (!headerAdded) {
      // Include header from first file
      allCsvContent += lines[0] + '\n';
      headerAdded = true;
    }
    
    // Add data rows (skip header)
    const dataLines = lines.slice(1);
    allCsvContent += dataLines.join('\n') + '\n';
    totalStudents += dataLines.length;
    console.log(`   📄 ${file}: ${dataLines.length} students`);
  }

  console.log(`   📊 Total: ${totalStudents} students to import\n`);

  if (totalStudents === 0) {
    console.error('❌ No students found in CSV files');
    process.exit(1);
  }

  // Import via API (replace mode to ensure clean slate)
  console.log('3️⃣  Importing students to database...');
  console.log('   (This may take a minute — hashing passwords for each student)');

  try {
    const res = await fetch(`${baseUrl}/api/admin/import-students`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Key': ADMIN_KEY,
      },
      body: JSON.stringify({
        csv: allCsvContent,
        replace: true,
      }),
    });

    const body = await res.json();

    if (res.ok) {
      console.log(`   ✅ Successfully imported ${body.imported} students!`);
      console.log(`   Replace mode: ${body.replace ? 'Yes (clean import)' : 'No (upsert)'}`);
    } else {
      console.error(`   ❌ Import failed (${res.status}):`, JSON.stringify(body, null, 2));
      if (body.error === 'unauthorized') {
        console.error('\n   💡 The ADMIN_SECRET on Vercel may not match "SoasaEc2026".');
        console.error('   Check: Vercel Dashboard → Settings → Environment Variables → ADMIN_SECRET');
      }
      if (body.error === 'cannot_replace_after_votes_cast') {
        console.error('\n   💡 Some students have already voted. Cannot replace in this mode.');
        console.error('   Re-run without replace mode or reset votes first.');
      }
      process.exit(1);
    }
  } catch (err) {
    console.error('   ❌ Network error:', err.message);
    process.exit(1);
  }

  // Verify the import
  console.log('\n4️⃣  Verifying import...');
  try {
    const statusRes = await fetch(`${baseUrl}/api/election/status`);
    const status = await statusRes.json();
    console.log(`   Students in database: ${status.turnout?.eligible || 'unknown'}`);
    console.log(`   Already voted: ${status.turnout?.voted || 0}`);
  } catch (err) {
    console.log('   ⚠️  Could not verify (non-critical)');
  }

  console.log('\n✅ Import complete!');
  console.log('   Students can now log in at: ' + baseUrl + '/vote.html');
  console.log('   Index number format: SS/BSS/XX/XXXX');
  console.log('   Password: Soasa2026!\n');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
