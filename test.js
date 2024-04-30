const axios = require('axios');
const Airtable = require('airtable');

// Airtable configuration
const AIRTABLE_API_TOKEN = 'YOUR_AIRTABLE_API_TOKEN';
const AIRTABLE_BASE_ID = 'YOUR_AIRTABLE_BASE_ID';
const AIRTABLE_TABLE_NAME = 'YOUR_AIRTABLE_TABLE_NAME';

// Basecamp configuration
const BASECAMP_ACCESS_TOKEN = 'BAhbB0kiAbB7ImNsaWVudF9pZCI6ImY5N2I3NzE3M2VhYmZkYWEzODUwNzZlMGYyYTczMGFiMDAzMTA4ZjkiLCJleHBpcmVzX2F0IjoiMjAyNC0wNC0yM1QxMDo1MToxNVoiLCJ1c2VyX2lkcyI6WzQ5MjM2MTM2XSwidmVyc2lvbiI6MSwiYXBpX2RlYWRib2x0IjoiYmFjMGQ0NmQ1YmYwMzk0YzA2Yjg3ZjA2ZWI1NTVlYTAifQY6BkVUSXU6CVRpbWUN6g4fwKYL98wJOg1uYW5vX251bWkCJgM6DW5hbm9fZGVuaQY6DXN1Ym1pY3JvIgeAYDoJem9uZUkiCFVUQwY7AEY=--dfd723bbe4f5680b1699361eb12183ce71d48cfe';
const BASECAMP_PROJECT_ID = 'YOUR_BASECAMP_PROJECT_ID';

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
        const response = await axios.post(`https://3.basecampapi.com/${BASECAMP_ACCESS_TOKEN}/buckets/${BASECAMP_PROJECT_ID}/chats`, {
            title: 'Invitation to Project',
            content: `You have been invited to join the project.`
            // You may need to adjust the API endpoint and request body based on Basecamp's API documentation
        });
        console.log('Invitation sent to:', email);
        return response.data;
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
