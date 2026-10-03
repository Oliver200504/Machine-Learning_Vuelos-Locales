document.addEventListener("sidebarLoaded",()=>{

    const btnMenu = document.getElementById("btnMenu");
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("overlay");

    if(!btnMenu || !sidebar) return;

    btnMenu.addEventListener("click",()=>{

        sidebar.classList.toggle("open");

        if(overlay){

            overlay.classList.toggle("show");

        }

    });

    if(overlay){

        overlay.addEventListener("click",()=>{

            sidebar.classList.remove("open");

            overlay.classList.remove("show");

        });

    }

});