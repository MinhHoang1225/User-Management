const API_URL = "https://jsonplaceholder.typicode.com/users";

const userList = document.getElementById("userList");
const modal = document.getElementById("userModal");
const openModalBtn = document.getElementById("openModalBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const userForm = document.getElementById("userForm");
const errorEl = document.getElementById("error");

const nameInput = document.getElementById("name");
const usernameInput = document.getElementById("username");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");

let users = [];

openModalBtn.addEventListener("click", () => {
  userModal.classList.add("show");
});

closeModalBtn.addEventListener("click", closeModal);

userModal.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal-overlay")) {
    closeModal();
  }
});

function closeModal() {
  userModal.classList.remove("show");
}


async function getUsers() {
  const res = await fetch(API_URL);
  users = await res.json();
  renderUsers(users);
}

function renderUsers(list) {
  userList.innerHTML = "";

  list.forEach((user) => {
    const div = document.createElement("div");
    div.className = "user-card";

    div.innerHTML = `
      <div class="avatar">${user.name.charAt(0).toUpperCase()}</div>
      <h3>${user.name}</h3>
      <p><strong>@${user.username}</strong></p>
      <p>${user.email}</p>
      <p>${user.phone}</p>
    `;

    userList.appendChild(div);
  });
}

function validateUser(user) {
  if (!user.name || user.name.length < 3) return "Name quá ngắn";
  if (!user.username) return "Username bắt buộc";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email))
    return "Email không hợp lệ";
  if (!user.phone) return "Phone bắt buộc";
  return null;
}

async function createUser(user) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });

  return await res.json();
}

userForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const newUser = {
    name: nameInput.value.trim(),
    username: usernameInput.value.trim(),
    email: emailInput.value.trim(),
    phone: phoneInput.value.trim(),
  };

  const error = validateUser(newUser);
  if (error) {
    errorEl.textContent = error;
    return;
  }

  errorEl.textContent = "";

  const createdUser = await createUser(newUser);

  users.unshift(createdUser);
  renderUsers(users);
  closeModal();
});

getUsers();
