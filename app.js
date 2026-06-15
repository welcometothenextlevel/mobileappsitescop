const icons = {
  dashboard: "▦", jobs: "▤", report: "▧", bin: "♲", settings: "⚙", plus: "+", search: "⌕",
  calendar: "□", users: "♙", check: "✓", clock: "◷", camera: "▣", pin: "⌖", pdf: "▥", menu: "☰"
};

const state = {
  loggedIn: false,
  role: "Administrator",
  route: "dashboard",
  jobFilter: "All",
  search: "",
  newJobStep: 1,
  inspectionType: "Building Inspection",
  inspectionSection: "Property",
  selectedJob: null,
  customOptions: JSON.parse(localStorage.getItem("sitescop-options") || "[]"),
  jobs: [
    { id: "SC-1048", client: "Sarah Mitchell", address: "18 Auburn Street, Parramatta NSW", type: "Building Inspection", date: "15 Jun 2026", time: "9:30 AM", status: "In Progress", progress: 68, inspector: "Afshin Nazari" },
    { id: "SC-1047", client: "David Chen", address: "42 Banksia Road, Liverpool NSW", type: "Pest & Timber", date: "15 Jun 2026", time: "1:00 PM", status: "Assigned", progress: 0, inspector: "Michael Ross" },
    { id: "SC-1046", client: "Emma Wilson", address: "7 Jacaranda Avenue, Blacktown NSW", type: "Building Inspection", date: "14 Jun 2026", time: "11:00 AM", status: "Ready for Review", progress: 100, inspector: "Afshin Nazari" },
    { id: "SC-1045", client: "James Taylor", address: "25 Rivergum Close, Penrith NSW", type: "Pest & Timber", date: "13 Jun 2026", time: "2:30 PM", status: "Completed", progress: 100, inspector: "Michael Ross" },
    { id: "SC-1044", client: "Olivia Brown", address: "103 George Street, Windsor NSW", type: "Building Inspection", date: "12 Jun 2026", time: "10:00 AM", status: "Completed", progress: 100, inspector: "Afshin Nazari" }
  ]
};

const buildingSections = ["Job Information", "Property", "Accessibility", "Site Conditions", "External", "Roof Exterior", "Roof Space", "Kitchen", "Laundry", "Bedrooms", "Bathrooms", "Living Areas", "Garage", "Subfloor", "Outbuildings", "Minor Defects", "Major Defects", "Moisture Testing", "Conclusion", "Declaration"];
const pestSections = ["Job Information", "Property", "Accessibility", "Live Termites", "Timber Damage", "Termite Management", "Moisture", "Conducive Conditions", "Safety Hazards", "Risk Assessment", "Conclusion", "Declaration"];

function render() {
  const app = document.getElementById("app");
  if (!state.loggedIn) {
    app.innerHTML = loginView();
    bindLogin();
    return;
  }
  app.innerHTML = shell(pageView());
  bindGlobal();
  bindPage();
}

function loginView() {
  return `<div class="login-screen">
    <section class="login-brand">
      ${brand()}
      <div class="login-copy">
        <p class="eyebrow">Inspect smarter. Report faster.</p>
        <h1>Every detail.<br>One clear report.</h1>
        <p>A complete inspection workspace built for Australian building and pest professionals, in the office and out in the field.</p>
      </div>
      <div class="brand-foot">SITESCOP Inspection Platform · Secure business access</div>
    </section>
    <section class="login-panel">
      <form class="login-card" id="loginForm">
        <div class="mobile-brand">${brand()}</div>
        <h2>Welcome back</h2>
        <p>Sign in to manage your inspections.</p>
        <div class="field"><label>Email address</label><input class="input" type="email" value="admin@sitescop.com.au" required></div>
        <div class="field"><label>Password</label><div class="password-wrap"><input id="password" class="input" type="password" value="sitescop2026" required><button class="icon-btn-inline" type="button" id="showPassword">◉</button></div></div>
        <div class="field"><label>Demo role</label><select id="loginRole" class="select"><option>Administrator</option><option>Inspector</option></select></div>
        <div class="login-meta"><label class="check-inline"><input type="checkbox" checked> Remember me</label><button class="link-button" type="button">Forgot password?</button></div>
        <button class="btn btn-primary btn-block" type="submit">Sign in to SITESCOP <span>→</span></button>
        <div class="demo-note"><strong>Demo access</strong><br>Credentials are pre-filled. Select Sign in to explore the platform.</div>
      </form>
    </section>
  </div>`;
}

function brand() { return `<div class="brand-mark"><div class="brand-icon">S</div><span>SITESCOP</span></div>`; }

