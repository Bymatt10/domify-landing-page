<script lang="ts">
import { page } from '$app/stores';
import { onMount } from 'svelte';

let providerId = '';
let provider: any = null;
let loading = true;
let error = '';

// Mock para fotos de trabajo y reviews
let workPhotos: string[] = [
  '/img/cleaning.png',
  '/img/gardening.png',
  '/img/assembly.png',
  '/img/mounting.png',
  '/img/moving.png',
];
let reviews = [
  { name: 'Kellie D.', rating: 5, comment: 'Excelente servicio, muy puntual y profesional.', date: '2024-05-30', category: 'CLEANING' },
  { name: 'John S.', rating: 4.8, comment: 'Muy buena experiencia, la recomiendo.', date: '2024-05-15', category: 'CLEANING' },
];

onMount(async () => {
  providerId = $page.params.id;
  loading = true;
  error = '';
  try {
    // Aquí deberías hacer fetch real a tu API
    // Por ahora, mock:
    provider = {
      id: providerId,
      business_name: 'Zaidee P.',
      photo_url: '/img/cleaning.png',
      rating: 4.7,
      hourly_rate: 58.84,
      total_reviews: 197,
      description: 'Responsible, and punctual. I have the tools and cleaning supplies. 2 hours minimum. Oven and refrigerator additional fee: $50, The balcony area has It is not included in the normal cleaning, you can find me also in DEEP CLEANING and if you need.',
      skills: 'Responsible, punctual, deep cleaning, supplies included',
      badges: ['ELITE', '2 HOUR MINIMUM'],
    };
  } catch (e) {
    error = 'No se pudo cargar la información del proveedor.';
  } finally {
    loading = false;
  }
});

function whatsapp(phone: string) {
  const cleanPhone = phone.replace(/[^0-9+]/g, '');
  
  // Crear mensaje formal y personalizado
  const message = `Hola ${provider.business_name}, 

Me interesa contratar sus servicios. 

¿Podría proporcionarme más información sobre:
• Disponibilidad y horarios
• Tarifa por hora (actualmente $${provider.hourly_rate}/hr)
• Zonas de cobertura
• Experiencia y referencias

Gracias por su atención.

Saludos cordiales.`;
  
  const encodedMessage = encodeURIComponent(message);
  const url = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
  window.open(url, '_blank');
}

function llamar(phone: string) {
  const cleanPhone = phone.replace(/[^0-9+]/g, '');
  window.location.href = `tel:${cleanPhone}`;
}
</script>

