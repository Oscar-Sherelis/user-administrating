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
  addfieldEvents(tbodyTdClasses);
  await cancel();
  save();
}

function addfieldEvents(classes) {
  // clicked el index
  function findHtmlElIndex(e, classes) {
    return Array.from(classes).indexOf(e.target);
  }
  let clickedHideRows = false;
  
  function hideOtherRows(e, classes) {
    let index = findHtmlElIndex(e, classes);
    document.querySelectorAll("tbody tr").forEach((row, i) => {
      if (i !== index && !clickedHideRows) {
        row.style.visibility = "hidden";
        clickedHideRows = true;
      }
    });
  }
  let clickedToEditGender = false;
  let clickedToEditBirthday = false;

  function editField(e, classes, tdClassName) {
    let currentBirthday;
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
    } else if (tdClassName === ".birthday") {
      if (!clickedToEditBirthday) {
        currentBirthday = document
          .querySelectorAll("tbody tr")
          [index].querySelector(".birthday").innerHTML;
        document
          .querySelectorAll("tbody tr")
          [index].querySelector(".birthday").innerHTML = `
        <input type="date" value="${currentBirthday}">
        `;
        clickedToEditBirthday = true;
      }
    }
  }
  let isClicked = false;

  // classes from const arr .firstname, .lastname etc...
  classes.forEach((singleClass) => {
    document.querySelectorAll(singleClass).forEach((field) => {
      field.addEventListener("click", (e) => {
        !isClicked
          ? // if isClicked = false, then display hidden buttons, else not display
            ((field.parentNode.querySelector(".buttons").style.visibility =
              "visible"),
            hideOtherRows(e, document.querySelectorAll(singleClass)),
            editField(e, document.querySelectorAll(singleClass), singleClass))
          : (field.parentNode.querySelector(".buttons").style.visibility =
              "hidden");
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
    let res = await fetch("http://localhost:3000/users/" + id, {
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

      !!selectedRow.querySelector(".birthday input")
        ? (patch.birthday = selectedRow.querySelector(".birthday input").value)
        : selectedRow.querySelector(".birthday").innerHTML;
      saveReq(btn.value, patch);
      alert("Save completed Successfully");
    });
  });
}

load();