function shell(content) {
  const nav = [
    ["dashboard", icons.dashboard, "Dashboard"], ["jobs", icons.jobs, "All Jobs"], ["reports", icons.report, "Reports"],
    ["recycle", icons.bin, "Recycle Bin"], ["settings", icons.settings, "Settings"]
  ];
  const titleMap = { dashboard: "Dashboard", jobs: "Jobs", newJob: "Create New Job", inspection: "Building Inspection", report: "Report Preview", reports: "Reports", recycle: "Recycle Bin", settings: "Settings" };
  return `<div class="app-shell">
    <aside class="sidebar">
      ${brand()}
      <nav class="nav-list">${nav.map(([r,i,l]) => navButton(r,i,l)).join("")}</nav>
      <div class="sidebar-spacer"></div>
      <button class="nav-item" data-route="help"><span class="nav-icon">?</span> Help & Support</button>
      <div class="user-card"><div class="avatar">${state.role === "Administrator" ? "AN" : "MR"}</div><div><strong>${state.role === "Administrator" ? "Afshin Nazari" : "Michael Ross"}</strong><span>${state.role}</span></div></div>
    </aside>
    <main class="main">
      <header class="topbar">
        <div style="display:flex;align-items:center;gap:12px"><button class="circle-button mobile-menu-button">${icons.menu}</button><div class="top-title">${titleMap[state.route] || "SITESCOP"}</div></div>
        <div class="top-actions"><span class="hide-mobile" style="color:var(--muted);font-size:12px">Mon, 15 June 2026</span><button class="circle-button">♢</button><div class="avatar" style="width:40px;height:40px">${state.role === "Administrator" ? "AN" : "MR"}</div></div>
      </header>
      ${content}
    </main>
    <nav class="bottom-nav">
      ${[["dashboard",icons.dashboard,"Home"],["jobs",icons.jobs,"Jobs"],["newJob","＋","New"],["reports",icons.report,"Reports"],["settings",icons.settings,"Settings"]].map(([r,i,l]) => `<button data-route="${r}" class="${state.route === r ? "active" : ""}"><span>${i}</span>${l}</button>`).join("")}
    </nav>
    <div id="modalRoot"></div>
  </div>`;
}

function navButton(route, icon, label) {
  const active = state.route === route || (route === "jobs" && ["newJob","inspection","report"].includes(state.route));
  return `<button class="nav-item ${active ? "active" : ""}" data-route="${route}"><span class="nav-icon">${icon}</span>${label}</button>`;
}

function pageView() {
  switch (state.route) {
    case "dashboard": return dashboardView();
    case "jobs": return jobsView();
    case "newJob": return newJobView();
    case "inspection": return inspectionView();
    case "report": return reportView();
    case "reports": return reportsView();
    case "recycle": return recycleView();
    case "settings": return settingsView();
    default: return dashboardView();
  }
}

function dashboardView() {
  return `<div class="content">
    <div class="page-head"><div><h1>Good morning, Afshin</h1><p>Here is what is happening across your inspections today.</p></div><button class="btn btn-primary" data-route="newJob">＋ <span>Create New Job</span></button></div>
    <div class="stats-grid">
      ${statCard("Active jobs", "12", icons.jobs, "+3 this week")}
      ${statCard("Due today", "3", icons.calendar, "Next at 9:30 AM")}
      ${statCard("Completed", "48", icons.check, "+12 this month")}
      ${statCard("Inspectors", "4", icons.users, "All currently active")}
    </div>
    <div class="dashboard-grid">
      <section class="card"><div class="card-head"><h2>Active jobs</h2><button class="link-button" data-route="jobs">View all →</button></div><div class="job-list">${state.jobs.slice(0,4).map(jobRow).join("")}</div></section>
      <aside>
        <section class="card"><div class="card-head"><h2>Today’s schedule</h2><span class="badge badge-assigned">3 jobs</span></div><div class="card-body"><div class="schedule-list">
          ${scheduleItem("JUN","15","9:30 AM","Sarah Mitchell","Parramatta · Building")}
          ${scheduleItem("JUN","15","1:00 PM","David Chen","Liverpool · Pest & Timber")}
          ${scheduleItem("JUN","15","3:30 PM","Noah Williams","Camden · Building")}
        </div></div></section>
        <section class="card" style="margin-top:20px"><div class="card-head"><h2>Quick actions</h2></div><div class="card-body"><div class="quick-actions"><button class="quick-action" data-route="newJob"><span>＋</span>New job</button><button class="quick-action" data-route="reports"><span>▥</span>Reports</button><button class="quick-action" data-route="settings"><span>♙</span>Add employee</button><button class="quick-action" data-route="settings"><span>⚙</span>Company setup</button></div></div></section>
      </aside>
    </div>
  </div>`;
}

