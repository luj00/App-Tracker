// Import Firebase
import { database } from './firebase-config.js';
import { ref, set, push, remove, onValue } from 'firebase/database';

// Select the goal list and form
const list = document.querySelector('#list ul');
const addForm = document.getElementById('add');
const searchInput = document.querySelector('#search input'); // ADD THIS

// Store goals data for search
let goalsData = {};

// Load goals from Firebase on page load
loadGoals();

// Add search functionality
if (searchInput) {
    searchInput.addEventListener('input', () => {
        renderListWithSearch(goalsData);
    });
}

// Add new goal on form submission
addForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const value = addForm.querySelector('input[type="text"]').value.trim(); 

    if (value !== '') {
        try {
            const goalsRef = ref(database, 'goals');
            const newGoalRef = push(goalsRef);
            
            await set(newGoalRef, {
                name: value,
                isDone: 'pending',
                note: '',
                timestamp: Date.now()
            });

            addForm.querySelector('input[type="text"]').value = '';
        } catch (error) {
            console.error('Error adding goal:', error);
            alert('Failed to add goal. Please try again.');
        }
    } else {
        alert('Please enter your goal!');
    }
});

list.addEventListener('click', async (e) => {
    const listItem = e.target.closest('li');
    if (!listItem) return;

    const goalId = listItem.dataset.id;

    if (e.target.classList.contains('delete')) {
        if (confirm('Are you sure you want to delete this goal?')) {
            try {
                const goalRef = ref(database, `goals/${goalId}`);
                await remove(goalRef);
            } catch (error) {
                console.error('Error deleting goal:', error);
                alert('Failed to delete goal. Please try again.');
            }
        }
    } else if (e.target.classList.contains('done')) {
        toggleDone(goalId, listItem);
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
list.addEventListener('input', async (e) => {
    if (e.target.className === 'note') {
        const listItem = e.target.closest('li');
        const goalId = listItem.dataset.id;
        const noteValue = e.target.value;
        
        try {
            const goalRef = ref(database, `goals/${goalId}/note`);
            await set(goalRef, noteValue);
            console.log('Note updated:', noteValue);
        } catch (error) {
            console.error('Error updating note:', error);
        }
    }
});

// Function to create a goal item
function createGoalItem(goalId, goalData) {
    const li = document.createElement('li');
    li.dataset.id = goalId;
    li.dataset.done = goalData.isDone || 'pending';

    const nameSpan = document.createElement('span');
    nameSpan.className = 'name';
    nameSpan.textContent = goalData.name;
    nameSpan.title = "Double-click to edit this title";

    const hintSpan = document.createElement('span');
    hintSpan.className = 'edit-hint';

    const deleteSpan = document.createElement('span');
    deleteSpan.className = 'delete';
    deleteSpan.textContent = 'Delete';

    const doneSpan = document.createElement('span');
    doneSpan.className = 'done';
    doneSpan.textContent = goalData.isDone === 'achieved' ? '✔️' : '⏳';
    doneSpan.style.backgroundColor = 'white';

    const noteToggleSpan = document.createElement('span');
    noteToggleSpan.className = 'note-toggle';
    noteToggleSpan.textContent = 'Add Note';

    const noteTextarea = document.createElement('textarea');
    noteTextarea.className = 'note';
    noteTextarea.placeholder = 'Add a note...';
    noteTextarea.value = goalData.note || '';
    noteTextarea.style.display = 'none';

    // If note has content, show it automatically
    if (goalData.note) {
        noteTextarea.style.display = 'block';
        noteToggleSpan.textContent = 'Hide Note';
    }

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

// Function to load goals from Firebase
function loadGoals() {
    const goalsRef = ref(database, 'goals');
    
    // Show loading message
    list.innerHTML = '<li style="text-align: center; color: #999;">Loading goals...</li>';

    // Check localStorage for cached goals
    const cachedGoals = localStorage.getItem('goals');
    if (cachedGoals) {
        try {
            const parsed = JSON.parse(cachedGoals);
            goalsData = parsed;
            // Display cached goals immediately
            renderAllGoals(goalsData);
        } catch (error) {
            console.error('Error parsing cached goals:', error);
        }
    }

    // Listen to Firebase updates
    onValue(goalsRef, (snapshot) => {
        goalsData = snapshot.val() || {};
        
        // Save to localStorage for next load
        localStorage.setItem('goals', JSON.stringify(goalsData));
        
        // If search is active, use filtered view
        if (searchInput && searchInput.value.trim()) {
            renderListWithSearch(goalsData);
        } else {
            // Otherwise show all goals
            renderAllGoals(goalsData);
        }
    }, (error) => {
        console.error('Error loading goals:', error);
        list.innerHTML = '<li style="color: red;">Error loading goals. Please refresh.</li>';
    });
}

// Function to render all goals
function renderAllGoals(goals) {
    list.innerHTML = '';
    
    if (!goals || Object.keys(goals).length === 0) {
        list.innerHTML = '<li style="text-align: center; color: #999;">No goals yet. Add your first goal!</li>';
        return;
    }

    Object.entries(goals).forEach(([goalId, goalData]) => {
        const li = createGoalItem(goalId, goalData);
        list.appendChild(li);
    });
}

// Function to render filtered list based on search
function renderListWithSearch(data) {
    const query = searchInput.value.toLowerCase().trim();
    list.innerHTML = '';

    // If no data, show a message
    if (!data || Object.keys(data).length === 0) {
        const noDataMsg = document.createElement('li');
        noDataMsg.textContent = 'No goals found.';
        noDataMsg.style.textAlign = 'center';
        noDataMsg.style.color = '#999';
        list.appendChild(noDataMsg);
        return;
    }

    let matchCount = 0;

    Object.entries(data).forEach(([id, itemData]) => {
        const name = (itemData.name || '').toLowerCase();
        const note = (itemData.note || '').toLowerCase();

        // Show all items if query is empty, otherwise filter
        if (!query || name.includes(query) || note.includes(query)) {
            const li = createGoalItem(id, itemData);
            list.appendChild(li);
            matchCount++;
        }
    });

    // Show "no results" message if no matches
    if (matchCount === 0 && query) {
        const noResults = document.createElement('li');
        noResults.textContent = `No results found for "${searchInput.value}"`;
        noResults.style.textAlign = 'center';
        noResults.style.color = '#999';
        list.appendChild(noResults);
    }
}

// Function to toggle the done state of a goal
async function toggleDone(goalId, listItem) {
    const states = ['pending', 'achieved'];
    const currentState = listItem.dataset.done;
    const nextState = states[(states.indexOf(currentState) + 1) % states.length];

    try {
        const goalRef = ref(database, `goals/${goalId}/isDone`);
        await set(goalRef, nextState);
        
        // Update UI immediately
        listItem.dataset.done = nextState;
        const doneButton = listItem.querySelector('.done');
        
        if (nextState === 'achieved') {
            doneButton.textContent = '✔️';
            doneButton.style.backgroundColor = 'white';
        } else if (nextState === 'pending') {
            doneButton.textContent = '⏳';
            doneButton.style.backgroundColor = 'white';
        }
        
        console.log('New done state:', nextState);
    } catch (error) {
        console.error('Error updating done state:', error);
        alert('Failed to update goal status. Please try again.');
    }
}

// Function to edit the goal text on double-click
function editGoalText(nameSpan) {
    const listItem = nameSpan.closest('li');
    const goalId = listItem.dataset.id;
    const currentText = nameSpan.textContent;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentText;
    input.maxLength = 65; // Add character limit

    nameSpan.replaceWith(input);
    input.focus();
    
    input.addEventListener('blur', async () => {
        const newValue = input.value.trim();
        
        if (newValue.length > 65) {
            alert('Goal title is too long! Maximum 65 characters allowed.');
            nameSpan.textContent = currentText;
            input.replaceWith(nameSpan);
            return;
        }
        
        nameSpan.textContent = newValue || currentText;
        nameSpan.className = 'name';
        input.replaceWith(nameSpan);

        if (newValue && newValue !== currentText) {
            try {
                const goalRef = ref(database, `goals/${goalId}/name`);
                await set(goalRef, newValue);
            } catch (error) {
                console.error('Error updating goal name:', error);
                alert('Failed to update goal name. Please try again.');
            }
        }
    });

    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            input.blur();
        }
    });
}