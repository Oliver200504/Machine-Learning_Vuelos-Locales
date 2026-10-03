const API="/api/ml";

document.addEventListener("DOMContentLoaded",async()=>{

    await verificarEstado();

    await cargarFiltros();

    document.getElementById("btnPredecir")
        .addEventListener("click",predecir);

});

async function cargarFiltros(){

    const respuesta=await fetch(`${API}/filtros`);
    const datos=await respuesta.json();

    llenarCombo(
        "cmbAerolinea",
        datos.aerolineas,
        "sk_aerolinea",
        "nombre_aerolinea"
    );

    llenarCombo(
        "cmbOrigen",
        datos.aeropuertos,
        "sk_aeropuerto",
        "codigo_aeropuerto"
    );

    llenarCombo(
        "cmbDestino",
        datos.aeropuertos,
        "sk_aeropuerto",
        "codigo_aeropuerto"
    );

    llenarCombo(
        "cmbFranja",
        datos.franjas,
        "sk_horario",
        "franja_horaria"
    );

}

function llenarCombo(id,datos,value,texto){

    const combo=document.getElementById(id);

    combo.innerHTML="<option value=''>Seleccione...</option>";

    datos.forEach(item=>{

        combo.innerHTML+=`
            <option value="${item[value]}">
                ${item[texto]}
            </option>
        `;

    });

}

async function predecir(){

    const fecha=document.getElementById("txtFecha").value;

    if(!fecha){
        return alert("Selecciona una fecha.");
    }

    const partes=fecha.split("-");

    const datos={
    anio:Number(partes[0]),
    mes:Number(partes[1]),
    dia:Number(partes[2]),
    aerolinea:Number(document.getElementById("cmbAerolinea").value),
    origen:Number(document.getElementById("cmbOrigen").value),
    destino:Number(document.getElementById("cmbDestino").value),
    horario:Number(document.getElementById("cmbFranja").value)
};

    const respuesta=await fetch(`${API}/predecir`,{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify(datos)
    });

    const resultado=await respuesta.json();

    document.getElementById("kpiMinutos").textContent=`${resultado.minutos} min`;
    document.getElementById("kpiRetraso").textContent=`${resultado.probabilidadRetraso}%`;
    document.getElementById("kpiCancelacion").textContent=`${resultado.probabilidadCancelacion}%`;
    document.getElementById("kpiRiesgo").textContent=resultado.riesgo;
    document.getElementById("kpiMotivo").textContent=resultado.motivo;

    document.getElementById("resumenPrediccion").innerHTML=`
        <div class="alert alert-info mb-0">
            <strong>Predicción completada</strong><br><br>

            Minutos estimados: <b>${resultado.minutos} min</b><br>
            Probabilidad de retraso: <b>${resultado.probabilidadRetraso}%</b><br>
            Probabilidad de cancelación: <b>${resultado.probabilidadCancelacion}%</b><br>
            Nivel de riesgo: <b>${resultado.riesgo}</b><br>
            Motivo probable: <b>${resultado.motivo}</b>
        </div>
    `;

    crearGraficaPrediccion(resultado);

}

async function verificarEstado(){

    const respuesta=await fetch(`${API}/estado`);
    const estado=await respuesta.json();

    if(!estado.entrenado){

        document.getElementById("btnPredecir").disabled=true;

        document.getElementById("resumenPrediccion").innerHTML=`
            <div class="alert alert-warning mb-0">
                El modelo aún se encuentra entrenando...
            </div>
        `;

    }

}