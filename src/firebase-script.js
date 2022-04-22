// import firebase app (CDN)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.11/firebase-app.js';

// authentication imports
import { 
    getAuth,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    updateProfile,
    signOut,
} from 'https://www.gstatic.com/firebasejs/9.6.11/firebase-auth.js';

// firestore imports
import { 
    getFirestore,
    collection,
    addDoc,
    query,
    where,
    getDocs,
    updateDoc,
    onSnapshot,
    Timestamp
} from 'https://www.gstatic.com/firebasejs/9.6.11/firebase-firestore.js';

// import to update ui
import {
    addTodoToUI,
    todosDiv,
    showToast,
} from './updateUI.js';

// web app's Firebase configuration
/* ADD YOUR FIREBASE CREDENTIALS(config) HERE */
const firebaseCred = {};
const firebaseConfig = {
    ...firebaseCred
};
  
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Initialize Cloud Firestore
const db = getFirestore(app);

const usersCollRef = collection(db, 'users');
let userDocRef = null;
let userDoc = null;
let userEmail = "";
export let todos = [];

// ##REDIRECT## if the todos page is accessed, redirect to index if the user is not logged in
if(window.location.href.includes('todos.html')) {
    if(localStorage.getItem('userDetails'))
        userEmail = JSON.parse(localStorage.getItem('userDetails')).email;
    else {
        location.href = "/index.html";
    }
}


// update user profile 
// used to set display name upon signup
export const updateUserProfile = (whatToUpdate) => {
    updateProfile(auth.currentUser, whatToUpdate).then(() => {
    }).catch(err => {
        console.log(err);
    });
};

// create an empty user doc in firebase, upon user sign up
export const createUserDocInFirestore = (email) => {
    const userDoc = {
        email: email,
        todos: []
    };
    addDoc(usersCollRef, userDoc).then(res => {
        // redirect to todos.html
        location.href = "/todos.html";
    }).catch(err => {
        console.log(err);
    });
};

// sign up a user with email and pwd
export const signUpUser = (displayName, email, password) => {
    const invalidAuth = document.querySelector('#signup-invalid-auth');
    createUserWithEmailAndPassword(auth, email, password)
    .then(userCred => {
        // update user's display name
        const whatToUpdate = {
            displayName: displayName
        };
        updateUserProfile(whatToUpdate);
        // create a user doc in firestore
        createUserDocInFirestore(email);
    }).catch(err => {
        console.log(err.code);
        // console.log(err.message);
        const errorMsg = err.code.split('/')[1];
        if(invalidAuth) {
            invalidAuth.classList.add("d-block", "mb-3");
            invalidAuth.innerHTML = `<h3>${errorMsg}</h3>`;
        }
    });
};

// login a user with email and pwd
export const loginUser = (email, password) => {
    const invalidAuth = document.querySelector('#login-invalid-auth');
    signInWithEmailAndPassword(auth, email, password)
    .then(userCred => {
        // redirect to todos.html upon login
        location.href = "/todos.html";
    }).catch(err => {
        console.log(err.code);
        // console.log(err.message);
        const errorMsg = err.code.split('/')[1];
        if(invalidAuth) {
            invalidAuth.classList.add("d-block", "mb-3");
            invalidAuth.innerHTML = `<h3>${errorMsg}</h3>`;
        }
    });
};

// logout user
export const signOutUser = () => {
    // remove the userDetails obj from local storage
    localStorage.removeItem('userDetails');
    signOut(auth).then(() => {
        // redirect to index.html
        location.href = "/index.html";
    }).catch(err => {
        console.log(err);
    });
};

