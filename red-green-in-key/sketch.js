const START_NOTE = 21;
const TOP_NOTE = 108;
const NUMBER_OF_NOTES = 88;
const NOTE_ON = 144;
const NOTE_OFF = 128;
const OCTAVES = [24, 36, 48, 60, 72, 84, 96];
const IN_KEY = [0, 2, 4, 5, 7, 9, 11];
const START_TIME = Date.now();
// const POT = 176;
const keys = [];
// set up the keys
for (let i = 0; i < 88; i++) {
  const key = {
    cmd: 0,
    note: i + START_NOTE,
    attack: 0,
    onTime: 0,
    duration: 0,
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
  // console.log(event.data, index);

  // codes for on/off are different on different devices and across different modes on a device - here's where you probably want to console log the event.data and change some values. For the AKAI LPD8 MKII in CC mode the following works
  const cmd = event.data[0];
  const note = event.data[1];
  const attack = event.data.length > 2 ? event.data[2] : 1;

  // You can use the timestamp to figure out the duration of each note.
  const timestamp = Date.now() - START_TIME;

  // console.log(cmd, note, attack)
  updateKey(cmd, note, attack, timestamp);
  // console.log(keys);
  findColour(note);
}

function updateKey(cmd, note, attack, timestamp) {
  const key = keys[note - START_NOTE];
  const prevOnTime = key.onTime;

  key.cmd = cmd === NOTE_ON ? 1 : 0;
  key.attack = cmd === NOTE_ON ? attack : 0;
  key.onTime = cmd === NOTE_ON ? timestamp : 0;
  key.duration = cmd === NOTE_OFF ? timestamp - prevOnTime : 0;

  console.log(key);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  connect();
  noStroke();
  blendMode(SCREEN);
}

function draw() {
  clear();
  background(0);

  for (i = 0; i < NUMBER_OF_NOTES; i++) {
    let margin = 10;
    let gap = width / NUMBER_OF_NOTES;
    let x = gap * i + margin;
    let y = height / 2;
    let diameter = (height / 125) * keys[i].attack;
    // fill(map(keys[i].attack, 0, 90, 0, 255), 140);
    fill(findColour(keys[i].note, keys[i].attack));
    circle(x, y, diameter);
    // findColour(keys[i].note)
  }
}

function findColour(note, attack) {
  //   OCTAVES.forEach((octave) => {

  //   })
  const octave = Math.floor((note - START_NOTE - 3) / 12) + 1;
  const remainder = (note - START_NOTE - 3) % 12;
  // console.log(octave, IN_KEY.some((value) => value === remainder));
  const isInKey = IN_KEY.some((value) => value === remainder);
  const depth = map(octave, 0, 8, 40, 255);
  const opacity = map(attack, 0, 125, 0, 255);
  return isInKey ? [0, depth, 0, opacity] : [depth, 0, 0, opacity];
}

// helper functions to map values from MIDI so useful canvas values
function findRotation(value) {
  return map(value, 0, 127, 0, PI / 2);
}
