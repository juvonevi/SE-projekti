"use strict";
"@ts-check"

// TIEA207

/**
 * Tapahtuman kuuntelija sivun lataamiselle
 */
window.addEventListener("load", function() {

    /**
     * Lisää checkboxeihin event listenerit
     */
    prepareCheckboxes();
    function prepareCheckboxes() {
        let checkboxes = document.getElementsByClassName("loop");
        let audios = document.querySelectorAll(".aanirivi > audio");
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
     * Mahdollistaa äänien droppauksen äänilistaan
     */
    prepareDrop();
    function prepareDrop() {
        let paikat = document.getElementsByClassName("aanirivi");
        for (let paikka of paikat) {
            paikka.addEventListener("dragover", function(e) {
                e.preventDefault();
                e.dataTransfer.dropEffect = "copy";
            });
    
            paikka.addEventListener("drop", function(e) {
                e.preventDefault();
                let nimi = e.dataTransfer.getData("text/plain");
                let aani = e.dataTransfer.getData("text/html");
                let label = this.children[0];
                let audio = this.children[4];
                label.textContent = nimi;
                audio.setAttribute("src", aani);   
            });
        }
    }

    /**
     * Laittaa hakutulokset näkyviin sivulle
     * @param {*} data 
     */
    function showSearchResults(data) {
        let htdiv = document.getElementById("hakutulokset");
        while(htdiv.firstChild){
            htdiv.removeChild(htdiv.firstChild);
        }
        for (let aani of data) {
            let div = document.createElement("div");
            htdiv.appendChild(div);
            let nimi = document.createElement("label");
            nimi.textContent = aani.name;
            div.appendChild(nimi);
            let audio = document.createElement("audio");
            audio.setAttribute("controls", "");
            audio.setAttribute("src", aani.previews["preview-hq-mp3"]);
            div.appendChild(audio);
            div.style.width = "100%";
            div.style.display = "inline-block";
            nimi.style.float = "left";
            audio.style.float = "right";
            audio.style.clear = "right";
            div.setAttribute("draggable", "true");
            div.addEventListener("dragstart", function(e) {
                e.dataTransfer.setData("text/plain", aani.name);
                e.dataTransfer.setData("text/html", aani.previews["preview-hq-mp3"]);
            });
        }
    }

    //Kuuntelee nappeja
    addButtonListeners();
    function addButtonListeners() {
        let buttons = document.getElementsByClassName("sideButton");
        let audios = document.querySelectorAll(".aanirivi > audio");
        for (let i = 0; i < buttons.length; i++) {
            buttons[i].addEventListener("click", button1Pressed);
            function button1Pressed(event) {
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
            }
        }
    }
    
    //Kuuntelee nappia haku
    document.getElementById("haku").addEventListener("click", hakuPressed);
    document.getElementById("hakulomike").addEventListener("submit", hakuPressed);
    function hakuPressed(e) {
        e.preventDefault()
        let syote = document.forms[0].elements[0].value;
        if ((this.lastSearched && 
            this.lastSearched === syote) ||
            !syote) { // <- Viimeinen on tyhjan haun lähettämisen esto
            return;
        }
        this.lastSearched = syote;
        
        // Tässä tullaan ensin kutsumaan tarkastusfunktiota
        // sitten jos ei löydy käynnistetää ulkoinen haku searchsound
        searchsound(syote).then(result => {
            // Palautetaan äänilinkki
            if (result.ok) {
                result.json().then((json) => { 
                    console.log(json.results)
                    showSearchResults(json.results);
                })
            }
            else {
                // TODO: Jokin ilmoitusjärjestelmä?
                console.log(result.statusText)
            }
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
    let aania = ["./media/sci-fi.mp3","aanilinkki 2","aanilinkki 3"];
    // Sitten tallennetaan localStrageen
    localStorage.setItem("haetutAanet", aania);
            
    let haetutAanet = localStorage.getItem("haetutAanet");
    //haetutAanet[0]; // toimii
    console.log(haetutAanet, " Äänet local storagesta");
   
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

         // Tarvitsee tietää canvas että piirretään oikeaan paikkaan,
         // nappi1 canvas1 jne
         //const canvas = document.getElementById("canvas1");

         //https://en.wikipedia.org/wiki/File:MT63_sample.ogg
         
        //play("./media/sci-fi.mp3")
        playByKey(key);
        playByKeyTest(key);

        function playByKeyTest(key) {
            const keys = ["1","2","3","4","5","6","7","8","9","0"];
            let audios = document.querySelectorAll(".aanirivi > audio");
            for (let i = 0; i < keys.length; i++) {
                if (key === keys[i]) {
                    if (audios[i].paused) {
                        audios[i].play();
                    }
                    else {
                        audios[i].pause();
                    }
                }
            }
        }
          
        /**
         * Funktio soittaa äänen näppäimen mukaan
         * @param {*} key 
         */
        function playByKey(key) {
            
            // console.log(aanet.has("1")); // Kyselee mapista
            // Taulukko näppäimistön nappuloista
            const keys = [1,2,3,4,5,6,7,8,9,0,'q','w','e','r','t','y','u','i','o','p','a','s','d','f','g','h','j','k','l','z','x','c','v','b','n','m'];  
            //,a,s,d,f,g,h,j,k,l,z,x,c,v,b,n,m
            for(let i = 0; i < aania.length; i++) {
                
                if(key == keys[i]) {
                    // soita ääni, näppäimen mukaan
                    if(aania[i].indexOf(".mp3")) { // Tarkastetaan ettei ole pelkkää tekstiä
                        console.log("soita ääni ",aania[i]);
                        setupAudioAnalyser(aania[i]);
                    }
                 }
                break;
            }
            
        }

        });

});