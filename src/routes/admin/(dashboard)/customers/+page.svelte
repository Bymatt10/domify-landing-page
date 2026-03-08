<script lang="ts">
  import { onMount } from 'svelte';
  import { debounce } from '$lib/utils';

  let customers: any[] = [];
  let loading = true;
  let error = '';
  let total = 0;
  let page = 1;
  let totalPages = 1;
  let limit = 10;
  let search = '';

  let showModal = false;
  let selectedCustomer: any = null;
  let customerDetails: any = null;
  let loadingDetails = false;
  let isEditing = false;
  let saving = false;
  let editForm = {
    first_name: '',
    last_name: '',
    phone_number: '',
    address: '',
    email: ''
  };

  let toastMessage = '';
  let toastType: 'success' | 'err' = 'success';
  let showToast = false;

  function notify(msg: string, type: 'success' | 'err' = 'success') {
    toastMessage = msg; toastType = type; showToast = true;
    setTimeout(() => showToast = false, 3500);
  }

  async function loadCustomers() {
    loading = true; error = '';
    const url = new URL('/api/admin/customers', window.location.origin);
    url.searchParams.set('page', page.toString());
    url.searchParams.set('limit', limit.toString());
    url.searchParams.set('search', search);

    try {
      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        customers = data.customers;
        total = data.total;
        totalPages = data.totalPages;
      } else {
        const d = await res.json();
        error = d.error || 'Fallo al cargar los clientes';
      }
    } catch (e) {
      error = (e as Error).message;
    } finally {
      loading = false;
    }
  }

  async function showCustomer(customer: any) {
    selectedCustomer = customer;
    showModal = true;
    loadingDetails = true;
    isEditing = false;
    editForm = {
      first_name: customer.first_name || '',
      last_name: customer.last_name || '',
      phone_number: customer.phone_number || '',
      address: customer.address || '',
      email: customer.email || ''
    };
    
    try {
      const res = await fetch(`/api/admin/customers/${customer.user_id}/details`);
      if (res.ok) customerDetails = await res.json();
      else customerDetails = null;
    } catch (e) {
      customerDetails = null;
    } finally {
      loadingDetails = false;
    }
  }

  function startEditing() { isEditing = true; }
  function cancelEditing() {
    isEditing = false;
    editForm = {
      first_name: selectedCustomer.first_name || '',
      last_name: selectedCustomer.last_name || '',
      phone_number: selectedCustomer.phone_number || '',
      address: selectedCustomer.address || '',
      email: selectedCustomer.email || ''
    };
  }

  async function saveCustomer() {
    if (!selectedCustomer) return;
    saving = true;
    try {
      const res = await fetch(`/api/admin/customers/${selectedCustomer.user_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });

      if (res.ok) {
        const updated = await res.json();
        await loadCustomers();
        const found = customers.find(c => c.user_id === selectedCustomer.user_id);
        if (found) {
          selectedCustomer = found;
          editForm = {
            first_name: found.first_name || '',
            last_name: found.last_name || '',
            phone_number: found.phone_number || '',
            address: found.address || '',
            email: found.user?.email || found.email || ''
          };
        }
        isEditing = false;
        notify('Cliente actualizado correctamente');
      } else {
        const d = await res.json();
        notify(d.error || 'Error al guardar', 'err');
      }
    } catch (e) {
      notify('Error de red', 'err');
    } finally {
      saving = false;
    }
  }

  function closeModal() { showModal = false; selectedCustomer = null; customerDetails = null; isEditing = false; }
  
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && showModal) {
      if (isEditing) cancelEditing(); else closeModal();
    }
  }

  onMount(() => {
    loadCustomers();
    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  });

  const handleSearch = debounce(() => { page = 1; loadCustomers(); }, 300);
  function goToPage(n: number) { if (n > 0 && n <= totalPages) { page = n; loadCustomers(); } }

  function fmtDate(d: string) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('es-NI', { year: 'numeric', month: 'short', day: 'numeric' });
  }
  function fmtCurrency(a: number) {
    return new Intl.NumberFormat('es-NI', { style: 'currency', currency: 'NIO' }).format(a || 0);
  }
  function initials(fn: string, ln: string) {
    if (!fn) return '?';
    return (fn[0] + (ln?.[0] || '')).toUpperCase();
  }
</script>

<div class="page">
  <!-- Header -->
  <div class="header">
    <div class="header-left">
      <div class="header-icon">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
      </div>
      <div>
        <h1>Clientes</h1>
        <p class="header-sub">Gestiona los perfiles de los clientes de Domify</p>
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
      <input type="text" bind:value={search} on:input={handleSearch} placeholder="Buscar por nombre, email, teléfono..." aria-label="Buscar clientes" />
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
      <p>Cargando clientes...</p>
    </div>
  {:else if error}
    <div class="state-box err-box">
      <p class="err-title">Error al cargar datos</p>
      <p class="err-msg">{error}</p>
      <button class="btn btn-primary" on:click={loadCustomers}>Reintentar</button>
    </div>
  {:else if customers.length === 0}
    <div class="state-box">
      <p class="empty-title">No se encontraron clientes</p>
      <p class="empty-sub">No hay resultados que coincidan con la búsqueda actual.</p>
    </div>
  {:else}
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>UUID</th>
            <th>Cliente</th>
            <th>Contacto</th>
            <th>Ubicación</th>
            <th>Estado</th>
            <th>Registro</th>
            <th class="th-actions">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {#each customers as c}
            <tr>
              <td><span class="cell-uuid">{c.user_id?.slice(0, 8)}</span></td>
              <td>
                <div class="cell-provider">
                  <div class="avatar-sm" style="background:#6366f1">
                    {initials(c.first_name, c.last_name)}
                  </div>
                  <div class="provider-name">
                    {c.first_name || 'Sin nombre'} {c.last_name || ''}
                  </div>
                </div>
              </td>
              <td>
                <div class="cell-contact">
                  <span class="contact-email">{c.user?.email || '—'}</span>
                  <span class="contact-phone">{c.phone_number || '—'}</span>
                </div>
              </td>
              <td><span class="cell-location">{c.address || '—'}</span></td>
              <td>
                <span class="badg" class:b-ok={c.is_active!==false} class:b-err={c.is_active===false}>
                  {c.is_active === false ? 'Inactivo' : 'Activo'}
                </span>
              </td>
              <td><span class="cell-date">{fmtDate(c.created_at)}</span></td>
              <td class="td-actions">
                <button class="btn-action" on:click={() => showCustomer(c)} aria-label="Ver detalles">
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
      <span class="pag-info">{customers.length} de {total} clientes</span>
      <div class="pag-controls">
        <button class="pag-btn" on:click={() => goToPage(page - 1)} disabled={page <= 1} aria-label="Página anterior">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        {#each Array(totalPages) as _, i}
          {#if totalPages <= 7 || i === 0 || i === totalPages - 1 || Math.abs(i + 1 - page) <= 1}
            <button class="pag-btn" class:active={page === i+1} on:click={() => goToPage(i+1)}>{i+1}</button>
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
{#if showModal && selectedCustomer}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="overlay" on:click={closeModal}>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="modal" on:click|stopPropagation>
      <div class="modal-head">
        <div class="modal-head-left">
          <div class="avatar-md" style="background:#6366f1">
            {initials(selectedCustomer.first_name, selectedCustomer.last_name)}
          </div>
          <div>
            <h2>{selectedCustomer.first_name || 'Sin nombre'} {selectedCustomer.last_name || ''}</h2>
            <span class="modal-sub">{selectedCustomer.user?.email || ''}</span>
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
              <label for="f-fn">Nombre</label>
              <input id="f-fn" type="text" bind:value={editForm.first_name} />
            </div>
            <div class="field">
              <label for="f-ln">Apellido</label>
              <input id="f-ln" type="text" bind:value={editForm.last_name} />
            </div>
            <div class="field">
              <label for="f-email">Email</label>
              <input id="f-email" type="email" bind:value={editForm.email} />
            </div>
            <div class="field">
              <label for="f-phone">Teléfono</label>
              <input id="f-phone" type="tel" bind:value={editForm.phone_number} />
            </div>
            <div class="field full">
              <label for="f-addr">Dirección</label>
              <input id="f-addr" type="text" bind:value={editForm.address} />
            </div>
          </div>
        {:else}
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">Email</span>
              <span class="detail-value">{selectedCustomer.user?.email || '—'}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Teléfono</span>
              <span class="detail-value">{selectedCustomer.phone_number || '—'}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Ubicación</span>
              <span class="detail-value">{selectedCustomer.address || '—'}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Registro</span>
              <span class="detail-value">{fmtDate(selectedCustomer.created_at)}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Estado</span>
              <span class="detail-value" class:text-ok={selectedCustomer.is_active!==false} class:text-err={selectedCustomer.is_active===false}>
                {selectedCustomer.is_active === false ? 'Inactivo' : 'Activo'}
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-label">ID Usuario</span>
              <span class="detail-value cell-uuid">{selectedCustomer.user_id?.slice(0, 8)}</span>
            </div>
          </div>

          <div class="section">
            <h4>Estadísticas del Cliente</h4>
            {#if loadingDetails}
              <p class="muted">Cargando estadísticas...</p>
            {:else if customerDetails}
              <div class="stats-row">
                <div class="stat-c">
                  <span class="stat-n">{customerDetails.total_bookings || 0}</span>
                  <span class="stat-l">Reservas</span>
                </div>
                <div class="stat-c">
                  <span class="stat-n">{customerDetails.total_reviews || 0}</span>
                  <span class="stat-l">Reseñas</span>
                </div>
                <div class="stat-c">
                  <span class="stat-n">{fmtCurrency(customerDetails.total_spent)}</span>
                  <span class="stat-l">Gastado</span>
                </div>
              </div>
            {:else}
              <p class="muted-box">No se pudieron cargar estadísticas detalladas.</p>
            {/if}
          </div>
        {/if}
      </div>

      <div class="modal-foot">
        {#if isEditing}
          <button class="btn btn-ghost" on:click={cancelEditing} disabled={saving}>Cancelar</button>
          <button class="btn btn-primary" on:click={saveCustomer} disabled={saving}>
            {#if saving}<span class="spin"></span>Guardando...{:else}Guardar cambios{/if}
          </button>
        {:else}
          <button class="btn btn-ghost" on:click={closeModal}>Cerrar</button>
          <button class="btn btn-primary" on:click={startEditing}>Editar cliente</button>
        {/if}
      </div>
    </div>
  </div>
{/if}

{#if showToast}
  <div class="toast" class:t-ok={toastType==='success'} class:t-err={toastType==='err'}>{toastMessage}</div>
{/if}

<style>
  .page { padding: 2rem; font-family: 'Inter', sans-serif; }
  .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
  .header-left { display: flex; align-items: center; gap: 0.875rem; }
  .header-icon {
    width: 46px; height: 46px; border-radius: 12px; display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white;
  }
  .header h1 { font-size: 1.5rem; font-weight: 800; color: #0f172a; margin: 0; }
  .header-sub { margin-top: 0.15rem; color: #64748b; font-size: 0.8rem; }
  .header-badge { display: flex; flex-direction: column; align-items: center; padding: 0.6rem 1.1rem; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; }
  .badge-number { font-size: 1.3rem; font-weight: 800; color: #0284c7; line-height: 1; }
  .badge-label { font-size: 0.6rem; color: #0369a1; text-transform: uppercase; font-weight: 700; }

  .toolbar { display: flex; justify-content: flex-end; margin-bottom: 1.25rem; }
  .search-box { position: relative; width: 100%; max-width: 400px; }
  .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
  .search-box input { width: 100%; padding: 0.65rem 1rem 0.65rem 2.4rem; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 0.8rem; background: #f8fafc; }
  .search-box input:focus { outline: none; border-color: #818cf8; background: #fff; box-shadow: 0 0 0 3px rgba(129,140,248,0.08); }
  .search-clear { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: #e2e8f0; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #64748b; }

  .table-wrap { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; overflow-x: auto; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
  table { width: 100%; border-collapse: collapse; min-width: 900px; }
  th { padding: 0.75rem 1rem; text-align: left; font-size: 0.65rem; font-weight: 700; color: #64748b; text-transform: uppercase; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
  td { padding: 0.8rem 1rem; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
  tbody tr:hover { background: #f8fafc; }
  .cell-uuid { font-family: monospace; font-size: 0.7rem; color: #94a3b8; background: #f1f5f9; padding: 0.15rem 0.4rem; border-radius: 4px; }
  .cell-provider { display: flex; align-items: center; gap: 0.65rem; }
  .avatar-sm { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 0.7rem; }
  .provider-name { font-weight: 600; font-size: 0.85rem; color: #0f172a; }
  .cell-contact { display: flex; flex-direction: column; }
  .contact-email { font-size: 0.8rem; color: #475569; }
  .contact-phone { font-size: 0.7rem; color: #94a3b8; }
  .cell-location { font-size: 0.8rem; color: #475569; }
  .badg { padding: 0.2rem 0.6rem; border-radius: 6px; font-size: 0.65rem; font-weight: 700; text-transform: uppercase; }
  .b-ok { background: #dcfce7; color: #166534; }
  .b-err { background: #fee2e2; color: #991b1b; }
  .th-actions, .td-actions { text-align: right; }
  .btn-action { display: inline-flex; align-items: center; gap: 0.2rem; padding: 0.35rem 0.75rem; background: linear-gradient(135deg, #6366f1, #7c3aed); color: #fff; border: none; border-radius: 8px; font-size: 0.7rem; font-weight: 600; cursor: pointer; }

  .state-box { text-align: center; padding: 4rem 2rem; color: #64748b; }
  .loader { display: flex; gap: 0.4rem; justify-content: center; margin-bottom: 1rem; }
  .loader div { width: 10px; height: 10px; border-radius: 50%; background: #818cf8; animation: bounce 1.4s infinite; }
  @keyframes bounce { 0%,80%,100%{transform:scale(0.3)}40%{transform:scale(1)} }

  .pagination { display: flex; justify-content: space-between; align-items: center; padding: 1rem 0; }
  .pag-info { font-size: 0.75rem; color: #64748b; }
  .pag-controls { display: flex; gap: 0.3rem; }
  .pag-btn { width: 32px; height: 32px; border: 1px solid #e2e8f0; border-radius: 8px; background: #fff; font-size: 0.75rem; font-weight: 600; cursor: pointer; }
  .pag-btn.active { background: linear-gradient(135deg,#6366f1,#7c3aed); color:#fff; border-color:transparent; }
  .pag-btn:disabled { opacity: 0.4; }

  .overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.5); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
  .modal { background: #fff; border-radius: 16px; width: 92%; max-width: 600px; max-height: 88vh; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.15); }
  .modal-head { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid #f1f5f9; background: #fafbfc; }
  .modal-head-left { display: flex; align-items: center; gap: 0.8rem; }
  .avatar-md { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 1rem; }
  .modal-body { padding: 1.5rem; overflow-y: auto; max-height: 58vh; }
  .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-bottom: 1.5rem; }
  .detail-label { display: block; font-size: 0.65rem; color: #94a3b8; text-transform: uppercase; font-weight: 700; }
  .detail-value { font-size: 0.85rem; color: #1e293b; font-weight: 600; }
  .section h4 { font-size: 0.8rem; font-weight: 700; color: #475569; margin-bottom: 0.75rem; border-bottom: 1px solid #f1f5f9; padding-bottom: 0.25rem; }
  .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
  .stat-c { background: #f8fafc; padding: 0.8rem; border-radius: 10px; text-align: center; border: 1px solid #f1f5f9; }
  .stat-n { display: block; font-size: 1.1rem; font-weight: 800; color: #0f172a; }
  .stat-l { font-size: 0.65rem; color: #94a3b8; text-transform: uppercase; }

  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  .field { display: flex; flex-direction: column; gap: 0.25rem; }
  .field.full { grid-column: span 2; }
  .field label { font-size: 0.75rem; font-weight: 600; color: #475569; }
  .field input { padding: 0.6rem; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 0.85rem; }
  .field input:focus { border-color: #818cf8; outline: none; }

  .modal-foot { display: flex; justify-content: flex-end; gap: 0.75rem; padding: 1.25rem; border-top: 1px solid #f1f5f9; background: #fafbfc; }
  .btn { padding: 0.5rem 1.25rem; border: none; border-radius: 8px; font-size: 0.8rem; font-weight: 600; cursor: pointer; }
  .btn-primary { background: linear-gradient(135deg, #6366f1, #7c3aed); color: #fff; }
  .btn-ghost { background: #fff; border: 1px solid #e2e8f0; color: #64748b; }
  .toast { position: fixed; bottom: 2rem; right: 2rem; padding: 0.8rem 1.5rem; border-radius: 10px; font-size: 0.85rem; font-weight: 600; z-index: 2000; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
  .t-ok { background: #ecfdf5; color: #065f46; border: 1px solid #6ee7b7; }
  .text-ok { color: #059669; }
  .text-err { color: #dc2626; }
</style>