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

function range(start, upTo, step, mapper = (x) => x) {
  const result = [];
  for (let n = start, i = 0; n <= upTo; n += step, i++) result.push(mapper(n, i));
  return result;
}

const exposureCompensationValues = range(-2, 2, 0.5, value => ({
  value,
  label: value > 0 ? "+" + value : value,
}));

const apertureValues = [1, 1.2, 1.4, 1.7, 2, 2.4, 2.8, 3.3, 4, 4.8, 5.6, 6.7, 8, 9.5, 11, 13, 16, 19, 22].map((value, i) => ({
  value,
  label: i % 2 === 0 ? value : undefined
}));

const flashStrengthValues = range(-6, 0, 1, value => ({
  value,
  label: Math.pow(2, Math.abs(value))
}));

const distanceValues = range(0, 10, 0.5, value => ({
  value,
  label: value % 1 === 0 ? value : undefined
}));

function findClosestAperture(value) {
  let index = 0
  let current = apertureValues[index].value;
  
  apertureValues.forEach((x, i) => {
    if (Math.abs(value - x.value) < Math.abs(value - current)) {
      index = i
      current = x.value;
    }
  })
  
  return index
}

function initSlider(field, values, startIndex = 0) {
  const datalist = document.createElement('datalist');
  datalist.id = field.id + "-datalist";

  values.forEach((value, i) => {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = typeof value === 'object' ? value.label : value
    datalist.appendChild(option);
  });

  field.parentElement.insertBefore(datalist, field.nextSibling);
  field.setAttribute('list', datalist.id);
  field.setAttribute('min', '0');
  field.setAttribute('max', (values.length - 1).toString());
  field.setAttribute('step', '1');
  field.setAttribute('value', startIndex.toString());

  function getIndex() {
    return parseInt(field.value, 10);
  }

  function getValue() {
    const entry = values[getIndex()];
    return typeof entry === 'object' ? entry.value : entry;
  }

  function getLabel() {
    const entry = values[getIndex()];
    return entry.label || entry.value;
  }
  
  return {getIndex, getValue, getLabel}
}

const guideNumber = { getValue: () => parseInt(fieldGuideNumber.value, 10)};
const iso = { getValue: () => parseInt(fieldIso.value, 10) };

const exposureCompensation = initSlider(fieldExposureCompensation, exposureCompensationValues, 4);
const aperture = initSlider(fieldAperture, apertureValues, 10);
const flashStrength = initSlider(fieldFlashStrength, flashStrengthValues, 4);
const distance = initSlider(fieldDistance, distanceValues, 2);

function updateUI() {
  const apertureIndex = findClosestAperture(guideNumber.getValue() / distance.getValue());
  const indexAdjustment = (flashStrength.getValue() * 2) - (exposureCompensation.getValue() * 2);
  const compensatedIndex = Math.max(0, Math.min(apertureIndex + indexAdjustment, apertureValues.length - 1));

  fieldAperture.value = compensatedIndex;
  valueAperture.textContent = apertureValues[compensatedIndex].value;
  
  valueExposureCompensation.textContent = exposureCompensation.getLabel();
  valueFlashStrength.textContent = Math.pow(2, Math.abs(flashStrength.getValue()));
  valueDistance.textContent = distance.getLabel();
}

form.addEventListener('input', updateUI)

updateUI();
