//--------------------------------------------------
// GRÁFICAS
//--------------------------------------------------

let graficaPastel = null;

let graficaAeropuertos = null;

let graficaEstados = null;

Chart.register(ChartDataLabels);

//--------------------------------------------------
// PASTEL
//--------------------------------------------------

//--------------------------------------------------
// PASTEL
//--------------------------------------------------

function crearGraficaPastel(datos){

    const canvas = document.getElementById(

        "graficaPastel"

    );

    if(!canvas){

        return;

    }

    const ctx = canvas.getContext("2d");

    if(graficaPastel){

        graficaPastel.destroy();

    }

    //--------------------------------------------------
    // Colores por motivo
    //--------------------------------------------------

    const coloresMotivo={

        "CARRIER":"#1E88E5",

        "WEATHER":"#FFA726",

        "NAS":"#43A047",

        "SECURITY":"#E53935",

        "LATE AIRCRAFT":"#8E24AA"

    };

    graficaPastel = new Chart(ctx,{

        type:"pie",

        data:{

            labels:datos.map(

                x=>x.motivo

            ),

            datasets:[{

                data:datos.map(

                    x=>Number(

                        x.total_cancelaciones

                    )

                ),

                backgroundColor:datos.map(

                    x=>

                        coloresMotivo[

                            x.motivo

                                .trim()

                                .toUpperCase()

                        ] || "#90A4AE"

                ),

                borderColor:"#FFFFFF",

                borderWidth:2

            }]

        },

        options:{

            responsive:true,

            maintainAspectRatio:false,

            plugins:{

                legend:{

                    position:"right"

                },

                datalabels:{

                    color:"#555",

                    anchor:"end",

                    align:"end",

                    offset:8,

                    font:{

                        weight:"bold",

                        size:11

                    },

                    formatter:(value,context)=>{

                        const total = context.dataset.data.reduce(

                            (a,b)=>a+b,

                            0

                        );

                        const porcentaje=(

                            value

                            *

                            100

                            /

                            total

                        ).toFixed(2);

                        return `${value} (${porcentaje}%)`;

                    }

                },

                tooltip:{

                    callbacks:{

                        label(context){

                            const total = context.dataset.data.reduce(

                                (a,b)=>a+b,

                                0

                            );

                            const porcentaje=(

                                context.raw

                                *

                                100

                                /

                                total

                            ).toFixed(2);

                            return `${context.label}: ${context.raw} (${porcentaje}%)`;

                        }

                    }

                }

            },

            onClick:async(evento,elementos)=>{

                if(!elementos.length){

                    return;

                }

                const indice = elementos[0].index;

                const motivo = datos[indice].motivo;

                //--------------------------------------------------
                // Activar / Desactivar filtro
                //--------------------------------------------------

                if(filtros.motivo===motivo){

                    filtros.motivo=null;

                }

                else{

                    filtros.motivo=motivo;

                }

                await actualizarDashboard();

            }

        },

        plugins:[

            ChartDataLabels

        ]

    });

}

//--------------------------------------------------
// BARRAS VERTICALES
//--------------------------------------------------

function crearGraficaAeropuertos(datos){

    const canvas = document.getElementById(

        "graficaAeropuertos"

    );

    if(!canvas){

        return;

    }

    const ctx = canvas.getContext("2d");

    if(graficaAeropuertos){

        graficaAeropuertos.destroy();

    }

    graficaAeropuertos = new Chart(ctx,{

        type:"bar",

        data:{

            labels:datos.map(

                x=>x.codigo_aeropuerto

            ),

            datasets:[{

                label:"Cancelaciones",

                data:datos.map(

                    x=>Number(

                        x.total_cancelaciones

                    )

                ),

                backgroundColor:"#1E88E5",

                borderRadius:8,

                borderWidth:0

            }]

        },

        options:{

            responsive:true,

            maintainAspectRatio:false,

            plugins:{

                legend:{

                    display:false

                }

            },

            scales:{

                y:{

                    beginAtZero:true,

                    title:{

                        display:true,

                        text:"Cancelaciones"

                    }

                },

                x:{

                    title:{

                        display:true,

                        text:"Aeropuerto"

                    }

                }

            },

            onClick:async(evento,elementos)=>{

                if(!elementos.length){

                    return;

                }

                const indice = elementos[0].index;

                const aeropuerto = datos[indice].sk_aeropuerto;

                //--------------------------------------------------
                // Quitar filtro si vuelve a dar clic
                //--------------------------------------------------

                if(filtros.aeropuerto === aeropuerto){

                    delete filtros.aeropuerto;

                    document.getElementById(

                        "cmbAeropuerto"

                    ).value = "";

                }

                else{

                    filtros.aeropuerto = aeropuerto;

                    document.getElementById(

                        "cmbAeropuerto"

                    ).value = aeropuerto;

                }

                await actualizarDashboard();

            }

        }

    });

}

//--------------------------------------------------
// BARRAS HORIZONTALES
//--------------------------------------------------

//--------------------------------------------------
// BARRAS HORIZONTALES
//--------------------------------------------------

function crearGraficaEstados(datos){

    const canvas = document.getElementById(

        "graficaEstados"

    );

    if(!canvas){

        return;

    }

    const ctx = canvas.getContext("2d");

    if(graficaEstados){

        graficaEstados.destroy();

    }

    graficaEstados = new Chart(ctx,{

        type:"bar",

        data:{

            labels:datos.map(

                x=>x.estado

            ),

            datasets:[{

                label:"Cancelaciones",

                data:datos.map(

                    x=>Number(

                        x.total_cancelaciones

                    )

                ),

                backgroundColor:"#42A5F5",

                borderRadius:8,

                borderWidth:0

            }]

        },

        options:{

            responsive:true,

            maintainAspectRatio:false,

            indexAxis:"y",

            plugins:{

                legend:{

                    display:false

                }

            },

            scales:{

                x:{

                    beginAtZero:true,

                    title:{

                        display:true,

                        text:"Cancelaciones"

                    }

                },

                y:{

                    title:{

                        display:true,

                        text:"Estado"

                    }

                }

            },

            onClick:async(evento,elementos)=>{

                if(!elementos.length){

                    return;

                }

                const indice = elementos[0].index;

                const estado = datos[indice].estado;

                //--------------------------------------------------
                // Si vuelve a dar clic, quitar filtro
                //--------------------------------------------------

                if(filtros.estado === estado){

                    delete filtros.estado;

                }

                else{

                    filtros.estado = estado;

                }

                await actualizarDashboard();

            }

        }

    });

}