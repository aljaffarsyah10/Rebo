/* eslint-disable no-console */
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.local
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

import {
  getDefaultNotificationReceiver,
  getPilarContact,
  getVerifikatorContacts,
  getAllContacts
} from '../src/lib/notifications/contacts';

async function testContacts() {
  console.log('=== TEST WHATSAPP CONTACTS RESOLVER ===\n');

  // 1. Default Receiver
  const defaultReceiver = getDefaultNotificationReceiver();
  console.log('1. Default Notification Receiver:', defaultReceiver);

  // 2. Pilar Contacts (1 to 6)
  console.log('\n2. Testing getPilarContact for Pilars 1..6:');
  for (let i = 1; i <= 6; i++) {
    const contact = await getPilarContact(i);
    console.log(`   - Pilar ${i}:`, contact);
    if (!contact || !contact.noWa.startsWith('628')) {
      throw new Error(
        `Pilar ${i} failed or invalid format: ${JSON.stringify(contact)}`
      );
    }
  }

  // 3. Testing invalid pilar
  const invalidContact = await getPilarContact(999);
  console.log('   - Pilar 999 (should be null):', invalidContact);
  if (invalidContact !== null) {
    throw new Error('Pilar 999 should be null');
  }

  // 4. Verifikator Contacts
  console.log('\n3. Testing getVerifikatorContacts:');
  const verifikatorContacts = await getVerifikatorContacts();
  console.log('   - Verifikator Contacts:', verifikatorContacts);
  if (!verifikatorContacts || verifikatorContacts.length === 0) {
    throw new Error('Verifikator contacts must not be empty');
  }

  // 5. All contacts list
  console.log('\n4. Testing getAllContacts:');
  const all = await getAllContacts();
  console.log(`   - Total records fetched: ${all.length}`);
  console.table(
    all.map((c) => ({
      id: c.id,
      pilar: c.id_pilar,
      kategori: c.kategori,
      nama_pic: c.nama_pic,
      no_wa: c.no_wa
    }))
  );

  console.log('\n>>> SEMUA PENGUJIAN KONTAK BERHASIL (SUCCESS)! <<<');
}

testContacts().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
