//--------------------------------------------------
// VARIABLES
//--------------------------------------------------

let graficaTopRutas = null;

let graficaLinea = null;

let mapa = null;

let capaEstados = null;

//--------------------------------------------------
// TOP 10 RUTAS
//--------------------------------------------------

function crearGraficaTopRutas(datos){

    const ctx = document
        .getElementById("graficaTopRutas")
        .getContext("2d");

    if(graficaTopRutas){

        graficaTopRutas.destroy();

    }

    graficaTopRutas = new Chart(ctx,{

        type:"bar",

        data:{

            labels:datos.map(

                x=>x.aerolinea

            ),

            datasets:[{

                label:"Total de vuelos",

                data:datos.map(

                    x=>Number(x.total_vuelos)

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

                filtros.aerolinea = datos[indice].sk_aerolinea;

                await cargarKPIs();

                await cargarGraficaLinea();

                await cargarMapa();

            },

            plugins:{

                legend:{

                    display:false

                },

                tooltip:{

                    callbacks:{

                        label(context){

                            return (

                                context.raw.toLocaleString()

                                +" vuelos"

                            );

                        }

                    }

                }

            },

            scales:{

                x:{

                    beginAtZero:true,

                    title:{

                        display:true,

                        text:"Total de vuelos"

                    }

                },

                y:{

                    title:{

                        display:true,

                        text:"Aerolínea"

                    }

                }

            }

        }

    });

}
//--------------------------------------------------
// GRÁFICA DE LÍNEA
//--------------------------------------------------

function crearGraficaLinea(datos){

    const ctx = document
        .getElementById("graficaLinea")
        .getContext("2d");

    if(graficaLinea){

        graficaLinea.destroy();

    }

    graficaLinea = new Chart(ctx,{

        type:"line",

        data:{

            labels:datos.map(
                x=>x.periodo
            ),

            datasets:[

                {

                    label:"Distancia Promedio (millas)",

                    data:datos.map(
                        x=>Number(x.distancia)
                    ),

                    borderColor:"#1E88E5",

                    backgroundColor:"#1E88E5",

                    borderWidth:3,

                    tension:.35,

                    fill:false,

                    yAxisID:"y"

                },

                {

                    label:"Puntualidad (%)",

                    data:datos.map(
                        x=>Number(x.puntualidad)
                    ),

                    borderColor:"#8E24AA",

                    backgroundColor:"#8E24AA",

                    borderWidth:3,

                    tension:.35,

                    fill:false,

                    yAxisID:"y1"

                },

                {

                    label:"Vuelos Desviados",

                    data:datos.map(
                        x=>Number(x.vuelos_desviados)
                    ),

                    borderColor:"#43A047",

                    backgroundColor:"#43A047",

                    borderWidth:3,

                    tension:.35,

                    fill:false,

                    yAxisID:"y"

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

                if(!elementos.length){

                    return;

                }

                const indice = elementos[0].index;

                filtros.anioInicio = Number(datos[indice].anio);

                filtros.anioFin = Number(datos[indice].anio);

                filtros.mesInicio = Number(datos[indice].mes);

                filtros.mesFin = Number(datos[indice].mes);

                await cargarKPIs();

                await cargarTopRutas();

                await cargarMapa();

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

                        text:"Mes"

                    }

                },

                y:{

                    type:"linear",

                    position:"left",

                    beginAtZero:true,

                    title:{

                        display:true,

                        text:"Distancia / Vuelos"

                    }

                },

                y1:{

                    type:"linear",

                    position:"right",

                    beginAtZero:true,

                    min:0,

                    max:100,

                    grid:{

                        drawOnChartArea:false

                    },

                    title:{

                        display:true,

                        text:"Puntualidad (%)"

                    }

                }

            }

        }

    });

}

//--------------------------------------------------
// MAPA
//--------------------------------------------------

function actualizarMapaEstados(datos){

    //--------------------------------------------------
    // Crear mapa
    //--------------------------------------------------

    if(!mapa){

        mapa = L.map("mapaEstados").setView(

            [39.5,-98.35],

            4

        );

        L.tileLayer(

            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",

            {

                attribution:"© OpenStreetMap"

            }

        ).addTo(mapa);

    }

    //--------------------------------------------------
    // Limpiar capa anterior
    //--------------------------------------------------

    if(capaEstados){

        mapa.removeLayer(capaEstados);

    }

    capaEstados = L.layerGroup().addTo(mapa);

    //--------------------------------------------------
    // Coordenadas
    //--------------------------------------------------

    const estados={

        AL:[32.8,-86.8],
        AK:[64.2,-149.5],
        AZ:[34.2,-111.7],
        AR:[35.1,-92.4],
        CA:[36.7,-119.4],
        CO:[39.0,-105.5],
        CT:[41.6,-72.7],
        DE:[39.0,-75.5],
        FL:[27.8,-81.7],
        GA:[32.7,-83.3],
        HI:[20.8,-156.3],
        ID:[44.2,-114.5],
        IL:[40.0,-89.2],
        IN:[39.9,-86.3],
        IA:[42.0,-93.5],
        KS:[38.5,-98.0],
        KY:[37.8,-85.8],
        LA:[31.2,-92.3],
        ME:[45.3,-69.0],
        MD:[39.0,-76.7],
        MA:[42.4,-71.4],
        MI:[44.3,-85.6],
        MN:[46.3,-94.2],
        MS:[32.7,-89.7],
        MO:[38.4,-92.5],
        MT:[46.9,-110.3],
        NE:[41.5,-99.8],
        NV:[39.3,-116.6],
        NH:[43.6,-71.6],
        NJ:[40.1,-74.5],
        NM:[34.4,-106.1],
        NY:[42.9,-75.5],
        NC:[35.5,-79.4],
        ND:[47.5,-100.5],
        OH:[40.3,-82.8],
        OK:[35.6,-97.5],
        OR:[43.9,-120.6],
        PA:[41.2,-77.2],
        RI:[41.7,-71.5],
        SC:[33.8,-80.9],
        SD:[44.4,-100.2],
        TN:[35.8,-86.4],
        TX:[31.0,-99.3],
        UT:[39.3,-111.7],
        VT:[44.0,-72.7],
        VA:[37.5,-78.8],
        WA:[47.4,-120.7],
        WV:[38.6,-80.6],
        WI:[44.6,-89.6],
        WY:[43.0,-107.6]

    };

    //--------------------------------------------------
    // Dibujar
    //--------------------------------------------------

    datos.forEach(fila=>{

            console.log(fila);


        const estado = fila.estado?.trim();

        if(!estado || !estados[estado]){

            return;

        }

        const total = Number(fila.total_vuelos);

        const radio = Math.max(

            6,

            Math.sqrt(total)

        );

        const marcador = L.circleMarker(

            estados[estado],

            {

                radius:radio,

                color:"#1565C0",

                fillColor:"#1E88E5",

                fillOpacity:0.75,

                weight:2

            }

        );

        marcador.bindPopup(

            `<b>${estado}</b><br>
            Total de vuelos: ${total.toLocaleString()}`

        );

        marcador.on("click", async()=>{

    filtros.estado = estado;

    await Promise.all([

        cargarKPIs(),

        cargarTopRutas(),

        cargarGraficaLinea()

    ]);

});

        marcador.addTo(capaEstados);

    });

}