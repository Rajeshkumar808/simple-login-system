const authForm = document.getElementById("authForm");

const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");

const formTitle = document.getElementById("formTitle");
const formSubtitle = document.getElementById("formSubtitle");
const submitButton = document.getElementById("submitButton");

const switchMode = document.getElementById("switchMode");
const switchLabel = document.getElementById("switchLabel");
const message = document.getElementById("message");

let isRegister = false;

// Switch between login and registration
switchMode.addEventListener("click", (e) => {
    e.preventDefault();

    isRegister = !isRegister;

    formTitle.textContent = isRegister ? "Create Account" : "Welcome Back";

    formSubtitle.textContent = isRegister
        ? "Register your new account"
        : "Login to your account";

    submitButton.textContent = isRegister ? "Register" : "Login";

    switchLabel.textContent = isRegister
        ? "Already have an account?"
        : "Don't have an account?";

    switchMode.textContent = isRegister ? "Login" : "Register";

    message.textContent = "";
    authForm.reset();
});

// Login or register
authForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    const endpoint = isRegister
        ? "/api/register"
        : "/api/login";

    message.textContent = "Please wait...";
    submitButton.disabled = true;

    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Something went wrong");
        }

        // BOTH login and register now save the session and go straight to welcome.html
        // (Assumes your backend sends a `token` upon registration. If your register 
        // endpoint doesn't return a token, it will automatically log them in via a quick login fetch next)
        
        let token = data.token;

        if (isRegister && !token) {
            // Fallback: If registration API doesn't return a token, automatically call login right after
            const loginResponse = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });
            const loginData = await loginResponse.json();
            token = loginData.token;
        }

        sessionStorage.setItem("token", token);
        sessionStorage.setItem("username", username);

        window.location.href = "/welcome.html";

    } catch (error) {
        message.textContent = error.message;
        message.style.color = "red";

    } finally {
        submitButton.disabled = false;
    }
});

// Prevent logged-in users from returning to login page
if (sessionStorage.getItem("token")) {
    fetch("/api/me", {
        headers: {
            "Authorization": "Bearer " + sessionStorage.getItem("token")
        }
    })
    .then(response => {
        if (response.ok) {
            window.location.replace("/welcome.html");
        } else {
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("username");
        }
    })
    .catch(() => {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("username");
    });
}