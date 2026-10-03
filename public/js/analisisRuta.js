//--------------------------------------------------
// VARIABLES
//--------------------------------------------------

const API = "/api/analisis-ruta";

let sliderAnios;

let sliderMeses;


const meses = [

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

const filtros = {

    anioInicio:null,

    anioFin:null,

    mesInicio:null,

    mesFin:null,

    aerolinea:null,

    franja:null,

    ruta:null

};

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
// INICIAR
//--------------------------------------------------

async function iniciarDashboard(){

    await cargarFiltros();

    eventos();

    await actualizarDashboard();

}

//--------------------------------------------------
// EVENTOS
//--------------------------------------------------

function eventos(){

    document

        .getElementById(

            "cmbAerolinea"

        )

        .addEventListener(

            "change",

            async e=>{

                filtros.aerolinea=

                    e.target.value || null;

                await actualizarDashboard();

            }

        );

    document

        .getElementById(

            "cmbFranja"

        )

        .addEventListener(

            "change",

            async e=>{

                filtros.franja=

                    e.target.value || null;

                await actualizarDashboard();

            }

        );

    document

        .getElementById(

            "btnLimpiar"

        )

        .addEventListener(

            "click",

            limpiarFiltros

        );

}

//--------------------------------------------------
// CARGAR FILTROS
//--------------------------------------------------

async function cargarFiltros(){

    const respuesta = await fetch(

        `${API}/filtros`

    );

    const datos = await respuesta.json();

    crearSliderAnios(

        datos.anios.map(

            x=>Number(x.anio)

        )

    );

    crearSliderMeses();

    cargarAerolineas(

        datos.aerolineas

    );

    cargarFranjas(

        datos.franjas

    );

}

//--------------------------------------------------
// SLIDER AÑOS
//--------------------------------------------------

function crearSliderAnios(anios){

    const slider = document.getElementById(

        "sliderAnios"

    );

    noUiSlider.create(

        slider,

        {

            start:[

                Math.min(...anios),

                Math.max(...anios)

            ],

            connect:true,

            step:1,

            range:{

                min:Math.min(...anios),

                max:Math.max(...anios)

            }

        }

    );

    sliderAnios = slider.noUiSlider;

    sliderAnios.on(

        "update",

        values=>{

            document.getElementById(

                "lblAnioInicio"

            ).textContent =

                parseInt(values[0]);

            document.getElementById(

                "lblAnioFin"

            ).textContent =

                parseInt(values[1]);

        }

    );

    sliderAnios.on(

        "change",

        async values=>{

            filtros.anioInicio =

                parseInt(values[0]);

            filtros.anioFin =

                parseInt(values[1]);

            await actualizarDashboard();

        }

    );

}

//--------------------------------------------------
// SLIDER MESES
//--------------------------------------------------

function crearSliderMeses(){

    const slider = document.getElementById(

        "sliderMeses"

    );

    noUiSlider.create(

        slider,

        {

            start:[1,12],

            connect:true,

            step:1,

            range:{

                min:1,

                max:12

            }

        }

    );

    sliderMeses = slider.noUiSlider;

    sliderMeses.on(

        "update",

        values=>{

            document.getElementById(

                "lblMesInicio"

            ).textContent =

                meses[

                    parseInt(values[0])-1

                ];

            document.getElementById(

                "lblMesFin"

            ).textContent =

                meses[

                    parseInt(values[1])-1

                ];

        }

    );

    sliderMeses.on(

        "change",

        async values=>{

            filtros.mesInicio =

                parseInt(values[0]);

            filtros.mesFin =

                parseInt(values[1]);

            await actualizarDashboard();

        }

    );

}

//--------------------------------------------------
// AEROLÍNEAS
//--------------------------------------------------

function cargarAerolineas(datos){

    const combo = document.getElementById(

        "cmbAerolinea"

    );

    combo.innerHTML =

        '<option value="">Todas</option>';

    datos.forEach(a=>{

        combo.innerHTML += `

            <option value="${a.sk_aerolinea}">

                ${a.nombre_aerolinea}

            </option>

        `;

    });

}

//--------------------------------------------------
// FRANJAS
//--------------------------------------------------

function cargarFranjas(datos){

    const combo = document.getElementById(

        "cmbFranja"

    );

    combo.innerHTML =

        '<option value="">Todas</option>';

    datos.forEach(f=>{

        combo.innerHTML += `

            <option value="${f}">

                ${f}

            </option>

        `;

    });

}

//--------------------------------------------------
// PARÁMETROS
//--------------------------------------------------

function obtenerParametros(){

    const params = new URLSearchParams();

    //------------------------------------
    // Año
    //------------------------------------

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

    //------------------------------------
    // Mes
    //------------------------------------

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

    //------------------------------------
    // Aerolínea
    //------------------------------------

    if(filtros.aerolinea){

        params.append(

            "aerolinea",

            filtros.aerolinea

        );

    }

    //------------------------------------
    // Franja horaria
    //------------------------------------

    if(filtros.franja){

        params.append(

            "franja",

            filtros.franja

        );

    }

    //------------------------------------
    // Ruta (si llegara a utilizarse)
    //------------------------------------

    if(filtros.ruta){

        params.append(

            "ruta",

            filtros.ruta

        );

    }

    //------------------------------------
    // Estado (Mapa)
    //------------------------------------

    if(filtros.estado){

        params.append(

            "estado",

            filtros.estado

        );

    }

    return params;

}

//--------------------------------------------------
// DASHBOARD COMPLETO
//--------------------------------------------------

async function actualizarDashboard(){

    await Promise.all([

        cargarKPIs(),

        cargarTopRutas(),

        cargarGraficaLinea(),

        cargarMapa()

    ]);

}

//--------------------------------------------------
// DASHBOARD SIN MAPA
//--------------------------------------------------

async function actualizarDashboardSinMapa(){

    await Promise.all([

        cargarKPIs(),

        cargarTopRutas(),

        cargarGraficaLinea()

    ]);

}

//--------------------------------------------------
// LIMPIAR
//--------------------------------------------------

 async function limpiarFiltros(){

    //--------------------------------------------------
    // Combos
    //--------------------------------------------------

    document.getElementById(

        "cmbAerolinea"

    ).value = "";

    document.getElementById(

        "cmbFranja"

    ).value = "";

    //--------------------------------------------------
    // Limpiar filtros
    //--------------------------------------------------

    filtros.anioInicio = null;

    filtros.anioFin = null;

    filtros.mesInicio = null;

    filtros.mesFin = null;

    filtros.aerolinea = null;

    filtros.franja = null;

    filtros.ruta = null;

    filtros.estado = null;

    //--------------------------------------------------
    // Restaurar sliders
    //--------------------------------------------------

    sliderAnios.set([

        sliderAnios.options.range.min,

        sliderAnios.options.range.max

    ]);

    sliderMeses.set([

        1,

        12

    ]);

    //--------------------------------------------------
    // Recargar dashboard
    //--------------------------------------------------

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

    document.getElementById(

        "kpiRutas"

    ).textContent =

        Number(

            datos.total_rutas

        ).toLocaleString();

    document.getElementById(

        "kpiMillas"

    ).textContent =

        Number(

            datos.millas_recorridas

        ).toLocaleString();

    document.getElementById(

        "kpiTiempo"

    ).textContent =

        Number(

            datos.tiempo_promedio

        ).toFixed(2)+" min";

    document.getElementById(

        "kpiRuta"

    ).textContent =

        datos.ruta_mas_utilizada;

    document.getElementById(

        "kpiPromedio"

    ).textContent =

        Number(

            datos.promedio_vuelos

        ).toFixed(2);

}

//--------------------------------------------------
// TOP 10 RUTAS
//--------------------------------------------------

async function cargarTopRutas(){

    const respuesta = await fetch(

        `${API}/top-rutas?${obtenerParametros()}`

    );

    const datos = await respuesta.json();

        console.log("LINEA:", datos);


    crearGraficaTopRutas(

        datos

    );

}

//--------------------------------------------------
// LÍNEA
//--------------------------------------------------

async function cargarGraficaLinea(){

    const respuesta = await fetch(

        `${API}/linea?${obtenerParametros()}`

    );

    const datos = await respuesta.json();

        console.log("LINEA:", datos);


    crearGraficaLinea(

        datos

    );

}

//--------------------------------------------------
// MAPA
//--------------------------------------------------

async function cargarMapa(){

    const params = new URLSearchParams();

    if(filtros.anioInicio){

        params.append("anioInicio", filtros.anioInicio);

    }

    if(filtros.anioFin){

        params.append("anioFin", filtros.anioFin);

    }

    if(filtros.mesInicio){

        params.append("mesInicio", filtros.mesInicio);

    }

    if(filtros.mesFin){

        params.append("mesFin", filtros.mesFin);

    }

    if(filtros.aerolinea){

        params.append("aerolinea", filtros.aerolinea);

    }

    if(filtros.franja){

        params.append("franja", filtros.franja);

    }

    // NO enviar el estado

    const respuesta = await fetch(

        `${API}/mapa?${params}`

    );

    const datos = await respuesta.json();

    actualizarMapaEstados(datos);

}