<div class="provider-detail-wrapper">
  {#if loading}
    <div class="loading-state">Cargando proveedor...</div>
  {:else if error}
    <div class="error-state">{error}</div>
  {:else}
    <div class="provider-detail-card">
      <div class="provider-header">
        <img class="provider-avatar" src={provider.photo_url} alt={provider.business_name} />
        <div class="provider-main-info">
          <div class="provider-title-row">
            <h1>{provider.business_name}</h1>
            {#each provider.badges as badge}
              <span class="provider-badge">{badge}</span>
            {/each}
            <span class="provider-rate">${provider.hourly_rate}/hr</span>
          </div>
          <div class="provider-rating-row">
            <span class="provider-rating">★ {provider.rating} ({provider.total_reviews} reviews)</span>
          </div>
        </div>
      </div>
      <div class="provider-section">
        <h3>Skills & Experience</h3>
        <div class="provider-skills">{provider.skills}</div>
        <div class="provider-description">{provider.description}</div>
      </div>
      <div class="provider-section">
        <h3>Work Photos</h3>
        <div class="work-photos-row">
          {#each workPhotos as photo, i}
            <img class="work-photo" src={photo} alt="Work photo {i+1}" />
          {/each}
        </div>
      </div>
      <div class="provider-section">
        <h3>Reviews for Cleaning ({provider.total_reviews})</h3>
        <div class="reviews-list">
          {#each reviews as r}
            <div class="review-item">
              <div class="review-header">
                <span class="review-avatar"></span>
                <span class="review-name">{r.name}</span>
                <span class="review-rating">★ {r.rating}</span>
                <span class="review-category">{r.category}</span>
                <span class="review-date">on {r.date}</span>
              </div>
              <div class="review-comment">{r.comment}</div>
            </div>
          {/each}
        </div>
      </div>
      {#if provider.phone}
        {#if provider.phone.startsWith('22')}
          <button class="phone-btn" on:click={() => llamar(provider.phone)}>
            Llamar
          </button>
        {:else}
          <button class="phone-btn" on:click={() => whatsapp(provider.phone)}>
            WhatsApp
          </button>
        {/if}
      {/if}
    </div>
  {/if}
</div>

<style>
.provider-detail-wrapper {
  max-width: 800px;
  margin: 2.5rem auto;
  padding: 1.5rem;
}
.provider-detail-card {
  background: #fff;
  border-radius: 1.2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  padding: 2rem;
}
.provider-header {
  display: flex;
  align-items: center;
  gap: 2rem;
}
.provider-avatar {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #6D9773;
}
.provider-main-info {
  flex: 1;
}
.provider-title-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}
.provider-title-row h1 {
  font-size: 2rem;
  margin: 0;
  color: #0C3B2E;
}
.provider-badge {
  background: #B5E0C7;
  color: #0C3B2E;
  font-size: 0.95rem;
  font-weight: 700;
  border-radius: 0.7rem;
  padding: 0.3rem 0.8rem;
  margin-right: 0.5rem;
}
.provider-rate {
  color: #BB8A52;
  font-weight: 700;
  font-size: 1.3rem;
  margin-left: auto;
}
.provider-rating-row {
  margin-top: 0.5rem;
  color: #FFBA00;
  font-weight: 600;
}
.provider-section {
  margin-top: 2rem;
}
.provider-section h3 {
  color: #0C3B2E;
  font-size: 1.2rem;
  margin-bottom: 0.7rem;
}
.provider-skills {
  font-weight: 600;
  color: #0C3B2E;
  margin-bottom: 0.5rem;
}
.provider-description {
  color: #444;
  margin-bottom: 1rem;
}
.work-photos-row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}
.work-photo {
  width: 90px;
  height: 90px;
  border-radius: 0.7rem;
  object-fit: cover;
  border: 2px solid #eee;
}
.reviews-list {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}
.review-item {
  background: #f6f6f8;
  border-radius: 0.7rem;
  padding: 1rem;
}
.review-header {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  font-size: 1rem;
  color: #0C3B2E;
  font-weight: 600;
}
.review-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #ddd;
  display: inline-block;
}
.review-name {
  font-weight: 700;
}
.review-rating {
  color: #FFBA00;
}
.review-category {
  background: #6D9773;
  color: #fff;
  border-radius: 0.5rem;
  padding: 0.1rem 0.6rem;
  font-size: 0.9rem;
  margin-left: 0.5rem;
}
.review-date {
  color: #888;
  font-size: 0.9rem;
  margin-left: 0.5rem;
}
.review-comment {
  margin-top: 0.5rem;
  color: #444;
  font-size: 1rem;
}
.loading-state, .error-state {
  text-align: center;
  color: #666;
  padding: 2rem 0;
}
.phone-btn {
  background: #6D9773;
  color: #fff;
  border: none;
  border-radius: 0.5rem;
  padding: 0.7rem 1rem;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  margin-top: 1rem;
}
@media (max-width: 900px) {
  .provider-detail-wrapper {
    padding: 0.5rem;
  }
  .provider-detail-card {
    padding: 1rem;
  }
}
@media (max-width: 700px) {
  .provider-detail-card {
    padding: 0.5rem;
  }
  .provider-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  .provider-avatar {
    width: 80px;
    height: 80px;
  }
  .work-photos-row {
    flex-wrap: nowrap;
    overflow-x: auto;
    gap: 0.7rem;
    padding-bottom: 0.5rem;
  }
  .work-photo {
    width: 70px;
    height: 70px;
    min-width: 70px;
    min-height: 70px;
  }
  .reviews-list {
    gap: 0.7rem;
  }
  .review-item {
    padding: 0.7rem;
  }
  .provider-title-row h1 {
    font-size: 1.2rem;
  }
  .provider-rate {
    font-size: 1rem;
  }
  .provider-badge {
    font-size: 0.8rem;
    padding: 0.2rem 0.5rem;
  }
}
@media (max-width: 500px) {
  .provider-detail-wrapper {
    padding: 0.2rem;
  }
  .provider-detail-card {
    padding: 0.2rem;
  }
  .provider-header {
    gap: 0.5rem;
  }
  .work-photo {
    width: 54px;
    height: 54px;
    min-width: 54px;
    min-height: 54px;
  }
}
</style> 