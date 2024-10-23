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
    function button1Pressed(event) {
        if (event.defaultPrevented) {
            return; // Do nothing if the event was already processed
        }
        console.log("Pressed button 1");
    }

    //Kuuntelee nappia haku
    document.getElementById("haku").addEventListener("click", hakuPressed);
    function hakuPressed() {
        let syote = document.forms[0].elements[0].value;
        searchsound(syote).then(response => {
            response.json().then((json) => { console.log(json.results) })
        })
    }
    // palautetaan haetut äänet 
    // Lisätään ne tietoraketeeseen
    // esim. map mutta käyttö voi olla hankalampaa
    let aanet = new Map();

    aanet.set("1"," aanilinkki 1");
    aanet.set("2", "aanilinkki 2");
    aanet.set("3", "aanilinkki 3");
    aanet.set("4", "aanilinkki 4");
    aanet.set("5", "aanilinkki 5");
    aanet.set("6", "aanilinkki 6");
   
    console.log(aanet.has("3"));
    // Tai yksinketaisemmin tallennetaan taulukkoon
    let aani = ["ääni1aanilinkki 1","aanilinkki 2","aanilinkki 3"];
    // Sitten tallennetaan localStrageen
    localStorage.setItem("haetutAanet", aani);
    
    
    console.log(localStorage.key("haetutAanet"));
    
        
    let haetutAanet = localStorage.getItem("haetutAanet");
    //haetutAanet[0]; // toimii
    console.log(haetutAanet);
   
    //funktion pitäisi tarkistaa onko haettu ääni jp tietorakenteessa


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