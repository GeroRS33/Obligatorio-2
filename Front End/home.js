// ========== REFERENCIAS ==========
const carousel = document.getElementById('carouselPosters');
const arrowLeft = document.getElementById('arrowLeft');
const arrowRight = document.getElementById('arrowRight');

// ========== SCROLL DEL CARRUSEL ==========
const scrollStep = 300;

arrowLeft.addEventListener('click', () => {
  carousel.scrollBy({ left: -scrollStep, behavior: 'smooth' });
});

arrowRight.addEventListener('click', () => {
  carousel.scrollBy({ left: scrollStep, behavior: 'smooth' });
});

// ========== CARGAR PELÍCULAS DEL BACKEND ==========
fetch('https://obligatorio-2-jpi9.onrender.com/movies')
  .then(res => res.json())
  .then(data => {
    const movies = data.movies;

    if (!Array.isArray(movies) || movies.length === 0) {
      carousel.innerHTML = '<p style="color: white;">No hay películas disponibles.</p>';
      return;
    }

    movies.forEach(movie => {
      const card = document.createElement('div');
      card.classList.add('posterCard');

      const img = document.createElement('img');
      img.src = movie.posterUrl || 'img/placeholder.jpg';
      img.alt = movie.title;

      // Redirige al detalle con el slug
      card.addEventListener('click', () => {
        window.location.href = `detalle.html?slug=${movie.slug}`;
      });

      card.appendChild(img);
      carousel.appendChild(card);
    });
  })
  .catch(error => {
    console.error('Error al cargar películas:', error);
    carousel.innerHTML = '<p style="color: white;">Error al cargar los posters.</p>';
  });

// ========== MOSTRAR NOMBRE DE USUARIO ==========
const storedUser = localStorage.getItem('username');
if (storedUser) {
  document.getElementById('username').textContent = storedUser;

  console.log(storedUser);
}