function statCard(label, value, icon, change) { return `<div class="stat-card"><div class="stat-top"><span>${label}</span><span class="stat-icon">${icon}</span></div><div class="stat-value">${value}</div><div class="stat-change">${change}</div></div>`; }
function scheduleItem(mon, day, time, name, detail) { return `<div class="schedule-item"><div class="date-tile"><small>${mon}</small>${day}</div><div><strong>${time} · ${name}</strong><p>${detail}</p></div></div>`; }
function badgeClass(status) { return status === "Completed" ? "complete" : status === "Assigned" ? "assigned" : status === "Ready for Review" ? "review" : "progress"; }
function jobRow(job) { return `<div class="job-row"><div class="job-main"><div class="job-title"><span>${job.client}</span><span class="badge badge-${badgeClass(job.status)}">${job.status}</span></div><div class="job-sub">${job.id} · ${job.address}</div></div><div><div class="progress-label">${job.progress}% complete</div><div class="progress"><span style="width:${job.progress}%"></span></div></div><div style="font-size:12px"><strong>${job.date}</strong><div class="job-sub">${job.time}</div></div><button class="more-button open-job" data-job="${job.id}">›</button></div>`; }

function jobsView() {
  const jobs = state.jobs.filter(j => (state.jobFilter === "All" || j.status === state.jobFilter) && (`${j.client} ${j.address} ${j.id}`.toLowerCase().includes(state.search.toLowerCase())));
  return `<div class="content">
    <div class="page-head"><div><h1>All jobs</h1><p>Manage, assign, and track every inspection.</p></div><button class="btn btn-primary" data-route="newJob">＋ <span>Create New Job</span></button></div>
    <div class="toolbar"><div class="search-wrap"><span class="search-icon">${icons.search}</span><input id="jobSearch" class="input" placeholder="Search client, address or job number" value="${state.search}"></div><div class="filter-tabs">${["All","Assigned","In Progress","Ready for Review","Completed"].map(x => `<button class="filter-tab ${state.jobFilter === x ? "active" : ""}" data-filter="${x}">${x}</button>`).join("")}</div></div>
    <section class="card jobs-table"><div class="table-head"><span>Job no.</span><span>Client / property</span><span>Inspection</span><span>Date</span><span>Status</span><span></span></div>${jobs.map(tableJob).join("") || `<div class="empty-state"><div class="empty-icon">⌕</div><h2>No jobs found</h2><p>Try changing your search or status filter.</p></div>`}</section>
  </div>`;
}
function tableJob(j) { return `<div class="table-row"><strong>${j.id}</strong><div><strong>${j.client}</strong><small>${j.address}</small></div><div>${j.type}<small>${j.inspector}</small></div><div><strong>${j.date}</strong><small>${j.time}</small></div><span class="badge badge-${badgeClass(j.status)}">${j.status}</span><div style="display:flex"><button class="more-button open-job" title="Open job" data-job="${j.id}">›</button><button class="more-button delete-job" title="Delete job" data-job="${j.id}" style="color:var(--red)">×</button></div></div>`; }

function newJobView() {
  const steps = ["Job details","Client & property","Inspection type","Assign & review"];
  return `<div class="content">
    <div class="page-head"><div><h1>Create new job</h1><p>Set up the inspection and allocate it to your team.</p></div></div>
    <div class="stepper">${steps.map((s,i) => `<div class="step ${state.newJobStep === i+1 ? "active" : state.newJobStep > i+1 ? "done" : ""}"><span class="step-num">${state.newJobStep > i+1 ? "✓" : i+1}</span>${s}</div>`).join("")}</div>
    <section class="card form-card">${newJobStepContent()}<div class="form-footer"><button class="btn btn-outline" id="prevStep" ${state.newJobStep === 1 ? "disabled" : ""}>← Back</button><button class="btn btn-primary" id="nextStep">${state.newJobStep === 4 ? "Create job & begin" : "Continue →"}</button></div></section>
  </div>`;
}

