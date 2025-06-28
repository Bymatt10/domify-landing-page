<script lang="ts">
  // Aquí podrías importar imágenes o datos del equipo si los tuvieras
</script>

<section class="about-hero">
  <h1>Acerca de Domify</h1>
  <p class="about-lead">Conectamos personas con los mejores proveedores de servicios locales, de forma fácil, segura y confiable.</p>
</section>

<section class="about-mission">
  <h2>Nuestra Misión</h2>
  <p>En <strong>Domify</strong> creemos que encontrar ayuda para tu hogar o negocio debe ser sencillo y seguro. Nuestra misión es empoderar a clientes y proveedores, creando una comunidad donde la confianza, la calidad y la cercanía son lo más importante.</p>
</section>

<section class="about-values">
  <h2>Valores que nos guían</h2>
  <ul>
    <li><strong>Confianza:</strong> Verificamos a cada proveedor y protegemos tus datos.</li>
    <li><strong>Calidad:</strong> Solo los mejores servicios y atención personalizada.</li>
    <li><strong>Innovación:</strong> Tecnología para hacer tu vida más fácil.</li>
    <li><strong>Comunidad:</strong> Apoyamos el crecimiento local y la colaboración.</li>
  </ul>
</section>

<section class="about-how">
  <h2>¿Cómo funciona Domify?</h2>
  <div class="about-steps">
    <div class="about-step">
      <div class="about-step-icon">
        <svg width="32" height="32" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2" fill="none"/><path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>
      </div>
      <h3>Busca y compara</h3>
      <p>Explora servicios, lee reseñas y elige el proveedor ideal para ti.</p>
    </div>
    <div class="about-step">
      <div class="about-step-icon">
        <svg width="32" height="32" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="10" rx="2" stroke="currentColor" stroke-width="2" fill="none"/><path d="M7 10h10M7 14h6" stroke="currentColor" stroke-width="2" fill="none"/></svg>
      </div>
      <h3>Contacta y agenda</h3>
      <p>Habla directamente con proveedores y agenda el servicio en minutos.</p>
    </div>
    <div class="about-step">
      <div class="about-step-icon">
        <svg width="32" height="32" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/><path d="M8 12l2 2 4-4" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>
      </div>
      <h3>Disfruta y califica</h3>
      <p>Recibe el servicio, paga seguro y deja tu opinión para ayudar a otros.</p>
    </div>
  </div>
</section>

<section class="about-cta">
  <h2>¿Listo para ser parte de Domify?</h2>
  <a href="/services" class="about-btn">Explora servicios</a>
  <a href="/become-provider" class="about-btn about-btn-secondary">Quiero ser proveedor</a>
</section>

<style>
.about-hero {
  text-align: center;
  padding: 3rem 1rem 2rem 1rem;
  background: linear-gradient(135deg, #e0f2f1 0%, #f6f6f8 100%);
}
.about-hero h1 {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--color-primary);
  margin-bottom: 0.5rem;
}
.about-lead {
  font-size: 1.25rem;
  color: var(--color-text-light);
  max-width: 600px;
  margin: 0 auto;
}
.about-mission, .about-values, .about-how, .about-cta {
  max-width: 800px;
  margin: 2.5rem auto;
  padding: 0 1rem;
}
.about-mission h2, .about-values h2, .about-how h2, .about-cta h2 {
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 1rem;
}
.about-values ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.about-values li {
  margin-bottom: 0.7rem;
  font-size: 1.08rem;
  color: var(--color-text);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.about-how {
  background: #f6f6f8;
  border-radius: 1.5rem;
  padding: 2rem 1rem;
}
.about-steps {
  display: flex;
  gap: 2rem;
  justify-content: space-between;
  flex-wrap: wrap;
}
.about-step {
  flex: 1 1 180px;
  background: #fff;
  border-radius: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 1.2rem 1rem;
  text-align: center;
  margin-bottom: 1rem;
  transition: box-shadow 0.2s;
}
.about-step:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.10);
}
.about-step-icon {
  font-size: 2.2rem;
  margin-bottom: 0.5rem;
}
.about-cta {
  text-align: center;
  margin-top: 3rem;
}
.about-btn {
  display: inline-block;
  margin: 0.5rem 1rem 0 1rem;
  padding: 0.9rem 2rem;
  background: var(--color-primary);
  color: #fff;
  border-radius: 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.2s, color 0.2s;
}
.about-btn:hover {
  background: var(--color-primary-hover, #388e3c);
  color: #fff;
}
.about-btn-secondary {
  background: #fff;
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
}
.about-btn-secondary:hover {
  background: var(--color-primary-light, #e0f2f1);
  color: var(--color-primary);
}
@media (max-width: 900px) {
  .about-steps {
    flex-direction: column;
    gap: 1.2rem;
  }
}
</style> 