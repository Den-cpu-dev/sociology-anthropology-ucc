/* ===== main.js - Department of Sociology & Anthropology ===== */

// ==================== UTILITY: Image error fallback ====================
function handleImgError(img, name) {
  var initials = name.split(' ').filter(function(w){ return w.length > 0; }).map(function(w){ return w[0]; }).join('').toUpperCase();
  var placeholder = document.createElement('div');
  placeholder.className = 'faculty-initials';
  placeholder.textContent = initials;
  img.parentNode.replaceChild(placeholder, img);
}

// Smooth image load: fade images in when loaded
function onImgLoad(img) {
  if (img.complete) {
    img.classList.add('loaded');
  } else {
    img.addEventListener('load', function() { img.classList.add('loaded'); });
  }
}

// ==================== UTILITY: Fade-in on scroll ====================
function initScrollReveal() {
  var reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  reveals.forEach(function(el) { observer.observe(el); });
}

// ==================== UTILITY: Add reveal class to sections ====================
function markSectionsForReveal() {
  document.querySelectorAll('section .container > .section-header, section .container > .grid-2, section .container > .grid-3, section .container > .grid-4, section .container > .grid-faculty, .faculty-section, .course-level-card, .card, .scholarship-card, .exec-card, .material-card, .benefit-card, .step-card').forEach(function(el) {
    if (!el.closest('.hero') && !el.closest('.page-hero')) {
      el.classList.add('reveal');
    }
  });
}

