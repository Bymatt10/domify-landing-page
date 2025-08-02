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
    		// Usuario antes de subir avatar

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}_${uuidv4()}.${fileExt}`;
    		// user.id and fileName
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
    		// URL pública generada
    
    // Actualizar perfil del usuario
    const { data: updateData, error: updateError } = await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });
    if (updateError) {
      uploadError = 'Error actualizando el perfil: ' + updateError.message;
      uploading = false;
      return;
    }
    
    		// Usuario después de actualizar avatar
    
    avatar_url = publicUrl;
    uploading = false;
    
    // Forzar la recarga del layout para actualizar el navbar
    		// Invalidando layout para actualizar navbar
		await invalidateAll();
		// Layout invalidado exitosamente
  }
</script>

<div class="bg-white rounded-2xl shadow-sm max-w-2xl mx-auto mt-10 mb-8 p-10 border border-gray-100">
  <h2 class="text-2xl font-bold mb-8 text-gray-900">Información personal</h2>
  
  {#if user}
    <div class="flex justify-center mb-8">
      <div class="relative w-20 h-20">
        {#if user.user_metadata?.avatar_url}
          <img src={user.user_metadata.avatar_url} alt="Avatar" class="w-20 h-20 rounded-full object-cover" />
        {:else}
          <div class="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
            <svg class="w-8 h-8 text-gray-400" viewBox="0 0 24 24">
              <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2" fill="none"/>
              <path d="M4 20c0-4 4-7 8-7s8 3 8 7" stroke="currentColor" stroke-width="2" fill="none"/>
            </svg>
          </div>
        {/if}
        <input 
          type="file" 
          id="avatar-upload" 
          accept="image/*" 
          style="display: none;" 
          on:change={handleAvatarChange}
        />
        <button 
          class="absolute bottom-0 right-0 bg-white border-2 border-green-500 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer shadow-sm transition-colors duration-200 hover:bg-green-50"
          on:click={() => document.getElementById('avatar-upload')?.click()}
        >
          <svg class="w-4 h-4 text-green-500" viewBox="0 0 24 24">
            <path d="M12 4v16m8-8H4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    </div>

    {#if error}
      <div class="error-message">{error}</div>
    {/if}
    {#if success}
      <div class="success-message">{success}</div>
    {/if}
    <form on:submit|preventDefault={handleUpdate} class="mt-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div class="flex flex-col">
          <label for="firstName" class="font-medium mb-1 text-gray-700">Nombre</label>
          <input id="firstName" type="text" bind:value={first_name} class="p-3 border-2 border-gray-200 rounded-lg text-base focus:border-blue-500 focus:outline-none transition-colors" />
        </div>
        <div class="flex flex-col">
          <label for="lastName" class="font-medium mb-1 text-gray-700">Apellidos</label>
          <input id="lastName" type="text" bind:value={last_name} class="p-3 border-2 border-gray-200 rounded-lg text-base focus:border-blue-500 focus:outline-none transition-colors" />
        </div>
        <div class="flex flex-col">
          <label for="birthdate" class="font-medium mb-1 text-gray-700">Fecha de nacimiento</label>
          <input id="birthdate" type="text" bind:value={birthdate} placeholder="DD/MM/AAAA" class="p-3 border-2 border-gray-200 rounded-lg text-base focus:border-blue-500 focus:outline-none transition-colors" />
        </div>
        <div class="flex flex-col">
          <label for="phone" class="font-medium mb-1 text-gray-700">Número de celular</label>
          <input id="phone" type="tel" bind:value={phone} placeholder="Ej: +50588889999" class="p-3 border-2 border-gray-200 rounded-lg text-base focus:border-blue-500 focus:outline-none transition-colors" />
        </div>
        <div class="flex flex-col md:col-span-2">
          <label for="email" class="font-medium mb-1 text-gray-700">Email</label>
          <input id="email" type="email" value={email} disabled class="p-3 border-2 border-gray-200 rounded-lg text-base bg-gray-50 text-gray-500" />
        </div>
      </div>
      <div class="flex justify-end mt-8">
        <button type="submit" class="btn-primary" disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  {/if}
</div>

<div class="bg-white rounded-2xl shadow-sm max-w-2xl mx-auto mb-8 p-10 border border-gray-100">
  <h2 class="text-2xl font-bold mb-8 text-gray-900">Resetear contraseña</h2>
  {#if passwordError}
    <div class="error-message">{passwordError}</div>
  {/if}
  {#if passwordSuccess}
    <div class="success-message">{passwordSuccess}</div>
  {/if}
  <form on:submit|preventDefault={handlePasswordChange} class="mt-6">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div class="flex flex-col md:col-span-2">
        <label for="currentPassword" class="font-medium mb-1 text-gray-700">Contraseña actual</label>
        <input id="currentPassword" type="password" bind:value={currentPassword} required class="p-3 border-2 border-gray-200 rounded-lg text-base focus:border-blue-500 focus:outline-none transition-colors" />
      </div>
      <div class="flex flex-col">
        <label for="newPassword" class="font-medium mb-1 text-gray-700">Nueva contraseña</label>
        <input id="newPassword" type="password" bind:value={newPassword} required class="p-3 border-2 border-gray-200 rounded-lg text-base focus:border-blue-500 focus:outline-none transition-colors" />
      </div>
      <div class="flex flex-col">
        <label for="confirmPassword" class="font-medium mb-1 text-gray-700">Confirmar contraseña</label>
        <input id="confirmPassword" type="password" bind:value={confirmPassword} required class="p-3 border-2 border-gray-200 rounded-lg text-base focus:border-blue-500 focus:outline-none transition-colors" />
      </div>
    </div>
    <ul class="mt-4 mb-2 pl-5 text-gray-600 text-base">
      <li>● Mínimo 10 caracteres</li>
      <li>● Al menos 1 número, 1 mayúscula, 1 minúscula y 1 carácter especial</li>
    </ul>
    <div class="flex justify-end mt-8">
      <button type="submit" class="btn-primary" disabled={passwordLoading}>
        {passwordLoading ? 'Guardando...' : 'Guardar'}
      </button>
    </div>
  </form>
</div>

{#if uploading}
  <div class="text-center text-blue-600 font-medium">Subiendo imagen...</div>
{/if}
{#if uploadError}
  <div class="error-message">{uploadError}</div>
{/if}

<!-- CSS convertido a clases de Tailwind --> 