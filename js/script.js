const userContainer = document.querySelector('.user-container');
const overlay = document.querySelector('.overlay');
const loginOptions = document.querySelector('.login-options');

// Elementos dos formulários
const loginForm = document.querySelector('.login-form');
const registerForm = document.querySelector('.register-form');
const formOverlay = document.querySelector('.form-overlay');
const closeBtns = document.querySelectorAll('.close-form');

// Adicione estas constantes no início do arquivo
const errorPopup = document.querySelector('.error-popup');
const errorCloseBtn = document.querySelector('.error-close');

// Adicione este código novo
const birthdateInput = document.getElementById('registerBirthdate');
const submitButton = document.querySelector('#registerForm button[type="submit"]');

// Adicione no início do arquivo com as outras constantes
const passwordInput = document.getElementById('registerPassword');
const strengthMeter = document.querySelector('.strength-meter');
const strengthText = document.querySelector('.strength-text');

// Adicione estas constantes no início do arquivo
const registerUsername = document.getElementById('registerUsername');
const registerEmail = document.getElementById('registerEmail');
const registerSubmitButton = document.querySelector('#registerForm button[type="submit"]');

// Adicione no início do arquivo com as outras constantes
let isLoggedIn = false;
let currentUser = null;

// Adicione no início com as outras constantes
const successPopup = document.querySelector('.success-popup');

// Função para atualizar a interface após o login
function updateUIAfterLogin(username) {
    isLoggedIn = true;
    currentUser = username;
    
    // Atualiza o texto sem quebra de linha e adiciona ponto de exclamação
    const userText = document.querySelector('.user-text');
    userText.innerHTML = `Olá, ${username}!`;
    userText.style.flexDirection = 'row';
    userText.style.gap = '5px';
    
    // Atualiza as opções do menu
    const regularOptions = document.querySelectorAll('.option:not(.logout-option)');
    const logoutOption = document.querySelector('.logout-option');
    
    regularOptions.forEach(option => option.style.display = 'none');
    logoutOption.style.display = 'flex';
}

// Função para fazer logout
function handleLogout() {
    isLoggedIn = false;
    currentUser = null;
    
    // Restaura o texto original
    const userText = document.querySelector('.user-text');
    userText.innerHTML = 'Faça seu login<br>ou se cadastre aqui!';
    userText.style.flexDirection = 'column';
    userText.style.gap = '0';
    
    // Restaura as opções do menu
    const regularOptions = document.querySelectorAll('.option:not(.logout-option)');
    const logoutOption = document.querySelector('.logout-option');
    
    regularOptions.forEach(option => option.style.display = 'flex');
    logoutOption.style.display = 'none';
    
    // Esconde o menu
    hideMenu();
}

// Modifique o event listener do container para uma função nomeada
function handleUserContainerClick(e) {
    if (loginOptions.classList.contains('active')) {
        hideMenu();
    } else {
        showMenu();
    }
}

// Adicione esta função para validar todos os campos em tempo real
function validateAllFields() {
    const username = registerUsername.value.trim();
    const email = registerEmail.value.trim();
    const password = passwordInput.value;
    const birthdate = birthdateInput.value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // Verifica todas as condições
    const isValid = 
        username && username.length > 0 && // Username preenchido
        email && emailRegex.test(email) && // Email válido
        password && checkPasswordStrength(password) >= 2 && // Senha forte o suficiente
        birthdate && calculateAge(birthdate) >= 18; // Idade válida
    
    // Desabilita/habilita o botão de submit
    const submitButton = document.querySelector('#registerForm button[type="submit"]');
    submitButton.disabled = !isValid;
    submitButton.classList.toggle('disabled', !isValid);
}

// Adicione event listeners para todos os campos
[registerUsername, registerEmail, passwordInput, birthdateInput].forEach(input => {
    ['input', 'change', 'keyup'].forEach(eventType => {
        input.addEventListener(eventType, validateAllFields);
    });
});

// Modifique o event listener do passwordInput para incluir a validação completa
passwordInput.addEventListener('input', function() {
    const password = this.value;
    const strength = checkPasswordStrength(password);
    updatePasswordStrength(strength, password);
    validateAllFields(); // Adiciona validação completa
});

// Modifique o event listener do birthdateInput
birthdateInput.addEventListener('change', function() {
    const age = calculateAge(this.value);
    const errorMessage = this.parentElement.querySelector('.field-error');
    
    if (errorMessage) {
        errorMessage.remove();
    }
    
    if (!age || age < 18) {
        const error = document.createElement('div');
        error.className = 'field-error';
        error.textContent = 'Você precisa ter 18 anos ou mais para se cadastrar.';
        this.parentElement.appendChild(error);
    }
    
    validateAllFields(); // Adiciona validação completa
});

// Chame a validação inicial para garantir que o botão comece desabilitado
document.addEventListener('DOMContentLoaded', function() {
    validateAllFields();
});

// Função para atualizar visual da força da senha
function updatePasswordStrength(strength, password) {
    strengthMeter.className = 'strength-meter';
    strengthText.textContent = '';
    
    if (!password) {
        return;
    }
    
    // Atualiza a barra e o texto baseado na força atual
    switch(strength) {
        case 1:
            strengthMeter.classList.add('weak');
            strengthText.textContent = 'Senha fraca';
            break;
        case 2:
            strengthMeter.classList.add('medium');
            strengthText.textContent = 'Senha média';
            break;
        case 3:
            strengthMeter.classList.add('strong');
            strengthText.textContent = 'Senha forte';
            break;
        case 4:
            strengthMeter.classList.add('very-strong');
            strengthText.textContent = 'Senha muito forte';
            break;
        default:
            strengthMeter.classList.add('weak');
            strengthText.textContent = 'Senha muito fraca';
    }
    
    // Força a reavaliação dos campos
    validateAllFields();
}

