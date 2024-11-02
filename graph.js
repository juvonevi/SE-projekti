/**
 * Asetetaan ja käytetään äänen analysaattoria
 * @param {*} audioFile 
 */

function setupAudioAnalyser(aaniPaikka) {
  const audio = aaniPaikka.children[4]; // <- Tuon pitäisi osoittaa aina audion paikkaa
  const canvas = aaniPaikka.children[3];

  const src = audio.src;  
  console.log(audio)
  const audioCtx = new AudioContext(); 
  const offlineCtx = new OfflineAudioContext({
    numberOfChannels: 2, // TODO: NumberOfChannelsin saaminen audiosta
    length: 44100 * audio.duration, // TODO: SampleRaten tiedon saaminen
    sampleRate: 44100, // TODO: SampleRaten tiedon saaminen
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
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = 'rgb(0, 0, 0)';

    const data = soundBuffer.getChannelData(0);
    console.log(data)
    
    const barWidth = (canvas.width / 100);
    let barHeight = 100;
    let x = 0;
    const s = Math.floor(data.length / canvas.width)
    for (let i = 0; i < canvas.width; i++) {
      ctx.fillRect(i, canvas.height / 2, barWidth, barHeight * data[i * s]);
    }
  }