import { useActionState, useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

function Login() {
    const [notification, setNotification] = useState(false)
    const [loading, isLoading] = useState(false)
    const [message, setMessage] = useState(null)
    const navigate = useNavigate()

    function callNotification(message) {
        console.log(message)
        setMessage(message.message)
        setTimeout(() => {
            setMessage(null)
        }, 3000)
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
                body: JSON.stringify({email, password}),
                credentials: "include"
            })

            const res = await respond.json()
            console.log(res)

            callNotification(res)

            if(res.message === "Invalid input") return

            setTimeout(() => {
                navigate("/")
            }, 3000)
            } catch (err) {
                console.log(err)
                callNotification(err.message || "Log in failed")
            } finally {
                isLoading(false)
            }
    }

    const [login, setLogin , isLoginPending] = useActionState(logInForm, null)

    return(
        <>
        <section className="signUpwallPaper">
            <div className="flexForm">
                <p style={{transition: "all ease-out 0.5s",
                                position: "fixed",
                                top: "10px",
                                left: message ? "10px" : "-100%",
                                padding: "10px",
                                backgroundColor: "white",
                                borderRadius: "5px",
                                zIndex: 2,
                                color: "black"
                }}><b>{message}</b></p>

                <form action={setLogin}>
                    <h2>FarmSolution</h2>
                    <fieldset>
                        <legend>Email</legend>
                        <input type="text" name="email" />
                    </fieldset>

                    <fieldset>
                        <legend>Password</legend>
                        <input type="password" name="password" />
                    </fieldset>

                    <p>Don't have an account <Link to="/signup"><span>Sign Up</span></Link></p>

                    <button>Login</button>
                </form>
            </div>
            
        </section>
        </>
    )
}

export default Login