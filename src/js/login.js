// Import Firebase
import { database } from './firebase-config.js';
import { ref, get, child } from 'firebase/database';

const errorMsg = document.getElementById('errorMsg');
const successMsg = document.getElementById('successMsg');

function showMessage(element, message) {
    element.textContent = message;
    element.style.display = 'block';
    setTimeout(() => {
        element.style.display = 'none';
    }, 3000);
}

// Check if already logged in
const currentUser = localStorage.getItem('currentUser');
if (currentUser) {
    window.location.href = 'home.html';
}

// Login Form
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    if (!username || !password) {
        showMessage(errorMsg, 'Please fill in all fields');
        return;
    }

    try {
        const usersRef = ref(database, 'users');
        const snapshot = await get(usersRef);

        if (snapshot.exists()) {
            const users = snapshot.val();
            let userFound = false;
            let userId = null;

            // Search for user by username or email
            for (const [id, userData] of Object.entries(users)) {
                if ((userData.username === username || userData.email === username) && 
                    userData.password === password) {
                    userFound = true;
                    userId = id;
                    break;
                }
            }

            if (userFound) {
                // Store user session
                localStorage.setItem('currentUser', userId);
                localStorage.setItem('username', users[userId].username);
                
                showMessage(successMsg, 'Login successful! Redirecting...');
                setTimeout(() => {
                    window.location.href = 'home.html';
                }, 1500);
            } else {
                showMessage(errorMsg, 'Invalid username/email or password');
            }
        } else {
            showMessage(errorMsg, 'No users found. Please sign up first.');
        }
    } catch (error) {
        console.error('Login error:', error);
        showMessage(errorMsg, 'Login failed. Please try again.');
    }
});