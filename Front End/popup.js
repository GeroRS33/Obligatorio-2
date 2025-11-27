




document.addEventListener('DOMContentLoaded', () => {
  const popup = document.getElementById('popup');
  const btnAgregar = document.querySelector('.btnAgregarOpinion');
  const stars = document.querySelectorAll('.stars span');
  const textarea = document.querySelector('textarea');
  const btnSubir = document.querySelector('.btnsubir');
  const opinionesContainer = document.querySelector('#opinionesContainer');

  const API_BASE = "https://obligatorio-2-jpi9.onrender.com";

 

  // Leer slug desde la URL (?slug=inception)
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");

  let selectedRating = 0;

  // ===================== FUNCIONES AUXILIARES =====================

  // Renderizar UNA opinión en el HTML
  function renderOpinion(opinion) {
    const opinionDiv = document.createElement("div");
    opinionDiv.className = "opinion";

    const pTexto = document.createElement("p");
    pTexto.textContent = opinion.comment;

    const infoDiv = document.createElement("div");

    const spanAutor = document.createElement("span");
    spanAutor.className = "autor";
    spanAutor.textContent = opinion.username;

    const br = document.createElement("br");

    const spanRating = document.createElement("span");
    spanRating.className = "rating";
    spanRating.textContent = "Rated: " + opinion.rating + " ★";

    infoDiv.appendChild(spanAutor);
    infoDiv.appendChild(br);
    infoDiv.appendChild(spanRating);

    opinionDiv.appendChild(pTexto);
    opinionDiv.appendChild(infoDiv);

    opinionesContainer.appendChild(opinionDiv);
  }

  // Cargar opiniones desde la API para esta película
  function cargarOpinionesDesdeAPI() {
    if (!slug) {
      console.error("No hay slug en la URL");
      return;
    }

    opinionesContainer.innerHTML = "Cargando opiniones...";

    fetch(API_BASE + "/movies/" + slug + "/opiniones")
      .then(function (res) {
        if (!res.ok) {
          throw new Error("Error al obtener opiniones");
        }
        return res.json();
      })
      .then(function (data) {
        const opiniones = data.opiniones || [];

        if (opiniones.length === 0) {
          opinionesContainer.innerHTML = "¡Sé el primero en opinar!";
          return;
        }

        opinionesContainer.innerHTML = "";
        for (let i = 0; i < opiniones.length; i++) {
          renderOpinion(opiniones[i]);
        }
      })
      .catch(function (err) {
        console.error("Error cargando opiniones:", err);
        opinionesContainer.innerHTML = "Error cargando opiniones.";
      });
  }

  // ===================== POPUP Y ESTRELLAS =====================

  // Mostrar el popup
  if (btnAgregar) {
    btnAgregar.addEventListener('click', () => {
      popup.style.display = 'flex';
    });
  }

  // Cerrar el popup al hacer clic fuera del contenido
  if (popup) {
    popup.addEventListener('click', (e) => {
      if (e.target === popup) {
        popup.style.display = 'none';
      }
    });
  }

  // Selección de estrellas
  for (let i = 0; i < stars.length; i++) {
    stars[i].addEventListener('click', function () {
      selectedRating = i + 1;
      for (let j = 0; j < stars.length; j++) {
        if (j < selectedRating) {
          stars[j].classList.add('active');
        } else {
          stars[j].classList.remove('active');
        }
      }
    });
  }

  // ===================== SUBIR OPINIÓN A LA API =====================

  if (btnSubir) {
    btnSubir.addEventListener('click', () => {
      const opinionTexto = textarea.value.trim();
      const usuarioGuardado = localStorage.getItem("usuarioLogueado");

      if (!usuarioGuardado) {
        alert("Debes estar logueado para opinar.");
        return;
      }

      const usuario = JSON.parse(usuarioGuardado);

      // Tratamos de soportar tanto {data:{...}} como {...}
      let userId = usuario.data._id;
      let username = usuario.data.username;

      if (!userId || !username) {
        alert("Error leyendo datos del usuario logueado.");
        return;
      }

      if (opinionTexto === '' || selectedRating === 0) {
        alert("Por favor, escribe una opinión y elige un rating.");
        return;
      }

      if (!slug) {
        alert("No se encontró la película (slug inválido).");
        return;
      }

      // 🚀 ENVIAR A LA API (NO toqueteamos el HTML acá)
      fetch(API_BASE + "/movies/" + slug + "/opinion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId: userId,
          username: username,
          rating: selectedRating,
          comment: opinionTexto
        })
      })
        .then(function (res) {
          if (!res.ok) {
            return res.text().then(function (text) {
              throw new Error(text || "Error al agregar la opinión");
            });
          }
          return res.text();
        })
        .then(function (msg) {
          console.log("Opinión agregada:", msg);

          // Limpiar campos
          textarea.value = '';
          selectedRating = 0;
          for (let i = 0; i < stars.length; i++) {
            stars[i].classList.remove('active');
          }
          popup.style.display = 'none';

          // 🔁 AHORA SÍ: recargamos TODA la lista desde la API
          cargarOpinionesDesdeAPI();
        })
        .catch(function (err) {
          console.error("Error al enviar opinión:", err);
          alert(err.message || "Error al enviar opinión");
        });
    });
  }

  // ===================== AL CARGAR LA PÁGINA =====================

  if (slug) {
    cargarOpinionesDesdeAPI();
  }
});