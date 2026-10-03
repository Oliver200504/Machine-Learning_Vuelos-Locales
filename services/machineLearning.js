const tf=require("@tensorflow/tfjs");
const pool=require("../database/conexion");

//=====================================
// VARIABLES
//=====================================

let modelo=null;

let maximos={
    anio:1,
    mes:12,
    dia:31,
    aerolinea:1,
    origen:1,
    destino:1,
    horario:1,
    distancia:1,
    retraso:1
};

let entrenamiento=[];

function convertirFranja(franja){

    switch(franja.trim()){

        case "Madrugada":
            return 1;

        case "Mañana":
            return 2;

        case "Tarde":
            return 3;

        case "Noche":
            return 4;

        default:
            return 1;

    }

}

//=====================================
// ENTRENAR MODELO
//=====================================

async function entrenarModelo(){

    console.clear();

    console.log("==============================================");
    console.log(" FLIGHT ANALYTICS - MACHINE LEARNING");
    console.log("==============================================\n");

    console.log("Leyendo datos del Data Warehouse...\n");

    const resultado=await pool.query(`
        SELECT
    DF.ANIO,
    DF.MES,
    DF.DIA,
    FV.SK_AEROLINEA,
    DR.SK_AEROPUERTO_ORIGEN,
    DR.SK_AEROPUERTO_DESTINO,
    DH.FRANJA_HORARIA,
    FV.DISTANCIA,
    FV.RETRASO_LLEGADA
FROM FACT_VUELOS FV
INNER JOIN DIM_FECHA DF
    ON FV.SK_FECHA=DF.SK_FECHA
INNER JOIN DIM_RUTA DR
    ON FV.SK_RUTA=DR.SK_RUTA
INNER JOIN DIM_HORARIO DH
    ON FV.SK_HORARIO=DH.SK_HORARIO
WHERE FV.RETRASO_LLEGADA IS NOT NULL
    `);

    entrenamiento=resultado.rows;

    if(entrenamiento.length===0){
        throw new Error("No existen registros para entrenar.");
    }

    console.log(`Registros encontrados: ${entrenamiento.length}\n`);

        maximos.anio=Math.max(...entrenamiento.map(x=>Number(x.anio)));
    maximos.aerolinea=Math.max(...entrenamiento.map(x=>Number(x.sk_aerolinea)));
    maximos.origen=Math.max(...entrenamiento.map(x=>Number(x.sk_aeropuerto_origen)));
    maximos.destino=Math.max(...entrenamiento.map(x=>Number(x.sk_aeropuerto_destino)));
    maximos.distancia=Math.max(...entrenamiento.map(x=>Number(x.distancia)));
    maximos.retraso=Math.max(...entrenamiento.map(x=>Math.max(0,Number(x.retraso_llegada))));

        const entradas=[];
    const salidas=[];

    for(const fila of entrenamiento){

        entradas.push([
            Number(fila.anio)/maximos.anio,
            Number(fila.mes)/12,
            Number(fila.dia)/31,
            Number(fila.sk_aerolinea)/maximos.aerolinea,
            Number(fila.sk_aeropuerto_origen)/maximos.origen,
            Number(fila.sk_aeropuerto_destino)/maximos.destino,
            convertirFranja(fila.franja_horaria)/4,
            Number(fila.distancia)/maximos.distancia
        ]);

        salidas.push([
            Math.max(0,Number(fila.retraso_llegada))/maximos.retraso
        ]);

    }

    console.log("Datos preparados correctamente.");

        console.log("Creando tensores...\n");

    const xs=tf.tensor2d(entradas,[entradas.length,8]);
    const ys=tf.tensor2d(salidas,[salidas.length,1]);

    console.log("Construyendo red neuronal...\n");

    modelo=tf.sequential();

    modelo.add(tf.layers.dense({
        inputShape:[8],
        units:64,
        activation:"relu"
    }));

    modelo.add(tf.layers.dense({
        units:32,
        activation:"relu"
    }));

    modelo.add(tf.layers.dense({
        units:1
    }));

    modelo.compile({
        optimizer:tf.train.adam(0.001),
        loss:"meanSquaredError",
        metrics:["mae"]
    });

    console.log("Entrenando modelo...\n");

    const EPOCAS=15;
    const inicio=Date.now();

    await modelo.fit(xs,ys,{
        epochs:EPOCAS,
        shuffle:true,
        callbacks:{
    onEpochEnd:(epoch,logs)=>{

        const maeNormalizado=logs.mae;
        const maeMinutos=maeNormalizado*maximos.retraso;

        const aprendizaje=Math.max(
            0,
            Math.min(
                100,
                (1-(maeMinutos/maximos.retraso))*100
            )
        );

        console.log(
            `Epoch ${String(epoch+1).padStart(2,"0")}/${EPOCAS} | Aprendizaje ${aprendizaje.toFixed(2)}% | Loss ${logs.loss.toFixed(8)} | MAE ${maeMinutos.toFixed(2)} min`
        );
    }
}
    });

    const tiempo=((Date.now()-inicio)/1000).toFixed(2);

    const evaluacion=modelo.evaluate(xs,ys);

    const loss=evaluacion[0].dataSync()[0];
    const mae=evaluacion[1].dataSync()[0];

    xs.dispose();
    ys.dispose();
    evaluacion[0].dispose();
    evaluacion[1].dispose();

    console.log("\n==============================================");
    console.log(" MODELO ENTRENADO");
    console.log("==============================================");
    console.log(`Loss Final : ${loss.toFixed(8)}`);
    console.log(`MAE        : ${mae.toFixed(2)} minutos`);
    console.log(`Tiempo     : ${tiempo} segundos`);
    console.log("==============================================\n");

}

