import { useActionState, useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { io } from "socket.io-client"

const socket = io("http://localhost:5000")

function Field() {
    const {id} = useParams()
    const [fieldData, setFieldData] = useState(null)
    const [allCrop, setAllCrop] = useState(null)
    const [loading, isLoading] = useState(false)
    const [cropId, setCropId] = useState(null)
    const [cropDetails, setCropDetails] = useState(null)
    const [formSent, setFormSend] = useState(false)
    const [message, setMessage] = useState(null)

    useEffect(() => {
        isLoading(true)
        async function fieldItem() {
            try{
                const respond = await fetch(`http://localhost:5000/field/${id}`)

                const res = await respond.json()
                console.log(res)
                setFieldData(res)
            } catch (err) {
                console.log(err)
            } finally {
                isLoading(false)
            }
        }

        fieldItem()
    }, [id])

    useEffect(() => {
        socket.emit("all_crops", id)
        socket.emit("refresh_crop")

        socket.on("fetch_all_crop", data => {
            const filterCrop = data.filter(da => Number(da.filedId) === Number(id))
            console.log(filterCrop)
            setAllCrop(filterCrop)
        })

        return () => {
            socket.off("all_crops")
            socket.off("refresh_crop")
        }
    }, [])

    async function sendDescription(prevState, formData) {
        const status = formData.get("status")
        const description = formData.get("description")
        const cropDID = formData.get("cropid")
        const userId = formData.get("userid")

        console.log(status, description, cropDID, userId)

        socket.emit("send_crop_data", {status, description, cropDID, userId})

        const response = await new Promise((resolve) => {
            socket.once("send_crop_details", resolve)
        })

        if(response) {
            setMessage("Added")

            setTimeout(() => {
                setMessage(null)
            }, 3000);
        }

        return {success: true, message: "Added"}
    }

    const [state, setState, isState] = useActionState(sendDescription, null)

    useEffect(() => {
        socket.emit("fetch_crop_details", cropId)

        socket.on("send_crop_details", data => {
            console.log(data)
            const filterCrop = data.filter(da => da.cropId === cropId)
            setCropDetails(filterCrop)
        })

        return () => socket.off("send_crop_details")
    }, [cropId, state])

    console.log(allCrop)
    if(!fieldData || fieldData.message.length === 0) return (<div style={{width: "100vw",
                                                                          height: "100vh",
                                                                          backgroundColor: "white",
                                                                          position: "fixed",
                                                                          top: "0",
                                                                          left: "0",
                                                                          display: "flex",
                                                                          justifyContent: "center",
                                                                          alignItems: "center"
    }}>
        <div>
            <h1 style={{color: "green"}}>FarmSolution</h1>
            <p style={{textAlign: "center"}}>Field doesn't exist</p>
            <div className="loadBar"></div>
        </div>
    </div>)

    return(
        <>
        <div className="fielddataBox">
            <p style={{transition: "all ease-out 0.5s",
                            position: "fixed",
                            top: "10px",
                            left: message ? "10px" : "-100%",
                            padding: "10px",
                            backgroundColor: "white",
                            borderRadius: "5px",
                            zIndex: 2
            }} ><b>{!state ? "" : state.message}</b></p>

            {/* <h1>{fieldData.message[0].fieldname}</h1> */}

            {!fieldData ? (<div className="loadBar"></div>) : (<h1>{fieldData.message[0].fieldname}</h1>)}

            <div className="summarryBox">
                <div>
                    <h2>Planting Date</h2>

                    {!fieldData ? (<div className="loadBar"></div>) : <h4>{new Date(fieldData.message[0].plantingdate).toDateString()}</h4>}
                </div>
                <div>
                    <h2>Ready</h2>
                    {!fieldData ? (<div className="loadBar"></div>) : <h4>{new Date(fieldData.message[0].plantingdate).toDateString()}</h4>}
                </div>
                <div>
                    <h2>Harvesting Date</h2>
                    {!fieldData ? (<div className="loadBar"></div>) : <h4>{new Date(fieldData.message[0].expectedharvesting).toDateString()}</h4>}
                </div>       
            </div>

            <div className="analysisNote">
                The digits below are crop id, click on one of the crop to view its progress or update its progress.
            </div>

            <div className="cropNumber">
                {!allCrop ? (<div className="loadBar"></div>) : allCrop.map(cro => (
                    <div key={cro.id} className="cropNumber" onClick={() => setCropId(cro.id)}>
                        <p>{cro.id}</p>
                    </div>
                ))}
            </div>
            
            {!cropId ? (<p style={{textAlign: "center"}}>Click atleast one crop to view details.</p>) : <div style={{borderTop: "1px solid grey",}} className="cropInfo">
                <h3>{fieldData.message[0].croptype} crop number {cropId}</h3>
                
                <div>
                    <button className="addDebBtn" style={{display: cropDetails.length > 0 ? "block" : "none"}} onClick={() => setFormSend(true)}>Add Analysis</button>
                    {cropDetails.length === 0 ? (<button className="descriptionBtn" onClick={() => setFormSend(true)}>Add Analysis</button>) : cropDetails.map(cr => (
                        <div key={cr.id} className="tweetDesc">
                            <h3 style={{textTransform: "capitalize"}}>{cr.status}</h3>
                            <p>Description: <span>{cr.description}</span></p>
                            <p>{cr.status === "healthy" ? "🟢Active" : "🔴At Risk" }</p>
                        </div>
                    ))}
                </div>

                <form action={setState} className="addAnalysisForm" style={{display: formSent ? "block" : "none"}}>
                    <p onClick={() => setFormSend(false)} style={{fontWeight: "bold", cursor: "pointer"}}>X</p>
                    <input type="hidden" value={fieldData.message[0].userId} readOnly name="userid" required />
                    <input type="hidden" value={cropId} readOnly name="cropid" required />
                    <fieldset>
                        <legend>Health Status</legend>
                        <select name="status" id="">
                            <option value="healthy">Healthy</option>
                            <option value="minor issues">Minor issues</option>
                            <option value="diseased">Diseased</option>
                            <option value="pest">Pest Infestation</option>
                            <option value="Nutrient Deficiency">Nutrient Deficiency</option>
                            <option value="Water Stress">Water Stress</option>
                            <option value="Weed Infestation">Weed Infestation</option>
                            <option value="Physical Damage">Physical Damage</option>
                            <option value="Harvested">Harvested</option>
                            <option value="Failed">Failed</option>
                        </select>
                    </fieldset>

                    <fieldset>
                        <legend>Description</legend>
                        <textarea name="description" id=""></textarea>
                    </fieldset>

                    <button>Submit</button>
                </form>
            </div>}
            
        </div>
        
        </>
    )
}

export default Field