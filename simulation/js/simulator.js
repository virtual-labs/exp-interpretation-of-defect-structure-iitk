var text;
const typeSpeed = 60;

var matSelected = 1;
var timerId,
    typeTarget = $("#typer"),
    tWrapper = $("#toast-wrapper"),
    ti = 0,
    currentStep = 0,
    contrast = 0,
    brightness = 0,
    vac = 0,
    av = 0,
    on = false,
    dropped = false,
    imgs = [],
    mode = 1,
    removeButtonclicked = false,
    inp = 0;

let isImageYDropped = false; // Flag to track if image-y has been dropped

// typing function
function type(txt, cur = 0) {
    if (cur == txt.length) {
        timerId = -1;
        return;
    }
    if (cur == 0) {
        typeTarget.html("");
        clearTimeout(timerId);
    }
    typeTarget.append(txt.charAt(cur));
    timerId = setTimeout(type, typeSpeed, txt, cur + 1);
}

// text to speech function
// text to speech function (updated)
function textToSpeech(text) {
    // Stop any ongoing speech immediately
    window.speechSynthesis.cancel();

    var available_voices = window.speechSynthesis.getVoices();
    var english_voice = '';
    
    for (var i = 0; i < available_voices.length; i++) {
        if (available_voices[i].lang.startsWith("en") && available_voices[i].name.includes("Female")) {
            english_voice = available_voices[i];
            break;
        }
    }
    if (english_voice === '') english_voice = available_voices[0];

    var utter = new SpeechSynthesisUtterance(text);

    utter.rate = 1.1;
    utter.pitch = 0.9;
    utter.voice = english_voice;

    window.speechSynthesis.speak(utter);
}

if (window.speechSynthesis.getVoices().length == 0) {
    window.speechSynthesis.addEventListener('voiceschanged', function () {
        textToSpeech(text);
    });
}
// text to speech fxn end

// switch on
function toggleSwitch(toggleElement) {
    if (toggleElement.checked) {
        // Switch is ON, trigger strt()
        strt();
    } else {
        // Switch is OFF, reload the page
        location.reload();
    }
}

function strt() {
    $('#removeButton').prop("disabled", false);

    showToast("Remove the sample holder");
    type("Now remove the holder, drag and drop the material, and place it into the machine.");
    textToSpeech("Now remove the holder, drag and drop the material, and place it into the machine.");
}

// toast message function (suppressed visually)
function showToast(msg, type = 0) {
    // Toast disabled — but flow continues
    console.log("Toast suppressed:", msg);
}

