/**
 * Asetetaan ja käytetään äänen analysaattoria
 * @param {*} audioFile 
 */

async function setupAudioAnalyser(aaniPaikka) {
  console.log(aaniPaikka.children);
  const audio = aaniPaikka.children[4]; // <- Tuon pitäisi osoittaa aina audion paikkaa
  const canvas = aaniPaikka.children[3];

  const src = audio.src;  
  const audioCtx = new AudioContext(); 
  const offlineCtx = new OfflineAudioContext({
    numberOfChannels: 2,
    length: 44100 * 10,
    sampleRate: 44100,
  });


  fetch(src)
    .then((response) => response.arrayBuffer())
    .then((downloadedBuffer) => audioCtx.decodeAudioData(downloadedBuffer))
    .then((decodedBuffer) => {
      console.log("Sound loaded successfully")
      const source = new AudioBufferSourceNode(offlineCtx, {
        buffer: decodedBuffer
      });
      source.connect(offlineCtx.destination);
      return source.start();
    })
    .then(() => offlineCtx.startRendering())
    .then((renderedBuffer) => {
      console.log("Sound rendered");
      const sound = new AudioBufferSourceNode(audioCtx, {
        buffer: renderedBuffer
      })
      console.log(renderedBuffer)
      drawCanvas(renderedBuffer, canvas)
      sound.start();
    })
    .catch((error) => { console.error(error) })
}


/**
 * Piirtää canvakselle datan mukaisen kaavion
 * @param {*} soundBuffer 
 * @param {*} canvas 
 */
function drawCanvas(soundBuffer, canvas) {
    const bufferLength = 300;
    canvas = document.getElementById("canvas1");
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = 'rgb(0, 0, 0)';

    const data = soundBuffer.getChannelData(0);
    console.log(data)
    
    const barWidth = (canvas.width / 100);
    let barHeight = 100;
    let x = 0;
    const s = Math.floor(data.length / canvas.width)
    for (let i = 0; i < canvas.width; i++) {
      ctx.fillRect(i, 0, barWidth, barHeight * data[i * s]);
    }
  }