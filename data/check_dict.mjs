import fs from 'fs';

try {
  const data = JSON.parse(fs.readFileSync('/run/media/jun/999d1d27-a5c5-4898-bdf4-179df4856a87/data/temp_dict/out_vn/kanji_bank_1.json', 'utf-8'));
  console.log('Array length:', data.length);
  console.log('First 3 items:', JSON.stringify(data.slice(0, 3), null, 2));
} catch (e) {
  console.error('Error reading JSON:', e);
}
