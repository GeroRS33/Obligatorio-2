const mongoose = require("mongoose")
const express = require("express")
const cors = require("cors")

const Movie = require("./models/Movie")
const User = require("./models/User")

const app = express()
const PORT = 3000

app.use(cors())
app.use(express.json())

app.get("/", (req, res) => {
    res.send("API Funcionando")
})



app.get("/movies", async (req, res) => {
    try {
        const peliculas = await Movie.find().limit(50).sort({ title: 1 })
        const respuesta = {
            movies: peliculas,
            count: peliculas.length,
            message: "Películas obtenidas con éxito"
        }
        res.json(respuesta)
    } catch (e) {
        console.log(e)
        res.status(500).send("Error obteniendo películas")
    }
})


// obtener detalles de una película
app.get("/movies/:slug/detalle", async (req, res) => {
    try {
      const params = req.params;

      const pelicula = await Movie.findOne({ slug: params.slug });
  
    if (!pelicula) {
        res.status(404).send("Película no encontrada");
        return;
      }

    
    recalcularRatingPelicula(pelicula);
    await pelicula.save();

    res.json(pelicula);

    } catch (e) {
      console.log(e);
      res.status(500).send("Error obteniendo detalles de la película");
    }
  });



function recalcularRatingPelicula(pelicula) {
    if (!pelicula.opiniones || pelicula.opiniones.length === 0) {
      pelicula.rating = 0;
      return;
    }
  
    let suma = 0;
    let cantidad = pelicula.opiniones.length;
  
    for (let i = 0; i < cantidad; i++) {
      suma += pelicula.opiniones[i].rating;
    }
  
    pelicula.rating = suma / cantidad;

    console.log("Se recalculó el Rating brotherrrr");
  }
  
  
  // =================== AGREGAR OPINIÓN (1 por usuario) ===================
app.post("/movies/:slug/opinion", async (req, res) => {
    try {
      const { slug } = req.params;
      const { userId, username, rating, comment } = req.body;
  
      // Validaciones básicas
      if (!userId || !username || !rating || !comment) {
        res.status(400).send("Faltan datos para la opinión");
        return;
      }
  
      const ratingNum = Number(rating);
      if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
        res.status(400).send("El rating debe estar entre 1 y 5");
        return;
      }
  
      // Buscar la película
      const pelicula = await Movie.findOne({ slug });
      if (!pelicula) {
        res.status(404).send("Película no encontrada");
        return;
      }
  
      // ✅ Nuevo: chequear si este usuario ya opinó esta película
      const yaOpino = pelicula.opiniones.some(op => String(op.userId) === String(userId));
      if (yaOpino) {
        res.status(400).send("Ya dejaste una opinión para esta película");
        return;
      }
  
      // Agregar la nueva opinión
      pelicula.opiniones.push({
        userId,
        username,
        rating: ratingNum,
        comment,
      });
  
      // Recalcular rating promedio con helper
      recalcularRatingPelicula(pelicula);
  
      // Guardar en base de datos
      await pelicula.save();
  
      res.send("Opinión agregada con éxito");
  
    } catch (e) {
      console.error(e);
      res.status(500).send("Error agregando opinión");
    }
  });


app.post("/register", async (req, res) => {
    try {
        const body = req.body
        const username = body.username
        const password = body.password

        if (!username || !password) {
            res.status(400).send("Faltan datos")
            return
        }

        const usuarioExistente = await User.findOne({ username: username })
        if (usuarioExistente) {
            res.status(400).send("El usuario ya existe")
            return
        }

        const nuevoUsuario = await User.create({
            username: username,
            password: password
        })

        res.json({
            message: "Usuario creado con éxito",
            userId: nuevoUsuario._id,
            username: nuevoUsuario.username
        })

    } catch (e) {
        console.log(e)
        res.status(500).send("Error creando usuario")
    }
})

// login de usuario
app.post("/login", async (req, res) => {
    try {
        const body = req.body
        const username = body.username
        const password = body.password

        if (!username || !password) {
            res.status(400).send("Faltan datos")
            return
        }

        // Buscar usuario con ese username y password
        const usuario = await User.findOne({ username: username, password: password })

        if (!usuario) {
            res.status(401).send("Usuario o contraseña incorrectos")
            return
        }

        res.json({
            message: "Login correcto",
            userId: usuario._id,
            username: usuario.username
        })

    } catch (e) {
        console.log(e)
        res.status(500).send("Error en login")
    }
})




