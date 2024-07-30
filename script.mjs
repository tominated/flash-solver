import 'https://cdn.skypack.dev/preact/debug';
import { h, render } from 'https://cdn.skypack.dev/preact';
import {
  useId,
  useState,
} from 'https://cdn.skypack.dev/preact/hooks';

function range(start, upTo, step, mapper = (x) => x) {
  const result = [];
  for (let n = start, i = 0; n <= upTo; n += step, i++) result.push(mapper(n, i));
  return result;
}

function findClosestIndex(value, list) {
  let index = 0
  let current = typeof list[index] === 'object' ? list[index].value : list[index];
  
  apertureValues.forEach((x, i) => {
    const xValue = typeof x === 'object' ? x.value : x
    if (Math.abs(value - xValue) < Math.abs(value - current)) {
      index = i
      current = xValue;
    }
  })
  
  return index
}

function classnames(...vals) {
  const acc = [];

  vals.forEach(val => {
    if (typeof val === "string") {
      acc.push(val);
      return;
    }

    if (Array.isArray(val)) {
      for (className of val) {
        if (className) acc.push(className);
      }
    }

    if (typeof val === 'object') {
      Object.entries(val).forEach(([className, predicate]) => {
        if (predicate) acc.push(className);
      });
    }
  })
  
  return acc.join(' ');
}

const expCompValues = range(-2, 2, 0.5, (value) => ({
  value,
  label: value > 0 ? '+' + value : value,
}));

const apertureValues = [
  1, 1.2, 1.4, 1.7, 2, 2.4, 2.8, 3.3, 4, 4.8, 5.6, 6.7, 8, 9.5, 11, 13, 16, 19, 22,
].map((value, i) => ({
  value,
  label: i % 2 === 0 ? value : undefined,
}));

const flashPowerValues = range(-6, 0, 1, (value) => ({
  value,
  label: Math.pow(2, Math.abs(value)),
}));

const distanceValues = range(0.5, 10, 0.5, (value) => ({
  value,
  label: value % 1 === 0 ? value : undefined,
}));

function SegmentedSlider({
  title,
  values,
  renderValue,
  currentIndex,
  onChangeIndex,
  isActive = false,
}) {
  const id = useId();
  const datalistId = useId();
  const currentValue = values[currentIndex];
  const handleInput = (e) => onChangeIndex(parseInt(e.target.value, 10));

  const datalistOptions = values.map((value, i) =>
    h('option', { key: i, value: i }, typeof value === 'object' ? value.label : value)
  );

  return h('div', { class: classnames('form-control', { isActive }) }, [
    h('div', { class: 'label-row' }, [
      h('label', { for: id }, title),

      h('div', { class: 'label-row-value' }, renderValue(currentValue)),
    ]),

    h('div', { class: 'labeled-range-slider' }, [
      h('input', {
        type: 'range',
        id,
        list: datalistId,
        disabled: isActive,
        min: 0,
        max: values.length - 1,
        step: 1,
        value: currentIndex,
        onInput: handleInput,
        "aria-valuetext": renderValue(currentValue)
      }),

      h('datalist', { id: datalistId }, datalistOptions),
    ]),
  ]);
}

const isoValues = range(-1, 5, 1, value => ({
  value,
  label: 100 * Math.pow(2, value),
})) 

function Setup({ guideNumber, iso, onChangeGuideNumber, onChangeIso }) {
  const guideNumberId = useId();
  const isoId = useId();

  const isoOptions = isoValues.map(({ value, label }) =>
    h('option', { key: value, value }, label)
  );

  return h('div', { class: 'form-control form-control-grid' }, [
    h('div', null, [
      h('label', { for: guideNumberId }, 'Guide Number'),

      h('input', {
        type: 'number',
        id: guideNumberId,
        value: guideNumber,
        onInput: (e) => onChangeGuideNumber(e.target.value),
      }),
    ]),

    h('div', null, [
      h('label', { for: isoId }, 'ISO'),

      h('select', {
        id: isoId,
        value: iso,
        onChange: (e) => onChangeIso(e.target.value),
      }, isoOptions),
    ])
  ]);
}

