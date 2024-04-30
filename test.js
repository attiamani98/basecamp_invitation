const axios = require('axios');
const Airtable = require('airtable');
require('dotenv').config();

// Airtable configuration
const AIRTABLE_API_TOKEN = process.env.AIRTABLE_API_TOKEN;

// Initialize Airtable
Airtable.configure({
    endpointUrl: 'https://api.airtable.com',
    apiKey: AIRTABLE_API_TOKEN
});
const base = Airtable.base('appddgSxTzRFmiIL1');

async function fetchRecords() {
    try {
        const records = await base('tbldQxR7CPAgT9pQ6').select({
            filterByFormula: 'AND(OR({fldBQ0kjljYSpwHw4} = "Current", {fldBQ0kjljYSpwHw4} = "Starting soon"), NOT({fldzTnUkzyvciRPzy}), NOT({fldWV63011UkjYVty}))',
            fields: ['Name', 'Personal email'],
        }).all();
        return records.map(record => ({
            name: record.get('Name'),
            email: record.get('Personal email')
        }));
    } catch (error) {
        throw new Error('Error querying Airtable: ' + error);
    }
}



async function inviteToBasecamp(email) {
  try {
      const BASECAMP_ACCESS_TOKEN = process.env.BASECAMP_ACCESS_TOKEN;

      const payload = {
          email_address: email,
          role: 'employee',
      };

      // Send invitation using Basecamp API
      const response = await axios.post(
          `https://3.basecampapi.com/${BASECAMP_ACCESS_TOKEN}/invitations.json`,
          payload
      );

      console.log(`Invitation sent to ${email} successfully.`);
  } catch (error) {
      console.error(`Error sending invitation to ${email}:`, error.message);
  }
}


async function main() {
  try {
      const records = await fetchRecords();
      console.log(records);

      // Invite each email fetched from Airtable to Basecamp
      records.forEach(record => {
          inviteToBasecamp(record.email);
      });
  } catch (error) {
      console.error('Error:', error.message);
  }
}



main();
