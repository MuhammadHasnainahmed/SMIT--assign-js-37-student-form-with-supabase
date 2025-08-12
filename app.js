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


let downloadReport = document.getElementById("downloadReport");
let downloadButton = document.getElementById('downloadButton')



// let profilepicture = document.getElementById('file');



let rollnumber = Math.floor(Math.random() * 1000000)
  .toString()
  .padStart(6, "0");
// console.log("Generated Roll Number:", rollnumber);



// ------------------------ student form ----------------------
if (form) {
  roll.textContent = `your roll number is: ${rollnumber}`;
  
  form.addEventListener("submit", async function (event) {
    event.preventDefault();

   
    let file = document.getElementById("file").files[0];
    let filename = file.name;

    // console.log(file , filename);

const { data:imagedata, error:imageerror } = await client
  .storage
  .from('profileimg')
  .upload(`public/${filename}`, file, {
    cacheControl: '3600',
    upsert: false
  })

  if (imageerror) {
    console.log("Error uploading image:", imageerror);
  } else {
    console.log("Image uploaded successfully:", imagedata);
    
  }
    


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
      image:  filename           
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
      !studentData.phone||
      !studentData.image
    ) {
      toastr.error('Please fill in all fields.');
      return;
    }

    if (studentData.cnic.length !== 13 || !/^\d+$/.test(studentData.cnic)) {
      toastr.error('CNIC number must be 13 digits long.');
      return;
    }

    if (studentData.phone.length !== 11 || !/^\d+$/.test(studentData.phone)) {
      toastr.error('Phone number must be 11 digits long.');
      return;
    }

    const { data, error } = await client
      .from("student_form")
      .insert([studentData])
      .select("*");

    if (error) {
     toastr.error('Error inserting data:', error.message);
    } else {
      console.log("Data inserted successfully:", data);
     toastr.success('Data inserted successfully.');
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

    // downloadButton.style.display = "none";
        



    const { data, error } = await client
      .from("student_form")
      .select()
      .eq("cnic", checkcnic);
 
        if (data.length === 0) {
        toastr.error('No data found for the provided CNIC number.');
        return
      }

    if (error) {
      toastr.error('Error fetching data:', error.message);
    } else {
      console.log("Data fetched successfully:", data);
      tablecontainer.style.display = "block";

      // downloadButton.style.display = "none";
  



    
      studentList.innerHTML = "";
      for (let i = 0; i < data.length; i++) {

        const imageFilename = data[i].image;
        console.log(imageFilename);
        

    const { data: imageUrlData } = client.storage
      .from('profileimg')
      .getPublicUrl(`public/${imageFilename}`);


        studentList.innerHTML = `
        <tr>
        <td ><img src=${imageUrlData.publicUrl} class="profile-image" alt="Profile Image" width="50"  height="50" /></td>
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
        <td>
        ${downloadbuttoncelhtml(data[i].status , data[i].roll)}
        </td>
       
        </tr>
        `;
      }
    }
  });
}



// ----------------------DOWONLOAD BUTTON CREATE ----------------------

function downloadbuttoncelhtml(status , roll) {
  if (status === 'active' ) {
    // console.log(roll);
   return ` <button onclick="downloadIdCard('${roll}')" >Download Id Card</button> `
   
  }else if (status === 'inactive') {
    return ` <span>Your id card is inactive</span>`
    
  }else {
    return ` <span>your id card is pending</span>`
  }
}


// ------------------------Download Id Card -----------------------

async function downloadIdCard(roll) {
  const { jsPDF } = window.jspdf;

  const { data, error } = await client
    .from("student_form")
    .select("*")
    .eq("roll", roll);

  if (error) {
    toastr.error("Error fetching data:", error.message);
    return;
  }

  const student = data[0];
  const doc = new jsPDF("p", "mm", [85, 130]); // ID card size

  // Colors
  const lightGreen = "#a8e6a1";
  const darkBlue = "#003366";

  // Background
  doc.setFillColor(lightGreen);
  doc.rect(0, 0, 85, 130, "F");

  // Header
  doc.setFillColor(darkBlue);
  doc.rect(0, 0, 85, 20, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("SMIT MASS IT TRAINING", 42.5, 12, { align: "center" });

    const imageFilename = student.image;
  const { data: imageUrlData } = client.storage
    .from("profileimg")
    .getPublicUrl(`public/${imageFilename}`);
  doc.addImage(imageUrlData.publicUrl, "PNG", 27.5, 25, 30, 30);

  // Student details
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(8);
  let y = 65;
  const gap = 6;

  function addDetail(label, value) {
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, 10, y);
    doc.setFont("helvetica", "normal");
    doc.text(`${value || ""}`, 30, y);
    y += gap;
  }

  addDetail("Name", student.name);
  addDetail("Father", student.fatherName);
  addDetail("Age", student.age);
  addDetail("Roll No", student.roll);
  addDetail("CNIC", student.cnic);
  addDetail("Status", student.status);

  // Footer contact strip
  doc.setFillColor(darkBlue);
  doc.rect(0, 120, 85, 10, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text("Contact: 0300-0000000", 42.5, 126, { align: "center" });

  // Save PDF
  doc.save(`student_${roll}.pdf`);
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
      toastr.error('Please fill in all fields.');
      return;
    }

    const { data, error } = await client.auth.signInWithPassword({
      email: adminemailValue,
      password: adminPasswordValue,
    });

    if (error) {
      console.log("Error logging in:", error.message);
      toastr.error('Login failed. Please check your credentials.');
    } else {
      console.log("Login successful:", data);
 toastr.success('Login successful.');
 setTimeout(() => {
  
   window.location.href = "admin.html";
 }, 1000);
    }
  });

  
}