// ==================== FACULTY DATA ====================
const facultyData = [
  {
    id: 1, name: "Prof. Georgina Yaa Oduro", title: "Associate Professor", position: "Head of Department",
    rank: "Professor", email: "gyoduro@ucc.edu.gh", image: "assets/faculty/prof-georgina.jpg",
    bio: "Prof. Georgina Yaa Oduro is an Associate Professor and the current Head of the Department of Sociology and Anthropology, University of Cape Coast, Ghana. She is the immediate past Director (2019-2023) of the Centre for Gender Research, Advocacy and Documentation (CEGRAD) of the same university.",
    specializations: ["Adolescence and the Youth", "Gender and the Blue Economy"],
    interests: ["Gender Issues", "Race and Ethnicity", "Sexuality", "Tangible and Intangible Heritage in Ocean Governance", "Youth and Popular Cultures"],
    profileUrl: "https://directory.ucc.edu.gh/p/georgina-yaa-oduro"
  },
  {
    id: 2, name: "Prof. (Mrs.) Henrietta Abane", title: "Associate Professor", position: "Associate Professor",
    rank: "Professor", email: "henrietta.abane@ucc.edu.gh", image: "assets/faculty/prof-henrietta-abane.jpg",
    bio: "Prof. (Mrs.) Henrietta Abane is an Associate Professor in the Department of Sociology and Anthropology with extensive research experience in gender, development, and social issues.",
    specializations: ["Gender Studies", "Development Studies"],
    interests: ["Women and Development", "Gender Equality", "Social Policy"],
    profileUrl: "https://directory.ucc.edu.gh/p/henrietta-abane"
  },
  {
    id: 3, name: "Prof. John Windie Ansah", title: "Associate Professor", position: "Academic Advisor",
    rank: "Professor", email: "john.ansah@ucc.edu.gh", image: "assets/faculty/prof-john-ansah.jpg",
    bio: "Prof. John Windie Ansah is an Associate Professor in the Department of Sociology and Anthropology. He serves as Academic Advisor and is a leading expert in political economy and public policy analysis.",
    specializations: ["Blue Economy", "Coastal Sociology", "Political Economy"],
    interests: ["Political Economy and Public Policy Analysis"],
    profileUrl: "https://directory.ucc.edu.gh/p/john-windie-ansah"
  },
  {
    id: 4, name: "Prof. Daniel Yaw Fiaveh", title: "Associate Professor", position: "Research Coordinator, CEGRAD",
    rank: "Professor", email: "dfiaveh@ucc.edu.gh", image: "assets/faculty/prof-daniel-fiaveh.jpg",
    bio: "Prof. Daniel Yaw Fiaveh is a Ghanaian sociologist-turned-anthropologist and an Associate Professor in studies of men, gender, and sexuality at the University of Cape Coast.",
    specializations: ["Gender Studies", "Masculinity", "Qualitative Research Methodology", "Sex Studies", "Sexuality"],
    interests: ["Anthropology/Sociology of Sex", "Men and Masculinities", "Sex and Culture", "Sexual Health", "Sexuality Education"],
    profileUrl: "https://directory.ucc.edu.gh/p/daniel-yaw-fiaveh"
  },
  {
    id: 5, name: "Prof. William Boateng", title: "Professor", position: "Professor",
    rank: "Professor", email: "william.boateng@ucc.edu.gh", image: "assets/faculty/prof-william-boateng.jpg",
    bio: "Prof. William Boateng is a Professor in the Department of Sociology and Anthropology, specializing in advanced social research methods and quantitative analysis.",
    specializations: ["Social Research Methods", "Quantitative Analysis"],
    interests: ["Survey Research", "Statistical Analysis", "Research Design"],
    profileUrl: "https://directory.ucc.edu.gh/p/william-boateng"
  },
  {
    id: 6, name: "Prof. Alex Somuah Obeng", title: "Associate Professor", position: "Associate Professor",
    rank: "Professor", email: "alex.obeng@ucc.edu.gh", image: "assets/faculty/prof-alex-obeng.jpg",
    bio: "Prof. Alex Somuah Obeng is an Associate Professor in the Department of Sociology and Anthropology, specializing in social theory and contemporary social issues in Ghana and Africa.",
    specializations: ["Social Theory", "African Sociology"],
    interests: ["Social Change", "Contemporary Social Issues"],
    profileUrl: "https://directory.ucc.edu.gh/p/alex-somuah-obeng"
  },
  {
    id: 7, name: "Prof. Eric Koka", title: "Associate Professor", position: "Associate Professor",
    rank: "Professor", email: "eric.koka@ucc.edu.gh", image: "assets/faculty/prof-eric-koka.jpg",
    bio: "Prof. Eric Koka is an Associate Professor in the Department of Sociology and Anthropology with expertise in social research and community development.",
    specializations: ["Social Research", "Community Development"],
    interests: ["Social Development", "Research Methods"],
    profileUrl: "https://directory.ucc.edu.gh/p/eric-koka"
  },
  {
    id: 8, name: "Dr. Razak Jaha Imoro", title: "Senior Lecturer", position: "Senior Lecturer",
    rank: "Senior Lecturer", email: "razak.imoro@ucc.edu.gh", image: "assets/faculty/dr-razak-imoro.jpg",
    bio: "Dr. Razak Jaha Imoro is a Senior Lecturer at the Department of Sociology and Anthropology. His research focuses on conflict management, migration studies, and development issues in Africa.",
    specializations: ["Conflict and Conflict Resolution", "Development Studies", "Migration"],
    interests: ["Conflict Management", "Development", "Environment and Development", "Migration", "Migration Studies"],
    profileUrl: "https://directory.ucc.edu.gh/p/razak-jaha-imoro"
  },
  {
    id: 9, name: "Dr. Edgar Takyi Akonor", title: "Senior Lecturer", position: "Academic Advisor",
    rank: "Senior Lecturer", email: "eakonor@ucc.edu.gh", image: "assets/faculty/dr-edgar-akonor.jpg",
    bio: "Dr. Edgar Takyi Akonor is a Senior Lecturer in the Department of Sociology and Anthropology. He serves as Academic Advisor and specializes in sociology of sport.",
    specializations: ["Sociology of Sport", "Social Institutions"],
    interests: ["Sport and Society", "Social Structures"],
    profileUrl: "https://directory.ucc.edu.gh/p/edgar-takyi-akonor"
  },
  {
    id: 10, name: "Dr. Solomon Sika-Bright", title: "Senior Lecturer", position: "Senior Lecturer",
    rank: "Senior Lecturer", email: "solomon.sika-bright@ucc.edu.gh", image: "assets/faculty/dr-solomon-sika-bright.jpg",
    bio: "Dr. Solomon Sika-Bright is a Senior Lecturer specializing in social demography and sociology of health and medicine.",
    specializations: ["Social Demography", "Sociology of Health and Medicine"],
    interests: ["International Relations", "Social Demography", "Social Deviance and Crime", "Sociological Theory"],
    profileUrl: "https://directory.ucc.edu.gh/p/solomon-sika-bright"
  },
  {
    id: 11, name: "Dr. Brempong Osei-Tutu", title: "Senior Lecturer", position: "Senior Lecturer",
    rank: "Senior Lecturer", email: "brempong.osei-tutu@ucc.edu.gh", image: "assets/faculty/dr-brempong-osei-tutu.jpg",
    bio: "Dr. Brempong Osei-Tutu is a Senior Lecturer in the Department of Sociology and Anthropology with extensive experience in sociological research and teaching.",
    specializations: ["Sociology", "Social Research"],
    interests: ["Social Theory", "Research Methods"],
    profileUrl: "https://directory.ucc.edu.gh/p/brempong-osei-tutu"
  },
  {
    id: 12, name: "Dr. Saibu Mutaru", title: "Senior Lecturer", position: "Senior Lecturer",
    rank: "Senior Lecturer", email: "smutaru@ucc.edu.gh", image: "assets/faculty/dr-saibu-mutaru.jpg",
    bio: "Dr. Saibu Mutaru is a Senior Lecturer in the Department of Sociology and Anthropology. His research interests include medical anthropology, religion, and social change.",
    specializations: ["Medical Anthropology", "Sociology of Religion"],
    interests: ["Medical Anthropology", "Religion", "Social Change"],
    profileUrl: ""
  },
  {
    id: 13, name: "Dr. Micheal Sakyi-Darko", title: "Lecturer", position: "Lecturer",
    rank: "Lecturer", email: "msakyi-darko@ucc.edu.gh", image: "assets/faculty/dr-micheal-sakyi-darko.jpg",
    bio: "Dr. Micheal Sakyi-Darko is a Lecturer in the Department of Sociology and Anthropology, specializing in urban sociology.",
    specializations: ["Urban Sociology", "Development Studies"],
    interests: ["Urbanization", "Social Problems", "Urban Development"],
    profileUrl: "https://directory.ucc.edu.gh/p/michael-sakyi-darko"
  },
  {
    id: 14, name: "Dr. Emmanuel Asante", title: "Lecturer", position: "Lecturer",
    rank: "Lecturer", email: "emmanuel.asante@ucc.edu.gh", image: "assets/faculty/dr-emmanuel-asante.jpg",
    bio: "Dr. Emmanuel Asante is a Lecturer in the Department of Sociology and Anthropology, contributing to teaching and research in various sociological topics.",
    specializations: ["Sociology", "Social Research"],
    interests: ["Social Issues", "African Society"],
    profileUrl: "https://directory.ucc.edu.gh/p/emmanuel-asante"
  },
  {
    id: 15, name: "Dr. Albert Annang", title: "Lecturer", position: "Lecturer",
    rank: "Lecturer", email: "albert.annang@ucc.edu.gh", image: "assets/faculty/dr-albert-annang.jpg",
    bio: "Dr. Albert Annang is a Lecturer in the Department of Sociology and Anthropology, contributing to research and teaching in sociological studies.",
    specializations: ["Sociology", "Social Analysis"],
    interests: ["Social Research", "Social Problems"],
    profileUrl: "https://directory.ucc.edu.gh/p/albert-annang"
  },
  {
    id: 16, name: "Dr. Francis Aning Anokye", title: "Lecturer", position: "Lecturer",
    rank: "Lecturer", email: "francis.anokye@ucc.edu.gh", image: "assets/faculty/dr-francis-anokye.jpg",
    bio: "Dr. Francis Aning Anokye is a Lecturer in the Department of Sociology and Anthropology, engaged in teaching and research across various sociological topics.",
    specializations: ["Sociology", "Social Research"],
    interests: ["Social Issues", "Research Methodology"],
    profileUrl: "https://directory.ucc.edu.gh/p/francis-aning-anokye"
  },
  {
    id: 17, name: "Dr. Daniel Ampem Darko-Asumadu", title: "Lecturer", position: "Lecturer",
    rank: "Lecturer", email: "daniel.darko-asumadu@ucc.edu.gh", image: "assets/faculty/dr-daniel-darko-asumadu.jpg",
    bio: "Dr. Daniel Ampem Darko-Asumadu is a Lecturer in the Department of Sociology and Anthropology, contributing to the academic and research mission of the department.",
    specializations: ["Sociology", "Social Studies"],
    interests: ["Social Research", "Community Studies"],
    profileUrl: "https://directory.ucc.edu.gh/p/daniel-ampem-darko-asumadu"
  },
  {
    id: 18, name: "Dr. Raymond Kwasi Boasinke", title: "Lecturer", position: "Departmental Registration & Exams Officer",
    rank: "Lecturer", email: "raymond.boasinke@ucc.edu.gh", image: "assets/faculty/dr-raymond-boasinke.jpg",
    bio: "Dr. Raymond Kwasi Boasinke is a Lecturer and serves as the Departmental Registration & Exams Officer. His research focuses on sociology of development, gender studies, and social transformation.",
    specializations: ["Sociology of Development", "Gender Studies"],
    interests: ["Development", "Gender Issues", "Social Change"],
    profileUrl: "https://directory.ucc.edu.gh/p/raymond-kwasi-boasinke"
  },
  {
    id: 19, name: "Ms. Dilys Amoabeng", title: "Principal Research Assistant (Teaching Associate)", position: "Teaching Staff",
    rank: "Lecturer", email: "dilys.amoabeng@ucc.edu.gh", image: "assets/faculty/ms-dilys-amoabeng.jpg",
    bio: "Ms. Dilys Amoabeng is a Principal Research Assistant and Teaching Associate in the Department of Sociology and Anthropology, supporting teaching and research activities.",
    specializations: ["Research Support", "Teaching"],
    interests: ["Social Research", "Student Support"],
    profileUrl: "https://directory.ucc.edu.gh/p/dilys-amoabeng"
  },
  {
    id: 20, name: "Non-Teaching Staff Member 1", title: "Administrative Assistant (Placeholder)", position: "Department Office",
    rank: "Non-Teaching Staff", email: "placeholder1@ucc.edu.gh", image: "",
    bio: "Profile details for this non-teaching staff member will be added soon.",
    specializations: ["To be updated"],
    interests: ["To be updated"],
    profileUrl: ""
  },
  {
    id: 21, name: "Non-Teaching Staff Member 2", title: "Accounts/Finance Support (Placeholder)", position: "Department Office",
    rank: "Non-Teaching Staff", email: "placeholder2@ucc.edu.gh", image: "",
    bio: "Profile details for this non-teaching staff member will be added soon.",
    specializations: ["To be updated"],
    interests: ["To be updated"],
    profileUrl: ""
  },
  {
    id: 22, name: "Non-Teaching Staff Member 3", title: "Examinations Support Officer (Placeholder)", position: "Department Office",
    rank: "Non-Teaching Staff", email: "placeholder3@ucc.edu.gh", image: "",
    bio: "Profile details for this non-teaching staff member will be added soon.",
    specializations: ["To be updated"],
    interests: ["To be updated"],
    profileUrl: ""
  },
  {
    id: 23, name: "Non-Teaching Staff Member 4", title: "Records & Registry Assistant (Placeholder)", position: "Department Office",
    rank: "Non-Teaching Staff", email: "placeholder4@ucc.edu.gh", image: "",
    bio: "Profile details for this non-teaching staff member will be added soon.",
    specializations: ["To be updated"],
    interests: ["To be updated"],
    profileUrl: ""
  },
  {
    id: 24, name: "Non-Teaching Staff Member 5", title: "Student Services Assistant (Placeholder)", position: "Department Office",
    rank: "Non-Teaching Staff", email: "placeholder5@ucc.edu.gh", image: "",
    bio: "Profile details for this non-teaching staff member will be added soon.",
    specializations: ["To be updated"],
    interests: ["To be updated"],
    profileUrl: ""
  }
];

