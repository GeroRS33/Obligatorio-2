// --------------------------------------------
// Seleccionamos elementos del HTML (DOM)
// --------------------------------------------
const carousel = document.getElementById('carouselPosters'); // Contenedor de los posters
const arrowLeft = document.getElementById('arrowLeft');     // Flecha izquierda
const arrowRight = document.getElementById('arrowRight');   // Flecha derecha
const buscador = document.getElementById('buscador');       // Input de búsqueda

// Guardamos todas las películas que vienen del backend
let todasLasPeliculas = [];

// Paso que se mueve el scroll del carrusel
const scrollStep = 300;

// --------------------------------------------
// Movimiento del carrusel con las flechas
// --------------------------------------------
arrowLeft.addEventListener('click', () => {
  carousel.scrollBy({ left: -scrollStep, behavior: 'smooth' }); // Mueve a la izquierda
});
arrowRight.addEventListener('click', () => {
  carousel.scrollBy({ left: scrollStep, behavior: 'smooth' }); // Mueve a la derecha
});

// --------------------------------------------
// Función que muestra las películas en pantalla
// --------------------------------------------
function renderizarPeliculas(peliculas) {
  carousel.innerHTML = ''; // Limpiamos el carrusel antes de mostrar

  // Si no hay resultados, mostramos un mensaje
  if (peliculas.length === 0) {
    carousel.innerHTML = '<p style="color: white;">No se encontraron películas.</p>';
    return;
  }

  // Recorremos cada película y la mostramos
  peliculas.forEach(movie => {
    // Creamos el contenedor para cada poster
    const card = document.createElement('div');
    card.classList.add('posterCard');

    // Creamos la imagen del poster
    const img = document.createElement('img');
    img.src = movie.posterUrl || 'img/placeholder.jpg'; // Si no hay imagen, se usa una de reemplazo
    img.alt = movie.title;

    // Si se hace click en la imagen, se va a la página de detalle
    card.addEventListener('click', () => {
      window.location.href = `detalle.html?slug=${movie.slug}`;
    });

    // Agregamos la imagen al contenedor
    card.appendChild(img);

    // Agregamos la card al carrusel
    carousel.appendChild(card);
  });
}

// --------------------------------------------
// Cargamos las películas desde el backend
// --------------------------------------------
fetch('https://obligatorio-2-jpi9.onrender.com/movies')
  .then(res => res.json()) // Convertimos la respuesta en formato JSON
  .then(data => {
    // Guardamos todas las películas
    todasLasPeliculas = data.movies || [];

    // Llamamos a la función para mostrarlas
    renderizarPeliculas(todasLasPeliculas);
  })
  .catch(error => {
    // Si algo falla, mostramos un mensaje de error
    console.error('Error al cargar películas:', error);
    carousel.innerHTML = '<p style="color: white;">Error al cargar los posters.</p>';
  });

// --------------------------------------------
// Buscador de películas por nombre (input)
// --------------------------------------------
buscador.addEventListener('input', () => {
  const texto = buscador.value.toLowerCase(); // Convertimos a minúsculas

  // Filtramos las películas cuyo título incluya lo que escribió el usuario
  const filtradas = todasLasPeliculas.filter(peli =>
    peli.title.toLowerCase().includes(texto)
  );

  // Mostramos las películas filtradas
  renderizarPeliculas(filtradas);
});

// --------------------------------------------
// Mostrar nombre de usuario en el header
// --------------------------------------------
const storedUser = localStorage.getItem('username');
if (storedUser) {
  document.getElementById('username').textContent = storedUser;
}

// --------------------------------------------
// Botones de logout y opiniones
// --------------------------------------------
const logoutBtn = document.getElementById("iconLogout");
const opinionesBtn = document.getElementById("iconOpiniones");

// Al hacer click en logout, borramos el usuario y volvemos al login
logoutBtn.addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "index.html";
});

// Al hacer click en el botón de opiniones, vamos a esa página
opinionesBtn.addEventListener("click", () => {
  window.location.href = "opiniones.html";
});
