import { useState, useEffect } from "react"
import { Navigate } from "react-router-dom"
import { BarChart, Bar, XAxis, YAxis,Tooltip, Legend } from "recharts"

const data = [
    {name: "Action", uv: 4000, amt: 2400},
    {name: "Action", uv: 3000, amt: 1400},
    {name: "Action", uv: 2000, amt: 3400}
]

function Home() {
    return(
        <div style={{width: "90%"}}>
        <BarChart width={600} height={300} data={data}>
            <XAxis dataKey="name"/>
            <YAxis/>
            <Tooltip/>
            <Legend/>
            <Bar dataKey="uv" fill="#8884d8" />
        </BarChart>
        </div>
    )
}

export default Home