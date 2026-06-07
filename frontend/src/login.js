class LoginHandler {
  constructor() {
    //login form elements
    this.form = document.getElementById('loginForm');
    this.emailInput = document.getElementById('email');
    this.passwordInput = document.getElementById('password');
    this.loginBtn = document.getElementById('loginBtn');
    this.errorEl = document.getElementById('login-error');
    
    //registration form elements
    this.registrationForm = document.getElementById('signup-form');
    this.registrationBtn = document.getElementById('signupBtn');
    this.showRegistratinFormBtn = document.getElementById('show-signup-btn');
    this.registrationEmail = document.getElementById('reg_email');
    this.registrationPassword = document.getElementById('reg_password');
    
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

    this.showRegistratinFormBtn.addEventListener('click', () => {
      if (this.registrationForm.style.display === 'none') {
        this.registrationForm.style.display = 'block';
        this.form.style.display = 'none';
      } else {
        this.form.style.display = 'block';
        this.registrationForm.style.display = 'none';
      }
    })

    this.registrationForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSignup();
    })
  }

  async handleLogin() {
    const credentials = {
      email: this.emailInput.value.trim(),
      password: this.passwordInput.value
    };

    this.setLoading(true);
    this.clearErrors();

    try {
      const response = await fetch('/LLMinfrastructure/auth/login', {
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
        window.location.href = `/LLMinfrastructure/dashboard/${data.accessToken}`;
        return;
      }
    } catch (error) {
      this.showError(error.message);
    } finally {
      this.setLoading(false);
    }
  }

  async handleSignup() {
    const credentials = {
      email: this.registrationEmail.value.trim(),
      password: this.registrationPassword.value
    };

    try {
      const response = await fetch('/LLMinfrastructure/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
        //credentials: 'include'  // only if using sessions
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      //window.location.reload();
      return;
    } catch (error) {
      alert(error.message);
    } finally {
      
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
