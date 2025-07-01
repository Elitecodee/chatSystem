// courses.js
document.addEventListener('DOMContentLoaded', () => {
  const sessionEl   = document.getElementById('session');
  const semesterEl  = document.getElementById('semester');
  const deptEl      = document.getElementById('department');
  const tbody       = document.getElementById('coursesBody');
  const nextBtn     = document.getElementById('nextBtn');
  const form        = document.getElementById('coursesForm');

  // 1) Render 12 rows
  for (let i = 1; i <= 12; i++) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${i}</td>
      <td>
        <input
          type="text"
          class="course-code"
          placeholder="e.g. CSC 101"
          maxlength="7"
          pattern="^[A-Za-z]{3}\\s?\\d{3}$"
          title="Format: ABC 123"
        >
      </td>
      <td>
        <input
          type="text"
          class="course-title"
          placeholder="(optional)"
        >
      </td>
    `;
    tbody.appendChild(tr);
  }

  // 2) Enable NEXT once ≥4 valid codes are filled
  function validateCourses() {
    const validCount = Array.from(document.querySelectorAll('.course-code'))
      .map(i => i.value.trim())
      .filter(v => /^[A-Za-z]{3}\s?\d{3}$/.test(v))
      .length;
    nextBtn.disabled = validCount < 1;
  }

  document.querySelectorAll('.course-code')
    .forEach(input => input.addEventListener('input', validateCourses));

  // 3) On form submit → POST to backend
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const courses = Array.from(document.querySelectorAll('.course-code'))
      .map(i => i.value.trim())
      .filter(v => /^[A-Za-z]{3}\s?\d{3}$/.test(v));

    const payload = {
      email:      localStorage.getItem('email'),
      session:    sessionEl.value,
      semester:   semesterEl.value,
      department: deptEl.value,
      courses
    };

    try {
      const res = await fetch('http://localhost:5000/api/courses', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload)
      });
      const data = await res.json();
    if (res.ok) {
  alert(data.message);

  // ── SAVE to localStorage for later suggestions ──
  localStorage.setItem('courses', JSON.stringify(payload.courses));

  // ── NOW redirect to the “Need Help” page ──
  window.location.href = 'academic.html';
} else {
  alert(data.message);
}

    } catch (err) {
      console.error(err);
      alert('Registering courses failed—please try again.');
    }
  });
});
