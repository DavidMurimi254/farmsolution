import { useActionState, useState, useEffect, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"

function Signup() {
    const [userInfo, setuserInfo] = useState(null)
    const [loading, isLoading] = useState(false)
    const [message, setMessage] = useState(null)
    const navigate = useNavigate()

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
            if(res.message === "Username exists") return
            if(res.message === "Admin already exists") return
            if(res.message === "Email exists") return

            setTimeout(() => {
                navigate("/login")
            }, 2000)
        } catch (err) {
            console.log(err)
            callNotification(err.message || "Sign up failed")
        } finally {
            isLoading(false)
        }
    }

    const [user, setUser, isUser] = useActionState(userSignUp, null)

    console.log(message)
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
                                zIndex: 2,
                                color: "black"
                }}><b>{message}</b></p>

            <div className="flexForm">
                <form action={setUser}>
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

                    <p>Have an account? <Link to="/login"><span>Log in</span></Link></p>

                    <button>Submit</button>
                </form>
            </div>
        </section>
        </>
    )
}

export default Signup