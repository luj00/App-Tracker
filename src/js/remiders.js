// Import Firebase
import { database } from './firebase-config.js';
import { ref, set, get, push, remove, onValue } from 'firebase/database';

// Select the list and form
const list = document.querySelector('#list ul');
const addForm = document.getElementById('add');

// Load reminders from Firebase on page load
loadReminders();

// Add new reminder on form submission
addForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const value = addForm.querySelector('input[type="text"]').value.trim();

    if (value !== '') {
        try {
            // Create a new reminder in Firebase
            const remindersRef = ref(database, 'reminders');
            const newReminderRef = push(remindersRef);
            
            await set(newReminderRef, {
                name: value,
                isDone: '✖️',
                note: '',
                timestamp: Date.now()
            });

            // Clear the input field
            addForm.querySelector('input[type="text"]').value = '';
        } catch (error) {
            console.error('Error adding reminder:', error);
            alert('Failed to add reminder. Please try again.');
        }
    } else {
        alert('Please enter your reminder!');
    }
});

// Event listener for handling all interactions with the list
list.addEventListener('click', async (e) => {
    const li = e.target.closest('li');
    if (!li) return;

    const reminderId = li.dataset.id;

    // Delete button functionality
    if (e.target.className === 'delete') {
        if (confirm('Are you sure you want to delete this reminder?')) {
            try {
                const reminderRef = ref(database, `reminders/${reminderId}`);
                await remove(reminderRef);
            } catch (error) {
                console.error('Error deleting reminder:', error);
                alert('Failed to delete reminder. Please try again.');
            }
        }
    }

    // Done button functionality
    if (e.target.className === 'done') {
        toggleDone(reminderId, li);
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
list.addEventListener('input', async (e) => {
    if (e.target.className === 'note') {
        const listItem = e.target.closest('li');
        const reminderId = listItem.dataset.id;
        const noteValue = e.target.value;
        
        try {
            const reminderRef = ref(database, `reminders/${reminderId}/note`);
            await set(reminderRef, noteValue);
            console.log('Note updated:', noteValue);
        } catch (error) {
            console.error('Error updating note:', error);
        }
    }
});

// Function to create a reminder item
function createReminderItem(reminderId, reminderData) {
    const li = document.createElement('li');
    li.dataset.id = reminderId;
    li.dataset.done = reminderData.isDone || '✖️';

    const nameSpan = document.createElement('span');
    nameSpan.className = 'name';
    nameSpan.textContent = reminderData.name;
    nameSpan.title = "Double-click to edit this title";

    const hintSpan = document.createElement('span');
    hintSpan.className = 'edit-hint';
    hintSpan.textContent = '  (Double-click to edit title)';

    li.appendChild(nameSpan);
    li.appendChild(hintSpan);

    // Delete button
    const deleteSpan = document.createElement('span');
    deleteSpan.className = 'delete';
    deleteSpan.textContent = 'Delete';

    // Done button
    const doneSpan = document.createElement('span');
    doneSpan.className = 'done';
    doneSpan.textContent = reminderData.isDone || '✖️';
    doneSpan.style.backgroundColor = 'white';

    // Note toggle button
    const noteToggleSpan = document.createElement('span');
    noteToggleSpan.className = 'note-toggle';
    noteToggleSpan.textContent = 'Add Note';

    // Note textarea
    const noteTextarea = document.createElement('textarea');
    noteTextarea.className = 'note';
    noteTextarea.placeholder = 'Add a note...';
    noteTextarea.value = reminderData.note || '';
    noteTextarea.style.display = 'none';

    // If note has content, show it automatically
    if (reminderData.note) {
        noteTextarea.style.display = 'block';
        noteToggleSpan.textContent = 'Hide Note';
    }

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

// Function to load reminders from Firebase
function loadReminders() {
    const remindersRef = ref(database, 'reminders');
    
    onValue(remindersRef, (snapshot) => {
        // Clear the list
        list.innerHTML = '';
        
        const reminders = snapshot.val();
        if (!reminders) {
            console.log('No reminders to load.');
            return;
        }

        console.log('Loading reminders from Firebase:', reminders);

        // Convert object to array and create list items
        Object.entries(reminders).forEach(([reminderId, reminderData]) => {
            const li = createReminderItem(reminderId, reminderData);
            list.appendChild(li);
        });
    }, (error) => {
        console.error('Error loading reminders:', error);
    });
}

// Function to toggle the done state of a reminder
async function toggleDone(reminderId, li) {
    const currentState = li.dataset.done;
    const nextState = currentState === '✔️' ? '✖️' : '✔️';

    try {
        const reminderRef = ref(database, `reminders/${reminderId}/isDone`);
        await set(reminderRef, nextState);
        
        // Update UI immediately
        li.dataset.done = nextState;
        const doneButton = li.querySelector('.done');
        
        doneButton.textContent = nextState;
        doneButton.style.backgroundColor = 'white';
        doneButton.style.color = 'white';
        
        console.log('New done state:', nextState);
    } catch (error) {
        console.error('Error updating done state:', error);
        alert('Failed to update reminder status. Please try again.');
    }
}

// Edit reminder text
function editReminderText(nameSpan) {
    const listItem = nameSpan.closest('li');
    const reminderId = listItem.dataset.id;
    const currentText = nameSpan.textContent;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentText;

    nameSpan.replaceWith(input);
    input.focus();

    input.addEventListener('blur', async () => {
        const newValue = input.value.trim();
        nameSpan.textContent = newValue || currentText;
        input.replaceWith(nameSpan);

        if (newValue && newValue !== currentText) {
            try {
                const reminderRef = ref(database, `reminders/${reminderId}/name`);
                await set(reminderRef, newValue);
            } catch (error) {
                console.error('Error updating reminder name:', error);
                alert('Failed to update reminder name. Please try again.');
            }
        }
    });

    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') input.blur();
    });
}