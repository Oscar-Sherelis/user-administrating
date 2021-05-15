async function loadUsers (endpoint) {
    const users = await fetch(endpoint);
    const loadedUsers = await (await users).json();
    let tbody = document.querySelector("tbody");
    tbody.innerHTML = "";

    loadedUsers.forEach(user => {
        let tbodyTr = document.createElement("tr");
        let tdName = document.createElement("td");
        let tdSurname = document.createElement("td");
        let tdBirth = document.createElement("td");
        let tdGender = document.createElement("td");

        tdName.append(user.name);
        tdSurname.append(user.surname);
        tdGender.append(user.gender);
        tdBirth.append(user.tdBirth);

        tbodyTr.append(tdName, tdSurname, tdGender,tdBirth)
        tbody.append(tbodyTr);
    })    
}

loadUsers("http://localhost:3000/users")