$(function () {
    type("Welcome to Observation and interpretation of defect structure in cold rolled aluminium, copper and zinc using TEM. Get started by switching on the machine.");
    textToSpeech("Welcome to Observation and interpretation of defect structure in cold rolled aluminium, copper and zinc using T E M. Get started by switching on the machine.");

    var vhandle = $("#vslider").find(".custom-handle");
    var avhandle = $("#avslider").find(".custom-handle");
    var mhandle = $("#mslider").find(".custom-handle");

    // Vacuum slider
    $("#vslider").slider({
        min: 0,
        max: 2,
        disabled: true,
        create: function () {
            vhandle.text("Off");
        },
        slide: function (event, ui) {
            var txt = "Off";
            switch (ui.value) {
                case 0:
                    txt = "Off";
                    break;
                case 1:
                    txt = "LV";
                    break;
                case 2:
                    txt = "HV";
                    break;
            }
            vhandle.text(txt);
        }
    });

    //  acc voltage slider
  $("#avslider").slider({
    min: 100,
    max: 102,
    value: 100,
    animate: "slow",
    disabled: true,
    create: function () {
        avhandle.text("100");
        av = "100";
    },
    slide: function (event, ui) {
        if (ui.value == 100) {
            avhandle.text("100");
            av = "100";
        }
        if (ui.value == 101) {
            avhandle.text("120");
            av = "120";
        }
        if (ui.value == 102) {
            avhandle.text("200");
            av = "200";
        }
    }
});


    // magnification slider
    $("#mslider").slider({
        min: 0,
        max: 3,
        disabled: true,
        create: function () {
            mhandle.text("0");
        },
        slide: function (event, ui) {
            var txt = "0";
            switch (ui.value) {
                case 0:
                    txt = "0";
                    mag = '0';
                    break;
                case 1:
                    txt = "L";
                    mag = 'L';
                    break;
                case 2:
                    txt = "H";
                    mag = 'H';
                    break;
                case 3:
                    txt = "VH";
                    mag = 'VH';
                    break;
            }
            mhandle.text(txt);
        }
    });

    // beam on
    $("#on").one("click", function () {
        $('#on').css('backgroundColor', '#21e76e');
        // beam comes here
        clearInterval(beamTimer);
        clearInterval(beamTimer2);
        beamy = 0;
        ctx.clearRect(0, 0, beamCanvas.width, beamCanvas.height);
        ctx2.clearRect(0, 0, beam2W, beam2H);
        beamTimer = beamTimer2 = -1;
        beamTimer = setInterval(drawBeam, 10);
        // beam ends
    });

    // Vacuum
    $("#setvac").click(function () {
        type("Now set the accelerating voltage.");
        textToSpeech("Now set the accelerating voltage.");

        $("#setav").prop("disabled", false);
        $("#avslider").slider("option", "disabled", false);
        showToast("Vacuum set");
        $("#vacImg").animate({
            fontSize: 220
        }, {
            step: function (now, fx) {
                $(this).css('clip', `rect(${Math.round(now)}px, 17rem, 300px, 0)`);
            },
            duration: 2500,
            easing: 'linear'
        });

        $("#removeButton").prop("disabled", true);
        $("#insertButton").prop("disabled", true);
    });

    // acc voltage
// acc voltage
$("#setav").click(function () {

    av = $("#avslider").slider("option", "value");
    type("Now switch on the beam.");
    textToSpeech("Try to switch on the beam now.");

    // Disable AV controls completely
    $("#setav").prop("disabled", true);
    $("#avslider").slider("disable");

    // Enable next step
    $("#on").prop("disabled", false);
    $("#setvac").prop("disabled", true);
    $("#vslider").slider("option", "disabled", true);

    showToast("Switch on the beam");
});


    // magnification
 $("#setmag").click(function () {

    showToast("Magnification set");
    type("Now you can see the output image.");
    textToSpeech("Now you can see the output image.");

    $("#setmag").prop("disabled", true);
    $("#mslider").slider("disable");
    $("#position").prop("disabled", true);
    $("#on").prop("disabled", true);

    // Hide all first
    $("#outImage1").hide();
    $("#outImage2").hide();
    $("#outImage3").hide();

    // Show image based on material
    if(item === "ceramic") {
        $("#outImage1").show(500); // Copper
    }
    else if(item === "zebrafish") {
        $("#outImage2").show(500); // Aluminium
    }
    else if(item === "metal") {
        $("#outImage3").show(500); // Zinc
    }
});


    // remove holder
    $("#removeButton").click(function () {
        removeButtonclicked = true;
        $("#insertButton").prop("disabled", false);
        showToast("Insert the material");
        type("Drag and drop the sample onto the holder, then click Insert.");
        textToSpeech("Drag and drop the sample onto the holder, then click Insert.");
    });

    // insert holder
    $("#insertButton").click(function () {

        if (isImageYDropped == true) {
            // Correct flow: sample already added, now insert & move to vacuum
            showToast("Set Vacuum");
            type("Now set the vacuum.");
            textToSpeech("Now set the vacuum.");

            setTimeout(function () {
                $("#part11").css('visibility', 'visible');
            }, 1500);
            $("#vslider").slider("option", "disabled", false);
            $("#setvac").prop("disabled", false);
        } else {
            // User forgot to drop sample
            showToast("Please drag and drop sample before proceeding.", 1);
            type("Please drag and drop the sample on the holder before inserting it.");
            textToSpeech("Please drag and drop the sample on the holder before inserting it.");
        }

    });
});

// imaging mode selection
function change() {
    showToast("Set Magnification");
    type("Set the magnification to view the image clearly.");
    textToSpeech("Set the magnification to view the image clearly.");
    $("#setmag").prop("disabled", false);
    $("#mslider").slider("option", "disabled", false);
}
// imaging mode selection code end

// beam code start 
var beamCanvas = document.getElementById("beam");
var ctx = beamCanvas.getContext('2d');
var beamy = 0,
    beamx = parseInt(beamCanvas.width / 2),
    beamWidth, beamTimer = -1;
var beamCanvas2 = document.getElementById("beam2");
var ctx2 = beamCanvas2.getContext('2d');
var beam2H = beamCanvas2.height,
    beam2W = beamCanvas2.width,
    beamx2 = parseInt(beamCanvas2.width / 2),
    beamTimer2 = -1;

