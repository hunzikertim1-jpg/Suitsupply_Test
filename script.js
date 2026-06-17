'use strict';

// ── State ──────────────────────────────────────────────────────────────────
const state = {
  step: 1,
  appointmentType: null,
  experienceLevel: 3,
  occasions: [],
  groupSize: 2,
  budget: null,
  datePreference: '',
  timePreference: null,
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  notes: '',
  consentGiven: false,
};

// ── Appointment metadata ───────────────────────────────────────────────────
const APPOINTMENTS = {
  'style-consultation':   { label: 'Style Consultation',      duration: '45 min' },
  'custom-made':          { label: 'Custom Made',             duration: '90 min' },
  'wedding-party':        { label: 'Wedding Party',           duration: '120 min' },
  'alterations':          { label: 'Alterations & Fitting',   duration: '30 min' },
  'wardrobe-consultation':{ label: 'Wardrobe Consultation',   duration: '75 min' },
  'black-tie':            { label: 'Black-Tie & Formal Event',duration: '45 min' },
};

const EXPERIENCE_TIPS = {
  1: 'Perfect — your Expert will walk you through everything from scratch, no prior knowledge needed.',
  2: 'Great — we\'ll cover fit nuances and help you find your ideal silhouette from ready-to-wear.',
  3: 'Nice — we\'ll fine-tune your preferences and explore fabrics and construction upgrades.',
  4: 'Excellent — we\'ll go straight into the details: fabrics, canvassing, and bespoke options.',
  5: 'Welcome back — your Expert will match your level and focus on the finer points of craft.',
};

const EXPERIENCE_LABELS = {
  1: 'New to suits',
  2: 'Bought off-rack',
  3: 'Regular wearer',
  4: 'Been fitted before',
  5: 'Suit connoisseur',
};

const BUDGET_LABELS = {
  rtw: 'Ready-to-Wear (~€300–600)',
  custom: 'Custom Made (~€600–1,200)',
  premium: 'Premium / No limit',
};

const TIME_LABELS = {
  morning: 'Morning (09:00–12:00)',
  afternoon: 'Afternoon (12:00–17:00)',
  evening: 'Evening (17:00–19:00)',
};

// ── DOM refs ───────────────────────────────────────────────────────────────
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

// ── Header scroll ──────────────────────────────────────────────────────────
const header = $('#site-header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// ── Mobile nav ─────────────────────────────────────────────────────────────
const navToggle = $('.nav-toggle');
const mobileNav = $('#mobile-nav');
navToggle.addEventListener('click', () => {
  const isOpen = mobileNav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', isOpen);
  mobileNav.setAttribute('aria-hidden', !isOpen);
});
mobileNav.addEventListener('click', e => {
  if (e.target.tagName === 'A') {
    mobileNav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', false);
    mobileNav.setAttribute('aria-hidden', true);
  }
});

// ── Step navigation ────────────────────────────────────────────────────────
function goToStep(n) {
  state.step = n;

  $$('.booking-step').forEach((el, i) => {
    const active = i + 1 === n;
    el.classList.toggle('active', active);
    el.setAttribute('aria-hidden', !active);
  });

  $$('.step-indicator .step').forEach((el, i) => {
    el.classList.toggle('active', i + 1 === n);
    el.classList.toggle('completed', i + 1 < n);
  });

  // Scroll booking section into view
  setTimeout(() => {
    $('#booking').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 60);
}

// ── Appointment card selection ─────────────────────────────────────────────
$$('.appt-card').forEach(card => {
  card.addEventListener('click', () => {
    const key = card.dataset.key;
    state.appointmentType = key;

    $$('.appt-card').forEach(c => {
      c.classList.remove('selected');
      c.setAttribute('aria-pressed', 'false');
    });
    card.classList.add('selected');
    card.setAttribute('aria-pressed', 'true');

    // Show/hide group size
    const groupGroup = $('#group-size-group');
    groupGroup.style.display = key === 'wedding-party' ? 'flex' : 'none';

    // Update banner
    const appt = APPOINTMENTS[key];
    $('#banner-title').textContent = appt.label;
    $('#banner-duration').textContent = appt.duration;

    setTimeout(() => goToStep(2), 320);
  });
});

// ── Change appointment button ──────────────────────────────────────────────
$('#change-appt-btn').addEventListener('click', () => goToStep(1));

// ── Experience slider ──────────────────────────────────────────────────────
const slider = $('#experience-slider');
const tipEl = $('#slider-tip');

function updateSlider(val) {
  state.experienceLevel = parseInt(val, 10);
  slider.setAttribute('aria-valuenow', val);
  tipEl.textContent = EXPERIENCE_TIPS[val];

  // Update slider track fill via CSS custom property
  const pct = ((val - 1) / 4) * 100;
  slider.style.background = `linear-gradient(to right, var(--navy) ${pct}%, var(--beige-dark) ${pct}%)`;
}

slider.addEventListener('input', e => updateSlider(e.target.value));
updateSlider(3); // initialise

// ── Occasion tags ──────────────────────────────────────────────────────────
$$('.tag-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    const tag = chip.dataset.tag;
    if (state.occasions.includes(tag)) {
      state.occasions = state.occasions.filter(t => t !== tag);
      chip.classList.remove('active');
    } else {
      state.occasions.push(tag);
      chip.classList.add('active');
    }
  });
});

