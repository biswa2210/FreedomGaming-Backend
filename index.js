const express=require('express');
const app = express();
require('dotenv/config');
bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const api=process.env.API_URL;
const cors = require('cors');
const authJwt=require('./fg-helpers/jwt');
const errorHandler = require('./fg-helpers/error-handler');
app.use(cors());
app.options('*',cors());
//Middlewears
app.use(bodyParser.json())
app.use(morgan('tiny'))
app.use(authJwt())
app.use('/fg-public/fg-uploads',express.static(__dirname+'/fg-public/fg-uploads'))
app.use(errorHandler);
//Routers
const productRouter=require('./fg-routers/products');
const userRouter=require('./fg-routers/users');
const orderRouter=require('./fg-routers/orders');
const categoriesRouter=require('./fg-routers/categories');
app.use(`${api}/products`,productRouter);
app.use(`${api}/users`,userRouter);
app.use(`${api}/orders`,orderRouter);
app.use(`${api}/categories`,categoriesRouter);
 
//Database Connections
mongoose.connect(process.env.CONNECTION_URL,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
    dbName : 'freedom-gaming-DB'
})
.then(()=>{
    console.log("Your Database Connection Is Ready");
}).catch((err)=>{
    console.log(err);
})

/*app.listen(3000,()=>{
    console.log(api);
    console.log("Server is running check it on http://localhost:3000");
})*/
//Production
let port=process.env.PORT || 5000;
app.listen(port,()=>{
    console.log("The Testing App is listening on the port of : "+port);
})