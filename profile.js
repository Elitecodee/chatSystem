// profile.js
document.addEventListener('DOMContentLoaded', () => {
  // ─── 1) Element refs ──────────────────────────────────────────────
  const nameEl     = document.getElementById('name');
  const emailEl    = document.getElementById('email');
  const levelEl    = document.getElementById('level');
  const genderEl   = document.getElementById('gender');
  const picEl      = document.getElementById('profilePic');
  const shuffleBtn = document.getElementById('shuffleBtn');
  const countEl    = document.getElementById('shuffleCount');
  const form       = document.getElementById('profileForm');
  const nextBtn    = document.getElementById('nextBtn');

  // Pre-fill name & email from localStorage
  nameEl.value  = localStorage.getItem('name')  || '';
  emailEl.value = localStorage.getItem('email') || '';

  // ─── 2) NEXT button toggler ──────────────────────────────────────
  function isMatricValid() {
    return /^\d{9}$/.test(document.getElementById('matric').value.trim());
  }
  function isPhoneValid() {
    return /^\d{11}$/.test(document.getElementById('phone').value.trim());
  }

  function updateNextButtonState() {
    const allValid =
      nameEl.value.trim()     !== '' &&
      emailEl.value.trim()    !== '' &&
      levelEl.value           !== '' &&
      genderEl.value          !== '' &&
      isMatricValid()         &&
      isPhoneValid();

    nextBtn.disabled = !allValid;
  }

  // watch *all* inputs/selections that affect NEXT
  [
    nameEl, emailEl,
    levelEl, genderEl,
    document.getElementById('matric'),
    document.getElementById('phone')
  ].forEach(el => el.addEventListener('input', updateNextButtonState));

  // run once on load
  updateNextButtonState();


  // ─── 3) Avatar & shuffle logic (unchanged) ────────────────────────
  const maleAvatars   = ['male1.png','male2.png','male3.png','male4.png','male5.png','male6.png','male7.png','male8.png','male9.png','male10.png'];
  const femaleAvatars = ['female1.png','female2.png','female3.png','female4.png','female5.png','female6','female7.png','female8.png','female9.png'];
  let currentPool  = [];
  let shuffleCount = 0;
  const MAX_SHUFFLES = 3;

  function pickRandomAvatar() {
    const choice = currentPool[Math.floor(Math.random() * currentPool.length)];
    picEl.style.backgroundImage = `url('avatars/${choice}')`;
  }

  function updateShuffleCount() {
    countEl.textContent = `${MAX_SHUFFLES - shuffleCount} reshuffles left`;
  }

  genderEl.addEventListener('change', () => {
    if (!genderEl.value) return;
    currentPool   = genderEl.value === 'Male' ? maleAvatars : femaleAvatars;
    shuffleCount  = 0;
    shuffleBtn.disabled = false;
    picEl.classList.add('enabled');
    pickRandomAvatar();
    updateShuffleCount();
    updateNextButtonState();  // in case NEXT was waiting on gender
  });

  shuffleBtn.addEventListener('click', () => {
    if (shuffleCount >= MAX_SHUFFLES) {
      alert(`You've used all ${MAX_SHUFFLES} reshuffles.`);
      shuffleBtn.disabled = true;
      return;
    }
    shuffleCount++;
    pickRandomAvatar();
    updateShuffleCount();
    if (shuffleCount >= MAX_SHUFFLES) shuffleBtn.disabled = true;
  });


  // ─── 4) Final submit to backend ────────────────────────────────────
  form.addEventListener('submit', async e => {
    e.preventDefault();

    // no need to re-validate here; NEXT was only enabled if all good
    const matric = document.getElementById('matric').value.trim();
    const phone  = document.getElementById('phone').value.trim();

    const payload = {
      email:   emailEl.value,
      level:   +levelEl.value,
      gender:  genderEl.value,
      matric,
      phone,
      avatar: picEl.style.backgroundImage.slice(5, -2)
    };

    try {
      const res  = await fetch('http://localhost:5000/api/profile', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok) {
        alert(data.message);
        window.location.href = 'courses.html';
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert('Saving profile failed—please try again.');
    }
  });
});