//=====================================
// OBTENER FILTROS
//=====================================

async function obtenerFiltros(){

    const aerolineas=await pool.query(`
        SELECT
            SK_AEROLINEA,
            NOMBRE_AEROLINEA
        FROM DIM_AEROLINEA
        ORDER BY NOMBRE_AEROLINEA
    `);

    const ciudades=await pool.query(`
    SELECT DISTINCT
        SK_AEROPUERTO,
        CIUDAD
    FROM DIM_AEROPUERTO
    ORDER BY CIUDAD
`   );

    const horarios=await pool.query(`
    SELECT
        MIN(SK_HORARIO) AS SK_HORARIO,
        FRANJA_HORARIA
    FROM DIM_HORARIO
    GROUP BY FRANJA_HORARIA
    ORDER BY MIN(SK_HORARIO)
`);

    return{
    aerolineas:aerolineas.rows,
    ciudades:ciudades.rows,
    horarios:horarios.rows
};

}

//=====================================
// OBTENER DISTANCIA
//=====================================

async function obtenerDistancia(origen,destino){

    const resultado=await pool.query(`
        SELECT
            AVG(FV.DISTANCIA) AS DISTANCIA
        FROM FACT_VUELOS FV
        INNER JOIN DIM_RUTA DR
            ON FV.SK_RUTA=DR.SK_RUTA
        WHERE DR.SK_AEROPUERTO_ORIGEN=$1
        AND DR.SK_AEROPUERTO_DESTINO=$2
    `,[origen,destino]);

    return Number(resultado.rows[0]?.distancia||1000);

}

//=====================================
// PREDICCIÓN
//=====================================

async function predecir(datos){

    if(!modelo){
        throw new Error("El modelo aún no ha sido entrenado.");
    }

    const distancia=await obtenerDistancia(
        Number(datos.origen),
        Number(datos.destino)
    );

    const entrada=tf.tensor2d([[
        Number(datos.anio)/maximos.anio,
        Number(datos.mes)/12,
        Number(datos.dia)/31,
        Number(datos.aerolinea)/maximos.aerolinea,
        Number(datos.origen)/maximos.origen,
        Number(datos.destino)/maximos.destino,
        Number(datos.horario)/4,
        distancia/maximos.distancia
    ]]);

    const salida=modelo.predict(entrada);

    const minutos=Math.max(
        0,
        salida.dataSync()[0]*maximos.retraso
    );

    entrada.dispose();
    salida.dispose();

    let probabilidadRetraso=Math.min(
        99,
        (minutos/60)*100
    );

    probabilidadRetraso=Math.max(
        1,
        probabilidadRetraso
    );

    const probabilidadCancelacion=Math.min(
        95,
        probabilidadRetraso*0.12
    );

    let riesgo="MUY BAJO";

    if(probabilidadRetraso>=80){

        riesgo="ALTO";

    }

    else if(probabilidadRetraso>=60){

        riesgo="MEDIO";

    }

    else if(probabilidadRetraso>=30){

        riesgo="BAJO";

    }

    let motivo="Carrier";

    if(minutos>60){

        motivo="Weather";

    }

    else if(minutos>35){

        motivo="NAS";

    }

    else if(minutos>20){

        motivo="Late Aircraft";

    }

    else if(minutos>10){

        motivo="Security";

    }

    return{

        minutos:Number(
            minutos.toFixed(1)
        ),

        probabilidadRetraso:Number(
            probabilidadRetraso.toFixed(1)
        ),

        probabilidadCancelacion:Number(
            probabilidadCancelacion.toFixed(1)
        ),

        riesgo,

        motivo

    };

}

//=====================================
// ESTADO
//=====================================

function modeloEntrenado(){

    return modelo!==null;

}

//=====================================
// EXPORTAR
//=====================================

module.exports={

    entrenarModelo,

    obtenerFiltros,

    predecir,

    modeloEntrenado

};
