const KEY="student-management-records-v1";
let students=loadStudents();
const form=document.getElementById("studentForm"),nameInput=document.getElementById("name"),rollInput=document.getElementById("roll"),departmentInput=document.getElementById("department"),emailInput=document.getElementById("email"),editId=document.getElementById("editId"),rows=document.getElementById("studentRows"),search=document.getElementById("search"),filter=document.getElementById("filterDepartment"),message=document.getElementById("message");
function loadStudents(){try{const data=JSON.parse(localStorage.getItem(KEY)||"[]");return Array.isArray(data)?data:[]}catch{return[]}}
function save(){localStorage.setItem(KEY,JSON.stringify(students))}
function notify(text,success=false){message.textContent=text;message.className=success?"success":""}
function safe(value){return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function render(){
 const term=search.value.trim().toLowerCase(),dept=filter.value;
 const shown=students.filter(s=>(s.name.toLowerCase().includes(term)||s.roll.toLowerCase().includes(term)||s.email.toLowerCase().includes(term))&&(!dept||s.department===dept));
 rows.innerHTML=shown.map(s=>`<tr><td>${safe(s.name)}</td><td>${safe(s.roll)}</td><td>${safe(s.department)}</td><td>${safe(s.email)}</td><td><button class="small" data-action="edit" data-id="${safe(s.id)}">Edit</button><button class="small delete" data-action="delete" data-id="${safe(s.id)}">Delete</button></td></tr>`).join("");
 document.getElementById("studentCount").textContent=students.length;
 document.getElementById("departmentCount").textContent=new Set(students.map(s=>s.department)).size;
 document.getElementById("lastUpdated").textContent=students.length?new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}):"—";
 document.getElementById("emptyState").hidden=shown.length>0;
 document.getElementById("resultCount").textContent=`Showing ${shown.length} of ${students.length} records`;
}
function resetForm(){form.reset();editId.value="";document.getElementById("formTitle").textContent="Add a student";document.getElementById("saveBtn").textContent="Add student"}
form.addEventListener("submit",e=>{
 e.preventDefault();
 const record={id:editId.value||String(Date.now()),name:nameInput.value.trim(),roll:rollInput.value.trim().toUpperCase(),department:departmentInput.value,email:emailInput.value.trim()};
 if(!record.name||!record.roll||!record.department||!record.email){notify("Please complete every field.");return}
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(record.email)){notify("Enter a valid email address.");return}
 if(students.some(s=>s.roll.toLowerCase()===record.roll.toLowerCase()&&s.id!==record.id)){notify("That roll number already exists.");return}
 const index=students.findIndex(s=>s.id===record.id);
 if(index>=0){students[index]=record;notify("Student details updated.",true)}else{students.push(record);notify("Student added successfully.",true)}
 save();render();resetForm();
});
rows.addEventListener("click",e=>{
 const btn=e.target.closest("button[data-action]");if(!btn)return;
 const student=students.find(s=>s.id===btn.dataset.id);if(!student)return;
 if(btn.dataset.action==="edit"){editId.value=student.id;nameInput.value=student.name;rollInput.value=student.roll;departmentInput.value=student.department;emailInput.value=student.email;document.getElementById("formTitle").textContent="Edit student";document.getElementById("saveBtn").textContent="Save changes";notify("Update the details and save.",true);nameInput.focus();window.scrollTo({top:0,behavior:"smooth"})}
 if(btn.dataset.action==="delete"&&confirm(`Delete ${student.name}'s record?`)){students=students.filter(s=>s.id!==student.id);save();render();notify("Student record deleted.",true)}
});
search.addEventListener("input",render);filter.addEventListener("change",render);
document.getElementById("cancelBtn").addEventListener("click",()=>{resetForm();notify("")});
document.getElementById("clearSearchBtn").addEventListener("click",()=>{search.value="";filter.value="";render()});
render();