
// CareerTrack frontend demo.
// Data is stored in this browser's Local Storage.

const KEY = "careertrack_frontend_v1";
const ADMIN_KEY = "careertrack_demo_admin";

// SAMPLE JOB DATA

const initialJobs = [
  {
    id: "j1",
    title: "Frontend Developer Intern",
    company: "PixelForge",
    location: "Remote",
    employmentType: "Internship",
    experienceLevel: "Fresher",
    salary: "NPR 15,000–25,000 / month",
    description: "Work with our product team to build responsive interfaces and improve user experience. You will collaborate with designers and developers on real product features.",
    requirements: "HTML, CSS, JavaScript basics. Familiarity with Git is a plus.",
    createdAt: new Date().toISOString(),
    active: true
  },
  {
    id: "j2",
    title: "Junior Java Developer",
    company: "CloudNova",
    location: "Kathmandu, Nepal",
    employmentType: "Full-time",
    experienceLevel: "Entry-level",
    salary: "NPR 35,000–55,000 / month",
    description: "Join our engineering team to build and maintain backend services. Learn from experienced developers and contribute to reliable applications.",
    requirements: "Core Java, OOP concepts, SQL fundamentals and problem-solving skills.",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    active: true
  },
  {
    id: "j3",
    title: "UI/UX Design Intern",
    company: "Northstar Studio",
    location: "Pokhara, Nepal",
    employmentType: "Internship",
    experienceLevel: "Fresher",
    salary: "Negotiable",
    description: "Support the design team with wireframes, prototypes and polished interface designs for web and mobile products.",
    requirements: "Interest in user-centered design. Figma knowledge is helpful.",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    active: true
  },
  {
    id: "j4",
    title: "React Developer",
    company: "BrightStack",
    location: "Hybrid · Lalitpur",
    employmentType: "Full-time",
    experienceLevel: "1-3 years",
    salary: "NPR 60,000–90,000 / month",
    description: "Develop accessible, maintainable React interfaces and work closely with API engineers to deliver product improvements.",
    requirements: "React, JavaScript, HTML, CSS and REST API knowledge.",
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    active: true
  }
];

// LOAD AND SAVE DATA

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {
      jobs: initialJobs,
      applications: []
    };
  } catch {
    return {
      jobs: initialJobs,
      applications: []
    };
  }
}

function save() {
  localStorage.setItem(KEY, JSON.stringify(db));
}

// GLOBAL VARIABLES

let db = load();
let page = "home";
let selectedJob = null;
let adminTab = "dashboard";
let editingId = null;
let notice = "";

const app = document.getElementById("app");

// HELPER FUNCTIONS

const esc = s =>
  String(s ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));

const fmt = d => new Date(d).toLocaleDateString();

function go(p, id = null) {
  page = p;
  selectedJob = id;
  notice = "";
  render();
  window.scrollTo(0, 0);
}

// NAVIGATION

document.addEventListener("click", e => {
  const link = e.target.closest("[data-page]");

  if (link) {
    e.preventDefault();
    go(link.dataset.page);
  }
});

function headerNotice() {
  return notice
    ? `<p class="success">${esc(notice)}</p>`
    : "";
}

// HOME PAGE

