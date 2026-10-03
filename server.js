const express=require("express");
const cors=require("cors");
const path=require("path");

const pool=require("./database/conexion");

const dashboardRoutes=require("./routes/dashboardRoutes");
const retrasosRoutes=require("./routes/retrasosRoutes");
const cancelacionesRoutes=require("./routes/cancelacionesRoutes");
const analisisRutaRoutes=require("./routes/analisisRutaRoutes");
const retrasosAeroRoutes=require("./routes/retrasosAeroRoutes");
const cancelacionesAeroRoutes=require("./routes/cancelacionesAeroRoutes");

const tensorflowService=require("./services/tensorflowService");
const retrasosAeroTensor=require("./services/retrasosAeroTensor");
const machineLearning=require("./services/machineLearning");

const app=express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname,"public")));

//=====================================
// RUTAS
//=====================================

app.use("/api/dashboard",dashboardRoutes);
app.use("/api/retrasos",retrasosRoutes);
app.use("/api/cancelaciones",cancelacionesRoutes);
app.use("/api/analisis-ruta",analisisRutaRoutes);
app.use("/api/retrasos-aero",retrasosAeroRoutes);
app.use("/api/cancelaciones-aero",cancelacionesAeroRoutes);

//=====================================
// MACHINE LEARNING
//=====================================

app.get("/api/ml/estado",(req,res)=>{

    res.json({
        entrenado:machineLearning.modeloEntrenado()
    });

});

app.get("/api/ml/filtros",async(req,res)=>{

    try{

        const filtros=await machineLearning.obtenerFiltros();

        res.json(filtros);

    }

    catch(error){

        console.error(error);

        res.status(500).json({
            error:error.message
        });

    }

});

app.post("/api/ml/predecir",async(req,res)=>{

    try{

        const resultado=await machineLearning.predecir(req.body);

        res.json(resultado);

    }

    catch(error){

        console.error(error);

        res.status(500).json({
            error:error.message
        });

    }

});

//=====================================

app.get("/",(req,res)=>{

    res.sendFile(
        path.join(__dirname,"public","index.html")
    );

});

//=====================================

const PORT=3000;

//=====================================
// INICIAR SERVIDOR
//=====================================

async function iniciarServidor(){

    try{

        await pool.query("SELECT NOW()");

        console.log("PostgreSQL conectado.\n");

        console.log("Entrenando modelo de Cancelaciones...\n");
        await tensorflowService.entrenarModelo();
        console.log("Modelo de Cancelaciones listo.\n");

        console.log("Entrenando modelo de Retrasos por Aeropuerto...\n");
        await retrasosAeroTensor.entrenarModelo();
        console.log("Modelo de Retrasos listo.\n");

        console.log("Entrenando modelo de Machine Learning...\n");
        await machineLearning.entrenarModelo();
        console.log("Modelo de Machine Learning listo.\n");

        app.listen(PORT,()=>{

            console.log("==============================================");
            console.log(" SERVIDOR INICIADO");
            console.log("==============================================");
            console.log(`http://localhost:${PORT}`);
            console.log("==============================================");

        });

    }

    catch(error){

        console.error(error);

    }

}

iniciarServidor();