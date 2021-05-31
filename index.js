const tbodyTdClasses = [".firstname", ".lastname", ".gender", ".birthdate"];
let records_per_page = 5;
let current_page = 1;


document.querySelector(".per_page")
  .addEventListener("change", () => {
    records_per_page = document.querySelector(".per_page").value;
    loadUsers(dataToFetch);
  })
async function loadUsers(endpoint) {
  const users = await fetch(endpoint);
  const objJson = await users.json();

  let tbody = document.querySelector("tbody");
  let thead = document.querySelector("thead tr");
  thead.innerHTML = "";
  tbody.innerHTML = "";

  // Pagination

  function addEventListeners() {
    prevButton.addEventListener("click", prevPage);
    nextButton.addEventListener("click", nextPage);
  }
  const prevButton = document.getElementById("button_prev");
  const nextButton = document.getElementById("button_next");

  function selectedPage() {
    let page_number = document
      .getElementById("page_number")
      .getElementsByClassName("clickPageNumber");
    for (let i = 0; i < page_number.length; i++) {
      if (i == current_page - 1) {
        page_number[i].style.opacity = "1.0";
      } else {
        page_number[i].style.opacity = "0.5";
      }
    }
  }

  function checkButtonOpacity() {
    current_page == 1
      ? prevButton.classList.add("opacity")
      : prevButton.classList.remove("opacity");
    current_page == numPages()
      ? nextButton.classList.add("opacity")
      : nextButton.classList.remove("opacity");
  }

  async function changePage(page) {
    tbody.innerHTML = "";
    if (page < 1) {
      page = 1;
    }
    if (page > numPages() - 1) {
      page = numPages();
    }
    for (
      let i = (page - 1) * records_per_page;
      i < page * records_per_page && i < objJson.length;
      i++
    ) {
      tbody.innerHTML += `<tr class='objectBlock'>
                  <td class='firstname'>${objJson[i].firstname ?? ""}</td>
                  <td class='lastname'>${objJson[i].lastname ?? ""}</td>
                  <td class='gender'>${objJson[i].gender ?? ""}</td>
                  <td class='birthdate'>${objJson[i].birthdate ?? ""}</td>
                  <td class='buttons'>
                    <button class='save' value='${objJson[i].id}'>SAVE</button>
                    <button class='cancel' value='${objJson[i].id}'>CANCEL</button>
                    <button class='delete' value='${objJson[i].id}'>DELETE</button>
                  </td>
                </tr>`;
    }
    checkButtonOpacity();
    selectedPage();
    addfieldEvents(tbodyTdClasses);
    await cancel();
    save();
    deleteEvent();
  }

  function prevPage() {
    if (current_page > 1) {
      current_page--;
      changePage(current_page);
    }
  }

  function nextPage() {
    if (current_page < numPages()) {
      current_page++;
      changePage(current_page);
    }
  }

  function clickPage() {
    document.addEventListener("click", function (e) {
      if (
        e.target.nodeName == "SPAN" &&
        e.target.classList.contains("clickPageNumber")
      ) {
        current_page = e.target.textContent;
        changePage(current_page);
      }
    });
  }

  function pageNumbers() {
    let pageNumber = document.getElementById("page_number");
    pageNumber.innerHTML = "";

    for (let i = 1; i < numPages() + 1; i++) {
      pageNumber.innerHTML += "<span class='clickPageNumber'>" + i + "</span>";
    }
  }
  function numPages() {
    return Math.ceil(objJson.length / records_per_page);
  }
  // end of pagination
  // load thead th
  tbodyTdClasses.forEach((thName) => {
    let th = document.createElement("th");
    if (thName !== "id") {
      let removedDots = thName.replace(/\./g, " ");
      th.append(removedDots);
      thead.append(th);
    }
  });

  changePage(current_page);
  pageNumbers();
  selectedPage();
  clickPage();
  addEventListeners();
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

    document.querySelector(".pagination-block").style.display = "none";
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
        editField(e, document.querySelectorAll(singleClass), singleClass);
        !isClicked
          ? // if isClicked = false, then display hidden buttons, else not display
            ((field.parentNode.querySelector(".buttons").style.display =
              "flex"),
            hideOtherRows(e, document.querySelectorAll(singleClass)),
            (isClicked = true))
          : null;
      });
    });
  });
}

// CANCEL
async function cancel() {
  document.querySelectorAll(".cancel").forEach((singleCancel) => {
    singleCancel.addEventListener("click", async (e) => {
      e.preventDefault();
      document.querySelector("tbody").innerHTML = "";
      loadUsers(dataToFetch);
      document.querySelector(".pagination-block").style.display = "block";
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
        ? (patch.birthdate =
            selectedRow.querySelector(".birthdate input").value)
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
        ? selectedFieldCounter === 4
          ? (deleteReq(btn.value), alert("Deleted successfully"))
          : selectedFieldCounter < 4
          ? (deletePatch(btn.value, patch), alert("Deleted successfully"))
          : null
        : null;
    });
  });
}

loadUsers(dataToFetch)