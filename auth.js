// KLibrary authentication

async function requireLogin() {
  const { data: { session } } = await db.auth.getSession();
  if (!session) {
    window.location.href = "index.html";
    return null;
  }
  return session;
}

const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const message = document.getElementById("loginMessage");
    message.textContent = "Opening the library…";

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    const { error } = await db.auth.signInWithPassword({ email, password });

    if (error) {
      message.textContent = error.message;
      message.className = "message error";
      return;
    }

    window.location.href = "genres.html";
  });
}

const signupForm = document.getElementById("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const message = document.getElementById("signupMessage");

    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value;
    const confirm = document.getElementById("signupConfirm").value;

    if (password !== confirm) {
      message.textContent = "The passwords do not match.";
      message.className = "message error";
      return;
    }

    message.textContent = "Creating your account…";

    const { data, error } = await db.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: name }
      }
    });

    if (error) {
      message.textContent = error.message;
      message.className = "message error";
      return;
    }

    // If email confirmation is disabled, Supabase creates a session immediately.
    if (data.session) {
      window.location.href = "genres.html";
    } else {
      message.textContent = "Account created! Check your email to confirm your account, then log in.";
      message.className = "message success";
    }
  });
}

const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  requireLogin().then(async (session) => {
    if (!session) return;
    const welcome = document.getElementById("welcome");
    const name = session.user.user_metadata?.display_name;
    if (welcome) welcome.textContent = name ? `Welcome, ${name}.` : "Welcome to KLibrary.";
  });

  logoutBtn.addEventListener("click", async () => {
    await db.auth.signOut();
    window.location.href = "index.html";
  });
}

// Protect individual genre pages.
if (document.body.classList.contains("genre-page")) {
  requireLogin();
}
