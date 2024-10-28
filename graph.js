
// Space Sound Effect by Gregor Quendel from Pixabay
// Vain testaukseen


/**
 * 
 * @param {*} audioFile 
 */
function play(audioFile) {
  const audio = new Audio(audioFile);
  audio.play();
}


/**
 * Asetetaan ja käytetään aaänen analysaattoria
 * @param {*} audioFile 
 */
function setupAudioAnalyser(audioFile) {
  let dataArray;
  //const ANALYSE = stream => {   
  const audioCtx = new AudioContext();
  const analyser = audioCtx.createAnalyser();
  
  // Set up the audio source
    
    const audio = new Audio(audioFile);
    //audio.play();

    const mediaElement = document.getElementById("audio1"); //document.createElement("audio");
    const source = audioCtx.createMediaElementSource(mediaElement);
    
    
    // Configure the analyser
    analyser.fftSize = 2048;
    const bufferLength = analyser.frequencyBinCount;
    
    // taulukko Uint8Array tyyppiä
    dataArray = new Uint8Array(bufferLength);
    
    source.connect(analyser);
    
    analyser.connect(audioCtx.destination);
    audio.play();

    // tässä pitäisi saada äänidata dataArray:hin
    analyser.getByteFrequencyData(dataArray);
    
    console.log(dataArray);
  //}
  
    // Kutsutaan drawCanvas metodia dataArray parametrilla
    drawCanvas(dataArray);
}


function step(timestamp) {
  const start = 0;
  if (start === undefined) {
    start = timestamp;
  }
  const elapsed = timestamp - start;
  const piirronPituus = 300;
  // Math.min() is used here to make sure the element stops at exactly piirronPituus.
  const shift = Math.min(0.1 * elapsed, piirronPituus);
  let stepElem = document.createElement("div")

  stepElem.style.transform = `translateX(${shift}px)`;
  if (shift < piirronPituus) {
    requestAnimationFrame(step);
  }
}


/**
 * Piirtää canvakselle datan mukaisen kaavion
 * @param {*} dataArray 
 * @param {*} canvas 
 */
function drawCanvas(dataArray, canvas) {
    requestAnimationFrame(drawCanvas);
    //console.log(dataArray);
    
    
    
    const bufferLength = 300;
    canvas = document.getElementById("canvas1");
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = 'rgb(0, 0, 0)';
    //ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    //const barWidth = (canvas.width / bufferLength) * 2.5;
    const barWidth = (canvas.width / 100);
    let barHeight = 20;
    let x = 0;
    //console.log(dataArray)
    //console.log(barWidth);
    for (let i = 0; i < bufferLength; i++) {
      
      //barHeight = dataArray[i];
      //console.log( barHeight);
      //ctx.fillStyle = 'rgb(' + (barHeight + 100), ',)';
      ctx.fillRect(x, 0, barWidth, barHeight);
      //ctx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);
  
      x += barWidth + 1;
      //console.log(x);
    }
  }