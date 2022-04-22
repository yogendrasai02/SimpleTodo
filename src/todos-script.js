import { 
    signOutUser,
    addTodos,
    deleteFromDBDoc,
    todos,
    updateUserDoc
} from './firebase-script.js';

// import from updateUI.js
import {
    deleteFromUI,
    addTodoToUI
} from './updateUI.js';

// data pertaining to the user
let userDetails = null;
let todosArr = [];
let indOfTodo = 0;

// if the user is not logged in, redirect to home page
document.onload = () => {
    let userDetails_ls = localStorage.getItem('userDetails');
    if(!userDetails_ls) {
        location.href = "/index.html";
    }
};

// store the user's email and display name in local storage
// since this takes time, wait until that data is available
const loadTimer = setInterval(() => {
    const userObj = JSON.parse(window.localStorage.getItem('userDetails'));
    if(userObj) {
        userDetails = userObj;
        if(displayName.textContent.length > 0) {
            // data is available, so clear this timer
            clearInterval(loadTimer);
        }
        updateDisplayName();
    }
}, 500);

// DOM references
const logoutBtn = document.querySelector("#logoutBtn");
const displayName = document.querySelector('#displayName');
const todosDiv = document.querySelector('#todos');
const addTodoHasDueDate = document.querySelector('#addTodoHasDueDate');
const editTodoHasDueDate = document.querySelector('#editTodoHasDueDate');
const addTodoForm = document.querySelector('#addTodoForm');
const editTodoForm = document.querySelector('#editTodoForm');
const sortByDropdownMenu = document.querySelector('#sortByDropdownMenu');
const searchInput = document.querySelector('#searchInput');

// when clicked on the checkbox(has due date) in add todo form, enable the datetime picker
addTodoHasDueDate.addEventListener('click', event => {
    if(event.target.checked) {
        event.target.parentElement.nextElementSibling.classList.remove('d-none');
    } else {
        event.target.parentElement.nextElementSibling.classList.add('d-none');
    }
});

// if the editTodoHasDueDate checkbox is clicked, show the datetime input if it is checked, else dont show it
editTodoHasDueDate.addEventListener('click', event => {
    if(event.target.checked) {
        event.target.parentElement.nextElementSibling.classList.remove('d-none');
    } else {
        event.target.parentElement.nextElementSibling.classList.add('d-none');
    }
});

// sign out user when clicked on logout button
logoutBtn.addEventListener('click', () => {
    displayName.textContent = "";
    signOutUser();
});

// to update display name in navbar
const updateDisplayName = () => {
    userDetails = JSON.parse(localStorage.getItem('userDetails'));
    displayName.textContent = userDetails.displayName;
};

// add todos - submit event on the form
addTodoForm.addEventListener('submit', event => {
    event.preventDefault();
    const todo = {
        title: addTodoForm.title.value,
        description: addTodoForm.description.value,
        hasDueDate: addTodoForm.hasDueDate.checked,
        dueDate: ((addTodoForm.hasDueDate.checked) ? new Date(addTodoForm.dueDate.value) : null),
        completed: false,
        createdAt: new Date()
    };
    addTodos(userDetails.email, todo, addTodoForm.addTodoBtn);
    addTodoForm.reset();
});

