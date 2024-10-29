"use strict";
"@ts-check"

// TIEA207

/**
 * Tapahtuman kuuntelija sivun lataamiselle
 */
window.addEventListener("load", function() {

    // Hakee datan lähteestä
    let getdata = async function() {
        const response = await fetch('lähde', {"credentials": "include"});
        // key : ''
        //data = await response.json();
        return await response.text();
    }

    //Kuuntelee nappeja
    let buttons = document.getElementsByClassName("sideButton");
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener("click", button1Pressed);
        function button1Pressed(event) {
            if (event.defaultPrevented) {
                return; // Do nothing if the event was already processed
            }
            console.log("Pressed button " + (i+1));
        }
    }

    //Kuuntelee nappia haku
    document.getElementById("haku").addEventListener("click", hakuPressed);
    function hakuPressed() {
        let syote = document.forms[0].elements[0].value;
        // Tässä tullaan ensin kutsumaan tarkastusfunktiota
        // sitten jos ei löydy käynnistetää ulkoinen haku searchsound
        searchsound(syote).then(result => {
            console.log(syote);
            // Palautetaan äänilinkki
            result.json().then((json) => { 
                console.log(json.results)
            })

        })
    }
     
    // Lisätään se tietoraketeeseen
    // esim. map mutta käyttö voi olla hankalampaa
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
    let aanet = new Map();

    aanet.set("1"," ./media/sci-fi.mp3");
    aanet.set("2", "aanilinkki 3");
    aanet.set("3", "aanilinkki 3");
    aanet.set(4, "aanilinkki 4");
    aanet.set("5", "aanilinkki 5");
    aanet.set("6", "aanilinkki 6");
   
    console.log(aanet.has("3"));
    // Tai yksinketaisemmin tallennetaan taulukkoon
    let aania = ["ääni1aanilinkki 1","aanilinkki 2","aanilinkki 3"];
    // Sitten tallennetaan localStrageen
    localStorage.setItem("haetutAanet", aania);
            
    let haetutAanet = localStorage.getItem("haetutAanet");
    //haetutAanet[0]; // toimii
    console.log(haetutAanet);
   
    //Tehtävä: funktion joka tarkastaa onko haettu ääni jo tietorakenteessa aanet tai aania taulukossa
    //funktio palauttaa löytyneen äänen tai null
    //funkiton malli: funktio (param: haettu ääni, param: taulukko / map äänistä) return ääni tai null



    document.addEventListener(
        "keydown",
        // Kuuntelija näppäimen painamiselle
        function keyPressed(event) {
          if (event.defaultPrevented) {
            return; // Do nothing if the event was already processed
          }
          
          // Näppäin jota on painettu
          const key = event.key;
          if (key == undefined) {
            return;
          }
         console.log(key);
         //const canvas = document.getElementById("canvas1");

         //https://en.wikipedia.org/wiki/File:MT63_sample.ogg
         
         setupAudioAnalyser("./media/sci-fi.mp3");

         //play("./media/sci-fi.mp3")
         //playByKey(key,aanet);

          
          // funktiossa voisi olla taulukko näppäimistä
          // ja niihin yhdistää ääni silmukassa
        function playByKey() {
            
            //console.log(aanet.has("1"));
           // console.log(aanet.has(key));
            // nappulataulukko nappula elementeistä täydennettävä
            let buttons = [document.getElementById("button1"),document.getElementById("button1")];
            
            // myös data pitää jotekin erotella.
            // yhdistää näppäimeen tässä silmukassa
            
            for(let i=0 ; i<5; i++) {
               
                if(aanet.get(i) == "1") {
                    // soita ääni, esim.
                    document.getElementById("Audio").play();
                    // tai
                    const audio = new Audio('./media/MT63_sample.ogg');
                    // Play the audio
                    audio.play();
                    break;
                }
            }
        }

        });


});