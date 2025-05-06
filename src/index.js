// Google Classroom API Tool - Main JavaScript file
// This file uses environment variables to securely store API credentials

// API credentials loaded from environment variables
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const API_KEY = process.env.GOOGLE_API_KEY;

// Store classes data
let classesData = [];
let currentClassId = null;

// Define the API scopes
const SCOPES = 'https://www.googleapis.com/auth/classroom.courses.readonly ' +
                'https://www.googleapis.com/auth/classroom.rosters.readonly ' +
                'https://www.googleapis.com/auth/classroom.coursework.me ' +
                'https://www.googleapis.com/auth/classroom.coursework.students.readonly ' +
                'https://www.googleapis.com/auth/classroom.student-submissions.me.readonly ' +
                'https://www.googleapis.com/auth/classroom.student-submissions.students.readonly';

// Token client for OAuth 2.0 flow
let tokenClient;
let currentAccessToken = null;
let isAuthenticated = false;

// DOM Elements
let setupArea;
let mainContainer;
let classesList;
let statusMessage;
let loadingIndicator;
let signoutButton;
let saveCredentialsButton;
let refreshClassesButton;
let welcomeCard;
let classDetailCard;
let studentsCard;
let assignmentsCard;
let submissionsCard;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Cache DOM elements
    setupArea = document.getElementById('setup-area');
    mainContainer = document.getElementById('main-container');
    classesList = document.getElementById('classes-list');
    statusMessage = document.getElementById('status-message');
    loadingIndicator = document.getElementById('loading');
    signoutButton = document.getElementById('signout-button');
    saveCredentialsButton = document.getElementById('save-credentials');
    refreshClassesButton = document.getElementById('refresh-classes');
    
    // Content cards
    welcomeCard = document.getElementById('welcome-card');
    classDetailCard = document.getElementById('class-detail-card');
    studentsCard = document.getElementById('students-card');
    assignmentsCard = document.getElementById('assignments-card');
    submissionsCard = document.getElementById('submissions-card');
    
    // Initialize the app
    initApp();
});

// Initialize the application
function initApp() {
    // Show credentials status
    const credentialsInfo = document.getElementById('credentials-info');
    if (CLIENT_ID && API_KEY) {
        credentialsInfo.textContent = 'API credentials are securely loaded from environment variables.';
        showMessage('Credentials loaded. Click \'Initialize API\' to proceed.');
        saveCredentialsButton.textContent = 'Initialize API';
    } else {
        credentialsInfo.textContent = 'ERROR: API credentials not found in environment variables.';
        showMessage('Missing API credentials. Please check your .env file and rebuild.', true);
    }
    
    // Setup event listeners
    saveCredentialsButton.addEventListener('click', initializeGoogleApiClient);
    signoutButton.addEventListener('click', handleSignOut);
    refreshClassesButton.addEventListener('click', fetchClasses);
    document.getElementById('view-submissions').addEventListener('click', viewSelectedSubmissions);
}

// Initialize token client
function initTokenClient() {
    // Will be initialized after API client is loaded
    console.log('Token client initialization ready');
}

// Show a status message to the user
function showMessage(message, isError = false) {
    statusMessage.textContent = message;
    statusMessage.className = isError ? "status error" : "status";
    console.log(message);
}

// Show/hide loading indicator
function setLoading(isLoading) {
    loadingIndicator.style.display = isLoading ? 'block' : 'none';
}

// Initialize the Google API client
async function initializeGoogleApiClient() {
    if (!CLIENT_ID || !API_KEY) {
        showMessage("Missing API credentials. Please check your environment configuration.", true);
        return;
    }

    setLoading(true);
    showMessage("Loading Google API Client...");
    
    try {
        // Initialize the gapi.client with API key and discovery docs
        await gapi.load('client', async () => {
            await gapi.client.init({
                apiKey: API_KEY,
                discoveryDocs: ["https://classroom.googleapis.com/$discovery/rest?version=v1"]
            });
            
            showMessage("API client loaded. Initializing authentication...");
            initializeGoogleAuth();
        });
    } catch (error) {
        setLoading(false);
        console.error("Error initializing the API client", error);
        showMessage("Error initializing the API client: " + (error.message || JSON.stringify(error)), true);
    }
}

// Initialize Google Authentication
function initializeGoogleAuth() {
    setLoading(true);
    
    try {
        // Initialize the token client for OAuth 2.0 flow
        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: (tokenResponse) => {
                if (tokenResponse && tokenResponse.access_token) {
                    // Store the access token
                    currentAccessToken = tokenResponse.access_token;
                    isAuthenticated = true;
                    
                    // Update UI for signed-in state
                    updateUIForSignIn(true);
                    
                    // Load user classes
                    fetchClasses();
                } else {
                    showMessage("Authentication failed. No access token received.", true);
                    updateUIForSignIn(false);
                }
                
                setLoading(false);
            },
            error_callback: (error) => {
                console.error("Authentication error", error);
                showMessage("Authentication error: " + error.message, true);
                updateUIForSignIn(false);
                setLoading(false);
            }
        });
        
        // Setup the sign-in button
        setupSignInButton();
        
    } catch (error) {
        console.error("Error initializing auth", error);
        showMessage("Error initializing authentication: " + (error.message || JSON.stringify(error)), true);
        setLoading(false);
    }
}

