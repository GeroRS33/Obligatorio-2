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



// ========== MOSTRAR NOMBRE DE USUARIO EN HEADER ==========
const username = localStorage.getItem("username");

if (username) {
  const spanUsername = document.getElementById("username");
  spanUsername.textContent = username;
}

const logoutBtn = document.getElementById("iconLogout");
const opinionesBtn = document.getElementById("iconOpiniones");

logoutBtn.addEventListener("click", () => {
  localStorage.clear(); // Elimina usuario logueado
  window.location.href = "index.html"; // Volver al login
});

opinionesBtn.addEventListener("click", () => {
  window.location.href = "opiniones.html"; // Página para ver y editar opiniones
});