function newJobStepContent() {
  if (state.newJobStep === 1) return `<h2>Job information</h2><p class="section-help">The job number is generated automatically.</p><div class="form-grid"><div class="field"><label>Job number</label><input class="input" value="SC-1049" disabled></div><div class="field"><label>Client type</label><select class="select"><option>Purchaser</option><option>Owner</option><option>Agent</option><option>Other</option></select></div><div class="field"><label>Inspection date</label><input class="input" type="date" value="2026-06-16"></div><div class="field"><label>Inspection time</label><input class="input" type="time" value="09:00"></div><div class="field span-2"><label>Priority</label><div class="choice-grid">${choices("priority",["Normal","High","Urgent"],"Normal",true)}</div></div></div>`;
  if (state.newJobStep === 2) return `<h2>Client and property</h2><p class="section-help">Contact details and the property to be inspected.</p><div class="form-grid"><div class="field"><label>Client name</label><input class="input" value="Daniel Thompson"></div><div class="field"><label>Mobile</label><input class="input" value="0412 345 678"></div><div class="field"><label>Email</label><input class="input" value="daniel@example.com"></div><div class="field"><label>Agent name <span style="color:var(--muted)">(optional)</span></label><input class="input" placeholder="Agent or referrer"></div><div class="field span-2"><label>Property address</label><div style="display:flex;gap:9px"><input class="input" value="61 Parkview Drive, Campbelltown NSW 2560"><button class="btn btn-secondary" type="button">${icons.pin} GPS</button></div></div><div class="field span-2"><label>Special instructions</label><textarea class="textarea" placeholder="Access instructions, client requests or other notes"></textarea></div></div>`;
  if (state.newJobStep === 3) return `<h2>Select inspection type</h2><p class="section-help">Version one includes Building and Pest & Timber inspections.</p><div class="type-grid">${typeCard("Building Inspection","Complete residential building condition assessment","⌂")}${typeCard("Pest & Timber","Timber pest, termite and conducive-condition assessment","⌁")}<button class="type-card" disabled style="opacity:.55"><div class="type-icon">＋</div><strong>Combined Inspection</strong><span>Planned module · awaiting final scope approval</span></button></div>`;
  return `<h2>Assign and review</h2><p class="section-help">Confirm the job before it is added to the inspector’s schedule.</p><div class="form-grid"><div class="field"><label>Assigned inspector</label><select class="select"><option>Afshin Nazari</option><option>Michael Ross</option><option>Unassigned</option></select></div><div class="field"><label>Due date</label><input class="input" type="date" value="2026-06-16"></div><div class="span-2" style="padding:18px;border-radius:13px;background:var(--background)"><strong style="display:block;margin-bottom:10px">Job summary</strong><div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;color:var(--muted);font-size:13px"><span>Job: <b style="color:var(--ink)">SC-1049</b></span><span>Client: <b style="color:var(--ink)">Daniel Thompson</b></span><span>Type: <b style="color:var(--ink)">${state.inspectionType}</b></span><span>Inspector: <b style="color:var(--ink)">Afshin Nazari</b></span></div></div></div>`;
}
function typeCard(title, desc, icon) { return `<button class="type-card ${state.inspectionType === title ? "selected" : ""}" data-type="${title}"><div class="type-icon">${icon}</div><strong>${title}</strong><span>${desc}</span></button>`; }

function inspectionView() {
  const job = state.selectedJob || state.jobs[0];
  const sections = job.type === "Pest & Timber" ? pestSections : buildingSections;
  if (!sections.includes(state.inspectionSection)) state.inspectionSection = sections[1];
  return `<div class="content">
    <div class="page-head"><div><h1>${job.type}</h1><p>${job.id} · ${job.client} · ${job.address}</p></div><div class="page-actions"><button class="btn btn-outline" id="saveDraft">Save draft</button><button class="btn btn-primary" data-route="report">${icons.pdf} <span>Preview report</span></button></div></div>
    <div class="inspection-shell">
      <aside class="card inspection-nav"><div class="inspection-summary"><small>Inspection progress</small><strong>${job.progress || 42}% completed</strong><div class="inspection-progress"><div class="progress"><span style="width:${job.progress || 42}%"></span></div></div></div><nav class="section-nav">${sections.map((s,i) => `<button class="section-link ${state.inspectionSection === s ? "active" : ""} ${i < 3 ? "complete" : ""}" data-section="${s}"><span class="section-check">${i < 3 ? "✓" : i+1}</span>${s}</button>`).join("")}</nav></aside>
      <main class="inspection-content"><div class="save-bar"><div class="save-state"><span class="save-dot"></span>All changes saved on this device</div><span>Last saved just now</span></div>${inspectionSectionContent(job)}<div class="sticky-actions"><button class="btn btn-outline" id="previousSection">← Previous</button><button class="btn btn-primary" id="nextSection">Save & continue →</button></div></main>
    </div>
  </div>`;
}

