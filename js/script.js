document.getElementById('newPasswordForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    try {
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const email = localStorage.getItem('reset_email');
        const pin = localStorage.getItem('reset_pin');

        // Validação apenas da nova senha
        if (!newPassword || !confirmPassword) {
            throw new Error('Por favor, preencha a nova senha.');
        }

        if (newPassword !== confirmPassword) {
            throw new Error('As senhas não coincidem.');
        }

        // Verifica força da senha
        const strength = checkPasswordStrength(newPassword);
        if (strength < 2) {
            throw new Error('A senha precisa ser mais forte.');
        }

        // Atualiza a senha no backend
        const response = await fetch(`${API_URL}/users/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                senha: newPassword // Enviando apenas a nova senha
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Erro ao redefinir senha');
        }

        hideAllForms();
        showCustomError('Sucesso!', 'Sua senha foi alterada com sucesso!');
        
        setTimeout(() => {
            formOverlay.style.display = 'block';
            loginForm.style.display = 'block';
        }, 2000);

    } catch (error) {
        console.error('Erro ao redefinir senha:', error);
        showCustomError('Erro!', error.message);
    }
});

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Menu de Login/Registro
    const userContainer = document.querySelector('.user-container');
    const loginOptions = document.querySelector('.login-options');
    const overlay = document.querySelector('.overlay');
    const formOverlay = document.querySelector('.form-overlay');
    const loginForm = document.querySelector('.login-form');
    const registerForm = document.querySelector('.register-form');

    // Evento de clique no ícone de usuário
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

    // Click nas opções de login/registro
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

    // Validação dos formulários
    const loginInputs = document.querySelectorAll('#loginForm input');
    loginInputs.forEach(input => {
        input.addEventListener('input', validateLoginForm);
    });

    // Botões de fechar
    document.querySelectorAll('.close-form').forEach(btn => {
        btn.addEventListener('click', hideAllForms);
    });

    // Recuperação de senha
    document.getElementById('forgotPasswordLink').addEventListener('click', function(e) {
        e.preventDefault();
        hideAllForms();
        document.querySelector('.recovery-form').style.display = 'block';
        formOverlay.style.display = 'block';
    });

    // Logout
    document.querySelector('.logout-option').addEventListener('click', handleLogout);

    // Verificar autenticação ao carregar
    checkAuth();
});

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
