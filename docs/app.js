(function () {
  'use strict';

  // ---------- LOGIN / AUTH ----------
  const USERS_KEY = 'sp_users';

  function getUsers() {
    try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; } catch { return []; }
  }

  function setUsers(list) {
    localStorage.setItem(USERS_KEY, JSON.stringify(list));
  }

  function initUsers() {
    let users = getUsers();
    if (users.length === 0) {
      users = [{ user: 'SECCION I', pass: 'SECCI2026', isAdmin: true }];
      for (let n = 1; n <= 7; n++) {
        users.push({ user: String(n), pass: 'secci2026', isAdmin: false, patrulla: n });
      }
      setUsers(users);
    }
  }

  function addUser(user, pass, patrulla) {
    const users = getUsers();
    users.push({ user, pass, isAdmin: false, patrulla: patrulla || null });
    setUsers(users);
  }

  function findUser(user, pass) {
    const users = getUsers();
    return users.find(u => u.user === user && u.pass === pass) || null;
  }

  function userExists(user) {
    const users = getUsers();
    return users.some(u => u.user === user);
  }

  initUsers();

  function getCurrentPatrulla() {
    const val = sessionStorage.getItem('sp_patrulla');
    return val ? parseInt(val) : null;
  }

  function isAdmin() {
    return sessionStorage.getItem('sp_admin') === '1';
  }

  function checkAuth() {
    const loggedIn = sessionStorage.getItem('sp_logged_in');
    if (loggedIn) {
      document.getElementById('loginScreen').style.display = 'none';
      document.getElementById('appContainer').style.display = '';
      return true;
    }
    document.getElementById('loginScreen').style.display = '';
    document.getElementById('appContainer').style.display = 'none';
    return false;
  }

  checkAuth();

  document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const user = document.getElementById('loginUser').value.trim();
    const pass = document.getElementById('loginPass').value;
    const errEl = document.getElementById('loginError');

    const found = findUser(user, pass);
    if (found) {
      sessionStorage.setItem('sp_logged_in', found.user);
      sessionStorage.setItem('sp_admin', found.isAdmin ? '1' : '0');
      sessionStorage.setItem('sp_patrulla', found.patrulla ? String(found.patrulla) : '');
      document.getElementById('loginScreen').style.display = 'none';
      document.getElementById('appContainer').style.display = '';
      errEl.classList.add('hidden');
      updateSidebarForUser();
    } else {
      errEl.classList.remove('hidden');
      document.getElementById('loginPass').value = '';
      document.getElementById('loginPass').focus();
    }
  });

  document.getElementById('btnLogout').addEventListener('click', function () {
    sessionStorage.removeItem('sp_logged_in');
    sessionStorage.removeItem('sp_admin');
    sessionStorage.removeItem('sp_patrulla');
    location.reload();
  });

  // ---------- SIDEBAR USER ADAPTATION ----------
  function updateSidebarForUser() {
    const pat = getCurrentPatrulla();
    const admin = isAdmin();
    const patItem = document.querySelector('.nav-item[data-section="patrulla"]');
    if (patItem) {
      if (admin) {
        patItem.innerHTML = '<i class="fas fa-gauge-high"></i> <span>Patrulla</span>';
      } else {
        patItem.innerHTML = `<i class="fas fa-gauge-high"></i> <span>Patrulla N° ${pat}</span>`;
      }
    }
    // Hide volver button for patrol users
    const btnVolver = document.getElementById('btnVolverPatrulla');
    if (btnVolver) {
      btnVolver.style.display = admin ? '' : 'none';
    }
    // Hide nuevo expediente button for patrol users
    const btnNuevo = document.getElementById('btnNuevoExpediente');
    if (btnNuevo) {
      btnNuevo.style.display = admin ? '' : 'none';
    }
    // Hide export button for patrol users
    const btnExport = document.getElementById('btnExportar');
    if (btnExport) {
      btnExport.style.display = admin ? '' : 'none';
    }
    // User management button in topbar (admin only)
    const btnUserMgmt = document.getElementById('btnUserMgmt');
    if (btnUserMgmt) {
      btnUserMgmt.style.display = admin ? '' : 'none';
    }
  }

  // ---------- CONSTANTS ----------
  const STORE = {
    contacto: 'sp_contacto',
    diligencia: 'sp_diligencia',
    vigilancia: 'sp_vigilancia',
    reconocimiento: 'sp_reconocimiento',
    seguridad: 'sp_seguridad',
  };

  const CASOS_KEY = 'sp_casos';

  const PASOS = ['contacto', 'diligencia', 'reconocimiento', 'vigilancia', 'seguridad'];
  const PASO_LABEL = {
    contacto: 'Informe de Contacto',
    diligencia: 'Informe de Diligencia',
    reconocimiento: 'Informe de Reconocimiento',
    vigilancia: 'Informe de Vigilancia',
    seguridad: 'Informe de Seguridad',
  };
  const PASO_ICON = {
    contacto: 'fa-address-card',
    diligencia: 'fa-file-pen',
    reconocimiento: 'fa-compass',
    vigilancia: 'fa-radar',
    seguridad: 'fa-fingerprint',
  };

  const NEXT_STEP = {
    contacto: 'diligencia',
    diligencia: 'reconocimiento',
    reconocimiento: 'vigilancia',
    vigilancia: 'seguridad',
    seguridad: 'expedientes',
  };

  const TIPO_LABEL = {
    contacto: 'Contacto',
    diligencia: 'Diligencia',
    vigilancia: 'Vigilancia',
    reconocimiento: 'Reconocimiento',
    seguridad: 'Seguridad',
  };

  // ---------- HELPERS ----------
  function getData(key) {
    try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; }
  }

  function setData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  function getCasos() { return getData(CASOS_KEY); }
  function setCasos(list) { setData(CASOS_KEY, list); }

  function getCasosFiltered() {
    const all = getCasos();
    const pat = getCurrentPatrulla();
    if (pat) return all.filter(c => c.patrulla === pat);
    return all;
  }

  function genId() {
    return Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase();
  }

  function shortId() {
    return 'EXP-' + Date.now().toString(36).slice(-4).toUpperCase() + Math.random().toString(36).slice(2, 4).toUpperCase();
  }

  function today() {
    return new Date().toISOString().split('T')[0];
  }

  function nowTime() {
    return new Date().toTimeString().split(' ')[0].substring(0, 5);
  }

  function formatDate(d) {
    if (!d) return '-';
    const [y, m, day] = d.split('-');
    return `${day}/${m}/${y}`;
  }

  function truncate(str, len = 80) {
    if (!str) return '-';
    return str.length > len ? str.substring(0, len) + '...' : str;
  }

  // ---------- NAVIGATION ----------
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('.section');
  const sectionTitle = document.getElementById('sectionTitle');
  const sidebar = document.getElementById('sidebar');
  const btnMenu = document.getElementById('btnMenu');

  const SECTION_NAMES = {
    expedientes: 'Expedientes',
    patrulla: 'Patrulla',
    contacto: 'Informe de Contacto',
    diligencia: 'Informe de Diligencia',
    reconocimiento: 'Informe de Reconocimiento',
    vigilancia: 'Informe de Vigilancia',
    seguridad: 'Informe de Seguridad',
    consultas: 'Consultas',
    dashboard: 'Dashboard',
  };

  function navigateTo(sectionId) {
    navItems.forEach(n => n.classList.remove('active'));
    sections.forEach(s => s.classList.remove('active'));

    const activeNav = document.querySelector(`.nav-item[data-section="${sectionId}"]`);
    if (activeNav) activeNav.classList.add('active');
    const activeSection = document.getElementById(`section-${sectionId}`);
    if (activeSection) activeSection.classList.add('active');

    const pat = getCurrentPatrulla();
    if (sectionId === 'patrulla' && pat) {
      sectionTitle.textContent = `Patrulla N° ${pat}`;
    } else {
      sectionTitle.textContent = SECTION_NAMES[sectionId] || 'Dashboard';
    }

    if (sectionId === 'dashboard') updateDashboard();
    if (sectionId === 'expedientes') renderExpedientes();
    if (sectionId === 'patrulla') renderPatrulla();
    if (sectionId === 'contacto') {
      const infoBox = document.getElementById('cont-info-box');
      infoBox.innerHTML = `<i class="fas fa-info-circle"></i> <span>Al guardar este informe se creará automáticamente un <strong>nuevo Expediente</strong>.</span>`;
    }
    if (sectionId === 'diligencia') {
      const sel = document.getElementById('diligencia-caso');
      if (sel) sel.value = '';
    }
    if (sectionId === 'consultas') {
      document.getElementById('cons-fecha-ini').value = '';
      document.getElementById('cons-fecha-fin').value = '';
      document.getElementById('cons-busqueda').value = '';
      document.getElementById('cons-tipo').value = 'todos';
      document.getElementById('tbodyConsultas').innerHTML = '<tr><td colspan="8" class="empty-msg">Aplique los filtros y presione "Consultar" para ver resultados</td></tr>';
    }
    ['diligencia', 'reconocimiento', 'vigilancia', 'seguridad'].forEach(t => {
      if (sectionId === t) populateCasoSelector(t);
    });

    // Fill form if editing, otherwise reset
    if (sectionId === 'contacto' || sectionId === 'reconocimiento' || sectionId === 'vigilancia' || sectionId === 'seguridad') {
      const hasEdit = sessionStorage.getItem('sp_edit_id') && sessionStorage.getItem('sp_edit_tipo') === sectionId;
      if (hasEdit) {
        fillFormForEdit(sectionId);
      } else {
        const form = document.getElementById('form' + sectionId.charAt(0).toUpperCase() + sectionId.slice(1));
        if (form) form.reset();
      }
    }
    if (sectionId === 'diligencia') {
      const hasEdit = sessionStorage.getItem('sp_edit_id') && sessionStorage.getItem('sp_edit_tipo') === 'diligencia';
      if (hasEdit) {
        fillFormForEditDiligencia();
      } else {
        // Reset diligencia form
        const form = document.getElementById('formDiligencia');
        if (form) form.reset();
        document.getElementById('diligencia-caso').value = '';
        const container = document.getElementById('dil-items-container');
        if (container) {
          container.innerHTML = `
            <div class="dil-item">
              <div class="item-header">
                <span class="item-num">Archivo #1</span>
                <button type="button" class="btn-remove-item" title="Eliminar este archivo" style="display:none"><i class="fas fa-times"></i></button>
              </div>
              <div class="form-group">
                <label>Título</label>
                <input type="text" name="dil-titulo" placeholder="Título de la diligencia" required>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>N°</label>
                  <input type="text" name="dil-nro" placeholder="Número de caso / radicado" required>
                </div>
                <div class="form-group">
                  <label>Fecha</label>
                  <input type="date" name="dil-fecha" required>
                </div>
              </div>
              <div class="form-group">
                <label>Descripción</label>
                <textarea name="dil-descripcion" rows="3" placeholder="Describa los detalles de la diligencia..." required></textarea>
              </div>
            </div>`;
        }
      }
    }

    if (window.innerWidth <= 768) sidebar.classList.remove('open');
  }

  navItems.forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      navigateTo(item.dataset.section);
    });
  });

  btnMenu.addEventListener('click', () => sidebar.classList.toggle('open'));

  // ---------- CLOCK ----------
  function updateClock() {
    const now = new Date();
    const opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    document.getElementById('clock').textContent = now.toLocaleDateString('es-ES', opts);
  }
  updateClock();
  setInterval(updateClock, 30000);

  // ---------- MODAL ----------
  let _nextStep = null;

  function showModal(title, msg, nextSection) {
    document.getElementById('modalConfirmTitle').textContent = title || 'Informe Guardado';
    document.getElementById('modalConfirmMsg').textContent = msg || 'El informe se ha guardado correctamente.';
    _nextStep = nextSection || null;
    document.getElementById('modalConfirm').classList.remove('hidden');
  }

  document.getElementById('btnModalOk').addEventListener('click', () => {
    document.getElementById('modalConfirm').classList.add('hidden');
    if (_nextStep) {
      const ns = _nextStep;
      _nextStep = null;
      setTimeout(() => navigateTo(ns), 100);
    }
  });
  document.getElementById('modalConfirm').addEventListener('click', e => {
    if (e.target === document.getElementById('modalConfirm')) {
      document.getElementById('modalConfirm').classList.add('hidden');
    }
  });

  // ---------- PREVIEW MODAL ----------
  const modalPreview = document.getElementById('modalPreview');
  const previewTitle = document.getElementById('previewTitle');
  const previewBody = document.getElementById('previewBody');

  function showPreview(record, tipo) {
    const fields = getFormFields(tipo, record);
    previewTitle.textContent = `${TIPO_LABEL[tipo] || 'Informe'} - ${formatDate(record._fecha)}`;
    previewBody.innerHTML = fields.map(f =>
      `<div class="preview-field"><strong>${f.label}</strong><span>${f.value || '-'}</span></div>`
    ).join('');
    modalPreview.classList.remove('hidden');
  }

  function getFormFields(tipo, r) {
    const base = [
      { label: 'Expediente', value: r._casoLabel || r._casoId || '-' },
      { label: 'Patrulla', value: r._patrulla ? `N° ${r._patrulla}` : '-' },
      { label: 'Fecha', value: formatDate(r._fecha) },
      { label: 'Hora', value: r._hora || '-' },
    ];
    const extra = {
      contacto: [
        { label: 'Patrulla', value: r._patrulla ? `N° ${r._patrulla}` : '-' },
        { label: 'Título', value: r['cont-titulo'] },
        { label: 'N°', value: r['cont-nro'] },
        { label: 'Descripción', value: r['cont-descripcion'] },
      ],
      diligencia: [
        { label: 'Título', value: r['dil-titulo'] },
        { label: 'N°', value: r['dil-nro'] },
        { label: 'Descripción', value: r['dil-descripcion'] },
      ],
      vigilancia: [
        { label: 'Título', value: r['vig-titulo'] },
        { label: 'N°', value: r['vig-nro'] },
        { label: 'Descripción', value: r['vig-descripcion'] },
      ],
      reconocimiento: [
        { label: 'Título', value: r['rec-titulo'] },
        { label: 'N°', value: r['rec-nro'] },
        { label: 'Descripción', value: r['rec-descripcion'] },
      ],
      seguridad: [
        { label: 'Título', value: r['seg-titulo'] },
        { label: 'N°', value: r['seg-nro'] },
        { label: 'Descripción', value: r['seg-descripcion'] },
      ],
    };
    return [...base, ...(extra[tipo] || []), { label: 'ID Informe', value: r.id }];
  }

  document.getElementById('btnPreviewClose').addEventListener('click', () => modalPreview.classList.add('hidden'));
  document.getElementById('btnPreviewCerrar').addEventListener('click', () => modalPreview.classList.add('hidden'));
  modalPreview.addEventListener('click', e => {
    if (e.target === modalPreview) modalPreview.classList.add('hidden');
  });

  // ---------- EDIT HELPERS ----------
  function fillFormForEdit(tipo) {
    const editId = sessionStorage.getItem('sp_edit_id');
    const editTipo = sessionStorage.getItem('sp_edit_tipo');
    if (!editId || editTipo !== tipo) return;

    const records = getData(STORE[tipo]);
    const record = records.find(r => r.id === editId);
    if (!record) return;

    const prefixMap = { contacto: 'cont', reconocimiento: 'rec', vigilancia: 'vig', seguridad: 'seg' };
    const prefix = prefixMap[tipo];
    if (!prefix) return;

    const form = document.getElementById('form' + tipo.charAt(0).toUpperCase() + tipo.slice(1));
    if (!form) return;

    // Set caso selector
    const casoId = sessionStorage.getItem('sp_edit_caso');
    const sel = document.getElementById(`${tipo}-caso`);
    if (sel && casoId) sel.value = casoId;

    // Set form fields
    const fieldMap = [`${prefix}-titulo`, `${prefix}-nro`, `${prefix}-descripcion`];
    fieldMap.forEach(fn => {
      const el = form.querySelector(`[name="${fn}"], #${fn}`);
      if (el && record[fn]) el.value = record[fn];
    });

    // Set date
    const fechaEl = form.querySelector(`#${prefix}-fecha`);
    if (fechaEl && record._fecha) fechaEl.value = record._fecha;

    // For contacto, set expediente name
    if (tipo === 'contacto') {
      const expName = document.getElementById('cont-exp-nombre');
      if (expName && record['cont-exp-nombre']) expName.value = record['cont-exp-nombre'];
    }
  }

  function fillFormForEditDiligencia() {
    const editId = sessionStorage.getItem('sp_edit_id');
    const editTipo = sessionStorage.getItem('sp_edit_tipo');
    if (!editId || editTipo !== 'diligencia') return;

    const records = getData(STORE.diligencia);
    const record = records.find(r => r.id === editId);
    if (!record) return;

    const casoId = sessionStorage.getItem('sp_edit_caso');
    const sel = document.getElementById('diligencia-caso');
    if (sel && casoId) sel.value = casoId;

    const container = document.getElementById('dil-items-container');
    container.innerHTML = '';
    const div = document.createElement('div');
    div.className = 'dil-item';
    div.innerHTML = `
      <div class="item-header">
        <span class="item-num">Archivo #1</span>
        <button type="button" class="btn-remove-item" title="Eliminar este archivo" style="display:none"><i class="fas fa-times"></i></button>
      </div>
      <div class="form-group">
        <label>Título</label>
        <input type="text" name="dil-titulo" placeholder="Título de la diligencia" required value="${(record['dil-titulo'] || '').replace(/"/g, '&quot;')}">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>N°</label>
          <input type="text" name="dil-nro" placeholder="Número de caso / radicado" required value="${(record['dil-nro'] || '').replace(/"/g, '&quot;')}">
        </div>
        <div class="form-group">
          <label>Fecha</label>
          <input type="date" name="dil-fecha" required value="${record._fecha || record['dil-fecha'] || ''}">
        </div>
      </div>
      <div class="form-group">
        <label>Descripción</label>
        <textarea name="dil-descripcion" rows="3" placeholder="Describa los detalles de la diligencia..." required>${(record['dil-descripcion'] || '').replace(/"/g, '&quot;')}</textarea>
      </div>`;
    container.appendChild(div);
  }

  // ---------- FORMS ----------
  function setupForm(formId, storeKey, tipo) {
    const form = document.getElementById(formId);
    if (!form) return;

    const fechaField = form.querySelector('input[type="date"]');
    const horaField = form.querySelector('input[type="time"]');

    form.addEventListener('submit', e => {
      e.preventDefault();
      const editId = sessionStorage.getItem('sp_edit_id');
      const editTipo = sessionStorage.getItem('sp_edit_tipo');
      const isEditing = editId && editTipo === tipo;
      const entry = { id: isEditing ? editId : genId(), _fecha: fechaField?.value || today(), _hora: horaField?.value || '' };

      fd.forEach((value, key) => {
        if (value && value.trim) value = value.trim();
        if (value) entry[key] = value;
      });

      // Handle case linking
      const casoId = entry[tipo + '-caso'];
      if (tipo === 'contacto') {
        if (isEditing) {
          // Edit existing contacto — don't create new case
          const casos = getCasos();
          const casoEdit = casoId ? casos.find(c => c.id === casoId) : null;
          if (casoEdit) {
            entry._casoId = casoEdit.id;
            entry._casoLabel = casoEdit.label;
            if (casoEdit.patrulla) entry._patrulla = casoEdit.patrulla;
          }
          showModal('Informe Actualizado', 'El informe de contacto se ha actualizado.', null);
        } else {
          // Create new case
          const nombreExp = entry['cont-exp-nombre'] || entry['cont-titulo'] || entry['cont-nro'] || shortId();
          const patrullaAsignada = parseInt(localStorage.getItem('sp_patrulla_pendiente')) || getCurrentPatrulla() || null;
          localStorage.removeItem('sp_patrulla_pendiente');
          if (patrullaAsignada) entry._patrulla = patrullaAsignada;
          const caso = { id: genId(), label: nombreExp, patrulla: patrullaAsignada, fechaCreacion: entry._fecha, creadoPor: entry['cont-titulo'] || entry['cont-nro'] || '', completado: {} };
          let casos = getCasos();
          casos.unshift(caso);
          setCasos(casos);
          entry._casoId = caso.id;
          entry._casoLabel = caso.label;
          caso.completado[tipo] = { id: entry.id, fecha: entry._fecha };
          casos = getCasos();
          const idx = casos.findIndex(c => c.id === caso.id);
          if (idx !== -1) casos[idx] = caso;
          setCasos(casos);
          showModal('Expediente Creado', `Nuevo expediente "${caso.label}" creado. Pasando al paso 2...`, NEXT_STEP[tipo]);
        }
      } else if (casoId) {
        entry._casoId = casoId;
        const casos = getCasos();
        const caso = casos.find(c => c.id === casoId);
        if (caso) {
          entry._casoLabel = caso.label;
          if (caso.patrulla) entry._patrulla = caso.patrulla;
          if (!isEditing) {
            caso.completado = caso.completado || {};
            caso.completado[tipo] = { id: entry.id, fecha: entry._fecha };
            const idx = casos.findIndex(c => c.id === casoId);
            if (idx !== -1) casos[idx] = caso;
            setCasos(casos);
          }
        }
        showModal(isEditing ? 'Informe Actualizado' : 'Informe Guardado', `Informe ${isEditing ? 'actualizado' : 'vinculado'} al expediente "${entry._casoLabel || casoId}".`, isEditing ? null : NEXT_STEP[tipo]);
      } else {
        showModal('Informe Guardado', 'Informe guardado sin vincular a expediente.', null);
      }

      const records = getData(storeKey);
      if (isEditing) {
        const idx = records.findIndex(r => r.id === editId);
        if (idx !== -1) records[idx] = entry;
        else records.push(entry);
      } else {
        records.push(entry);
      }
      setData(storeKey, records);

      sessionStorage.removeItem('sp_edit_id');
      sessionStorage.removeItem('sp_edit_tipo');
      sessionStorage.removeItem('sp_edit_caso');

      form.reset();
      if (tipo !== 'contacto' && document.getElementById(`${tipo}-caso`)) {
        populateCasoSelector(tipo);
      }
    });
  }

  setupForm('formContacto', STORE.contacto, 'contacto');
  setupForm('formReconocimiento', STORE.reconocimiento, 'reconocimiento');
  setupForm('formVigilancia', STORE.vigilancia, 'vigilancia');
  setupForm('formSeguridad', STORE.seguridad, 'seguridad');
  setupFormDiligencia();

  // ---------- SEGURIDAD — PENDIENTE ----------
  document.getElementById('btnSegPendiente').addEventListener('click', () => {
    const sel = document.getElementById('seguridad-caso');
    const casoId = sel?.value;
    if (!casoId) { alert('Debe seleccionar un Expediente primero.'); return; }

    const casos = getCasos();
    const c = casos.find(x => x.id === casoId);
    if (!c) return;

    c.completado = c.completado || {};
    c.completado.seguridad = { pendiente: true, fecha: today() };

    const idx = casos.findIndex(x => x.id === casoId);
    if (idx !== -1) casos[idx] = c;
    setCasos(casos);

    showModal('Caso Pendiente', `Expediente "${c.label}" marcado como pendiente. No se finalizará hasta agregar el informe de Seguridad.`, null);
    sel.value = '';
  });

  // ---------- CASO SELECTOR ----------
  function populateCasoSelector(tipo) {
    const sel = document.getElementById(`${tipo}-caso`);
    if (!sel) return;
    const casos = getCasosFiltered();
    const pasoIdx = PASOS.indexOf(tipo);

    sel.innerHTML = '<option value="">Seleccione un Expediente...</option>';
    casos.forEach(c => {
      const completed = c.completado || {};
      const hasContacto = completed['contacto'];
      const hasDiligencia = completed['diligencia'];
      const alreadyDone = completed[tipo];

      let mostrar = false;
      if (tipo === 'diligencia') {
        mostrar = hasContacto && !alreadyDone;
      } else if (tipo === 'reconocimiento' || tipo === 'vigilancia') {
        mostrar = hasDiligencia && !alreadyDone;
      } else if (tipo === 'seguridad') {
        const isPendiente = alreadyDone && alreadyDone.pendiente;
        mostrar = hasDiligencia && (!alreadyDone || isPendiente);
      }

      if (mostrar) {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = `${c.label} — ${c.creadoPor || 'Sin nombre'} (${formatDate(c.fechaCreacion)})`;
        sel.appendChild(opt);
      }
    });
  }

  // ---------- DILIGENCIA (multi-item) ----------
  function setupFormDiligencia() {
    const form = document.getElementById('formDiligencia');
    const container = document.getElementById('dil-items-container');
    const btnAdd = document.getElementById('btnAddDiligencia');

    function updateItemNumbers() {
      const items = container.querySelectorAll('.dil-item');
      items.forEach((item, i) => {
        const num = item.querySelector('.item-num');
        if (num) num.textContent = `Archivo #${i + 1}`;
        const removeBtn = item.querySelector('.btn-remove-item');
        if (removeBtn) removeBtn.style.display = items.length > 1 ? '' : 'none';
      });
    }

    function createItem(data) {
      const div = document.createElement('div');
      div.className = 'dil-item';
      div.innerHTML = `
        <div class="item-header">
          <span class="item-num">Archivo #</span>
          <button type="button" class="btn-remove-item" title="Eliminar este archivo"><i class="fas fa-times"></i></button>
        </div>
        <div class="form-group">
          <label>Título</label>
          <input type="text" name="dil-titulo" placeholder="Título de la diligencia" required>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>N°</label>
            <input type="text" name="dil-nro" placeholder="Número de caso / radicado" required>
          </div>
          <div class="form-group">
            <label>Fecha</label>
            <input type="date" name="dil-fecha" required>
          </div>
        </div>
        <div class="form-group">
          <label>Descripción</label>
          <textarea name="dil-descripcion" rows="3" placeholder="Describa los detalles de la diligencia..." required></textarea>
        </div>`;
      if (data) {
        const titulo = div.querySelector('[name="dil-titulo"]');
        const nro = div.querySelector('[name="dil-nro"]');
        const fecha = div.querySelector('[name="dil-fecha"]');
        const desc = div.querySelector('[name="dil-descripcion"]');
        if (titulo) titulo.value = data.titulo || '';
        if (nro) nro.value = data.nro || '';
        if (fecha) fecha.value = data.fecha || '';
        if (desc) desc.value = data.descripcion || '';
      }
      const removeBtn = div.querySelector('.btn-remove-item');
      removeBtn.addEventListener('click', () => {
        if (container.querySelectorAll('.dil-item').length > 1) {
          div.remove();
          updateItemNumbers();
        }
      });
      return div;
    }

    btnAdd.addEventListener('click', () => {
      container.appendChild(createItem());
      updateItemNumbers();
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      const editId = sessionStorage.getItem('sp_edit_id');
      const editTipo = sessionStorage.getItem('sp_edit_tipo');
      const isEditing = editId && editTipo === 'diligencia';
      const casoId = document.getElementById('diligencia-caso').value;
      if (!casoId) { alert('Debe seleccionar un Expediente.'); return; }

      const items = container.querySelectorAll('.dil-item');
      const batch = [];

      items.forEach(item => {
        const titulo = item.querySelector('[name="dil-titulo"]')?.value?.trim();
        const nro = item.querySelector('[name="dil-nro"]')?.value?.trim();
        const fecha = item.querySelector('[name="dil-fecha"]')?.value;
        const descripcion = item.querySelector('[name="dil-descripcion"]')?.value?.trim();
        if (titulo && nro && fecha) {
          batch.push({
            id: isEditing && batch.length === 0 ? editId : genId(),
            'dil-titulo': titulo,
            'dil-nro': nro,
            'dil-fecha': fecha,
            'dil-descripcion': descripcion || '',
            _fecha: fecha,
            _hora: '',
            _casoId: casoId,
          });
        }
      });

      if (batch.length === 0) { alert('Debe completar al menos un archivo.'); return; }

      // Save all and update case
      const records = getData(STORE.diligencia);
      const casos = getCasos();
      const caso = casos.find(c => c.id === casoId);
      const label = caso ? caso.label : casoId;

      if (isEditing) {
        // Replace existing record
        const existingIdx = records.findIndex(r => r.id === editId);
        const newRecord = batch[0];
        if (caso) {
          newRecord._casoLabel = caso.label;
          if (caso.patrulla) newRecord._patrulla = caso.patrulla;
        }
        if (existingIdx !== -1) records[existingIdx] = newRecord;
        else records.push(newRecord);
      } else {
        batch.forEach(entry => {
          if (caso) {
            entry._casoLabel = caso.label;
            if (caso.patrulla) entry._patrulla = caso.patrulla;
          }
          records.push(entry);
        });

        // Update caso with latest diligencia ref
        if (caso) {
          caso.completado = caso.completado || {};
          const last = batch[batch.length - 1];
          caso.completado.diligencia = { id: last.id, fecha: last._fecha };
          const idx = casos.findIndex(c => c.id === casoId);
          if (idx !== -1) casos[idx] = caso;
          setCasos(casos);
        }
      }

      setData(STORE.diligencia, records);

      sessionStorage.removeItem('sp_edit_id');
      sessionStorage.removeItem('sp_edit_tipo');
      sessionStorage.removeItem('sp_edit_caso');

      showModal(isEditing ? 'Informe Actualizado' : 'Informes Guardados', `${batch.length} archivo(s) ${isEditing ? 'actualizado(s)' : 'guardado(s)'} en "${label}".`, isEditing ? null : NEXT_STEP.diligencia);

      form.reset();
      document.getElementById('diligencia-caso').value = casoId;
      container.innerHTML = '';
      container.appendChild(createItem());
      updateItemNumbers();
      populateCasoSelector('diligencia');
    });

  }

  // ---------- EXPEDIENTES VIEW (accordion rows) ----------
  function renderExpedientes() {
    const container = document.getElementById('expedientes-list');
    const casos = getCasosFiltered();

    if (!casos.length) {
      container.innerHTML = `
        <div class="expediente-empty">
          <i class="fas fa-folder-open"></i>
          <h3>No hay expedientes aún</h3>
          <p>Cree un Informe de Contacto para iniciar un nuevo expediente.</p>
        </div>`;
      return;
    }

    container.innerHTML = casos.map(c => {
      const completed = c.completado || {};
      const totalDone = PASOS.filter(p => completed[p]).length;
      const segOk = completed['seguridad'] && !completed['seguridad'].pendiente;
      const hasRequired = completed['contacto'] && completed['diligencia'] && segOk;
      const status = hasRequired ? 'completed' : totalDone >= 2 ? 'progress' : 'started';
      const statusLabel = hasRequired ? 'Finalizado' : totalDone >= 2 ? 'En Progreso' : 'Iniciado';

      const pasoIcons = PASOS.map(p => {
        const done = completed[p];
        return `<span class="paso-mini ${done ? 'done' : ''}" title="${PASO_LABEL[p]}: ${done ? 'Completado' : 'Pendiente'}">
          <i class="fas ${PASO_ICON[p]}"></i>
        </span>`;
      }).join('');

      return `
        <div class="expediente-row status-${status}">
          <div class="exp-row-header" data-expand="${c.id}">
            <div class="exp-row-left">
              <i class="fas fa-chevron-right exp-chevron"></i>
              <i class="fas fa-folder${totalDone === 5 ? '-open' : ''} exp-folder"></i>
              <span class="exp-name">${c.label}</span>
            </div>
            <div class="exp-row-center">
              ${pasoIcons}
            </div>
            <div class="exp-row-right">
              ${c.patrulla ? `<span class="patrulla-tag">P-${c.patrulla}</span>` : ''}
              <span class="exp-date"><i class="far fa-calendar-alt"></i> ${formatDate(c.fechaCreacion)}</span>
              <span class="status-badge ${status}">
                <i class="fas ${totalDone === 5 ? 'fa-check-circle' : totalDone >= 2 ? 'fa-spinner' : 'fa-clock'}"></i>
                ${statusLabel}
              </span>
              <button class="btn-exp-edit" title="Editar nombre" data-id="${c.id}"><i class="fas fa-pen"></i></button>
              <button class="btn-exp-delete" title="Eliminar expediente" data-id="${c.id}"><i class="fas fa-trash"></i></button>
            </div>
          </div>
          <div class="exp-row-body" id="exp-body-${c.id}" style="display:none">
            ${PASOS.map((p, i) => {
              const done = completed[p];
              const isPendiente = done && done.pendiente;
              let detail = '<em>Pendiente</em>';
              let btnHtml = '';
              let indicatorClass = 'pending';
              let dotClass = 'red';

              if (done && !isPendiente) {
                indicatorClass = 'completed';
                dotClass = 'green';
                if (p === 'diligencia') {
                  const dilRecords = getData(STORE.diligencia).filter(r => r._casoId === c.id);
                  const count = dilRecords.length;
                  detail = count > 1
                    ? `${count} archivos — Último: #${done.id} (${formatDate(done.fecha)})`
                    : `#${done.id} — ${formatDate(done.fecha)}`;
                  btnHtml = `<button class="btn-view" data-tipo="${p}" data-id="${done.id}"><i class="fas fa-eye"></i> Ver último</button>
                  <button class="btn-edit" data-tipo="${p}" data-id="${done.id}" data-caso="${c.id}"><i class="fas fa-pen"></i> Editar</button>`;
                } else {
                  detail = `#${done.id} — ${formatDate(done.fecha)}`;
                  btnHtml = `<button class="btn-view" data-tipo="${p}" data-id="${done.id}"><i class="fas fa-eye"></i> Ver</button>
                  <button class="btn-edit" data-tipo="${p}" data-id="${done.id}" data-caso="${c.id}"><i class="fas fa-pen"></i> Editar</button>`;
                }
              } else if (isPendiente) {
                indicatorClass = 'pending';
                dotClass = 'yellow';
                detail = '<em>Pendiente — Sin informe</em>';
              }

              return `
                <div class="workflow-step">
                  <div class="step-indicator ${indicatorClass}">${i + 1}</div>
                  <div class="traffic-light">
                    <div class="traffic-dot ${dotClass}"></div>
                  </div>
                  <div class="step-info">
                    <div class="step-name">
                      <i class="fas ${PASO_ICON[p]}"></i>
                      ${PASO_LABEL[p]}
                    </div>
                    <div class="step-detail">${detail}</div>
                  </div>
                  ${!isPendiente && done ? `<div class="step-link">${btnHtml}</div>` : ''}
                </div>`;
            }).join('')}
          </div>
        </div>`;
    }).join('');

    // Toggle accordion
    container.querySelectorAll('.exp-row-header').forEach(hdr => {
      hdr.addEventListener('click', () => {
        const id = hdr.dataset.expand;
        const body = document.getElementById(`exp-body-${id}`);
        const chevron = hdr.querySelector('.exp-chevron');
        if (body.style.display === 'none') {
          body.style.display = '';
          chevron.style.transform = 'rotate(90deg)';
        } else {
          body.style.display = 'none';
          chevron.style.transform = '';
        }
      });
    });

    // Edit name
    container.querySelectorAll('.btn-exp-edit').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const casos = getCasos();
        const c = casos.find(x => x.id === id);
        if (!c) return;
        const nuevo = prompt('Editar nombre del expediente:', c.label);
        if (nuevo && nuevo.trim() && nuevo.trim() !== c.label) {
          c.label = nuevo.trim();
          const idx = casos.findIndex(x => x.id === id);
          if (idx !== -1) casos[idx] = c;
          setCasos(casos);
          renderExpedientes();
        }
      });
    });

    // Delete expediente
    container.querySelectorAll('.btn-exp-delete').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const casos = getCasos();
        const c = casos.find(x => x.id === id);
        if (!c) return;
        if (!confirm(`¿Eliminar el expediente "${c.label}" y todos sus informes? No se puede deshacer.`)) return;
        // Remove all linked reports
        const completed = c.completado || {};
        Object.keys(completed).forEach(tipo => {
          const ref = completed[tipo];
          if (ref && ref.id) {
            let records = getData(STORE[tipo]);
            records = records.filter(r => r.id !== ref.id);
            setData(STORE[tipo], records);
          }
        });
        // Also remove any diligencia records linked to this case (in case multiple)
        let dilRecords = getData(STORE.diligencia);
        dilRecords = dilRecords.filter(r => r._casoId !== id);
        setData(STORE.diligencia, dilRecords);
        // Remove the case
        const filtered = casos.filter(x => x.id !== id);
        setCasos(filtered);
        renderExpedientes();
      });
    });

    // Attach preview listeners
    container.querySelectorAll('.btn-view').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const tipo = btn.dataset.tipo;
        const id = btn.dataset.id;
        const records = getData(STORE[tipo]);
        const record = records.find(r => r.id === id);
        if (record) showPreview(record, tipo);
      });
    });

    // Attach edit listeners
    container.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const tipo = btn.dataset.tipo;
        const id = btn.dataset.id;
        const casoId = btn.dataset.caso;
        sessionStorage.setItem('sp_edit_id', id);
        sessionStorage.setItem('sp_edit_tipo', tipo);
        sessionStorage.setItem('sp_edit_caso', casoId);
        navigateTo(tipo);
      });
    });
  }

  // ---------- PATRULLA VIEW ----------
  let _patrullaActiva = null;

  function renderPatrulla() {
    const grid = document.getElementById('patrulla-buttons');
    const list = document.getElementById('patrulla-exp-list');
    const allCasos = getCasos();
    const pat = getCurrentPatrulla();

    // If patrol user, auto-select their patrol
    if (pat && !_patrullaActiva) {
      _patrullaActiva = pat;
      renderPatrulla();
      return;
    }

    // Count expedientes per patrulla
    const counts = {};
    for (let n = 1; n <= 7; n++) {
      counts[n] = allCasos.filter(c => c.patrulla === n).length;
    }

    if (!_patrullaActiva) {
      grid.style.display = '';
      list.style.display = 'none';
      // Admin sees all 7, patrol user sees only their number
      const range = pat ? [pat] : [1, 2, 3, 4, 5, 6, 7];
      grid.innerHTML = range.map(n => {
        return `<button class="patrulla-btn" data-patrulla="${n}" data-num="${n}">
          <span class="pat-num">${n}</span>
          <span class="pat-count">${counts[n]} exp.</span>
        </button>`;
      }).join('');

      grid.querySelectorAll('.patrulla-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          _patrullaActiva = parseInt(btn.dataset.patrulla);
          renderPatrulla();
        });
      });
    } else {
      grid.style.display = 'none';
      list.style.display = '';
      const p = _patrullaActiva;
      document.getElementById('patrulla-title').textContent = `Patrulla N° ${p}`;
      const body = document.getElementById('patrulla-exp-body');
      const filtered = allCasos.filter(c => c.patrulla === p);
      if (!filtered.length) {
        body.innerHTML = `<div class="expediente-empty" style="padding:30px">
          <i class="fas fa-gauge-high" style="font-size:2rem"></i>
          <h3 style="font-size:.95rem">No hay expedientes en Patrulla ${p}</h3>
          <p>Cree un nuevo expediente para esta patrulla.</p>
        </div>`;
      } else {
        body.innerHTML = filtered.map(c => {
          const completed = c.completado || {};
          const totalDone = PASOS.filter(s => completed[s]).length;
          const segOk = completed['seguridad'] && !completed['seguridad'].pendiente;
          const hasRequired = completed['contacto'] && completed['diligencia'] && segOk;
          const status = hasRequired ? 'completed' : totalDone >= 2 ? 'progress' : 'started';
          const statusLabel = hasRequired ? 'Finalizado' : totalDone >= 2 ? 'En Progreso' : 'Iniciado';
          return `<div class="expediente-row status-${status}" style="cursor:pointer" data-exp-id="${c.id}">
            <div class="exp-row-header" style="cursor:pointer">
              <div class="exp-row-left">
                <i class="fas fa-folder${totalDone === 5 ? '-open' : ''}" style="color:var(--primary)"></i>
                <span class="exp-name">${c.label}</span>
              </div>
              <div class="exp-row-right">
                ${c.patrulla ? `<span class="patrulla-tag">P-${c.patrulla}</span>` : ''}
              <span class="exp-date"><i class="far fa-calendar-alt"></i> ${formatDate(c.fechaCreacion)}</span>
                <span class="status-badge ${status}">${statusLabel}</span>
              </div>
            </div>
          </div>`;
        }).join('');
        body.querySelectorAll('.expediente-row').forEach(row => {
          row.addEventListener('click', () => {
            _patrullaActiva = p;
            navigateTo('expedientes');
          });
        });
      }
    }
  }

  document.getElementById('btnVolverPatrulla').addEventListener('click', () => {
    _patrullaActiva = null;
    renderPatrulla();
  });

  document.getElementById('btnNuevoDesdePatrulla').addEventListener('click', () => {
    const p = _patrullaActiva;
    _patrullaActiva = null;
    localStorage.setItem('sp_patrulla_pendiente', String(p));
    navigateTo('contacto');
  });

  // ---------- Nuevo Expediente from Expedientes view ----------
  document.getElementById('btnNuevoExpediente').addEventListener('click', () => {
    navigateTo('contacto');
  });

  // ---------- CONSULTAS ----------
  function showConsultas(filteredData) {
    const tbody = document.getElementById('tbodyConsultas');
    const data = filteredData || getAllData();

    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="empty-msg">No se encontraron resultados</td></tr>';
      return;
    }

    tbody.innerHTML = data.map((d, i) => {
      const label = TIPO_LABEL[d._tipo] || 'Informe';
      const icon = PASO_ICON[d._tipo] || 'fa-file-alt';
      const summary = getFieldSummary(d, d._tipo);
      return `<tr>
        <td>${i + 1}</td>
        <td><i class="fas ${icon}" style="color:var(--primary);width:16px"></i> ${label}</td>
        <td>${d._casoLabel || d._casoId || '-'}</td>
        <td>${formatDate(d._fecha)}</td>
        <td>${d._hora || '-'}</td>
        <td>${getLocation(d, d._tipo)}</td>
        <td>${truncate(summary, 60)}</td>
        <td style="white-space:nowrap">
          <button class="btn-view" data-id="${d.id}" data-tipo="${d._tipo}"><i class="fas fa-eye"></i></button>
        </td>
      </tr>`;
    }).join('');

    tbody.querySelectorAll('.btn-view').forEach(btn => {
      btn.addEventListener('click', () => {
        const tipo = btn.dataset.tipo;
        const id = btn.dataset.id;
        const records = getData(STORE[tipo]);
        const record = records.find(r => r.id === id);
        if (record) showPreview(record, tipo);
      });
    });
  }

  function getFieldSummary(d, tipo) {
    const map = {
      contacto: d['cont-titulo'] || d['cont-descripcion'] || '',
      diligencia: d['dil-titulo'] || d['dil-descripcion'] || '',
      vigilancia: d['vig-titulo'] || d['vig-descripcion'] || '',
      reconocimiento: d['rec-titulo'] || d['rec-descripcion'] || '',
      seguridad: d['seg-titulo'] || d['seg-descripcion'] || '',
    };
    return map[tipo] || '';
  }

  function getLocation(d, tipo) {
    const map = {
      contacto: d['cont-titulo'] || d['cont-nro'] || '',
      diligencia: d['dil-titulo'] || d['dil-nro'] || '',
      vigilancia: d['vig-titulo'] || d['vig-nro'] || '',
      reconocimiento: d['rec-titulo'] || d['rec-nro'] || '',
      seguridad: d['seg-titulo'] || d['seg-nro'] || '',
    };
    return map[tipo] || '-';
  }

  function getAllData() {
    const all = [];
    const pat = getCurrentPatrulla();
    Object.keys(STORE).forEach(tipo => {
      const items = getData(STORE[tipo]);
      items.forEach(item => {
        if (!pat || item._patrulla === pat) {
          all.push({ ...item, _tipo: tipo, _tipoLabel: TIPO_LABEL[tipo] });
        }
      });
    });
    return all;
  }

  // Filter consultas
  document.getElementById('btnConsultar').addEventListener('click', () => {
    const tipo = document.getElementById('cons-tipo').value;
    const fechaIni = document.getElementById('cons-fecha-ini').value;
    const fechaFin = document.getElementById('cons-fecha-fin').value;
    const busqueda = document.getElementById('cons-busqueda').value.toLowerCase().trim();

    let data = getAllData();
    if (tipo !== 'todos') data = data.filter(d => d._tipo === tipo);
    if (fechaIni) data = data.filter(d => d._fecha >= fechaIni);
    if (fechaFin) data = data.filter(d => d._fecha <= fechaFin);
    if (busqueda) {
      data = data.filter(d => Object.values(d).join(' ').toLowerCase().includes(busqueda));
    }
    showConsultas(data);
  });

  document.getElementById('btnLimpiarFiltros').addEventListener('click', () => {
    document.getElementById('cons-tipo').value = 'todos';
    document.getElementById('cons-fecha-ini').value = '';
    document.getElementById('cons-fecha-fin').value = '';
    document.getElementById('cons-busqueda').value = '';
    showConsultas();
  });

  // ---------- DASHBOARD ----------
  let chartTipo = null;

  function updateDashboard() {
    const allData = getAllData();
    const counts = { contacto: 0, diligencia: 0, vigilancia: 0, reconocimiento: 0, seguridad: 0 };
    allData.forEach(d => { if (counts[d._tipo] !== undefined) counts[d._tipo]++; });

    const casos = getCasosFiltered();
    const totalCasos = casos.length;
    const finalizados = casos.filter(c => {
      const comp = c.completado || {};
      const segOk = comp['seguridad'] && !comp['seguridad'].pendiente;
      return comp['contacto'] && comp['diligencia'] && segOk;
    }).length;
    const pendientes = casos.filter(c => {
      const comp = c.completado || {};
      return comp['seguridad'] && comp['seguridad'].pendiente;
    }).length;

    document.getElementById('count-expedientes').textContent = totalCasos;
    document.getElementById('count-pendientes').textContent = pendientes;
    document.getElementById('count-finalizados').textContent = finalizados;
    document.getElementById('count-contacto').textContent = counts.contacto;
    document.getElementById('count-diligencia').textContent = counts.diligencia;
    document.getElementById('count-vigilancia').textContent = counts.vigilancia;
    document.getElementById('count-reconocimiento').textContent = counts.reconocimiento;
    document.getElementById('count-seguridad').textContent = counts.seguridad;
    drawCharts(allData, counts);
  }

  function drawCharts(allData, counts) {
    const tipos = ['contacto', 'diligencia', 'reconocimiento', 'vigilancia', 'seguridad'];
    const labels = tipos.map(t => TIPO_LABEL[t]);
    const values = tipos.map(t => counts[t]);
    const colors = ['#1a237e', '#2e7d32', '#00838f', '#f57f17', '#c62828'];

    const ctx1 = document.getElementById('chartTipo').getContext('2d');
    if (chartTipo) chartTipo.destroy();
    chartTipo = new Chart(ctx1, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Cantidad', data: values,
          backgroundColor: colors.map(c => c + 'cc'),
          borderColor: colors, borderWidth: 2, borderRadius: 4,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } }, x: { grid: { display: false } } },
      },
    });
  }

  // ---------- USER MANAGEMENT (admin modal) ----------
  function showUserMgmtModal() {
    const existing = document.getElementById('userMgmtModal');
    if (existing) { existing.remove(); return; }

    const div = document.createElement('div');
    div.id = 'userMgmtModal';
    div.className = 'user-mgmt-modal';
    div.innerHTML = `
      <div class="user-mgmt-modal-box user-mgmt-modal-lg">
        <div class="modal-header">
          <i class="fas fa-users-gear" style="color:var(--primary)"></i>
          <h3>Gestión de Usuarios</h3>
          <button id="umCloseBtn" class="btn-close">&times;</button>
        </div>
        <div class="table-container">
          <table class="data-table" id="usersTable">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Rol</th>
                <th>Patrulla</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody id="usersTableBody"></tbody>
          </table>
        </div>
        <div class="form-actions" style="border:none;padding-top:12px">
          <button id="btnAddUser" class="btn-primary"><i class="fas fa-user-plus"></i> Agregar Usuario</button>
        </div>
      </div>`;
    document.body.appendChild(div);

    document.getElementById('umCloseBtn').addEventListener('click', () => div.remove());
    div.addEventListener('click', e => { if (e.target === div) div.remove(); });

    document.getElementById('btnAddUser').addEventListener('click', () => {
      showUserFormModal(null, () => renderUsersTable());
    });

    renderUsersTable();
  }

  function renderUsersTable() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;
    const users = getUsers();
    tbody.innerHTML = users.map(u => {
      const role = u.isAdmin ? 'Administrador' : (u.patrulla ? `Patrulla N° ${u.patrulla}` : 'Usuario');
      return `<tr>
        <td><strong>${u.user}</strong></td>
        <td>${role}</td>
        <td>${u.patrulla ? `P-${u.patrulla}` : '-'}</td>
        <td style="white-space:nowrap">
          ${u.isAdmin ? '' : `
            <button class="btn-user-edit" data-user="${u.user}" title="Editar usuario"><i class="fas fa-pen"></i></button>
            <button class="btn-user-reset" data-user="${u.user}" title="Restablecer contraseña"><i class="fas fa-key"></i></button>
            <button class="btn-user-delete" data-user="${u.user}" title="Eliminar usuario"><i class="fas fa-trash"></i></button>
          `}
        </td>
      </tr>`;
    }).join('');

    tbody.querySelectorAll('.btn-user-reset').forEach(btn => {
      btn.addEventListener('click', () => {
        const username = btn.dataset.user;
        const newPass = prompt(`Nueva contraseña para "${username}":`);
        if (newPass && newPass.trim().length >= 4) {
          const users = getUsers();
          const u = users.find(x => x.user === username);
          if (u) { u.pass = newPass.trim(); setUsers(users); alert(`Contraseña de "${username}" actualizada.`); }
        } else if (newPass) { alert('La contraseña debe tener al menos 4 caracteres.'); }
      });
    });

    tbody.querySelectorAll('.btn-user-edit').forEach(btn => {
      btn.addEventListener('click', () => {
        const username = btn.dataset.user;
        const users = getUsers();
        const u = users.find(x => x.user === username);
        if (u) showUserFormModal(u, () => renderUsersTable());
      });
    });

    tbody.querySelectorAll('.btn-user-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        const username = btn.dataset.user;
        if (!confirm(`¿Eliminar al usuario "${username}"? No se puede deshacer.`)) return;
        let users = getUsers();
        users = users.filter(u => u.user !== username);
        setUsers(users);
        renderUsersTable();
      });
    });
  }

  function showUserFormModal(userToEdit, onSave) {
    const existing = document.getElementById('userFormModal');
    if (existing) existing.remove();

    const isEdit = !!userToEdit;
    const div = document.createElement('div');
    div.id = 'userFormModal';
    div.className = 'user-mgmt-modal';
    div.innerHTML = `
      <div class="user-mgmt-modal-box">
        <h3><i class="fas ${isEdit ? 'fa-user-pen' : 'fa-user-plus'}"></i> ${isEdit ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
        <div class="form-group">
          <label for="umUser">Usuario</label>
          <input type="text" id="umUser" value="${isEdit ? userToEdit.user : ''}" ${isEdit ? 'readonly' : ''} style="${isEdit ? 'background:#f5f5f5;color:#999' : ''}">
        </div>
        <div class="form-group">
          <label for="umPass">Contraseña</label>
          <input type="password" id="umPass" placeholder="${isEdit ? 'Dejar vacío para mantener la actual' : 'Contraseña'}" ${isEdit ? '' : 'required'}>
        </div>
        <div class="form-group">
          <label for="umPassConfirm">Confirmar Contraseña</label>
          <input type="password" id="umPassConfirm" placeholder="Repita la contraseña">
        </div>
        <div class="form-group">
          <label for="umPatrulla">Patrulla (opcional)</label>
          <select id="umPatrulla">
            <option value="">Sin patrulla</option>
            ${Array.from({length: 7}, (_, i) => {
              const n = i + 1;
              const sel = isEdit && userToEdit.patrulla === n ? 'selected' : '';
              return `<option value="${n}" ${sel}>Patrulla N° ${n}</option>`;
            }).join('')}
          </select>
        </div>
        <div id="umError" class="login-error hidden"><i class="fas fa-exclamation-circle"></i> <span id="umErrorMsg"></span></div>
        <div class="form-actions">
          <button id="umSaveBtn" class="btn-primary"><i class="fas fa-save"></i> ${isEdit ? 'Guardar Cambios' : 'Crear Usuario'}</button>
          <button id="umCancelBtn" class="btn-secondary"><i class="fas fa-times"></i> Cancelar</button>
        </div>
      </div>`;
    document.body.appendChild(div);

    document.getElementById('umCancelBtn').addEventListener('click', () => div.remove());
    div.addEventListener('click', e => { if (e.target === div) div.remove(); });
    document.getElementById('umSaveBtn').addEventListener('click', () => {
      const user = document.getElementById('umUser').value.trim();
      const pass = document.getElementById('umPass').value;
      const confirm = document.getElementById('umPassConfirm').value;
      const patrulla = document.getElementById('umPatrulla').value ? parseInt(document.getElementById('umPatrulla').value) : null;
      const errEl = document.getElementById('umError');
      const errMsg = document.getElementById('umErrorMsg');
      errEl.classList.add('hidden');

      if (!user) { errMsg.textContent = 'El nombre de usuario es obligatorio.'; errEl.classList.remove('hidden'); return; }

      if (isEdit) {
        const users = getUsers();
        const u = users.find(x => x.user === userToEdit.user);
        if (!u) return;
        if (pass) {
          if (pass.length < 4) { errMsg.textContent = 'La contraseña debe tener al menos 4 caracteres.'; errEl.classList.remove('hidden'); return; }
          if (pass !== confirm) { errMsg.textContent = 'Las contraseñas no coinciden.'; errEl.classList.remove('hidden'); return; }
          u.pass = pass;
        }
        u.patrulla = patrulla;
        setUsers(users);
        alert(`Usuario "${user}" actualizado.`);
      } else {
        if (!pass || pass.length < 4) { errMsg.textContent = 'La contraseña debe tener al menos 4 caracteres.'; errEl.classList.remove('hidden'); return; }
        if (pass !== confirm) { errMsg.textContent = 'Las contraseñas no coinciden.'; errEl.classList.remove('hidden'); return; }
        if (userExists(user)) { errMsg.textContent = 'El usuario ya existe.'; errEl.classList.remove('hidden'); return; }
        addUser(user, pass, patrulla);
        alert(`Usuario "${user}" creado.`);
      }
      div.remove();
      if (onSave) onSave();
    });
  }

  document.getElementById('btnUserMgmt')?.addEventListener('click', showUserMgmtModal);

  // ---------- CRONOLÓGICO POR N° (con filtro) ----------
  let _cronoFiltro = 'todos';

  function cargarCronologico(filtro) {
    _cronoFiltro = filtro || 'todos';
    const container = document.getElementById('cronologico-container');
    const tbody = document.getElementById('tbodyCronologico');
    const filtroLabel = document.getElementById('crono-filtro-label');
    const allData = getAllData();

    // Highlight active card
    document.querySelectorAll('.clickable-card').forEach(c => c.classList.remove('active-filter'));
    const activeCard = document.querySelector(`.clickable-card[data-filtro="${_cronoFiltro}"]`);
    if (activeCard) activeCard.classList.add('active-filter');

    // Filter data
    let filtered = allData;
    if (_cronoFiltro === 'pendientes') {
      const casos = getCasosFiltered();
      const pendIds = new Set(casos.filter(c => {
        const comp = c.completado || {};
        return comp['seguridad'] && comp['seguridad'].pendiente;
      }).map(c => c.id));
      filtered = allData.filter(d => pendIds.has(d._casoId));
    } else if (_cronoFiltro === 'finalizados') {
      const casos = getCasosFiltered();
      const finIds = new Set(casos.filter(c => {
        const comp = c.completado || {};
        const segOk = comp['seguridad'] && !comp['seguridad'].pendiente;
        return comp['contacto'] && comp['diligencia'] && segOk;
      }).map(c => c.id));
      filtered = allData.filter(d => finIds.has(d._casoId));
    } else if (_cronoFiltro !== 'todos') {
      filtered = allData.filter(d => d._tipo === _cronoFiltro);
    }

    // Update label
    const labels = { todos: 'Todos', pendientes: 'Pendientes', finalizados: 'Finalizados', contacto: 'Contactos', diligencia: 'Diligencias', reconocimiento: 'Reconocimientos', vigilancia: 'Vigilancias', seguridad: 'Seguridad' };
    filtroLabel.textContent = `Filtrando: ${labels[_cronoFiltro] || _cronoFiltro}`;

    // Collect entries with N°
    const entries = [];
    filtered.forEach(d => {
      const nro = d[`${d._tipo === 'contacto' ? 'cont' : d._tipo === 'diligencia' ? 'dil' : d._tipo === 'reconocimiento' ? 'rec' : d._tipo === 'vigilancia' ? 'vig' : 'seg'}-nro`];
      if (nro) entries.push({ ...d, _nro: nro });
    });

    entries.sort((a, b) => String(a._nro).localeCompare(String(b._nro), undefined, { numeric: true }));

    if (!entries.length) {
      tbody.innerHTML = '<tr><td colspan="7" class="empty-msg">No hay archivos con N° registrado</td></tr>';
    } else {
      tbody.innerHTML = entries.map((d, i) => {
        const tipoLabel = TIPO_LABEL[d._tipo] || d._tipo;
        return `<tr>
          <td>${i + 1}</td>
          <td>${tipoLabel}</td>
          <td>${d._casoLabel || d._casoId || '-'}</td>
          <td><strong>${d._nro}</strong></td>
          <td>${formatDate(d._fecha)}</td>
          <td>${truncate(getFieldSummary(d, d._tipo), 50)}</td>
          <td><button class="btn-view" data-id="${d.id}" data-tipo="${d._tipo}"><i class="fas fa-eye"></i></button></td>
        </tr>`;
      }).join('');

      tbody.querySelectorAll('.btn-view').forEach(btn => {
        btn.addEventListener('click', () => {
          const tipo = btn.dataset.tipo;
          const id = btn.dataset.id;
          const records = getData(STORE[tipo]);
          const record = records.find(r => r.id === id);
          if (record) showPreview(record, tipo);
        });
      });
    }

    container.style.display = '';
  }

  // Click handlers for dashboard cards
  document.querySelectorAll('.clickable-card').forEach(card => {
    card.addEventListener('click', () => {
      cargarCronologico(card.dataset.filtro);
    });
  });

  // "Cargar todo" resets filter
  document.getElementById('btnCronologico').addEventListener('click', () => {
    cargarCronologico('todos');
  });

  // ---------- EXPORT ----------
  document.getElementById('btnExportar').addEventListener('click', () => {
    const allData = getAllData();
    if (allData.length === 0) { alert('No hay datos para exportar.'); return; }

    const rows = [['Tipo', 'Expediente', 'Fecha', 'Hora', 'Ubicación', 'Resumen', 'ID']];
    allData.forEach(d => {
      rows.push([TIPO_LABEL[d._tipo] || '', d._casoLabel || d._casoId || '', d._fecha || '', d._hora || '', getLocation(d, d._tipo), getFieldSummary(d, d._tipo), d.id]);
    });

    const csv = rows.map(r => r.map(c => `"${(c || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `informes_patrullas_${today()}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  });

  // ---------- INIT ----------
  navigateTo('expedientes');
})();
