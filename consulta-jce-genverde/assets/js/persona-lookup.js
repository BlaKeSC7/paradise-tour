/* =========================================================================
   GenVerde · Verificación de cédula con JCE (persona_segura)
   Consentimiento Ley 172-13 · la API key vive solo server-side.
   ========================================================================= */
(function () {
  'use strict';

  const box = document.querySelector('[data-jce]');
  if (!box) return;

  const endpoint = box.getAttribute('data-endpoint');
  const csrf = box.getAttribute('data-csrf');

  const cedula = document.getElementById('af-cedula');
  const consent = document.getElementById('jce-consent');
  const btn = document.getElementById('jce-lookup-btn');
  const btnLabel = box.querySelector('[data-jce-label]');
  const statusEl = document.getElementById('jce-status');
  const result = document.getElementById('jce-result');
  const photo = document.getElementById('jce-photo');
  const extra = document.getElementById('jce-extra');

  const fNombre = document.getElementById('af-nombre');
  const fApellido = document.getElementById('af-apellido');
  const fFecha = document.getElementById('af-fecha');
  const fProvincia = document.getElementById('af-provincia');
  const fMunicipio = document.getElementById('af-municipio');

  const digits = (v) => (v || '').replace(/\D/g, '');

  const titleCase = (s) =>
    (s || '')
      .toLowerCase()
      .replace(/\b([a-záéíóúñ])/g, (m) => m.toUpperCase());

  function refreshButton() {
    btn.disabled = !(consent.checked && digits(cedula.value).length === 11);
  }

  function setStatus(type, msg) {
    statusEl.className =
      'mt-2 flex items-center gap-1.5 text-xs font-medium ' +
      (type === 'error'
        ? 'text-red-600 dark:text-red-400'
        : type === 'success'
        ? 'text-brand-700 dark:text-brand-300'
        : 'text-ink/60 dark:text-slate-400');
    statusEl.textContent = msg;
    statusEl.classList.toggle('hidden', !msg);
  }

  function lockField(el, value) {
    if (!el) return;
    if (value != null && value !== '') el.value = value;
    el.readOnly = true;
    el.classList.add('is-jce-verified');
  }

  cedula.addEventListener('input', () => {
    // Si editan la cédula, se rompe la verificación previa.
    refreshButton();
  });
  consent.addEventListener('change', refreshButton);
  refreshButton();

  btn.addEventListener('click', async function () {
    const ced = digits(cedula.value);
    if (ced.length !== 11) {
      setStatus('error', 'La cédula debe tener 11 dígitos.');
      return;
    }
    if (!consent.checked) {
      setStatus('error', 'Debes marcar el consentimiento del titular.');
      return;
    }

    btn.disabled = true;
    const original = btnLabel.textContent;
    btnLabel.textContent = 'Verificando…';
    setStatus('loading', 'Consultando la JCE…');

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrf,
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({ cedula: ced, consentimiento: true, incluir_imagen: true }),
      });
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg = (json && json.error && json.error.message) || 'No se pudo verificar la cédula.';
        setStatus('error', msg);
        return;
      }

      const d = json.data || {};
      lockField(fNombre, (d.nombre || '').toUpperCase());
      lockField(fApellido, (d.apellido || '').toUpperCase());
      if (d.fecha_nacimiento) lockField(fFecha, d.fecha_nacimiento);

      // Residencia (editable): se autocompleta desde la JCE pero se puede
      // cambiar (el lugar de la cédula puede no ser la residencia actual).
      // 1) Provincia: se fija y se dispara "change" para que la cascada cargue
      //    los municipios. 2) Luego se elige el municipio de la JCE.
      const normGeo = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '')
        .toUpperCase().replace(/[^A-Z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

      if (fProvincia && d.provincia) {
        let val = d.provincia;
        if (fProvincia.value !== val) {
          for (const opt of fProvincia.options) {
            if (opt.value.toLowerCase() === d.provincia.toLowerCase()) { val = opt.value; break; }
          }
        }
        fProvincia.value = val;
        fProvincia.dispatchEvent(new Event('change', { bubbles: true })); // -> llena municipios
      }

      if (fMunicipio && d.ciudad) {
        const target = normGeo(d.ciudad);
        let matched = '';
        for (const opt of fMunicipio.options) {
          if (!opt.value) continue;
          const nv = normGeo(opt.value);
          if (nv === target || nv.indexOf(target) === 0 || target.indexOf(nv) === 0) { matched = opt.value; break; }
        }
        if (matched) {
          fMunicipio.value = matched;
          fMunicipio.dispatchEvent(new Event('change', { bubbles: true })); // -> llena distritos
        }
      }

      // Foto
      if (d.imagen_url) {
        photo.src = d.imagen_url;
        result.classList.remove('hidden');
        result.classList.add('flex');
      }
      const detalles = [];
      if (d.sexo) detalles.push(d.sexo === 'M' ? 'Masculino' : 'Femenino');
      if (d.nacionalidad) detalles.push(d.nacionalidad);
      if (d.ciudad) detalles.push(d.ciudad);
      extra.textContent = detalles.join(' · ');

      const cacheNote = json.meta && json.meta.cached ? ' (desde caché)' : '';
      setStatus('success', 'Datos verificados con JCE — campos bloqueados' + cacheNote + '.');

      if (window.lucide) window.lucide.createIcons();
    } catch (e) {
      setStatus('error', 'Error de conexión. Inténtalo de nuevo.');
    } finally {
      btnLabel.textContent = original;
      refreshButton();
    }
  });
})();