// Função para verificar força da senha
function checkPasswordStrength(password) {
    const checks = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    return Object.values(checks).filter(Boolean).length;
}

// Função para mostrar o menu
function showMenu() {
    loginOptions.classList.add('active');
    overlay.classList.add('active');
}

// Função para esconder o menu
function hideMenu() {
    loginOptions.classList.remove('active');
    overlay.classList.remove('active');
}

// Click no container do usuário
userContainer.addEventListener('click', handleUserContainerClick);

// Função para mostrar formulário
function showForm(form) {
    if (isLoggedIn) return; // Não mostra o formulário se estiver logado
    
    formOverlay.style.display = 'block';
    form.style.display = 'block';
}

// Função para esconder formulário
function hideForm(form) {
    formOverlay.style.display = 'none';
    form.style.display = 'none';
    resetForms();  // Adiciona reset dos formulários
}

// Função para mostrar erro
function showError(message) {
    document.getElementById('error-message').textContent = message;
    errorPopup.style.display = 'flex';
}

// Função para esconder erro
function hideError() {
    errorPopup.style.display = 'none';
}

// Função para limpar formulários
function resetForms() {
    document.getElementById('loginForm').reset();
    document.getElementById('registerForm').reset();
    
    // Reseta o indicador de força da senha
    strengthMeter.className = 'strength-meter';
    strengthText.textContent = '';
    
    // Força uma reavaliação dos campos
    validateAllFields();
}

// Click nas opções
document.querySelectorAll('.option').forEach(option => {
    option.addEventListener('click', (e) => {
        e.stopPropagation(); // Previne que o click propague para o userContainer
        if (isLoggedIn) {
            // Se estiver logado, apenas processa o logout
            if (option.classList.contains('logout-option')) {
                handleLogout();
            }
        } else {
            // Se não estiver logado, mostra os formulários apropriados
            if (option.querySelector('span').textContent === 'Fazer Login') {
                showForm(loginForm);
            } else if (option.querySelector('span').textContent === 'Cadastrar-se') {
                showForm(registerForm);
            }
        }
        hideMenu();
    });
});

// Click fora fecha o menu
document.addEventListener('click', (e) => {
    if (!userContainer.contains(e.target)) {
        hideMenu();
    }
});

// Fechar formulários
closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        hideForm(loginForm);
        hideForm(registerForm);
        hideError();  // Esconde qualquer erro que possa estar visível
    });
});

// Click fora fecha o formulário
formOverlay.addEventListener('click', () => {
    hideForm(loginForm);
    hideForm(registerForm);
    hideError();
});

// Função para calcular idade (atualizada)
function calculateAge(birthdate) {
    const today = new Date();
    const birth = new Date(birthdate);
    
    // Verificação de data válida
    if (!birthdate || isNaN(birth.getTime())) {
        return 0;
    }
    
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    
    // Ajuste para mês e dia
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    
    return age;
}

// Função para mostrar sucesso do login
function showLoginSuccess(username) {
    const successPopup = document.querySelector('#login-success');
    const title = successPopup.querySelector('h3');
    const message = successPopup.querySelector('p');
    
    title.textContent = 'Login Realizado!';
    message.textContent = 'Bem-vindo de volta!';
    successPopup.style.display = 'flex';
    
    setTimeout(() => {
        successPopup.style.display = 'none';
        updateUIAfterLogin(username);
    }, 2000);
}

// Função para mostrar sucesso do cadastro
function showRegisterSuccess() {
    const successPopup = document.querySelector('#login-success');
    const title = successPopup.querySelector('h3');
    const message = successPopup.querySelector('p');
    
    // Pega o nome do usuário do formulário de cadastro
    const username = document.getElementById('registerUsername').value.trim();
    
    title.textContent = 'Cadastro Realizado!';
    message.textContent = 'Seja bem-vindo!';
    successPopup.style.display = 'flex';
    
    setTimeout(() => {
        successPopup.style.display = 'none';
        // Atualiza a interface igual ao login
        updateUIAfterLogin(username);
    }, 2000);
}

// No evento de login
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!username || !password) {
        showError('Por favor, preencha todos os campos.');
        return false;
    }
    
    // Esconde o formulário
    formOverlay.style.display = 'none';
    loginForm.style.display = 'none';
    
    // Mostra sucesso e atualiza interface
    showLoginSuccess(username);
    
    // Limpa os campos
    document.getElementById('loginForm').reset();
    return false;
});

// No evento de cadastro
document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // ... todas as validações existentes ...
    
    // Se chegou aqui, tudo está válido
    formOverlay.style.display = 'none';
    registerForm.style.display = 'none';
    
    // Mostra sucesso
    showRegisterSuccess();
    
    // Limpa os campos
    resetForms();
    return false;
});

// Fechar erro ao clicar no botão OK
errorCloseBtn.addEventListener('click', hideError);

// Escape key para fechar formulários e erros
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        hideForm(loginForm);
        hideForm(registerForm);
        hideError();
    }
});

// Adicione o event listener para o logout
document.querySelector('.logout-option').addEventListener('click', (e) => {
    e.stopPropagation();
    handleLogout();
});