// Obtener todas las opiniones de una película
app.get("/movies/:slug/opiniones", async (req, res) => {
    try {
        const params = req.params

        const pelicula = await Movie.findOne({ slug: params.slug })
        if (!pelicula) {
            res.status(404).send("Película no encontrada")
            return
        }

        // Clonamos el array y lo ordenamos por createdAt (más nuevas primero)
        const opinionesOrdenadas = [...pelicula.opiniones].sort((a, b) => b.createdAt - a.createdAt)

        res.json({
            movieSlug: pelicula.slug,
            movieTitle: pelicula.title,
            opiniones: opinionesOrdenadas
        })

    } catch (e) {
        console.log(e)
        res.status(500).send("Error obteniendo opiniones")
    }
})


// Obtener todas las opiniones de un usuario (Mis críticas)
app.get("/users/:userId/opiniones", async (req, res) => {
    try {
        const userId = req.params.userId

        // Buscar todas las películas donde haya opiniones del usuario
        const peliculas = await Movie.find({ "opiniones.userId": userId })

        let resultado = []

        // Recorrer cada película y extraer solo las opiniones de ese user
        peliculas.forEach((pelicula) => {
            pelicula.opiniones.forEach((op) => {

                if (String(op.userId) === String(userId)) {
                    resultado.push({
                        opinionId: op._id,
                        movieSlug: pelicula.slug,
                        movieTitle: pelicula.title,
                        rating: op.rating,
                        comment: op.comment,
                        createdAt: op.createdAt
                    })
                }
            })
        })

        res.json({
            userId: userId,
            count: resultado.length,
            opiniones: resultado
        })

    } catch (e) {
        console.log(e)
        res.status(500).send("Error obteniendo opiniones del usuario")
    }
})


// Editar una opinión de una película
app.put("/movies/:slug/opiniones/:opinionId", async (req, res) => {
    try {
        const params = req.params
        const body = req.body

        const rating = Number(body.rating)
        const comment = body.comment

        // Validaciones básicas
        if (!rating || !comment) {
            res.status(400).send("Faltan datos para editar la opinión")
            return
        }

        if (rating < 1 || rating > 5) {
            res.status(400).send("El rating debe estar entre 1 y 5")
            return
        }

        // Buscar película por slug
        const pelicula = await Movie.findOne({ slug: params.slug })
        if (!pelicula) {
            res.status(404).send("Película no encontrada")
            return
        }

        // Buscar la opinión dentro del array por su _id
        const opinion = pelicula.opiniones.id(params.opinionId)
        if (!opinion) {
            res.status(404).send("Opinión no encontrada")
            return
        }

        // Como esto viene desde "Mis opiniones", asumimos que es del usuario correcto
        // Actualizar campos editables
        opinion.rating = rating
        opinion.comment = comment

        // 🔹 Recalcular rating general usando helper
        recalcularRatingPelicula(pelicula);

        // Guardar cambios
        await pelicula.save()

        res.send("Opinión editada con éxito")

    } catch (e) {
        console.log(e)
        res.status(500).send("Error editando opinión")
    }
})

// Eliminar una opinión de una película
app.delete("/movies/:slug/opiniones/:opinionId", async (req, res) => {
    try {
        const params = req.params;

        // 1) Buscar película por slug
        const pelicula = await Movie.findOne({ slug: params.slug });
        if (!pelicula) {
            res.status(404).send("Película no encontrada");
            return;
        }

        const index = pelicula.opiniones.findIndex(
            op => String(op._id) === String(params.opinionId)
        );

        if (index === -1) {
            res.status(404).send("Opinión no encontrada");
            return;
        }
        pelicula.opiniones.splice(index, 1);


        let cantidad = pelicula.opiniones.length;

        recalcularRatingPelicula(pelicula);

        await pelicula.save();

        res.send("Opinión eliminada con éxito");

    } catch (e) {
        console.log(e);
        res.status(500).send("Error eliminando opinión");
    }
});




async function iniciar() {
    try {
        await mongoose.connect("mongodb+srv://Gero:gero1234@cluster0.omkrlhm.mongodb.net/Obligatorio2")
        console.log("Conectados con la DB")

        app.listen(PORT, () => {
            console.log("Escuchando el puerto " + PORT)
        })

    } catch (e) {
        console.log("Error conectando a la DB", e.message)
    }
}

iniciar()
