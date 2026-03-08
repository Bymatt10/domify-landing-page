<script lang="ts">
  import { onMount } from 'svelte';
  import { debounce } from '$lib/utils';

  let categories: any[] = [];
  let loading = true;
  let error = '';
  let total = 0;
  let search = '';

  let showModal = false;
  let isEditing = false;
  let saving = false;
  let selectedCategory: any = null;
  
  let form = {
    name: '',
    description: '',
    icon: '🏷️'
  };

  let toastMessage = '';
  let toastType: 'success' | 'err' = 'success';
  let showToast = false;

  function notify(msg: string, type: 'success' | 'err' = 'success') {
    toastMessage = msg; toastType = type; showToast = true;
    setTimeout(() => showToast = false, 3500);
  }

  async function loadCategories() {
    loading = true; error = '';
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const result = await res.json();
        // The API returns { data: { categories: [...] } }
        categories = result.data?.categories || result.categories || [];
        total = categories.length;
      } else {
        error = 'No pudimos cargar las categorías.';
      }
    } catch (e) {
      error = (e as Error).message;
    } finally {
      loading = false;
    }
  }

  function openCreate() {
    isEditing = false;
    selectedCategory = null;
    form = { name: '', description: '', icon: '🏷️' };
    showModal = true;
  }

  function openEdit(cat: any) {
    isEditing = true;
    selectedCategory = cat;
    form = { 
      name: cat.name || '', 
      description: cat.description || '', 
      icon: cat.icon || '🏷️' 
    };
    showModal = true;
  }

  async function handleSubmit() {
    if (!form.name) return;
    saving = true;
    try {
      const url = isEditing ? `/api/categories/${selectedCategory.id}` : '/api/categories';
      const method = isEditing ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (res.ok) {
        notify(isEditing ? 'Categoría actualizada' : 'Categoría creada');
        await loadCategories();
        showModal = false;
      } else {
        const d = await res.json();
        notify(d.message || d.error || 'Error al guardar', 'err');
      }
    } catch (e) {
      notify('Error de red', 'err');
    } finally {
      saving = false;
    }
  }

  async function deleteCategory(id: string) {
    if (!confirm('¿Estás seguro de eliminar esta categoría?')) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        notify('Categoría eliminada');
        await loadCategories();
      } else {
        notify('Error al eliminar', 'err');
      }
    } catch (e) {
      notify('Error de red', 'err');
    }
  }

  onMount(loadCategories);

  $: filtered = categories.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.slug?.toLowerCase().includes(search.toLowerCase())
  );

  function fmtDate(d: string) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('es-NI', { year: 'numeric', month: 'short', day: 'numeric' });
  }
</script>