function home() {
  const jobs = db.jobs.filter(j => j.active);

  return `
    <section class="hero">
      <small class="eyebrow">
        YOUR NEXT CHAPTER STARTS HERE
      </small>

      <h1>
        Find work that<br>
        <span>moves you forward.</span>
      </h1>

      <p>
        Discover opportunities, explore companies,
        and take the next step in your career.
      </p>
    </section>

    <section class="wrap">

      <div class="section-head">
        <div>
          <small class="eyebrow">OPPORTUNITIES FOR YOU</small>
          <h2>Explore open positions</h2>
        </div>

        <span class="count">
          ${jobs.length} open jobs
        </span>
      </div>

      <div class="filters">

        <input
          id="search"
          placeholder="Search title, company or location..."
          oninput="filterJobs()"
        >

        <select id="type" onchange="filterJobs()">
          <option value="">All employment types</option>
          ${["Full-time", "Part-time", "Internship", "Contract", "Remote"]
            .map(x => `<option>${x}</option>`).join("")}
        </select>

        <select id="level" onchange="filterJobs()">
          <option value="">All experience levels</option>
          ${["Entry-level", "Fresher", "1-3 years", "3-5 years", "5+ years"]
            .map(x => `<option>${x}</option>`).join("")}
        </select>

        <select id="sort" onchange="filterJobs()">
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="title">Title A–Z</option>
        </select>

      </div>

      <div id="job-results">
        ${jobCards(jobs)}
      </div>

    </section>
  `;
}

// DISPLAY JOB CARDS

function jobCards(jobs) {

  if (!jobs.length) {
    return `
      <div class="empty">
        <h3>No jobs found</h3>
        <p>Try changing your search or filters.</p>
      </div>
    `;
  }

  return `
    <div class="grid">

      ${jobs.map(j => `
        <article class="job">

          <div class="jobtop">
            <b>${esc(j.company)}</b>
            <small>${fmt(j.createdAt)}</small>
          </div>

          <h3>${esc(j.title)}</h3>

          <p class="meta">
            ⌖ ${esc(j.location)} ·
            ${esc(j.employmentType)} ·
            ${esc(j.experienceLevel)}
          </p>

          <p class="desc">
            ${esc(j.description)}
          </p>

          <div class="jobbottom">
            <b>${esc(j.salary || "Salary not disclosed")}</b>

            <button
              class="btn"
              onclick="go('detail','${j.id}')"
            >
              View details →
            </button>
          </div>

        </article>
      `).join("")}

    </div>
  `;
}

// SEARCH, FILTER AND SORT

window.filterJobs = () => {

  const q = document.getElementById("search").value.toLowerCase();
  const t = document.getElementById("type").value;
  const l = document.getElementById("level").value;
  const s = document.getElementById("sort").value;

  let a = db.jobs.filter(j =>
    j.active &&
    (!t || j.employmentType === t) &&
    (!l || j.experienceLevel === l) &&
    [j.title, j.company, j.location]
      .some(v => v.toLowerCase().includes(q))
  );

  a.sort(
    s === "oldest"
      ? (x, y) => new Date(x.createdAt) - new Date(y.createdAt)
      : s === "title"
        ? (x, y) => x.title.localeCompare(y.title)
        : (x, y) => new Date(y.createdAt) - new Date(x.createdAt)
  );

  document.getElementById("job-results").innerHTML =
    jobCards(a);
};

// JOB DETAILS PAGE

function detail() {

  const j = db.jobs.find(
    x => x.id === selectedJob && x.active
  );

  if (!j) {
    return `
      <section class="wrap">
        <div class="empty">
          This job is not available.
          <button class="btn" onclick="go('home')">
            Back to jobs
          </button>
        </div>
      </section>
    `;
  }

  return `
    <section class="wrap detail">

      <button class="btn secondary" onclick="go('home')">
        ← Back to jobs
      </button>

      <p class="eyebrow">${esc(j.company)}</p>

      <h1>${esc(j.title)}</h1>

      <p class="meta">
        ${esc(j.location)} ·
        ${esc(j.employmentType)} ·
        ${esc(j.experienceLevel)}
      </p>

      <b>${esc(j.salary)}</b>

      <h3>Job description</h3>

      <p class="long">${esc(j.description)}</p>

      <h3>Requirements</h3>

      <p class="long">
        ${esc(j.requirements || "Please contact the employer for details.")}
      </p>

      <button
        class="btn"
        onclick="go('apply','${j.id}')"
      >
        Apply for this job
      </button>

      <p class="hint">
        No applicant account or résumé upload required.
      </p>

    </section>
  `;
}

