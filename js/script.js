/* js/script.js
   Récupération API, rendu des projets, filtres, modal, loader, erreurs.
   Écrit en ES6+, défensif pour pouvoir être inclus sur d'autres pages.
*/

const API_URL = 'https://gabistam.github.io/Demo_API/data/projects.json';

/* ---------- Query DOM (peut être null selon la page) ---------- */
const projectsGrid = document.getElementById('projects-grid');
const filtersEl = document.getElementById('filters');
const loaderEl = document.getElementById('loader');
const errorMsg = document.getElementById('error-msg');
const modal = document.getElementById('project-modal');
const modalCloseBtn = document.getElementById('modal-close');
const modalTitle = document.getElementById('modal-title');
const modalImage = document.getElementById('modal-image');
const modalClient = document.getElementById('modal-client');
const modalDesc = document.getElementById('modal-desc');
const modalFeatures = document.getElementById('modal-features');
const modalLink = document.getElementById('modal-link');
const yearEl = document.getElementById('year');

let allProjects = [];
let activeFilter = null; // string technology or null

// initial actions safe à appeler sur toutes les pages
document.addEventListener('DOMContentLoaded', () => {
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Si on est sur la page index (avec projectsGrid), init portfolio
  if (projectsGrid) {
    initPortfolio();
  }

  // Modal close listeners (seulement si modal présent)
  if (modal && modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      // fermer en cliquant sur le backdrop
      if (e.target && e.target.dataset && e.target.dataset.action === 'close') closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') closeModal();
    });
  }
});

/* ---------- Portfolio: fetch + render ---------- */
async function initPortfolio() {
  showLoader();
  try {
    const data = await fetchProjects();
    allProjects = Array.isArray(data.projects) ? data.projects : [];
    const techs = Array.isArray(data.technologies) ? data.technologies : [];

    renderFilters(techs);
    renderProjects(allProjects);
    attachProjectListeners();
  } catch (err) {
    console.error(err);
    showError('Impossible de charger les projets. Vérifie ta connexion ou réessaie plus tard.');
  } finally {
    hideLoader();
  }
}

async function fetchProjects() {
  try {
    const res = await fetch(API_URL, { method: 'GET' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json;
  } catch (err) {
    throw err;
  }
}

/* ---------- UI Rendering ---------- */
function renderFilters(techs = []) {
  if (!filtersEl) return;
  filtersEl.innerHTML = '';

  // "Tous" bouton
  const allBtn = document.createElement('button');
  allBtn.type = 'button';
  allBtn.className = 'filter-btn';
  allBtn.textContent = 'Tous';
  allBtn.dataset.tech = '';
  allBtn.dataset.active = 'true';
  filtersEl.appendChild(allBtn);

  techs.forEach((t) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'filter-btn';
    btn.textContent = t;
    btn.dataset.tech = t;
    btn.dataset.active = 'false';
    filtersEl.appendChild(btn);
  });

  // délégation clics
  filtersEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    const tech = btn.dataset.tech || null;
    // toggle active
    const same = activeFilter === tech || (activeFilter === null && tech === '');
    activeFilter = same ? null : (tech || null);
    // update buttons visuals
    filtersEl.querySelectorAll('.filter-btn').forEach((b) => {
      const bTech = b.dataset.tech || '';
      const isActive = activeFilter ? (bTech === activeFilter) : (bTech === '');
      b.dataset.active = isActive ? 'true' : 'false';
    });
    // render
    const filtered = activeFilter ? allProjects.filter(p => Array.isArray(p.technologies) && p.technologies.includes(activeFilter)) : allProjects;
    renderProjects(filtered);
  });
}