// ==================== COURSE DATA ====================
// Course data is loaded from js/courseData.js

// ==================== MOBILE NAV TOGGLE ====================
function toggleMobileNav() {
  const nav = document.getElementById('mobileNav');
  const btn = document.querySelector('.nav-toggle');
  if (nav) {
    nav.classList.toggle('open');
    const expanded = nav.classList.contains('open');
    if (btn) btn.setAttribute('aria-expanded', expanded);
  }
}

// Close mobile nav when clicking a link
document.addEventListener('DOMContentLoaded', function () {
  const mobileLinks = document.querySelectorAll('.mobile-nav a');
  mobileLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      const nav = document.getElementById('mobileNav');
      const btn = document.querySelector('.nav-toggle');
      if (nav) nav.classList.remove('open');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    });
  });
});

// ==================== TAB SWITCHING ====================
document.addEventListener('DOMContentLoaded', function () {
  // Find all tab groups
  document.querySelectorAll('.tabs').forEach(function (tabGroup) {
    // Only get DIRECT child tab-list buttons (not nested tabs' buttons)
    var tabList = tabGroup.querySelector(':scope > .tab-list');
    if (!tabList) return;
    var buttons = tabList.querySelectorAll('.tab-btn');
    var contents = tabGroup.querySelectorAll(':scope > .tab-content');

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = btn.getAttribute('data-tab');

        // Remove active from all buttons in this group only
        buttons.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');

        // Show correct content
        contents.forEach(function (c) {
          if (c.id === 'tab-' + target) {
            c.classList.add('active');
          } else {
            c.classList.remove('active');
          }
        });
      });
    });
  });

  // Handle URL params for academics tabs
  const params = new URLSearchParams(window.location.search);
  const tab = params.get('tab');
  if (tab) {
    const btn = document.querySelector('.tab-btn[data-tab="' + tab + '"]');
    if (btn) btn.click();
  }
});

