// Already logged in? Skip straight to the dashboard.
if (auth.getToken()) {
  window.location.href = "dashboard.html";
}

const form = document.getElementById("loginForm");
const errorAlert = document.getElementById("errorAlert");
const submitBtn = document.getElementById("submitBtn");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorAlert.classList.remove("show");

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  submitBtn.disabled = true;
  submitBtn.textContent = "Signing in…";

  try {
    const data = await apiRequest("/auth/login", {
      method: "POST",
      auth: false,
      body: { email, password },
    });

    auth.setSession(data.token, data.user);
    window.location.href = "dashboard.html";
  } catch (err) {
    errorAlert.textContent = err.message;
    errorAlert.classList.add("show");
    submitBtn.disabled = false;
    submitBtn.textContent = "Sign in";
  }
});