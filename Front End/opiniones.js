const username = localStorage.getItem("username");
const userId = localStorage.getItem("userId");

document.getElementById("username").textContent = username;

// Logout
document.getElementById("iconLogout").addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "index.html";
});

const contenedor = document.getElementById("opinionesList");

if (!userId) {
  contenedor.innerHTML = "<p style='color:white;'>No estás logueado.</p>";
} else {
  // Traer opiniones del usuario
  fetch(`https://obligatorio-2-jpi9.onrender.com/opiniones/${userId}`)
    .then(res => res.json())
    .then(opiniones => {
      if (!Array.isArray(opiniones) || opiniones.length === 0) {
        contenedor.innerHTML = "<p style='color:white;'>Todavía no escribiste opiniones.</p>";
        return;
      }

      opiniones.forEach(op => {
        const div = document.createElement("div");
        div.className = "opinion";
        div.innerHTML = `
          <div>
            <span class="autor">${op.movieTitle}</span>
            <p>${op.text}</p>
            <span class="rating">★ ${op.rating}/5</span>
          </div>
          <div>
            <button class="editBtn" data-id="${op._id}">✏️</button>
            <button class="deleteBtn" data-id="${op._id}">🗑️</button>
          </div>
        `;
        contenedor.appendChild(div);
      });

      // Borrar opinión
      document.querySelectorAll(".deleteBtn").forEach(btn => {
        btn.addEventListener("click", () => {
          const id = btn.dataset.id;
          if (confirm("¿Seguro que querés borrar esta opinión?")) {
            fetch(`https://obligatorio-2-jpi9.onrender.com/opiniones/${id}`, {
              method: "DELETE"
            })
              .then(res => {
                if (res.ok) {
                  location.reload();
                } else {
                  alert("Error al borrar opinión");
                }
              });
          }
        });
      });

      // Editar (simplificado: redirigir a detalle)
      document.querySelectorAll(".editBtn").forEach(btn => {
        btn.addEventListener("click", () => {
          const id = btn.dataset.id;
          alert("Editar aún no implementado. Podés editar en el detalle de la película.");
        });
      });
    })
    .catch(err => {
      console.error("Error:", err);
      contenedor.innerHTML = "<p style='color:white;'>Error al cargar tus opiniones.</p>";
    });
}
