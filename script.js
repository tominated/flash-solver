const form = document.querySelector('form');
const fieldGuideNumber = document.querySelector('#field-guide-number');
const fieldIso = document.querySelector('#field-iso');
const fieldExposureCompensation = document.querySelector('#field-exposure-compensation');
const fieldAperture = document.querySelector('#field-aperture');
const fieldFlashStrength = document.querySelector('#field-flash-strength');
const fieldDistance = document.querySelector('#field-distance');

const valueExposureCompensation = document.querySelector('#value-exposure-compensation');
const valueAperture = document.querySelector('#value-aperture');
const valueFlashStrength = document.querySelector('#value-flash-strength');
const valueDistance = document.querySelector('#value-distance');

form.addEventListener('submit', (e) => {
  e.preventDefault();
})


function apertureToFstop(n) {
  const unrounded = Math.pow(Math.sqrt(2), n)
  return Math.round(unrounded * 10) / 10;
}

function fstopToAperture(f) {
  const unrounded = Math.log(f) / Math.log(Math.sqrt(2));
  return Math.round(unrounded * 2) / 2;
}

function updateUI() {
  const guideNumber = parseInt(fieldGuideNumber.value, 10);
  const exposureCompensation = parseFloat(fieldExposureCompensation.value);
  const flashStrength = parseInt(fieldFlashStrength.value);
  const distance = parseFloat(fieldDistance.value);
  const aperture = fstopToAperture(guideNumber / distance);

  const adjustedAperture = aperture + flashStrength - exposureCompensation;

  fieldAperture.value = adjustedAperture;
  valueAperture.textContent = apertureToFstop(fieldAperture.value);
  
  valueExposureCompensation.textContent = (exposureCompensation > 0 ? '+' : '') + exposureCompensation;
  valueFlashStrength.textContent = Math.pow(2, Math.abs(flashStrength));
  valueDistance.textContent = fieldDistance.value;
}

form.addEventListener('input', () => {
  updateUI();
})

updateUI();

/**
 * useful info:
 * 
 * https://photo.stackexchange.com/questions/50681/why-are-f-stops-not-linear
 * https://www.scantips.com/lights/math.html
 * https://www.scantips.com/lights/flashbasics1c.html
 */
