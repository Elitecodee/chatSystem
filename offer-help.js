document.addEventListener('DOMContentLoaded', () => {
  const tbody        = document.getElementById('offerBody');
  const saveBtn      = document.getElementById('saveOfferBtn');
  const nextBtn      = document.getElementById('nextOfferBtn');
  const registered   = JSON.parse(localStorage.getItem('courses') || '[]');
  let offerCourses   = [];   // codes checked
  let proficiencies  = {};   // map code → level

  // Build rows
  registered.forEach((code, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${idx + 1}</td>
      <td>${code}</td>
      <td style="text-align:center">
        <input type="checkbox" class="offer-check"/>
      </td>
      <td style="text-align:center">
        <label><input type="radio" name="prof${idx}" value="base" disabled> Base</label>
        <label><input type="radio" name="prof${idx}" value="intermediate" disabled> Intermediate</label>
        <label><input type="radio" name="prof${idx}" value="advanced" disabled> Advanced</label>
      </td>
    `;
    tbody.appendChild(tr);
  });

  const rows       = Array.from(tbody.querySelectorAll('tr'));
  const checkboxes = tbody.querySelectorAll('.offer-check');

  // Enable radios when checkbox checked
  checkboxes.forEach((cb, idx) => {
    const radios = rows[idx].querySelectorAll('input[type="radio"]');
    cb.addEventListener('change', () => {
      if (cb.checked) {
        offerCourses.push(registered[idx]);
        radios.forEach(r => r.disabled = false);
      } else {
        // uncheck & disable radios
        offerCourses = offerCourses.filter(c => c !== registered[idx]);
        radios.forEach(r => { r.disabled = true; r.checked = false; });
        delete proficiencies[registered[idx]];
      }
      updateButtons();
    });

    // Listen to proficiency changes
    radios.forEach(radio => {
      radio.addEventListener('change', e => {
        proficiencies[registered[idx]] = e.target.value;
        updateButtons();
      });
    });
  });

  // Toggle Save: need ≥1 checked AND each checked has a prof set
  function updateButtons() {
    const allProfsSet = offerCourses.every(code => proficiencies[code]);
    saveBtn.disabled = !(offerCourses.length > 0 && allProfsSet);
    nextBtn.disabled = true; // lock Next until Save
  }

  // Save to backend
  saveBtn.addEventListener('click', async () => {
    try {
      const payload = {
        email: localStorage.getItem('email'),
        offerCourses: offerCourses.map(code => ({
          code,
          level: proficiencies[code]
        }))
      };
      const res = await fetch('http://localhost:5000/api/offer-courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        saveBtn.textContent = 'Saved ✓';
        saveBtn.disabled   = true;
        nextBtn.disabled   = false;
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save—please try again.');
    }
  });

  // Next → homepage
  nextBtn.addEventListener('click', () => {
    location.href = 'dashboard.html';
  });
});
