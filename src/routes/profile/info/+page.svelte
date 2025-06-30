<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase';
  import { v4 as uuidv4 } from 'uuid';
  import { invalidateAll } from '$app/navigation';
  let user: any = null;
  let loading = true;
  let error = '';
  let success = '';
  let first_name = '';
  let last_name = '';
  let birthdate = '';
  let phone = '';
  let email = '';
  let avatar_url = '';
  // Password change
  let newPassword = '';
  let confirmPassword = '';
  let passwordError = '';
  let passwordSuccess = '';
  let passwordLoading = false;
  let currentPassword = '';
  let uploading = false;
  let uploadError = '';
  
  // Función para generar un hash simple del avatar_url para cache busting
  function getAvatarHash(avatarUrl: string): string {
    if (!avatarUrl) return '0';
    // Crear un hash simple basado en la URL
    let hash = 0;
    for (let i = 0; i < avatarUrl.length; i++) {
      const char = avatarUrl.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convertir a 32-bit integer
    }
    return Math.abs(hash).toString();
  }
  
  // Variable reactiva para cache busting del avatar
  $: avatarVersion = getAvatarHash(avatar_url);

  onMount(async () => {
    const { data, error: userError } = await supabase.auth.getUser();
    if (userError || !data.user) {
      error = 'No se pudo cargar la información del usuario.';
      loading = false;
      return;
    }
    user = data.user;
    first_name = user.user_metadata?.first_name || '';
    last_name = user.user_metadata?.last_name || '';
    birthdate = user.user_metadata?.birthdate || '';
    phone = user.user_metadata?.phone || '';
    email = user.email || '';
    avatar_url = user.user_metadata?.avatar_url || '';
    loading = false;
  });

  function formatBirthdate(date: string) {
    if (!date) return '';
    if (date.includes('-')) {
      const [y, m, d] = date.split('-');
      return `${d}/${m}/${y}`;
    }
    return date;
  }
  function parseBirthdate(input: string) {
    if (input.includes('/')) {
      const [d, m, y] = input.split('/');
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
    return input;
  }

  async function handleUpdate() {
    loading = true;
    error = '';
    success = '';
    let validDate = birthdate;
    if (birthdate && birthdate.includes('/')) {
      validDate = parseBirthdate(birthdate);
    }
    if (validDate && !/^\d{4}-\d{2}-\d{2}$/.test(validDate)) {
      error = 'La fecha debe tener formato DD/MM/AAAA o AAAA-MM-DD';
      loading = false;
      return;
    }
    const updates: any = {
      data: {
        first_name,
        last_name,
        birthdate: validDate,
        phone
      }
    };
    const { data: updatedUser, error: updateError } = await supabase.auth.updateUser(updates);
    if (updateError) {
      error = updateError.message;
    } else {
      success = 'Información actualizada correctamente.';
      user = updatedUser.user;
    }
    loading = false;
  }

  // Password validation helpers
  function passwordValid(pw: string) {
    return pw.length >= 10 &&
      /[0-9]/.test(pw) &&
      /[a-z]/.test(pw) &&
      /[A-Z]/.test(pw) &&
      /[^A-Za-z0-9]/.test(pw);
  }

  async function handlePasswordChange() {
    passwordError = '';
    passwordSuccess = '';
    passwordLoading = true;
    if (!currentPassword) {
      passwordError = 'Debes ingresar tu contraseña actual.';
      passwordLoading = false;
      return;
    }
    if (newPassword !== confirmPassword) {
      passwordError = 'Las contraseñas no coinciden.';
      passwordLoading = false;
      return;
    }
    if (!passwordValid(newPassword)) {
      passwordError = 'La contraseña no cumple los requisitos.';
      passwordLoading = false;
      return;
    }
    // Validar contraseña actual haciendo signIn
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword
    });
    if (signInError) {
      passwordError = 'La contraseña actual es incorrecta.';
      passwordLoading = false;
      return;
    }
    // Si es correcta, actualizar la contraseña
    const { error: pwError } = await supabase.auth.updateUser({ password: newPassword });
    if (pwError) {
      passwordError = pwError.message;
    } else {
      passwordSuccess = 'Contraseña actualizada correctamente.';
      currentPassword = '';
      newPassword = '';
      confirmPassword = '';
    }
    passwordLoading = false;
  }

  async function handleAvatarChange(event: Event) {
    uploadError = '';
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];

    // Obtener el usuario autenticado REAL desde el servidor de Supabase
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      uploadError = 'Usuario no autenticado.';
      return;
    }
    const user = userData.user;
    console.log('Usuario antes de subir avatar:', user.user_metadata);

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}_${uuidv4()}.${fileExt}`;
    console.log('user.id:', user.id, 'fileName:', fileName);
    const filePath = fileName;
    uploading = true;
    // Subir a Supabase Storage
    const { error: uploadErr } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
    if (uploadErr) {
      uploadError = 'Error subiendo la imagen: ' + uploadErr.message;
      uploading = false;
      return;
    }
    // Obtener URL pública
    const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
    const publicUrl = publicUrlData.publicUrl;
    console.log('URL pública generada:', publicUrl);
    
    // Actualizar perfil del usuario
    const { data: updateData, error: updateError } = await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });
    if (updateError) {
      uploadError = 'Error actualizando el perfil: ' + updateError.message;
      uploading = false;
      return;
    }
    
    console.log('Usuario después de actualizar avatar:', updateData.user?.user_metadata);
    
    avatar_url = publicUrl;
    uploading = false;
    
    // Forzar la recarga del layout para actualizar el navbar
    console.log('Invalidando layout para actualizar navbar...');
    await invalidateAll();
    console.log('Layout invalidado exitosamente');
  }
</script>

<div class="profile-card">
  <h2>Mi cuenta</h2>
  {#if loading}
    <p>Cargando...</p>
  {:else}
    {#if error}
      <div class="error-message">{error}</div>
    {/if}
    {#if success}
      <div class="success-message">{success}</div>
    {/if}
    <form on:submit|preventDefault={handleUpdate} class="profile-form">
      <div class="avatar-section">
        <div class="avatar-wrapper">
          {#if avatar_url}
            <img class="avatar-img" src={avatar_url ? avatar_url + '?v=' + avatarVersion : ''} alt="Avatar" on:error={(e) => { const img = e.target as HTMLImageElement; if (img) img.src = '/img/default-avatar.png'; }} />
          {:else}
            <div class="avatar-placeholder">
              <svg width="60" height="60" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" stroke="#bbb" stroke-width="2" fill="none"/><path d="M4 20c0-4 4-7 8-7s8 3 8 7" stroke="#bbb" stroke-width="2" fill="none"/></svg>
            </div>
          {/if}
          <label class="avatar-upload-btn" title="Cambiar foto de perfil">
            <input type="file" accept="image/*" on:change={handleAvatarChange} style="display:none" />
            <svg width="20" height="20" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#10b981" stroke-width="2" fill="none"/><path d="M12 8v8M8 12h8" stroke="#10b981" stroke-width="2"/></svg>
          </label>
        </div>
      </div>
      <div class="form-grid">
        <div class="form-group">
          <label for="first_name">Nombre</label>
          <input id="first_name" type="text" bind:value={first_name} required />
        </div>
        <div class="form-group">
          <label for="last_name">Apellido</label>
          <input id="last_name" type="text" bind:value={last_name} required />
        </div>
        <div class="form-group">
          <label for="birthdate">Fecha de nacimiento</label>
          <input id="birthdate" type="text" bind:value={birthdate} placeholder="DD/MM/AAAA" />
        </div>
        <div class="form-group">
          <label for="phone">Número de celular</label>
          <input id="phone" type="tel" bind:value={phone} placeholder="Ej: +50588889999" />
        </div>
        <div class="form-group full-width">
          <label for="email">Email</label>
          <input id="email" type="email" value={email} disabled />
        </div>
      </div>
      <div class="form-actions">
        <button type="submit" class="btn-primary" disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  {/if}
</div>

<div class="profile-card">
  <h2>Resetear contraseña</h2>
  {#if passwordError}
    <div class="error-message">{passwordError}</div>
  {/if}
  {#if passwordSuccess}
    <div class="success-message">{passwordSuccess}</div>
  {/if}
  <form on:submit|preventDefault={handlePasswordChange} class="password-form">
    <div class="form-grid">
      <div class="form-group full-width">
        <label for="currentPassword">Contraseña actual</label>
        <input id="currentPassword" type="password" bind:value={currentPassword} required />
      </div>
      <div class="form-group">
        <label for="newPassword">Nueva contraseña</label>
        <input id="newPassword" type="password" bind:value={newPassword} required />
      </div>
      <div class="form-group">
        <label for="confirmPassword">Confirmar contraseña</label>
        <input id="confirmPassword" type="password" bind:value={confirmPassword} required />
      </div>
    </div>
    <ul class="password-rules">
      <li>● Mínimo 10 caracteres</li>
      <li>● Al menos 1 número, 1 mayúscula, 1 minúscula y 1 carácter especial</li>
    </ul>
    <div class="form-actions">
      <button type="submit" class="btn-primary" disabled={passwordLoading}>
        {passwordLoading ? 'Guardando...' : 'Guardar'}
      </button>
    </div>
  </form>
</div>

{#if uploading}
  <div class="uploading-message">Subiendo imagen...</div>
{/if}
{#if uploadError}
  <div class="error-message">{uploadError}</div>
{/if}

<style>
.profile-card {
  background: #fff;
  border-radius: 1.2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  max-width: 700px;
  margin: 2.5rem auto 2rem auto;
  padding: 2.5rem 2rem 2rem 2rem;
}
.profile-card h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 2rem;
  color: #222;
}
.avatar-section {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}
.avatar-wrapper {
  position: relative;
  width: 80px;
  height: 80px;
}
.avatar-img, .avatar-placeholder {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  background: #f6f6f8;
  display: flex;
  align-items: center;
  justify-content: center;
}
.avatar-upload-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  background: #fff;
  border: 2px solid #10b981;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(16,185,129,0.08);
  transition: background 0.2s;
}
.avatar-upload-btn:hover {
  background: #e0f2f1;
}
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.2rem 2rem;
}
.form-group {
  display: flex;
  flex-direction: column;
}
.form-group.full-width {
  grid-column: 1 / -1;
}
label {
  font-weight: 500;
  margin-bottom: 0.3rem;
}
input[type="text"], input[type="email"], input[type="tel"], input[type="password"] {
  padding: 0.7rem;
  border: 1.5px solid #e1e5e9;
  border-radius: 0.6rem;
  font-size: 1rem;
}
input:disabled {
  background: #f5f5f5;
  color: #aaa;
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 2rem;
}
.btn-primary {
  padding: 0.8rem 2.2rem;
  background: var(--color-primary, #10b981);
  color: #fff;
  border: none;
  border-radius: 0.6rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}
.error-message {
  background: #fee;
  color: #c33;
  padding: 0.7rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid #fcc;
  text-align: center;
}
.success-message {
  background: #e6ffed;
  color: #1a7f37;
  padding: 0.7rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid #b7eb8f;
  text-align: center;
}
.password-form {
  margin-top: 1.5rem;
}
.password-rules {
  margin: 1rem 0 0.5rem 0;
  padding-left: 1.2rem;
  color: #666;
  font-size: 0.98rem;
}
@media (max-width: 700px) {
  .profile-card {
    padding: 1.2rem 0.5rem 1.5rem 0.5rem;
  }
  .form-grid {
    grid-template-columns: 1fr;
    gap: 1.1rem 0;
  }
}
</style> 