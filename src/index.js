// to initialise keen slider
import { navigation } from './keen-slider-script.js';

// to sign in or sign up user
import {
    signUpUser, loginUser
} from './firebase-script.js';

// if the user is logged in, redirect to todos page
window.onload = () => {
    let userDetails = localStorage.getItem('userDetails');
    if(userDetails) {
        window.location.href = "/todos.html";
    } else {
        console.log("User is not logged in");
    }
    // if the home page is accessed, remove the loader onload
    const loader = document.getElementById('loader');
    loader.remove();
};


// initialise keen slider for testimonials section
const slider = new KeenSlider("#testimonialsSlider", {
    loop: true
}, [
    navigation,
    // to have a 'loop' effect and autplay effect
    (slider) => {
        let timeout;
        let mouseOver = false;
        function clearNextTimeout() {
            clearTimeout(timeout);
        }
        function nextTimeout() {
            clearTimeout(timeout);
            if(mouseOver) return;
            timeout = setTimeout(() => {
                slider.next();
            }, 2500);
        }
        slider.on("created", () => {
            slider.container.addEventListener("mouseover", () => {
                mouseOver = true;
                clearNextTimeout();
            })
            slider.container.addEventListener("mouseout", () => {
                mouseOver = false;
                nextTimeout();
            })
            nextTimeout();
        })
        slider.on("dragStarted", clearNextTimeout);
        slider.on("animationEnded", nextTimeout);
        slider.on("updated", nextTimeout);
    }
]);


// Get reference to various DOM nodes
const loginForm = document.querySelector('#loginForm');
const signUpForm = document.querySelector('#signUpForm');

// Goto top button
const gotoTopBtn = document.getElementById("gotoTopBtn");
window.onscroll = function() {
    scrollFunction()
};

// to display the gototop button
const scrollFunction = () => {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        gotoTopBtn.style.display = "block";
    } else {
        gotoTopBtn.style.display = "none";
    }
}

// on clicking the gototop button, move to top of the page
gotoTopBtn.addEventListener('click', e => {
    topFunction();
});

// move to top of page
function topFunction() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}

// function to validate a password
const validatePassword = (pwd) => {
    return (pwd.length >= 6);
};

// login form's submit event listener -> sign in the user
loginForm.addEventListener('submit', event => {
    event.preventDefault();
    const email = loginForm.loginEmail.value;
    const password = loginForm.loginPassword.value;
    loginUser(email, password);
});

// signup form's submit event listener -> sign up the user
signUpForm.addEventListener('submit', event => {
    event.preventDefault();
    const invalidAuth = document.querySelector('#signup-invalid-auth');
    // get the credentials
    const displayName = signUpForm.displayName.value;
    const email = signUpForm.signUpEmail.value;
    const password = signUpForm.signUpPassword.value;
    const confirmPassword = signUpForm.signUpConfirmPassword.value;
    const validPwd = validatePassword(password);
    if(!validPwd) {
        // ERROR: password must be >= 6 chars long
        if(invalidAuth) {
            invalidAuth.classList.add("d-block", "mb-3");
            invalidAuth.innerHTML = `<h3>Password must be atleast 6 characters long</h3>`;
        }
    } else if(password === confirmPassword) {
        // sign up the user. Also, insert a new doc into 'user' collection in firestore
        signUpUser(displayName, email, password);
    } else {
        // ERROR: passwords in (pwd, confirmPwd) fields must be the same
        if(invalidAuth) {
            invalidAuth.classList.add("d-block", "mb-3");
            invalidAuth.innerHTML = `<h3>Password must be the same</h3>`;
        }
    }
});