// ==================== FACULTY HOMEPAGE PREVIEW ====================
document.addEventListener('DOMContentLoaded', function () {
  const preview = document.getElementById('facultyPreview');
  if (!preview) return;

  // Show only first 8 on homepage for speed
  var showCount = 8;
  facultyData.slice(0, showCount).forEach(function (member, idx) {
    var card = document.createElement('div');
    card.className = 'faculty-mini-card reveal';
    card.style.transitionDelay = (idx * 0.05) + 's';

    var imgContainer = document.createElement('div');
    imgContainer.className = 'faculty-mini-img';

    if (member.image) {
      var img = document.createElement('img');
      img.src = member.image;
      img.alt = member.name;
      img.loading = 'lazy';
      img.onerror = function() { handleImgError(this, member.name); };
      onImgLoad(img);
      imgContainer.appendChild(img);
    } else {
      var initials = document.createElement('div');
      initials.className = 'faculty-initials';
      initials.textContent = member.name.split(' ').map(function(n){return n[0];}).join('');
      imgContainer.appendChild(initials);
    }

    var info = document.createElement('div');
    info.className = 'faculty-mini-info';
    info.innerHTML = '<h4>' + member.name + '</h4><p>' + member.title + '</p>' +
      (member.position !== member.title ? '<p class="position">' + member.position + '</p>' : '');

    card.appendChild(imgContainer);
    card.appendChild(info);
    preview.appendChild(card);
  });

  // "View All" link
  if (facultyData.length > showCount) {
    var viewAll = document.createElement('div');
    viewAll.className = 'text-center mt-3';
    viewAll.innerHTML = '<a href="people.html" class="btn btn-outline" style="border-color:var(--primary);color:var(--primary)">View All ' + facultyData.length + ' Faculty &amp; Staff &rarr;</a>';
    preview.parentNode.appendChild(viewAll);
  }
});

