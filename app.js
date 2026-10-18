const API_URL = 'https://timetable-management-system-fh7.onrender.com/api/timetable';

const form = document.getElementById('timetableForm');
const statusBox = document.getElementById('status');
const tbody = document.getElementById('timetableList');

function showStatus(message, isError = false) {
  statusBox.textContent = message;
  statusBox.style.color = isError ? '#b42318' : '#18794e';
}

function formatTime(value) {
  return String(value || '').slice(0, 5);
}

async function request(url, options = {}) {
  const response = await fetch(url, options);
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const detail = body.detail || body.message || body.error;
    throw new Error(
      typeof detail === 'string' ? detail : Request failed (${response.status})
    );
  }

  return body;
}

async function loadTimetables() {
  try {
    const data = await request(API_URL);
    tbody.replaceChildren();

    data.forEach((row) => {
      const tr = document.createElement('tr');

      const values = [
        row.id,
        row.course_code || '',
        row.course_name,
        row.lecturer,
        row.room,
        row.day,
        ${formatTime(row.start_time)} - ${formatTime(row.end_time)}
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
      editButton.addEventListener('click', () => editRecord(row));

      const deleteButton = document.createElement('button');
      deleteButton.className = 'delete';
      deleteButton.textContent = 'Delete';
      deleteButton.addEventListener('click', () => deleteRecord(row.id));

      actions.append(editButton, deleteButton);
      tr.appendChild(actions);
      tbody.appendChild(tr);
    });

    if (data.length === 0) {
      showStatus('No timetable records found. Add your first record.');
    } else {
      showStatus(Loaded ${data.length} timetable record(s).);
    }
  } catch (error) {
    showStatus(Could not load timetable: ${error.message}, true);
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const id = document.getElementById('id').value;

  const courseCode = document.getElementById('course_code').value.trim();

  const payload = {
    course_name: document.getElementById('course_name').value.trim(),
    lecturer: document.getElementById('lecturer_name').value.trim(),
    room: document.getElementById('venue').value.trim(),
    day: document.getElementById('day_of_week').value,
    start_time: document.getElementById('start_time').value,
    end_time: document.getElementById('end_time').value
  };

  if (payload.end_time <= payload.start_time) {
    showStatus('End time must be later than start time.', true);
    return;
  }

  try {
    await request(id ? ${API_URL}/${id} : API_URL, {
      method: id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    resetForm();
    await loadTimetables();

    showStatus(
      id ? 'Timetable record updated.' : 'Timetable record created.'
    );

    if (courseCode) {
      console.info('Course code entered:', courseCode);
    }
  } catch (error) {
    showStatus(Could not save record: ${error.message}, true);
  }
});

function editRecord(row) {
  document.getElementById('id').value = row.id;
  document.getElementById('course_code').value = row.course_code || '';
  document.getElementById('course_name').value = row.course_name || '';
  document.getElementById('lecturer_name').value = row.lecturer || '';
  document.getElementById('venue').value = row.room || '';
  document.getElementById('day_of_week').value = row.day || 'Monday';
  document.getElementById('start_time').value = formatTime(row.start_time);
  document.getElementById('end_time').value = formatTime(row.end_time);

  document.getElementById('submitBtn').textContent = 'Update Record';

  showStatus(Editing record ${row.id}.);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function deleteRecord(id) {
  if (!window.confirm('Are you sure you want to delete this timetable record?')) {
    return;
  }

  try {
    await request(${API_URL}/${id}, { method: 'DELETE' });
    await loadTimetables();
    showStatus(Record ${id} deleted successfully.);
  } catch (error) {
    showStatus(Could not delete record: ${error.message}, true);
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
