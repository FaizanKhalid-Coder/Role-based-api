if (auth.getToken()) {
  window.location.href = "dashboard.html";
}

const form = document.getElementById("registerForm");
const errorAlert = document.getElementById("errorAlert");
const okAlert = document.getElementById("okAlert");
const submitBtn = document.getElementById("submitBtn");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorAlert.classList.remove("show");
  okAlert.classList.remove("show");

  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  submitBtn.disabled = true;
  submitBtn.textContent = "Creating account…";

  try {
    const data = await apiRequest("/auth/register", {
      method: "POST",
      auth: false,
      body: { username, email, password },
    });

    auth.setSession(data.token, data.user);
    okAlert.textContent = "Account created. Redirecting…";
    okAlert.classList.add("show");
    setTimeout(() => (window.location.href = "dashboard.html"), 600);
  } catch (err) {
    errorAlert.textContent = err.message;
    errorAlert.classList.add("show");
    submitBtn.disabled = false;
    submitBtn.textContent = "Create account";
  }
});