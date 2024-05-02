const axios = require('axios');
const Airtable = require('airtable');
require('dotenv').config();


// Airtable configuration
const AIRTABLE_API_TOKEN = process.env.AIRTABLE_API_TOKEN;
const BASECAMP_ACCESS_TOKEN = process.env.BASECAMP_ACCESS_TOKEN
const client_id =  process.env.BASECAMP_CLIENT_ID
const client_secret = process.env.BASECAMP_CLIENT_SECRET
const refresh_token =  process.env.BASECAMP_REFRESH_TOKEN

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

// Function to update Airtable record with Basecamp ID
async function updateAirtableRecord(recordId, basecampId) {
    try {
        const endpoint = `https://api.airtable.com/v0/appddgSxTzRFmiIL1/tbldQxR7CPAgT9pQ6/${recordId}`;
        const headers = {
            'Authorization': `Bearer ${AIRTABLE_API_TOKEN}`,
            'Content-Type': 'application/json'
        };
        data = {
            fields: {
                'Basecamp ID': basecampId
            }
        };

        // Make a PATCH request to update the record
        const response = await axios.patch(endpoint, data, { headers });
        console.log('Airtable record updated successfully with Basecamp ID:', basecampId);
        console.log('Response:', response.data);
    } catch (error) {
        console.error('Error updating Airtable record:', error.message);
    }
}


async function createProjectUser(name, email, record) {
    try {
        const accessToken = process.env.BASECAMP_ACCESS_TOKEN;

        // Construct the request body with the new user
        const requestBody = {
            create: [
                {
                    name: name,
                    email_address: email
                }
            ]
        };

        // Make a PUT request to create the project user
        const response = await axios.put(`https://3.basecampapi.com/4535691/projects/17447374/people/users.json`, requestBody, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        // Check if the PUT request was successful
        if (response.status === 200) {

            // Fetch user data
            const userDataResponse = await axios.get(`https://3.basecampapi.com/4535691/circles/people.json`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const userData = userDataResponse.data;

            // Iterate over userData to process each user
            let userId = null;
            for (const user of userData) {
                if (user.name === name) {
                    userId =user.id
                    console.log('User ID:', userId);
                    console.log('Email:', user.email_address);
                    if (userId) {
                        updateAirtableRecord(record,userId)
                        console.log('Airtable record updated successfully with Basecamp User ID:', userId);
                    } else {
                        console.log('User with name not found in Basecamp.');
                    }
                    break;
                }
                
            }
            
           
        } else {
            console.error('Failed to create project user.');
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}


async function main() {
  try {
      const records = await fetchRecords();
      console.log(records);

      // Invite each email fetched from Airtable to Basecamp
      records.forEach(record => {
        createProjectUser(record.name, record.email, record );
    });
  } catch (error) {
      console.error('Error:', error.message);
  }
}



main();
