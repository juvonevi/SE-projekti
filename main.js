"use strict";
"@ts-check"

// TIEA207

// Tapahtuman kuuntelija sivun lataamiselle
window.addEventListener("load", function() {

    // Hakee datan lähteestä
    let getdata = async function() {
        const response = await fetch('lähde', {"credentials": "include"});
        //data = await response.json();
        return await response.text();
    }

    //Kuuntelee nappia button1
    document.getElementById("button1").addEventListener("click", button1Pressed);
    function button1Pressed() {
        console.log("Pressed button 1");
    }

    //Kuuntelee nappia haku
    document.getElementById("haku").addEventListener("click", hakuPressed);
    function hakuPressed() {
        let syote = document.forms[0].elements[0].value;
        searchsound(syote).then(result => {
            console.log(syote);
        })
    }

    let data = getdata;
    document.addEventListener(
        "keydown",
        // Kuuntelija näppäimen painamiselle
        function keyPressed(event) {
          if (event.defaultPrevented) {
            return; // Do nothing if the event was already processed
          }
          // Näppäin jota on painettu
          const key = event.key;
          playByKey(key, data);

          // tämä uuteen tiedostoon
          // funktiossa voisi olla taulukko näppäimistä
          // ja niihin yhdistää ääni silmukassa
        function playByKey(key, data) {
            let keys = [a,b,c];
            // taulukko myös nappula elementeistä
            let buttons = document.querySelectorAll(".sideButton");

            // myös data pitää jotekin erotella.
            // sitten yhdistää näppäimeen tässä silmukassa
            for(let v in keys) {
                v == key;
                if(v == "Ääni") {
                    // soita ääni, esim.
                    document.getElementById("Audio").play();
                    // tai
                    const audio = new Audio('path/to/your/soundfile.mp3');
                    // Play the audio
                    audio.play();
                    break;
                }
            }
        }

        });
});