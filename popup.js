document.getElementById('showLogin').addEventListener('click', function() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registrationForm').style.display = 'none';
});

document.getElementById('showRegister').addEventListener('click', function() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registrationForm').style.display = 'block';
});

var supabaseUrl;
var supabaseKey;

function getSecureKey(keyName) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ action: keyName }, (response) => {
            if (response && response.key) {
                switch (keyName) {
                    case 'supabaseUrl':
                        supabaseUrl = response.key;
                        break;
                    case 'supabaseKey':
                        supabaseKey = response.key;
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

async function loadAllKeys() {
    try {
        await getSecureKey('supabaseUrl');
        await getSecureKey('supabaseKey');
    } catch (error) {
        console.error(error);
    }
}

loadAllKeys();

// Função para lidar com o login
document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const { data, error } = await fetch(supabaseUrl + '/auth/v1/token?grant_type=password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseKey,
                'Authorization': `Bearer ` + supabaseKey
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        }).then(response => response.json());

        if (error) {
            document.getElementById('statusMessage').innerText = `Login Error: ${error.message}`;
        } else {
            document.getElementById('statusMessage').innerText = 'Login successful!';
        }
    } catch (error) {
        document.getElementById('statusMessage').innerText = `Unexpected error: ${error.message}`;
    }
});

// Função para lidar com o registro
document.getElementById('registrationForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    try {
        const { data, error } = await fetch(supabaseUrl + '/rest/v1/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseKey,
                'Authorization': `Bearer ` + supabaseKey,
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                name: name,
                email: email,
                password: password
            })
        }).then(response => response.json());

        if (error) {
            document.getElementById('statusMessage').innerText = `Registration Error: ${error.message}`;
        } else {
            document.getElementById('statusMessage').innerText = 'User registered successfully!';
        }
    } catch (error) {
        document.getElementById('statusMessage').innerText = `Unexpected error: ${error.message}`;
    }
});
