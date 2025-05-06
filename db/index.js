import mongoose from 'mongoose'
import {app} from '../app.js'

const mongoDb = async ()=>{
    try {
        const dbURI = String(process.env.MONGOOSE_URI) || ""
        await mongoose.connect(`${dbURI}/${process.env.DB_NAME}`)
        .then(
            console.log(`Database ${process.env.DB_NAME} is working`)
        );
        app.on("Error",(error)=>{
            console.log("Err",error)
        })
    } catch (error) {
        console.log(error)
    }
}

export default mongoDb;