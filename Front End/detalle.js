// ========== LEER SLUG DE LA URL ==========
const params = new URLSearchParams(window.location.search);
const slug = params.get("slug");



if (!slug) {
  document.body.innerHTML = "<p style='color:white;'>Película no encontrada.</p>";
} else {
  fetch(`https://obligatorio-2-jpi9.onrender.com/movies/${slug}/detalle`)
    .then(res => res.json())
    .then(pelicula => {

      console.error(pelicula)
      
      const posterImg = document.querySelector(".posterDetalle");
      posterImg.src = pelicula.posterUrl || "img/placeholder.jpg";
      posterImg.alt = pelicula.title;

      
      const estrellas = document.querySelector(".estrellas");
      const estrellasNum = Math.round(pelicula.rating || 0);
      estrellas.textContent = "★".repeat(estrellasNum) + "☆".repeat(5 - estrellasNum);
      
      if (typeof window.actualizarRating === "function") {
        window.actualizarRating();
      }

      
      const titulo = document.querySelector(".tituloDetalle");
      const añoSpan = document.createElement("span");
      añoSpan.className = "año";
      añoSpan.textContent = pelicula.year ;
      titulo.textContent = pelicula.title + " ";
      titulo.appendChild(añoSpan);

      
      const director = document.querySelector(".director a");
      director.textContent = pelicula.director || "Cargando...";
      director.href = "#";

      
      document.querySelector(".generos").textContent = "Genres: " + (pelicula.genero || "N/A");

      
      document.querySelector(".sinopsis em").textContent = pelicula.synopsis || "Cargando....";

      // Popup: actualizar también
      document.querySelector("#popup img").src = pelicula.posterUrl || "img/placeholder.jpg";
      document.querySelector(".popupcontent h2").innerHTML = `${pelicula.title} <span class="anio">${pelicula.year}</span>`;
    })
    .catch(err => {
      console.error("Error al cargar detalle:", err);
      document.body.innerHTML = "<p style='color:white;'>Error al cargar la película.</p>";
    });
}

// ===================== ACTUALIZAR RATING =====================
function actualizarRating() {
  if (!slug) {
    console.error("No hay slug para actualizar el rating");
    return;
  }

  fetch(`https://obligatorio-2-jpi9.onrender.com/movies/${slug}/detalle`)
    .then(res => {
      if (!res.ok) throw new Error("Error al obtener los detalles de la película");
      return res.json();
    })
    .then(pelicula => {
      const estrellas = document.querySelector(".estrellas");
      if (!estrellas) return;

      // calcula cantidad de estrellas llenas
      const estrellasNum = Math.round(pelicula.rating || 0);

      // versión simple, sin .repeat()
      let textoEstrellas = "";
      for (let i = 0; i < 5; i++) {
        textoEstrellas += i < estrellasNum ? "★" : "☆";
      }

      estrellas.textContent = textoEstrellas;
    })
    .catch(err => {
      console.error("Error actualizando rating:", err);
    });
}

// Exportamos para poder llamarla desde popup.js
window.actualizarRating = actualizarRating;



// ========== MOSTRAR NOMBRE DE USUARIO EN HEADER ==========
const username = localStorage.getItem("username");

if (username) {
  const spanUsername = document.getElementById("username");
  spanUsername.textContent = username;
}

