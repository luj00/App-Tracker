// Access next sibling element
const sibling = bookList.nextElementSibling;

if (sibling) {
    // Select the <script> tag within the sibling
    const scriptTag = sibling.querySelector('bookList');
    
    if (scriptTag) {
        scriptTag.innerHTML += '<br/>hello'; // Append content to the script tag
    } else {
        console.log("No script tag found in the next sibling.");
    }
} else {
    console.log("No next sibling element exists.");
}
// prevent default behaviour

/*const link = document.querySelector('#page-banner a');

link.addEventListener('click', function(e){
  e.preventDefault();
  console.log('Navigation to', e.target.textContent, 'was prevented');
});*/

// Select important elements
const wrapper = document.querySelector('#wrapper');
const ul = document.querySelector('#book-list ul');

/*const grandparent = document.createElement('div');
grandparent.className = 'grandparent';

const parent = document.createElement('div'); // Creating the element
parent.className = 'parent';

const child = document.createElement('div');
child.className = 'child';

// Nest the elements
parent.appendChild(child);
grandparent.appendChild(parent);
document.body.appendChild(grandparent);

// Query the DOM for event listeners
const grand = document.querySelector('.grandparent');
const parentElement = document.querySelector('.parent'); // Renamed to parentElement
const childElement = document.querySelector('.child');

/*grand.addEventListener('click', (e) => {
    console.log("grandParent");
});

parentElement.addEventListener('click', (e) => {

    console.log("Parent");
});

childElement.addEventListener('click', printLuna
);
function printLuna(){
    console.log('Luna')
}
setTimeout(()=>{
    childElement.removeEventListener('click', printLuna
);
},5000
)*/
/*document.addEventListener('click',(e)=>{
    let current=e.target
    while(current&&current.matches('div')){
        console.log('hi')
    current=current.parentElement
}})
  
function AddEventListener(type,selector,callback){
    document.addEventListener(type,e=>{
        if(e.target.matches(selector)){
            callback(e)
        }
    })
}
AddEventListener('click','div',(e)=>{
    console.log('hi')
})

const divs=document.querySelector('body')
divs.addEventListener('click',e=>{
    if(e.target.matches('div')){
        console.log('hi')
    }
}

)*/
/*const newArr=document.querySelectorAll('#book-list li .name')

const after=Array.from(newArr)

const bookNames=after.map(el=>el.innerText)

after.forEach(el=>el.innerHTML+='BOOKS and mORE')

console.log(bookNames)

console.log(after)

//const bookList=document.querySelector('#book-list')

//bookList.innerHTML+='<h2>BOOKS and mORE</h2>'


/*const ClonedbookList=bookList.cloneNode(true)
console.log(ClonedbookList)
document.body.appendChild(ClonedbookList)

const sibling=bookList.nextElementSibling

if(sibling){
    const scrpitTag=sibling.querySelector('script')
    if(scrpitTag){
        scrpitTag.innerHTML='<br>hi'
    }else{
        console.log('no')
    }
}else{
    console.log('no')
}*/
// Import the createNavbar function from navbar.js
/*import { createNavbar } from './navBar';

// Wait for the DOM to fully load
document.addEventListener('DOMContentLoaded', () => {
  // Create and append the navigation bar
  const header = document.querySelector('header');
  const nav = createNavbar();
  header.insertBefore(nav, header.firstChild);*/



  here // Select the book list and form
const list = document.querySelector('#book-list ul');
const addForm = document.forms['add-book'];

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
        alert('Please enter a valid goal!');
    }
});

// Event listener for handling all interactions with the list
list.addEventListener('click', (e) => {
    const li = e.target.closest('li');
    if (!li) return; // Exit if the target is not a list item

    // Delete button functionality
    if (e.target.className === 'delete') {
        if (confirm('Are you sure you want to delete this goal?')) {
            li.remove();
            saveGoals(); // Update local storage
        }
    }

    // Done button functionality
    if (e.target.className === 'done') {
        toggleDone(e.target);
        saveGoals(); // Update local storage
    }

    // Note toggle functionality
    if (e.target.className === 'note-toggle') {
        toggleNoteVisibility(li, e.target);
    }
});

