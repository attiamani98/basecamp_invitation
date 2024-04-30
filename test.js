const axios = require('axios');
const Airtable = require('airtable');
require('dotenv').config();

// Airtable configuration
const AIRTABLE_API_TOKEN = process.env.AIRTABLE_API_TOKEN;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME;

// Basecamp configuration
const BASECAMP_ACCESS_TOKEN = process.env.BASECAMP_ACCESS_TOKEN;

// Initialize Airtable with your API token
Airtable.configure({
    endpointUrl: 'https://api.airtable.com',
    apiKey: AIRTABLE_API_TOKEN
});

// Initialize Airtable base and table
const base = Airtable.base(AIRTABLE_BASE_ID);
const table = base(AIRTABLE_TABLE_NAME);

async function fetchRecordsFromAirtable() {
    try {
        const response = await axios.get(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`, {
            headers: {
                Authorization: `Bearer ${AIRTABLE_API_TOKEN}`
            }
        });
        return response.data.records;
    } catch (error) {
        console.error('Error fetching records from Airtable:', error);
        return [];
    }
}

async function inviteToBasecamp(email) {
    try {
        console.log('Invitation sent to:', email);
        // Invitation logic here
        // Example: send invitation email
    } catch (error) {
        console.error('Error inviting to Basecamp:', error);
        throw error;
    }
}

async function processRecords() {
    const records = await fetchRecordsFromAirtable();
    records.forEach(record => {
        const { fields } = record;
        const { personal_email, basecamp_user_id, basecamp_project_id } = fields;
        if (!basecamp_user_id && !basecamp_project_id) {
            inviteToBasecamp(personal_email);
        }
    });
}

processRecords();
