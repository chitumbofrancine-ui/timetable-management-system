const API_URL = 'http://localhost:3000/api/timetable';
const form = document.getElementById('timetableForm');
const statusBox = document.getElementById('status');
const tbody = document.getElementById('timetableList');
const fieldIds = ['course_code', 'course_name', 'lecturer_name', 'venue', 'day_of_week', 'start_time', 'end_time'];

function showStatus(message, isError = false) {
  statusBox.textContent = message;
  statusBox.style.color = isError ? '#b42318' : '#18794e';
}

function formatTime(value) {
  // MySQL TIME values may include seconds; HTML time inputs use HH:MM.
  return String(value || '').slice(0, 5);
}

async function request(url, options = {}) {
  const response = await fetch(url, options);
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || body.error || `Request failed (${response.status})`);
  return body;
}

async function loadTimetables() {
  try {
    const data = await request(API_URL);
    tbody.replaceChildren();

    data.forEach((row) => {
      const tr = document.createElement('tr');
      const values = [
        row.id, row.course_code, row.course_name, row.lecturer_name,
        row.venue, row.day_of_week,
        `${formatTime(row.start_time)} - ${formatTime(row.end_time)}`
      ];
      values.forEach((value) => {
        const td = document.createElement('td');
        td.textContent = value ?? '';
        tr.appendChild(td);
      });

      const actions = document.createElement('td');
      const editButton = document.createElement('button');
      editButton.className = 'edit';
      editButton.textContent = 'Edit';
      editButton.addEventListener('click', () => editRecord(row.id));

      const deleteButton = document.createElement('button');
      deleteButton.className = 'delete';
      deleteButton.textContent = 'Delete';
      deleteButton.addEventListener('click', () => deleteRecord(row.id));

      actions.append(editButton, deleteButton);
      tr.appendChild(actions);
      tbody.appendChild(tr);
    });

    if (!data.length) showStatus('No timetable records found.');
    else showStatus(`Loaded ${data.length} timetable record(s).`);
  } catch (error) {
    showStatus(`${error.message}. Check that MySQL and the backend server are running.`, true);
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const id = document.getElementById('id').value;
  const payload = {};
  fieldIds.forEach((field) => {
    payload[field] = document.getElementById(field).value.trim();
  });

  if (payload.end_time <= payload.start_time) {
    showStatus('End time must be later than start time.', true);
    return;
  }

  try {
    await request(id ? `${API_URL}/${id}` : API_URL, {
      method: id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    resetForm();
    await loadTimetables();
    showStatus(id ? 'Timetable record updated.' : 'Timetable record created.');
  } catch (error) {
    showStatus(error.message, true);
  }
});

async function editRecord(id) {
  try {
    const row = await request(`${API_URL}/${id}`);
    document.getElementById('id').value = row.id;
    fieldIds.forEach((field) => {
      const input = document.getElementById(field);
      input.value = field.includes('time') ? formatTime(row[field]) : (row[field] ?? '');
    });
    document.getElementById('submitBtn').textContent = 'Update Record';
    showStatus(`Editing record ${id}.`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (error) {
    showStatus(error.message, true);
  }
}

async function deleteRecord(id) {
  if (!window.confirm('Are you sure you want to delete this timetable record?')) return;
  try {
    await request(`${API_URL}/${id}`, { method: 'DELETE' });
    await loadTimetables();
    showStatus(`Record ${id} deleted successfully.`);
  } catch (error) {
    showStatus(error.message, true);
  }
}

function resetForm() {
  form.reset();
  document.getElementById('id').value = '';
  document.getElementById('submitBtn').textContent = 'Create Record';
}

document.getElementById('cancelBtn').addEventListener('click', () => {
  resetForm();
  showStatus('Form cleared.');
});

loadTimetables();
