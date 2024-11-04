"use strict";
"@ts-check"

// TIEA207

/**
 * Tapahtuman kuuntelija sivun lataamiselle
 */
window.addEventListener("load", function() {
    let sounds1 = [];
    let sounds2 = [];
    let sounds3 = [];
    let sounds4 = [];
    let allSounds = [sounds1, sounds2, sounds3, sounds4];
    allSounds.selected = 0;
    this.document.getElementById("buttonA").style["font-weight"] = "bold";
    let dragImg = new Image();
    dragImg.src = "GrabCursor.png";

    /**
     * Hakee käyttäjän äänet local storagesta
     */
    getStoredSounds();
    function getStoredSounds() {
        for (let i = 0; i < 4; i++) {
            let sounds = JSON.parse(localStorage.getItem("sounds"+(i+1)));
            if (sounds) {
                console.log(sounds);
                for (let j = 0; j < sounds.length; j++) {
                    if (sounds[j]) {
                        allSounds[i][j] = sounds[j];
                    } 
                }
            }
        }    
    }

    audioEventListeners();
    function audioEventListeners() {
        // Odottaa että ääni on saapunut ja sitten piirtää graafin
        let audios = document.querySelectorAll(".aanirivi > audio");
        for (let audio of audios) {
            audio.addEventListener("durationchange", (e) => {
                e.preventDefault();
                setupAudioAnalyser(audio.parentElement);
            });
        }      
    }
    
    /**
     * Näyttää käyttäjän äänet sivulla
     */
    showMySounds();
    function showMySounds() {
        let sounds = allSounds[allSounds.selected];
        let paikat = document.getElementsByClassName("aanirivi");
        for (let i = 0; i < paikat.length; i++) {
            if (typeof sounds[i] === "undefined") {
                paikat[i].children[0].textContent = "Add sound";
                paikat[i].children[3].style.display = "none";
                paikat[i].children[4].style.display = "none";
                paikat[i].children[5].style.display = "none";
            }
            else {
                paikat[i].children[0].textContent = sounds[i].name;
                paikat[i].children[3].style.display = "initial";
                paikat[i].children[4].style.display = "initial";
                paikat[i].children[4].setAttribute("src", sounds[i].sound);
                paikat[i].children[5].style.display = "initial";         
            }
        }
    }

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
        for (let i = 0; i < paikat.length; i++) {
            paikat[i].addEventListener("dragover", function(e) {
                e.preventDefault();
                e.dataTransfer.dropEffect = "copy";
            });
    
            paikat[i].addEventListener("drop", function(e) {
                e.preventDefault();
                let sounds = allSounds[allSounds.selected];
                let nimi = e.dataTransfer.getData("text/plain");
                let aani = e.dataTransfer.getData("text/html");
                let obj = {"name" : nimi, "sound" : aani};
                sounds[i] = obj;
                showMySounds();
                let audio = paikat[i].children[4];
                localStorage.setItem("sounds" + (allSounds.selected+1),  JSON.stringify(sounds));
                console.log(localStorage.getItem("sounds", allSounds.selected+1));
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
                e.dataTransfer.setDragImage(dragImg, 30, 26);
            });
        }
    }

    //Kuuntelee nappeja
    addButtonListeners();
    function addButtonListeners() {
        //My sounds napit
        let buttons = document.getElementsByClassName("sideButton");
        let audios = document.querySelectorAll(".aanirivi > audio");
        for (let i = 0; i < buttons.length; i++) {
            buttons[i].addEventListener("click", buttonPressed);
            function buttonPressed(event) {
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
        //Presettienvaihtonapit
        let buttons2 = document.querySelectorAll("#preset > input");
        for (let i = 1; i < buttons2.length-1; i++) {
            buttons2[i].addEventListener("click", buttonPressed2);
            function buttonPressed2() {
                allSounds.selected = i-1;
                for (let j = 1; j < buttons2.length-1; j++) {
                    buttons2[j].style["font-weight"] = "normal";
                }
                buttons2[i].style["font-weight"] = "bold";
                showMySounds();
            }
        }
        buttons2[0].addEventListener("click", buttonPressedL);
        function buttonPressedL() {
            if (allSounds.selected === 0) {
                allSounds.selected = 3;
            }
            else {
                allSounds.selected = allSounds.selected-1;
            }            
            for (let j = 1; j < buttons2.length-1; j++) {
                buttons2[j].style["font-weight"] = "normal";
            }
            buttons2[allSounds.selected+1].style["font-weight"] = "bold";
            showMySounds();
        }
        buttons2[buttons2.length-1].addEventListener("click", buttonPressedR);
        function buttonPressedR() {
            if (allSounds.selected === 3) {
                allSounds.selected = 0;
            }
            else {
                allSounds.selected = allSounds.selected+1;
            }            
            for (let j = 1; j < buttons2.length-1; j++) {
                buttons2[j].style["font-weight"] = "normal";
            }
            buttons2[allSounds.selected+1].style["font-weight"] = "bold";
            showMySounds();
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
                    /*
                    if(aania[i].indexOf(".mp3")) { // Tarkastetaan ettei ole pelkkää tekstiä
                        console.log("soita ääni ",aania[i]);
                        setupAudioAnalyser(aania[i]);
                    }*/
                 }
                break;
            }
            
        }

        });

});