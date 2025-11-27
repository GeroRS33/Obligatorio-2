const carousel = document.getElementById('carouselPosters');
const arrowLeft = document.getElementById('arrowLeft');
const arrowRight = document.getElementById('arrowRight');
const buscador = document.getElementById('buscador');

let todasLasPeliculas = []; // ← Acá vamos a guardar todas

// Scroll del carrusel
const scrollStep = 300;
arrowLeft.addEventListener('click', () => {
  carousel.scrollBy({ left: -scrollStep, behavior: 'smooth' });
});
arrowRight.addEventListener('click', () => {
  carousel.scrollBy({ left: scrollStep, behavior: 'smooth' });
});

// Función para renderizar películas
function renderizarPeliculas(peliculas) {
  carousel.innerHTML = ''; // Vacía el carrusel

  if (peliculas.length === 0) {
    carousel.innerHTML = '<p style="color: white;">No se encontraron películas.</p>';
    return;
  }

  peliculas.forEach(movie => {
    const card = document.createElement('div');
    card.classList.add('posterCard');

    const img = document.createElement('img');
    img.src = movie.posterUrl || 'img/placeholder.jpg';
    img.alt = movie.title;

    card.addEventListener('click', () => {
      window.location.href = `detalle.html?slug=${movie.slug}`;
    });

    card.appendChild(img);
    carousel.appendChild(card);
  });
}

// Cargar películas desde el backend
fetch('https://obligatorio-2-jpi9.onrender.com/movies')
  .then(res => res.json())
  .then(data => {
    todasLasPeliculas = data.movies || [];
    renderizarPeliculas(todasLasPeliculas);
  })
  .catch(error => {
    console.error('Error al cargar películas:', error);
    carousel.innerHTML = '<p style="color: white;">Error al cargar los posters.</p>';
  });

// Filtro por nombre (buscador)
buscador.addEventListener('input', () => {
  const texto = buscador.value.toLowerCase();
  const filtradas = todasLasPeliculas.filter(peli =>
    peli.title.toLowerCase().includes(texto)
  );
  renderizarPeliculas(filtradas);
});

// Mostrar nombre del usuario
const storedUser = localStorage.getItem('username');
if (storedUser) {
  document.getElementById('username').textContent = storedUser;
}
