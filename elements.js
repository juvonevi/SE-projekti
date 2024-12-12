"use strict";
"@ts-check"

//Funktioita, jotka luovat/postavat/muuttavat elementtejä

/**
 * Muuttaa ulkoasua sopivammaksi Chromelle
 */
function changeForOtherBrowsers() {
    let audios = document.getElementsByTagName("audio");
    for (let audio of audios) {
        audio.style.zoom = "90%";
        audio.style.position = "relative";
        audio.style.top = "10px";
    }
    let spans = document.querySelectorAll(".aanirivi span");
    for (let span of spans) {
        span.style.top = "0";
    }
    if (!searchVisible) {
        let spans = document.querySelectorAll(".aanirivi2 span");
        for (let span of spans) {
            span.style.top = "0";
        }
    }
}

/**
 * Luo sivumäärälle tarvittavat napit
 */
function createPageButtons(numOfPages) {
    let arrow = document.getElementById("arrowLeft");
    let after = arrow;
    for (let i = 0; i < numOfPages; i++) {
        let button = document.createElement("input");
        button.type = "button";
        button.id = "pageButton" + (i+1);
        button.value = i + 1;
        after.after(button);
        after = button;
    }
}

/**
 * Laittaa hakutulokset näkyviin sivulle
 * @param {*} data 
 */
function showSearchResults(data, firefox, dragImg) {
    console.log("Search results:", data); 
    let htdiv = document.getElementById("hakutulokset");
    while(htdiv.firstChild){
        htdiv.removeChild(htdiv.firstChild);
    }
    for (let aani of data) {
        let div = document.createElement("div");
        htdiv.appendChild(div);
        div.classList.add("searchresult");
        let nimi = document.createElement("label");
        nimi.textContent = aani.name;
        div.appendChild(nimi);
        if (!firefox) {
            nimi.style.top = "1em";
        }
        let audio = document.createElement("audio");
        audio.setAttribute("controls", "");
        audio.setAttribute("src", aani.previews["preview-hq-mp3"]);
        div.appendChild(audio);
        div.style.display = "inline-block";
        nimi.style.float = "left";
        audio.style.float = "right";
        audio.style.clear = "right";
        div.setAttribute("draggable", "true");
        div.addEventListener("dragstart", function(e) {
            e.dataTransfer.setData("text/plain", aani.name);
            e.dataTransfer.setData("text/html", aani.previews["preview-hq-mp3"]);
            e.dataTransfer.setDragImage(dragImg, 30, 26);
        });
    }
}

/**
 * Luo uuden äänipaikan
 */
function createAudioSpaces(myKeys2) {
    let aanet = document.getElementById("aanet");
    for (let i = 0; i < 10; i++) {
        let div = document.createElement("div");
        div.classList.add("aanirivi2");
        let label = document.createElement("label");
        label.classList.add("label2");
        label.textContent = "placeholder";
        div.appendChild(label);
        div.appendChild(document.createElement("br"));
        let button = document.createElement("input");
        button.type = "button";
        button.id = "button2" + (i+1);
        button.value = myKeys2[i];
        button.classList.add("sideButton2");
        div.appendChild(button);
        let canvas = document.createElement("canvas");
        canvas.id = "canvas2" + (i+1);
        div.appendChild(canvas);
        let audio = document.createElement("audio");
        audio.id = "audio2" + (i+1);
        audio.setAttribute("controls", "");
        audio.classList.add("audio2");
        div.appendChild(audio);
        let labelfor = document.createElement("label");
        labelfor.for = "cb2" + (i+1);
        let cb = document.createElement("input");
        cb.type = "checkbox"; 
        cb.id = "cb2" + (i+1);
        cb.classList.add("loop2");
        labelfor.appendChild(cb);
        let span = document.createElement("span");
        span.textContent = "⟳";
        labelfor.appendChild(span);
        div.appendChild(labelfor);
        labelfor.style.marginLeft = "0.5em";
        aanet.appendChild(div);
    }
}