<div class="page">
  <!-- Header -->
  <div class="header">
    <div class="header-left">
      <div class="header-icon">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m2 9 3 12h14l3-12Z"/><path d="M7 9V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v4"/></svg>
      </div>
      <div>
        <h1>Categorías</h1>
        <p class="header-sub">Administra los nichos y clasificaciones de servicios</p>
      </div>
    </div>
    <button class="btn btn-primary" on:click={openCreate}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
      Nueva Categoría
    </button>
  </div>

  <!-- Search & Toolbar -->
  <div class="toolbar">
    <div class="search-box">
      <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
      <input type="text" bind:value={search} placeholder="Buscar categorías..." aria-label="Buscar categorías" />
    </div>
  </div>

  <!-- Content -->
  {#if loading}
    <div class="state-box">
      <div class="loader"><div></div><div></div><div></div></div>
      <p>Cargando categorías...</p>
    </div>
  {:else if error}
    <div class="state-box err-box">
      <p class="err-title">Error al cargar datos</p>
      <p class="err-msg">{error}</p>
      <button class="btn btn-primary" on:click={loadCategories}>Reintentar</button>
    </div>
  {:else if filtered.length === 0}
    <div class="state-box">
      <p class="empty-title">No hay categorías</p>
      <p class="empty-sub">Crea una nueva categoría para comenzar.</p>
    </div>
  {:else}
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Icono</th>
            <th>Nombre</th>
            <th>Slug</th>
            <th>Descripción</th>
            <th>Registro</th>
            <th class="th-actions">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {#each filtered as c}
            <tr>
              <td>
                <div class="cat-icon-box">
                  {#if c.icon && (c.icon.startsWith('/') || c.icon.startsWith('http'))}
                    <img src={c.icon} alt={c.name} />
                  {:else}
                    <span class="emoji-icon">{c.icon || '🏷️'}</span>
                  {/if}
                </div>
              </td>
              <td><span class="cat-name">{c.name}</span></td>
              <td><span class="cell-slug">{c.slug}</span></td>
              <td><span class="cell-desc">{c.description || '—'}</span></td>
              <td><span class="cell-date">{fmtDate(c.created_at)}</span></td>
              <td class="td-actions">
                <div class="action-group">
                  <button class="btn-icon-ed" on:click={() => openEdit(c)} aria-label="Editar">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                  </button>
                  <button class="btn-icon-del" on:click={() => deleteCategory(c.id)} aria-label="Eliminar">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>

<!-- Modal -->
{#if showModal}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="overlay" on:click={() => showModal = false}>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="modal" on:click|stopPropagation>
      <div class="modal-head">
        <h2>{isEditing ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
        <button class="modal-x" on:click={() => showModal = false} aria-label="Cerrar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>
      <div class="modal-body">
        <div class="form-grid">
          <div class="field">
            <label for="c-name">Nombre</label>
            <input id="c-name" type="text" bind:value={form.name} placeholder="Ej: Electricidad" />
          </div>
          <div class="field">
            <label for="c-icon">Icono (Emoji o URL)</label>
            <input id="c-icon" type="text" bind:value={form.icon} />
          </div>
          <div class="field full">
            <label for="c-desc">Descripción</label>
            <textarea id="c-desc" bind:value={form.description} rows="3" placeholder="Describe esta categoría..."></textarea>
          </div>
        </div>
      </div>
      <div class="modal-foot">
        <button class="btn btn-ghost" on:click={() => showModal = false}>Cancelar</button>
        <button class="btn btn-primary" on:click={handleSubmit} disabled={saving}>
          {#if saving}<span class="spin"></span>Guardando...{:else}Guardar Categoría{/if}
        </button>
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
  .header-sub { color: #64748b; font-size: 0.8rem; }

  .toolbar { display: flex; justify-content: flex-end; margin-bottom: 1.25rem; }
  .search-box { position: relative; width: 320px; }
  .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
  .search-box input { width: 100%; padding: 0.65rem 1rem 0.65rem 2.4rem; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 0.8rem; background: #f8fafc; }
  
  .table-wrap { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
  table { width: 100%; border-collapse: collapse; }
  th { padding: 0.75rem 1rem; text-align: left; font-size: 0.65rem; font-weight: 700; color: #64748b; text-transform: uppercase; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
  td { padding: 0.8rem 1rem; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
  
  .cat-icon-box { width: 40px; height: 40px; background: #f8fafc; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
  .cat-icon-box img { width: 24px; height: 24px; object-fit: contain; }
  .emoji-icon { font-size: 1.25rem; }
  .cat-name { font-weight: 600; font-size: 0.85rem; color: #0f172a; }
  .cell-slug { font-family: monospace; font-size: 0.7rem; color: #6366f1; font-weight: 600; }
  .cell-desc { font-size: 0.8rem; color: #64748b; max-width: 300px; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .cell-date { font-size: 0.75rem; color: #94a3b8; }

  .action-group { display: flex; gap: 0.5rem; justify-content: flex-end; }
  .btn-icon-ed, .btn-icon-del { width: 32px; height: 32px; border-radius: 8px; border: 1px solid #e2e8f0; background: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
  .btn-icon-ed { color: #6366f1; }
  .btn-icon-ed:hover { background: #eef2ff; border-color: #818cf8; }
  .btn-icon-del { color: #ef4444; }
  .btn-icon-del:hover { background: #fee2e2; border-color: #fecaca; }

  .state-box { text-align: center; padding: 4rem 2rem; color: #64748b; }
  .loader { display: flex; gap: 0.4rem; justify-content: center; margin-bottom: 1rem; }
  .loader div { width: 10px; height: 10px; border-radius: 50%; background: #6366f1; animation: bounce 1.4s infinite; }
  @keyframes bounce { 0%,80%,100%{transform:scale(0.3)}40%{transform:scale(1)} }

  .overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.5); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
  .modal { background: #fff; border-radius: 16px; width: 92%; max-width: 500px; box-shadow: 0 20px 50px rgba(0,0,0,0.15); }
  .modal-head { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid #f1f5f9; background: #fafbfc; }
  .modal-head h2 { font-size: 1.1rem; margin: 0; }
  .modal-body { padding: 1.5rem; }
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  .field { display: flex; flex-direction: column; gap: 0.3rem; }
  .field.full { grid-column: span 2; }
  .field label { font-size: 0.75rem; font-weight: 700; color: #475569; }
  .field input, .field textarea { padding: 0.65rem; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 0.85rem; background: #f8fafc; }
  .field textarea { resize: none; }
  .modal-foot { display: flex; justify-content: flex-end; gap: 0.75rem; padding: 1.25rem; border-top: 1px solid #f1f5f9; }

  .btn { padding: 0.5rem 1.25rem; border: none; border-radius: 10px; font-size: 0.8rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 0.4rem; }
  .btn-primary { background: linear-gradient(135deg, #6366f1, #7c3aed); color: #fff; }
  .btn-ghost { background: #fff; border: 1px solid #e2e8f0; color: #64748b; }
  .toast { position: fixed; bottom: 2rem; right: 2rem; padding: 0.8rem 1.5rem; border-radius: 10px; font-size: 0.85rem; font-weight: 600; z-index: 2000; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
  .t-ok { background: #ecfdf5; color: #065f46; border: 1px solid #6ee7b7; border-left: 4px solid #6366f1; }
  .t-err { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }
  .spin { display: inline-block; width: 12px; height: 12px; border: 2px solid rgba(255,255,255,0.3); border-top: 2px solid #fff; border-radius: 50%; animation: sp 0.7s linear infinite; }
  @keyframes sp { to { transform: rotate(360deg); } }
</style>