const START_NOTE = 21;
const TOP_NOTE = 108;
const NUMBER_OF_NOTES = 88;
const NOTE_ON = 144;
const NOTE_OFF = 128;
const OCTAVES = [24, 36, 48, 60, 72, 84, 96]

// const POT = 176;
const keys = [];
// set up the keys
for (let i = 0; i < 88; i++) {
  const key = {
    cmd: 0,
    note: i + START_NOTE,
    attack: 0,
  };
  keys.push(key);
}

// run this once to connect the midi
function connect() {
  navigator.requestMIDIAccess().then(
    (midi) => midiReady(midi),
    (err) => console.log("Something went wrong", err)
  );
}

// when midi is ready set up the device
function midiReady(midi) {
  // Also react to device changes.
  midi.addEventListener("statechange", (event) => initDevices(event.target));
  initDevices(midi); // see the next section!
}

// figure out all the inputs and get ready to listen
function initDevices(midi) {
  // Reset.
  midiIn = [];
  midiOut = [];

  // MIDI devices that send you data.
  const inputs = midi.inputs.values();
  for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
    midiIn.push(input.value);
  }

  // MIDI devices that you send data to.
  const outputs = midi.outputs.values();
  for (
    let output = outputs.next();
    output && !output.done;
    output = outputs.next()
  ) {
    midiOut.push(output.value);
  }

  startListening();
}

// Start listening to MIDI messages with event listeners - this will constantly listen for any changes
function startListening() {
  midiIn.forEach((input, index) => {
    input.addEventListener("midimessage", midiMessageReceived);
  });
}

// when a message is recieved from the MIDI do something
function midiMessageReceived(event, index) {
  // console.log(event.data[0], index)

  // codes for on/off are different on different devices and across different modes on a device - here's where you probably want to console log the event.data and change some values. For the AKAI LPD8 MKII in CC mode the following works

  const cmd = event.data[0];
  const note = event.data[1];
  const attack = event.data.length > 2 ? event.data[2] : 1;

  // You can use the timestamp to figure out the duration of each note.
  const timestamp = Date.now();


  // on the above device i want to decide whether its a Pot or Pad being used and do the following
  // if (cmd === POT) {
  //   console.log("pot", pitch, "value", value);
  //   pots[pitch].value = value;
  // } else {
  //   const pad = padLookup[pitch]
  //   if (cmd === NOTE_ON) pads[pad].velocity = value;
  //   pads[pad].down = cmd === NOTE_ON ? true : false;
  //   console.log("pad", pads[pad]);
  // }

  
  console.log(cmd, note, attack)
  updateKey(cmd, note, attack)
  // console.log(keys)
}

function updateKey(cmd, note, attack){
  const key = keys[note - START_NOTE];
  key.cmd = cmd === NOTE_ON ? 1 : 0;
  key.attack = cmd === NOTE_ON ? attack : 0;
}

// function updateAttack(cmd, attack) {
//   console.log("UPDATE ATTACK", cmd, attack, NOTE_ON)
//   if (cmd === NOTE_ON) {
//     return attack
//   } else {
//     return 0;
//   }
// }

function setup() {
  createCanvas(windowWidth, windowHeight);
  connect();
  noStroke();
  // blendMode(SCREEN);
}

function draw() {
  // clear();
  background(0,10);
  
  for(i=0; i<NUMBER_OF_NOTES; i++){
    let margin = 10;
    let gap = width/NUMBER_OF_NOTES;
    let x = gap*i + margin;
    let y = height/2
    let diameter = height/125 * keys[i].attack
    fill(map(keys[i].attack, 0, 90, 0, 255), 140)
    circle(x, y, diameter)
  }
}

// helper functions to map values from MIDI so useful canvas values
function findRotation(value) {
  return map(value, 0, 127, 0, PI / 2);
}