// ==================== FACULTY DIRECTORY (people.html) ====================
document.addEventListener('DOMContentLoaded', function () {
  const directory = document.getElementById('facultyDirectory');
  const searchInput = document.getElementById('facultySearch');
  const noResults = document.getElementById('noResults');
  if (!directory) return;

  function renderFaculty(query) {
    query = (query || '').toLowerCase();
    directory.innerHTML = '';

    const filtered = facultyData.filter(function (m) {
      return m.name.toLowerCase().includes(query) ||
        m.title.toLowerCase().includes(query) ||
        m.specializations.some(function (s) { return s.toLowerCase().includes(query); });
    });

    var professors = filtered.filter(function (m) { return m.rank === 'Professor' || m.rank === 'Associate Professor'; });
    var seniorLecturers = filtered.filter(function (m) { return m.rank === 'Senior Lecturer'; });
    var lecturers = filtered.filter(function (m) { return m.rank === 'Lecturer'; });
    var nonTeachingStaff = filtered.filter(function (m) {
      return m.rank === 'Senior Staff' || m.rank === 'Research Staff' || m.rank === 'Non-Teaching Staff' ||
        m.rank === 'Administrative Staff' || m.rank === 'Support Staff';
    });

    var sections = [
      { title: 'Professors', members: professors },
      { title: 'Senior Lecturers', members: seniorLecturers },
      { title: 'Lecturers', members: lecturers },
      { title: 'Non-Teaching Staff', members: nonTeachingStaff }
    ];

    var hasResults = false;

    sections.forEach(function (section) {
      if (section.members.length === 0) return;
      hasResults = true;

      var sectionEl = document.createElement('div');
      sectionEl.className = 'faculty-section';
      sectionEl.innerHTML = '<h3 class="faculty-section-title">' + section.title + '</h3>';

      var grid = document.createElement('div');
      grid.className = 'grid-faculty';

      section.members.forEach(function (member, idx) {
        var card = document.createElement('div');
        card.className = 'faculty-card reveal';
        card.style.transitionDelay = (idx * 0.04) + 's';
        card.onclick = function () { openFacultyModal(member.id); };

        var imgContainer = document.createElement('div');
        imgContainer.className = 'faculty-card-img';

        if (member.image) {
          var img = document.createElement('img');
          img.src = member.image;
          img.alt = member.name;
          img.loading = 'lazy';
          img.onerror = function() { handleImgError(this, member.name); };
          onImgLoad(img);
          imgContainer.appendChild(img);
        } else {
          var initialsEl = document.createElement('div');
          initialsEl.className = 'faculty-initials';
          initialsEl.textContent = member.name.split(' ').map(function(n){return n[0];}).join('');
          imgContainer.appendChild(initialsEl);
        }

        var overlay = document.createElement('div');
        overlay.className = 'faculty-card-overlay';
        overlay.innerHTML = '<span>Click for details</span>';
        imgContainer.appendChild(overlay);

        var info = document.createElement('div');
        info.className = 'faculty-card-info';
        info.innerHTML = '<h4>' + member.name + '</h4><p>' + member.title + '</p>' +
          (member.position !== member.title ? '<p class="position">' + member.position + '</p>' : '');

        card.appendChild(imgContainer);
        card.appendChild(info);
        grid.appendChild(card);
      });

      sectionEl.appendChild(grid);
      directory.appendChild(sectionEl);
    });

    if (noResults) {
      noResults.style.display = hasResults ? 'none' : 'block';
    }
  }

  renderFaculty('');
  // Init reveal for dynamically rendered cards
  initScrollReveal();

  if (searchInput) {
    var debounceTimer;
    searchInput.addEventListener('input', function () {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(function() {
        renderFaculty(searchInput.value);
        initScrollReveal();
      }, 150);
    });
  }
});

