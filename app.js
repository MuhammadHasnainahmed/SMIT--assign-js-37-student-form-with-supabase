const supabaseUrl = "https://xwwowgklxvfmcjzdnhaq.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3d293Z2tseHZmbWNqemRuaGFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1NDk4MzUsImV4cCI6MjA2OTEyNTgzNX0.X3gOUHHTcB5I1x9iZy5twify2bjY2Re_YMeR6veIUpQ";
const client = supabase.createClient(supabaseUrl, supabaseKey);

console.log("Supabase Client Created:", client);
let form = document.getElementById("studentForm");
let roll = document.getElementById("roll");

let searchButton = document.getElementById("searchButton");
let tablecontainer = document.querySelector(".table-container");
let studentList = document.getElementById("studentList");

// admin login
let adminLoginForm = document.getElementById("adminLoginForm");
let adminemail = document.getElementById("adminemail");
let adminpassword = document.getElementById("password");
let admintablecontainer = document.querySelector(".admintablecontainer");
let adminStudentList = document.getElementById("adminStudentList");

let rollnumber = Math.floor(Math.random() * 1000000)
  .toString()
  .padStart(6, "0");
// console.log("Generated Roll Number:", rollnumber);



// ------------------------ student form ----------------------
if (form) {
  roll.textContent = `your roll number is: ${rollnumber}`;
  let alldata = [];
  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    let studentData = {
      name: document.getElementById("studentName").value,
      fatherName: document.getElementById("fatherName").value,
      age: document.getElementById("age").value,
      roll: rollnumber,
      cnic: document.getElementById("cnic").value,
      gender: document.getElementById("gender").value,
      course: document.getElementById("Course").value,
      address: document.getElementById("address").value,
      phone: document.getElementById("phone").value,
    };

    if (
      !studentData.name ||
      !studentData.fatherName ||
      !studentData.age ||
      !studentData.roll ||
      !studentData.cnic ||
      !studentData.gender ||
      !studentData.course ||
      !studentData.address ||
      !studentData.phone
    ) {
      alert("Please fill in all fields.");
      return;
    }

    if (studentData.cnic.length !== 13) {
      alert("CNIC must be 13 digits long.");
      return;
    }

    if (studentData.phone.length !== 11) {
      alert("Phone number must be 11 digits long.");
      return;
    }

    const { data, error } = await client
      .from("student_form")
      .insert([studentData])
      .select("*");

    if (error) {
      console.log(error.message);
    } else {
      console.log("Data inserted successfully:", data);
      alert("Data inserted successfully");
      form.reset();
    }
  });
}

// ---------------------chcek cnic search -----------------------
if (searchButton) {
  searchButton.addEventListener("click", async function (event) {
    event.preventDefault();
    let checkcnic = document.getElementById("searchInput").value;
    console.log("Searching for CNIC Number:", checkcnic);

    const { data, error } = await client
      .from("student_form")
      .select()
      .eq("cnic", checkcnic);

    if (error) {
      console.log("Error fetching data:", error.message);
    } else {
      console.log("Data fetched successfully:", data);
      tablecontainer.style.display = "block";
      studentList.innerHTML = "";
      for (let i = 0; i < data.length; i++) {
        studentList.innerHTML = `
        <tr>
        <td>${
          data[i].name.charAt(0).toUpperCase() +
          data[i].name.slice(1).toLowerCase()
        }</td>
        <td>${
          data[i].fatherName.charAt(0).toUpperCase() +
          data[i].fatherName.slice(1).toLowerCase()
        }</td>
        <td>${data[i].age}</td>
        <td>${data[i].roll}</td>
        <td>${data[i].cnic}</td>
        <td>${data[i].status}</td>
        </tr>
        `;
      }
    }
  });
}

// -------------------------admin login------------------

if (adminLoginForm) {
  adminLoginForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    let adminemailValue = adminemail.value;
    let adminPasswordValue = adminpassword.value;

    console.log(
      "Admin Name:",
      adminemailValue + ", Admin Password:",
      adminPasswordValue
    );

    if (adminemailValue === "" || adminPasswordValue === "") {
      alert("Please fill in all fields.");
      return;
    }

    const { data, error } = await client.auth.signInWithPassword({
      email: adminemailValue,
      password: adminPasswordValue,
    });

    if (error) {
      console.log("Error logging in:", error.message);
      alert("Login failed. Please check your credentials.");
    } else {
      console.log("Login successful:", data);
      alert("Login successful");
      window.location.href = "admin.html";
    }
  });
}

