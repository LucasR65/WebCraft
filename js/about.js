/* js/about.js - Version corrigée */

const TEAM = [
  {
    id: 1,
    name: 'Alice Martin',
    role: 'Développeuse Front-end',
    img: '../images/team/placeholder_human.png',
    bio: 'Alice construit des interfaces accessibles et performantes. Passionnée par le design system et React.',
    skills: ['HTML', 'CSS', 'JavaScript', 'React'],
    profile: '#'
  },
  {
    id: 2,
    name: 'Boris Dupont',
    role: 'Back-end / DevOps',
    img: '../images/team/placeholder_human.png',
    bio: 'Boris conçoit des architectures résilientes et s\'occupe du déploiement CI/CD.',
    skills: ['Node.js', 'Docker', 'Postgres'],
    profile: '#'
  },
  {
    id: 3,
    name: 'Clara Nguyen',
    role: 'UX / UI Designer',
    img: '../images/team/placeholder_human.png',
    bio: "Clara imagine des expériences centrées utilisateur et prototypes interactifs.",
    skills: ['Figma', 'Principles', 'Prototyping'],
    profile: '#'
  },
  {
    id: 4,
    name: 'David Roy',
    role: 'Chef de projet',
    img: '../images/team/placeholder_human.png',
    bio: "David coordonne les équipes et veille au respect des délais et de la qualité.",
    skills: ['Product', 'Scrum', 'Communication'],
    profile: '#'
  }
];

/* ========== Query DOM ========== */
const teamGrid = document.getElementById('team-grid');
const teamFilters = document.getElementById('team-filters');

const modal = document.getElementById('member-modal');
const modalBackdrop = modal ? modal.querySelector('.modal-backdrop') : null;
const modalCloseBtn = document.getElementById('member-modal-close');
const modalTitle = document.getElementById('member-modal-title');
const modalImage = document.getElementById('member-modal-image');
const modalRole = document.getElementById('member-modal-role');
const modalBio = document.getElementById('member-modal-bio');
const modalSkills = document.getElementById('member-modal-skills');
const modalLink = document.getElementById('member-modal-link');
const yearEl = document.getElementById('year');

let activeRole = null;
let previousFocused = null;

/* ========== Init ========== */
document.addEventListener('DOMContentLoaded', () => {
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  renderFilters();
  renderTeam(TEAM);
  attachListeners();
});

/* ========== Render filters ========== */
const renderFilters = () => {
  if (!teamFilters) return;

  const roles = Array.from(new Set(TEAM.map(m => m.role)));
  teamFilters.innerHTML = '';

  const allBtn = document.createElement('button');
  allBtn.type = 'button';
  allBtn.className = 'filter-btn';
  allBtn.textContent = 'Tous';
  allBtn.dataset.role = '';
  allBtn.dataset.active = 'true';
  teamFilters.appendChild(allBtn);

  roles.forEach(r => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'filter-btn';
    btn.textContent = r;
    btn.dataset.role = r;
    btn.dataset.active = 'false';
    teamFilters.appendChild(btn);
  });

  teamFilters.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    const role = btn.dataset.role || null;
    const same = activeRole === role || (activeRole === null && role === '');
    activeRole = same ? null : (role || null);

    teamFilters.querySelectorAll('.filter-btn').forEach(b => {
      const isActive = activeRole ? (b.dataset.role === activeRole) : (b.dataset.role === '');
      b.dataset.active = isActive ? 'true' : 'false';
    });

    const filtered = activeRole ? TEAM.filter(m => m.role === activeRole) : TEAM;
    renderTeam(filtered);
  });
};

/* ========== Render team grid - CORRIGÉ ========== */
const renderTeam = (members = []) => {
  if (!teamGrid) return;
  teamGrid.innerHTML = '';

  if (!members.length) {
    const empty = document.createElement('div');
    empty.textContent = 'Aucun membre trouvé.';
    teamGrid.appendChild(empty);
    return;
  }

  members.forEach(member => {
    // VÉRIFICATION RENFORCÉE
    if (!member || typeof member !== 'object' || member.id == null) {
      console.warn('Membre invalide ignoré:', member);
      return;
    }

    const card = document.createElement('article');
    card.className = 'project-card';
    card.setAttribute('role', 'listitem');
    card.tabIndex = 0;

    const img = document.createElement('img');
    img.className = 'project-image';
    img.src = member.img || '';
    img.alt = `Photo de ${member.name || 'membre'}`;
    img.onerror = () => { img.style.display = 'none'; };

    const title = document.createElement('div');
    title.className = 'project-title';
    title.textContent = member.name || 'Nom indisponible';

    const role = document.createElement('div');
    role.className = 'project-client';
    role.textContent = member.role || '';

    const techsWrap = document.createElement('div');
    techsWrap.className = 'techs';
    (Array.isArray(member.skills) ? member.skills : []).forEach(s => {
      const span = document.createElement('span');
      span.className = 'tech-badge';
      span.textContent = s;
      techsWrap.appendChild(span);
    });

    // BOUTON - seulement si le membre est valide
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn-secondary details-btn';
    btn.textContent = 'Voir profil';
    btn.dataset.id = String(member.id);

    card.appendChild(img);
    card.appendChild(title);
    card.appendChild(role);
    card.appendChild(techsWrap);
    card.appendChild(btn);

    teamGrid.appendChild(card);
  });
};

