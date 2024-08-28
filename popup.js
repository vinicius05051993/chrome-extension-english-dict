const supabaseUrl = "https://wgkakdbjxdqfdshqodtw.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indna2FrZGJqeGRxZmRzaHFvZHR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjM2NjQ0NzcsImV4cCI6MjAzOTI0MDQ3N30.yAEn_IPXMxK4holhx9osY8nwHPVQIuF8bPZ7_asV0KM";
let supabaseRefreshToken = false;

async function makeLogin(email, password) {
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
            document.getElementById('errorMessage').innerText = `Login Error: ${data.error.message}`;
            document.getElementById('successMessage').innerText = '';
            document.getElementById('status').innerText = 'OFFLINE';
            document.getElementById('online').style.display = 'none';
            document.getElementById('offline').style.display = 'block';
        } else {
            sendLoggedData('saveLoggedToken', data['access_token'])
            sendLoggedData('saveLoggedUserId', data['user']['id'])
            sendLoggedData('saveRefreshToken', data['refresh_token'])

            document.getElementById('status').innerText = 'ONLINE';
            document.getElementById('online').style.display = 'block';
            document.getElementById('offline').style.display = 'none';
            document.getElementById('Sair').style.display = 'block';
            document.getElementById("defaultOpenLogin").click();

            document.getElementById('successMessage').innerText = 'Login feito com sucesso! atualize a página para começar a usar.';
            document.getElementById('errorMessage').innerText = '';
        }
    } catch (error) {
        document.getElementById('errorMessage').innerText = `Unexpected error: ${error.message}`;
        document.getElementById('successMessage').innerText = '';
        document.getElementById('status').innerText = 'OFFLINE';
        document.getElementById('online').style.display = 'none';
        document.getElementById('offline').style.display = 'block';
    }
}

document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    await makeLogin(email, password);
});

function getSecureKey(keyName) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ action: keyName }, (response) => {
            if (response) {
                switch (keyName) {
                    case 'supabaseRefreshToken':
                        supabaseRefreshToken = response.key;
                        break;
                    default:
                        console.warn(`Unknown keyName: ${keyName}`);
                        break;
                }
                resolve(response.key);
            } else {
                reject('Não foi possível obter o secretKey.');
            }
        });
    });
}

document.getElementById('logoffForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    await getSecureKey('supabaseRefreshToken');

    if (supabaseRefreshToken) {
        const response = await fetch(supabaseUrl + '/auth/v1/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseRefreshToken}`
            }
        });

        if (response.ok) {
            sendLoggedData('saveLoggedToken', false)
            sendLoggedData('saveLoggedUserId', false)
            sendLoggedData('saveRefreshToken', false)

            document.getElementById('successMessage').innerText = 'Conta deslogada com sucesso!';
            document.getElementById('status').innerText = 'OFFLINE';
            document.getElementById('online').style.display = 'none';
            document.getElementById('offline').style.display = 'block';
        } else {
            document.getElementById('errorMessage').innerText = response.statusText;
        }
    } else {
        console.error('Nenhum refresh token encontrado');
    }
});

document.getElementById('registrationForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirm_password = document.getElementById('confirmRegisterPassword').value;

    if (password === confirm_password) {
        try {
            const response = await fetch(`${supabaseUrl}/auth/v1/signup`, {
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

            if (response.ok) {
                await makeLogin(email, password);
            } else {
                document.getElementById('errorMessage').innerText = `Registration Error: ${data.msg}`;
                document.getElementById('successMessage').innerText = '';
                document.getElementById('status').innerText = 'OFFLINE';
                document.getElementById('online').style.display = 'none';
                document.getElementById('offline').style.display = 'block';
            }
        } catch (error) {
            document.getElementById('errorMessage').innerText = `Unexpected error: ${error.message}`;
            document.getElementById('successMessage').innerText = '';
            document.getElementById('status').innerText = 'OFFLINE';
            document.getElementById('online').style.display = 'none';
            document.getElementById('offline').style.display = 'block';
        }
    } else {
        document.getElementById('errorMessage').innerText = 'Senha deve ser a mesma nos dois campos!';
        document.getElementById('successMessage').innerText = '';
        document.getElementById('status').innerText = 'OFFLINE';
        document.getElementById('online').style.display = 'none';
        document.getElementById('offline').style.display = 'block';
    }
});

function sendLoggedData(keyName, value)
{
    chrome.runtime.sendMessage({ action: keyName, value: value }, (response) => {

    });
}

function openPage(pageName, elmnt, color) {
    // Hide all elements with class="tabcontent" by default */
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Remove the background color of all tablinks/buttons
    tablinks = document.getElementsByClassName("tablink");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].style.backgroundColor = "";
    }

    document.getElementById(pageName).style.display = "block";
    elmnt.style.backgroundColor = color;
}

const tablinks = document.querySelectorAll('.tablink');
tablinks.forEach(tablink => {
    tablink.addEventListener('click', function() {
        console.log(this.getAttribute('color'))
        openPage(this.innerText, this, this.getAttribute('color'))
    });
});

function isLogged() {
    chrome.runtime.sendMessage({ action: 'supabaseLoggedUserId' }, (response) => {
        if (response && response.key) {
            document.getElementById('status').innerText = 'ONLINE';
            document.getElementById('online').style.display = 'block';
            document.getElementById('offline').style.display = 'none';

            document.getElementById("defaultOpenLogin").click();
        } else {
            document.getElementById('status').innerText = 'OFFLINE';
            document.getElementById('online').style.display = 'none';
            document.getElementById('offline').style.display = 'block';

            document.getElementById("defaultOpen").click();
        }
    });
}

isLogged()