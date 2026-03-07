// public/js/auth.js
document.addEventListener('DOMContentLoaded', () => {
  // Handle login form
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const errorDiv = document.getElementById('error');
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (res.ok) {
          window.location.href = '/';
        } else {
          errorDiv.textContent = data.error || 'Login failed';
        }
      } catch (err) {
        errorDiv.textContent = 'Network error';
      }
    });
  }

  // Handle signup form
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const confirm = document.getElementById('confirmPassword').value;
      const errorDiv = document.getElementById('error');
      if (password !== confirm) {
        errorDiv.textContent = 'Passwords do not match';
        return;
      }
      try {
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (res.ok) {
          window.location.href = '/';
        } else {
          errorDiv.textContent = data.error || 'Signup failed';
        }
      } catch (err) {
        errorDiv.textContent = 'Network error';
      }
    });
  }

  // Handle logout button on any page
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    });
  }

  // Check authentication on protected pages (if not login/signup page)
  const isAuthPage = window.location.pathname === '/login' || window.location.pathname === '/signup';
  if (!isAuthPage) {
    fetch('/api/auth/me')
      .then(res => {
        if (!res.ok) {
          window.location.href = '/login';
        }
      })
      .catch(() => {
        window.location.href = '/login';
      });
  }
});

// ... existing auth.js code ...

// Global popup notification system
window.showPopup = function(message, type = 'success') {
  const container = document.getElementById('popup-container');
  if (!container) return;

  const popup = document.createElement('div');
  popup.className = `popup ${type}`;

  // Icon based on type
  let icon = '✅';
  if (type === 'error') icon = '❌';
  else if (type === 'warning') icon = '⚠️';

  popup.innerHTML = `
    <div class="popup-content">
      <span class="popup-icon">${icon}</span>
      <span class="popup-message">${message}</span>
    </div>
    <button class="popup-close">&times;</button>
  `;

  // Close button
  const closeBtn = popup.querySelector('.popup-close');
  closeBtn.addEventListener('click', () => {
    popup.classList.add('fade-out');
    setTimeout(() => popup.remove(), 300);
  });

  // Auto-dismiss after 3 seconds
  const timeout = setTimeout(() => {
    if (popup.parentNode) {
      popup.classList.add('fade-out');
      setTimeout(() => popup.remove(), 300);
    }
  }, 3000);

  // Prevent auto-dismiss if hovering
  popup.addEventListener('mouseenter', () => clearTimeout(timeout));
  popup.addEventListener('mouseleave', () => {
    const newTimeout = setTimeout(() => {
      if (popup.parentNode) {
        popup.classList.add('fade-out');
        setTimeout(() => popup.remove(), 300);
      }
    }, 3000);
    popup.dataset.timeout = newTimeout;
  });

  container.appendChild(popup);
};