function inspectionSectionContent(job) {
  const section = state.inspectionSection;
  if (section === "Property") return `<section class="card question-section"><h2>Property description</h2><p>Record the property profile and construction details.</p>
    ${question("Property type", choices("property",["Detached House","Duplex","Unit","Townhouse","Villa","Other"],"Detached House",true))}
    ${question("Position on block", choices("position",["Front","Middle","Rear"],"Front",true))}
    <div class="form-grid"><div class="field"><label>Building age</label><input class="input" placeholder="Years" value="24"></div><div class="field"><label>Storeys</label><select class="select"><option>Single</option><option>Double</option><option>Multi</option></select></div><div class="field"><label>Bedrooms</label><input class="input" type="number" value="4"></div><div class="field"><label>Bathrooms</label><input class="input" type="number" value="2"></div></div>
    ${question("Wall construction", choices("walls",["Brick Veneer","Double Brick","Hebel","Cladding","Rendered Masonry",...state.customOptions],"Brick Veneer",false) + `<button class="add-option" data-add-option="Wall construction">＋ Add option</button>`)}
    ${photos("Property front photo",1)}
  </section>`;
  if (section === "Accessibility") return `<section class="card question-section"><h2>Accessibility and obstructions</h2><p>Document the areas inspected and anything that limited access.</p>
    ${question("Readily accessible areas", choices("accessible",["Building Interior","Building Exterior","Roof Space","Subfloor","Site","Outbuildings","Roof Exterior"],"Building Interior",false))}
    ${question("Interior obstructions", choices("obstruction",["Wall Linings","Floor Coverings","Cabinetry","Furniture","Stored Goods","Appliances","Not Applicable"],"Furniture",false) + `<button class="add-option" data-add-option="Interior obstructions">＋ Add tick box</button>`)}
    <div class="field"><label>One-off inaccessible area notes</label><textarea class="textarea">Furniture and stored goods limited access to sections of the garage and built-in wardrobes.</textarea></div>
    ${question("Undetected damage risk", choices("risk",["Low","Moderate","Moderate to High","High","Extreme"],"Moderate",true))}
  </section>`;
  if (["Kitchen","Laundry","Bedrooms","Bathrooms","Living Areas","Garage"].includes(section)) return roomSection(section);
  if (section === "Minor Defects" || section === "Major Defects") return defectSection(section);
  if (["Live Termites","Timber Damage","Termite Management","Conducive Conditions"].includes(section)) return pestSection(section);
  if (section === "Conclusion") return conclusionSection();
  if (section === "Declaration") return declarationSection();
  return genericSection(section, job.type);
}

function question(title, content) { return `<div class="question-block"><span class="question-title">${title}</span>${content}</div>`; }
function choices(name, options, selected, radio=false) { return `<div class="choice-grid">${options.map((o,i) => `<label class="choice"><input type="${radio ? "radio" : "checkbox"}" name="${name}" ${o === selected || (!radio && i===0) ? "checked" : ""}><span>${o}</span></label>`).join("")}</div>`; }
function photos(title, count=0) { return `<div class="question-block"><span class="question-title">${title}</span><div class="photos-grid">${Array.from({length:count},(_,i)=>`<div class="photo-tile sample"><span>Photo ${i+1}</span></div>`).join("")}<button class="photo-tile add-photo"><div><b style="font-size:22px">＋</b><br>Add photo</div></button><button class="photo-tile add-photo"><div>${icons.camera}<br>Open camera</div></button></div></div>`; }

function roomSection(section) { return `<section class="card question-section"><h2>${section}</h2><p>Complete the condition assessment and attach supporting photos.</p>
  ${question("Overall condition", choices("condition",["Good","Fair","Poor","Damaged","N/A"],"Fair",true))}
  ${question("Elements inspected", choices("elements",["Door","Window","Floor","Walls","Ceiling","Lights","Switches","Power Points"],"Door",false))}
  ${question("Damage observed", choices("damage",["None","Cracking","Moisture Damage","Corrosion","Poor Operation","Other"],"Moisture Damage",false) + `<button class="add-option" data-add-option="${section} defects">＋ Add tick box</button>`)}
  <div class="field"><label>Inspector comments</label><textarea class="textarea">Minor moisture staining noted to the lower wall lining. Further investigation by a qualified tradesperson is recommended.</textarea></div>
  ${photos(`${section} photos`,2)}
  </section>`; }

function defectSection(section) { const major = section === "Major Defects"; return `<section class="card question-section"><h2>${section}</h2><p>${major ? "Record significant defects requiring urgent rectification or specialist advice." : "Record maintenance items and defects of lesser magnitude."}</p>
  ${question("Defect category", choices("category",major ? ["Structural Movement","Cracking","Deformation / Sagging","Moisture Source","Safety Hazard","Other"] : ["External Walls","Roof","Drainage","Wet Areas","Cabinetry","Doors","Floor Coverings","Other"],major ? "Cracking" : "Wet Areas",false))}
  <div class="form-grid"><div class="field"><label>Location</label><input class="input" value="Bathroom / southern wall"></div><div class="field"><label>Severity</label><select class="select"><option>Minor</option><option selected>Moderate</option><option>Major</option></select></div></div>
  ${major ? question("Engineering inspection required", choices("engineer",["Yes","No"],"No",true)) : ""}
  <div class="field"><label>Comments and recommendation</label><textarea class="textarea">Visible cracking and moisture-related deterioration observed. Recommend further assessment and repair by a suitably qualified contractor.</textarea></div>
  ${photos("Defect evidence",2)}
  </section>`; }