const modes = [
  { value: 'aperture', label: 'Aperture' },
  { value: 'distance', label: 'Distance' },
]

function ModeRadio({ mode, isActive = false, onChangeMode }) {
  const id = useId();
  return h('li', null, [
    h('input', {
      type: 'radio',
      id,
      value: mode.value,
      checked: isActive,
      onClick: () => onChangeMode(mode.value)
    }),

    h('label', { for: id }, mode.label),
  ]);
}

function ModeSwitcher({ currentMode, onChangeMode }) {
  return h('div', { class: 'form-control' }, [
    h('div', { class: 'label-row' }, h('label', null, 'Solve For:')),

    h('ul', { class: 'segmented-control' }, modes.map(mode =>
      h(ModeRadio, {
        mode,
        isActive: currentMode === mode.value,
        onChangeMode,
      })
    ))
  ]);
}

function apertureToStops(f) {
  return Math.log10(f) / Math.log10(Math.SQRT2)
}

function stopsToAperture(stops) {
  return Math.pow(Math.SQRT2, stops);
}

function fNumber(f, stops) {
  return stopsToAperture(apertureToStops(f) + stops);
}

function App() {
  const [mode, setMode] = useState(modes[0].value);
  const [rawGuideNumber, setGuideNumber] = useState(20);
  const [rawIso, setIso] = useState(0);
  const [expCompIdx, setExpCompIdx] = useState(4);
  const [apertureIdx, setApertureIdx] = useState(10);
  const [flashPowerIdx, setFlashPowerIdx] = useState(6);
  const [distanceIdx, setDistanceIdx] = useState(4);

  const guideNumber = parseInt(rawGuideNumber, 10) || 20;
  const iso = parseInt(rawIso, 10) || 0;
  const expComp = expCompValues[expCompIdx];
  const aperture = apertureValues[apertureIdx];
  const flashPower = flashPowerValues[flashPowerIdx];
  const distance = distanceValues[distanceIdx];

  // These will get updated by the solver where necessary
  const solvedIndexes = {
    apertureIdx,
    distanceIdx,
  }

  const stops = flashPower.value + iso - expComp.value;

  if (mode === 'aperture') {
    const desiredAperture = fNumber(guideNumber / distance.value, stops);
    solvedIndexes.apertureIdx = findClosestIndex(desiredAperture, apertureValues);
  } else if (mode === 'distance') {
    const desiredDistance = guideNumber / fNumber(aperture.value, -stops);
    solvedIndexes.distanceIdx = findClosestIndex(desiredDistance, distanceValues);
  }

  return h('div', null, [
    h(Setup, {
      guideNumber: rawGuideNumber,
      iso: rawIso,
      onChangeGuideNumber: setGuideNumber,
      onChangeIso: setIso,
    }),

    h(SegmentedSlider, {
      title: 'Exposure Compensation',
      values: expCompValues,
      renderValue: ({ label }) => `${label || '±0'} EV`,
      currentIndex: expCompIdx,
      onChangeIndex: setExpCompIdx,
    }),

    h(SegmentedSlider, {
      title: 'Flash Power',
      values: flashPowerValues,
      renderValue: ({ label }) => `1/${label}`,
      currentIndex: flashPowerIdx,
      onChangeIndex: setFlashPowerIdx,
    }),

    h(ModeSwitcher, {
      currentMode: mode,
      onChangeMode: setMode,
    }),

    h(SegmentedSlider, {
      title: 'Aperture',
      values: apertureValues,
      renderValue: ({ value }) => `ƒ/ ${value}`,
      currentIndex: solvedIndexes.apertureIdx,
      onChangeIndex: setApertureIdx,
      isActive: mode === 'aperture',
    }),

    h(SegmentedSlider, {
      title: 'Distance',
      values: distanceValues,
      renderValue: ({ value }) => `${value}m`,
      currentIndex: solvedIndexes.distanceIdx,
      onChangeIndex: setDistanceIdx,
      isActive: mode === 'distance',
    }),
  ]);
}

render(h(App), document.getElementById('app'));
