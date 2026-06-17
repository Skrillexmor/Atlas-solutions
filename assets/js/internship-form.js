/* ============================================================
   Atlas SoftWeb Pvt Ltd
   Internship Form — Google Apps Script Integration
   ============================================================
   SETUP: Replace the SCRIPT_URL below with your deployed
   Google Apps Script Web App URL after following the
   integration steps in google-apps-script.js
   ============================================================ */

const SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';

/* ---------- DOM refs ---------- */
const form        = document.getElementById('internshipForm');
const submitBtn   = document.getElementById('submitBtn');
const submitIcon  = document.getElementById('submitIcon');
const submitText  = document.getElementById('submitText');
const formError   = document.getElementById('formError');
const formErrMsg  = document.getElementById('formErrorMsg');
const modal       = document.getElementById('successModal');
const modalClose  = document.getElementById('modalClose');
const modalOkBtn  = document.getElementById('modalOkBtn');
const backdrop    = document.getElementById('modalBackdrop');

if (!form) throw new Error('Internship form not found on page.');

/* ---------- Validation helpers ---------- */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+]?[\d\s\-()]{7,15}$/;

function setFieldState(input, valid, msg) {
  input.classList.toggle('is-invalid', !valid);
  input.classList.toggle('is-valid',   valid);
  const fb = input.nextElementSibling;
  if (fb && fb.classList.contains('invalid-feedback') && msg) {
    fb.textContent = msg;
  }
}

function validateForm() {
  let ok = true;

  const fullName = document.getElementById('fullName');
  const email    = document.getElementById('email');
  const phone    = document.getElementById('phone');
  const college  = document.getElementById('college');
  const course   = document.getElementById('course');
  const program  = document.getElementById('internship');
  const message  = document.getElementById('message');

  // Full Name
  if (!fullName.value.trim() || fullName.value.trim().length < 2) {
    setFieldState(fullName, false, 'Please enter your full name (min 2 characters).');
    ok = false;
  } else {
    setFieldState(fullName, true);
  }

  // Email
  if (!EMAIL_RE.test(email.value.trim())) {
    setFieldState(email, false, 'Please enter a valid email address.');
    ok = false;
  } else {
    setFieldState(email, true);
  }

  // Phone
  if (!PHONE_RE.test(phone.value.trim())) {
    setFieldState(phone, false, 'Please enter a valid phone number.');
    ok = false;
  } else {
    setFieldState(phone, true);
  }

  // College
  if (!college.value.trim() || college.value.trim().length < 3) {
    setFieldState(college, false, 'Please enter your college name.');
    ok = false;
  } else {
    setFieldState(college, true);
  }

  // Course
  if (!course.value) {
    setFieldState(course, false, 'Please select your course.');
    ok = false;
  } else {
    setFieldState(course, true);
  }

  // Internship Program
  if (!program.value) {
    setFieldState(program, false, 'Please select an internship program.');
    ok = false;
  } else {
    setFieldState(program, true);
  }

  // Message
  if (!message.value.trim() || message.value.trim().length < 10) {
    setFieldState(message, false, 'Please write at least 10 characters about your goals.');
    ok = false;
  } else {
    setFieldState(message, true);
  }

  return ok;
}

/* ---------- Loading state ---------- */
function setLoading(loading) {
  submitBtn.disabled = loading;
  if (loading) {
    submitIcon.className = 'fas fa-spinner fa-spin';
    submitText.textContent = ' Submitting...';
  } else {
    submitIcon.className = 'fas fa-paper-plane';
    submitText.textContent = ' Submit Application';
  }
}

/* ---------- Error banner ---------- */
function showError(msg) {
  formErrMsg.textContent = msg;
  formError.classList.remove('d-none');
  formError.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
function hideError() {
  formError.classList.add('d-none');
}

/* ---------- Modal ---------- */
function openModal() {
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  modal.style.display = 'none';
  document.body.style.overflow = '';
}

modalClose.addEventListener('click', closeModal);
modalOkBtn.addEventListener('click', closeModal);
backdrop.addEventListener('click', closeModal);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

/* ---------- Clear form ---------- */
function clearForm() {
  form.reset();
  form.querySelectorAll('.is-valid, .is-invalid').forEach(el => {
    el.classList.remove('is-valid', 'is-invalid');
  });
}

/* ---------- Submit handler ---------- */
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideError();

  if (!validateForm()) {
    // Scroll to first invalid field
    const first = form.querySelector('.is-invalid');
    if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  // Guard: URL not configured
  if (!SCRIPT_URL || SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
    showError('Form endpoint is not configured yet. Please contact us directly at info@atlassoftweb.com');
    return;
  }

  setLoading(true);

  const payload = {
    full_name:          document.getElementById('fullName').value.trim(),
    email:              document.getElementById('email').value.trim(),
    phone:              document.getElementById('phone').value.trim(),
    college:            document.getElementById('college').value.trim(),
    course:             document.getElementById('course').value,
    internship_program: document.getElementById('internship').value,
    message:            document.getElementById('message').value.trim(),
    submitted_at:       new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
  };

  try {
    const res = await fetch(SCRIPT_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'text/plain' }, // avoids CORS preflight
      body:    JSON.stringify(payload),
    });

    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { status: 'error', message: text }; }

    if (res.ok && data.status === 'success') {
      clearForm();
      openModal();
    } else {
      showError(data.message || 'Submission failed. Please try again or contact us directly.');
    }
  } catch (err) {
    console.error('Internship form error:', err);
    showError('Network error — please check your connection and try again.');
  } finally {
    setLoading(false);
  }
});

/* ---------- Live validation on blur ---------- */
['fullName','email','phone','college','course','internship','message'].forEach(id => {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('blur', () => {
    if (el.classList.contains('is-invalid') || el.classList.contains('is-valid')) {
      validateForm();
    }
  });
  el.addEventListener('input', () => {
    if (el.classList.contains('is-invalid')) validateForm();
  });
});
