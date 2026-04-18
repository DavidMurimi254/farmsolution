const express = require("express")
const cookieParser = require("cookie-parser")
const helmet = require("helmet")
const jwt = require("jsonwebtoken")
const cors = require("cors")
const argon = require("argon2")
const { createPool } = require("mysql2")
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

const JWT_TOKEN = process.env.JASONWEBTOKEN
function signUpMiddleWare(req, res, next) {
    const token = req.cookies

    if(!token) res.status(400).json({message: "No token"})

        try{
            const decod = jwt.verify(token, JWT_TOKEN)
            req.user = decod
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

    if(!username, !email, !role, !password, !confirmpassword) return res.json({message: "Invalid input"})

        if(password !== confirmpassword) return res.status(400).json({message: "Password mismatch"})
    // console.log(username, email, role, password, confirmpassword)

            db.execute("SELECT username FROM users", async (err, result) => {
                if(err) return console.log(err)

                    const finduserName = result.find(usename => usename.username === username)
                    if(finduserName) return res.status(401).json({message: "Username exists"})

                        const findAdmin = result.find(roleFind => roleFind.role === "admin")
                        console.log(findAdmin)
                        if(findAdmin) return res.status(401).json({message: "Admin already exists"})

                            const findEmail = result.find(em => em.email === email)
                            if(findEmail) return res.status(401).json({message: "Email exists"})

                            const hashedPassword = await argon.hash(password)

                        db.execute("INSERT INTO users(username, email, role, password) VALUES(?, ?, ?, ?)", [username, email, role, hashedPassword], (err) => {
                            if(err) return console.log(err)

                                console.log("done")

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

                                res.json({message: "done", user: {
                                    id: result[0].id,
                                    email: result[0].email,
                                    role: result[0].role,
                                    username: result[0].username
                                }})
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

                    res.json({message: {
                        id: result[0].id,
                        email: result[0].email,
                        role: result[0].role,
                        username: result[0].username
                    }})
        })
})

app.post("/farmer/data", (req, res) => {
    const {} = req.body
})

app.listen(PORT, () => {
    console.log(`Server running at port ${PORT}`)
})