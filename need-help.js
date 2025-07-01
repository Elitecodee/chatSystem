// need-help.js
document.addEventListener('DOMContentLoaded', () => {
  const tbody    = document.getElementById('helpBody');
  const saveBtn  = document.getElementById('saveBtn');
  const nextBtn  = document.getElementById('nextBtn');

  // 1) Get the previously-registered codes
  const registered = JSON.parse(localStorage.getItem('courses') || '[]');

  // 2) Build the table rows
  for (let i = 0; i < 12; i++) {
    const code = registered[i] || ''; 
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td>${code}</td>
      <td>
        <input type="checkbox" class="help-check" ${!code ? 'disabled' : ''}/>
      </td>
    `;
    tbody.appendChild(tr);
  }

  const checkboxes = Array.from(document.querySelectorAll('.help-check'));

  // 3) Enable Save when ≥1 box checked
  function updateSaveState() {
    const anyChecked = checkboxes.some(cb => cb.checked);
    saveBtn.disabled = !anyChecked;
    nextBtn.disabled = true; // lock Next until Save
  }
  checkboxes.forEach(cb => 
    cb.addEventListener('change', updateSaveState)
  );

  // 4) On Save: collect checked codes, send to backend
  saveBtn.addEventListener('click', async () => {
    const helpCourses = checkboxes
      .map((cb, idx) => cb.checked ? registered[idx] : null)
      .filter(v => v);

    try {
      const res = await fetch('http://localhost:5000/api/help-courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: localStorage.getItem('email'),
          helpCourses
        })
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

  // 5) Next → homepage
  nextBtn.addEventListener('click', () => {
    location.href = 'dashboard.html';
  });
});
