// Constantes para API
const API_URL = 'https://redhood-api-production.up.railway.app/api';

// Elementos DOM
const userContainer = document.querySelector('.user-container');
const loginOptions = document.querySelector('.login-options');
const loginForm = document.querySelector('.login-form');
const registerForm = document.querySelector('.register-form');
const formOverlay = document.querySelector('.form-overlay');
const overlay = document.querySelector('.overlay');

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Inicialização
    initializeEventListeners();
    checkAuth();
});

function initializeEventListeners() {
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

    // Click nas opções
    document.querySelectorAll('.login-options .option').forEach(option => {
        option.addEventListener('click', handleOptionClick);
    });

    // Formulários
    document.getElementById('loginForm').addEventListener('submit', handleLoginSubmit);
    document.getElementById('registerForm').addEventListener('submit', handleRegisterSubmit);
    document.getElementById('recoveryForm').addEventListener('submit', handleRecoverySubmit);
    document.getElementById('newPasswordForm').addEventListener('submit', handleNewPasswordSubmit);

    // Outros eventos
    document.getElementById('forgotPasswordLink').addEventListener('click', handleForgotPassword);
    document.querySelector('.logout-option').addEventListener('click', handleLogout);
    document.querySelectorAll('.close-form').forEach(btn => {
        btn.addEventListener('click', hideAllForms);
    });
}

// Função para esconder o menu
function hideMenu() {
    loginOptions.classList.remove('active');
    overlay.classList.remove('active');
}

// Função para esconder todos os formulários
function hideAllForms() {
    formOverlay.style.display = 'none';
    loginForm.style.display = 'none';
    registerForm.style.display = 'none';
    document.querySelector('.recovery-form').style.display = 'none';
    document.querySelector('.new-password-form').style.display = 'none';
}

// Função para lidar com o clique nas opções do menu
function handleOptionClick(e) {
    console.log('Opção clicada:', this.querySelector('span').textContent);
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
}

// Função para lidar com o submit do login
async function handleLoginSubmit(e) {
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
}

// Função para lidar com o clique em "Esqueceu a senha?"
function handleForgotPassword(e) {
    e.preventDefault();
    hideAllForms();
    document.querySelector('.recovery-form').style.display = 'block';
    formOverlay.style.display = 'block';
}

// Adicione estas funções que podem estar faltando
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

function updateUIAfterLogin(username) {
    const userText = document.querySelector('.user-text');
    userText.innerHTML = `Olá, ${username}!`;
    userText.style.flexDirection = 'row';
    userText.style.gap = '5px';
    
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

// Função para login
async function handleLogin(email, password) {
    console.log('Tentando login com:', email);
    try {
        const response = await fetch(`${API_URL}/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                senha: password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Erro ao fazer login');
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        return data.user;
    } catch (error) {
        console.error('Erro:', error);
        throw error;
    }
}

function checkAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (token && user) {
        updateUIAfterLogin(user.nome);
    }
}

// Teste a conexão com o backend
fetch(`${API_URL}/users/health`)
    .then(response => response.json())
    .then(data => console.log('Backend status:', data))
    .catch(error => console.error('Erro ao conectar com backend:', error));
