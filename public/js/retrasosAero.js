//--------------------------------------------------
// API
//--------------------------------------------------

const API = "/api/retrasos-aero";

//--------------------------------------------------
// FILTROS
//--------------------------------------------------

const filtros = {

    anioInicio:null,

    anioFin:null,

    mesInicio:null,

    mesFin:null,

    aeropuerto:null,

    franja:null

};

//--------------------------------------------------
// SLIDERS
//--------------------------------------------------

let sliderAnios;

let sliderMeses;

//--------------------------------------------------
// MODELO TF
//--------------------------------------------------

let modeloTF = null;

//--------------------------------------------------
// INICIO
//--------------------------------------------------

document.addEventListener(

    "DOMContentLoaded",

    async()=>{

        await iniciarDashboard();

    }

);

//--------------------------------------------------
// DASHBOARD
//--------------------------------------------------

async function iniciarDashboard(){

    await cargarFiltros();

    crearSliders();

    registrarEventos();

    await actualizarDashboard();

}

//--------------------------------------------------
// CARGAR FILTROS
//--------------------------------------------------

async function cargarFiltros(){

    const respuesta = await fetch(

        `${API}/filtros`

    );

    const datos = await respuesta.json();

    //--------------------------------------------------
    // Aeropuertos
    //--------------------------------------------------

    const cmbAeropuerto = document.getElementById(

        "cmbAeropuerto"

    );

    datos.aeropuertos.forEach(a=>{

        cmbAeropuerto.innerHTML += `

            <option value="${a.sk_aeropuerto}">

                ${a.codigo_aeropuerto}

            </option>

        `;

    });

    //--------------------------------------------------
    // Franjas
    //--------------------------------------------------

    const cmbFranja = document.getElementById(

        "cmbFranja"

    );

    datos.franjas.forEach(f=>{

        cmbFranja.innerHTML += `

            <option value="${f}">

                ${f}

            </option>

        `;

    });

    //--------------------------------------------------
    // Guardar años
    //--------------------------------------------------

    const anios = datos.anios.map(

        x=>Number(x.anio)

    );

    window.minAnio = Math.min(

        ...anios

    );

    window.maxAnio = Math.max(

        ...anios

    );

}

//--------------------------------------------------
// CREAR SLIDERS
//--------------------------------------------------

function crearSliders(){

    //--------------------------------------------------
    // Años
    //--------------------------------------------------

    sliderAnios = document.getElementById(

        "sliderAnios"

    );

    noUiSlider.create(

        sliderAnios,

        {

            start:[

                minAnio,

                maxAnio

            ],

            connect:true,

            step:1,

            range:{

                min:minAnio,

                max:maxAnio

            }

        }

    );

    //--------------------------------------------------
    // Meses
    //--------------------------------------------------

    sliderMeses = document.getElementById(

        "sliderMeses"

    );

    noUiSlider.create(

        sliderMeses,

        {

            start:[

                1,

                12

            ],

            connect:true,

            step:1,

            range:{

                min:1,

                max:12

            }

        }

    );

}

//--------------------------------------------------
// EVENTOS
//--------------------------------------------------

function registrarEventos(){

    //--------------------------------------------------
    // Aeropuerto
    //--------------------------------------------------

    document.getElementById(

        "cmbAeropuerto"

    ).addEventListener(

        "change",

        async e=>{

            filtros.aeropuerto =

                e.target.value || null;

            await actualizarDashboard();

        }

    );

    //--------------------------------------------------
    // Franja
    //--------------------------------------------------

    document.getElementById(

        "cmbFranja"

    ).addEventListener(

        "change",

        async e=>{

            filtros.franja =

                e.target.value || null;

            await actualizarDashboard();

        }

    );

    //--------------------------------------------------
    // Slider años
    //--------------------------------------------------

    sliderAnios.noUiSlider.on(

        "change",

        async valores=>{

            filtros.anioInicio =

                Number(valores[0]);

            filtros.anioFin =

                Number(valores[1]);

            await actualizarDashboard();

        }

    );

    //--------------------------------------------------
    // Slider meses
    //--------------------------------------------------

    sliderMeses.noUiSlider.on(

        "change",

        async valores=>{

            filtros.mesInicio =

                Number(valores[0]);

            filtros.mesFin =

                Number(valores[1]);

            await actualizarDashboard();

        }

    );

    //--------------------------------------------------
    // Limpiar
    //--------------------------------------------------

    document.getElementById(

        "btnLimpiar"

    ).addEventListener(

        "click",

        limpiarFiltros

    );

}

