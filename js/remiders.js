// Select the list and form
const list = document.querySelector('#list ul');
const addForm = document.getElementById('add');

// Load reminders from local storage on page load
loadReminders();

// Add new reminder on form submission
addForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const value = addForm.querySelector('input[type="text"]').value.trim();

    if (value!== '') {
        // Create a new list item
        const li = createReminderItem(value);
        list.appendChild(li);

        // Save reminders to local storage
        saveReminders();

        // Clear the input field
        addForm.querySelector('input[type="text"]').value = '';
    } else {
        alert('Please enter your reminder!');
    }
});

// Event listener for handling all interactions with the list
list.addEventListener('click', (e) => {
    const li = e.target.closest('li');
    if (!li) return;

    // Delete button functionality
    if (e.target.className === 'delete') {
        if (confirm('Are you sure you want to delete this reminder?')) {
            li.remove();
            saveReminders();
        }
    }

    // Done button functionality

    if (e.target.className === 'done') {
        toggleDone(e.target);
    }

    // Note toggle functionality
    if (e.target.className === 'note-toggle') {
        toggleNoteVisibility(li, e.target);
    }
});

// Double-click event listener for editing the reminder text
list.addEventListener('dblclick', (e) => {
    if (e.target.className === 'name') {
        editReminderText(e.target);
    }
});

// Event listener for tracking changes in the note textarea
list.addEventListener('input', (e) => {
    if (e.target.className === 'note') {
        saveReminders();
    }
});

// Function to create a reminder item
function createReminderItem(value) {
    const li = document.createElement('li');
    li.dataset.done = '✖️'; // Default state

    // Create the name span with a tooltip and add a hint for editing
    const nameSpan = document.createElement('span');
    nameSpan.className = 'name';
    nameSpan.textContent = value;
    nameSpan.title = "Double-click to edit this title"; // Tooltip for user instruction

    // Add a hint below the goal name
    const hintSpan = document.createElement('span');
    hintSpan.className = 'edit-hint';
    hintSpan.textContent = '  (Double-click to edit title)';

    // Append the hintSpan to the li
    li.appendChild(nameSpan);
    li.appendChild(hintSpan); // Ensure the hint is added

    // Delete button
    const deleteSpan = document.createElement('span');
    deleteSpan.className = 'delete';
    deleteSpan.textContent = 'Delete';

    // Done button
    const doneSpan = document.createElement('span');
    doneSpan.className = 'done';
    doneSpan.textContent = '✖️';
    doneSpan.style.backgroundColor = 'white';

    // Note toggle button
    const noteToggleSpan = document.createElement('span');
    noteToggleSpan.className = 'note-toggle';
    noteToggleSpan.textContent = 'Add Note';

    // Note textarea
    const noteTextarea = document.createElement('textarea');
    noteTextarea.className = 'note';
    noteTextarea.placeholder = 'Add a note...';
    noteTextarea.style.display = 'none';

    // Append elements to the list item
    li.appendChild(deleteSpan);
    li.appendChild(doneSpan);
    li.appendChild(noteToggleSpan);
    li.appendChild(noteTextarea);

    return li;
}

// Toggle note visibility
function toggleNoteVisibility(li, noteToggle) {
    const noteTextarea = li.querySelector('.note');
    if (noteTextarea.style.display === 'none') {
        noteTextarea.style.display = 'block';
        noteToggle.textContent = 'Hide Note';
    } else {
        noteTextarea.style.display = 'none';
        noteToggle.textContent = 'Add Note';
    }
}

// Function to save reminders to local storage
function saveReminders() {
    const reminders = [];
    list.querySelectorAll('li').forEach(li => {
        const name = li.querySelector('.name').textContent;
        const isDone = li.dataset.done; // Get the current state ("done" or "Not done")
        const noteTextarea = li.querySelector('.note');
        const note = noteTextarea ? noteTextarea.value : '';

        reminders.push({ name, isDone, note });
    });

    console.log('Saving reminders to local storage:', reminders);
    localStorage.setItem('reminders', JSON.stringify(reminders));
}

// Function to load reminders from local storage
function loadReminders() {
    const storedReminders = localStorage.getItem('reminders');
    if (!storedReminders) {
        console.log('No reminders found in local storage.');
        return;
    }

    const reminders = JSON.parse(storedReminders);
    console.log('Loading reminders from local storage:', reminders); // Debug log

    reminders.forEach(reminder => {
        const li = createReminderItem(reminder.name);
        const doneButton = li.querySelector('.done');

        // Set the initial state based on stored data
        if (reminder.isDone === '✔️') {
            doneButton.textContent = '✔️';
            doneButton.style.backgroundColor = 'white';
            doneButton.style.color = 'white';
            li.dataset.done = '✔️';
        } else if (reminder.isDone === '✖️') {
            doneButton.textContent = '✖️';
            doneButton.style.backgroundColor = 'white';
            doneButton.style.color = 'white';
            li.dataset.done = '✖️';
        }

        const noteTextarea = li.querySelector('.note');
        if (noteTextarea) {
            noteTextarea.value = reminder.note;
        }

        list.appendChild(li);
    });
}

// Function to toggle the done state of a reminder
function toggleDone(doneButton) {
    const li = doneButton.closest('li');
    const currentState = li.dataset.done;
    const nextState = currentState === '✔️' ? '✖️' : '✔️';

    // Update the button text and style based on the new state
    if (nextState === '✔️') {
        doneButton.textContent = '✔️';
        doneButton.style.backgroundColor = 'white';
        doneButton.style.color = 'white';
    } else if (nextState === '✖️') {
        doneButton.textContent = '✖️';
        doneButton.style.backgroundColor = 'white';
        doneButton.style.color = 'white';
    }

    li.dataset.done = nextState; // Set the new state
    saveReminders(); // Ensure the updated state is saved
}

// Edit reminder text
function editReminderText(nameSpan) {
    const currentText = nameSpan.textContent;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentText;

    nameSpan.replaceWith(input);
    input.focus();

    input.addEventListener('blur', () => {
        const newValue = input.value.trim();
        nameSpan.textContent = newValue || currentText; // Retain old value if input is empty
        input.replaceWith(nameSpan);
        saveReminders();
    });

    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') input.blur();
    });
}