// ==================== FACULTY MODAL ====================
function openFacultyModal(id) {
  var member = facultyData.find(function (m) { return m.id === id; });
  if (!member) return;

  var modal = document.getElementById('facultyModal');
  var content = document.getElementById('facultyModalContent');
  if (!modal || !content) return;

  var specsHtml = member.specializations.map(function (s) { return '<span class="badge badge-primary">' + s + '</span>'; }).join('');
  var interestsHtml = member.interests.map(function (i) { return '<span class="badge badge-outline">' + i + '</span>'; }).join('');

  var profileLink = member.profileUrl
    ? '<a href="' + member.profileUrl + '" target="_blank" rel="noopener noreferrer" class="btn btn-outline" style="margin-top:1rem;border-color:var(--primary);color:var(--primary)">&#128279; View UCC Directory Profile</a>'
    : '';

  content.innerHTML =
    '<h2 style="margin-bottom:1rem">' + member.name + '</h2>' +
    '<div class="modal-faculty-grid">' +
    '<div class="modal-faculty-photo" id="modalFacultyPhoto"></div>' +
    '<div class="modal-faculty-details">' +
    '<p class="modal-title">' + member.title + '</p>' +
    (member.position !== member.title ? '<p style="color:var(--muted-fg)">' + member.position + '</p>' : '') +
    '<p style="margin:.5rem 0"><a href="mailto:' + member.email + '" style="color:var(--primary)">&#9993; ' + member.email + '</a></p>' +
    '<h4>Biography</h4><p style="color:var(--muted-fg);line-height:1.7">' + member.bio + '</p>' +
    '<h4>Specializations</h4><div class="badge-group">' + specsHtml + '</div>' +
    '<h4>Research Interests</h4><div class="badge-group">' + interestsHtml + '</div>' +
    profileLink +
    '</div></div>';

  // Populate photo with error handling
  var photoContainer = document.getElementById('modalFacultyPhoto');
  if (member.image) {
    var img = document.createElement('img');
    img.src = member.image;
    img.alt = member.name;
    img.className = 'modal-faculty-img';
    img.onerror = function() {
      var ph = document.createElement('div');
      ph.className = 'modal-faculty-placeholder';
      ph.textContent = member.name.split(' ').map(function(n){return n[0];}).join('');
      photoContainer.innerHTML = '';
      photoContainer.appendChild(ph);
    };
    onImgLoad(img);
    photoContainer.appendChild(img);
  } else {
    var ph = document.createElement('div');
    ph.className = 'modal-faculty-placeholder';
    ph.textContent = member.name.split(' ').map(function(n){return n[0];}).join('');
    photoContainer.appendChild(ph);
  }

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeFacultyModal() {
  var modal = document.getElementById('facultyModal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

// ==================== COURSE MODAL (academics.html) ====================
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.course-item').forEach(function (item) {
    item.addEventListener('click', function () {
      var code = item.getAttribute('data-code');
      openCourseModal(code);
    });
  });
});