function pestSection(section) { return `<section class="card question-section"><h2>${section}</h2><p>Timber pest assessment based on accessible areas at the time of inspection.</p>
  ${question("Evidence found", choices("evidence",["Yes","No","Unable to determine"],"No",true))}
  ${question("Inspection methods", choices("method",["Visual Inspection","Sounding","Probing","Moisture Meter","Thermal Imaging"],"Visual Inspection",false))}
  <div class="field"><label>Location and observations</label><textarea class="textarea">No visible evidence was found in the readily accessible areas at the time of inspection.</textarea></div>
  ${question("Risk level", choices("pestrisk",["Low","Moderate","Moderate to High","High","Extreme"],"High",true))}
  ${photos("Supporting evidence",1)}
  </section>`; }

function genericSection(section, type) { return `<section class="card question-section"><h2>${section}</h2><p>${type} assessment checklist.</p>
  ${question("Condition", choices("generic",["Good","Fair","Poor","Not Inspected","N/A"],"Fair",true))}
  ${question("Items observed", choices("observed",["No visible defect","Cracking","Moisture","Corrosion","Damage","Access restricted"],"No visible defect",false) + `<button class="add-option" data-add-option="${section}">＋ Add tick box</button>`)}
  <div class="field"><label>Comments</label><textarea class="textarea" placeholder="Add inspection notes"></textarea></div>${photos(`${section} photos`,0)}</section>`; }

function conclusionSection() { return `<section class="card question-section"><h2>Conclusion and recommendations</h2><p>Ratings automatically generate the report conclusion.</p>
  ${question("Overall building condition", choices("overall",["Well Above Average","Above Average","Average","Below Average","Well Below Average"],"Average",true))}
  ${question("Major defects rating", choices("majorRating",["Low","Below Average","Average","Above Average","High"],"Average",true))}
  <div style="padding:17px;border-left:4px solid var(--gold);border-radius:8px;background:var(--gold-light);font-size:13px;line-height:1.6"><strong>Auto-generated conclusion</strong><br>Following inspection of the readily accessible areas, the overall condition of the building relative to similar buildings of approximately the same age was considered to be <b>AVERAGE</b>. A number of minor defects and maintenance items may be present.</div>
  <div class="field" style="margin-top:20px"><label>Manual recommendations</label><textarea class="textarea">Licensed plumber recommended. Drainage improvements recommended.</textarea></div></section>`; }

function declarationSection() { return `<section class="card question-section"><h2>Inspector declaration</h2><p>Confirm the inspection details before completing the report.</p><div class="form-grid"><div class="field"><label>Inspector name</label><input class="input" value="Afshin Nazari"></div><div class="field"><label>Licence number</label><input class="input" placeholder="Enter licence number"></div><div class="field"><label>Inspection date</label><input class="input" type="date" value="2026-06-15"></div><div class="field"><label>Report status</label><select class="select"><option>Ready for Review</option><option>Complete</option></select></div><div class="span-2 logo-upload"><div style="text-align:center"><b style="display:block;color:var(--navy);font-family:cursive;font-size:25px">Afshin Nazari</b>Inspector signature on file</div></div></div><label class="check-inline"><input type="checkbox" checked> I confirm this report accurately reflects the inspection completed.</label></section>`; }

