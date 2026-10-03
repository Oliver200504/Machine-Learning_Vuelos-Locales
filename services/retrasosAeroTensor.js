const tf = require("@tensorflow/tfjs");

const queries = require("../queries/retrasosAeroQueries");

//=====================================
// MODELO
//=====================================

let modelo = null;

let historico = [];

let maxY = 1;

const VENTANA = 12;

//=====================================
// ENTRENAR MODELO
//=====================================

async function entrenarModelo(){

    console.clear();

    console.log("");

    console.log("==========================================");

    console.log("   ENTRENANDO MODELO DE RETRASOS");

    console.log("==========================================");

    console.log("");

    //----------------------------------
    // Obtener histórico
    //----------------------------------

    historico = await queries.obtenerLinea({});

    if(

        !historico ||

        historico.length <= VENTANA

    ){

        throw new Error(

            "No existen suficientes datos para entrenar."

        );

    }

    //----------------------------------
    // Serie temporal
    //----------------------------------

    const serie = historico.map(

        fila=>

            Number(

                fila.vuelos_retrasados

            )

    );

    maxY = Math.max(

        ...serie

    );

    //----------------------------------
    // Construcción de ventanas
    //----------------------------------

    const entradas=[];

    const salidas=[];

    for(

        let i=0;

        i<serie.length-VENTANA;

        i++

    ){

        entradas.push(

            serie

                .slice(

                    i,

                    i+VENTANA

                )

                .map(

                    x=>x/maxY

                )

        );

        salidas.push([

            serie[

                i+VENTANA

            ]/maxY

        ]);

    }

    //----------------------------------
    // Tensores
    //----------------------------------

    const xs=tf.tensor2d(

        entradas,

        [

            entradas.length,

            VENTANA

        ]

    );

    const ys=tf.tensor2d(

        salidas,

        [

            salidas.length,

            1

        ]

    );

    //----------------------------------
    // Modelo
    //----------------------------------

    modelo=tf.sequential();

    modelo.add(

        tf.layers.dense({

            inputShape:[

                VENTANA

            ],

            units:64,

            activation:"relu"

        })

    );

    modelo.add(

        tf.layers.dense({

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

            units:1

        })

    );

    //----------------------------------
    // Compilar
    //----------------------------------

    modelo.compile({

        optimizer:

            tf.train.sgd(

                0.01

            ),

        loss:

            "meanSquaredError"

    });

    console.log(

        "Entrenando...\n"

    );

    //----------------------------------
    // Entrenamiento
    //----------------------------------

    await modelo.fit(

        xs,

        ys,

        {

            epochs:500,

            validationSplit:.2,

            shuffle:false,

            callbacks:{

                onEpochEnd:(

                    epoch,

                    logs

                )=>{

                    const porcentaje=(

                        (

                            (

                                epoch+1

                            )

                            /

                            500

                        )

                        *100

                    ).toFixed(2);

                    process.stdout.write(

                        `\rProgreso: ${porcentaje}% | `+

                        `Época ${epoch+1}/500 | `+

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

    const loss =

        lossTensor.dataSync()[0];

    const precision =

        Math.max(

            0,

            (

                1-loss

            )*100

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

    console.log(

        "=========================================="

    );

    console.log(

        "MODELO ENTRENADO"

    );

    console.log(

        "------------------------------------------"

    );

    console.log(

        "Ventana temporal: "

        +

        VENTANA

        +

        " meses"

    );

    console.log(

        "Registros: "

        +

        historico.length

    );

    console.log(

        "Precisión aproximada: "

        +

        precision.toFixed(2)

        +

        "%"

    );

    console.log(

        "Loss final: "

        +

        loss.toFixed(6)

    );

    console.log(

        "=========================================="

    );

    console.log("");

}

//=====================================
// PREDICCIÓN
//=====================================

async function predecir15Meses(filtros={}){

    //----------------------------------
    // Verificar modelo
    //----------------------------------

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

        historicoFiltrado.length < VENTANA

    ){

        return{

            historico:historicoFiltrado || [],

            prediccion:[]

        };

    }

    //----------------------------------
    // Convertir a números
    //----------------------------------

    const serie = historicoFiltrado.map(

        fila=>

            Number(

                fila.vuelos_retrasados

            )

    );

    //----------------------------------
    // Última fecha
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
    // Ventana inicial
    //----------------------------------

    let ventana = serie

        .slice(

            serie.length-VENTANA

        )

        .map(

            x=>x/maxY

        );

    //----------------------------------
    // Predicciones
    //----------------------------------

    const predicciones=[];

    for(

        let i=0;

        i<15;

        i++

    ){

        const entrada=tf.tensor2d(

            [

                ventana

            ],

            [

                1,

                VENTANA

            ]

        );

        const salida=modelo.predict(

            entrada

        );

        const valorNormalizado=

            salida.dataSync()[0];

        const valor=Math.max(

            0,

            Math.round(

                valorNormalizado

                *

                maxY

            )

        );

        entrada.dispose();

        salida.dispose();

        //----------------------------------
        // Avanzar fecha
        //----------------------------------

        mes++;

        if(

            mes>12

        ){

            mes=1;

            anio++;

        }

        predicciones.push({

            anio,

            mes,

            periodo:

                `${anio}-${String(mes).padStart(2,"0")}`,

            vuelos_retrasados:

                valor

        });

        //----------------------------------
        // Actualizar ventana
        //----------------------------------

        ventana.shift();

        ventana.push(

            valor/maxY

        );

    }

    //----------------------------------
    // Histórico normalizado
    //----------------------------------

    const historico = historicoFiltrado.map(

        fila=>({

            anio:Number(

                fila.anio

            ),

            mes:Number(

                fila.mes

            ),

            periodo:

                fila.periodo,

            vuelos_retrasados:

                Number(

                    fila.vuelos_retrasados

                )

        })

    );

    //----------------------------------
    // Resultado
    //----------------------------------

    return{

        historico,

        prediccion:

            predicciones

    };

}

//=====================================
// REENTRENAR MODELO
//=====================================

async function reentrenarModelo(){

    console.log("");

    console.log("==========================================");

    console.log("REENTRENANDO MODELO");

    console.log("==========================================");

    console.log("");

    modelo = null;

    historico = [];

    maxY = 1;

    await entrenarModelo();

}

//=====================================
// ESTADO DEL MODELO
//=====================================

function modeloEntrenado(){

    return modelo !== null;

}

//=====================================
// HISTÓRICO
//=====================================

function obtenerHistorico(){

    return historico;

}

//=====================================
// INFORMACIÓN DEL MODELO
//=====================================

function obtenerInfoModelo(){

    return{

        entrenado:

            modelo!==null,

        registros:

            historico.length,

        ventana:

            VENTANA,

        maxY

    };

}

//=====================================
// EXPORTAR
//=====================================

module.exports={

    entrenarModelo,

    reentrenarModelo,

    predecir15Meses,

    modeloEntrenado,

    obtenerHistorico,

    obtenerInfoModelo

};