// listen to auth changes
onAuthStateChanged(auth, user => {
    if(user && user.stsTokenManager.isExpired == false) {
        const userObj = {
            displayName: user.displayName,
            email: user.email
        };
        // store user details in local storage
        localStorage.setItem('userDetails', JSON.stringify(userObj));
        if(userDocRef == null) {
            const q = query(usersCollRef, where("email", "==", user.email));
            getDocs(q).then(res => {
                const docs = res.docs;
                userDoc = docs[0].data();
                userDocRef = docs[0].ref;
                todos = userDoc.todos;
                let n = todos.length;
                for(let i = 0; i < n; i++) {
                    todos[i].createdAt = new Date(convertFSTimestampToJSDate(todos[i].createdAt));
                    if(todos[i].hasDueDate) {
                        todos[i].dueDate = new Date(new Date(convertFSTimestampToJSDate(todos[i].dueDate)));
                    }
                }
            }).catch(err => {
                console.log(err);
            });
        }
    } else if(user && user.stsTokenManager.isExpired == true) {
        localStorage.removeItem('userDetails');
        console.log("Session expired");
    } else {
        localStorage.removeItem('userDetails');
        console.log("Not yet logged in");
    }
});

let addTodoModal;
if(window.location.href.includes('todos.html')) {
    addTodoModal = new bootstrap.Modal(document.getElementById('addTodoModal'));
}
// add todos
export const addTodos = (email, todoData) => {
    // update date&time to firestore's timestamp
    todoData.createdAt = Timestamp.fromDate(todoData.createdAt);
    if(todoData.hasDueDate)
        todoData.dueDate = Timestamp.fromDate(todoData.dueDate);
    const newTodosArr = [...todos, todoData];
    updateDoc(userDocRef, {
        todos: newTodosArr
    }).then(res => {
        // hide the modal after adding the todo item
        addTodoModal.hide();
        showToast("Added todo successfully", `<i class="fa-solid fa-circle-check"></i>`, "success");
    }).catch(err => {
        console.log(err);
    });
};

// update user's todo doc
export const updateUserDoc = (ind, todo) => {
    // update todos array
    todos[ind] = todo;
    updateDoc(userDocRef, {
        todos: todos
    }).then(res => {
        showToast("Updated todo successfully", `<i class="fa-solid fa-circle-check"></i>`, "warning");
    }).catch(err => {
        console.log(err);
    });
};

// delete a particular todo item from the user's todos[]
export const deleteFromDBDoc = (ind) => {
    todos.splice(ind, 1);
    updateDoc(userDocRef, {
        todos: todos
    }).then(res => {
    }).catch(err => {
        console.log(err);
    });
};

// convert firestore timestamp to milliseconds so that JS date obj can be created
export const convertFSTimestampToJSDate = (firestoreTimestamp) => {
    const s = firestoreTimestamp.seconds;
    const ns = firestoreTimestamp.nanoseconds;
    // to milliseconds
    const ms = Math.round(((s * 1000) + (ns / 1000000)));
    return ms;
};

if(window.location.href.includes('todos.html')) {
    // create the query to current user's user doc in firestore
    const userDocQuery = query(usersCollRef, where("email", "==", userEmail));
    // listen to any changes to that doc
    onSnapshot(userDocQuery, snapshot => {
        // update userDoc, userRef, todos
        userDocRef = snapshot.docs[0];
        userDoc = userDocRef.data();
        userDocRef = userDocRef.ref;
        todos = userDoc.todos;
        let n = todos.length;
        if(n > 0) {
            todosDiv.innerHTML = '';
            for(let i = 0; i < n; i++) {
                todos[i].createdAt = new Date(convertFSTimestampToJSDate(todos[i].createdAt));
                if(todos[i].hasDueDate) {
                    todos[i].dueDate = new Date(new Date(convertFSTimestampToJSDate(todos[i].dueDate)));
                }
            }
            // add the new todo to the DOM
            todos.forEach((todo, ind) => {
                addTodoToUI({...todo, index: ind});
            });
            const nth = document.querySelector('#noTodos');
            if(nth) {
                nth.classList.add('d-none');
            }
        } else {
            // no todos
            const noTodosHeading = document.createElement('h4');
            noTodosHeading.setAttribute('id', 'noTodos');
            noTodosHeading.textContent = 'Seems like you have no pending todos';
            noTodosHeading.classList.add('text-center', 'display-1');
            todosDiv.parentElement.appendChild(noTodosHeading);
        }
        // remove the loader since todos are kept on the browser
        const loader = document.getElementById('todosloader');
        if(loader) {
            loader.remove();
        }
    }, err => {
        console.log(err);
    });
}