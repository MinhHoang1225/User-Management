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
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Fetch failed");
    const data = await res.json();
    users = Array.isArray(data) ? data : [];
    renderUsers(users);
  } catch {
    errorEl.textContent = "Không tải được danh sách user";
  }
}

async function createUser(user) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
  if (!res.ok) throw new Error("Create failed");
  return await res.json();
}

async function updateUser(id, user) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
  if (!res.ok) throw new Error("Update failed");
  return await res.json();
}

async function deleteUser(id) {
  const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Delete failed");
}

function renderUsers(list) {
  userList.innerHTML = "";

  list.forEach((user) => {
    const div = document.createElement("div");
    div.className = "user-card";

    div.innerHTML = `
      <div class="avatar">${user.name?.charAt(0).toUpperCase() || "?"}</div>
      <h3>${user.name || ""}</h3>
      <p><strong>@${user.username || ""}</strong></p>
      <p>${user.email || ""}</p>
      <p>${user.phone || ""}</p>

      <div class="user-actions">
        <button class="btn-view" data-id="${user.id}">Edit</button>
        <button class="btn-delete" data-id="${user.id}">Delete</button>
      </div>
    `;

    userList.appendChild(div);
  });
}

function validateUser(user) {
  if (!user.name || user.name.trim().length < 3)
    return "Invalid name";

  if (!user.username || !user.username.trim())
    return "Invalid username";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email))
    return "Invalid email";

  if (
    !user.phone ||
    !/^\d{10}$/.test(user.phone.trim())
  )
    return "Invalid phone number";

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

    try {
      if (editingUserId !== null) {
        const updatedUser = await updateUser(editingUserId, userData);
        users = users.map((u) =>
          u.id === editingUserId ? { ...u, ...updatedUser } : u
        );
      } else {
        const createdUser = await createUser(userData);
        const newUser = {
          ...userData,
          id: createdUser.id || Date.now(),
        };
        users = [newUser, ...users];
      }

      renderUsers(users);
      closeModal();
    } catch {
      errorEl.textContent = "Có lỗi xảy ra";
    }
  });
}

if (userList) {
  userList.addEventListener("click", async (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const id = Number(btn.dataset.id);
    if (!id) return;

    if (btn.classList.contains("btn-delete")) {
      if (!confirm("Delete this user?")) return;

      try {
        await deleteUser(id);
        users = users.filter((u) => u.id !== id);
        renderUsers(users);
      } catch {
        errorEl.textContent = "Xóa thất bại";
      }
    }

    if (btn.classList.contains("btn-view")) {
      const user = users.find((u) => u.id === id);
      if (!user) return;

      editingUserId = id;

      nameInput.value = user.name || "";
      usernameInput.value = user.username || "";
      emailInput.value = user.email || "";
      phoneInput.value = user.phone || "";

      modal.classList.add("show");
    }
  });
}

getUsers();
