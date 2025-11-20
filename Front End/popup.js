document.addEventListener('DOMContentLoaded', () => {
  const popup = document.getElementById('popup');
  const btnAgregar = document.querySelector('.btnAgregarOpinion');
  const stars = document.querySelectorAll('.stars span');
  const textarea = document.querySelector('textarea');
  const btnSubir = document.querySelector('.btnsubir');
  const opinionesContainer = document.querySelector('#opinionesContainer');

  let selectedRating = 0;

  // Mostrar el popup
  btnAgregar?.addEventListener('click', () => {
    popup.style.display = 'flex';
  });

  // Cerrar el popup al hacer clic fuera del contenido
  popup?.addEventListener('click', (e) => {
    if (e.target === popup) {
      popup.style.display = 'none';
    }
  });

  // Selección de estrellas
  stars.forEach((star, index) => {
    star.addEventListener('click', () => {
      selectedRating = index + 1;
      stars.forEach((s, i) => {
        s.classList.toggle('active', i < selectedRating);
      });
    });
  });

  // Subir la opinión
  btnSubir?.addEventListener('click', () => {
    const opinionTexto = textarea.value.trim();
    const usuario = JSON.parse(localStorage.getItem("usuarioLogueado"));

    if (!usuario) {
      alert("Debes estar logueado para opinar.");
      return;
    }

    if (opinionTexto === '' || selectedRating === 0) {
      alert("Por favor, escribe una opinión y elige un rating.");
      return;
    }

    const opinionHTML = `
      <div class="opinion">
        <p>${opinionTexto}</p>
        <div>
          <span class="autor">${usuario.data.username}</span><br>
          <span class="rating">Rated: ${selectedRating} ★</span>
        </div>
      </div>
    `;

    opinionesContainer.insertAdjacentHTML('beforeend', opinionHTML);

    // Guardar en localStorage por título de película
    const titulo = document.querySelector('.tituloDetalle')?.innerText.trim();
    const opinionesGuardadas = JSON.parse(localStorage.getItem("opiniones")) || {};

    if (!opinionesGuardadas[titulo]) {
      opinionesGuardadas[titulo] = [];
    }

    opinionesGuardadas[titulo].push({
      autor: usuario.data.username,
      texto: opinionTexto,
      rating: selectedRating
    });

    localStorage.setItem("opiniones", JSON.stringify(opinionesGuardadas));

    // Limpiar y cerrar
    textarea.value = '';
    selectedRating = 0;
    stars.forEach(star => star.classList.remove('active'));
    popup.style.display = 'none';
  });

  // Al cargar la página: mostrar opiniones guardadas
  const titulo = document.querySelector('.tituloDetalle')?.innerText.trim();
  const opinionesGuardadas = JSON.parse(localStorage.getItem("opiniones")) || {};
  if (opinionesGuardadas[titulo]) {
    opinionesGuardadas[titulo].forEach(op => {
      const opinionHTML = `
        <div class="opinion">
          <p>${op.texto}</p>
          <div>
            <span class="autor">${op.autor}</span><br>
            <span class="rating">Rated: ${op.rating} ★</span>
          </div>
        </div>
      `;
      opinionesContainer.insertAdjacentHTML('beforeend', opinionHTML);
    });
  }
});
