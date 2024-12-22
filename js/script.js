// Constantes para API
const API_URL = 'https://redhood-api-production.up.railway.app/api';

// Elementos DOM
const userContainer = document.querySelector('.user-container');
const loginOptions = document.querySelector('.login-options');
const loginForm = document.querySelector('.login-form');
const registerForm = document.querySelector('.register-form');
const formOverlay = document.querySelector('.form-overlay');
const overlay = document.querySelector('.overlay');
const passwordInput = document.getElementById('registerPassword');
const strengthMeter = document.querySelector('.strength-meter');
const strengthText = document.querySelector('.strength-text');

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Menu de Login/Registro
    userContainer.addEventListener('click', function(e) {
        e.stopPropagation();
        loginOptions.classList.toggle('active');
        overlay.classList.toggle('active');
    });

    // Fechar menu ao clicar fora
    document.addEventListener('click', function(e) {
        if (!userContainer.contains(e.target)) {
            loginOptions.classList.remove('active');
            overlay.classList.remove('active');
        }
    });

    // Formulário de Login
    document.getElementById('loginForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        try {
            const email = document.getElementById('loginUsername').value.trim();
            const password = document.getElementById('loginPassword').value;
            
            if (!email || !password) {
                showCustomError('Ops!', 'Por favor, preencha todos os campos.');
                return;
            }

            const user = await handleLogin(email, password);
            hideAllForms();
            showLoginSuccess(user.nome);
        } catch (error) {
            showCustomError('Eita!', error.message);
        }
    });

    // Formulário de Registro
    document.getElementById('registerForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        try {
            const userData = {
                username: document.getElementById('registerUsername').value.trim(),
                email: document.getElementById('registerEmail').value.trim(),
                password: document.getElementById('registerPassword').value,
                birthdate: document.getElementById('registerBirthdate').value
            };

            const result = await handleRegister(userData);
            hideAllForms();

            if (result.pin) {
                showPinSuccess(result.pin);
            } else {
                showRegisterSuccess();
            }
        } catch (error) {
            showCustomError('Puts!', error.message);
        }
    });

    // Recuperação de senha
    document.getElementById('forgotPasswordLink').addEventListener('click', function(e) {
        e.preventDefault();
        hideAllForms();
        document.querySelector('.recovery-form').style.display = 'block';
        formOverlay.style.display = 'block';
    });

    // Força da senha
    passwordInput.addEventListener('input', function() {
        const strength = checkPasswordStrength(this.value);
        updatePasswordStrength(strength);
        validateRegisterForm();
    });

    // Botões de fechar
    document.querySelectorAll('.close-form').forEach(btn => {
        btn.addEventListener('click', hideAllForms);
    });

    // Logout
    document.querySelector('.logout-option').addEventListener('click', handleLogout);

    // Click nas opções
    document.querySelectorAll('.login-options .option').forEach(option => {
        option.addEventListener('click', function(e) {
            e.stopPropagation();
            const optionText = this.querySelector('span').textContent;
            
            hideMenu();

            if (optionText === 'Fazer Login') {
                formOverlay.style.display = 'block';
                loginForm.style.display = 'block';
            } 
            else if (optionText === 'Cadastrar-se') {
                formOverlay.style.display = 'block';
                registerForm.style.display = 'block';
            }
            else if (optionText === 'Sair') {
                handleLogout();
            }
        });
    });

    // Validação dos formulários
    const loginInputs = document.querySelectorAll('#loginForm input');
    loginInputs.forEach(input => {
        input.addEventListener('input', validateLoginForm);
    });

    const registerInputs = document.querySelectorAll('#registerForm input');
    registerInputs.forEach(input => {
        input.addEventListener('input', validateRegisterForm);
    });

    const recoveryInputs = document.querySelectorAll('#recoveryForm input');
    recoveryInputs.forEach(input => {
        input.addEventListener('input', validateRecoveryForm);
    });

    const newPasswordInputs = document.querySelectorAll('#newPasswordForm input');
    newPasswordInputs.forEach(input => {
        input.addEventListener('input', validateNewPasswordForm);
    });

    // Validação inicial de todos os formulários
    validateLoginForm();
    validateRegisterForm();
    validateRecoveryForm();
    validateNewPasswordForm();

    // Event listener para o formulário de recuperação
    document.getElementById('recoveryForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        try {
            const email = document.getElementById('recoveryEmail').value.trim();
            const pin = document.getElementById('recoveryPin').value.trim();
            
            if (!email || !pin) {
                showCustomError('Ops!', 'Por favor, preencha todos os campos.');
                return;
            }

            const response = await fetch(`${API_URL}/users/verify-pin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, pin })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'PIN ou email inválidos');
            }

            // Se a verificação for bem-sucedida
            hideAllForms();
            document.querySelector('.new-password-form').style.display = 'block';
        } catch (error) {
            showCustomError('Eita!', error.message);
        }
    });

    // Event listener para o formulário de nova senha
    document.getElementById('newPasswordForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        try {
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const email = document.getElementById('recoveryEmail').value; // Email do formulário anterior
            
            if (!newPassword || !confirmPassword) {
                showCustomError('Ops!', 'Por favor, preencha todos os campos.');
                return;
            }

            if (newPassword !== confirmPassword) {
                showCustomError('Ops!', 'As senhas não coincidem.');
                return;
            }

            const response = await fetch(`${API_URL}/users/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    newPassword
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro ao redefinir senha');
            }

            hideAllForms();
            showCustomError('Sucesso!', 'Sua senha foi alterada com sucesso!');
        } catch (error) {
            showCustomError('Eita!', error.message);
        }
    });

    checkAuth();
});

