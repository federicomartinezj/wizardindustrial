// Wizard navigation logic
const steps = [
    document.getElementById('step1'),
    document.getElementById('step2'),
    document.getElementById('step3'),
    document.getElementById('step4')
];
let currentStep = 0;

function showStep(index) {
    steps.forEach((step, i) => {
        if (step) step.classList.toggle('active', i === index);
    });
    currentStep = index;
}

// Paso 1: Validación
function validateStep1() {
    const rooms = document.getElementById('rooms').value;
    const occupancy = document.getElementById('occupancy').value;
    const operatingDays = document.getElementById('operatingDays').value;
    const operatingHours = document.getElementById('operatingHours').value;
    if (!rooms || rooms < 1) return false;
    if (!occupancy || occupancy < 1 || occupancy > 100) return false;
    if (!operatingDays || operatingDays < 1 || operatingDays > 7) return false;
    if (!operatingHours || operatingHours < 1 || operatingHours > 24) return false;
    return true;
}
document.getElementById('toStep2').addEventListener('click', function() {
    if (validateStep1()) {
        showStep(1);
    } else {
        alert('Por favor, completa todos los campos correctamente antes de continuar.');
    }
});

// Paso 2: Mostrar/ocultar campos F&B y piscina/spa
const hasFB = document.getElementById('hasFB');
const fbFields = document.getElementById('fbFields');
hasFB.addEventListener('change', function() {
    fbFields.style.display = hasFB.value === 'si' ? 'block' : 'none';
});
const hasPoolSpa = document.getElementById('hasPoolSpa');
const poolSpaFields = document.getElementById('poolSpaFields');
hasPoolSpa.addEventListener('change', function() {
    poolSpaFields.style.display = hasPoolSpa.value === 'si' ? 'block' : 'none';
});
// Paso 2: Validación
function validateStep2() {
    if (hasFB.value === 'si') {
        const fbSeats = document.getElementById('fbSeats').value;
        const fbMeals = document.getElementById('fbMeals').value;
        if (!fbSeats || fbSeats < 0) return false;
        if (!fbMeals || fbMeals < 0) return false;
    }
    if (hasPoolSpa.value === 'si') {
        const poolSpaUsers = document.getElementById('poolSpaUsers').value;
        if (!poolSpaUsers || poolSpaUsers < 0) return false;
    }
    return true;
}
document.getElementById('toStep1').addEventListener('click', function() {
    showStep(0);
});
document.getElementById('toStep3').addEventListener('click', function() {
    if (validateStep2()) {
        showStep(2);
    } else {
        alert('Por favor, completa todos los campos correctamente antes de continuar.');
    }
});

// Paso 3: Validación
function validateStep3() {
    const soilLevel = document.getElementById('soilLevel').value;
    const gForce = document.getElementById('gForce').value;
    if (!soilLevel) return false;
    if (!gForce) return false;
    return true;
}
document.getElementById('toStep2').addEventListener('click', function() {
    showStep(1);
});
document.getElementById('toStep4').addEventListener('click', function() {
    if (validateStep3()) {
        calcularYMostrarResultados();
        showStep(3);
    } else {
        alert('Por favor, completa todos los campos correctamente antes de continuar.');
    }
});
document.getElementById('toStep3').addEventListener('click', function() {
    showStep(2);
});

