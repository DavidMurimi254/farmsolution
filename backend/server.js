const express = require("express")
const cookieParser = require("cookie-parser")
const helmet = require("helmet")
const jwt = require("jsonwebtoken")
const cors = require("cors")
const argon = require("argon2")
const { Server } = require("socket.io")
const http = require("http")
const { createPool } = require("mysql2")
const { Socket } = require("socket.io-client")
require("dotenv").config()

const PORT = process.env.PORT_SERVER

//MIDDEWARES
const app = express()
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["POST", "GET", "GET"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"]
}))
app.use(cookieParser())
app.use(express.json())
app.use(helmet())

const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173"
    }
})

const JWT_TOKEN = process.env.JASONWEBTOKEN
function signUpMiddleWare(req, res, next) {
    const token = req.cookies.token

    if(!token) return res.status(400).json({message: "No token"})

        try{
            const decod = jwt.verify(token, JWT_TOKEN)
            req.user = decod
            next()
        } catch (err) {
            console.log(err)
        }
}

const sb = createPool({
    user: process.env.USER,
    host: process.env.HOST,
    password: process.env.PASSWORD,
    port: process.env.DBPORT,
})

sb.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DATABASENAME}`,err => {
    if(err) throw err
    console.log('Database created successfully ✅✅✅')
})

const db = createPool({
    database: process.env.DATABASENAME,
    user: process.env.USER,
    host: process.env.HOST,
    password: process.env.PASSWORD,
    port: process.env.DBPORT,
    // ssl: { ca: fs.readFileSync('ca.pem') }
})

const userTable = `CREATE TABLE IF NOT EXISTS users(
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(500),
                    email VARCHAR(500),
                    role VARCHAR(100),
                    password VARCHAR(1000),
                    joined_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )`

db.execute(userTable, err => {
    if(err) return console.log(err)
        console.log("User table created")
})

// db.execute("DROP TABLE IF EXISTS users ", err => {
//     if(err) return console.log(err)
//         console.log("deleted")
// })

app.post("/signup", (req, res) => {
    const { username, email, role, password, confirmpassword } = req.body

    if(!username || !email || !role || !password || !confirmpassword) return res.json({message: "Invalid input"})

        if(password !== confirmpassword) return res.status(400).json({message: "Password mismatch"})
    // console.log(username, email, role, password, confirmpassword)

            db.execute("SELECT * FROM users", async (err, result) => {
                if(err) return console.log(err)

                    const finduserName = result.find(usename => usename.username === username)
                    if(finduserName) return res.status(401).json({message: "Username exists"})

                        if(role === "admin") {
                            const findAdmin = result.find(roleFind => roleFind.role === "admin")
                            console.log(findAdmin)
                            if(findAdmin) return res.status(401).json({message: "Admin already exists"})
                        }
                        

                            const findEmail = result.find(em => em.email === email)
                            if(findEmail) return res.status(401).json({message: "Email exists"})

                            const hashedPassword = await argon.hash(password)

                        db.execute("INSERT INTO users(username, email, role, password) VALUES(?, ?, ?, ?)", [username, email, role, hashedPassword], (err) => {
                            if(err) return console.log(err)

                                console.log("done")

                                res.json({message: "Signed up Successfully"})
                        })
            })
})

app.post("/login", (req, res) => {
    const { email, password } = req.body
    console.log(email, password)

        db.execute("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
            if(err) return console.log(err)
                console.log(result)

                if(result.length === 0) return res.status(401).json({message: "User not found"})

                const verifyPassword = await argon.verify(result[0].password, password)
                console.log(verifyPassword)
                if(!verifyPassword) return res.status(401).json({message: "Wrong password"})

                    const hash = jwt.sign({
                        userId: result[0].id,
                        email: result[0].email,
                        role: result[0].role,
                    }, JWT_TOKEN, {expiresIn: "1d"})

                    res.cookie("token", hash, {
                        httpOnly: true,
                        secure: true,
                        sameSite: "none",
                        maxAge: 24 * 60 * 60 * 1000
                    })

                    res.json({message: "Logged in" , info: {
                        id: result[0].id,
                        email: result[0].email,
                        role: result[0].role,
                        username: result[0].username
                    }})
        })
})

const fieldTable = `CREATE TABLE IF NOT EXISTS field(
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    fieldname VARCHAR(500),
                    userId INT DEFAULT 0,
                    croptype VARCHAR(200),
                    plantingdate VARCHAR(200),
                    currentdate VARCHAR(200),
                    expectedharvesting VARCHAR(200),
                    numberofcrops INT DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )`

const cropTable = `CREATE TABLE IF NOT EXISTS crop(
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    filedId INT DEFAULT 0,
                    typecrop VARCHAR(100),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                   )`

const cropDetails = `CREATE TABLE IF NOT EXISTS cropDetails(
                      id INT AUTO_INCREMENT PRIMARY KEY,
                      cropId INT DEFAULT 0,
                      userId INT DEFAULT 0,
                      description VARCHAR(1000),
                      status VARCHAR(100),
                      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                      )`

// db.execute("DROP TABLE IF EXISTS cropDetails", (err) => {
//     if(err) return console.log(err)

//         console.log("deleted")
// })

db.execute(fieldTable, err => {
    if(err) return console.log(err)
        
        console.log("Field table Created")
})

db.execute(cropTable, err => {
    if(err) return console.log(err)
        
        console.log("Crop table Created")
})

db.execute(cropDetails, err => {
    if(err) return console.log(err)

        console.log("Crop details table created")
})

io.on("connection", (socket) => {
    console.log("Connected: ", socket.id)

    socket.on("field_info", (data) => {
        console.log(data)

        if(data.fieldname === "" || data.userId === "" || data.croptype === "" || data.plantingdate === "" || data.currentdate === "" || data.expectedharvesting === "" || data.numberofcrops === "") return socket.emit("send_field_info", "All fields required")

        db.execute("INSERT INTO field(fieldname, userId, croptype, plantingdate, currentdate, expectedharvesting, numberofcrops) VALUES(?, ?, ?, ?, ?, ?, ?)",
            [data.fieldname, data.userId, data.croptype, data.plantingdate, data.currentdate, data.expectedharvesting, data.numberofcrops], err => {
                if(err) return console.log(err)

                    db.execute("SELECT * FROM field", (err, results) => {
                        if(err) return console.log(err)

                            const lastField = results[results.length - 1].id
                            console.log("List Id :", lastField)

                            for(let i = 0; i < Number(data.numberofcrops); i++) {
                                db.execute("INSERT INTO crop(filedId, typecrop) VALUES(?,?)", [lastField, data.croptype], (err) => {
                                    if(err) return console.log(err)

                                        db.execute("SELECT * FROM field", (err, result) => {
                                            socket.emit("send_field_info", "Added")
                                            console.log("Added")
                                            socket.emit("field_all_data", result)
                                        })
                                } )
                            }
                    })
            }
        )
    })

    socket.on("get_all_fields", () => {
        db.execute("SELECT * FROM field", (err, result) => {
            if(err) return console.log(err)

                socket.emit("field_all_data", result)
        })
    })
    
    socket.on("all_crops", (data) => {
        console.log("Field id: ", data)
        db.execute("SELECT * FROM crop WHERE filedId = ?", [data], (err, result) => {
            if(err) return console.log(err)

                console.log(result)
                socket.emit("throw_all_crop", result)
        })
    })

    db.execute("SELECT * FROM field", (err, result) => {
        if(err) return console.log(err)

            socket.emit("field_all_data", result)
    })

    socket.on("refresh_crop", () => {
        db.execute("SELECT * FROM crop", (err, result) => {
            if(err) return console.log(err)

                socket.emit("fetch_all_crop", result)
        })
    })

    socket.on("fetch_crop_details", () => {
        db.execute("SELECT * FROM cropDetails", (err, result) => {
            if(err) return console.log(err)

                socket.emit("send_crop_details", result)
        })
    })

    socket.on("send_crop_data", data => {
        console.log(data)
        if(data.userId === "" || !data.userId) return
        db.execute("INSERT INTO cropDetails(cropId, userId, description, status) VALUES(?, ?, ?, ?)", [data.cropDID, data.userId, data.description, data.status], (err) => {
            if(err) console.log(err)

                db.execute("SELECT * FROM cropDetails", (err, result) => {
                    if(err) return console.log(err)

                        socket.emit("send_crop_details", result)
                })
        })
    })

    socket.on("request_crop_details", () => {
        db.execute("SELECT * FROM crop", (err, result) => {
            if(err) return console.log(err)

                socket.emit("send_crop_details", result)
        })
    })

    socket.on("user_in", () => {
        db.execute("SELECT * FROM users", (err, result) => {
            if(err) return console.log(err)

                socket.emit("fetch_users", result)
        })
    })
    
    socket.on("disconnect", () => {
        console.log("Disconnected: ", socket.id)
    })
})

app.get("/profile", signUpMiddleWare, (req, res) => {
    const {userId} = req.user
    console.log(userId)
    db.execute("SELECT id, role, username FROM users WHERE id = ?", [userId], (err, respond) => {
        if(err) return console.log(err)

            res.json({message: respond})
    })
})

app.get("/field/:id", (req, res) => {
    const { id } = req.params
    console.log(id)

    db.execute("SELECT * FROM field WHERE id = ?", [id], (err, result) => {
        if(err) return console.log(err)

            res.json({message: result})
    })
})

server.listen(PORT, () => {
    console.log(`Server running at port ${PORT}`)
})