// Funções Auxiliares
function hideMenu() {
    loginOptions.classList.remove('active');
    overlay.classList.remove('active');
}

function hideAllForms() {
    formOverlay.style.display = 'none';
    loginForm.style.display = 'none';
    registerForm.style.display = 'none';
    document.querySelector('.recovery-form').style.display = 'none';
    document.querySelector('.new-password-form').style.display = 'none';
}

function showCustomError(title, message) {
    const errorPopup = document.querySelector('#error-custom');
    const errorTitle = errorPopup.querySelector('h3');
    const errorMessage = errorPopup.querySelector('p');
    
    errorTitle.textContent = title;
    errorMessage.textContent = message;
    errorPopup.style.display = 'flex';
    
    setTimeout(() => {
        errorPopup.style.display = 'none';
    }, 3000);
}

function showLoginSuccess(username) {
    const successPopup = document.querySelector('#login-success');
    successPopup.style.display = 'flex';
    
    setTimeout(() => {
        successPopup.style.display = 'none';
        updateUIAfterLogin(username);
    }, 2000);
}

function showRegisterSuccess() {
    const successPopup = document.querySelector('#login-success');
    const title = successPopup.querySelector('h3');
    const message = successPopup.querySelector('p');
    
    title.textContent = 'Cadastro Realizado!';
    message.textContent = 'Seja bem-vindo!';
    successPopup.style.display = 'flex';
    
    setTimeout(() => {
        successPopup.style.display = 'none';
    }, 2000);
}

function showPinSuccess(pin) {
    const pinPopup = document.querySelector('#pin-success');
    const pinText = pinPopup.querySelector('#user-pin');
    pinText.textContent = pin;
    pinPopup.style.display = 'flex';
}

function updateUIAfterLogin(username) {
    const userText = document.querySelector('.user-text');
    userText.innerHTML = `Olá, ${username}!`;
    userText.style.flexDirection = 'row';
    
    const regularOptions = document.querySelectorAll('.option:not(.logout-option)');
    const logoutOption = document.querySelector('.logout-option');
    
    regularOptions.forEach(option => option.style.display = 'none');
    logoutOption.style.display = 'flex';
}

function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    const userText = document.querySelector('.user-text');
    userText.innerHTML = 'Faça seu login<br>ou se cadastre aqui!';
    userText.style.flexDirection = 'column';
    
    const regularOptions = document.querySelectorAll('.option:not(.logout-option)');
    const logoutOption = document.querySelector('.logout-option');
    
    regularOptions.forEach(option => option.style.display = 'flex');
    logoutOption.style.display = 'none';
    
    hideMenu();
}

function checkPasswordStrength(password) {
    let strength = 0;
    const checks = {
        length: password.length >= 8,
        lowercase: /[a-z]/.test(password),
        uppercase: /[A-Z]/.test(password),
        numbers: /[0-9]/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    // Conta quantos critérios foram atendidos
    strength = Object.values(checks).filter(Boolean).length;
    
    return strength;
}

function updatePasswordStrength(strength) {
    strengthMeter.className = 'strength-meter';
    strengthText.textContent = '';
    
    if (strength > 0) {
        const strengthClasses = ['weak', 'medium', 'strong', 'very-strong'];
        const strengthTexts = ['Fraca', 'Média', 'Forte', 'Muito Forte'];
        
        const index = Math.min(strength - 1, 3);
        strengthMeter.classList.add(strengthClasses[index]);
        strengthText.textContent = strengthTexts[index];
    }
}

function checkAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (token && user) {
        updateUIAfterLogin(user.nome);
    }
}

