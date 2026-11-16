// Epoxy Resin & River Table Calculator Logic
const state = {
  shape: "rectangle", // "rectangle", "river", "round"
  length: 48,
  width: 8,
  diameter: 24,
  depth: 1.5,
  mixRatio: "2:1", // "2:1" or "1:1"
  wasteBuffer: true // +10%
};

function init() {
  attachEventListeners();
  calculate();
}

function attachEventListeners() {
  // Shape Radio Labels
  const shapeLabels = [
    { el: document.getElementById("shapeRectLabel"), val: "rectangle" },
    { el: document.getElementById("shapeRiverLabel"), val: "river" },
    { el: document.getElementById("shapeRoundLabel"), val: "round" }
  ];

  shapeLabels.forEach(item => {
    item.el.addEventListener("click", () => {
      shapeLabels.forEach(s => s.el.classList.remove("active"));
      item.el.classList.add("active");
      state.shape = item.val;
      updateShapeUI();
      calculate();
    });
  });

  // Ratio Radio Labels
  const ratio21 = document.getElementById("ratio21Label");
  const ratio11 = document.getElementById("ratio11Label");
  const ratioTip = document.getElementById("ratioTip");

  ratio21.addEventListener("click", () => {
    ratio21.classList.add("active");
    ratio11.classList.remove("active");
    state.mixRatio = "2:1";
    ratioTip.textContent = "Recommended for deep pours > 0.5\" thick (slower cure, zero overheating).";
    calculate();
  });

  ratio11.addEventListener("click", () => {
    ratio11.classList.add("active");
    ratio21.classList.remove("active");
    state.mixRatio = "1:1";
    ratioTip.textContent = "Recommended for thin surface coatings and seals < 0.25\" thick.";
    calculate();
  });

  // Inputs
  const lengthInput = document.getElementById("inputLength");
  const widthInput = document.getElementById("inputWidth");
  const diameterInput = document.getElementById("inputDiameter");
  const depthInput = document.getElementById("inputDepth");
  const bufferInput = document.getElementById("wasteBuffer");

  lengthInput.addEventListener("input", (e) => {
    state.length = parseFloat(e.target.value) || 0;
    calculate();
  });

  widthInput.addEventListener("input", (e) => {
    state.width = parseFloat(e.target.value) || 0;
    calculate();
  });

  diameterInput.addEventListener("input", (e) => {
    state.diameter = parseFloat(e.target.value) || 0;
    calculate();
  });

  depthInput.addEventListener("input", (e) => {
    state.depth = parseFloat(e.target.value) || 0;
    calculate();
  });

  bufferInput.addEventListener("change", (e) => {
    state.wasteBuffer = e.target.checked;
    calculate();
  });
}

function updateShapeUI() {
  const groupLen = document.getElementById("groupLength");
  const groupWid = document.getElementById("groupWidth");
  const groupDia = document.getElementById("groupDiameter");
  const labelWidth = document.getElementById("labelWidthText");
  const hintWidth = document.getElementById("hintWidthText");

  if (state.shape === "round") {
    groupLen.style.display = "none";
    groupWid.style.display = "none";
    groupDia.style.display = "block";
  } else if (state.shape === "river") {
    groupLen.style.display = "block";
    groupWid.style.display = "block";
    groupDia.style.display = "none";
    labelWidth.textContent = "Average River Gap Width";
    hintWidth.textContent = "Average width between the live edge slabs";
  } else {
    groupLen.style.display = "block";
    groupWid.style.display = "block";
    groupDia.style.display = "none";
    labelWidth.textContent = "Width";
    hintWidth.textContent = "Mold interior width";
  }
}

function calculate() {
  let cuIn = 0;

  if (state.shape === "round") {
    const radius = state.diameter / 2;
    cuIn = Math.PI * Math.pow(radius, 2) * state.depth;
  } else {
    cuIn = state.length * state.width * state.depth;
  }

  // 1 cu in = 0.554113 US fl oz
  let rawFlOz = cuIn * 0.554113;

  if (state.wasteBuffer) {
    rawFlOz *= 1.10; // +10%
  }

  const gallons = rawFlOz / 128;
  const liters = rawFlOz * 0.0295735;

  // Breakdown Part A & Part B
  let partAFlOz = 0;
  let partBFlOz = 0;

  if (state.mixRatio === "2:1") {
    partAFlOz = rawFlOz * (2 / 3);
    partBFlOz = rawFlOz * (1 / 3);
  } else {
    partAFlOz = rawFlOz * 0.5;
    partBFlOz = rawFlOz * 0.5;
  }

  // Mass estimation (Density: Resin ~ 33.1g/fl oz, Hardener ~ 28.9g/fl oz)
  const partAGrams = Math.round(partAFlOz * 33.1);
  const partBGrams = Math.round(partBFlOz * 28.9);

  // Update DOM
  document.getElementById("totalFlOz").textContent = Math.round(rawFlOz);
  document.getElementById("totalGalText").textContent = `≈ ${gallons.toFixed(2)} Gallons (${liters.toFixed(2)} Liters)`;
  document.getElementById("partAFlOz").textContent = `${partAFlOz.toFixed(1)} fl oz`;
  document.getElementById("partBFlOz").textContent = `${partBFlOz.toFixed(1)} fl oz`;
  document.getElementById("partAMass").textContent = `≈ ${partAGrams.toLocaleString()} grams`;
  document.getElementById("partBMass").textContent = `≈ ${partBGrams.toLocaleString()} grams`;
  document.getElementById("specCuIn").textContent = `${Math.round(cuIn)} cu in`;

  // Thermal Exotherm Assessment
  const exothermAlert = document.getElementById("exothermAlert");
  const specExo = document.getElementById("specExo");
  const specCure = document.getElementById("specCure");

  if (state.depth > 0.5 && state.mixRatio === "1:1") {
    exothermAlert.style.display = "block";
    specExo.textContent = "High Exotherm Risk!";
    specExo.style.color = "#f87171";
    specCure.textContent = "Danger of Overheating";
  } else {
    exothermAlert.style.display = "none";
    if (state.mixRatio === "2:1") {
      specExo.textContent = "Safe / Controlled Heat";
      specExo.style.color = "#4ade80";
      specCure.textContent = "48–72 Hours";
    } else {
      specExo.textContent = "Standard Thin Coat";
      specExo.style.color = "#38bdf8";
      specCure.textContent = "12–24 Hours";
    }
  }
}

window.addEventListener("DOMContentLoaded", init);
