//--------------------------------------------------
// API
//--------------------------------------------------

const API = "/api/cancelaciones-aero";

//--------------------------------------------------
// Filtros
//--------------------------------------------------

const filtros={

    anioInicio:null,

    anioFin:null,

    mesInicio:null,

    mesFin:null,

    aeropuerto:null,

    franja:null,

    motivo:null,

    estado:null

};

//--------------------------------------------------
// Meses
//--------------------------------------------------

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

//--------------------------------------------------
// Inicializar
//--------------------------------------------------

document.addEventListener(

    "DOMContentLoaded",

    async()=>{

        await iniciarDashboard();

    }

);

//--------------------------------------------------
// Dashboard
//--------------------------------------------------

async function iniciarDashboard(){

    await cargarSidebar();

    await cargarFiltros();

    configurarEventos();

    await actualizarDashboard();

}

//--------------------------------------------------
// FILTROS
//--------------------------------------------------

async function cargarFiltros(){

    const respuesta = await fetch(

        `${API}/filtros`

    );

    const datos = await respuesta.json();

    //--------------------------------------------------
    // Slider años
    //--------------------------------------------------

    const anios = datos.anios.map(

        x=>Number(

            x.anio

        )

    );

    noUiSlider.create(

        document.getElementById(

            "sliderAnios"

        ),

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

            },

            format:{

                to:v=>Math.round(v),

                from:v=>Number(v)

            }

        }

    );

    filtros.anioInicio = Math.min(...anios);

    filtros.anioFin = Math.max(...anios);

    //--------------------------------------------------
    // Slider meses
    //--------------------------------------------------

    noUiSlider.create(

        document.getElementById(

            "sliderMeses"

        ),

        {

            start:[1,12],

            connect:true,

            step:1,

            range:{

                min:1,

                max:12

            },

            format:{

                to:v=>Math.round(v),

                from:v=>Number(v)

            }

        }

    );

    filtros.mesInicio = 1;

    filtros.mesFin = 12;

    //--------------------------------------------------
    // Aeropuertos
    //--------------------------------------------------

    const cmbAeropuerto =

        document.getElementById(

            "cmbAeropuerto"

        );

    cmbAeropuerto.innerHTML =

        `<option value="">Todos</option>`;

    datos.aeropuertos.forEach(x=>{

        cmbAeropuerto.innerHTML +=

        `

        <option

            value="${x.sk_aeropuerto}">

            ${x.codigo_aeropuerto}

        </option>

        `;

    });

    //--------------------------------------------------
    // Franjas
    //--------------------------------------------------

    const cmbFranja =

        document.getElementById(

            "cmbFranja"

        );

    cmbFranja.innerHTML =

        `<option value="">Todas</option>`;

    datos.franjas.forEach(x=>{

        cmbFranja.innerHTML +=

        `

        <option>

            ${x}

        </option>

        `;

    });

    //--------------------------------------------------
    // Etiquetas sliders
    //--------------------------------------------------

    document.getElementById(

        "lblAnioInicio"

    ).textContent =

        filtros.anioInicio;

    document.getElementById(

        "lblAnioFin"

    ).textContent =

        filtros.anioFin;

    document.getElementById(

        "lblMesInicio"

    ).textContent =

        meses[0];

    document.getElementById(

        "lblMesFin"

    ).textContent =

        meses[11];

}

//--------------------------------------------------
// EVENTOS
//--------------------------------------------------

