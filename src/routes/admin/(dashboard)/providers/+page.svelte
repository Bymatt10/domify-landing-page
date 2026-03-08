<script lang="ts">
  import { onMount } from 'svelte';
  import { debounce } from '$lib/utils';

  let providers: any[] = [];
  let loading = true;
  let error = '';
  let total = 0;
  let page = 1;
  let totalPages = 1;
  let limit = 10;
  let search = '';

  let showModal = false;
  let selectedProvider: any = null;
  let categories: any[] = [];
  let isEditing = false;
  let saving = false;
  let editForm = {
    business_name: '',
    hourly_rate: 0,
    location: '',
    phone: '',
    email: '',
    categories: [] as number[]
  };

  let toastMessage = '';
  let toastType: 'success' | 'error' = 'success';
  let showToast = false;

  function notify(message: string, type: 'success' | 'error' = 'success') {
    toastMessage = message;
    toastType = type;
    showToast = true;
    setTimeout(() => { showToast = false; }, 3500);
  }

  function viewProvider(provider: any) {
    selectedProvider = provider;
    showModal = true;
    isEditing = false;
    editForm = {
      business_name: provider.business_name || '',
      hourly_rate: provider.hourly_rate || 0,
      location: provider.location || '',
      phone: provider.phone || '',
      email: provider.user?.email || '',
      categories: provider.categories ? provider.categories.map((c: any) => c.id) : []
    };
  }

  function startEditing() { isEditing = true; }

  function cancelEditing() {
    isEditing = false;
    editForm = {
      business_name: selectedProvider.business_name || '',
      hourly_rate: selectedProvider.hourly_rate || 0,
      location: selectedProvider.location || '',
      phone: selectedProvider.phone || '',
      email: selectedProvider.user?.email || '',
      categories: selectedProvider.categories ? selectedProvider.categories.map((c: any) => c.id) : []
    };
  }

  async function saveProvider() {
    if (!selectedProvider) return;
    saving = true;
    try {
      const res = await fetch(`/api/admin/providers/${selectedProvider.user_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_name: editForm.business_name,
          hourly_rate: editForm.hourly_rate,
          location: editForm.location,
          phone: editForm.phone,
          email: editForm.email,
          category_ids: editForm.categories
        })
      });
      if (res.ok) {
        await loadProviders();
        const updated = providers.find(p => p.user_id === selectedProvider.user_id);
        if (updated) {
          selectedProvider = updated;
          editForm = {
            business_name: updated.business_name || '',
            hourly_rate: updated.hourly_rate || 0,
            location: updated.location || '',
            phone: updated.phone || '',
            email: updated.user?.email || '',
            categories: updated.categories ? updated.categories.map((c: any) => c.id) : []
          };
        }
        isEditing = false;
        notify('Proveedor actualizado correctamente');
      } else {
        const d = await res.json();
        notify(d.error || 'Error al actualizar', 'error');
      }
    } catch (e) {
      notify('Error al guardar', 'error');
    } finally {
      saving = false;
    }
  }

  function closeModal() { showModal = false; selectedProvider = null; isEditing = false; }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && showModal) {
      if (isEditing) cancelEditing(); else closeModal();
    }
  }

  async function loadProviders() {
    loading = true; error = '';
    const url = new URL('/api/admin/providers', window.location.origin);
    url.searchParams.set('page', page.toString());
    url.searchParams.set('limit', limit.toString());
    url.searchParams.set('search', search);
    try {
      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        providers = data.providers; total = data.total; totalPages = data.totalPages;
      } else {
        const data = await res.json();
        error = data.error || 'Error al cargar proveedores';
      }
    } catch (e) { error = (e as Error).message; }
    finally { loading = false; }
  }

  async function loadCategories() {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        categories = data?.data?.categories || [];
      }
    } catch (_) { /* ignore */ }
  }

  onMount(() => {
    Promise.all([loadProviders(), loadCategories()]);
    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  });

  const handleSearch = debounce(() => { page = 1; loadProviders(); }, 300);
  function goToPage(n: number) { if (n > 0 && n <= totalPages) { page = n; loadProviders(); } }

  function fmtDate(d: string) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('es-NI', { year: 'numeric', month: 'short', day: 'numeric' });
  }
  function fmtCurrency(a: number) {
    return new Intl.NumberFormat('es-NI', { style: 'currency', currency: 'NIO' }).format(a || 0);
  }
  function initials(name: string) {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
  }
  const colors = ['#6366f1','#8b5cf6','#ec4899','#f43f5e','#f97316','#14b8a6','#06b6d4','#3b82f6'];
  function avatarBg(name: string) {
    let h = 0;
    for (let i = 0; i < (name||'').length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
    return colors[Math.abs(h) % colors.length];
  }
</script>

<div class="page">
  <!-- Header -->
  <div class="header">
    <div class="header-left">
      <div class="header-icon">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
      </div>
      <div>
        <h1>Proveedores</h1>
        <p class="header-sub">Gestiona los perfiles de los proveedores de Domify</p>
      </div>
    </div>
    <div class="header-badge">
      <span class="badge-number">{total}</span>
      <span class="badge-label">Registrados</span>
    </div>
  </div>

  <!-- Search -->
  <div class="toolbar">
    <div class="search-box">
      <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
      <input type="text" bind:value={search} on:input={handleSearch} placeholder="Buscar por nombre, email, teléfono..." aria-label="Buscar proveedores" />
      {#if search}
        <button class="search-clear" on:click={() => { search = ''; handleSearch(); }} aria-label="Limpiar búsqueda">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      {/if}
    </div>
  </div>

  <!-- Content -->
  {#if loading}
    <div class="state-box">
      <div class="loader"><div></div><div></div><div></div></div>
      <p>Cargando proveedores...</p>
    </div>
  {:else if error}
    <div class="state-box error-box">
      <p class="error-title">Error al cargar datos</p>
      <p class="error-msg">{error}</p>
      <button class="btn btn-primary" on:click={loadProviders}>Reintentar</button>
    </div>
  {:else if providers.length === 0}
    <div class="state-box">
      <p class="empty-title">No se encontraron proveedores</p>
      <p class="empty-sub">No hay resultados que coincidan con la búsqueda actual.</p>
    </div>
  {:else}
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>UUID</th>
            <th>Proveedor</th>
            <th>Contacto</th>
            <th>Categorías</th>
            <th>Ubicación</th>
            <th>Tarifa/h</th>
            <th>Registro</th>
            <th class="th-actions">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {#each providers as p}
            <tr>
              <td><span class="cell-uuid">{p.user_id?.slice(0, 8)}</span></td>
              <td>
                <div class="cell-provider">
                  <div class="avatar-sm" style="background:{avatarBg(p.business_name)}">
                    {initials(p.business_name)}
                  </div>
                  <div class="provider-name">{p.business_name || 'Sin nombre'}</div>
                </div>
              </td>
              <td>
                <div class="cell-contact">
                  <span class="contact-email">{p.user?.email || 'Sin email'}</span>
                  <span class="contact-phone">{p.phone || '—'}</span>
                </div>
              </td>
              <td>
                <div class="cell-cats">
                  {#if p.categories && p.categories.length > 0}
                    {#each p.categories.slice(0, 2) as cat}
                      <span class="cat-tag">{cat.name}</span>
                    {/each}
                    {#if p.categories.length > 2}
                      <span class="cat-tag cat-more">+{p.categories.length - 2}</span>
                    {/if}
                  {:else}
                    <span class="no-cat">Sin categorías</span>
                  {/if}
                </div>
              </td>
              <td><span class="cell-location">{p.location || '—'}</span></td>
              <td><span class="cell-rate">{fmtCurrency(p.hourly_rate)}</span></td>
              <td><span class="cell-date">{fmtDate(p.created_at)}</span></td>
              <td class="td-actions">
                <button class="btn-action" on:click={() => viewProvider(p)} aria-label="Ver detalles de {p.business_name}">
                  Ver
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 18 6-6-6-6"/></svg>
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="pagination">
      <span class="pag-info">{providers.length} de {total} proveedores</span>
      <div class="pag-controls">
        <button class="pag-btn" on:click={() => goToPage(page - 1)} disabled={page <= 1} aria-label="Página anterior">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        {#each Array(totalPages) as _, i}
          {#if totalPages <= 7 || i === 0 || i === totalPages - 1 || Math.abs(i + 1 - page) <= 1}
            <button class="pag-btn" class:active={page === i+1} on:click={() => goToPage(i+1)} aria-label="Ir a página {i+1}">{i+1}</button>
          {:else if Math.abs(i + 1 - page) === 2}
            <span class="pag-dots">...</span>
          {/if}
        {/each}
        <button class="pag-btn" on:click={() => goToPage(page + 1)} disabled={page >= totalPages} aria-label="Página siguiente">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>
    </div>
  {/if}
</div>

<!-- Modal -->
{#if showModal && selectedProvider}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="overlay" on:click={closeModal}>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="modal" on:click|stopPropagation>
      <div class="modal-head">
        <div class="modal-head-left">
          <div class="avatar-md" style="background:{avatarBg(selectedProvider.business_name)}">
            {initials(selectedProvider.business_name)}
          </div>
          <div>
            <h2>{selectedProvider.business_name || 'Sin nombre'}</h2>
            <span class="modal-sub">{selectedProvider.user?.email || ''}</span>
          </div>
        </div>
        <button class="modal-x" on:click={closeModal} aria-label="Cerrar modal">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>

      <div class="modal-body">
        {#if isEditing}
          <div class="form-grid">
            <div class="field">
              <label for="f-name">Nombre del Negocio</label>
              <input id="f-name" type="text" bind:value={editForm.business_name} />
            </div>
            <div class="field">
              <label for="f-email">Email</label>
              <input id="f-email" type="email" bind:value={editForm.email} />
            </div>
            <div class="field">
              <label for="f-phone">Teléfono</label>
              <input id="f-phone" type="tel" bind:value={editForm.phone} />
            </div>
            <div class="field">
              <label for="f-location">Ubicación</label>
              <input id="f-location" type="text" bind:value={editForm.location} />
            </div>
            <div class="field">
              <label for="f-rate">Tarifa por Hora (C$)</label>
              <input id="f-rate" type="number" min="0" step="0.01" bind:value={editForm.hourly_rate} />
            </div>
          </div>
          <div class="field full">
            <span class="label-txt">Categorías</span>
            <div class="cats-grid">
              {#each categories as cat}
                <label class="cat-option" class:selected={editForm.categories.includes(cat.id)}>
                  <input type="checkbox" value={cat.id} bind:group={editForm.categories} />
                  <span>{cat.name}</span>
                </label>
              {/each}
              {#if categories.length === 0}
                <p class="muted">Cargando categorías...</p>
              {/if}
            </div>
          </div>
        {:else}
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">Email</span>
              <span class="detail-value">{selectedProvider.user?.email || '—'}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Teléfono</span>
              <span class="detail-value">{selectedProvider.phone || '—'}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Ubicación</span>
              <span class="detail-value">{selectedProvider.location || '—'}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Tarifa/hora</span>
              <span class="detail-value">{fmtCurrency(selectedProvider.hourly_rate)}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Calificación</span>
              <span class="detail-value">{selectedProvider.rating || 0} / 5</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Registro</span>
              <span class="detail-value">{fmtDate(selectedProvider.created_at)}</span>
            </div>
          </div>

          <div class="section">
            <h4>Categorías</h4>
            {#if selectedProvider.categories && selectedProvider.categories.length > 0}
              <div class="cats-display">
                {#each selectedProvider.categories as cat}
                  <span class="cat-display-tag">{cat.name}</span>
                {/each}
              </div>
            {:else}
              <p class="muted-box">Sin categorías asignadas. Edita para asignar una.</p>
            {/if}
          </div>

          <div class="section">
            <h4>Información técnica</h4>
            <div class="tech-grid">
              <div class="tech-row"><span class="tech-label">ID Usuario</span><code>{selectedProvider.user_id}</code></div>
              <div class="tech-row"><span class="tech-label">ID Perfil</span><code>{selectedProvider.id}</code></div>
            </div>
          </div>
        {/if}
      </div>

      <div class="modal-foot">
        {#if isEditing}
          <button class="btn btn-ghost" on:click={cancelEditing} disabled={saving}>Cancelar</button>
          <button class="btn btn-primary" on:click={saveProvider} disabled={saving}>
            {#if saving}<span class="spin"></span>Guardando...{:else}Guardar cambios{/if}
          </button>
        {:else}
          <button class="btn btn-ghost" on:click={closeModal}>Cerrar</button>
          <button class="btn btn-primary" on:click={startEditing}>Editar proveedor</button>
        {/if}
      </div>
    </div>
  </div>
{/if}

{#if showToast}
  <div class="toast" class:t-ok={toastType==='success'} class:t-err={toastType==='error'}>{toastMessage}</div>
{/if}

<style>
  .page { padding: 2rem; font-family: 'Inter', -apple-system, sans-serif; }

  /* Header */
  .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.75rem; }
  .header-left { display: flex; align-items: center; gap: 0.875rem; }
  .header-icon {
    width: 46px; height: 46px; border-radius: 12px; display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; box-shadow: 0 4px 12px rgba(99,102,241,0.3);
  }
  .header h1 { font-size: 1.5rem; font-weight: 800; color: #0f172a; margin: 0; letter-spacing: -0.01em; }
  .header-sub { margin: 0.15rem 0 0; color: #64748b; font-size: 0.8rem; }
  .header-badge {
    display: flex; flex-direction: column; align-items: center; padding: 0.6rem 1.1rem;
    background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px;
  }
  .badge-number { font-size: 1.35rem; font-weight: 800; color: #0284c7; line-height: 1; }
  .badge-label { font-size: 0.6rem; color: #0369a1; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600; }

  /* Search Aligned Right */
  .toolbar { margin-bottom: 1.25rem; display: flex; justify-content: flex-end; }
  .search-box {
    position: relative; width: 100%; max-width: 400px;
  }
  .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; pointer-events: none; }
  .field label, .label-txt { font-size: 0.75rem; font-weight: 600; color: #475569; display: block; margin-bottom: 0.2rem; }
  .field input {
    padding: 0.6rem 0.8rem; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 0.85rem;
    background: #f8fafc; color: #1e293b; transition: all 0.2s;
  }
  .search-box input:focus { outline: none; border-color: #818cf8; background: #fff; box-shadow: 0 0 0 3px rgba(129,140,248,0.08); }
  .search-clear {
    position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: #e2e8f0; border: none;
    border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #64748b;
  }

  /* Table */
  .table-wrap {
    background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  }
  table { width: 100%; border-collapse: collapse; min-width: 900px; }
  th {
    padding: 0.75rem 1rem; text-align: left; font-size: 0.65rem; font-weight: 700; color: #64748b;
    text-transform: uppercase; letter-spacing: 0.05em; background: #f8fafc; border-bottom: 1px solid #e2e8f0;
  }
  td { padding: 0.8rem 1rem; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
  tbody tr:hover { background: #f8fafc; }
  .th-actions, .td-actions { text-align: right; }

  .cell-uuid { font-family: monospace; font-size: 0.7rem; color: #94a3b8; background: #f1f5f9; padding: 0.15rem 0.4rem; border-radius: 4px; }
  .cell-provider { display: flex; align-items: center; gap: 0.6rem; }
  .avatar-sm {
    width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center;
    color: #fff; font-weight: 700; font-size: 0.65rem; flex-shrink: 0;
  }
  .provider-name { font-weight: 600; color: #0f172a; font-size: 0.8rem; }

  .cell-contact { display: flex; flex-direction: column; gap: 0.1rem; }
  .contact-email { font-size: 0.75rem; color: #334155; }
  .contact-phone { font-size: 0.65rem; color: #94a3b8; }

  .cell-cats { display: flex; flex-wrap: wrap; gap: 0.25rem; }
  .cat-tag {
    padding: 0.15rem 0.45rem; background: #eef2ff; color: #4338ca; border-radius: 6px;
    font-size: 0.6rem; font-weight: 600; white-space: nowrap;
  }
  .cat-more { background: #f1f5f9; color: #64748b; }
  .no-cat { font-size: 0.65rem; color: #cbd5e1; font-style: italic; }
  .cell-location { font-size: 0.75rem; color: #475569; }
  .cell-rate { font-size: 0.75rem; color: #334155; font-weight: 600; }
  .cell-date { font-size: 0.7rem; color: #94a3b8; }

  .btn-action {
    display: inline-flex; align-items: center; gap: 0.2rem; padding: 0.35rem 0.7rem;
    background: linear-gradient(135deg, #6366f1, #7c3aed); color: #fff; border: none; border-radius: 7px;
    font-size: 0.65rem; font-weight: 600; cursor: pointer; transition: all 0.2s;
  }

  /* Reused other styles from before */
  .state-box { text-align: center; padding: 4rem 2rem; color: #64748b; }
  .loader { display: flex; gap: 0.4rem; justify-content: center; margin-bottom: 0.75rem; }
  .loader div { width: 10px; height: 10px; border-radius: 50%; background: #818cf8; animation: bounce 1.4s infinite ease-in-out both; }
  @keyframes bounce { 0%,80%,100%{transform:scale(0.35);opacity:0.4}40%{transform:scale(1);opacity:1} }
  .pagination { display: flex; justify-content: space-between; align-items: center; padding: 1rem 0; }
  .pag-info { font-size: 0.75rem; color: #64748b; }
  .pag-controls { display: flex; gap: 0.3rem; align-items: center; }
  .pag-btn { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border: 1px solid #e2e8f0; border-radius: 8px; background: #fff; font-size: 0.75rem; font-weight: 600; cursor: pointer; }
  .pag-btn.active { background: linear-gradient(135deg,#6366f1,#7c3aed); color: #fff; border-color: transparent; }
  .pag-btn:disabled { opacity: 0.35; }
  
  .overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.55); backdrop-filter: blur(5px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
  .modal { background: #fff; border-radius: 16px; width: 92%; max-width: 640px; max-height: 88vh; overflow: hidden; box-shadow: 0 20px 50px -12px rgba(0,0,0,0.25); }
  .modal-head { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.75rem; border-bottom: 1px solid #f1f5f9; background: #fafbfc; }
  .modal-head-left { display: flex; align-items: center; gap: 0.875rem; }
  .avatar-md { width: 42px; height: 42px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 0.9rem; }
  .modal-body { padding: 1.5rem 1.75rem; max-height: 56vh; overflow-y: auto; }
  .detail-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
  .section h4 { font-size: 0.8rem; font-weight: 700; margin: 0 0 0.6rem; border-bottom: 1px solid #f1f5f9; }
  .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; }
  .cats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 0.4rem; }
  .cat-option { display: flex; align-items: center; gap: 0.4rem; padding: 0.55rem 0.7rem; border: 1.5px solid #e2e8f0; border-radius: 8px; cursor: pointer; font-size: 0.8rem; }
  .cat-option.selected { border-color: #818cf8; background: #eef2ff; color: #4338ca; }
  .modal-foot { display: flex; justify-content: flex-end; gap: 0.6rem; padding: 1rem 1.75rem; border-top: 1px solid #f1f5f9; background: #fafbfc; }
  .btn { padding: 0.5rem 1.1rem; border: none; border-radius: 8px; font-size: 0.8rem; font-weight: 600; cursor: pointer; }
  .btn-primary { background: linear-gradient(135deg,#6366f1,#7c3aed); color: #fff; }
  .btn-ghost { background: #fff; color: #64748b; border: 1px solid #e2e8f0; }
  .toast { position: fixed; bottom: 1.5rem; right: 1.5rem; padding: 0.75rem 1.3rem; border-radius: 10px; font-size: 0.8rem; font-weight: 600; z-index: 2000; }
  .t-ok { background: #ecfdf5; color: #065f46; border: 1px solid #6ee7b7; }
</style>