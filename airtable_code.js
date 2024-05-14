let table = base.getTable("Xccelerators");
let view = table.getView("Current + Upcoming")
let query = await view.selectRecordsAsync({
    fields: ["Name", "Status","Personal email","Basecamp User ID","Basecamp Project ID"],
});


let inputConfig = input.config();
const BASECAMP_ACCESS_TOKEN  = await fetch(`https://launchpad.37signals.com/authorization/token?type=refresh&refresh_token=${inputConfig.REFRESH_TOKEN}&client_id=${inputConfig.BASECAMP_CLIENT_ID}&client_secret=${inputConfig.BASECAMP_CLIENT_SECRET}`, {
            method: 'POST',
        });

for (let record of query.records){
    let basecampid = record.getCellValueAsString("Basecamp User ID")
    let basecampprojectid = record.getCellValueAsString("Basecamp Project ID")
    if (!basecampid){
        if (!basecampprojectid) {
            console.log(`
                ${record.id}
                ${record.getCellValueAsString("Name")}
                ${record.getCellValueAsString("Status")}
                ${record.getCellValueAsString("Basecamp User ID")}
                ${record.getCellValueAsString("Personal email")}
                ${record.getCellValueAsString("Basecamp Project ID")}
                `);
            invitationBasecamp(record.getCellValueAsString("Name"),record.getCellValueAsString("Personal email"))
    
            const userDataResponse = await fetch('https://3.basecampapi.com/4535691/circles/people.json', {
            headers: {
                'Authorization': `Bearer ${BASECAMP_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
                
            }
            });

            const data = await userDataResponse.json();

            // Iterate over userData to process each user
            let userId = null;
            for (const user of data) {
                if (user.name ===  record.getCellValueAsString("Name")) {
                    userId = user.id.toString();
                    console.log('User ID:', userId);
                    console.log('Email:', user.email_address);
                    if (userId) {
                        airtable_update(record,userId)
                        console.log('Airtable record updated successfully with Basecamp User ID:', userId);
                    } else {
                        console.log('User with name not found in Basecamp.');
                    }
                    break;
                }
                
            }
           
            console.log("all is good")
    }}
}
async function invitationBasecamp(name,email){
    const BASECAMP_ACCESS_TOKEN = inputConfig.BASECAMP_ACCESS_TOKEN
    try{
        const requestBody = {
            "create": [
                {
                    "name": name,
                    "email_address": email
                }
            ]
        } ;
        let response = await fetch('https://3.basecampapi.com/4535691/projects/17447374/people/users.json', {
            method: 'PUT',
            body: JSON.stringify(requestBody),
            headers: {
                'Authorization': `Bearer ${BASECAMP_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
            },
        });
        let r = await response.json();
    
        if (response.status === 200) {
            console.log("invitation was sended, ok");
        }
    }catch (error) {
        console.log('Error', error.message)
    }
}

async function airtable_update(record, userId) {
    let field = table.getField("Basecamp User ID");
    let updates = [
        {
            id: record.id,
            fields: {
                [field.id]: userId
            }
        }
    ];
    
    // Update the record
    await table.updateRecordsAsync(updates);
}