function reportView() {
  const job = state.selectedJob || state.jobs[0];
  return `<div class="content"><div class="report-wrap"><div class="report-toolbar"><button class="btn btn-outline" data-route="inspection">← Back to inspection</button><div class="page-actions"><button class="btn btn-outline" id="emailReport">✉ Email</button><button class="btn btn-primary" id="printReport">${icons.pdf} Generate PDF</button></div></div><article class="report-paper">
    <section class="report-cover">${brand()}<div><p class="eyebrow">Pre-purchase residential</p><h1>${job.type} Report</h1><div class="address">${job.address}</div></div><div class="cover-meta"><div><small>Prepared for</small><strong>${job.client}</strong></div><div><small>Inspection date</small><strong>${job.date}</strong></div><div><small>Report number</small><strong>${job.id}</strong></div></div></section>
    <section class="report-section"><h2>Inspection summary</h2><div class="report-summary-grid"><div class="report-metric"><small>Overall condition</small><strong>Average</strong></div><div class="report-metric"><small>Undetected damage risk</small><strong>Moderate</strong></div><div class="report-metric"><small>Major defects</small><strong>1 item</strong></div></div></section>
    <section class="report-section"><h2>Significant findings</h2>${finding("Moisture damage","Bathroom / southern wall","Further investigation by a licensed waterproofing contractor is recommended.","Moderate")}${finding("Surface drainage","Eastern side of dwelling","Improve surface falls and redirect discharge away from the building.","Attention")}${finding("Roof covering","General roof areas","Weathering consistent with the age of the dwelling. Monitor and maintain.","Minor")}</section>
    <section class="report-section"><h2>Inspection photos</h2><div class="photos-grid">${Array.from({length:6},(_,i)=>`<div class="photo-tile sample"><span>Inspection photo ${i+1}</span></div>`).join("")}</div></section>
    <section class="report-section"><h2>Conclusion</h2><p style="color:var(--muted);line-height:1.75">Following the inspection of the readily accessible areas of the property, the overall condition of the building relative to similar buildings of approximately the same age that have been reasonably maintained was considered to be <b style="color:var(--ink)">AVERAGE</b>.</p><p style="color:var(--muted);line-height:1.75">This preview demonstrates the proposed report hierarchy. Final legal wording, standards references, exclusions and terms will be loaded only after client approval.</p></section>
  </article></div></div>`;
}
function finding(title, location, text, severity) { return `<div class="finding"><span class="finding-dot"></span><div><h3>${title} · ${location}</h3><p>${text}</p></div><span class="badge badge-progress">${severity}</span></div>`; }

function reportsView() { const complete=state.jobs.filter(j=>j.status === "Completed" || j.status === "Ready for Review"); return `<div class="content"><div class="page-head"><div><h1>Reports</h1><p>Review, download, email, and reopen completed inspections.</p></div></div><section class="card jobs-table"><div class="table-head"><span>Report</span><span>Client / property</span><span>Inspection</span><span>Date</span><span>Status</span><span></span></div>${complete.map(tableJob).join("")}</section></div>`; }
function recycleView() { return `<div class="content"><div class="page-head"><div><h1>Recycle bin</h1><p>Deleted jobs are retained for 30 days before permanent removal.</p></div></div><section class="card empty-state"><div class="empty-icon">♲</div><h2>Your recycle bin is empty</h2><p>Deleted jobs will appear here with options to restore or permanently delete them.</p></section></div>`; }
function settingsView() { return `<div class="content"><div class="page-head"><div><h1>Settings</h1><p>Manage your company, inspectors, report branding, and preferences.</p></div><button class="btn btn-primary" id="saveSettings">Save changes</button></div><div class="settings-grid"><nav class="card settings-menu"><button class="active">Company profile</button><button>Inspector profiles</button><button>Employees</button><button>PDF preferences</button><button>Client agreement</button><button>Security</button></nav><section class="card settings-content"><h2>Company profile</h2><div class="logo-upload"><div style="text-align:center"><div class="brand-icon" style="margin:0 auto 8px">S</div>Company logo · Select to replace</div></div><div class="form-grid"><div class="field"><label>Company name</label><input class="input" value="SITESCOP"></div><div class="field"><label>Business email</label><input class="input" value="info@sitescop.com.au"></div><div class="field"><label>Phone</label><input class="input" value="0400 000 000"></div><div class="field"><label>Website</label><input class="input" value="https://sitescop.com.au"></div><div class="field span-2"><label>Business address</label><input class="input" value="Sydney, New South Wales"></div></div></section></div></div>`; }

function bindLogin() {
  document.getElementById("loginForm").addEventListener("submit", e => { e.preventDefault(); state.role = document.getElementById("loginRole").value; state.loggedIn = true; render(); showToast(`Signed in as ${state.role}`); });
  document.getElementById("showPassword").addEventListener("click", () => { const p=document.getElementById("password"); p.type=p.type === "password" ? "text" : "password"; });
}

function bindGlobal() {
  document.querySelectorAll("[data-route]").forEach(el => el.addEventListener("click", () => { const route=el.dataset.route; if (route === "help") return showToast("Support centre will open here"); state.route=route; render(); window.scrollTo(0,0); }));
  document.querySelectorAll(".open-job").forEach(el => el.addEventListener("click", () => { state.selectedJob=state.jobs.find(j=>j.id===el.dataset.job); state.inspectionSection="Property"; state.route = state.selectedJob.status === "Completed" || state.selectedJob.status === "Ready for Review" ? "report" : "inspection"; render(); window.scrollTo(0,0); }));
  document.querySelectorAll(".delete-job").forEach(el => el.addEventListener("click", () => confirmDelete(el.dataset.job)));
}

