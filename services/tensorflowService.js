const tf = require("@tensorflow/tfjs");

const queries = require("../queries/cancelacionesQueries");

let modelo = null;

let historico = [];

let maxX = 1;

let maxY = 1;

//=====================================
// ENTRENAR MODELO
//=====================================

async function entrenarModelo(){

    console.clear();

    console.log("");
    console.log("==========================================");
    console.log("   ENTRENANDO MODELO DE CANCELACIONES");
    console.log("==========================================");
    console.log("");

    historico = await queries.obtenerLinea({});

    if(!historico || historico.length===0){

        throw new Error(

            "No existen datos históricos para entrenar."

        );

    }

    const entradas=[];

    const salidas=[];

    historico.forEach((fila,i)=>{

        entradas.push(i+1);

        salidas.push(

            Number(

                fila.vuelos_cancelados

            )

        );

    });

    maxX=Math.max(...entradas);

    maxY=Math.max(...salidas);

    const xs=tf.tensor2d(

        entradas.map(

            x=>x/maxX

        ),

        [entradas.length,1]

    );

    const ys=tf.tensor2d(

        salidas.map(

            y=>y/maxY

        ),

        [salidas.length,1]

    );

    modelo=tf.sequential();

    modelo.add(

        tf.layers.dense({

            inputShape:[1],

            units:32,

            activation:"relu"

        })

    );

    modelo.add(

        tf.layers.dense({

            units:16,

            activation:"relu"

        })

    );

    modelo.add(

        tf.layers.dense({

            units:8,

            activation:"relu"

        })

    );

    modelo.add(

        tf.layers.dense({

            units:1

        })

    );

    modelo.compile({

        optimizer:

            tf.train.sgd(0.01),

        loss:"meanSquaredError"

    });

    console.log("Entrenando...\n");

    await modelo.fit(

        xs,

        ys,

        {

            epochs:800,

            shuffle:true,

            callbacks:{

                onEpochEnd:(epoch,logs)=>{

                    const porcentaje=(

                        ((epoch+1)/800)*100

                    ).toFixed(2);

                    process.stdout.write(

                        `\rProgreso: ${porcentaje}% | `+

                        `Época ${epoch+1}/800 | `+

                        `Loss: ${logs.loss.toFixed(6)}     `

                    );

                }

            }

        }

    );

    console.log("\n");

    //----------------------------------
    // Evaluación
    //----------------------------------

    const lossTensor = modelo.evaluate(

        xs,

        ys

    );

    const loss = lossTensor.dataSync()[0];

    const precision = Math.max(

        0,

        (1-loss)*100

    );

    //----------------------------------
    // Liberar memoria
    //----------------------------------

    xs.dispose();

    ys.dispose();

    lossTensor.dispose();

    //----------------------------------
    // Resultado
    //----------------------------------

    console.log("");

    console.log("==========================================");

    console.log("MODELO ENTRENADO CORRECTAMENTE");

    console.log("------------------------------------------");

    console.log(

        "Precisión aproximada: " +

        precision.toFixed(2) +

        "%"

    );

    console.log(

        "Loss final: " +

        loss.toFixed(6)

    );

    console.log("==========================================");

    console.log("");

}

//=====================================
// PREDICCIÓN
//=====================================

//=====================================
// PREDICCIÓN
//=====================================

async function predecir15Meses(filtros={}){

    if(!modelo){

        throw new Error(

            "El modelo aún no ha sido entrenado."

        );

    }

    //----------------------------------
    // Obtener histórico filtrado
    //----------------------------------

    const historicoFiltrado = await queries.obtenerLinea(

        filtros

    );

    if(

        !historicoFiltrado ||

        historicoFiltrado.length===0

    ){

        return{

            historico:[],

            prediccion:[]

        };

    }

    //----------------------------------
    // Última fecha del filtro
    //----------------------------------

    const ultimo = historicoFiltrado[

        historicoFiltrado.length-1

    ];

    let anio = Number(

        ultimo.anio

    );

    let mes = Number(

        ultimo.mes

    );

    //----------------------------------
    // Longitud del histórico filtrado
    //----------------------------------

    const longitud = historicoFiltrado.length;

    const predicciones=[];

    for(

        let i=1;

        i<=15;

        i++

    ){

        const entrada = tf.tensor2d(

            [[

                (longitud+i)/maxX

            ]]

        );

        const salida = modelo.predict(

            entrada

        );

        const valor =

            salida.dataSync()[0]

            * maxY;

        entrada.dispose();

        salida.dispose();

        mes++;

        if(mes>12){

            mes=1;

            anio++;

        }

        predicciones.push({

            anio,

            mes,

            vuelos_cancelados:

                Math.max(

                    0,

                    Math.round(valor)

                )

        });

    }

    return{

        historico:

            historicoFiltrado,

        prediccion:

            predicciones

    };

}

//=====================================
// ESTADO DEL MODELO
//=====================================

function modeloEntrenado(){

    return modelo!==null;

}

//=====================================
// HISTÓRICO
//=====================================

function obtenerHistorico(){

    return historico;

}

//=====================================
// EXPORTAR
//=====================================

module.exports={

    entrenarModelo,

    predecir15Meses,

    modeloEntrenado,

    obtenerHistorico

};