// if the more options(three dots icon) is clicked, either edit or delete a todo 
todosDiv.addEventListener('click', event => {
    todosArr = todos;
    if(event.target.classList.contains('dropdown-item')) {
        // some option from the dropdown is clicked
        const option = event.target.name;
        if(option === "complete" || option === "edit" || option === "delete") {
            // get index of the clicked todo (index from todos[])
            const id = Number(event.target.parentElement.parentElement.getAttribute("id").split('-').at(-1));
            indOfTodo = id;
            const todoId = `todo-${id}`;
            if(option === "complete") {
                // console.log("mark as complete");
            } else if(option === "edit") {
                // edit todo, open the edit todo modal and fill up the values by default
                editTodoForm.editTodoHasDueDate.parentElement.nextElementSibling.classList.add('d-none');
                editTodoForm.editTodoHasDueDate.checked = false;
                const editTodoModal = new bootstrap.Modal(document.getElementById('editTodoModal'));
                editTodoModal.show();
                editTodoForm.title.value = todosArr[id].title;
                // DESCRIPTION textarea should be of appropriate height
                editTodoForm.description.value = todosArr[id].description;
                editTodoForm.createdAt.value = todosArr[id].createdAt;
                // if the todo has a due date, convert the date into a form which can be set as .value to input:datetime
                if(todosArr[id].hasDueDate) {
                    editTodoForm.hasDueDate.checked = true;
                    let actualDate = new Date(todosArr[id].dueDate);
                    actualDate.setMinutes(actualDate.getMinutes() - actualDate.getTimezoneOffset());
                    editTodoForm.dueDate.value = actualDate.toISOString().slice(0, 16);
                    editTodoHasDueDate.parentElement.nextElementSibling.classList.remove('d-none');
                }
            } else {
                // delete todo
                deleteFromDBDoc(id);
                deleteFromUI(todoId);
            }
        }
    }
});

// submit event on edit todo form, update the doc
editTodoForm.addEventListener('submit', event => {
    event.preventDefault();
    editTodoForm.lastElementChild.click();
    const updatedTodo = {
        title: editTodoForm.title.value,
        description: editTodoForm.description.value,
        hasDueDate: editTodoForm.hasDueDate.checked,
        dueDate: ((editTodoForm.hasDueDate.checked) ? new Date(editTodoForm.dueDate.value) : null),
        createdAt: new Date(editTodoForm.createdAt.value)
    };
    updateUserDoc(indOfTodo, updatedTodo);
});

// sorting todos options -> listen to a click event
sortByDropdownMenu.addEventListener('click', event => {
    let btnName = "";
    for(let node of event.path) {
        if(node.tagName === "BUTTON") {
            btnName = node.getAttribute('name');
            break;
        }
    }
    searchInput.value = "";
    if(btnName === "clear") {
        // remove all filter
        todosArr = [...todos];
        todosDiv.innerHTML = '';
        todosArr.forEach(todo => {
            addTodoToUI(todo);
        });
    } else {
        btnName = btnName.split('-');
        const field = btnName[0], order = btnName[1];
        todosArr = [...todos];
        if(field === "title") {
            // sort based on title
            todosArr.sort((todo1, todo2) => {
                if(todo1.title < todo2.title) {
                    return -1;
                } else if(todo1 > todo2.title) {
                    return 1;
                } else {
                    return 0;
                }
            });
        } else {
            // sort base on due date
            todosArr = todosArr.filter(todo => {
                return todo.hasDueDate;
            });
            todosArr.sort((todo1, todo2) => {
                if(todo1.hasDueDate && todo2.hasDueDate) {
                    return todo1.dueDate.getTime() - todo2.dueDate.getTime();
                } else if(todo1.hasDueDate) {
                    return -1;
                } else if(todo2.hasDueDate) {
                    return 1;
                } else {
                    return 0;
                }
            });
        }
        // NOTE: You are prepending the child in addTodoToUI() to, whatever sorted order is right, give the opposite of it to the function
        if(order === "asc") {
            todosArr.reverse();
        }
        todosDiv.innerHTML = '';
        // add todos to DOM
        todosArr.forEach(todo => {
            addTodoToUI(todo);
        });
    }
});

// filter todos based on title and description -> listen to a keyup event on the search input field
searchInput.addEventListener('keyup', () => {
    const searchTerm = searchInput.value;
    todosArr = todos;
    let dummyTodos = [...todosArr];
    if(searchTerm.length != 0) {
        dummyTodos = todosArr.filter(todo => {
            return todo.title.includes(searchTerm) || todo.description.includes(searchTerm); 
        });
    }
    todosDiv.innerHTML = '';
    dummyTodos.forEach(todo => {
        addTodoToUI(todo);
    });
    // incase there are no filtered todos
    if(dummyTodos.length == 0) {
        todosDiv.innerHTML = `<h2 class="fw-bold" style="grid-column: 1 / -1;">Oops, no matches found!</h2>`;
    }
});