// --- Constantes de Conversión y Datos Base ---
const KG_PER_LB = 0.453592;
const LB_PER_KG = 2.20462;
const BASE_CAPACITY_PER_ROOM_LBS = {
    "Estancia Prolongada": 8.0, "Económico": 10.0, "Servicio Limitado": 12.0,
    "Servicio Selecto": 14.0, "Lujo": 16.0, "Resort": 18.0
};
const FB_LINEN_WEIGHT_LBS = {
    "Solo Servilletas": 0.11, "Servilletas y Manteles": 0.46, "Solo Manteles": 0.35
};
const POOL_SPA_LINEN_WEIGHT_LBS_PER_USER = 1.5;
const SPECIAL_BEDDING_ADDITION_LBS_PER_ROOM = 3.0;
const WASHER_PRODUCTIVITY_LOADS_PER_HOUR = {"Ligero": 2.0, "Normal": 1.5, "Pesado": 1.2};
const DRYER_TO_WASHER_RATIO_BY_GFORCE = {"Baja (~100G)": 2.0, "Media (~200G)": 1.5, "Alta (300G o más)": 1.25};
const MACHINE_DATABASE_UNIMAC = {
    washers: [
        {brand: "UniMac", model: "UCx020", capacity_lbs: 20, capacity_kg: 9.0},
        {brand: "UniMac", model: "UCx030", capacity_lbs: 30, capacity_kg: 14.0},
        {brand: "UniMac", model: "UCx040", capacity_lbs: 40, capacity_kg: 18.0},
        {brand: "UniMac", model: "UCx060", capacity_lbs: 60, capacity_kg: 27.0},
        {brand: "UniMac", model: "UCx080", capacity_lbs: 80, capacity_kg: 36.0},
        {brand: "UniMac", model: "UCx100", capacity_lbs: 100, capacity_kg: 45.0},
        {brand: "UniMac", model: "UWx045", capacity_lbs: 45, capacity_kg: 20.4},
        {brand: "UniMac", model: "UWx065", capacity_lbs: 65, capacity_kg: 29.5},
        {brand: "UniMac", model: "UWx085", capacity_lbs: 85, capacity_kg: 38.6},
        {brand: "UniMac", model: "UWx105", capacity_lbs: 105, capacity_kg: 47.6},
        {brand: "UniMac", model: "UWx130", capacity_lbs: 130, capacity_kg: 59.0},
        {brand: "UniMac", model: "UWx160", capacity_lbs: 160, capacity_kg: 72.6},
        {brand: "UniMac", model: "UWx200", capacity_lbs: 200, capacity_kg: 90.7},
        {brand: "UniMac", model: "UY350", capacity_lbs: 77, capacity_kg: 34.9},
        {brand: "UniMac", model: "UY450", capacity_lbs: 100, capacity_kg: 45.4},
        {brand: "UniMac", model: "UY600", capacity_lbs: 132, capacity_kg: 59.9},
        {brand: "UniMac", model: "UY800", capacity_lbs: 180, capacity_kg: 81.6},
        {brand: "UniMac", model: "UY1000", capacity_lbs: 230, capacity_kg: 104.3},
        {brand: "UniMac", model: "UY1200", capacity_lbs: 275, capacity_kg: 124.7}
    ],
    dryers: [
        {brand: "UniMac", model: "Uxx30", capacity_lbs: 30, capacity_kg: 13.6},
        {brand: "UniMac", model: "Ux055", capacity_lbs: 55, capacity_kg: 24.9},
        {brand: "UniMac", model: "Ux075", capacity_lbs: 75, capacity_kg: 34.0},
        {brand: "UniMac", model: "Ux120", capacity_lbs: 120, capacity_kg: 54.4},
        {brand: "UniMac", model: "Ux170", capacity_lbs: 170, capacity_kg: 77.1},
        {brand: "UniMac", model: "Ux200", capacity_lbs: 200, capacity_kg: 90.7},
        {brand: "UniMac", model: "UxT30", capacity_lbs: 30, capacity_kg: 13.6},
        {brand: "UniMac", model: "UxT45", capacity_lbs: 45, capacity_kg: 20.4},
        {brand: "UniMac", model: "UST30 (Washer part)", capacity_lbs: 30, capacity_kg: 13.6},
        {brand: "UniMac", model: "UST50 (Washer part)", capacity_lbs: 50, capacity_kg: 22.7}
    ]
};
function getBaseCapacityPerRoom(serviceLevel, unit) {
    if (unit === 'kg') return BASE_CAPACITY_PER_ROOM_LBS[serviceLevel] * KG_PER_LB;
    return BASE_CAPACITY_PER_ROOM_LBS[serviceLevel];
}
function getFBLinenWeight(type, unit) {
    if (unit === 'kg') return FB_LINEN_WEIGHT_LBS[type] * KG_PER_LB;
    return FB_LINEN_WEIGHT_LBS[type];
}
function getSpecialBeddingAddition(unit) {
    if (unit === 'kg') return SPECIAL_BEDDING_ADDITION_LBS_PER_ROOM * KG_PER_LB;
    return SPECIAL_BEDDING_ADDITION_LBS_PER_ROOM;
}
function getPoolSpaLinenWeight(unit) {
    if (unit === 'kg') return POOL_SPA_LINEN_WEIGHT_LBS_PER_USER * KG_PER_LB;
    return POOL_SPA_LINEN_WEIGHT_LBS_PER_USER;
}
function recommendUniMacMachines(totalCapacity, unit, type) {
    const db = MACHINE_DATABASE_UNIMAC[type];
    let options = [];
    let bestSingle = db.filter(m => m[`capacity_${unit}`] >= totalCapacity)
        .sort((a, b) => a[`capacity_${unit}`] - b[`capacity_${unit}`])[0];
    if (bestSingle) {
        options.push(`1 x ${bestSingle.brand} ${bestSingle.model} (${bestSingle[`capacity_${unit}`].toFixed(1)} ${unit})`);
    }
    let bestDouble = db.filter(m => m[`capacity_${unit}`] * 2 >= totalCapacity)
        .sort((a, b) => (a[`capacity_${unit}`] * 2) - (b[`capacity_${unit}`] * 2))[0];
    if (bestDouble && (!bestSingle || bestDouble[`capacity_${unit}`] * 2 < bestSingle[`capacity_${unit}`] * 1.35)) {
        options.push(`2 x ${bestDouble.brand} ${bestDouble.model} (${bestDouble[`capacity_${unit}`].toFixed(1)} ${unit} c/u)`);
    }
    return options.length ? options.join('<br>') : 'No se encontró configuración óptima.';
}
function calcularYMostrarResultados() {
    const unit = document.getElementById('unit').value;
    const rooms = parseFloat(document.getElementById('rooms').value);
    const hotelType = document.getElementById('hotelType').value;
    const occupancy = parseFloat(document.getElementById('occupancy').value) / 100;
    const operatingDays = parseFloat(document.getElementById('operatingDays').value);
    const operatingHours = parseFloat(document.getElementById('operatingHours').value);
    const specialBedding = document.getElementById('specialBedding').value === 'si';
    const hasFB = document.getElementById('hasFB').value === 'si';
    const fbSeats = hasFB ? parseFloat(document.getElementById('fbSeats').value) : 0;
    const fbMeals = hasFB ? parseFloat(document.getElementById('fbMeals').value) : 0;
    const fbLinenType = hasFB ? document.getElementById('fbLinenType').value : '';
    const hasPoolSpa = document.getElementById('hasPoolSpa').value === 'si';
    const poolSpaUsers = hasPoolSpa ? parseFloat(document.getElementById('poolSpaUsers').value) : 0;
    const soilLevel = document.getElementById('soilLevel').value;
    const gForce = document.getElementById('gForce').value;
    const baseRoomLoad = getBaseCapacityPerRoom(hotelType, unit) * rooms * occupancy;
    const specialBeddingLoad = specialBedding ? getSpecialBeddingAddition(unit) * rooms * occupancy : 0;
    const fbLoad = (hasFB && fbSeats && fbMeals) ? fbSeats * fbMeals * getFBLinenWeight(fbLinenType, unit) : 0;
    const poolSpaLoad = (hasPoolSpa && poolSpaUsers) ? poolSpaUsers * getPoolSpaLinenWeight(unit) : 0;
    const totalDaily = baseRoomLoad + specialBeddingLoad + fbLoad + poolSpaLoad;
    const totalWeekly = totalDaily * operatingDays;
    const effectiveHours = operatingDays * operatingHours;
    const capacityHour = totalWeekly / effectiveHours;
    const loadsPerHour = WASHER_PRODUCTIVITY_LOADS_PER_HOUR[soilLevel];
    const washerCycle = capacityHour / loadsPerHour;
    const dryerRatio = DRYER_TO_WASHER_RATIO_BY_GFORCE[gForce];
    const dryerCycle = washerCycle * dryerRatio;
    const washerRec = recommendUniMacMachines(washerCycle, unit, 'washers');
    const dryerRec = recommendUniMacMachines(dryerCycle, unit, 'dryers');
    document.getElementById('resRoomLoad').textContent = baseRoomLoad.toFixed(2) + ' ' + unit;
    document.getElementById('resSpecialBedding').textContent = specialBeddingLoad.toFixed(2) + ' ' + unit;
    document.getElementById('resFB').textContent = fbLoad.toFixed(2) + ' ' + unit;
    document.getElementById('resPoolSpa').textContent = poolSpaLoad.toFixed(2) + ' ' + unit;
    document.getElementById('resTotalDaily').textContent = totalDaily.toFixed(2) + ' ' + unit;
    document.getElementById('resTotalWeekly').textContent = totalWeekly.toFixed(2) + ' ' + unit;
    document.getElementById('resCapacityHour').textContent = capacityHour.toFixed(2) + ' ' + unit + '/hr';
    document.getElementById('resWasherCycle').textContent = washerCycle.toFixed(2) + ' ' + unit;
    document.getElementById('resDryerCycle').textContent = dryerCycle.toFixed(2) + ' ' + unit;
    document.getElementById('resWasherRec').innerHTML = '<strong>Lavadoras:</strong><br>' + washerRec;
    document.getElementById('resDryerRec').innerHTML = '<strong>Secadoras:</strong><br>' + dryerRec;
}
// Inicializar wizard en el primer paso
showStep(0); 