// ── Group size ─────────────────────────────────────────────────────────────
$('#group-dec').addEventListener('click', () => {
  const input = $('#group-size');
  const val = Math.max(1, parseInt(input.value, 10) - 1);
  input.value = val;
  state.groupSize = val;
});
$('#group-inc').addEventListener('click', () => {
  const input = $('#group-size');
  const val = Math.min(20, parseInt(input.value, 10) + 1);
  input.value = val;
  state.groupSize = val;
});
$('#group-size').addEventListener('change', e => {
  state.groupSize = Math.min(20, Math.max(1, parseInt(e.target.value, 10) || 1));
  e.target.value = state.groupSize;
});

// ── Budget pills ───────────────────────────────────────────────────────────
$$('[data-budget]').forEach(btn => {
  btn.addEventListener('click', () => {
    const val = btn.dataset.budget;
    const alreadyActive = btn.classList.contains('active');
    $$('[data-budget]').forEach(b => b.classList.remove('active'));
    if (!alreadyActive) {
      btn.classList.add('active');
      state.budget = val;
    } else {
      state.budget = null;
    }
  });
});

// ── Time pills ─────────────────────────────────────────────────────────────
$$('[data-time]').forEach(btn => {
  btn.addEventListener('click', () => {
    $$('[data-time]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.timePreference = btn.dataset.time;
  });
});

// ── Date input ─────────────────────────────────────────────────────────────
const dateInput = $('#date-pref');
// Set min to today
dateInput.min = new Date().toISOString().split('T')[0];
dateInput.addEventListener('change', e => { state.datePreference = e.target.value; });

// ── Form validation ────────────────────────────────────────────────────────
function validateEmail(str) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
}

function setError(id, msg) {
  const el = $(`#${id}`);
  if (!el) return;
  el.textContent = msg;
  const input = el.previousElementSibling;
  if (input) input.classList.toggle('invalid', !!msg);
}

function clearErrors() {
  $$('.field-error').forEach(el => { el.textContent = ''; });
  $$('.invalid').forEach(el => el.classList.remove('invalid'));
}

function validateStep2() {
  clearErrors();
  let valid = true;

  const firstName = $('#first-name').value.trim();
  const lastName  = $('#last-name').value.trim();
  const email     = $('#email').value.trim();

  if (!firstName) { setError('err-first-name', 'First name is required.'); valid = false; }
  if (!lastName)  { setError('err-last-name', 'Last name is required.'); valid = false; }
  if (!email)     { setError('err-email', 'Email address is required.'); valid = false; }
  else if (!validateEmail(email)) { setError('err-email', 'Please enter a valid email address.'); valid = false; }

  if (valid) {
    state.firstName = firstName;
    state.lastName  = lastName;
    state.email     = email;
    state.phone     = $('#phone').value.trim();
    state.notes     = $('#notes').value.trim();
    state.datePreference = dateInput.value;
  }
  return valid;
}

