/*
==================================================
DASHBOARD DE VUELOS
==================================================
*/

//==============================
// VARIABLES GLOBALES
//==============================

const filtrosDashboard={

    anioInicio:null,

    anioFin:null,

    mesInicio:null,

    mesFin:null,

    aerolinea:null,

    franja:null,

    estado:null,

    estadoVuelo:null,

    aeropuerto:null,

    mesSeleccionado:null

};


const nombresMeses = [

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


//==============================
// INICIO
//==============================

window.addEventListener("DOMContentLoaded", async () => {

    await iniciarDashboard();

});

async function iniciarDashboard(){

    await cargarFiltros();

    registrarEventos();

    crearMapaEstados();

    await actualizarDashboard();

}


//==============================
// EVENTOS
//==============================

function registrarEventos(){

    // Aerolínea
    document.getElementById("cmbAerolinea")
    .addEventListener("change",()=>{

        filtrosDashboard.aerolinea =
            document.getElementById("cmbAerolinea").value;

        actualizarDashboard();

    });

    // Franja Horaria
    document.getElementById("cmbFranja")
    .addEventListener("change",()=>{

        filtrosDashboard.franja =
            document.getElementById("cmbFranja").value;

        actualizarDashboard();

    });

    // Limpiar
    document.getElementById("btnLimpiar")
    .addEventListener("click",limpiarFiltros);

}

//==============================
// CARGAR FILTROS
//==============================

async function cargarFiltros(){

    try{

        const respuesta = await fetch("/api/dashboard/filtros");

        const datos = await respuesta.json();

        crearSliderAnios(datos.anios);

        crearSliderMeses(datos.meses);

        llenarAerolineas(datos.aerolineas);

        llenarFranjas(datos.franjas);

    }

    catch(error){

        console.error(error);

    }

}

//==============================
// AÑOS
//==============================

function crearSliderAnios(anios){

    const valores = anios.map(a => Number(a.anio));

    filtrosDashboard.anioInicio = valores[0];
    filtrosDashboard.anioFin = valores[valores.length - 1];

    const slider = document.getElementById("sliderAnios");

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

    slider.noUiSlider.on("update",(values)=>{

        filtrosDashboard.anioInicio = parseInt(values[0]);

        filtrosDashboard.anioFin = parseInt(values[1]);

        actualizarTextoAnios();

    });

    slider.noUiSlider.on("change",()=>{

        actualizarDashboard();

    });

}

function actualizarTextoAnios(){

    document.getElementById("lblAnioInicio").textContent =
        filtrosDashboard.anioInicio;

    document.getElementById("lblAnioFin").textContent =
        filtrosDashboard.anioFin;

}

//==============================
// MESES
//==============================

function crearSliderMeses(meses){

    filtrosDashboard.mesInicio = 1;

    filtrosDashboard.mesFin = 12;

    const slider = document.getElementById("sliderMeses");

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

    slider.noUiSlider.on("update",(values)=>{

        filtrosDashboard.mesInicio = parseInt(values[0]);

        filtrosDashboard.mesFin = parseInt(values[1]);

        actualizarTextoMeses();

    });

    slider.noUiSlider.on("change",()=>{

        actualizarDashboard();

    });

}

function actualizarTextoMeses(){

    document.getElementById("lblMesInicio").textContent =
        nombresMeses[filtrosDashboard.mesInicio];

    document.getElementById("lblMesFin").textContent =
        nombresMeses[filtrosDashboard.mesFin];

}

//==============================
// AEROLÍNEAS
//==============================

function llenarAerolineas(aerolineas){

    const combo = document.getElementById("cmbAerolinea");

    combo.innerHTML = `
        <option value="">Todas las aerolíneas</option>
    `;

    aerolineas.forEach(a=>{

        combo.innerHTML += `
            <option value="${a.sk_aerolinea}">
                ${a.nombre_aerolinea}
            </option>
        `;

    });

}


//==============================
// FRANJAS
//==============================

function llenarFranjas(franjas){

    const combo = document.getElementById("cmbFranja");

    combo.innerHTML = `
        <option value="">Todas las franjas</option>
    `;

    franjas.forEach(f=>{

        combo.innerHTML += `
            <option value="${f.franja_horaria}">
                ${f.franja_horaria}
            </option>
        `;

    });

}


//==============================
// OBTENER FILTROS
//==============================

function obtenerFiltrosSeleccionados(){

    const filtros = {};

    Object.keys(filtrosDashboard).forEach(clave=>{

        const valor = filtrosDashboard[clave];

        if(
            valor !== null &&
            valor !== "" &&
            valor !== undefined
        ){

            filtros[clave] = valor;

        }

    });

    return filtros;

}

//==============================
// ACTUALIZAR DASHBOARD
//==============================

async function actualizarDashboard(){

    await cargarKPIs();

    await cargarGraficaEstado();

    await cargarGraficaVuelosMes();

    await cargarMapaEstados();

}

//==============================
// CARGAR KPIs
//==============================

async function cargarKPIs(){

    try{

        const filtros = obtenerFiltrosSeleccionados();

        const parametros = new URLSearchParams(filtros);

        const respuesta = await fetch(
            `/api/dashboard/general?${parametros}`
        );

        const datos = await respuesta.json();

        mostrarKPIs(datos);

    }catch(error){

        console.error(error);

    }

}


//==============================
// MOSTRAR KPIs
//==============================

function mostrarKPIs(datos){

    document.getElementById("kpiTotal").textContent =
        Number(datos.total_vuelos).toLocaleString();

    document.getElementById("kpiMillas").textContent =
        Number(datos.millas_recorridas).toLocaleString();

    document.getElementById("kpiPuntualidad").textContent =
        datos.puntualidad + " %";

    document.getElementById("kpiDesviados").textContent =
        Number(datos.vuelos_desviados).toLocaleString();

    document.getElementById("kpiCancelados").textContent =
        datos.porcentaje_cancelados + " %";

    document.getElementById("kpiRetrasados").textContent =
        datos.porcentaje_retrasados + " %";

}

//==============================
// LIMPIAR FILTROS
//==============================

function limpiarFiltros(){

    // Reiniciar sliders
    const sliderAnios = document.getElementById("sliderAnios");
    const sliderMeses = document.getElementById("sliderMeses");

    sliderAnios.noUiSlider.set([
        sliderAnios.noUiSlider.options.range.min,
        sliderAnios.noUiSlider.options.range.max
    ]);

    sliderMeses.noUiSlider.set([1,12]);

    // Reiniciar objeto de filtros
    filtrosDashboard.aerolinea = "";
    filtrosDashboard.franja = "";

    filtrosDashboard.estado = null;
    filtrosDashboard.estadoVuelo = null;
    filtrosDashboard.aeropuerto = null;
    filtrosDashboard.mesSeleccionado = null;

    // Reiniciar combos
    document.getElementById("cmbAerolinea").value = "";
    document.getElementById("cmbFranja").value = "";

    actualizarDashboard();

}

/* 

*/
async function cargarGraficaEstado(){

    try{

        const filtros = obtenerFiltrosSeleccionados();

        const parametros = new URLSearchParams(filtros);

        const respuesta = await fetch(
            `/api/dashboard/estado-vuelo?${parametros}`
        );

        const datos = await respuesta.json();

        crearGraficaEstado(datos);

    }
    catch(error){

        console.error(error);

    }

}

/* 

*/

async function cargarGraficaVuelosMes(){

    try{

        const filtros = obtenerFiltrosSeleccionados();

        const parametros = new URLSearchParams(filtros);

        const respuesta = await fetch(
            `/api/dashboard/vuelos-mes?${parametros}`
        );

        const datos = await respuesta.json();

        crearGraficaVuelosMes(datos);

    }
    catch(error){

        console.error(error);

    }

}

async function cargarMapaEstados(){

    try{

        const filtros = obtenerFiltrosSeleccionados();

        const parametros = new URLSearchParams(filtros);

        const respuesta = await fetch(
            `/api/dashboard/mapa-estados?${parametros}`
        );

        const datos = await respuesta.json();

        actualizarMapaEstados(datos);

    }
    catch(error){

        console.error(error);

    }

}