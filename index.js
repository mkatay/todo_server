

import express from 'express';
import mysql from 'mysql2/promise';
import {configDB} from './configDB.js';
import cors from 'cors'

let connection

try {
    connection = await mysql.createConnection(configDB);
  } catch (err) {
    console.log(err);
  }

const app=express()
app.use(express.json())
app.use(cors())

app.get('/todos',async (request,response)=>{
    try {
        const sql = 'select * from todos  order by timestamp desc'
        const [rows, fields] = await connection.execute(sql);
        response.send(rows)
      } catch (err) {
            console.log(err);
      }
})

app.post('/todos',async (request,response)=>{
    const {task}=request.body
    if(!task) return response.json({msg:"Hiányos adatok!"})
    try {
        const sql = 'insert into todos values (?,?,?,current_timestamp())'
        const values=[null,task,0]
        const [rows, fields] = await connection.execute(sql,values);
        response.json({msg:"Sikeres  hozzáadása!"})
      } catch (err) {
            console.log(err);
            response.status(500).json({msg:err})
      }
})
//sql injection tesztelés:
/*app.post('/todos',async (request,response)=>{
    const {task}=request.body
    if(!task) return response.json({msg:"Hiányos adatok!"})
    try {
        const sql = `insert into todos values (null,'${task}',0,current_timestamp())`   
        const [rows, fields] = await connection.query(sql);
        response.json({msg:"Sikeres  hozzáadása!"})
      } catch (err) {
            console.log(err);
            response.status(500).json({msg:err})
      }
})
*/
app.put('/todos/completed/:id',async (req,resp)=>{
    const { id } = req.params;
        try {
            const sql = "UPDATE todos SET completed=NOT completed WHERE id=?";
            const values=[ +id] 
            const [rows, fields] = await connection.query(sql,values);//ha több útasítást szeretnénk egyszerre futtani az execute nem engedi!!!
            resp.json({msg:"Sikeres módosítás!"})

        } catch (error) {
             console.log(error);
             resp.status(500).json({msg:"Hiba történt!"})
        } 
})
app.put('/todos/task/:id',async (req,resp)=>{
    const {task}=req.body
    const { id } = req.params;

    if( !task) return resp.json({msg:"Hiányos adat!"})
        try {
            const sql = "UPDATE todos SET task=? WHERE id=?;";
            const values=[task, +id];
            const [rows, fields] = await connection.query(sql,values);
            resp.json({msg:"Sikeres módosítás!"})

        } catch (error) {
             console.log(error);
             resp.status(500).json({msg:"Hiba történt!"})
        }
})

app.delete('/todos/:id',async (req,resp)=>{
    const { id } = req.params;
    try {
        const sql = 'delete from todos where id=?'
        const values=[id]
        const [rows, fields] = await connection.execute(sql,values);
        console.log(rows.affectedRows);//ha 0 nincs mit törölni!!!!!!!!!!!!!!!!
        resp.json({msg:"Sikeres törlés!"})
      } catch (err) {
            console.log(err);
            resp.status(500).json({msg:"Hiba történt!"})
      }
    
})


const port=process.env.PORT || 8000
app.listen(port,()=>console.log(`server listening on port ${port}...`))
