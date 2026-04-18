import { useActionState, useState, useEffect, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"

function Signup() {
    const [logStye, setLogStyle] = useState("signup")
    const [notification, setNotification] = useState(false)
    const navigate = useNavigate()
    const { mode } = useParams()
    const [loading, isLoading] = useState(false)
    const [message, setMessage] = useState(null)

    const formRef = useRef(null)

    function callNotification(message) {
        console.log(message)
        setMessage(message.message)
        setTimeout(() => {
            setMessage(null)
        }, 3000)
    }

    async function userSignUp(prevState, formData) {
        const username = formData.get("username")
        const email = formData.get("email")
        const role = formData.get("role")
        const password = formData.get("password")
        const confirmpassword = formData.get("confirmpassword")

        isLoading(true)

        try{
            const respond = await fetch("http://localhost:5000/signup", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({username,role , email, password, confirmpassword})
            })

            const res = await respond.json()
            console.log(res)
            callNotification(res)
            if(res.message === "Invalid input") return

            setTimeout(() => {
                // navigate("/overview")
            }, 2000)
        } catch (err) {
            console.log(err)
            callNotification(err.message || "Sign up failed")
        } finally {
            isLoading(false)
        }
    }

    const [user, setUser, isUser] = useActionState(userSignUp, null)

    function handeChangeURL() {
        const newUrl = logStye === "signup" ? "login" : "signup"
        setLogStyle(newUrl)
        navigate(`/${newUrl}`)
    }

    async function handleSubmit(e) {
        e.preventDefault()

        const formData = new FormData(e.target)
        await setUser(formData)
    }

    async function logInForm(prevState, formData) {
        const email = formData.get("email")
        const password = formData.get("password")

        console.log(email, password)
        isLoading(true)

        try {
            const respond = await fetch("http://localhost:5000/login", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({email, password})
            })

            const res = await respond.json()

            if(!respond.ok) {
                throw new Error(res.message)
            }

            callNotification(res)
            if(res.message === "Invalid input") return

            setTimeout(() => {
                // navigate("/overview")
            }, 2000)
            } catch (err) {
                console.log(err)
                callNotification(err.message || "Log in failed")
            } finally {
                isLoading(false)
            }
    }

    const [login, setLogin , isLoginPending] = useActionState(logInForm, null)

    console.log(mode)
    return(
        <>
        <section className="signUpwallPaper">
        <p style={{transition: "all ease-out 0.5s",
                        position: "fixed",
                        top: "10px",
                        left: message ? "10px" : "-100%",
                        padding: "10px",
                        backgroundColor: "white",
                        borderRadius: "5px",
                        zIndex: 2
}}><b>{message}</b></p>
            
            <div className="flexForm">
                {mode === "signup" ?
                   <form ref={formRef} onSubmit={handleSubmit} method="POST">
                    <h2>FarmSolution</h2>
                    <fieldset>
                        <legend>Username</legend>
                        <input type="text" name="username" />
                    </fieldset>

                    <fieldset>
                        <legend>Email</legend>
                        <input type="text" name="email" />
                    </fieldset>

                    <fieldset>
                        <legend>Role</legend>
                        <select name="role" id="">
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                            <option value="agent">Field Agent</option>
                        </select>
                    </fieldset>

                    <fieldset>
                        <legend>Password</legend>
                        <input type="password" name="password" />
                    </fieldset>

                    <fieldset>
                        <legend>Confirm Password</legend>
                        <input type="password" name="confirmpassword" />
                    </fieldset>

                    <p>Have an account? <span onClick={handeChangeURL}>Sign in</span></p>

                    <button>Submit</button>
                </form> : <form action={setLogin}>
                    <h2>FarmSolution</h2>
                    <fieldset>
                        <legend>Email</legend>
                        <input type="text" name="email" />
                    </fieldset>

                    <fieldset>
                        <legend>Password</legend>
                        <input type="password" name="password" />
                    </fieldset>

                    <p>Don't have an account <span onClick={handeChangeURL}>Sign Up</span></p>

                    <button>Login</button>
                </form>
                }
            </div>
            
        </section>
        </>
    )
}

export default Signup