function renderProjects(projects = []) {
  if (!projectsGrid) return;
  projectsGrid.innerHTML = '';

  if (!projects.length) {
    const empty = document.createElement('div');
    empty.textContent = 'Aucun projet trouvé.';
    projectsGrid.appendChild(empty);
    return;
  }

  projects.forEach((p) => {
    const card = document.createElement('article');
    card.className = 'project-card';
    card.setAttribute('role', 'listitem');

    // image
    const img = document.createElement('img');
    img.className = 'project-image';
    img.src = p.image || '';
    img.alt = p.title ? p.title + ' — image' : 'Image du projet';
    // if image is empty, use simple background and hide broken images gracefully
    img.onerror = () => { img.style.display = 'none'; };

    // title, client
    const title = document.createElement('div');
    title.className = 'project-title';
    title.textContent = p.title || 'Titre indisponible';

    const client = document.createElement('div');
    client.className = 'project-client';
    client.textContent = p.client ? `Client: ${p.client}` : 'Client : —';

    // techs badges
    const techsWrap = document.createElement('div');
    techsWrap.className = 'techs';
    (Array.isArray(p.technologies) ? p.technologies.slice(0, 6) : []).forEach((t) => {
      const span = document.createElement('span');
      span.className = 'tech-badge';
      span.textContent = t;
      techsWrap.appendChild(span);
    });

    // details button
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn-secondary details-btn';
    btn.textContent = 'Voir détails';
    btn.dataset.id = String(p.id);

    // assemble
    card.appendChild(img);
    card.appendChild(title);
    card.appendChild(client);
    card.appendChild(techsWrap);
    card.appendChild(btn);

    projectsGrid.appendChild(card);
  });
}

function attachProjectListeners() {
  if (!projectsGrid) return;
  projectsGrid.addEventListener('click', (e) => {
    const btn = e.target.closest('.details-btn');
    if (!btn) return;
    const id = btn.dataset.id;
    const project = allProjects.find(p => String(p.id) === String(id));
    if (project) openModal(project);
  });
}

/* ---------- Modal ---------- */
function openModal(project) {
  if (!modal) return;
  modal.setAttribute('aria-hidden', 'false');
  modal.hidden = false;

  if (modalTitle) modalTitle.textContent = project.title || 'Détails projet';
  if (modalImage) {
    modalImage.src = project.image || '';
    modalImage.alt = project.title ? `${project.title} — image` : 'Image du projet';
    modalImage.onerror = () => { modalImage.style.display = 'none'; };
    modalImage.style.display = project.image ? 'block' : 'none';
  }
  if (modalClient) modalClient.textContent = project.client ? `Client : ${project.client}` : '';
  if (modalDesc) modalDesc.textContent = project.description || '';
  if (modalFeatures) {
    modalFeatures.innerHTML = '';
    (Array.isArray(project.features) ? project.features : []).forEach(f => {
      const li = document.createElement('li');
      li.textContent = f;
      modalFeatures.appendChild(li);
    });
    if (!project.features || !project.features.length) {
      const li = document.createElement('li');
      li.textContent = 'Aucune fonctionnalité listée.';
      modalFeatures.appendChild(li);
    }
  }
  if (modalLink) {
    modalLink.href = project.url || '#';
    modalLink.setAttribute('aria-label', `Visiter ${project.title || 'le site'}`);
  }

  // focus management minimal
  if (modalCloseBtn) modalCloseBtn.focus();
}

function closeModal() {
  if (!modal) return;
  modal.setAttribute('aria-hidden', 'true');
  modal.hidden = true;
}

/* ---------- Helpers: loader / errors ---------- */
function showLoader() {
  if (!loaderEl) return;
  loaderEl.hidden = false;
  loaderEl.setAttribute('aria-hidden', 'false');
}
function hideLoader() {
  if (!loaderEl) return;
  loaderEl.hidden = true;
  loaderEl.setAttribute('aria-hidden', 'true');
}
function showError(text) {
  if (!errorMsg) return;
  errorMsg.hidden = false;
  errorMsg.textContent = text;
}
function clearError() {
  if (!errorMsg) return;
  errorMsg.hidden = true;
  errorMsg.textContent = '';
}

/* ---------- Exports for debugging (optionnel) ---------- */
window.__WebCraft = {
  openModal,
  closeModal,
};
