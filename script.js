/**
 * velivole.fr/meteo.guru Basic Thermodynamics Equations for Soaring Flight
 *
 * Copyright © 2022 Momtchil Momtchev <momtchil@momtchev.com>
 *
 * Licensed under the LGPL License, Version 3.0 (the "License")
 * You may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.gnu.org/licenses/lgpl-3.0.en.html
 *
 * All methods use:
 *
 * Pressure in hPa
 *
 * Temperature in °C
 *
 * Height in meters
 *
 * Relative humidity in % from 0 to 100
 *
 * Specific humidity in g/kg
 *
 * Mixing ratio in g/kg
 */
// * Global variables

let relHum;
let airPressure;
let temp;
let height;
let cloudBase;

// * Element selectors
const relHumInput = document.querySelector('#relHum'); 
const airPressureInput = document.querySelector('#pressure');
const tempInput = document.querySelector('#temp');
const heightInput = document.querySelector('#height');
const allInputs = document.querySelectorAll('input');

const cbParagraph = document.querySelector('.output-paragraph');

// * Velitherm utils
const velitherm = {
  gamma: 0.00976,
  K: -273.15,
  waterVaporSaturationPressure: function (temp) {
    return 6.1078 * Math.exp(17.27 * temp / (temp + 237.3));
  },
  specificHumidity: function (relativeHumidity = 50, pressure = 1013, temp = 15) {
    return relativeHumidity / 100 * (0.622 * velitherm.waterVaporSaturationPressure(temp) / pressure) * 1000;
  },
  pressureFromAltitude: function (height, pressure0, temp) {
    return Math.round(pressure0 * Math.pow(1.0 - 0.0065 * height / (temp - velitherm.K + 0.0065 * height), 5.257));
  },
  relativeHumidity: function (specificHumidity, pressure, temp) {
    return specificHumidity / (6.22 * velitherm.waterVaporSaturationPressure(temp) / pressure);
  },
  tempDropWithRising: function (temp, heightDif) {
    return temp - heightDif * velitherm.gamma;
  },
}

// * Input handlers
function handleInputInInputs(relHum = 50, airPressure = 1013, temp = 15, height = 0) {
  let specHum = velitherm.specificHumidity(relHum, airPressure, temp);

  // TODO: Make the for loop work for every height with the exit condition of 100% relHum
  for (let i = height + 1;; i++) {
    let relHumAtAlt; 
    let pressureAtAlt = velitherm.pressureFromAltitude(i, airPressure, temp);
    let adiabaticCooling = velitherm.tempDropWithRising(temp, i);
    relHumAtAlt = velitherm.relativeHumidity(specHum, pressureAtAlt, adiabaticCooling); /*(adiabaticCooling - temp) / 2)*/
    if (relHumAtAlt > 100) {
      break;
    } else {
      cloudBase = i;
    }
  }
  updateTextContent();
}

// * Update answer to all questions... the cloudbase height:
function updateTextContent() {
  if (!isNaN(cloudBase)) {
    cbParagraph.innerHTML = `The height of cloudbase is ${parseInt(cloudBase)}`;
  }
}

// * Event listener(s)

relHumInput.addEventListener('input', e => {
  relHum = parseInt(relHumInput.value);
  handleInputInInputs(relHum, airPressure, temp, height);
});
airPressureInput.addEventListener('input', e => {
  airPressure = parseInt(airPressureInput.value);
  handleInputInInputs(relHum, airPressure, temp, height);
});

tempInput.addEventListener('input', e => {
  temp = parseInt(tempInput.value);
  handleInputInInputs(relHum, airPressure, temp, height);
});

heightInput.addEventListener('input', e => {
  height = parseInt(heightInput.value);
  handleInputInInputs(relHum, airPressure, temp, height);
});
