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
