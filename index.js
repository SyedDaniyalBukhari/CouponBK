const express=require('express')
const adminRoutes=require('./routes/admin/admin')
const publicRoutes=require('./routes/public/public')
const app=express();
const cors=require('cors')
require('dotenv').config();
const connect=require('./config/connection')
app.use(cors())
app.use(express.json())
app.use('/admin/api',adminRoutes)
app.use('/public/api',publicRoutes)
connect


app.listen(5000,()=>{
    console.log(`Listening to PORT ${5000}`)
})