// Set up Google Sign-In button
function setupSignInButton() {
    const signInButton = document.getElementById('google-signin-button');
    signInButton.innerHTML = '';
    
    const customButton = document.createElement('button');
    customButton.textContent = 'Sign in with Google';
    customButton.classList.add('button');
    customButton.addEventListener('click', () => {
        tokenClient.requestAccessToken();
    });
    
    signInButton.appendChild(customButton);
    showMessage("Authentication ready. Please sign in with your Google account.");
}

// Update UI based on sign-in status
function updateUIForSignIn(isSignedIn) {
    if (isSignedIn) {
        setupArea.style.display = 'none';
        mainContainer.style.display = 'flex';
        signoutButton.style.display = 'inline-block';
        hideAllCards();
        welcomeCard.style.display = 'block';
        showMessage("Successfully signed in. Loading your classes...");
    } else {
        setupArea.style.display = 'block';
        mainContainer.style.display = 'none';
        signoutButton.style.display = 'none';
        showMessage("Please sign in to access Google Classroom.");
    }
}

// Handle sign-out
function handleSignOut() {
    google.accounts.oauth2.revoke(currentAccessToken, () => {
        currentAccessToken = null;
        isAuthenticated = false;
        updateUIForSignIn(false);
        showMessage("Signed out successfully.");
    });
}

// Check authentication before making API calls
function checkAuthentication() {
    if (!isAuthenticated) {
        showMessage("You need to sign in first.", true);
        return false;
    }
    return true;
}

// Fetch classes and populate sidebar
function fetchClasses() {
    if (!checkAuthentication()) {
        return;
    }
    
    setLoading(true);
    showMessage("Loading your classes...");
    
    // Clear existing classes
    classesList.innerHTML = '';
    classesData = [];
    
    gapi.client.classroom.courses.list({
        pageSize: 20,
        courseStates: ["ACTIVE"]
    }).then((response) => {
        const courses = response.result.courses || [];
        classesData = courses;
        
        if (courses.length > 0) {
            courses.forEach((course) => {
                const classItem = document.createElement('div');
                classItem.className = 'class-item';
                classItem.dataset.id = course.id;
                
                const className = document.createElement('div');
                className.className = 'class-name';
                className.textContent = course.name;
                
                const classSection = document.createElement('div');
                classSection.textContent = course.section || '';
                
                const classOptions = document.createElement('div');
                classOptions.className = 'class-options';
                
                const detailsOption = document.createElement('span');
                detailsOption.className = 'class-option';
                detailsOption.textContent = 'Details';
                detailsOption.addEventListener('click', (e) => {
                    e.stopPropagation();
                    showClassDetails(course.id);
                });
                
                const studentsOption = document.createElement('span');
                studentsOption.className = 'class-option';
                studentsOption.textContent = 'Students';
                studentsOption.addEventListener('click', (e) => {
                    e.stopPropagation();
                    fetchStudents(course.id);
                });
                
                const assignmentsOption = document.createElement('span');
                assignmentsOption.className = 'class-option';
                assignmentsOption.textContent = 'Assignments';
                assignmentsOption.addEventListener('click', (e) => {
                    e.stopPropagation();
                    fetchAssignments(course.id);
                });
                
                const submissionsOption = document.createElement('span');
                submissionsOption.className = 'class-option';
                submissionsOption.textContent = 'Submissions';
                submissionsOption.addEventListener('click', (e) => {
                    e.stopPropagation();
                    prepareSubmissions(course.id);
                });
                
                classOptions.appendChild(detailsOption);
                classOptions.appendChild(studentsOption);
                classOptions.appendChild(assignmentsOption);
                classOptions.appendChild(submissionsOption);
                
                classItem.appendChild(className);
                classItem.appendChild(classSection);
                classItem.appendChild(classOptions);
                
                classItem.addEventListener('click', () => {
                    showClassDetails(course.id);
                });
                
                classesList.appendChild(classItem);
            });
            
            showMessage(`Successfully loaded ${courses.length} classes.`);
        } else {
            const noClassesMsg = document.createElement('div');
            noClassesMsg.className = 'class-item';
            noClassesMsg.textContent = 'No classes found.';
            classesList.appendChild(noClassesMsg);
            
            showMessage("No classes found. Are you sure you're enrolled in any Google Classroom courses?");
        }
    }).catch((error) => {
        console.error("Error fetching classes", error);
        showMessage("Error fetching classes: " + (error.message || JSON.stringify(error)), true);
        
        const errorMsg = document.createElement('div');
        errorMsg.className = 'class-item';
        errorMsg.textContent = 'Failed to load classes. ' + (error.message || '');
        classesList.appendChild(errorMsg);
    }).finally(() => {
        setLoading(false);
    });
}

// Rest of the application functions would go here...
// These include: showClassDetails, fetchStudents, fetchAssignments, etc.
// For brevity, I'm not including all of the functions from your original code
// in this example. In a real implementation, you would include all of them.
