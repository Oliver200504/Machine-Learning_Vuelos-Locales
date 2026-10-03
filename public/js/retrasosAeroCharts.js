//--------------------------------------------------
// VARIABLES
//--------------------------------------------------

let graficaPuntualidad = null;

let graficaBurbuja = null;

let graficaLinea = null;

//--------------------------------------------------
// PUNTUALIDAD POR AEROPUERTO
//--------------------------------------------------

function crearGraficaPuntualidad(datos){

    const ctx = document

        .getElementById(

            "graficaPuntualidad"

        )

        .getContext("2d");

    if(graficaPuntualidad){

        graficaPuntualidad.destroy();

    }

    graficaPuntualidad = new Chart(ctx,{

        type:"bar",

        data:{

            labels:datos.map(

                x=>x.codigo_aeropuerto

            ),

            datasets:[{

                label:"% Puntualidad",

                data:datos.map(

                    x=>Number(x.puntualidad)

                ),

                backgroundColor:"#1E88E5",

                borderRadius:8,

                borderWidth:0

            }]

        },

        options:{

            responsive:true,

            maintainAspectRatio:false,

            indexAxis:"y",

            onClick:async(evento,elementos)=>{

                if(!elementos.length){

                    return;

                }

                const indice = elementos[0].index;

                filtros.aeropuerto =

                    datos[indice].sk_aeropuerto;

                document.getElementById(

                    "cmbAeropuerto"

                ).value =

                    datos[indice].sk_aeropuerto;

                await actualizarDashboard();

            },

            plugins:{

                legend:{

                    display:false

                }

            },

            scales:{

                x:{

                    beginAtZero:true,

                    max:100,

                    title:{

                        display:true,

                        text:"Puntualidad (%)"

                    }

                },

                y:{

                    title:{

                        display:true,

                        text:"Aeropuerto"

                    }

                }

            }

        }

    });

}

//--------------------------------------------------
// BURBUJAS
//--------------------------------------------------

function crearGraficaBurbujas(datos){

    const ctx = document

        .getElementById(

            "graficaBurbujas"

        )

        .getContext("2d");

    //--------------------------------------------------
    // Destruir gráfica anterior
    //--------------------------------------------------

    if(graficaBurbuja){

        graficaBurbuja.destroy();

    }

    //--------------------------------------------------
    // Crear gráfica
    //--------------------------------------------------

    graficaBurbuja = new Chart(ctx,{

        type:"bubble",

        data:{

            datasets:[{

                label:"Aeropuertos",

                data:datos.map(x=>({

                    x:Number(

                        x.promedio_retraso

                    ),

                    y:Number(

                        x.total_vuelos

                    ),

                    r:Math.max(

                        6,

                        Math.sqrt(

                            Number(

                                x.vuelos_retrasados

                            )

                        )/2

                    ),

                    aeropuerto:

                        x.codigo_aeropuerto,

                    sk_aeropuerto:

                        x.sk_aeropuerto,

                    vuelos_retrasados:

                        Number(

                            x.vuelos_retrasados

                        )

                })),

                backgroundColor:"rgba(30,136,229,.60)",

                borderColor:"#1565C0",

                borderWidth:2

            }]

        },

        options:{

            responsive:true,

            maintainAspectRatio:false,

            interaction:{

                mode:"nearest",

                intersect:true

            },

            onClick:async(evento,elementos)=>{

                if(!elementos.length){

                    return;

                }

                const indice =

                    elementos[0].index;

                const punto =

                    datos[indice];

                filtros.aeropuerto =

                    Number(

                        punto.sk_aeropuerto

                    );

                document.getElementById(

                    "cmbAeropuerto"

                ).value =

                    punto.sk_aeropuerto;

                await actualizarDashboard();

            },

            plugins:{

                legend:{

                    display:false

                },

                tooltip:{

                    callbacks:{

                        label(context){

                            const p =

                                context.raw;

                            return[

                                `Aeropuerto: ${p.aeropuerto}`,

                                `Promedio retraso: ${p.x.toFixed(1)} min`,

                                `Total vuelos: ${p.y.toLocaleString()}`,

                                `Vuelos retrasados: ${p.vuelos_retrasados.toLocaleString()}`

                            ];

                        }

                    }

                }

            },

            scales:{

                x:{

                    beginAtZero:true,

                    title:{

                        display:true,

                        text:"Promedio de retraso (minutos)"

                    }

                },

                y:{

                    beginAtZero:true,

                    title:{

                        display:true,

                        text:"Total de vuelos"

                    }

                }

            }

        }

    });

}

//--------------------------------------------------
// LÍNEA + PREDICCIÓN
//--------------------------------------------------

function crearGraficaLinea(

    historico,

    prediccion

){

    const ctx = document

        .getElementById(

            "graficaLinea"

        )

        .getContext("2d");

    if(graficaLinea){

        graficaLinea.destroy();

    }

    //------------------------------------------
    // Etiquetas
    //------------------------------------------

    const etiquetas=[

        ...historico.map(

            x=>x.periodo

        ),

        ...prediccion.map(

            x=>x.periodo

        )

    ];

    //------------------------------------------
    // Histórico
    //------------------------------------------

    const serieHistorica=[

        ...historico.map(

            x=>Number(

                x.vuelos_retrasados

            )

        ),

        ...Array(

            prediccion.length

        ).fill(null)

    ];

    //------------------------------------------
    // Predicción
    //------------------------------------------

    const seriePrediccion=[

        ...Array(

            Math.max(

                0,

                historico.length-1

            )

        ).fill(null),

        historico.length

            ? Number(

                historico[

                    historico.length-1

                ].vuelos_retrasados

            )

            : null,

        ...prediccion.map(

            x=>Number(

                x.vuelos_retrasados

            )

        )

    ];

    //------------------------------------------

    graficaLinea=new Chart(ctx,{

        type:"line",

        data:{

            labels:etiquetas,

            datasets:[

                {

                    label:"Histórico",

                    data:serieHistorica,

                    borderColor:"#1E88E5",

                    backgroundColor:"#1E88E5",

                    borderWidth:3,

                    tension:.35,

                    pointRadius:4,

                    fill:false

                },

                {

                    label:"Predicción",

                    data:seriePrediccion,

                    borderColor:"#E53935",

                    backgroundColor:"#E53935",

                    borderDash:[10,5],

                    borderWidth:3,

                    pointRadius:4,

                    tension:.35,

                    fill:false

                }

            ]

        },

        options:{

            responsive:true,

            maintainAspectRatio:false,

            interaction:{

                mode:"index",

                intersect:false

            },

            onClick:async(evento,elementos)=>{

                //----------------------------------
                // Solo permitir seleccionar
                // meses del histórico
                //----------------------------------

                if(

                    !elementos.length

                ){

                    return;

                }

                const indice =

                    elementos[0].index;

                if(

                    indice >=

                    historico.length

                ){

                    return;

                }

                filtros.anioInicio =

                    Number(

                        historico[indice].anio

                    );

                filtros.anioFin =

                    filtros.anioInicio;

                filtros.mesInicio =

                    Number(

                        historico[indice].mes

                    );

                filtros.mesFin =

                    filtros.mesInicio;

                //----------------------------------
                // Actualizar TODO
                //----------------------------------

                    await actualizarDashboard(false);

            },

            plugins:{

                legend:{

                    position:"bottom"

                }

            },

            scales:{

                x:{

                    title:{

                        display:true,

                        text:"Periodo"

                    }

                },

                y:{

                    beginAtZero:true,

                    title:{

                        display:true,

                        text:"Vuelos retrasados"

                    }

                }

            }

        }

    });

}