// Double-click event listener for editing the goal text
list.addEventListener('dblclick', (e) => {
    if (e.target.className === 'name') {
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
    li.dataset.done = 'false'; // Initialize the done state

    // Create the name span with a tooltip and add a hint for editing
    const nameSpan = document.createElement('span');
    nameSpan.className = 'name';
    nameSpan.textContent = value;
    nameSpan.title = "Double-click to edit this goal"; // Tooltip for user instruction

    // Add a hint below the goal name
    const hintSpan = document.createElement('span');
    hintSpan.className = 'edit-hint';
    hintSpan.textContent = ' (Double-click to edit goal)';

    // Append the elements to the list item
    li.appendChild(nameSpan);
    li.appendChild(hintSpan);

    const deleteSpan = document.createElement('span');
    deleteSpan.className = 'delete';
    deleteSpan.textContent = 'Delete';
    li.appendChild(deleteSpan);

    const doneSpan = document.createElement('span');
    doneSpan.className = 'done';
    doneSpan.textContent = 'Achieved?';
    li.appendChild(doneSpan);

    const noteToggleSpan = document.createElement('span');
    noteToggleSpan.className = 'note-toggle';
    noteToggleSpan.textContent = 'Add Note';
    li.appendChild(noteToggleSpan);

    const noteTextarea = document.createElement('textarea');
    noteTextarea.className = 'note';
    noteTextarea.placeholder = 'Add a note...';
    noteTextarea.style.display = 'none'; // Initially hidden
    li.appendChild(noteTextarea);

    return li;
}

// Function to toggle the done state of a goal
function toggleDone(doneButton) {
    const li = doneButton.closest('li');

    if (doneButton.textContent === 'Achieved?') {
        // Change text to "Yes" and set color to green
        doneButton.textContent = 'Yes';
        doneButton.style.backgroundColor = 'green';
        doneButton.style.color = 'white';
        li.dataset.done = 'true'; // Mark as done
    } else if (doneButton.textContent === 'Yes') {
        // Change text to "No" and set color to red
        doneButton.textContent = 'No';
        doneButton.style.backgroundColor = 'red';
        doneButton.style.color = 'white';
        li.dataset.done = 'false'; // Mark as not done
    } else {
        // Change text back to "Achieved?" and reset color
        doneButton.textContent = 'Achieved?';
        doneButton.style.backgroundColor = '';
        doneButton.style.color = '';
        li.dataset.done = 'false'; // Reset done status
    }

    // Log the new state for debugging
    console.log('New done state:', li.dataset.done);
    saveGoals(); // Ensure the updated state is saved
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
        const isDone = li.dataset.done === 'true'; // Use dataset to get the done state

        // Get the note value
        const noteTextarea = li.querySelector('.note');
        const note = noteTextarea && noteTextarea.style.display === 'block' ? noteTextarea.value : ''; // Save only if visible

        goals.push({ name, isDone, note });
    });

    console.log('Saving goals to local storage:', goals); // Debug log
    localStorage.setItem('goals', JSON.stringify(goals));
}

// Function to load goals from local storage
function loadGoals() {
    const storedGoals = localStorage.getItem('goals');
    if (!storedGoals) {
        console.log('No goals found in local storage.');
        return;
    }

    const goals = JSON.parse(storedGoals);
    console.log('Loading goals from local storage:', goals); // Debug log

    goals.forEach(goal => {
        const li = createGoalItem(goal.name);
        if (goal.isDone) {
            const doneButton = li.querySelector('.done');
            doneButton.style.backgroundColor = 'green';
            doneButton.style.color = 'white';
            doneButton.textContent = 'Yes';
            li.dataset.done = 'true'; // Set the done state
        }
        const noteTextarea = li.querySelector('.note');
        if (noteTextarea && goal.note) {
            noteTextarea.value = goal.note; // Set the note value if present
            console.log('Loaded note value:', goal.note); // Debug log to verify note loading
        }
        list.appendChild(li);
    });
}
body {
    font-family: Tahoma, sans-serif;
    color: #493251; /* Slightly muted dark purple for better readability */
    letter-spacing: 1px;
  }
  
  /* Page Banner */
  #page-banner {
    background: linear-gradient(90deg, #b18ea7, #5e366c); /* Softer gradient */
    padding: 10px 0;
    color: #fff;
    text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.2); /* Subtle text shadow */
  }
  
  #page-banner h1, #page-banner p {
    width: 100%;
    text-align: center;
    margin: 0px 0;
  }
  
  #page-banner input {
    width: 90%;
    max-width: 300px;
    margin: 20px auto;
    display: block;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
    color: #e0d3e6; /* Darker input text */
    outline: none;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  /* Navigation Bar */
  #nav-container {
    background-color: rgba(0, 0, 0, 0); /* Transparent background */
    color: #310231; /* Retain text color */
    padding: 20px; /* Adjusted padding for better spacing */
    box-shadow: 2px 0 5px rgba(0, 0, 0, 0.2); /* Shadow on the right */
    border-radius: 0 10px 10px 0; /* Rounded corners */
    font-family: 'Lato', sans-serif;
    font-size: 16px;
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    width: 238px; /* Adjusted width */
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
  }
  
  #nav-container nav ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    width: 100%;
  }
  
  #nav-container nav ul li a {
    color: white;
    text-decoration: none;
    font-size: 16px;
    font-weight: bold;
    padding: 5px 10px;
    transition: background-color 0.3s ease, color 0.3s ease;
    letter-spacing: 2px; /* Increase space between letters */
  }
  
  /* Hover Effects */
  #nav-container nav ul li a:hover {
    background: linear-gradient(90deg, #b18ea7, #5e366c); /* Softer gradient for hover */
    color: #fff;
    border-radius: 8px;
  }
  
  #nav-container nav ul li a.active {
    background-color: #f0f0f0;
    color: #5e366c;
  }
  