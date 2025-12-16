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
let editingUserId = null;

if (openModalBtn) {
  openModalBtn.addEventListener("click", () => {
    modal.classList.add("show");
  });
}

if (closeModalBtn) {
  closeModalBtn.addEventListener("click", closeModal);
}

if (modal) {
  modal.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal-overlay")) {
      closeModal();
    }
  });
}

function closeModal() {
  modal.classList.remove("show");
  userForm.reset();
  errorEl.textContent = "";
  editingUserId = null;
}

async function getUsers() {
  const res = await fetch(API_URL);
  users = await res.json();
  renderUsers(users);
}

async function createUser(user) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
  return await res.json();
}

async function updateUser(id, user) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
  return await res.json();
}

async function deleteUser(id) {
  await fetch(`${API_URL}/${id}`, { method: "DELETE" });
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

      <div class="user-actions">
        <button class="btn-view" data-id="${user.id}">Edit</button>
        <button class="btn-delete" data-id="${user.id}">Delete</button>
      </div>
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

if (userForm) {
  userForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const userData = {
      name: nameInput.value.trim(),
      username: usernameInput.value.trim(),
      email: emailInput.value.trim(),
      phone: phoneInput.value.trim(),
    };

    const error = validateUser(userData);
    if (error) {
      errorEl.textContent = error;
      return;
    }

    errorEl.textContent = "";

    if (editingUserId) {
      const updatedUser = await updateUser(editingUserId, userData);
      users = users.map((u) =>
        u.id === editingUserId ? { ...u, ...updatedUser } : u
      );
    } else {
      const createdUser = await createUser(userData);
      users.unshift(createdUser);
    }

    renderUsers(users);
    closeModal();
  });
}

if (userList) {
  userList.addEventListener("click", async (e) => {
    const id = Number(e.target.dataset.id);
    if (!id) return;

    if (e.target.classList.contains("btn-delete")) {
      const confirmDelete = confirm("Delete this user?");
      if (!confirmDelete) return;

      await deleteUser(id);
      users = users.filter((u) => u.id !== id);
      renderUsers(users);
    }

    if (e.target.classList.contains("btn-view")) {
      const user = users.find((u) => u.id === id);
      if (!user) return;

      editingUserId = id;

      nameInput.value = user.name;
      usernameInput.value = user.username;
      emailInput.value = user.email;
      phoneInput.value = user.phone;

      modal.classList.add("show");
    }
  });
}

getUsers();