/* ========== Attach listeners ========== */
const attachListeners = () => {
  if (!teamGrid) return;

  teamGrid.removeEventListener('click', teamGrid._teamClickHandler);

  const clickHandler = (e) => {
    const btn = e.target.closest && e.target.closest('.details-btn');
    if (!btn) return;

    const idStr = btn.dataset.id;
    if (!idStr || !/^\d+$/.test(idStr)) {
      console.warn('details-btn without valid dataset.id:', btn);
      return;
    }

    const id = Number(idStr);
    const member = TEAM.find(m => Number(m.id) === id);
    if (!member) {
      console.warn('Member not found for id', id);
      return;
    }

    openModal(member);
  };

  teamGrid._teamClickHandler = clickHandler;
  teamGrid.addEventListener('click', clickHandler);

  teamGrid.removeEventListener('keydown', teamGrid._teamKeyHandler);
  const keyHandler = (e) => {
    if (e.key !== 'Enter') return;
    const active = document.activeElement;
    if (!active) return;
    if (active.classList && active.classList.contains('details-btn')) {
      active.click();
    }
  };
  teamGrid._teamKeyHandler = keyHandler;
  teamGrid.addEventListener('keydown', keyHandler);

  if (modal) {
    modal.removeEventListener('click', modal._modalClickHandler);
    const modalClickHandler = (e) => {
      if (e.target === modalBackdrop || (e.target && e.target.dataset && e.target.dataset.action === 'close')) closeModal();
    };
    modal._modalClickHandler = modalClickHandler;
    modal.addEventListener('click', modalClickHandler);

    if (modalCloseBtn) {
      modalCloseBtn.removeEventListener('click', modal._modalCloseHandler);
      modal._modalCloseHandler = closeModal;
      modalCloseBtn.addEventListener('click', modal._modalCloseHandler);
    }

    document.removeEventListener('keydown', modal._modalKeyHandler);
    modal._modalKeyHandler = (e) => {
      if ((e.key === 'Escape' || e.key === 'Esc') && modal && modal.getAttribute('aria-hidden') === 'false') {
        closeModal();
      }
    };
    document.addEventListener('keydown', modal._modalKeyHandler);
  }
};

/* ========== Modal functions ========== */
const openModal = (member) => {
  if (!member || (member.id === undefined || member.id === null)) {
    console.warn('openModal called with invalid member:', member);
    return;
  }
  if (!modal) return;

  previousFocused = document.activeElement;

  modal.hidden = false;
  modal.setAttribute('aria-hidden', 'false');

  if (modalTitle) modalTitle.textContent = member.name || 'Membre';
  if (modalImage) {
    modalImage.src = member.img || '';
    modalImage.alt = member.name ? `Photo de ${member.name}` : 'Photo du membre';
    modalImage.style.display = member.img ? 'block' : 'none';
  }
  if (modalRole) {
    modalRole.textContent = member.role || '';
    modalRole.setAttribute('aria-hidden', 'false');
  }
  if (modalBio) modalBio.textContent = member.bio || '';
  if (modalSkills) {
    modalSkills.innerHTML = '';
    (Array.isArray(member.skills) ? member.skills : []).forEach(s => {
      const li = document.createElement('li');
      li.className = 'tech-badge';
      li.textContent = s;
      modalSkills.appendChild(li);
    });
  }
  if (modalLink) {
    modalLink.href = member.profile || '#';
    modalLink.setAttribute('aria-label', `Voir le profil de ${member.name || 'membre'}`);
  }

  if (modalCloseBtn) modalCloseBtn.focus();

  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
};

const closeModal = () => {
  if (!modal) return;
  modal.setAttribute('aria-hidden', 'true');
  modal.hidden = true;

  if (previousFocused) previousFocused.focus();

  document.documentElement.style.overflow = '';
  document.body.style.overflow = '';
};