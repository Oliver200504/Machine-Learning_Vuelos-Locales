/*
==============================================
CHARTS.JS
Dashboard de Vuelos
==============================================
*/

let graficaEstado = null;
let graficaVuelosMes = null;
let mapaEstados = null;
let marcadoresEstados = [];

const coordenadasEstados = {

    AL:{lat:32.806671,lng:-86.791130},
    AK:{lat:61.370716,lng:-152.404419},
    AZ:{lat:33.729759,lng:-111.431221},
    AR:{lat:34.969704,lng:-92.373123},
    CA:{lat:36.116203,lng:-119.681564},
    CO:{lat:39.059811,lng:-105.311104},
    CT:{lat:41.597782,lng:-72.755371},
    DE:{lat:39.318523,lng:-75.507141},
    FL:{lat:27.766279,lng:-81.686783},
    GA:{lat:33.040619,lng:-83.643074},
    HI:{lat:21.094318,lng:-157.498337},
    ID:{lat:44.240459,lng:-114.478828},
    IL:{lat:40.349457,lng:-88.986137},
    IN:{lat:39.849426,lng:-86.258278},
    IA:{lat:42.011539,lng:-93.210526},
    KS:{lat:38.526600,lng:-96.726486},
    KY:{lat:37.668140,lng:-84.670067},
    LA:{lat:31.169546,lng:-91.867805},
    ME:{lat:44.693947,lng:-69.381927},
    MD:{lat:39.063946,lng:-76.802101},
    MA:{lat:42.230171,lng:-71.530106},
    MI:{lat:43.326618,lng:-84.536095},
    MN:{lat:45.694454,lng:-93.900192},
    MS:{lat:32.741646,lng:-89.678696},
    MO:{lat:38.456085,lng:-92.288368},
    MT:{lat:46.921925,lng:-110.454353},
    NE:{lat:41.125370,lng:-98.268082},
    NV:{lat:38.313515,lng:-117.055374},
    NH:{lat:43.452492,lng:-71.563896},
    NJ:{lat:40.298904,lng:-74.521011},
    NM:{lat:34.840515,lng:-106.248482},
    NY:{lat:42.165726,lng:-74.948051},
    NC:{lat:35.630066,lng:-79.806419},
    ND:{lat:47.528912,lng:-99.784012},
    OH:{lat:40.388783,lng:-82.764915},
    OK:{lat:35.565342,lng:-96.928917},
    OR:{lat:44.572021,lng:-122.070938},
    PA:{lat:40.590752,lng:-77.209755},
    RI:{lat:41.680893,lng:-71.511780},
    SC:{lat:33.856892,lng:-80.945007},
    SD:{lat:44.299782,lng:-99.438828},
    TN:{lat:35.747845,lng:-86.692345},
    TX:{lat:31.054487,lng:-97.563461},
    UT:{lat:40.150032,lng:-111.862434},
    VT:{lat:44.045876,lng:-72.710686},
    VA:{lat:37.769337,lng:-78.169968},
    WA:{lat:47.400902,lng:-121.490494},
    WV:{lat:38.491226,lng:-80.954453},
    WI:{lat:44.268543,lng:-89.616508},
    WY:{lat:42.755966,lng:-107.302490},

    DC:{lat:38.907192,lng:-77.036873},

    PR:{lat:18.220833,lng:-66.590149},

    VI:{lat:18.335765,lng:-64.896335},

    GU:{lat:13.444304,lng:144.793732},

    AS:{lat:-14.270972,lng:-170.132217},

    MP:{lat:15.097900,lng:145.673900}

};

/*
==============================================
GRAFICA DE ESTADO
==============================================
*/

function crearGraficaEstado(datos){

    const ctx = document
        .getElementById("graficaEstado")
        .getContext("2d");

    if(graficaEstado){

        graficaEstado.destroy();

    }

    graficaEstado = new Chart(ctx,{

        type:"pie",

        data:{

            labels:[

                "Completados",
                "Cancelados",
                "Desviados"

            ],

            datasets:[{

                data:[

                    datos.completados,
                    datos.cancelados,
                    datos.desviados

                ],

                backgroundColor:[

                    filtrosDashboard.estadoVuelo === null ||
                    filtrosDashboard.estadoVuelo === "COMPLETADO"
                        ? "#2196F3"
                        : "rgba(33,150,243,0.30)",

                    filtrosDashboard.estadoVuelo === null ||
                    filtrosDashboard.estadoVuelo === "CANCELADO"
                        ? "#FF9800"
                        : "rgba(255,152,0,0.30)",

                    filtrosDashboard.estadoVuelo === null ||
                    filtrosDashboard.estadoVuelo === "DESVIADO"
                        ? "#F44336"
                        : "rgba(244,67,54,0.30)"

                ],

                borderColor:"#ffffff",

                borderWidth:2,

                hoverOffset:18

            }]

        },

        options:{

            responsive:true,

            maintainAspectRatio:false,

            plugins:{

                legend:{

                    position:"right",

                    labels:{

                        usePointStyle:true,

                        padding:20

                    }

                },

                tooltip:{

                    callbacks:{

                        label:function(context){

                            const total = context.dataset.data
                                .reduce((a,b)=>a+b,0);

                            const valor = context.raw;

                            const porcentaje = (
                                valor / total * 100
                            ).toFixed(2);

                            return `${context.label}: ${valor.toLocaleString()} (${porcentaje}%)`;

                        }

                    }

                }

            },

            animation:{

                duration:700

            },

            onClick(event, elementos){

                if(elementos.length === 0){

                    return;

                }

                const indice = elementos[0].index;

                const estados = {

                    0:"COMPLETADO",

                    1:"CANCELADO",

                    2:"DESVIADO"

                };

                const estadoSeleccionado = estados[indice];

                if(filtrosDashboard.estadoVuelo === estadoSeleccionado){

                    filtrosDashboard.estadoVuelo = null;

                }else{

                    filtrosDashboard.estadoVuelo = estadoSeleccionado;

                }

                console.log("Filtro Estado Vuelo:",
                    filtrosDashboard.estadoVuelo);

                actualizarDashboard();

            }

        }

    });

}

