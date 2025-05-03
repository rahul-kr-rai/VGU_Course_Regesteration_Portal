// Define the server details
const SERVER_URL = "https://mysql-1b51f828-vgu-course-registeration.l.aivencloud.com:10282";

// Show the registration form when the "Register" button is clicked
document.getElementById("register-btn").addEventListener("click", () => {
  document.getElementById("form-container").style.display = "block";
  document.getElementById("search-container").style.display = "none"; // Hide the search form
  document.getElementById("form-title").textContent = "Register for Courses";
  document.getElementById("registration-form").setAttribute("data-action", "register");
});

// Handle form submission for course registration or update
document.getElementById("registration-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const enrollment = document.getElementById("enrollment").value;
  const aec = document.getElementById("aec").value;
  const vac = document.getElementById("vac").value;
  const sec = document.getElementById("sec").value;

  const action = document.getElementById("registration-form").getAttribute("data-action");

  try {
    let response;
    if (action === "register") {
      response = await fetch(`${SERVER_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, enrollment, aec, vac, sec }),
      });
    } else if (action === "change") {
      response = await fetch(`${SERVER_URL}/update/${enrollment}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, aec, vac, sec }),
      });
    }

    if (response.ok) {
      const course = await response.json();
      action === "register" ? updateTableWithCourse(course) : updateCourseRow(course);
      clearFormAndShowMessage(`Course ${action === "register" ? "registered" : "updated"} successfully!`);
    } else {
      alert(await response.text());
    }
  } catch (err) {
    console.error("Error:", err);
    alert("An error occurred. Please try again.");
  }
});

// Handle search functionality
document.getElementById("search-form-btn").addEventListener("click", async () => {
  const enrollment = document.getElementById("search-enrollment").value.trim();
  const searchResult = document.getElementById("search-result");
  const tableBody = document.querySelector("#course-list tbody");

  searchResult.style.display = "none";
  Array.from(tableBody.children).forEach(row => row.style.display = "none");

  if (enrollment) {
    try {
      const response = await fetch(`${SERVER_URL}/search/${enrollment}`);
      if (response.ok) {
        const course = await response.json();

        const matchingRow = Array.from(tableBody.children).find(row =>
          row.getAttribute("data-enrollment") === enrollment
        );

        if (matchingRow) {
          matchingRow.style.display = "table-row";
        } else {
          updateTableWithCourse(course);
        }
      } else {
        searchResult.textContent = "No records found.";
        searchResult.style.display = "block";
      }
    } catch (error) {
      console.error("Error during search:", error);
      searchResult.textContent = "An error occurred during the search.";
      searchResult.style.display = "block";
    }
  } else {
    searchResult.textContent = "Please enter an enrollment number.";
    searchResult.style.display = "block";
  }
});

// Update the course table with a new course
function updateTableWithCourse(course) {
  const table = document.getElementById("course-list");
  const image = document.getElementById("registered-image");
  const tableBody = document.querySelector("#course-list tbody");

  if (table.style.display === "none") table.style.display = "table";
  if (image.style.display === "none") image.style.display = "block";

  const row = document.createElement("tr");
  row.setAttribute("data-enrollment", course.enrollment);

  row.innerHTML = `
    <td>${course.name}</td>
    <td>${course.enrollment}</td>
    <td>${course.aec}</td>
    <td>${course.vac}</td>
    <td>${course.sec}</td>
    <td>
      <button class="change-btn">Change course</button>
      <button class="deregister-btn">Deregister</button>
    </td>
  `;

  tableBody.appendChild(row);
  addChangeAndDeregisterHandlers(row, course);
}

// Update an existing course row
function updateCourseRow(course) {
  const row = document.querySelector(`tr[data-enrollment="${course.enrollment}"]`);
  if (row) {
    row.children[0].textContent = course.name;
    row.children[2].textContent = course.aec;
    row.children[3].textContent = course.vac;
    row.children[4].textContent = course.sec;
  }
}

// Clear form and show success message
function clearFormAndShowMessage(message) {
  document.getElementById("form-container").style.display = "none";
  const successMessage = document.getElementById("success-message");
  successMessage.textContent = message;
  successMessage.style.display = "block";
  setTimeout(() => { successMessage.style.display = "none"; }, 3000);
}

// Attach event handlers to Change and Deregister buttons
function addChangeAndDeregisterHandlers(row, course) {
  const changeBtn = row.querySelector(".change-btn");
  const deregisterBtn = row.querySelector(".deregister-btn");

  changeBtn.onclick = () => {
    document.getElementById("form-container").style.display = "block";
    document.getElementById("search-container").style.display = "none";
    document.getElementById("form-title").textContent = "Change Course";
    document.getElementById("name").value = course.name;
    document.getElementById("enrollment").value = course.enrollment;
    document.getElementById("aec").value = course.aec;
    document.getElementById("vac").value = course.vac;
    document.getElementById("sec").value = course.sec;
    document.getElementById("registration-form").setAttribute("data-action", "change");
  };

  deregisterBtn.onclick = async () => {
    const tableBody = document.querySelector("#course-list tbody");
    await fetch(`${SERVER_URL}/deregister/${course.enrollment}`, { method: 'DELETE' });
    row.remove();

    if (!tableBody.children.length) {
      document.getElementById("course-list").style.display = "none";
      document.getElementById("registered-image").style.display = "none";
    }
  };
}