function configurarEventos(){

    //--------------------------------------------------
    // Slider años
    //--------------------------------------------------

    document

        .getElementById(

            "sliderAnios"

        )

        .noUiSlider

        .on(

            "update",

            async(values)=>{

                filtros.anioInicio =

                    Number(

                        values[0]

                    );

                filtros.anioFin =

                    Number(

                        values[1]

                    );

                document.getElementById(

                    "lblAnioInicio"

                ).textContent =

                    filtros.anioInicio;

                document.getElementById(

                    "lblAnioFin"

                ).textContent =

                    filtros.anioFin;

                await actualizarDashboard();

            }

        );

    //--------------------------------------------------
    // Slider meses
    //--------------------------------------------------

    document

        .getElementById(

            "sliderMeses"

        )

        .noUiSlider

        .on(

            "update",

            async(values)=>{

                filtros.mesInicio =

                    Number(

                        values[0]

                    );

                filtros.mesFin =

                    Number(

                        values[1]

                    );

                document.getElementById(

                    "lblMesInicio"

                ).textContent =

                    meses[

                        filtros.mesInicio-1

                    ];

                document.getElementById(

                    "lblMesFin"

                ).textContent =

                    meses[

                        filtros.mesFin-1

                    ];

                await actualizarDashboard();

            }

        );

    //--------------------------------------------------
    // Aeropuerto
    //--------------------------------------------------

    document

        .getElementById(

            "cmbAeropuerto"

        )

        .addEventListener(

            "change",

            async(e)=>{

                filtros.aeropuerto =

                    e.target.value || null;

                await actualizarDashboard();

            }

        );

    //--------------------------------------------------
    // Franja
    //--------------------------------------------------

    document

        .getElementById(

            "cmbFranja"

        )

        .addEventListener(

            "change",

            async(e)=>{

                filtros.franja =

                    e.target.value || null;

                await actualizarDashboard();

            }

        );

    //--------------------------------------------------
    // Limpiar
    //--------------------------------------------------

    document

        .getElementById(

            "btnLimpiar"

        )

        .addEventListener(

            "click",

            async()=>{

                filtros.aeropuerto = null;

                filtros.franja = null;

                filtros.anioInicio = 2019;

                filtros.anioFin = 2023;

                filtros.mesInicio = 1;

                filtros.mesFin = 12;

                document

                    .getElementById(

                        "cmbAeropuerto"

                    )

                    .value = "";

                document

                    .getElementById(

                        "cmbFranja"

                    )

                    .value = "";

                document

                    .getElementById(

                        "sliderAnios"

                    )

                    .noUiSlider

                    .set([

                        2019,

                        2023

                    ]);

                document

                    .getElementById(

                        "sliderMeses"

                    )

                    .noUiSlider

                    .set([

                        1,

                        12

                    ]);

                await actualizarDashboard();

            }

        );

}

//--------------------------------------------------
// DASHBOARD
//--------------------------------------------------

async function actualizarDashboard(){

    await Promise.all([

        cargarKPIs(),

        cargarPastel(),

        cargarAeropuertos(),

        cargarEstados()

    ]);

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

    //--------------------------------------------------
    // MOTIVO
    //--------------------------------------------------

    if(filtros.motivo){

        params.append(

            "motivo",

            filtros.motivo

        );

    }

    //--------------------------------------------------
    // ESTADO
    //--------------------------------------------------

    if(filtros.estado){

        params.append(

            "estado",

            filtros.estado

        );

    }

    return params.toString();

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

        "kpiMotivo"

    ).textContent =

        datos.motivo_principal;

    document.getElementById(

        "kpiAeropuerto"

    ).textContent =

        datos.aeropuerto_mas_cancelaciones;

    document.getElementById(

        "kpiCancelados"

    ).textContent =

        Number(

            datos.vuelos_cancelados

        ).toLocaleString();

    document.getElementById(

        "kpiPorcentaje"

    ).textContent =

        Number(

            datos.porcentaje_cancelados

        ).toFixed(1)

        + "%";

}

//--------------------------------------------------
// PASTEL
//--------------------------------------------------

async function cargarPastel(){

    const respuesta = await fetch(

        `${API}/pastel?${obtenerParametros()}`

    );

    const datos = await respuesta.json();

    crearGraficaPastel(

        datos

    );

}

//--------------------------------------------------
// BARRAS VERTICALES
//--------------------------------------------------

async function cargarAeropuertos(){

    const respuesta = await fetch(

        `${API}/aeropuertos?${obtenerParametros()}`

    );

    const datos = await respuesta.json();

    crearGraficaAeropuertos(

        datos

    );

}

//--------------------------------------------------
// BARRAS HORIZONTALES
//--------------------------------------------------

async function cargarEstados(){

    const respuesta = await fetch(

        `${API}/estados?${obtenerParametros()}`

    );

    const datos = await respuesta.json();

    crearGraficaEstados(

        datos

    );

}