//--------------------------------------------------
// PARÁMETROS
//--------------------------------------------------

function obtenerParametros(){

    const params = new URLSearchParams();

    if(filtros.anioInicio){

        params.append(

            "anioInicio",

            filtros.anioInicio

        );

    }

    if(filtros.anioFin){

        params.append(

            "anioFin",

            filtros.anioFin

        );

    }

    if(filtros.mesInicio){

        params.append(

            "mesInicio",

            filtros.mesInicio

        );

    }

    if(filtros.mesFin){

        params.append(

            "mesFin",

            filtros.mesFin

        );

    }

    if(filtros.aeropuerto){

        params.append(

            "aeropuerto",

            filtros.aeropuerto

        );

    }

    if(filtros.franja){

        params.append(

            "franja",

            filtros.franja

        );

    }

    return params;

}

//--------------------------------------------------
// ACTUALIZAR DASHBOARD
//--------------------------------------------------

async function actualizarDashboard(actualizarLinea = true){

    const tareas = [

        cargarKPIs(),

        cargarPuntualidad(),

        cargarBurbujas()

    ];

    if(actualizarLinea){

        tareas.push(

            cargarLinea()

        );

    }

    await Promise.all(tareas);

}

//--------------------------------------------------
// LIMPIAR
//--------------------------------------------------

async function limpiarFiltros(){

    document.getElementById(

        "cmbAeropuerto"

    ).value = "";

    document.getElementById(

        "cmbFranja"

    ).value = "";

    filtros.anioInicio = null;

    filtros.anioFin = null;

    filtros.mesInicio = null;

    filtros.mesFin = null;

    filtros.aeropuerto = null;

    filtros.franja = null;

    sliderAnios.noUiSlider.set([

        minAnio,

        maxAnio

    ]);

    sliderMeses.noUiSlider.set([

        1,

        12

    ]);

    await actualizarDashboard();

}

//--------------------------------------------------
// KPIs
//--------------------------------------------------

async function cargarKPIs(){

    const respuesta = await fetch(

        `${API}/kpis?${obtenerParametros()}`

    );

    const datos = await respuesta.json();

    //--------------------------------------------------
    // Aeropuerto con más retrasos
    //--------------------------------------------------

    document.getElementById(

        "kpiAeropuerto"

    ).textContent =

        datos.aeropuerto_mas_retrasos || "-";

    //--------------------------------------------------
    // Puntualidad
    //--------------------------------------------------

    document.getElementById(

        "kpiPuntualidad"

    ).textContent =

        Number(

            datos.puntualidad || 0

        ).toFixed(1)

        + "%";

    //--------------------------------------------------
    // Motivo principal
    //--------------------------------------------------

    document.getElementById(

        "kpiMotivo"

    ).textContent =

        datos.motivo_principal || "-";

    //--------------------------------------------------
    // Promedio de retraso
    //--------------------------------------------------

    document.getElementById(

        "kpiPromedio"

    ).textContent =

        Number(

            datos.promedio_retraso || 0

        ).toFixed(1)

        + " min";

    //--------------------------------------------------
    // Vuelos retrasados
    //--------------------------------------------------

    document.getElementById(

        "kpiRetrasos"

    ).textContent =

        Number(

            datos.vuelos_retrasados || 0

        ).toLocaleString();

}

//--------------------------------------------------
// PUNTUALIDAD
//--------------------------------------------------

async function cargarPuntualidad(){

    const respuesta = await fetch(

        `${API}/puntualidad?${obtenerParametros()}`

    );

    const datos = await respuesta.json();

    crearGraficaPuntualidad(

        datos

    );

}

//--------------------------------------------------
// LÍNEA
//--------------------------------------------------

async function cargarBurbujas(){

    const respuesta = await fetch(

        `${API}/burbujas?${obtenerParametros()}`

    );

    const datos = await respuesta.json();

    crearGraficaBurbujas(datos);

}

//--------------------------------------------------
// LÍNEA + PREDICCIÓN
//--------------------------------------------------

//--------------------------------------------------
// LÍNEA
//--------------------------------------------------

async function cargarLinea(){

    const respuesta = await fetch(

        `${API}/prediccion?${obtenerParametros()}`

    );

    const datos = await respuesta.json();

    crearGraficaLinea(

        datos.historico,

        datos.prediccion

    );

}