// 1. Leemos el "slug" (identificador único) desde la URL

const params = new URLSearchParams(window.location.search);
const slug = params.get("slug"); // Esto busca por ejemplo ?slug=matrix



// 2. Si no hay slug, mostramos un mensaje de error
if (!slug) {
  document.body.innerHTML = "<p style='color:white;'>película no encontrada.</p>";
} else {
  // 3. Si hay slug, pedimos datos
  fetch(`https://obligatorio-2-jpi9.onrender.com/movies/${slug}/detalle`)
    .then(res => res.json()) 
    .then(pelicula => {
      console.error(pelicula); 


      // 4. Mostramos la imagen del póster
      const posterImg = document.querySelector(".posterDetalle");
      posterImg.src = pelicula.posterUrl || "img/placeholder.jpg"; // Usamos una imagen por defecto si no hay URL
      posterImg.alt = pelicula.title;

      // 5. Mostramos estrellas
      const estrellas = document.querySelector(".estrellas");
      const estrellasNum = Math.round(pelicula.rating || 0);
      estrellas.textContent = "★".repeat(estrellasNum) + "☆".repeat(5 - estrellasNum);

      // 6. Ejecutamos actualizarRating
      if (typeof window.actualizarRating === "function") {
        window.actualizarRating();
      }

      // 7. Mostramos el título de la película y el año
      const titulo = document.querySelector(".tituloDetalle");
      const añoSpan = document.createElement("span");
      añoSpan.className = "año";
      añoSpan.textContent = pelicula.year;
      titulo.textContent = pelicula.title + " ";
      titulo.appendChild(añoSpan);

      // 8. Mostramos el nombre del director
      const director = document.querySelector(".director a");
      director.textContent = pelicula.director || "Cargando...";
      director.href = "#"; // En este caso no lleva link real

      // 9. Mostramos género y sinopsis
      document.querySelector(".generos").textContent = "Genres: " + (pelicula.genero || "N/A");
      document.querySelector(".sinopsis em").textContent = pelicula.synopsis || "Cargando....";

      // 10. Mostramos datos también en el popup
      document.querySelector("#popup img").src = pelicula.posterUrl || "img/placeholder.jpg";
      document.querySelector(".popupcontent h2").innerHTML = `${pelicula.title} <span class="anio">${pelicula.year}</span>`;
    })
    .catch(err => {
      console.error("error al cargar detalle:", err);
      document.body.innerHTML = "<p style='color:white;'>error al cargar la película.</p>";
    });
}

// ----------------------------------------------
// Actualizador de Rating
// ----------------------------------------------
function actualizarRating() {
  if (!slug) {
    console.error("no hay slug para actualizar el rating");
    return;
  }

  // Pedimos nuevamente los datos de la película
  fetch(`https://obligatorio-2-jpi9.onrender.com/movies/${slug}/detalle`)
    .then(res => {
      if (!res.ok) throw new Error("error al obtener los detalles de la película");
      return res.json();
    })
    .then(pelicula => {
      const estrellas = document.querySelector(".estrellas");
      if (!estrellas) return;

      // Recalculamos cuántas estrellas mostrar
      const estrellasNum = Math.round(pelicula.rating || 0);

      let textoEstrellas = "";
      for (let i = 0; i < 5; i++) {
        textoEstrellas += i < estrellasNum ? "★" : "☆";
      }

      estrellas.textContent = textoEstrellas;
    })
    .catch(err => {
      console.error("error actualizando rating:", err);
    });
}

// Hacemos que la función se pueda llamar desde otras partes
window.actualizarRating = actualizarRating;

// ------------------------------------------------
// mostrar el nombre del usuario guardado en localstorage
// ------------------------------------------------
const username = localStorage.getItem("username");
if (username) {
  const spanUsername = document.getElementById("username");
  spanUsername.textContent = username; // Mostramos el nombre en la pantalla
}

// ------------------------------------------------
// Botones: logout y opiniones
// ------------------------------------------------
const logoutBtn = document.getElementById("iconLogout");
const opinionesBtn = document.getElementById("iconOpiniones");

// Si se hace click en logout, borramos datos y volvemos al inicio
logoutBtn.addEventListener("click", () => {
  localStorage.clear(); // Borramos el usuario
  window.location.href = "index.html"; // Volvemos a la página principal
});

// Si se hace click en el botón de opiniones, vamos a esa página
opinionesBtn.addEventListener("click", () => {
  window.location.href = "opiniones.html";
});
