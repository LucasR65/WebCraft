document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  if (!form) return; // page n'a pas le formulaire

  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const messageInput = document.getElementById('message');

  const errName = document.getElementById('err-name');
  const errEmail = document.getElementById('err-email');
  const errMsg = document.getElementById('err-message');
  const success = document.getElementById('form-success');

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function showError(el, text) {
    if (!el) return;
    el.hidden = false;
    el.textContent = text;
  }
  function clearError(el) {
    if (!el) return;
    el.hidden = true;
    el.textContent = '';
  }

  // Optional: clear error while user types
  [nameInput, emailInput, messageInput].forEach((input) => {
    if (!input) return;
    input.addEventListener('input', () => {
      const errMap = {
        name: errName,
        email: errEmail,
        message: errMsg
      };
      clearError(errMap[input.id]);
      if (success) { success.hidden = true; success.textContent = ''; }
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // reset errors / success
    clearError(errName); clearError(errEmail); clearError(errMsg);
    if (success) { success.hidden = true; success.textContent = ''; }

    let valid = true;

    if (!nameInput.value.trim()) {
      showError(errName, 'Le nom est requis.');
      valid = false;
    }

    const emailVal = emailInput.value.trim();
    if (!emailVal || !emailRe.test(emailVal)) {
      showError(errEmail, 'Email invalide.');
      valid = false;
    }

    const msgVal = messageInput.value.trim();
    if (!msgVal || msgVal.length < 10) {
      showError(errMsg, 'Message trop court (10 caractères minimum).');
      valid = false;
    }

    if (!valid) {
      // focus sur le premier champ en erreur
      const firstErr = document.querySelector('.form-error:not([hidden])');
      if (firstErr) {
        // on cherche l'input précédent (label/input structure)
        const prev = firstErr.previousElementSibling;
        if (prev && (prev.focus)) prev.focus();
      }
      return;
    }

    // Simule envoi (pas d'API réelle)
    if (success) {
      success.hidden = false;
      success.textContent = 'Message envoyé (simulé) — merci !';
    }
    form.reset();
  });
});