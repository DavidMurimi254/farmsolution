import { useState, useEffect, useActionState, useRef } from "react"
import { useNavigate, Link, useLocation } from "react-router-dom"
import { BarChart, Bar, XAxis, YAxis,Tooltip, Legend } from "recharts"
import { io } from "socket.io-client"

const socket = io("http://localhost:5000")

function Home() {
    const [sideBar, setSideBar] = useState(false)
    const [page, setPage] = useState("dashbord")
    const [fields, setFields] = useState(null)
    const [addField, setAddField] = useState(false)
    const [serverMessage, setServerMessage] = useState(null)
    const [userId, setUserId] = useState(null)
    const [loading, isLoading] = useState(true)
    const [crop, setCrop] = useState(null)
    const [user, setUser] = useState(null)

    const navigate = useNavigate()

    const returnPromise = useRef()
    const location = useLocation()

    async function addFieldInfo(prevState, formData) {
        const fieldname = formData.get("fieldname")
        const userId = formData.get("userId")
        const croptype = formData.get("croptype")
        const plantingdate = formData.get("plantingdate")
        const currentdate = formData.get("currentdate")
        const expectedharvesting = formData.get("expectedharvesting")
        const numberofcrops = formData.get("numberofcrops")

        const response = await new Promise((resolve) => {
            console.log(fieldname, userId, croptype, plantingdate, currentdate, expectedharvesting, numberofcrops)
            socket.emit("field_info", {fieldname, userId, croptype, plantingdate, currentdate, expectedharvesting, numberofcrops})

            socket.once("send_field_info", data => {
                resolve(data)
            })
        })

        setServerMessage(response)
        console.log("Server response ",response)
        
        return {success: true, message: "Field info sent"}
    }

    const [infoField, setInfoFiled, isField] = useActionState(addFieldInfo, null)

    console.log(infoField)

    useEffect(() => {
        async function myData() {
            const respond = await fetch("http://localhost:5000/profile", {
                method: "GET",
                credentials: "include"
            })

            const res = await respond.json()

            if(res.message === "No token") {
                navigate("/login")
            }

            setUserId(res.message[0].id)
        }

        myData()
    }, [])

    useEffect(() => {
        isLoading(true)
        socket.emit("get_all_fields")

        returnPromise.current = new Promise((resolve) => {
            socket.on("field_all_data", data => {
                console.log(data)
                setFields(data)
                isLoading(false)
                resolve(data)
            })
        })

        return () => socket.off("field_all_data")
    }, [location.pathname])

    console.log(user)

    useEffect(() => {
        socket.emit("request_crop_details")

        socket.on("send_crop_details", data => {
            console.log(data)
            setCrop(data)
        })

        return () => socket.off("request_crop_details")
    }, [])

    useEffect(() => {
        socket.emit("user_in")

        socket.on("fetch_users", data => {
            console.log(data)
            setUser(data)
        })

        return () => socket.off("request_crop_details")
    }, [])

    if(!fields || !user) return (<div className="loadBar"></div>)

    return(
        <>
        <div className="dropDownBtn" onClick={() => setSideBar(true)}>
            <div></div>
            <div></div>
            <div></div>
        </div>
        <div className="flexScreen">
            <aside style={{left: sideBar ? "0px" : "-100%"}}>
                <p className="close" onClick={() => setSideBar(false)}>X</p>
                <h3>FarmSolution</h3>
                <button onClick={() => setPage("dashbord")}>Dashboard</button>
                <button onClick={() => setPage("fields")}>Fields</button>
            </aside>

            <section className="otherScreen">
                {/* DASHBOARD */}
                <div style={{display: page === "dashbord" ? "block" : "none"}}>
                    <h1>Dashboard</h1>
                    <div className="countSummarry">
                        <div>
                            <span>
                                <h2>Fields</h2>
                                <button onClick={() => setPage("fields")}><i className="fa-solid fa-arrow-down"></i></button>
                            </span>
                            {!fields ? (<p>Loading</p>) : <h1>{fields.length}</h1>}
                            <span></span>
                        </div>

                        <div>
                            <span>
                                <h2>Crops</h2>
                                <button onClick={() => setPage("fields")}><i className="fa-solid fa-arrow-down"></i></button>
                            </span>

                            {!crop ? (<p>Loading</p>) : <h1>{crop.length}</h1>}
                            <span>
                                <p style={{color: "yellowgreen"}}>From Wed April 2026</p>
                            </span>
                        </div>

                        <div>
                            <span>
                                <h2>Users</h2>
                            </span>
                            {!user ? (<p>Loading</p>) : <h1>{user.length}</h1>}
                            <span>
                                <p style={{color: "yellowgreen"}}>From Wed April 2026</p>
                            </span>
                        </div>
                    </div>

                    <div className="otherInfo" style={{display: user[0].role === "admin" ? "flex" : "none"}}>
                        <div className="memberJoined">
                            <h3>Members Joined</h3>
                            <div className="membersavailable">
                                {!user ? (<div className="loadBar"></div>) : user.map(us => (
                                    <div key={us.id}>
                                        <h4>{us.username}</h4>
                                        <p style={{color: "yellowgreen"}}>{us.role}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="fieldsUpdatedLatest">
                            <h3>Fields</h3>

                            <div>
                                {!fields ? (<div className="loadBar"></div>) : fields.map(fi => (
                                    <div key={fi.id}>{fi.fieldname}</div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* FIELDS */}
                <div style={{display: page === "fields" ? "block" : "none"}} className="addFieldBox">
                    <h1>Fields</h1>

                    <form action={setInfoFiled} style={{display: addField ? "block" : "none"}}>
                        <p onClick={() => setAddField(false)}>X</p>
                        <input type="hidden" name="userId" value={userId} onChange={(e) => setUserId(e.target.value)}/>
                        <fieldset>
                            <legend>Field Name</legend>
                            <input type="text" name="fieldname" placeholder="Maize Farm" required/>
                        </fieldset>
                        
                        <fieldset>
                            <legend>Crop Type</legend>
                            <input type="text" name="croptype" placeholder="Maize" required/>
                        </fieldset>

                        <fieldset>
                            <legend>Planting Date</legend>
                            <input type="date" name="plantingdate" required/>
                        </fieldset>

                        <fieldset>
                            <legend>Current Date</legend>
                            <input type="date" name="currentdate" required/>
                        </fieldset>

                        <fieldset>
                            <legend>Harvesting Date</legend>
                            <input type="date" name="expectedharvesting" required/>
                        </fieldset>

                        <fieldset>
                            <legend>Number of crops/seeds</legend>
                            <input type="number" name="numberofcrops" required/>
                        </fieldset>

                        <button>Add</button>

                        <p>{serverMessage}</p>
                    </form>

                    {!fields || fields.length === 0 ? (<button className="addFieldButton" style={{display: addField ? "none" : "block"}} onClick={() => setAddField(true)}>Add Field +</button>) : <div className="scrollAllField">
                            <button className="addFieldButton2" onClick={() => setAddField(true)}>Add Field</button>

                            <div className="analysisNote">
                                Click one of the fields and get all the info about it.
                            </div>

                            <div className="">
                                {fields.map(fd => (
                                    <div key={fd.id} className="fieldBox" onClick={() => navigate(`/field/${fd.id}`)}>
                                        <i className="fa-solid fa-plant-wilt"></i>
                                        <p>{fd.numberofcrops === 1 ? fd.numberofcrops + "Crop" : fd.numberofcrops + "Crops"}</p>
                                        <p>{fd.fieldname}</p>
                                        <p>{fd.croptype}</p>
                                    </div>
                                ))}
                            </div>
                        </div>}
                </div>
            </section>
        </div>
        
        {/* <div style={{width: "90%"}}>
        <BarChart width={600} height={300} data={data}>
            <XAxis dataKey="name"/>
            <YAxis/>
            <Tooltip/>
            <Legend/>
            <Bar dataKey="uv" fill="#8884d8" />
        </BarChart>
        </div> */}
        </>
        
    )
}

export default Home