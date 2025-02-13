let capture;
let mirrorButton;
let mirror = true;

let userEmojis = [];
let emojiGroups = [emojis, foodEmojis, animalEmojis, natureEmojis, cityEmojis, userEmojis];
let subset = emojiGroups[0];
let emojiInput;

let buttonLabels = ['⭕️🥳🧚‍♀️🥼🎈', '🍏🫐🥩🍭🍺', '🐶🦄🐥🐼🦋', '🌴🌕🌸☃️🐳', '🛳️🗻🏥🎆🚃'];
let buttons = [];
let startY = 130;
let spacing = 100;
let colors = ['#ffffff', '#fff7f9', '#fcfced', '#f7faff', '#f2f5f4', '#f7edfc'];

function setup() {
  background(255);

  createCanvas(48, 32);

  capture = createCapture(VIDEO);

  capture.size(48, 32);
  capture.hide();

  // mirrorButton = createButton('Toggle Mirror');
  // mirrorButton.position(10, 40);
  // mirrorButton.mousePressed(toggleMirror);

  for (let i = 0; i < buttonLabels.length; i++) {
    buttons[i] = createButton(buttonLabels[i]).addClass('theme-button');
    buttons[i].position(10, startY + i * spacing);
    buttons[i].mousePressed(function () {
      toggleEmojiGroup(i);
      changeBackgroundColor(colors[i]);
    });
  }
  instructionText1 = createP('Click buttons to see what will happen!');
  instructionText1.position(10, startY + 500);
  instructionText1.style('font-size', '14px');
  instructionText1.style('width', '200px');

  instructionText2 = createP(
    'Tip: Press "Fn + E" to open the emoji keyboard before typing:) Not all emojis are in the library, sorry. I hope you like this project, thx'
  );
  instructionText2.position(1250, startY + 80);
  instructionText2.style('font-size', '14px');
  emojiInput = createInput('').attribute('placeholder', 'Type your emojis here...');
  emojiInput.position(1300, startY + 230);
  // emojiInput.size(300, 50);

  let submitButton = createButton('Submit Emojis');
  submitButton.position(1300, startY + 250);
  submitButton.mousePressed(submitEmojis);
  // submitButton.style('font-size', '18px');

  instructionText3 = createP('Emojization - Developer: Ambra Liu -- show version');
  instructionText3.position(600, 10); // Position above the input box
  instructionText3.style('font-size', '14px');
}

function submitEmojis() {
  let inputText = emojiInput.value();
  console.log('Input Text:', inputText);
  const emojiRegex = /\p{Emoji}/gu;
  userEmojis = inputText.match(emojiRegex) || [];
  console.log('User Emojis:', userEmojis);
  emojiInput.value('');
  let newSubset = [];

  for (let emoji of userEmojis) {
    console.log('Checking Emoji:', emoji, 'Unicode:', emoji.codePointAt(0).toString(16));
    let emojiEntry = emojiLib.find((entry) => entry[3] === emoji);
    console.log('found', emojiEntry);
    if (emojiEntry) {
      newSubset.push(emojiEntry);
    } else {
      console.warn(`Emoji ${emoji} not found in the emoji library.`);
    }
  }

  // subset = newSubset.length > 0 ? newSubset : [];
  emojiGroups[5] = newSubset;
  // userEmojis = newSubset;
  // console.log('User Emojis Before Toggling:', userEmojis, subset);
  // console.log(emojiGroups)
  toggleEmojiGroup(5);
  changeBackgroundColor(colors[5]);
}

function changeBackgroundColor(color) {
  document.body.style.backgroundColor = color;
}

function draw() {
  if (mirror) {
    translate(width, 0);
    scale(-1, 1);
  }
  //if mode 1 = normal filter; if mode 2 (BW) = grayscale filter
  image(capture, 0, 0, width, height);
  capture.loadPixels();

  let faceData = getFaceData();

  if (faceData) {
    let pixels = capture.get(faceData.x, faceData.y, faceData.width, faceData.height);
    pixels.loadPixels();

    // var tempZoom = zoom*res/24;
    var frame = [];
    var src = pixels.pixels;

    for (var i = 0; i < src.length; i += 4) {
      // from https://jsperf.com/convert-rgba-to-grayscale
      // var pixel = (src[i] * 306 + src[i + 1] * 601 + src[i + 2] * 117) >> 10;
      var emoji = rgbDistance(src[i], src[i + 1], src[i + 2]);

      frame.push("<span style='color:rgb(" + src[i] + ',' + src[i + 1] + ',' + src[i + 2] + ")'>" + emoji + '</span>');
    }

    while (viewfinder.firstChild) {
      viewfinder.removeChild(viewfinder.firstChild);
    }
    for (var r = 0; r < pixels.height; r++) {
      var lineOfString = [];
      for (var c = 0; c < pixels.width; c++) {
        lineOfString.push(frame[r * pixels.width + c]);
      }
      if (mirror) {
        lineOfString = lineOfString.reverse();
      }

      var line = document.createElement('p');
      line.innerHTML = lineOfString.join('');
      viewfinder.appendChild(line);
    }
  }
}

function getFaceData() {
  return {
    x: 0,
    y: 0,
    width: 48,
    height: 32,
  };
}

function toggleMirror() {
  mirror = !mirror;
}

function rgbDistance(r, g, b) {
  let closestDist = 9999;
  let closestEmoji;

  for (let i = 0; i < subset.length; i++) {
    //target = subset(i) rgb

    let redTarget = subset[i][0];
    let greenTarget = subset[i][1];
    let blueTarget = subset[i][2];

    let distance = Math.sqrt(Math.pow(redTarget - r, 2) + Math.pow(greenTarget - g, 2) + Math.pow(blueTarget - b, 2));
    if (distance < closestDist) {
      closestDist = distance;
      closestEmoji = subset[i][3];
    }
  }
  return closestEmoji;
}

function CompDistance(r, g, b) {
  let closestDist = 9999;
  let closestEmoji;

  for (let i = 0; i < subset.length; i++) {
    //target = subset(i) rgb

    let redTarget = 255 - subset[i][0];
    let greenTarget = 255 - subset[i][1];
    let blueTarget = 255 - subset[i][2];

    let distance = Math.sqrt(Math.pow(redTarget - r, 2) + Math.pow(greenTarget - g, 2) + Math.pow(blueTarget - b, 2));
    if (distance < closestDist) {
      closestDist = distance;
      closestEmoji = subset[i][3];
    }
  }
  return closestEmoji;
}

function toggleEmojiGroup(groupNum) {
  subset = emojiGroups[groupNum];
}

// function closestToRed(emoji1RGB, emoji2RGB) {
//   let dist1 = redDistance(emoji1RGB.r, emoji1RGB.g, emoji1RGB.b);
//   let dist2 = redDistance(emoji2RGB.r, emoji2RGB.g, emoji2RGB.b);

//   if (dist1 < dist2) {
//     return 'Emoji 1 is closer to red';
//   } else if (dist2 < dist1) {
//     return 'Emoji 2 is closer to red';
//   } else {
//     return 'Both emojis are equally close to red';
//   }
// }

// let emoji1RGB = {r: 215, g: 235, b: 107};  // Emoji 1 RGB "🍈"
// let emoji2RGB = {r: 111, g: 65, b: 24};  // Emoji 2 RGB "🍒"

// let result = closestToRed(emoji1RGB, emoji2RGB);

//   console.log(result);
