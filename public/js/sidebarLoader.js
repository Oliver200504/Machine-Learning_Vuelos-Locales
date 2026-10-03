async function cargarSidebar(){

    const contenedor = document.getElementById("sidebar-container");

    if(!contenedor) return;

    try{

        const ruta = window.location.pathname.includes("/pages/")
            ? "../components/sidebar.html"
            : "components/sidebar.html";

        const respuesta = await fetch(ruta);

        if(!respuesta.ok){

            throw new Error("No se pudo cargar el sidebar.");

        }

        const html = await respuesta.text();

        contenedor.innerHTML = html;

        // Notificar que el sidebar ya está listo
        document.dispatchEvent(
            new Event("sidebarLoaded")
        );

    }

    catch(error){

        console.error("Error cargando sidebar:",error);

    }

}

document.addEventListener("DOMContentLoaded",()=>{

    cargarSidebar();

});