function openCourseModal(code) {
  var modal = document.getElementById('courseModal');
  var content = document.getElementById('courseModalContent');
  if (!modal || !content) return;

  var details = courseData[code];

  if (details) {
    var html = '<h2><span style="color:var(--primary)">' + code + '</span>: ' + details.name + '</h2>';
    html += '<div style="display:flex;gap:1rem;flex-wrap:wrap;margin:1rem 0;font-size:.9rem;color:var(--muted-fg)">';
    html += '<span>&#128337; ' + details.credits + ' Credit Hours</span>';
    if (details.lecturer) html += '<span>&#128100; ' + details.lecturer + '</span>';
    html += '</div>';

    // Objectives
    if (details.objectives && details.objectives.length > 0) {
      html += '<h4>Course Objectives</h4><ul style="color:var(--muted-fg);line-height:1.7;padding-left:1.2rem">';
      details.objectives.forEach(function(obj) { html += '<li>' + obj + '</li>'; });
      html += '</ul>';
    }

    // Description
    html += '<h4>Course Description</h4>';
    html += '<p style="color:var(--muted-fg);line-height:1.7">' + details.description + '</p>';

    // Mode of delivery
    html += '<p style="margin-top:.75rem;font-size:.9rem;color:var(--muted-fg)"><strong>Mode of Delivery:</strong> Online lectures, face-to-face, individual and group presentations.</p>';

    // Readings
    if (details.readings && details.readings.length > 0) {
      html += '<h4>Recommended Reading</h4><ul style="color:var(--muted-fg);line-height:1.8;padding-left:1.2rem;font-size:.88rem">';
      details.readings.forEach(function(ref) { html += '<li>' + ref + '</li>'; });
      html += '</ul>';
    }

    content.innerHTML = html;
  } else {
    content.innerHTML =
      '<h2 style="text-align:center">' + code + '</h2>' +
      '<p style="text-align:center;color:var(--muted-fg);margin-top:1rem">Detailed course information will be available soon.</p>';
  }

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCourseModal() {
  var modal = document.getElementById('courseModal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

// Close modals on outside click or Escape
document.addEventListener('click', function (e) {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
    document.body.style.overflow = '';
  }
});
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(function (m) {
      m.classList.remove('open');
    });
    document.body.style.overflow = '';
  }
});