// APPLICATION FORM

function apply() {

  const j = db.jobs.find(
    x => x.id === selectedJob && x.active
  );

  if (!j) {
    return `<section class="wrap">Job unavailable.</section>`;
  }

  return `
    <section class="wrap narrow">

      <button
        class="btn secondary"
        onclick="go('detail','${j.id}')"
      >
        ← Back to job
      </button>

      <h1 class="page-title">
        Apply to ${esc(j.company)}
      </h1>

      <p>${esc(j.title)}</p>

      ${headerNotice()}

      <form
        class="panel formgrid"
        onsubmit="submitApplication(event,'${j.id}')"
      >

        <label>
          Full name *
          <input name="name" required minlength="2" maxlength="100">
        </label>

        <label>
          Email address *
          <input name="email" type="email" required>
        </label>

        <label>
          Phone number *
          <input name="phone" required minlength="7">
        </label>

        <label>
          Qualifications *
          <input name="qualification" required>
        </label>

        <label class="wide">
          Experience *
          <input
            name="experience"
            placeholder="e.g. Fresher / 1 year"
            required
          >
        </label>

        <label class="wide">
          Cover letter *
          <textarea
            name="coverLetter"
            rows="6"
            minlength="10"
            required
          ></textarea>
        </label>

        <p class="hint wide">
          Résumé upload is not required for this project.
        </p>

        <button class="btn">
          Submit application
        </button>

      </form>
    </section>
  `;
}

// SUBMIT APPLICATION

window.submitApplication = (e, id) => {

  e.preventDefault();

  const f = new FormData(e.target);
  const a = Object.fromEntries(f.entries());

  a.id = "a" + Date.now();
  a.jobId = id;
  a.status = "Pending";
  a.createdAt = new Date().toISOString();

  db.applications.unshift(a);

  save();

  notice = "Your application was submitted successfully.";

  go("home");
};

// ADMIN LOGIN PAGE

function login() {

  return `
    <section class="wrap narrow">

      <form class="panel" onsubmit="loginAdmin(event)">

        <p class="eyebrow">RESTRICTED AREA</p>

        <h1>Admin login</h1>

        <p class="hint">
          Demo credentials:
          admin@careertrack.com / admin123
        </p>

        <label>
          Email
          <input
            name="email"
            type="email"
            value="admin@careertrack.com"
            required
          >
        </label>

        <label>
          Password
          <input
            name="password"
            type="password"
            value="admin123"
            required
          >
        </label>

        <p id="login-error" class="error" hidden>
          Incorrect demo credentials.
        </p>

        <button class="btn">Sign in</button>

      </form>

    </section>
  `;
}

// ADMIN LOGIN CHECK

window.loginAdmin = e => {

  e.preventDefault();

  const f = new FormData(e.target);

  if (
    f.get("email") === "admin@careertrack.com" &&
    f.get("password") === "admin123"
  ) {

    localStorage.setItem(ADMIN_KEY, "yes");
    go("admin");

  } else {

    document.getElementById("login-error").hidden = false;

  }
};

// ADMIN DASHBOARD

function admin() {

  if (localStorage.getItem(ADMIN_KEY) !== "yes") {
    return login();
  }

  return `
    <section class="wrap admin-layout">

      <aside class="sidebar">

        <b>CAREERTRACK ADMIN</b>

        <button
          class="${adminTab === "dashboard" ? "active" : ""}"
          onclick="adminTab='dashboard';render()"
        >
          ▦ Dashboard
        </button>

        <button
          class="${adminTab === "jobs" ? "active" : ""}"
          onclick="adminTab='jobs';render()"
        >
          ▣ Job postings
        </button>

        <button
          class="${adminTab === "applications" ? "active" : ""}"
          onclick="adminTab='applications';render()"
        >
          ♙ Applications
        </button>

        <button
          onclick="localStorage.removeItem('${ADMIN_KEY}');go('admin')"
        >
          ↪ Logout
        </button>

      </aside>

      <div class="admin-content">
        ${adminContent()}
      </div>

    </section>
  `;
}

