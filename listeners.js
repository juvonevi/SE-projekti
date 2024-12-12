"use strict";
"@ts-check"

//Funktioita, jotka lisäävät event listenereitä

/**
 * Lisää audioelementteihin kuuntelijat
 * @param {String} audioClass 
 */
function audioEventListeners(audioClass) {
    // Odottaa että ääni on saapunut ja sitten piirtää graafin
    let audios = document.getElementsByClassName(audioClass);
    for (let audio of audios) {
        audio.addEventListener("durationchange", (e) => {
            e.preventDefault();
            setupAudioAnalyser(audio.parentElement);
        });
    }      
}

/**
 * Lisää elementtiin dragstart eventin
 * @param {*} element elementti johon lisätään
 * @param {*} name äänen nimi
 * @param {*} sound äänen linkki
 * @param {*} i äänen paikka arrayssa
 * @param {*} soundSlotClass äänipaikan luokka
 * @param {*} db äänen paikka indexed db:ssä (jos ääni tiedostosta)
 */
function addDragstartEvent(element, name, sound, i, soundSlotClass, db, allSounds, dragImg) {
    element.addEventListener("dragstart", function(e) {
        e.dataTransfer.setData("text/plain", name);
        e.dataTransfer.setData("text/html", sound);
        e.dataTransfer.setData("from", i);
        if (soundSlotClass === "aanirivi") {
            e.dataTransfer.setData("array", allSounds.selected);
        }
        else {
            e.dataTransfer.setData("array", allSounds.selected+1);
        }
        if (db) {
            e.dataTransfer.setData("db", db);
        }             
        e.dataTransfer.setDragImage(dragImg, 30, 26);
    });    
}

/**
 * Lisää checkboxeihin event listenerit
 */
function prepareCheckboxes(cbClass, audioClass) {
    let checkboxes = document.getElementsByClassName(cbClass);
    let audios = document.getElementsByClassName(audioClass);
    for (let i = 0; i < checkboxes.length; i++) {
        checkboxes[i].addEventListener("input", cbInput);
        function cbInput() {
            if (checkboxes[i].checked) {
                audios[i].loop = true;
            }
            else {
                audios[i].loop = false;
            }
        }
    }
}

/**
 * Lisää ääninapeille kuuntelijat
 * @param {String} buttonClass 
 * @param {String} audioClass 
 */
function soundButtonListeners(buttonClass, audioClass) {
    let buttons = document.getElementsByClassName(buttonClass);
    let audios = document.getElementsByClassName(audioClass);
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener("click", function(event) {
            if (event.defaultPrevented) {
                return; // Do nothing if the event was already processed
            }
            console.log("Pressed button " + (i+1));
            if (audios[i].paused) {
                audios[i].play();
            }
            else {
                audios[i].pause();
            }
        });
        buttons[i].addEventListener("dblclick", function(event) {
            const button = event.target;
            let valittuna = document.getElementsByClassName("nappiValittuna");
            if (valittuna.length > 0) {
                valittuna[0].classList.remove("nappiValittuna");
            }
            button.classList.add("nappiValittuna");
        });
    }
}