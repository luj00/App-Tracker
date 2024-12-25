// Select the goal list and form
const list = document.querySelector('#list ul');
const addForm = document.getElementById('add');

// Load goals from local storage on page load
loadGoals();

// Add new goal on form submission
addForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const value = addForm.querySelector('input[type="text"]').value.trim(); 

    if (value !== '') {
        // Create a new list item
        const li = createGoalItem(value);
        list.appendChild(li);

        // Save goals to local storage
        saveGoals();

        // Clear the input field
        addForm.querySelector('input[type="text"]').value = '';
    } else {
        alert('Please enter your goal!');
    }
});

list.addEventListener('click', (e) => {
    // Find the <li> container for the cicked listItem
    const listItem = e.target.closest('li');
    if (!listItem) return; // Exit if the clicked listItem is not inside an <li>

    // Check if the clicked element is a button or has a class that we care about
    if (e.target.classList.contains('delete')) {
        if (confirm('Are you sure you want to delete this goal?')) {
            listItem.remove();
            saveGoals(); // Update local storage
        }
    } else if (e.target.classList.contains('done')) {
        toggleDone(e.target);
    } else if (e.target.classList.contains('note-toggle')) {
        toggleNoteVisibility(listItem, e.target);
    }
});

// Double-click event listener for editing the goal text
list.addEventListener('dblclick', (e) => {
    if (e.target.classList.contains('name')) {
        editGoalText(e.target);
    }
});

// Event listener for tracking changes in the note textarea
list.addEventListener('input', (e) => {
    if (e.target.className === 'note') {
        console.log('Note updated:', e.target.value); // Debug log
        saveGoals(); // Save updated note value to local storage
    }
});

// Function to create a goal item
function createGoalItem(value) {
    const li = document.createElement('li');
    li.dataset.done = 'pending'; // Initialize the done state as "pending"

    // Create the name span with a tooltip and add a hint for editing
    const nameSpan = document.createElement('span');
    nameSpan.className = 'name';
    nameSpan.textContent = value;
    nameSpan.title = "Double-click to edit this title"; // Tooltip for user instruction

    // Add a hint below the goal name
    const hintSpan = document.createElement('span');
    hintSpan.className = 'edit-hint';
    hintSpan.textContent = '    (Double-click to edit title)';

    // Create the delete button
    const deleteSpan = document.createElement('span');
    deleteSpan.className = 'delete';
    deleteSpan.textContent = 'Delete';

    // Create the done button (Initially set to ⏳)
    const doneSpan = document.createElement('span');
    doneSpan.className = 'done'; // This will be updated to symbols (✔️, ⏳)
    doneSpan.textContent = '⏳';
    doneSpan.style.backgroundColor = 'white';

    // Create the note toggle button
    const noteToggleSpan = document.createElement('span');
    noteToggleSpan.className = 'note-toggle';
    noteToggleSpan.textContent = 'Add Note';

    // Create the note textarea
    const noteTextarea = document.createElement('textarea');
    noteTextarea.className = 'note';
    noteTextarea.placeholder = 'Add a note...';
    noteTextarea.style.display = 'none'; // Initially hidden

    // Append elements to the list item
    li.appendChild(nameSpan);
    li.appendChild(hintSpan);
    li.appendChild(deleteSpan);
    li.appendChild(doneSpan);
    li.appendChild(noteToggleSpan);
    li.appendChild(noteTextarea);

    return li;
}


// Function to toggle the visibility of the note textarea
function toggleNoteVisibility(li, noteToggle) {
    const noteTextarea = li.querySelector('.note');
    if (noteTextarea.style.display === 'none' || noteTextarea.style.display === '') {
        noteTextarea.style.display = 'block';
        noteToggle.textContent = 'Hide Note';
    } else {
        noteTextarea.style.display = 'none';
        noteToggle.textContent = 'Add Note';
    }
}

// Function to save goals to local storage
function saveGoals() {
    const goals = [];
    list.querySelectorAll('li').forEach(li => {
        const name = li.querySelector('.name').textContent;
        const isDone = li.dataset.done; // Get the current state ("achieved", "unachieved", or "pending")

        // Always save the note value, even if the note is hidden
        const noteTextarea = li.querySelector('.note');
        const note = noteTextarea ? noteTextarea.value : '';

        goals.push({ name, isDone, note });
    });

    console.log('Saving goals to local storage:', goals);
    localStorage.setItem('goals', JSON.stringify(goals));
}

// Function to load goals from local storage
function loadGoals() {
    const storedGoals = localStorage.getItem('goals');
    const goals = storedGoals ? JSON.parse(storedGoals) : []; // Defaults to an empty array if null or invalid

    if (goals.length === 0) {
        console.log('No goals to load. The array is empty.');
        return; // Exit the function if there are no goals to process
    }

    console.log('Loading goals from local storage:', goals);

    goals.forEach(goal => {
        const li = createGoalItem(goal.name);
        const doneSpan = li.querySelector('.done');

        // Set the initial state based on stored data
        if (goal.isDone === 'achieved') {
            doneSpan.textContent = '✔️';
            doneSpan.style.backgroundColor = 'white';
            li.dataset.done = 'achieved'; // Set the done state
        } else if (goal.isDone === 'pending') {
            doneSpan.textContent = '⏳';
            doneSpan.style.backgroundColor = 'white';
            li.dataset.done = 'pending'; // Set as pending
        }

        // Set note value if it exists
        const noteTextarea = li.querySelector('.note');
        if (noteTextarea) {
            noteTextarea.value = goal.note; // Set the note value if present
            console.log('Loaded note value:', goal.note); // Debug log to verify note loading
        }

        list.appendChild(li);
    });
}


// Function to toggle the done state of a goal
function toggleDone(doneButton) {
    const li = doneButton.closest('li');
    const states = ['pending', 'achieved'];  // Only two states now: pending and achieved
    const currentState = li.dataset.done;
    const nextState = states[(states.indexOf(currentState) + 1) % states.length];

    // Update the button text and style based on the new state
    if (nextState === 'achieved') {
        doneButton.textContent = '✔️'; // Checkmark symbol for achieved
        doneButton.style.backgroundColor = 'white'; // Green for achieved
    } else if (nextState === 'pending') {
        doneButton.textContent = '⏳'; // Hourglass symbol for pending
        doneButton.style.backgroundColor = 'white'; // Red for pending
    }

    li.dataset.done = nextState; // Set the new state
    console.log('New done state:', nextState);
    saveGoals(); // Ensure the updated state is saved
}


// Function to edit the goal text on double-click
function editGoalText(nameSpan) {
    const currentText = nameSpan.textContent;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentText;

    // Replace the name span with an input for editing
    nameSpan.replaceWith(input);

    // Focus the input and set up event to save changes
    input.focus();
    input.addEventListener('blur', () => {
        nameSpan.textContent = input.value;
        nameSpan.className = 'name'; // Ensure class is set correctly
        input.replaceWith(nameSpan);

        // Save changes to local storage
        saveGoals();
    });

    // Save changes on pressing Enter
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            input.blur();
        }
    });
}
