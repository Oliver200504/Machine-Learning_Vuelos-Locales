//=====================================
// VARIABLES
//=====================================

const filtrosDashboard={

    anioInicio:null,

    anioFin:null,

    mesInicio:null,

    mesFin:null,

    aerolinea:null,

    franja:null,

    motivo:null

};

const nombresMeses=[

    "",

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

//=====================================
// INICIO
//=====================================

window.addEventListener(

    "DOMContentLoaded",

    async()=>{

        await iniciarDashboard();

    }

);

async function iniciarDashboard(){

    await cargarFiltros();

    registrarEventos();

    await actualizarDashboard();

}

//=====================================
// EVENTOS
//=====================================

function registrarEventos(){

    document

    .getElementById("cmbAerolinea")

    .addEventListener("change",()=>{

        filtrosDashboard.aerolinea=

            document

            .getElementById("cmbAerolinea")

            .value;

        actualizarDashboard();

    });

    document

    .getElementById("cmbFranja")

    .addEventListener("change",()=>{

        filtrosDashboard.franja=

            document

            .getElementById("cmbFranja")

            .value;

        actualizarDashboard();

    });

    document

    .getElementById("btnLimpiar")

    .addEventListener(

        "click",

        limpiarFiltros

    );

}

//=====================================
// FILTROS
//=====================================

async function cargarFiltros(){

    try{

        const respuesta=await fetch(

            "/api/cancelaciones/filtros"

        );

        const datos=await respuesta.json();

        crearSliderAnios(datos.anios);

        crearSliderMeses(datos.meses);

        llenarAerolineas(

            datos.aerolineas

        );

        llenarFranjas(

            datos.franjas

        );

    }

    catch(error){

        console.error(error);

    }

}

//=====================================
// AÑOS
//=====================================

function crearSliderAnios(anios){

    const valores = anios.map(a=>Number(a.anio));

    filtrosDashboard.anioInicio = valores[0];

    filtrosDashboard.anioFin = valores[valores.length-1];

    const slider = document.getElementById(

        "sliderAnios"

    );

    noUiSlider.create(slider,{

        start:[

            filtrosDashboard.anioInicio,

            filtrosDashboard.anioFin

        ],

        connect:true,

        step:1,

        range:{

            min:filtrosDashboard.anioInicio,

            max:filtrosDashboard.anioFin

        }

    });

    actualizarTextoAnios();

    slider.noUiSlider.on(

        "update",

        values=>{

            filtrosDashboard.anioInicio=

                parseInt(values[0]);

            filtrosDashboard.anioFin=

                parseInt(values[1]);

            actualizarTextoAnios();

        }

    );

    slider.noUiSlider.on(

        "change",

        actualizarDashboard

    );

}

function actualizarTextoAnios(){

    document.getElementById(

        "lblAnioInicio"

    ).textContent=filtrosDashboard.anioInicio;

    document.getElementById(

        "lblAnioFin"

    ).textContent=filtrosDashboard.anioFin;

}

//=====================================
// MESES
//=====================================

function crearSliderMeses(){

    filtrosDashboard.mesInicio=1;

    filtrosDashboard.mesFin=12;

    const slider=document.getElementById(

        "sliderMeses"

    );

    noUiSlider.create(slider,{

        start:[1,12],

        connect:true,

        step:1,

        range:{

            min:1,

            max:12

        }

    });

    actualizarTextoMeses();

    slider.noUiSlider.on(

        "update",

        values=>{

            filtrosDashboard.mesInicio=

                parseInt(values[0]);

            filtrosDashboard.mesFin=

                parseInt(values[1]);

            actualizarTextoMeses();

        }

    );

    slider.noUiSlider.on(

        "change",

        actualizarDashboard

    );

}

function actualizarTextoMeses(){

    document.getElementById(

        "lblMesInicio"

    ).textContent=

        nombresMeses[

            filtrosDashboard.mesInicio

        ];

    document.getElementById(

        "lblMesFin"

    ).textContent=

        nombresMeses[

            filtrosDashboard.mesFin

        ];

}

//=====================================
// AEROLÍNEAS
//=====================================

function llenarAerolineas(aerolineas){

    const combo=document.getElementById(

        "cmbAerolinea"

    );

    combo.innerHTML=`

        <option value="">

            Todas las aerolíneas

        </option>

    `;

    aerolineas.forEach(a=>{

        combo.innerHTML+=`

            <option value="${a.sk_aerolinea}">

                ${a.nombre_aerolinea}

            </option>

        `;

    });

}

//=====================================
// FRANJAS
//=====================================

function llenarFranjas(franjas){

    const combo=document.getElementById(

        "cmbFranja"

    );

    combo.innerHTML=`

        <option value="">

            Todas las franjas

        </option>

    `;

    franjas.forEach(f=>{

        combo.innerHTML+=`

            <option value="${f.franja_horaria}">

                ${f.franja_horaria}

            </option>

        `;

    });

}

//=====================================
// OBTENER FILTROS
//=====================================

function obtenerFiltrosSeleccionados(){

    const filtros={};

    Object.keys(filtrosDashboard)

    .forEach(clave=>{

        const valor=filtrosDashboard[clave];

        if(

            valor!==null &&

            valor!=="" &&

            valor!==undefined

        ){

            filtros[clave]=valor;

        }

    });

    return filtros;

}

//=====================================
// LIMPIAR
//=====================================

function limpiarFiltros(){

    document

    .getElementById("sliderAnios")

    .noUiSlider.set([

        document

        .getElementById("sliderAnios")

        .noUiSlider.options.range.min,

        document

        .getElementById("sliderAnios")

        .noUiSlider.options.range.max

    ]);

    document

    .getElementById("sliderMeses")

    .noUiSlider.set([1,12]);

    filtrosDashboard.aerolinea="";

    filtrosDashboard.franja="";

    filtrosDashboard.motivo=null;

    document.getElementById(

        "cmbAerolinea"

    ).value="";

    document.getElementById(

        "cmbFranja"

    ).value="";

    actualizarDashboard();

}

//=====================================
// ACTUALIZAR DASHBOARD
//=====================================

async function actualizarDashboard(){

    await Promise.all([

        cargarKPIs(),

        cargarGraficaPastel(),

        cargarBubbleChart(),

        cargarGraficaLinea(),

    ]);

}

//=====================================
// KPIs
//=====================================

async function cargarKPIs(){

    try{

        const filtros = obtenerFiltrosSeleccionados();

        const parametros = new URLSearchParams(

            filtros

        );

        const respuesta = await fetch(

            `/api/cancelaciones/kpis?${parametros}`

        );

        const datos = await respuesta.json();

        document.getElementById(

            "kpiAerolinea"

        ).textContent =

            datos.aerolinea_cancelaciones ?? "-";

        document.getElementById(

            "kpiPorcentaje"

        ).textContent =

            Number(

                datos.porcentaje_cancelados

            ).toFixed(2)+" %";

        document.getElementById(

            "kpiCancelados"

        ).textContent =

            Number(

                datos.vuelos_cancelados

            ).toLocaleString();

        document.getElementById(

            "kpiMotivo"

        ).textContent =

            datos.motivo_principal ?? "-";

    }

    catch(error){

        console.error(error);

    }

}

//=====================================
// PASTEL
//=====================================

async function cargarGraficaPastel(){

    try{

        const filtros = obtenerFiltrosSeleccionados();

        const parametros = new URLSearchParams(

            filtros

        );

        const respuesta = await fetch(

            `/api/cancelaciones/pastel?${parametros}`

        );

        const datos = await respuesta.json();

        crearGraficaPastel(

            datos

        );

    }

    catch(error){

        console.error(error);

    }

}

//=====================================
// BUBBLE
//=====================================

async function cargarBubbleChart(){

    try{

        const filtros = obtenerFiltrosSeleccionados();

        const parametros = new URLSearchParams(

            filtros

        );

        const respuesta = await fetch(

            `/api/cancelaciones/bubble?${parametros}`

        );

        const datos = await respuesta.json();

        crearBubbleChart(

            datos

        );

    }

    catch(error){

        console.error(error);

    }

}

//=====================================
// LÍNEA
//=====================================

async function cargarGraficaLinea(){

    try{

        const filtros = obtenerFiltrosSeleccionados();

        const parametros = new URLSearchParams(

            filtros

        );

        const respuesta = await fetch(

            `/api/cancelaciones/linea?${parametros}`

        );

        const datos = await respuesta.json();

        crearGraficaLinea(

            datos

        );

    }

    catch(error){

        console.error(error);

    }

}

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
    // Histórico y predicción
    //--------------------------------------------------

    const historico = datos.historico || [];

    const prediccion = datos.prediccion || [];

    //--------------------------------------------------
    // Etiquetas
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
    // Serie histórica
    //--------------------------------------------------

    const serieHistorica = historico.map(x=>

        Number(

            x.vuelos_cancelados

        )

    );

    //--------------------------------------------------
    // Serie de predicción
    //--------------------------------------------------

    const seriePrediccion = [];

    for(

        let i=0;

        i<historico.length-1;

        i++

    ){

        seriePrediccion.push(null);

    }

    if(historico.length>0){

        seriePrediccion.push(

            Number(

                historico[

                    historico.length-1

                ].vuelos_cancelados

            )

        );

    }

    prediccion.forEach(x=>{

        seriePrediccion.push(

            Number(

                x.vuelos_cancelados

            )

        );

    });

    //--------------------------------------------------
    // Completar histórico
    //--------------------------------------------------

    while(

        serieHistorica.length<labels.length

    ){

        serieHistorica.push(null);

    }

    //--------------------------------------------------
    // Intervalo de confianza
    //--------------------------------------------------

    const superior = new Array(

        historico.length

    ).fill(null);

    const inferior = new Array(

        historico.length

    ).fill(null);

    prediccion.forEach(x=>{

        superior.push(

            Number(

                x.vuelos_cancelados

            )*1.10

        );

        inferior.push(

            Number(

                x.vuelos_cancelados

            )*0.90

        );

    });

    //--------------------------------------------------
    // Gráfica
    //--------------------------------------------------

    graficaLinea = new Chart(ctx,{

        type:"line",

        data:{

            labels,

            datasets:[

                {

                    label:"Histórico",

                    data:serieHistorica,

                    borderColor:"#0D6EFD",

                    backgroundColor:"#0D6EFD",

                    borderWidth:3,

                    tension:.35,

                    pointRadius:4,

                    pointHoverRadius:6,

                    fill:false

                },

                {

                    label:"Predicción",

                    data:seriePrediccion,

                    borderColor:"#6C757D",

                    backgroundColor:"#6C757D",

                    borderDash:[8,5],

                    borderWidth:3,

                    tension:.35,

                    pointRadius:3,

                    fill:false

                },

                {

                    data:superior,

                    borderWidth:0,

                    pointRadius:0,

                    fill:false

                },

                {

                    data:inferior,

                    borderWidth:0,

                    pointRadius:0,

                    backgroundColor:

                        "rgba(108,117,125,.18)",

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

                },

                tooltip:{

                    callbacks:{

                        label(context){

                            return (

                                context.dataset.label+

                                ": "+

                                Number(

                                    context.raw

                                ).toLocaleString()

                            );

                        }

                    }

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

                        text:"Vuelos cancelados"

                    }

                }

            }

        }

    });

}

//=====================================
// TABLA
//=====================================

async function cargarTabla(){

    try{

        const filtros = obtenerFiltrosSeleccionados();

        const parametros = new URLSearchParams(

            filtros

        );

        const respuesta = await fetch(

            `/api/cancelaciones/bubble?${parametros}`

        );

        const datos = await respuesta.json();

        llenarTabla(

            datos

        );

    }

    catch(error){

        console.error(error);

    }

}