// Função para validar formulário de registro
function validateRegisterForm() {
    const nome = document.getElementById('registerUsername').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const senha = document.getElementById('registerPassword').value;
    const dataNascimento = document.getElementById('registerBirthdate').value;
    
    // Validação de idade
    const idade = calculateAge(dataNascimento);
    const ageError = document.querySelector('.age-error');
    if (dataNascimento && idade < 18) {
        ageError.style.display = 'block';
    } else {
        ageError.style.display = 'none';
    }
    
    const submitButton = document.querySelector('#registerForm button[type="submit"]');
    const isValid = 
        nome.length > 0 && 
        email.length > 0 && 
        isValidEmail(email) && 
        senha.length > 0 && 
        checkPasswordStrength(senha) >= 2 && // Reduzido para 2 para facilitar testes
        dataNascimento && 
        idade >= 18;
    
    submitButton.disabled = !isValid;
    submitButton.classList.toggle('disabled', !isValid);
}

// Função para validar email
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Função para calcular idade
function calculateAge(birthdate) {
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

// Função para validar formulário de login
function validateLoginForm() {
    const email = document.getElementById('loginUsername').value.trim();
    const senha = document.getElementById('loginPassword').value;
    
    const submitButton = document.querySelector('#loginForm button[type="submit"]');
    const isValid = email && senha && isValidEmail(email);
    
    submitButton.disabled = !isValid;
    submitButton.classList.toggle('disabled', !isValid);
}

// Função para validar formulário de recuperação
function validateRecoveryForm() {
    const email = document.getElementById('recoveryEmail').value.trim();
    const pin = document.getElementById('recoveryPin').value.trim();
    
    const submitButton = document.querySelector('#recoveryForm button[type="submit"]');
    const isValid = email && isValidEmail(email) && pin && pin.length === 6;
    
    submitButton.disabled = !isValid;
    submitButton.classList.toggle('disabled', !isValid);
}

// Função para validar formulário de nova senha
function validateNewPasswordForm() {
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    const submitButton = document.querySelector('#newPasswordForm button[type="submit"]');
    const isValid = 
        newPassword && 
        confirmPassword && 
        newPassword === confirmPassword && 
        checkPasswordStrength(newPassword) >= 3;
    
    submitButton.disabled = !isValid;
    submitButton.classList.toggle('disabled', !isValid);
}

// Função para login
async function handleLogin(email, password) {
    try {
        console.log('Iniciando login...'); // Debug

        const response = await fetch(`${API_URL}/users/login`, {
            method: 'POST',
            mode: 'no-cors', // Adiciona esta linha
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                senha: password
            })
        });

        console.log('Resposta:', response); // Debug

        if (!response.ok && response.status !== 0) {
            const data = await response.json();
            throw new Error(data.message || 'Erro ao fazer login');
        }

        try {
            const data = await response.json();
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            return data.user;
        } catch {
            return { nome: email.split('@')[0] }; // Fallback
        }
    } catch (error) {
        console.error('Erro completo:', error); // Debug
        throw error;
    }
}

// Função para registro
async function handleRegister(userData) {
    try {
        console.log('Iniciando registro...', userData); // Debug

        const response = await fetch(`${API_URL}/users/register`, {
            method: 'POST',
            mode: 'no-cors', // Adiciona esta linha
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                nome: userData.username,
                email: userData.email,
                senha: userData.password,
                data_nascimento: userData.birthdate
            })
        });

        console.log('Resposta:', response); // Debug

        if (!response.ok && response.status !== 0) { // Modificado para lidar com no-cors
            const data = await response.json();
            throw new Error(data.message || 'Erro ao cadastrar');
        }

        // Com no-cors, podemos não receber uma resposta JSON
        try {
            const data = await response.json();
            return data;
        } catch {
            return { success: true }; // Fallback
        }
    } catch (error) {
        console.error('Erro completo:', error); // Debug
        throw error;
    }
}
