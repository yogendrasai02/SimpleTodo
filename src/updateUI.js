// reference to todos div -> which shall contains all todos
export const todosDiv = document.querySelector("article #todos");

// reference to DOM elements
export const toast = document.getElementById('toast');
export const toastIcon = document.getElementById('toastIcon');
export const toastMsg = document.getElementById('toastMsg');

// add a given todo item to the todos div
export const addTodoToUI = (todo) => {
    const title = todo.title;
    const description = todo.description.replaceAll('\n', '<br>');
    let hour = todo.createdAt.getHours();
    let min = todo.createdAt.getMinutes();
    // output created at date in a easier to read format
    let tod = "AM";
    if(hour >= 12) {
        tod = "PM";
        if(hour > 12)
            hour -= 12;
    }
    const time = todo.createdAt.toDateString() + `<br>${hour}:${min} ${tod}`;
    let time1 = "No due date set";
    // output due date in a easier to read format
    if(todo.hasDueDate) {
        let hour1 = todo.dueDate.getHours();
        let min1 = todo.dueDate.getMinutes();
        let tod1 = "AM";
        if(hour1 >= 12) {
            tod1 = "PM";
            if(hour1 > 12)
                hour1 -= 12;
        }
        time1 = todo.dueDate.toDateString() + `<br>${hour1}:${min1} ${tod1}`;
    }
    // template for the todo
    const html = `
        <div class="card-header d-flex align-items-center justify-content-between">
            <div>
                <h4 class="fs-2 fw-bold" style="color: tomato;">
                    ${title}
                </h4>
                <p><span class="fw-bold text-danger">Due by:</span> ${time1}</p>
            </div>
            <div class="dropdown">
                <div id="moreOptionsMenu" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="fa-solid fa-ellipsis fs-1"></i>
                </div>
                <ul class="dropdown-menu dropdown-menu-end fs-5" aria-labelledby="moreOptionsDropdown" id="todo-dropdown-${todo.index}">
                    <li>
                        <button class="dropdown-item" name="edit" type="button">
                            <i class="fa-solid fa-pen-to-square"></i> Edit
                        </button>
                    </li>
                    <li>
                        <button class="dropdown-item" name="delete" type="button">
                            <i class="fa-solid fa-trash"></i> Delete
                        </button>
                    </li>
                </ul>
            </div>
        </div>
        <div class="card-body">
            <p class="lead">
                ${description}
            </p>
        </div>
        <div class="card-footer" style="padding-bottom: 0px;">
            <h5>Created at</h5>
            <p>${time}</p>    
        </div>
    `;
    // add the html to a card -> which is our todo
    const card = document.createElement('div');
    card.classList.add('card');
    card.setAttribute('id', `todo-${todo.index}`);
    card.innerHTML = html;
    // add to DOM
    todosDiv.prepend(card);
};

// to delete a todo from UI
export const deleteFromUI = (todoIdInDOM) => {
    const todo = document.getElementById(todoIdInDOM);
    todo.remove();
    // show the toast
    showToast("Todo deleted successfully", `<i class="fa-solid fa-trash"></i>`, "danger");
};

// to hide the toast message
export const hideToast = () => {
    if(toast) {
        toast.classList.remove('show');
        toast.classList.add('hide', 'd-none');
    }
};

// to show the toast message
export const showToast = (message, icon, bootstrapColor) => {
    // hide the toast (incase its already present)
    hideToast();
    toast.classList.add('d-none');
    if(toast) {
        toastIcon.innerHTML = icon;
        toastMsg.textContent = message;
        toast.classList.remove('d-none');
        // remove all the color class
        toastIcon.classList.remove(`text-danger`);
        toastIcon.classList.remove(`text-warning`);
        toastIcon.classList.remove(`text-success`);
        // add the required color class
        toastIcon.classList.add(`text-${bootstrapColor}`);
        // remove all the color class
        toastMsg.classList.remove(`text-danger`);
        toastMsg.classList.remove(`text-warning`);
        toastMsg.classList.remove(`text-success`);
        // add the required color class
        toastMsg.classList.add(`text-${bootstrapColor}`);
        toast.classList.remove('hide');
        toast.classList.add('show',  'p-2', 'border', 'border-4', 'border-dark');
    }
    setTimeout(() => {
        hideToast();
    }, 3500);
};