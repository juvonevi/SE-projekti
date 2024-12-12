"use strict";
"@ts-check"

/**
 * Näyttää varoituksen mahdollisesti aikuissisältöä sisältävistä äänistä,
 * jos sitä ei ole näytetty vielä
 */
function showAdultContentWarning() {
    if (localStorage.getItem("warningShown")) {
        return;
    }
    document.getElementById("adultContentWarning").style.display = "initial";
    document.getElementById("aanet").style.display = "none";
    document.getElementById("closeWarning2").addEventListener("click", function() {
        document.getElementById("adultContentWarning").style.display = "none";
        document.getElementById("aanet").style.display = "initial";
        localStorage.setItem("warningShown", "true");
    });
}

let infoVisible = false;
/**
 * Avaa tai sulkee info-popupin
 */
function openOrCloseInfo() {
    if (infoVisible) {
        document.getElementById("popup").style.display = "none";
        infoVisible = false;
    }
    else {
        document.getElementById("popup").style.display = "initial";
        infoVisible = true;
    }
}

let warningVisible = false;
/**
 * Avaa tai sulkee varoituksen tilan puutteesta
 */
function openOrCloseWarning() {
    if (warningVisible) {
        document.getElementById("noSpace").style.display = "none";
        warningVisible = false;
    }
    else {
        document.getElementById("noSpace").style.display = "initial";
        warningVisible = true;
    }
}