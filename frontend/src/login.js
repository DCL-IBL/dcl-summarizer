class LoginHandler {
  constructor() {
    this.form = document.getElementById('loginForm');
    this.emailInput = document.getElementById('email');
    this.passwordInput = document.getElementById('password');
    this.loginBtn = document.getElementById('loginBtn');
    this.errorEl = document.getElementById('login-error');
    
    this.init();
  }

  init() {
    // Enable button when form is valid
    this.form.addEventListener('input', () => {
      this.loginBtn.disabled = !this.form.checkValidity();
    });

    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleLogin();
    });
  }

  async handleLogin() {
    const credentials = {
      email: this.emailInput.value.trim(),
      password: this.passwordInput.value
    };

    this.setLoading(true);
    this.clearErrors();

    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
        //credentials: 'include'  // only if using sessions
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Handle JWT response
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        window.location.href = `/dashboard/${data.accessToken}`;
        return;
      }
    } catch (error) {
      this.showError(error.message);
    } finally {
      this.setLoading(false);
    }
  }

  setLoading(loading) {
    this.loginBtn.disabled = loading;
    this.loginBtn.textContent = loading ? 'Signing In...' : 'Sign In';
    this.form.classList.toggle('loading', loading);
  }

  clearErrors() {
    this.errorEl.textContent = '';
    this.errorEl.classList.add('hidden');
    document.querySelectorAll('.error').forEach(el => el.textContent = '');
  }

  showError(message) {
    this.errorEl.textContent = message;
    this.errorEl.classList.remove('hidden');
  }
}

document.addEventListener('DOMContentLoaded', () => new LoginHandler());
