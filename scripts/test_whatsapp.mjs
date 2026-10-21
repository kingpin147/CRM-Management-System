/**
 * Test WhatsApp Template Dispatcher CLI
 * Usage: node --env-file=.env scripts/test_whatsapp.mjs <phone_number> [template_name]
 */

const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
const token = process.env.WHATSAPP_ACCESS_TOKEN;
const apiVersion = process.env.WHATSAPP_API_VERSION || 'v21.0';

function formatPhone(phone) {
  if (!phone) return '';
  let clean = phone.replace(/\D/g, '');
  while (clean.startsWith('9292')) {
    clean = clean.slice(2);
  }
  if (clean.startsWith('0') && clean.length === 11) {
    clean = '92' + clean.slice(1);
  } else if (clean.length === 10 && clean.startsWith('3')) {
    clean = '92' + clean;
  }
  return clean;
}

const args = process.argv.slice(2);
const recipientRaw = args[0] || '+923314111483';
const templateName = args[1] || 'payment_due_reminder';
const recipient = formatPhone(recipientRaw);

console.log(`Sending template "${templateName}" to ${recipient} (Input: ${recipientRaw})...`);

async function send() {
  const url = `https://graph.facebook.com/${apiVersion}/${phoneId}/messages`;
  
  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: recipient,
    type: 'template',
    template: {
      name: templateName,
      language: { code: 'en' },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: 'Valued Customer' },
            { type: 'text', text: 'INV-TEST-001' },
            { type: 'text', text: '4,500.00' },
            { type: 'text', text: '28-Oct-2026' },
            { type: 'text', text: '+923009433303' }
          ]
        }
      ]
    }
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error:', err);
  }
}

send();
