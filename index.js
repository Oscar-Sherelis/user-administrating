const tbodyTdClasses = [".firstname", ".lastname", ".gender", ".birthdate"];

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
    tdBirth.setAttribute("class", "birthdate");

    tdFirstname.append(user.firstname ?? "");
    tdLastname.append(user.lastname ?? "");
    tdGender.append(user.gender ?? "");
    tdBirth.append(user.birthdate ?? "");

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
  addfieldEvents(tbodyTdClasses);
  await cancel();
  save();
  deleteEvent();
}

function addfieldEvents(classes) {
  // clicked el index
  function findHtmlElIndex(e, classes) {
    return Array.from(classes).indexOf(e.target);
  }
  function hideOtherRows(e, classes) {
    let index = findHtmlElIndex(e, classes);
    document.querySelectorAll("tbody tr").forEach((row, i) => {
      if (i !== index) {
        row.style.display = "none";
      }
    });
  }
  let clickedToEditGender = false;
  let clickedToEditBirthdate = false;

  function editField(e, classes, tdClassName) {
    let currentBirthdate;
    let index = findHtmlElIndex(e, classes);

    if (!!document.querySelectorAll("tbody tr")[index]) {
      document
        .querySelectorAll("tbody tr")
        [index].querySelector(tdClassName)
        .addEventListener("click", () => {
          document
            .querySelectorAll("tbody tr")
            [index].querySelector(tdClassName)
            .classList.toggle("onEdit");
        });
    }
    if (tdClassName === ".firstname" || tdClassName === ".lastname") {
      document
        .querySelectorAll("tbody tr")
        [index].querySelector(tdClassName)
        .setAttribute("contenteditable", "true");
    } else if (tdClassName === ".gender") {
      if (!clickedToEditGender) {
        document
          .querySelectorAll("tbody tr")
          [index].querySelector(".gender").innerHTML = `
      <select>
        <option value="male" default>male</option>
        <option value="female">female</option>
      </select>
      `;
        clickedToEditGender = true;
      }
    } else if (tdClassName === ".birthdate") {
      if (!clickedToEditBirthdate) {
        currentBirthdate = document
          .querySelectorAll("tbody tr")
          [index].querySelector(".birthdate").innerHTML;
        document
          .querySelectorAll("tbody tr")
          [index].querySelector(".birthdate").innerHTML = `
        <input type="date" value="${currentBirthdate}">
        `;
        clickedToEditBirthdate = true;
      }
    }
  }
  let isClicked = false;

  // classes from const arr .firstname, .lastname etc...
  classes.forEach((singleClass) => {
    document.querySelectorAll(singleClass).forEach((field) => {
      field.addEventListener("click", (e) => {
        !isClicked
          ? // if isClicked = false, then display none buttons, else not display
            ((field.parentNode.querySelector(".buttons").style.display =
              "flex"),
            hideOtherRows(e, document.querySelectorAll(singleClass)),
            editField(e, document.querySelectorAll(singleClass), singleClass))
          : (field.parentNode.querySelector(".buttons").style.display =
              "none");
      });
    });
  });
}

// CANCEL
async function cancel() {
  document.querySelectorAll(".cancel").forEach((singleCancel) => {
    singleCancel.addEventListener("click", async () => {
      document.querySelector("tbody").innerHTML = "";
      load();
    });
  });
}

function save() {

  async function saveReq(id, patch) {
    let res = await fetch(dataToFetch + id, {
      method: "PATCH",
      mode: "cors",
      body: JSON.stringify(patch),
      headers: {
        "Content-Type": "application/json",
      },
    });
    return await res.json();
  }

  document.querySelectorAll(".save").forEach((btn) => {
    btn.addEventListener("click", () => {
      let selectedRow = btn.parentNode.parentNode;
      let patch = {
        firstname: selectedRow.querySelector(".firstname").innerHTML,
        lastname: selectedRow.querySelector(".lastname").innerHTML,
      };
      !!selectedRow.querySelector(".gender select")
        ? ((currentdIndex = selectedRow.querySelector(".gender select")),
          (patch.gender = selectedRow.querySelector(".gender select").value))
        : selectedRow.querySelector(".gender").innerHTML;

      !!selectedRow.querySelector(".birthdate input")
        ? (patch.birthdate = selectedRow.querySelector(".birthdate input").value)
        : selectedRow.querySelector(".birthdate").innerHTML;
      saveReq(btn.value, patch);
      alert("Save completed Successfully");
    });
  });
}

function deleteEvent() {
  // deletes selected fields
  async function deletePatch(id, patch) {
    let res = await fetch(dataToFetch + id, {
      method: "PATCH",
      mode: "cors",
      body: JSON.stringify(patch),
      headers: {
        "Content-Type": "application/json",
      },
    });
    return await res.json();
  }
  // If all fields are selected, then delete from DB
  async function deleteReq(id) {
    let res = await fetch(dataToFetch + id, {
      method: "DELETE",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return await res.json();
  }

  document.querySelectorAll(".delete").forEach((btn) => {
    btn.addEventListener("click", () => {
      let patch = {};
      let selectedRow = btn.parentNode.parentNode;
      let onDelete = ".onEdit";
      let selectedFieldCounter = 0;
      tbodyTdClasses.forEach((singleClass) => {
        let removedDots = singleClass.replace(/\./g, " ");
        !!selectedRow.querySelector(singleClass + onDelete)
          ? ((patch[removedDots.trim()] = ""), selectedFieldCounter++)
          : null;
      });

      const agree = prompt("Are you sure you want to Delete?", "yes");
      !!agree 
      ?
        selectedFieldCounter === 4
        ? (deleteReq(btn.value),
          alert("Deleted successfully"))
        : selectedFieldCounter < 4
        ? (deletePatch(btn.value, patch),
          alert("Deleted successfully"))
        :null
      :null
    });
  });
}

load();
