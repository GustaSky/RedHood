async function handleLogin(email, password) {
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

        // Salva os dados do usuário
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Atualiza a interface
        hideAllForms();
        showLoginSuccess(data.user.nome);

        return data.user;
    } catch (error) {
        console.error('Erro:', error);
        throw error;
    }
}

// Event listener para o formulário de login
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    try {
        const email = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;
        
        if (!email || !password) {
            showCustomError('Ops!', 'Por favor, preencha todos os campos.');
            return;
        }

        await handleLogin(email, password);
    } catch (error) {
        showCustomError('Erro!', error.message);
    }
});

function hideAllForms() {
    formOverlay.style.display = 'none';
    document.querySelectorAll('.login-form, .register-form, .recovery-form, .new-password-form').forEach(form => {
        form.style.display = 'none';
    });
    document.querySelectorAll('.error-popup, .success-popup, .pin-popup').forEach(popup => {
        popup.style.display = 'none';
    });
}

// Adiciona evento de clique no overlay para fechar
formOverlay.addEventListener('click', hideAllForms);

// Botões de fechar
document.querySelectorAll('.close-form').forEach(btn => {
    btn.addEventListener('click', hideAllForms);
});

function updatePasswordStrength(strength, meter, text) {
    if (!meter || !text) return;
    
    meter.className = 'strength-meter';
    text.textContent = '';
    
    if (strength > 0) {
        const strengthClasses = ['weak', 'medium', 'strong', 'very-strong'];
        const strengthTexts = ['Fraca', 'Média', 'Forte', 'Muito Forte'];
        
        const index = Math.min(strength - 1, 3);
        meter.classList.add(strengthClasses[index]);
        text.textContent = strengthTexts[index];
    }
}

function validateLoginForm() {
    const email = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    const submitButton = document.querySelector('#loginForm button[type="submit"]');
    const isValid = email && password && isValidEmail(email);
    
    submitButton.disabled = !isValid;
    submitButton.classList.toggle('disabled', !isValid);
}

function validateNewPasswordForm() {
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    const strength = checkPasswordStrength(newPassword);
    const strengthMeter = document.querySelector('.new-password-form .strength-meter');
    const strengthText = document.querySelector('.new-password-form .strength-text');
    
    updatePasswordStrength(strength, strengthMeter, strengthText);
    
    const submitButton = document.querySelector('#newPasswordForm button[type="submit"]');
    const isValid = 
        newPassword && 
        confirmPassword && 
        newPassword === confirmPassword && 
        strength >= 2;
    
    submitButton.disabled = !isValid;
    submitButton.classList.toggle('disabled', !isValid);
}

function showCustomError(title, message, duration = 3000) {
    const errorPopup = document.querySelector('#error-custom');
    const errorTitle = errorPopup.querySelector('h3');
    const errorMessage = errorPopup.querySelector('p');
    
    errorTitle.textContent = title;
    errorMessage.textContent = message;
    errorPopup.style.display = 'flex';
    
    setTimeout(() => {
        errorPopup.style.display = 'none';
    }, duration);
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
    
    strength = Object.values(checks).filter(Boolean).length;
    return strength;
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

document.addEventListener('DOMContentLoaded', function() {
    // Validação inicial
    validateLoginForm();
    validateNewPasswordForm();

    // Event listeners para inputs
    document.getElementById('loginUsername').addEventListener('input', validateLoginForm);
    document.getElementById('loginPassword').addEventListener('input', validateLoginForm);
    document.getElementById('newPassword').addEventListener('input', validateNewPasswordForm);
    document.getElementById('confirmPassword').addEventListener('input', validateNewPasswordForm);

    // Event listeners para botões de fechar
    formOverlay.addEventListener('click', hideAllForms);
    document.querySelectorAll('.close-form').forEach(btn => {
        btn.addEventListener('click', hideAllForms);
    });

    // Verifica autenticação ao carregar
    checkAuth();
});

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
