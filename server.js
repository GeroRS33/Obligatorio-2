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


// obtener detalles de una película (sin opiniones)
app.get("/movies/:slug/detalle", async (req, res) => {
    try {
        const params = req.params

        const pelicula = await Movie.findOne({ slug: params.slug }).select("-opiniones")

        if (!pelicula) {
            res.status(404).send("Película no encontrada")
            return
        }

        res.json(pelicula)
    } catch (e) {
        console.log(e)
        res.status(500).send("Error obteniendo detalles de la película")
    }
})



// agregar una opinión a una película
app.post("/movies/:slug/opinion", async (req, res) => {
    try {
        const params = req.params
        const body = req.body

        const userId = body.userId
        const username = body.username
        const rating = body.rating
        const comment = body.comment

        if (!userId || !username || !rating || !comment) {
            res.status(400).send("Faltan datos para la opinión")
            return
        }

        const pelicula = await Movie.findOne({ slug: params.slug })
        if (!pelicula) {
            res.status(404).send("Película no encontrada")
            return
        }

        pelicula.opiniones.push({
            userId: userId,
            username: username,
            rating: rating,
            comment: comment
        })

        await pelicula.save()

        res.send("Opinión agregada con éxito")

    } catch (e) {
        console.log(e)
        res.status(500).send("Error agregando opinión")
    }
})


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

        // Solo devolvemos el array de opiniones
        res.json({
            movieSlug: pelicula.slug,
            movieTitle: pelicula.title,
            opiniones: pelicula.opiniones
        })

    } catch (e) {
        console.log(e)
        res.status(500).send("Error obteniendo opiniones")
    }
})


// agregar una opinión a una película
app.post("/movies/:slug/opinion", async (req, res) => {
    try {
        const params = req.params
        const body = req.body

        const userId = body.userId
        const username = body.username
        const rating = body.rating
        const comment = body.comment

        // validaciones básicas
        if (!userId || !username || !rating || !comment) {
            res.status(400).send("Faltan datos para la opinión")
            return
        }

        // busca película
        const pelicula = await Movie.findOne({ slug: params.slug })
        if (!pelicula) {
            res.status(404).send("Película no encontrada")
            return
        }

        // agregar la opinión al array
        pelicula.opiniones.push({
            userId: userId,
            username: username,
            rating: rating,
            comment: comment
        })


        let sumRatings = 0

        for (let i = 0; i < pelicula.opiniones.length; i++) {
            sumRatings = sumRatings + pelicula.opiniones[i].rating
            }
        
        pelicula.rating = sumRatings / pelicula.opiniones.length


        // guardar en DB
        await pelicula.save()

        res.send("Opinión agregada con éxito")

    } catch (e) {
        console.log(e)
        res.status(500).send("Error agregando opinión")
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
