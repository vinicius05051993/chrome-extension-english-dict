const supabaseUrl = "https://wgkakdbjxdqfdshqodtw.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indna2FrZGJqeGRxZmRzaHFvZHR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjM2NjQ0NzcsImV4cCI6MjAzOTI0MDQ3N30.yAEn_IPXMxK4holhx9osY8nwHPVQIuF8bPZ7_asV0KM";

document.getElementById('showLogin').addEventListener('click', function() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registrationForm').style.display = 'none';
});

document.getElementById('showRegister').addEventListener('click', function() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registrationForm').style.display = 'block';
});

document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(supabaseUrl + '/auth/v1/token?grant_type=password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (data.error) {
            document.getElementById('statusMessage').innerText = `Login Error: ${data.error.message}`;
        } else {
            sendLoggedData('saveLoggedToken', data['access_token'])
            sendLoggedData('saveLoggedUserId', data['user']['id'])

            document.getElementById('statusMessage').innerText = 'Login feito com sucesso!';
        }
    } catch (error) {
        document.getElementById('statusMessage').innerText = `Unexpected error: ${error.message}`;
    }
});

document.getElementById('registrationForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    try {
        const response = await fetch(supabaseUrl + '/rest/v1/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                name: name,
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (data.error) {
            document.getElementById('statusMessage').innerText = `Registration Error: ${data.error.message}`;
        } else {
            sendLoggedData('saveLoggedToken', data['access_token'])
            sendLoggedData('saveLoggedUserId', data['user']['id'])

            document.getElementById('statusMessage').innerText = "Registrado com sucesso!";
        }
    } catch (error) {
        document.getElementById('statusMessage').innerText = `Unexpected error: ${error.message}`;
    }
});

function sendLoggedData(keyName, value)
{
    chrome.runtime.sendMessage({ action: keyName, value: value }, (response) => {

    });
}