// ------------------------ Admin Table Function -----------------------
async function admintableshow() {
  admintablecontainer.style.display = "block";

  const { data, error } = await client.from("student_form").select("*");

  if (error) {
    console.log("Error fetching data:", error.message);
  } else {
    console.log("Data fetched successfully:", data);
    adminStudentList.innerHTML = "";
    for (let i = 0; i < data.length; i++) {
      adminStudentList.innerHTML += `
        <tr id='row-${data[i].roll}'>
        <td>${
          data[i].name.charAt(0).toUpperCase() +
          data[i].name.slice(1).toLowerCase()
        }</td>
        <td>${
          data[i].fatherName.charAt(0).toUpperCase() +
          data[i].fatherName.slice(1).toLowerCase()
        }</td>
        <td>${data[i].age}</td>
        <td>${data[i].roll}</td>
        <td>${data[i].cnic}</td>
        <td>${data[i].status}</td>
        <td class="actions-cell">
    <select class="status-select" onchange="updateStatus('${
      data[i].roll
    }', this.value)" >
    <option value="pending" ${data[i].status === 'pending' ? 'selected' : ''} >Pending</option>
      <option value="active" ${data[i].status === 'active' ? 'selected' : ''} >Active</option>
      <option value="inactive" ${data[i].status === 'inactive' ? 'selected' : ''}>Inactive</option>
    </select>
  </td>
  <td><button class="delete-button" onclick="deleteRow('${
    data[i].roll
  }')">Delete</button></td>
        </tr>
        `;
    }
  }
}

// ------------------------ Logout Function -----------------------
async function logoutshow() {
  const { error } = await client.auth.signOut();

  if (error) {
    console.log("Error logging out:", error.message);
    alert("Logout failed. Please try again.");
  } else {
    console.log("Logout successful");
    alert("Logout successful");
    window.location.href = "adminlogin.html";
  }
}

// ------------------------ Update Status Function -----------------------
async function updateStatus(roll, status) {
  console.log("Updating status for roll:", roll, "to status:", status);

  const { error } = await client
    .from("student_form")
    .update({ status: status })
    .eq("roll", roll);
  if (error) {
    console.log("Error updating status:", error.message);
  } else {
    console.log("Status updated successfully for roll:", roll);
    alert("Status updated successfully");
  }

  admintableshow();
}

// -------------------------------------- Delete Row Function ----------------------- 
async function deleteRow(id) {
  let row = document.getElementById(`row-${id}`);

  const { error } = await client.from("student_form").delete().eq("roll", id);

  if (error) {
    console.log("Error deleting row:", error.message);
  } else {
    console.log("Row deleted successfully with ID:", id);
    if (row) {
      row.remove();
      alert("Row deleted successfully");
    }
  }
}



// ------------------------ filter Active Users -----------------------------------------

let activeusers = document.getElementById("activeusers");
if (activeusers) {
activeusers.addEventListener('change', async function() {
    
    let filtervalue = activeusers.value;
    // console.log("Active users filter changed to:", filtervalue);
    
    let query = client.from("student_form").select("*");



     if (filtervalue === 'active') {
        query = query.eq("status", "active");
     } else if (filtervalue === 'inactive') {
        query = query.eq("status", "inactive");
       
        
     }else {
        query = query; 
     }

    const { data, error } = await query;    

    if (error) {
        console.log("Error fetching data:", error.message);
        
    }else{
        console.log("Data fetched successfully:", data);
        adminStudentList.innerHTML = "";

        for (let i = 0; i < data.length; i++) {
             adminStudentList.innerHTML += `
        <tr id='row-${data[i].roll}'>
        <td>${
          data[i].name.charAt(0).toUpperCase() +
          data[i].name.slice(1).toLowerCase()
        }</td>
        <td>${
          data[i].fatherName.charAt(0).toUpperCase() +
          data[i].fatherName.slice(1).toLowerCase()
        }</td>
        <td>${data[i].age}</td>
        <td>${data[i].roll}</td>
        <td>${data[i].cnic}</td>
        <td>${data[i].status}</td>
        <td class="actions-cell">
    <select class="status-select" onchange="updateStatus('${data[i].roll}', this.value)" >
    <option value="pending" ${data[i].status === "pending" ? "selected" : ""} >Pending</option>
      <option value="active" ${data[i].status === "active" ? "selected" : ""} >Active</option>
      <option value="inactive" ${data[i].status === "inactive" ? "selected" : ""}>Inactive</option>
    </select>
    </td>
    <td><button class="delete-button" onclick="deleteRow('${data[i].roll}')">Delete</button></td>
        </tr>
    `            
        }
        
    }


})
}


// --------------------- Logout Function ridirect-------------------------
window.onload = async function () {
    const { data: { session } } = await client.auth.getSession();

    if (!session && window.location.pathname !== "/adminlogin.html") {
        window.location.pathname = "/adminlogin.html"; 
    }
}

