//=====================================
// VARIABLES
//=====================================
let graficaFranja = null;
let graficaBubble = null;

//=====================================
// GRÁFICA FRANJA HORARIA
//=====================================

function crearGraficaFranja(datos){

    const ctx = document
        .getElementById("graficaFranja")
        .getContext("2d");

    if(graficaFranja){

        graficaFranja.destroy();

    }

    // Color fijo para cada franja
    const coloresFranja = {

        "Tarde":"#1E88E5",

        "Noche":"#3949AB",

        "Mañana":"#EF5350",

        "Madrugada":"#FFB300"

    };

    const backgroundColor = datos.map(

        x => coloresFranja[x.franja_horaria] ?? "#999999"

    );

    const borderColor = datos.map(x=>

        filtrosDashboard.franja===x.franja_horaria

            ? "#000000"

            : "#FFFFFF"

    );

    const borderWidth = datos.map(x=>

        filtrosDashboard.franja===x.franja_horaria

            ? 4

            : 2

    );

    graficaFranja = new Chart(ctx,{

        type:"pie",

        data:{

            labels:datos.map(x=>x.franja_horaria),

            datasets:[{

                data:datos.map(x=>Number(x.minutos)),

                backgroundColor,

                borderColor,

                borderWidth,

                hoverOffset:25

            }]

        },

        plugins:[ChartDataLabels],

        options:{

            responsive:true,

            maintainAspectRatio:false,

            layout:{

                padding:20

            },

            plugins:{

                legend:{

                    position:"right",

                    labels:{

                        usePointStyle:true,

                        padding:18,

                        font:{

                            size:13

                        }

                    }

                },

                datalabels:{

                    color:"#555",

                    font:{

                        weight:"bold",

                        size:11

                    },

                    anchor:"end",

                    align:"end",

                    offset:8,

                    formatter(value,context){

                        const total=context.chart.data.datasets[0].data

                            .reduce((a,b)=>a+b,0);

                        const porcentaje=

                            (value*100/total).toFixed(2);

                        return (

                            (value/1000).toFixed(2)

                            +" mil\n("

                            +porcentaje+

                            "%)"

                        );

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

                            return[

                                context.label,

                                value.toLocaleString()+" minutos",

                                porcentaje+" %"

                            ];

                        }

                    }

                }

            },

            onClick(event,elementos){

                if(elementos.length===0) return;

                const indice = elementos[0].index;

                const franja = datos[indice].franja_horaria;

                if(filtrosDashboard.franja===franja){

                    filtrosDashboard.franja=null;

                }

                else{

                    filtrosDashboard.franja=franja;

                }

                actualizarDashboard();

            }

        }

    });

}

//=====================================
// BUBBLE CHART
//=====================================

function crearBubbleChart(datos){

    const ctx = document
        .getElementById("graficaBurbujas")
        .getContext("2d");

    if(graficaBubble){

        graficaBubble.destroy();

    }

    const colores=[

        "#1E88E5",
        "#43A047",
        "#FB8C00",
        "#8E24AA",
        "#E53935",
        "#00ACC1",
        "#FDD835",
        "#3949AB",
        "#7CB342",
        "#D81B60",
        "#00897B",
        "#5E35B1",
        "#F4511E",
        "#6D4C41",
        "#039BE5",
        "#C0CA33",
        "#8BC34A",
        "#FF7043"

    ];

    const maxVuelos = Math.max(

        ...datos.map(x=>Number(x.total_vuelos))

    );

    const minVuelos = Math.min(

        ...datos.map(x=>Number(x.total_vuelos))

    );

    const datasets = datos.map((x,i)=>{

        const total = Number(x.total_vuelos);

        const radio =

            8 +

            (

                (total-minVuelos)

                /

                (maxVuelos-minVuelos || 1)

            )*22;

        const seleccionado =

            filtrosDashboard.aerolinea === Number(x.sk_aerolinea);

        return{

            label:x.nombre_aerolinea,

            data:[{

                id:Number(x.sk_aerolinea),

                label:x.nombre_aerolinea,

                x:total,

                y:Number(x.promedio_retraso),

                r:radio,

                vuelosRetrasados:Number(x.vuelos_retrasados),

                minutos:Number(x.total_minutos)

            }],

            backgroundColor:colores[i%colores.length],

            borderColor:seleccionado

                ? "#000"

                : colores[i%colores.length],

            borderWidth:seleccionado

                ? 3

                : 1

        };

    });

    graficaBubble = new Chart(ctx,{

        type:"bubble",

        data:{

            datasets

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

                                "Total vuelos: "+p.x.toLocaleString(),

                                "Promedio retraso: "+p.y+" min",

                                "Vuelos retrasados: "+p.vuelosRetrasados.toLocaleString(),

                                "Minutos retraso: "+p.minutos.toLocaleString()

                            ];

                        }

                    }

                }

            },

            onClick(event,elementos){

                if(elementos.length===0) return;

                const dataset = datasets[elementos[0].datasetIndex];

                const id = dataset.data[0].id;

                if(filtrosDashboard.aerolinea===id){

                    filtrosDashboard.aerolinea=null;

                }

                else{

                    filtrosDashboard.aerolinea=id;

                }

                actualizarDashboard();

            },

            scales:{

                x:{

                    title:{

                        display:true,

                        text:"Total de vuelos"

                    }

                },

                y:{

                    beginAtZero:true,

                    title:{

                        display:true,

                        text:"Promedio de retraso (minutos)"

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
        "tablaRetrasos"
    );

    tbody.innerHTML = "";

    datos.forEach(fila=>{

        const tr = document.createElement("tr");

        // Guardar el ID de la aerolínea
        tr.dataset.id = fila.sk_aerolinea ?? "";

        if(fila.aerolinea === "Total"){

            tr.classList.add("table-primary");

        }

        tr.innerHTML = `

            <td>${fila.aerolinea}</td>

            <td>${Number(fila.carrier).toLocaleString()}</td>

            <td>${Number(fila.weather).toLocaleString()}</td>

            <td>${Number(fila.nas).toLocaleString()}</td>

            <td>${Number(fila.security).toLocaleString()}</td>

            <td>${Number(fila.late_aircraft).toLocaleString()}</td>

            <td>

                <strong>

                    ${Number(fila.total).toLocaleString()}

                </strong>

            </td>

        `;

        // La fila de Total no se puede seleccionar
        if(fila.aerolinea !== "Total"){

            tr.style.cursor = "pointer";

            // Resaltar la fila seleccionada
            if(

                filtrosDashboard.aerolinea ===
                Number(fila.sk_aerolinea)

            ){

                tr.classList.add("table-info");

            }

            tr.addEventListener("click",()=>{

                const id = Number(tr.dataset.id);

                if(filtrosDashboard.aerolinea === id){

                    filtrosDashboard.aerolinea = null;

                }

                else{

                    filtrosDashboard.aerolinea = id;

                }

                console.log(

                    "SK Aerolínea:",

                    filtrosDashboard.aerolinea

                );

                actualizarDashboard();

            });

        }

        tbody.appendChild(tr);

    });

}