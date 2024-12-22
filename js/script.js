document.getElementById('newPasswordForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    try {
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Validações
        if (!newPassword || !confirmPassword) {
            throw new Error('Por favor, preencha todos os campos.');
        }

        if (newPassword !== confirmPassword) {
            throw new Error('As senhas não coincidem.');
        }

        const strength = checkPasswordStrength(newPassword);
        if (strength < 2) {
            throw new Error('A senha precisa ser mais forte.');
        }

        // Envia a nova senha
        const response = await fetch(`${API_URL}/users/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                senha: newPassword
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Erro ao redefinir senha');
        }

        hideAllForms();
        showCustomError('Sucesso!', 'Sua senha foi alterada com sucesso!');
        
        // Redireciona para o login
        setTimeout(() => {
            formOverlay.style.display = 'block';
            loginForm.style.display = 'block';
        }, 2000);

    } catch (error) {
        console.error('Erro ao redefinir senha:', error);
        showCustomError('Erro!', error.message);
    }
});

function hideAllForms() {
    // Esconde o overlay
    formOverlay.style.display = 'none';
    
    // Esconde todos os formulários
    document.querySelectorAll('.login-form, .register-form, .recovery-form, .new-password-form').forEach(form => {
        form.style.display = 'none';
    });

    // Esconde os popups
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

// Função para validar formulário de nova senha
function validateNewPasswordForm() {
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Atualiza o indicador de força
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

// Adiciona os listeners para a força da senha
document.getElementById('newPassword').addEventListener('input', validateNewPasswordForm);
document.getElementById('confirmPassword').addEventListener('input', validateNewPasswordForm);

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