function bindPage() {
  if (state.route === "jobs") {
    document.querySelectorAll("[data-filter]").forEach(x => x.addEventListener("click",()=>{state.jobFilter=x.dataset.filter;render();}));
    document.getElementById("jobSearch")?.addEventListener("input",e=>{state.search=e.target.value; clearTimeout(window.searchTimer);window.searchTimer=setTimeout(render,180);});
  }
  if (state.route === "newJob") {
    document.getElementById("prevStep").addEventListener("click",()=>{if(state.newJobStep>1){state.newJobStep--;render();}});
    document.getElementById("nextStep").addEventListener("click",()=>{if(state.newJobStep<4){state.newJobStep++;render();}else{const job={id:"SC-1049",client:"Daniel Thompson",address:"61 Parkview Drive, Campbelltown NSW",type:state.inspectionType,date:"16 Jun 2026",time:"9:00 AM",status:"In Progress",progress:12,inspector:"Afshin Nazari"};state.jobs.unshift(job);state.selectedJob=job;state.inspectionSection="Property";state.route="inspection";render();showToast("Job SC-1049 created and assigned");}});
    document.querySelectorAll("[data-type]").forEach(x=>x.addEventListener("click",()=>{state.inspectionType=x.dataset.type;render();}));
  }
  if (state.route === "inspection") {
    document.querySelectorAll("[data-section]").forEach(x=>x.addEventListener("click",()=>{state.inspectionSection=x.dataset.section;render();window.scrollTo(0,0);}));
    document.querySelectorAll("[data-add-option]").forEach(x=>x.addEventListener("click",()=>addOption(x.dataset.addOption)));
    document.querySelectorAll(".add-photo").forEach(x=>x.addEventListener("click",()=>showToast("Camera and photo library open here")));
    document.getElementById("saveDraft")?.addEventListener("click",()=>showToast("Draft saved securely on this device"));
    const sections=(state.selectedJob?.type === "Pest & Timber" ? pestSections : buildingSections), idx=sections.indexOf(state.inspectionSection);
    document.getElementById("nextSection")?.addEventListener("click",()=>{if(idx<sections.length-1){state.inspectionSection=sections[idx+1];render();window.scrollTo(0,0);}else{state.route="report";render();}});
    document.getElementById("previousSection")?.addEventListener("click",()=>{if(idx>0){state.inspectionSection=sections[idx-1];render();window.scrollTo(0,0);}});
  }
  document.getElementById("printReport")?.addEventListener("click",()=>{showToast("PDF report prepared for download");setTimeout(()=>window.print(),500);});
  document.getElementById("emailReport")?.addEventListener("click",()=>showToast("Email report dialog will open here"));
  document.getElementById("saveSettings")?.addEventListener("click",()=>showToast("Company settings saved"));
}

function addOption(category) {
  const root=document.getElementById("modalRoot");
  root.innerHTML=`<div class="modal-backdrop"><div class="modal"><h2>Add reusable option</h2><p>This option will be available as an unchecked tick box on future inspections.</p><div class="field"><label>${category}</label><input id="newOptionInput" class="input" placeholder="Enter option label" autofocus></div><div class="modal-actions"><button class="btn btn-outline" id="cancelModal">Cancel</button><button class="btn btn-primary" id="confirmOption">Add option</button></div></div></div>`;
  document.getElementById("cancelModal").onclick=()=>root.innerHTML="";
  document.getElementById("confirmOption").onclick=()=>{const value=document.getElementById("newOptionInput").value.trim();if(value){state.customOptions.push(value);localStorage.setItem("sitescop-options",JSON.stringify(state.customOptions));root.innerHTML="";render();showToast(`“${value}” saved for future inspections`);}};
  setTimeout(()=>document.getElementById("newOptionInput")?.focus(),0);
}

function confirmDelete(jobId) {
  const job=state.jobs.find(j=>j.id===jobId), root=document.getElementById("modalRoot");
  root.innerHTML=`<div class="modal-backdrop"><div class="modal"><h2>Move job to recycle bin?</h2><p><b>${job.id} · ${job.client}</b><br>This job will be retained for 30 days and can be restored. Permanent deletion will require a second confirmation.</p><div class="modal-actions"><button class="btn btn-outline" id="cancelDelete">Cancel</button><button class="btn btn-danger" id="confirmDelete">Move to recycle bin</button></div></div></div>`;
  document.getElementById("cancelDelete").onclick=()=>root.innerHTML="";
  document.getElementById("confirmDelete").onclick=()=>{state.jobs=state.jobs.filter(j=>j.id!==jobId);root.innerHTML="";render();showToast(`${jobId} moved to recycle bin`);};
}

function showToast(message) { const toast=document.getElementById("toast"); if(!toast)return; toast.textContent=message;toast.classList.add("show");clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>toast.classList.remove("show"),2600); }

render();