// ------------------------ Admin Table Function -----------------------
async function admintableshow() {
  admintablecontainer.style.display = "block";

  const { data, error } = await client.from("student_form").select("*");

  if (error) {
    toastr.error('Something went wrong!');
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

  <td><button class="edit-button" onclick="editRow('${data[i].roll}')">Edit</button></td>
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
   toastr.error('Error logging out:', error.message);
  } else {
    console.log("Logout successful");
 toastr.success('Logout successful.');
 setTimeout(() => {
  
   window.location.href = "adminlogin.html";
 }, 1000);
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
    toastr.error('Error updating status:', error.message);
  } else {
    console.log("Status updated successfully for roll:", roll);
  toastr.success('Message sent successfully!');
  }

  admintableshow();
}

// -------------------------------------- Delete Row Function ----------------------- 
async function deleteRow(id) {
  let row = document.getElementById(`row-${id}`);

  const { error } = await client.from("student_form").delete().eq("roll", id);

  if (error) {
    toastr.error('Error deleting row:', error.message);
  } else {
    console.log("Row deleted successfully with ID:", id);
    if (row) {
      row.remove();
      toastr.success('Row deleted successfully!');
    }
  }
}

// -----------------------Edit Row Function -----------------------
async function editRow(id) {
  console.log("Editing row with ID:", id);

  let row = document.getElementById(`row-${id}`);
  let tds = row.getElementsByTagName('td');
  let editbutton = row.querySelector('.edit-button');

  if (editbutton.textContent === 'Edit') {

    let name = tds[0].innerText;
    let fathername = tds[1].innerText;
    let age = tds[2].innerText;
    let cnic = tds[4].innerText;

    tds[0].innerHTML = `<input type="text" id="name-${id}" value="${name}">`;
    tds[1].innerHTML = `<input type="text" id="fathername-${id}" value="${fathername}">`;
    tds[2].innerHTML = `<input type="number" id="age-${id}" value="${age}">`;
    tds[4].innerHTML = `<input type="text" id="cnic-${id}" value="${cnic}">`;

    editbutton.textContent = 'Update';
  } else {
 
    const { error } = await client
      .from('student_form')
      .update({
        name: document.getElementById(`name-${id}`).value,
        fatherName: document.getElementById(`fathername-${id}`).value,
        age: document.getElementById(`age-${id}`).value,
        cnic: document.getElementById(`cnic-${id}`).value
      })
      .eq('roll', id)

    editbutton.textContent = 'Edit';

    if (error) {
      // console.log("Error updating row:", error.message);
      toastr.error('Update failed:', error.message);
    } else {
      // console.log("Row updated successfully with ID:", id);
      toastr.success('data updated successfully!');
      admintableshow(); 
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
  <td><button class="edit-button" onclick="editRow('${data[i].roll}')">Edit</button></td>

        </tr>
    `            
        }
        
    }


})
}


// --------------------- Logout Function ridirect-------------------------
async function redirect() {
  const { data: { session }, error } = await client.auth.getSession();

  if (!session) {
    if (window.location.pathname.includes("admin.html")) {
      window.location.href = "adminlogin.html";
    }
  }else{
    console.log(error);
    
  }
}
redirect();


// ------------------------ Download Report -----------------------

downloadReport.addEventListener('click', async function() {
 console.log( "Download Report button clicked");

 let table = document.getElementById('adminTable')

 let workbook = XLSX.utils.table_to_book(table, { sheet: "student Data" });
  XLSX.writeFile(workbook, "admin_table.xlsx");
  

})
