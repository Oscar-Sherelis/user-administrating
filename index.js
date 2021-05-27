const tbodyTdClasses = [".firstname", ".lastname", ".gender", ".birthday"];

async function loadUsers(endpoint) {
  const users = await fetch(endpoint);
  const loadedUsers = await (await users).json();

  let tbody = document.querySelector("tbody");
  let thead = document.querySelector("thead tr");
  thead.innerHTML = "";
  tbody.innerHTML = "";

  // load thead th
  tbodyTdClasses.forEach((thName) => {
    let th = document.createElement("th");
    if (thName !== "id") {
      let removedDots = thName.replace(/\./g, " ");
      th.append(removedDots);
      thead.append(th);
    }
  });

  // load tbody content
  loadedUsers.forEach((user) => {
    let tbodyTr = document.createElement("tr");
    let tdFirstname = document.createElement("td");
    let tdLastname = document.createElement("td");
    let tdBirth = document.createElement("td");
    let tdGender = document.createElement("td");

    // buttons
    let tdButtons = document.createElement("td");
    tdButtons.setAttribute("class", "buttons");

    let deleteBtn = document.createElement("button");
    deleteBtn.setAttribute("class", "delete");
    deleteBtn.append("DELETE");

    let cancelBtn = document.createElement("button");
    cancelBtn.setAttribute("class", "cancel");
    cancelBtn.append("CANCEL");

    let saveBtn = document.createElement("button");
    saveBtn.setAttribute("class", "save");
    saveBtn.append("SAVE");

    tdFirstname.setAttribute("class", "firstname");
    tdLastname.setAttribute("class", "lastname");
    tdGender.setAttribute("class", "gender");
    tdBirth.setAttribute("class", "birthday");

    tdFirstname.append(user.firstname ?? "");
    tdLastname.append(user.lastname ?? "");
    tdGender.append(user.gender ?? "");
    tdBirth.append(user.birthday ?? "");

    cancelBtn.value = user.id;
    saveBtn.value = user.id;
    deleteBtn.value = user.id;

    tdButtons.append(saveBtn, cancelBtn, deleteBtn);
    tbodyTr.append(tdFirstname, tdLastname, tdGender, tdBirth, tdButtons);
    tbody.append(tbodyTr);
  });
}

async function load() {
  await loadUsers("http://localhost:3000/users");
}

load();