function randEx(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function drawBeam() {
    ctx.beginPath();

    beamWidth = Math.sin(beamy * 3.14 / 160) * 7;
    ctx.shadowBlur = 1;
    ctx.shadowColor = 'red';
    ctx.strokeStyle = "green";
    ctx.shadowOffsetY = 0;
    ctx.shadowOffsetX = beamWidth;
    ctx.moveTo(beamx, beamy);
    ctx.lineTo(beamx + 1, beamy);
    ctx.stroke();

    ctx.shadowOffsetX = -beamWidth / 2;
    ctx.moveTo(beamx, beamy);
    ctx.lineTo(beamx + 1, beamy);
    ctx.stroke();

    ctx.shadowOffsetX = beamWidth / 2;
    ctx.moveTo(beamx, beamy);
    ctx.lineTo(beamx + 1, beamy);
    ctx.stroke();

    ctx.shadowOffsetX = -beamWidth;
    ctx.moveTo(beamx, beamy);
    beamy += 1;
    ctx.lineTo(beamx, beamy);
    ctx.stroke();
    if (beamy >= beamCanvas.height) {
        clearInterval(beamTimer);
        beamTimer = -1;
        beamTimer2 = setInterval(drawBeam2, 100);

        $('#position').prop("disabled", false);
        type("Set the imaging mode and magnification.");
        showToast("Set imaging mode");

        if (item == "zebrafish") {
            $('#outImage2').hide();
            $('#outImage3').hide();
            $('#outImage1').show(500);
            showToast("Image 1 Generated successfully", 2);
        } else if (item == "metal") {
            $('#outImage1').hide();
            $('#outImage3').hide();
            $('#outImage2').show(500);
            showToast("Image 2 Generated successfully", 2);
        }
        else if (item == "ceramic") {
            $('#outImage1').hide();
            $('#outImage2').hide();
            $('#outImage3').show(500);
            showToast("Image 3 Generated successfully", 2);
        }
    }
}

function drawBeam2() {
    ctx2.beginPath();
    ctx2.clearRect(0, 0, beam2W, beam2H);
    ctx2.strokeStyle = "#FFFFFFBB";
    ctx2.moveTo(beamx2, 23);
    ctx2.lineTo(beamx2 + 60 + randEx(-5, 5), randEx(-10, 5));
    ctx2.moveTo(beamx2 - 6, 23);
    ctx2.lineTo(beamx2 + 60 + randEx(-5, 5), randEx(-10, 5));
    ctx2.stroke();
}
// beam code end

// sample and holder move
const imageX = document.getElementById("image-x");
const imageY = document.getElementById("image-y");
const imageA = document.getElementById("image-a");
const imageB = document.getElementById("image-b");

const removeButton = document.getElementById("removeButton");
const insertButton = document.getElementById("insertButton");

removeButton.addEventListener("click", () => {
    imageX.style.transform = "translateX(-100%)"; // Move image X from right to left
});

imageY.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", "dragging-y"); // Allow image Y to be draggable
});

imageA.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", "dragging-a"); // Allow image A to be draggable
});

imageB.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", "dragging-b"); // Allow image B to be draggable
});

imageX.addEventListener("dragover", (e) => {
    e.preventDefault();
});

imageX.addEventListener("drop", (e) => {
    e.preventDefault();
    const draggedItem = e.dataTransfer.getData("text/plain");

    if (draggedItem === "dragging-y" && isImageYDropped === false && removeButtonclicked == true) {
        imageY.style.visibility = "hidden";
        isImageYDropped = true; // Set the flag when image-y is dropped
        item = "zebrafish";
        imageX.src = "../images/parts/sh1.png"; // Replace image X with image Z when any image is dropped onto it
        $("#insertButton").prop("disabled", false);
    }
    else if (draggedItem === "dragging-a" && isImageYDropped === false && removeButtonclicked == true) {
        imageA.style.visibility = "hidden";
        isImageYDropped = true; // Set the flag when image-a is dropped
        item = "metal";
        imageX.src = "../images/parts/sh2.png"; // Replace image X with image Z when any image is dropped onto it
        $("#insertButton").prop("disabled", false);
    }
    else if (draggedItem === "dragging-b" && isImageYDropped === false && removeButtonclicked == true) {
        imageB.style.visibility = "hidden";
        isImageYDropped = true; // Set the flag when image-b is dropped
        item = "ceramic";
        imageX.src = "../images/parts/sh3.png"; // Replace image X with image Z when any image is dropped onto it
        $("#insertButton").prop("disabled", false);
    }
    else {
        showToast("Please follow the instructions", 1);
        type("Please follow the correct order: remove the holder, then drag and drop the sample, then click Insert.");
        textToSpeech("Please follow the correct order: remove the holder, then drag and drop the sample, then click Insert.");
    }
});

insertButton.addEventListener("click", () => {
    // visual movement is handled in the jQuery click as logical step
    imageX.style.transform = "translateX(0%)"; // Move image X back to its original position (if needed visually)
});
