// leer slug de la url
const params = new URLSearchParams(window.location.search);
const slug = params.get("slug");

if (!slug) {
  document.body.innerHTML = "<p style='color:white;'>película no encontrada.</p>";
} else {
  fetch(`https://obligatorio-2-jpi9.onrender.com/movies/${slug}/detalle`)
    .then(res => res.json())
    .then(pelicula => {
      console.error(pelicula);

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
      añoSpan.textContent = pelicula.year;
      titulo.textContent = pelicula.title + " ";
      titulo.appendChild(añoSpan);

      const director = document.querySelector(".director a");
      director.textContent = pelicula.director || "Cargando...";
      director.href = "#";

      document.querySelector(".generos").textContent = "Genres: " + (pelicula.genero || "N/A");
      document.querySelector(".sinopsis em").textContent = pelicula.synopsis || "Cargando....";

      document.querySelector("#popup img").src = pelicula.posterUrl || "img/placeholder.jpg";
      document.querySelector(".popupcontent h2").innerHTML = `${pelicula.title} <span class="anio">${pelicula.year}</span>`;
    })
    .catch(err => {
      console.error("error al cargar detalle:", err);
      document.body.innerHTML = "<p style='color:white;'>error al cargar la película.</p>";
    });
}

// actualizar rating
function actualizarRating() {
  if (!slug) {
    console.error("no hay slug para actualizar el rating");
    return;
  }

  fetch(`https://obligatorio-2-jpi9.onrender.com/movies/${slug}/detalle`)
    .then(res => {
      if (!res.ok) throw new Error("error al obtener los detalles de la película");
      return res.json();
    })
    .then(pelicula => {
      const estrellas = document.querySelector(".estrellas");
      if (!estrellas) return;

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

window.actualizarRating = actualizarRating;

// mostrar nombre de usuario en header
const username = localStorage.getItem("username");

if (username) {
  const spanUsername = document.getElementById("username");
  spanUsername.textContent = username;
}

const logoutBtn = document.getElementById("iconLogout");
const opinionesBtn = document.getElementById("iconOpiniones");

logoutBtn.addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "index.html";
});

opinionesBtn.addEventListener("click", () => {
  window.location.href = "opiniones.html";
});