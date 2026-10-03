//=====================================
// VARIABLES
//=====================================

let graficaLinea = null;

let graficaPastel = null;

let graficaBubble = null;

//=====================================
// GRÁFICA DE LÍNEA
//=====================================

function crearGraficaLinea(datos){

    const ctx = document
        .getElementById("graficaLinea")
        .getContext("2d");

    if(graficaLinea){

        graficaLinea.destroy();

    }

    //--------------------------------------------------
    // HISTÓRICO
    //--------------------------------------------------

    const historico = datos.historico;

    //--------------------------------------------------
    // PREDICCIÓN
    //--------------------------------------------------

    const prediccion = datos.prediccion;

    //--------------------------------------------------
    // ETIQUETAS
    //--------------------------------------------------

    const labels = [];

    historico.forEach(x=>{

        labels.push(

            `${x.mes}/${x.anio}`

        );

    });

    prediccion.forEach(x=>{

        labels.push(

            `${x.mes}/${x.anio}`

        );

    });

    //--------------------------------------------------
    // DATOS HISTÓRICOS
    //--------------------------------------------------

    const datosHistoricos = historico.map(x=>

        Number(x.vuelos_cancelados)

    );

    //--------------------------------------------------
    // DATOS PREDICCIÓN
    //--------------------------------------------------

    const datosPrediccion = new Array(

        historico.length-1

    ).fill(null);

    datosPrediccion.push(

        Number(

            historico[historico.length-1]

            .vuelos_cancelados

        )

    );

    prediccion.forEach(x=>{

        datosPrediccion.push(

            Number(

                x.vuelos_cancelados

            )

        );

    });

    //--------------------------------------------------
    // INTERVALO (Temporal)
    //--------------------------------------------------

    const superior = new Array(

        historico.length

    ).fill(null);

    const inferior = new Array(

        historico.length

    ).fill(null);

    prediccion.forEach(x=>{

        superior.push(

            Number(x.vuelos_cancelados)*1.10

        );

        inferior.push(

            Number(x.vuelos_cancelados)*0.90

        );

    });

    //--------------------------------------------------
    // HISTÓRICO COMPLETO
    //--------------------------------------------------

    while(

        datosHistoricos.length<labels.length

    ){

        datosHistoricos.push(null);

    }

    //--------------------------------------------------
    // CHART
    //--------------------------------------------------

    graficaLinea = new Chart(ctx,{

        type:"line",

        data:{

            labels,

            datasets:[

                {

                    label:"Histórico",

                    data:datosHistoricos,

                    borderColor:"#0d6efd",

                    backgroundColor:"#0d6efd",

                    borderWidth:3,

                    tension:.35,

                    pointRadius:4,

                    fill:false

                },

                {

                    label:"Predicción",

                    data:datosPrediccion,

                    borderColor:"#6c757d",

                    backgroundColor:"#6c757d",

                    borderDash:[8,5],

                    borderWidth:3,

                    pointRadius:0,

                    tension:.35,

                    fill:false

                },

                {

                    label:"Límite superior",

                    data:superior,

                    borderWidth:0,

                    pointRadius:0,

                    fill:false

                },

                {

                    label:"Intervalo",

                    data:inferior,

                    borderWidth:0,

                    pointRadius:0,

                    backgroundColor:

                        "rgba(108,117,125,.20)",

                    fill:"-1"

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

            plugins:{

                legend:{

                    position:"top"

                }

            },

            scales:{

                x:{

                    title:{

                        display:true,

                        text:"Mes"

                    }

                },

                y:{

                    beginAtZero:true,

                    title:{

                        display:true,

                        text:"Vuelos cancelados"

                    }

                }

            }

        }

    });

}
//=====================================
// GRÁFICA DE PASTEL
//=====================================

function crearGraficaPastel(datos){

    const ctx = document
        .getElementById("graficaPastel")
        .getContext("2d");

    if(graficaPastel){

        graficaPastel.destroy();

    }

    const colores = {

        "Carrier":"#1E88E5",

        "Weather":"#3949AB",

        "National Airspace System":"#EF5350",

        "Security":"#FFB300"

    };

    const backgroundColor = datos.map(x=>

        colores[x.motivo_cancelacion] ?? "#999999"

    );

    const borderColor = datos.map(x=>

        filtrosDashboard.motivo == x.sk_cancelacion

            ? "#000000"

            : "#FFFFFF"

    );

    const borderWidth = datos.map(x=>

        filtrosDashboard.motivo == x.sk_cancelacion

            ? 4

            : 2

    );

    graficaPastel = new Chart(ctx,{

        type:"pie",

        data:{

            labels:datos.map(

                x=>x.motivo_cancelacion

            ),

            datasets:[{

                data:datos.map(

                    x=>Number(x.total)

                ),

                backgroundColor,

                borderColor,

                borderWidth,

                hoverOffset:20

            }]

        },

        plugins:[ChartDataLabels],

        options:{

            responsive:true,

            maintainAspectRatio:false,

            plugins:{

                legend:{

                    position:"right",

                    labels:{

                        usePointStyle:true,

                        padding:15

                    }

                },

                datalabels:{

                    color:"#555",

                    font:{

                        weight:"bold",

                        size:11

                    },

                    formatter(value,context){

                        const total = context.chart.data.datasets[0].data

                            .reduce((a,b)=>a+b,0);

                        const porcentaje =

                            (value*100/total).toFixed(2);

                        return porcentaje+" %";

                    }

                },

                tooltip:{

                    callbacks:{

                        label(context){

                            const value=context.raw;

                            const total=context.dataset.data

                                .reduce((a,b)=>a+b,0);

                            const porcentaje=(

                                value*100/total

                            ).toFixed(2);

                            return [

                                context.label,

                                value.toLocaleString(),

                                porcentaje+" %"

                            ];

                        }

                    }

                }

            },

            onClick(event,elementos){

                if(elementos.length===0)

                    return;

                const indice=elementos[0].index;

                const motivo=

                    datos[indice].sk_cancelacion;

                if(

                    filtrosDashboard.motivo==motivo

                ){

                    filtrosDashboard.motivo=null;

                }

                else{

                    filtrosDashboard.motivo=motivo;

                }

                actualizarDashboard();

            }

        }

    });

}

//=====================================
// BUBBLE CHART
//=====================================

//=====================================
// BUBBLE CHART
//=====================================

function crearBubbleChart(datos){

    const ctx = document
        .getElementById("graficaBubble")
        .getContext("2d");

    if(graficaBubble){

        graficaBubble.destroy();

    }

    const colores=[

        "#1E88E5",
        "#3949AB",
        "#8E24AA",
        "#43A047",
        "#F4511E",
        "#00ACC1",
        "#FB8C00",
        "#D81B60",
        "#5E35B1",
        "#00897B",
        "#7CB342",
        "#6D4C41",
        "#546E7A",
        "#C62828",
        "#FFB300",
        "#5C6BC0"

    ];

    const maxCancelados = Math.max(

        ...datos.map(x=>Number(x.vuelos_cancelados))

    );

    const puntos = datos.map((x,i)=>({

        id:Number(x.sk_aerolinea),

        label:x.nombre_aerolinea,

        x:Number(x.total_vuelos),

        y:Number(x.vuelos_cancelados),

        // Tamaño más pequeño y proporcional
        r:

            5 +

            (

                Number(x.vuelos_cancelados)

                / maxCancelados

            ) * 10,

        porcentaje:Number(x.porcentaje_cancelados),

        cancelados:Number(x.vuelos_cancelados),

        backgroundColor:colores[i % colores.length]

    }));

    graficaBubble = new Chart(ctx,{

        type:"bubble",

        data:{

            datasets:[{

                label:"Aerolíneas",

                data:puntos,

                backgroundColor:puntos.map(

                    p=>p.backgroundColor

                ),

                borderColor:puntos.map(

                    p=>p.backgroundColor

                ),

                borderWidth:1,

                hoverBorderWidth:2,

                hoverBorderColor:"#000"

            }]

        },

        options:{

            responsive:true,

            maintainAspectRatio:false,

            plugins:{

                legend:{

                    display:false

                },

                tooltip:{

                    callbacks:{

                        label(context){

                            const p=context.raw;

                            return[

                                p.label,

                                "Total vuelos: "

                                +p.x.toLocaleString(),

                                "Cancelados: "

                                +p.cancelados.toLocaleString(),

                                "% Cancelados: "

                                +p.porcentaje.toFixed(2)

                                +" %"

                            ];

                        }

                    }

                }

            },

            onClick(event,elementos){

                if(elementos.length===0)

                    return;

                const indice=elementos[0].index;

                const aerolinea=puntos[indice].id;

                if(

                    filtrosDashboard.aerolinea===

                    aerolinea

                ){

                    filtrosDashboard.aerolinea=null;

                }

                else{

                    filtrosDashboard.aerolinea=

                        aerolinea;

                }

                actualizarDashboard();

            },

            scales:{

                x:{

                    title:{

                        display:true,

                        text:"Total de vuelos"

                    },

                    ticks:{

                        callback(value){

                            return value.toLocaleString();

                        }

                    }

                },

                y:{

                    beginAtZero:true,

                    title:{

                        display:true,

                        text:"Vuelos cancelados"

                    },

                    ticks:{

                        precision:0

                    }

                }

            }

        }

    });

}
//=====================================
// TABLA
//=====================================

function llenarTabla(datos){

    const tbody = document.getElementById(

        "tablaCancelaciones"

    );

    tbody.innerHTML = "";

    datos.forEach(fila=>{

        const tr = document.createElement("tr");

        // Resaltar la aerolínea seleccionada
        if(

            filtrosDashboard.aerolinea ==

            fila.sk_aerolinea

        ){

            tr.classList.add(

                "table-info"

            );

        }

        tr.innerHTML = `

            <td>

                ${fila.nombre_aerolinea}

            </td>

            <td>

                ${Number(

                    fila.total_vuelos

                ).toLocaleString()}

            </td>

            <td>

                ${Number(

                    fila.vuelos_cancelados

                ).toLocaleString()}

            </td>

            <td>

                <strong>

                    ${Number(

                        fila.porcentaje_cancelados

                    ).toFixed(2)} %

                </strong>

            </td>

        `;

        tr.style.cursor="pointer";

        tr.addEventListener("click",()=>{

            if(

                filtrosDashboard.aerolinea ==

                fila.sk_aerolinea

            ){

                filtrosDashboard.aerolinea = null;

            }

            else{

                filtrosDashboard.aerolinea =

                    fila.sk_aerolinea;

            }

            actualizarDashboard();

        });

        tbody.appendChild(tr);

    });

}