// ADMIN PAGE CONTENT

function adminContent() {

  if (adminTab === "dashboard") {

    return `
      <h1 class="page-title">Dashboard</h1>

      <div class="stats">

        <div class="stat">
          <small>Total jobs</small>
          <strong>${db.jobs.length}</strong>
        </div>

        <div class="stat">
          <small>Active jobs</small>
          <strong>${db.jobs.filter(j => j.active).length}</strong>
        </div>

        <div class="stat">
          <small>Applications</small>
          <strong>${db.applications.length}</strong>
        </div>

      </div>

      <div class="panel">
        <h3>Welcome to CareerTrack</h3>

        <p class="hint">
          Manage job posts and review applications
          from this panel. Changes are saved in this browser.
        </p>
      </div>
    `;
  }

  if (adminTab === "jobs") {
    return jobAdmin();
  }

  if (adminTab === "applications") {
    return applicationsAdmin();
  }

  return jobForm();
}

// ADMIN JOB LIST

function jobAdmin() {

  return `
    <div class="row">

      <h1 class="page-title">Job postings</h1>

      <button
        class="btn"
        onclick="editingId=null;adminTab='form';render()"
      >
        ＋ Add job
      </button>

    </div>

    <div class="panel table-wrap">

      <table class="table">

        <thead>
          <tr>
            <th>Position</th>
            <th>Location</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>

          ${db.jobs.map(j => `
            <tr>

              <td>
                <b>${esc(j.title)}</b>
                <br>
                <small>${esc(j.company)}</small>
              </td>

              <td>${esc(j.location)}</td>

              <td>
                <span class="badge">
                  ${j.active ? "Active" : "Inactive"}
                </span>
              </td>

              <td>

                <button
                  class="btn secondary"
                  onclick="editingId='${j.id}';adminTab='form';render()"
                >
                  Edit
                </button>

                <button
                  class="btn secondary"
                  onclick="toggleJob('${j.id}')"
                >
                  ${j.active ? "Hide" : "Publish"}
                </button>

                <button
                  class="btn danger"
                  onclick="deleteJob('${j.id}')"
                >
                  Delete
                </button>

              </td>

            </tr>
          `).join("")}

        </tbody>

      </table>

    </div>
  `;
}

// ADD OR EDIT JOB FORM

function jobForm() {

  const j = db.jobs.find(x => x.id === editingId) || {
    title: "",
    company: "",
    location: "",
    employmentType: "Full-time",
    experienceLevel: "Fresher",
    salary: "",
    description: "",
    requirements: "",
    active: true
  };

  return `
    <h1 class="page-title">
      ${editingId ? "Edit job" : "Create job"}
    </h1>

    <form class="panel formgrid" onsubmit="saveJob(event)">

      <label>
        Job title *
        <input name="title" required value="${esc(j.title)}">
      </label>

      <label>
        Company *
        <input name="company" required value="${esc(j.company)}">
      </label>

      <label>
        Location *
        <input name="location" required value="${esc(j.location)}">
      </label>

      <label>
        Salary range
        <input name="salary" value="${esc(j.salary)}">
      </label>

      <label>
        Employment type

        <select name="employmentType">
          ${["Full-time", "Part-time", "Internship", "Contract", "Remote"]
            .map(x => `
              <option ${j.employmentType === x ? "selected" : ""}>
                ${x}
              </option>
            `).join("")}
        </select>
      </label>

      <label>
        Experience level

        <select name="experienceLevel">
          ${["Entry-level", "Fresher", "1-3 years", "3-5 years", "5+ years"]
            .map(x => `
              <option ${j.experienceLevel === x ? "selected" : ""}>
                ${x}
              </option>
            `).join("")}
        </select>
      </label>

      <label class="wide">
        Job description *
        <textarea name="description" rows="5" required>${esc(j.description)}</textarea>
      </label>

      <label class="wide">
        Requirements
        <textarea name="requirements" rows="3">${esc(j.requirements)}</textarea>
      </label>

      <label class="wide">
        <span>
          <input
            style="width:auto"
            type="checkbox"
            name="active"
            ${j.active ? "checked" : ""}
          >
          Publish this job
        </span>
      </label>

      <button class="btn">Save job</button>

      <button
        type="button"
        class="btn secondary"
        onclick="adminTab='jobs';render()"
      >
        Cancel
      </button>

    </form>
  `;
}

