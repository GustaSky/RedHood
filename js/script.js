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