// ── Render summary ─────────────────────────────────────────────────────────
function renderSummary() {
  const appt = APPOINTMENTS[state.appointmentType];
  $('#sum-appt-val').textContent = `${appt.label} (${appt.duration})`;

  const dateVal = state.datePreference
    ? new Date(state.datePreference + 'T12:00').toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : 'No preference';
  $('#sum-date-val').textContent = dateVal;

  $('#sum-time-val').textContent = state.timePreference ? TIME_LABELS[state.timePreference] : 'No preference';
  $('#sum-exp-val').textContent = `${state.experienceLevel} — ${EXPERIENCE_LABELS[state.experienceLevel]}`;

  const occasionsRow = $('#sum-occasions-row');
  if (state.occasions.length) {
    $('#sum-occasions-val').textContent = state.occasions.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(', ');
    occasionsRow.style.display = 'flex';
  } else {
    occasionsRow.style.display = 'none';
  }

  const budgetRow = $('#sum-budget-row');
  if (state.budget) {
    $('#sum-budget-val').textContent = BUDGET_LABELS[state.budget];
    budgetRow.style.display = 'flex';
  } else {
    budgetRow.style.display = 'none';
  }

  $('#sum-name-val').textContent = `${state.firstName} ${state.lastName}`;
  $('#sum-email-val').textContent = state.email;
}

// ── Step 2 → Step 3 ────────────────────────────────────────────────────────
$('#go-step-3').addEventListener('click', () => {
  if (validateStep2()) {
    renderSummary();
    goToStep(3);
  }
});

$('#back-to-2').addEventListener('click', () => goToStep(2));

// ── Confirm submission ─────────────────────────────────────────────────────
$('#confirm-btn').addEventListener('click', () => {
  const consentChecked = $('#consent-check').checked;
  const errConsent = $('#err-consent');

  if (!consentChecked) {
    errConsent.textContent = 'Please tick the box to continue.';
    return;
  }
  errConsent.textContent = '';

  const btn = $('#confirm-btn');
  btn.textContent = 'Sending…';
  btn.disabled = true;

  // Simulate async submission
  setTimeout(() => {
    const confirmLayout = $('.confirm-layout');
    const summaryCard = $('#summary-card');
    const confirmActions = $('.confirm-actions');
    const successState = $('#success-state');

    summaryCard.style.display = 'none';
    confirmActions.style.display = 'none';
    successState.classList.add('visible');
    successState.setAttribute('aria-hidden', 'false');
  }, 900);
});

// ── Service strip → pre-select card type ──────────────────────────────────
$$('.service-tile').forEach(tile => {
  tile.addEventListener('click', e => {
    // Already handled by href="#booking" smooth scroll; no extra pre-selection needed
    // but we can highlight the relevant card if data-type matches
    const type = tile.dataset.type;
    const keyMap = {
      'ready-to-wear': 'style-consultation',
      'custom-made': 'custom-made',
      'alterations': 'alterations',
      'styling': 'style-consultation',
    };
    const targetKey = keyMap[type];
    if (targetKey) {
      setTimeout(() => {
        const targetCard = $(`.appt-card[data-key="${targetKey}"]`);
        if (targetCard) {
          targetCard.focus();
          targetCard.style.transition = 'box-shadow .4s ease';
          targetCard.style.boxShadow = '0 0 0 3px rgba(196,162,90,.4)';
          setTimeout(() => { targetCard.style.boxShadow = ''; }, 1400);
        }
      }, 600);
    }
  });
});

// ── Set date min on load ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  dateInput.min = new Date().toISOString().split('T')[0];
});