function crearGraficaVuelosMes(datos){

    const ctx = document
        .getElementById("graficaVuelosMes")
        .getContext("2d");

    if(graficaVuelosMes){

        graficaVuelosMes.destroy();

    }

    const meses=[

        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre"

    ];

    const anios=[...new Set(datos.map(x=>x.anio))];

    const datasets=anios.map(anio=>{

        const valores=new Array(12).fill(0);

        datos
        .filter(x=>x.anio==anio)
        .forEach(x=>{

            valores[x.mes-1]=Number(x.total);

        });

        return{

            label:anio,

            data:valores,

            tension:.35,

            fill:false,

            borderWidth:3,

            pointRadius:5,

            pointHoverRadius:8,

            pointHitRadius:15

        };

    });

    graficaVuelosMes=new Chart(ctx,{

        type:"line",

        data:{

            labels:meses,

            datasets:datasets

        },

        options:{

            responsive:true,

            maintainAspectRatio:false,

            interaction:{

                mode:"nearest",

                intersect:true

            },

            plugins:{

                legend:{

                    position:"bottom",

                    labels:{

                        usePointStyle:true,

                        padding:20

                    }

                },

                tooltip:{

                    callbacks:{

                        label:function(context){

                            return `${context.dataset.label}: ${Number(context.raw).toLocaleString()} vuelos`;

                        }

                    }

                }

            },

            scales:{

                y:{

                    beginAtZero:true

                }

            },

            animation:{

                duration:700

            },

            onClick(event,elementos){

                if(elementos.length===0){

                    return;

                }

                const punto=elementos[0];

                const mes=punto.index+1;

                if(filtrosDashboard.mesSeleccionado===mes){

                    filtrosDashboard.mesSeleccionado=null;

                }else{

                    filtrosDashboard.mesSeleccionado=mes;

                }

                console.log(
                    "Mes seleccionado:",
                    filtrosDashboard.mesSeleccionado
                );

                actualizarDashboard();

            }

        }

    });

}

function crearMapaEstados(){

    if(mapaEstados){

        return;

    }

    mapaEstados = L.map("mapaEstados",{

        center:[39.8283,-98.5795],

        zoom:4,

        zoomControl:true,

        scrollWheelZoom:true,

        doubleClickZoom:true,

        dragging:true

    });

    L.tileLayer(

        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",

        {

            maxZoom:18,

            attribution:"© OpenStreetMap contributors"

        }

    ).addTo(mapaEstados);

}

function actualizarMapaEstados(datos){

    // Eliminar marcadores anteriores
    marcadoresEstados.forEach(m=>{

        mapaEstados.removeLayer(m);

    });

    marcadoresEstados=[];

    datos.forEach(estado=>{

        const codigo = estado.estado.trim();

        const punto = coordenadasEstados[codigo];

        if(!punto) return;

        const seleccionado =
            filtrosDashboard.estado === codigo;

        const radio = seleccionado
    ? Math.max(
        8,
        Number(estado.porcentaje_retrasados) * 0.35
      )
    : Math.max(
        4,
        Number(estado.porcentaje_retrasados) * 0.25
      );

        const marcador = L.circleMarker(

            [punto.lat,punto.lng],

            {

                radius:radio,

                color: seleccionado
                    ? "#dc3545"
                    : "#0d6efd",

                fillColor: seleccionado
                    ? "#dc3545"
                    : "#0d6efd",

                fillOpacity: seleccionado
                    ? .90
                    : .60,

                weight: seleccionado
                    ? 3
                    : 1

            }

        ).addTo(mapaEstados);

        marcador.bindPopup(`

            <b>${codigo}</b><br>

            <b>% Retrasados:</b>
            ${estado.porcentaje_retrasados}%<br>

            <b>Vuelos retrasados:</b>
            ${Number(estado.vuelos_retrasados).toLocaleString()}<br>

            <b>Total vuelos:</b>
            ${Number(estado.total_vuelos).toLocaleString()}

        `);

        marcador.on("click",()=>{

            if(filtrosDashboard.estado===codigo){

                filtrosDashboard.estado=null;

            }else{

                filtrosDashboard.estado=codigo;

            }

            actualizarDashboard();

        });

        marcadoresEstados.push(marcador);

    });

}