// ==================== CONTACT FORM ====================
document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var btn = form.querySelector('button[type="submit"]');
    var origText = btn.innerHTML;
    btn.innerHTML = 'Sending...';
    btn.disabled = true;

    setTimeout(function () {
      btn.innerHTML = origText;
      btn.disabled = false;
      form.reset();
      showToast('Message Sent!', 'Thank you for your message. We\'ll get back to you soon.');
    }, 1000);
  });
});

// ==================== TOAST NOTIFICATION ====================
function showToast(title, message) {
  var toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = '<strong>' + title + '</strong><p>' + message + '</p>';
  document.body.appendChild(toast);

  requestAnimationFrame(function () {
    toast.classList.add('show');
  });

  setTimeout(function () {
    toast.classList.remove('show');
    setTimeout(function () { toast.remove(); }, 300);
  }, 4000);
}

// ==================== ACTIVE NAV HIGHLIGHTING ====================
document.addEventListener('DOMContentLoaded', function () {
  var page = window.location.pathname.split('/').pop() || 'index.html';
  if (page === '') page = 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-nav a').forEach(function (link) {
    var href = link.getAttribute('href');
    if (href === page) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
});

// ==================== MASTER INIT ====================
document.addEventListener('DOMContentLoaded', function () {
  // Mark static elements for scroll-reveal
  markSectionsForReveal();
  // Boot the observer
  initScrollReveal();

  // Smooth-scroll for all anchor links
  document.querySelectorAll('a[href^="#"]').forEach(function(a) {
    a.addEventListener('click', function(e) {
      var id = this.getAttribute('href').slice(1);
      var target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Add page-loaded class for entrance animation
  document.body.classList.add('loaded');

  // Smooth-load all images on the page
  document.querySelectorAll('.exec-card img, .hero-bg').forEach(function(img) {
    if (img.tagName === 'IMG') onImgLoad(img);
  });
});
