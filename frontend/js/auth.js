import { api } from './api.js';
import { showAlert } from './utils.js';

const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const btn = loginForm.querySelector('button');

    try {
      btn.disabled = true;
      btn.textContent = 'Logging in...';
      const data = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = '/pages/dashboard.html';
    } catch (err) {
      showAlert(err.message);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Login';
    }
  });
}

const signupForm = document.getElementById('signupForm');
if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const btn = signupForm.querySelector('button');

    if (password !== confirmPassword) {
      showAlert('Passwords do not match');
      return;
    }

    try {
      btn.disabled = true;
      btn.textContent = 'Signing up...';
      const data = await api.post('/auth/signup', { name, email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = '/pages/dashboard.html';
    } catch (err) {
      showAlert(err.message);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Sign Up';
    }
  });
}