// SAVE JOB

window.saveJob = e => {

  e.preventDefault();

  const f = new FormData(e.target);

  const j = {
    id: editingId || "j" + Date.now(),
    title: f.get("title").trim(),
    company: f.get("company").trim(),
    location: f.get("location").trim(),
    salary: f.get("salary").trim(),
    employmentType: f.get("employmentType"),
    experienceLevel: f.get("experienceLevel"),
    description: f.get("description").trim(),
    requirements: f.get("requirements").trim(),
    active: f.get("active") === "on",
    createdAt: new Date().toISOString()
  };

  if (editingId) {

    const i = db.jobs.findIndex(x => x.id === editingId);
    db.jobs[i] = j;

  } else {

    db.jobs.unshift(j);

  }

  save();

  editingId = null;
  adminTab = "jobs";

  render();
};

// PUBLISH OR HIDE JOB

window.toggleJob = id => {

  const j = db.jobs.find(x => x.id === id);

  j.active = !j.active;

  save();
  render();
};

// DELETE JOB

window.deleteJob = id => {

  if (
    confirm("Delete this job posting? Applications already received will remain.")
  ) {

    db.jobs = db.jobs.filter(x => x.id !== id);

    save();
    render();

  }
};

// VIEW APPLICATIONS

function applicationsAdmin() {

  return `
    <h1 class="page-title">Applications</h1>

    ${
      db.applications.length
        ? `
          <div class="cards">

            ${db.applications.map(a => {

              const j = db.jobs.find(x => x.id === a.jobId);

              return `
                <article class="panel application">

                  <h3>${esc(a.name)}</h3>

                  <p>
                    ${esc(a.email)} · ${esc(a.phone)}
                  </p>

                  <b>
                    ${esc(j?.title || "Job removed")} —
                    ${esc(j?.company || "")}
                  </b>

                  <p>
                    Qualification: ${esc(a.qualification)}
                  </p>

                  <p>
                    Experience: ${esc(a.experience)}
                  </p>

                  <p class="long">
                    ${esc(a.coverLetter)}
                  </p>

                  <label>
                    Status

                    <select onchange="updateStatus('${a.id}',this.value)">

                      ${["Pending", "Shortlisted", "Interview", "Selected", "Rejected"]
                        .map(s => `
                          <option ${a.status === s ? "selected" : ""}>
                            ${s}
                          </option>
                        `).join("")}

                    </select>
                  </label>

                  <small class="hint">
                    Received ${fmt(a.createdAt)}
                  </small>

                </article>
              `;

            }).join("")}

          </div>
        `
        : `
          <div class="empty">
            <h3>No applications yet</h3>
            <p>Submitted applications will appear here.</p>
          </div>
        `
    }
  `;
}

// UPDATE APPLICATION STATUS

window.updateStatus = (id, status) => {

  const a = db.applications.find(x => x.id === id);

  a.status = status;

  save();
};

// RENDER WEBSITE

function render() {

  db = load();

  if (page === "home") {
    app.innerHTML = home();

  } else if (page === "detail") {
    app.innerHTML = detail();

  } else if (page === "apply") {
    app.innerHTML = apply();

  } else {
    app.innerHTML = admin();
  }
}

// START APPLICATION

render();
