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
    const performanceProfile = document.getElementById('performanceProfile').value;
    if (!performanceProfile) return false;
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

// Datos base de lencería por habitación en KILOGRAMOS (proporcionado por el usuario)
const BASE_CAPACITY_PER_ROOM_KG_DATA = {
    "Hotel Ejecutivo": 3.5,
    "Hotel de Vacaciones": 4.5,
    "Hotel de Lujo": 6.5,
    "Airbnb": 2.5
};
// Calcular datos base en LIBRAS para referencia interna
const BASE_CAPACITY_PER_ROOM_LBS = {};
for (const key in BASE_CAPACITY_PER_ROOM_KG_DATA) {
    BASE_CAPACITY_PER_ROOM_LBS[key] = BASE_CAPACITY_PER_ROOM_KG_DATA[key] * LB_PER_KG;
}

const FB_LINEN_WEIGHT_LBS = {
    "Solo Servilletas": 0.11, "Servilletas y Manteles": 0.46, "Solo Manteles": 0.35
};
const POOL_SPA_LINEN_WEIGHT_LBS_PER_USER = 1.5;
const SPECIAL_BEDDING_ADDITION_LBS_PER_ROOM = 3.0;

const WASHER_PRODUCTIVITY_LOADS_PER_HOUR = {"Económico": 1.5, "Alto Desempeño": 2.0};
const DRYER_TO_WASHER_RATIO = {"Económico": 2.0, "Alto Desempeño": 1.25};

const MACHINE_DATABASE_UNIMAC = {
    washers: [
        {brand: "UniMac", model: "UCx020", capacity_lbs: 20, capacity_kg: 9.0}, // Económico
        {brand: "UniMac", model: "UCx030", capacity_lbs: 30, capacity_kg: 14.0}, // Económico
        {brand: "UniMac", model: "UCx040", capacity_lbs: 40, capacity_kg: 18.0}, // Económico
        {brand: "UniMac", model: "UCx060", capacity_lbs: 60, capacity_kg: 27.0}, // Económico
        {brand: "UniMac", model: "UCx080", capacity_lbs: 80, capacity_kg: 36.0}, // Económico
        {brand: "UniMac", model: "UCx100", capacity_lbs: 100, capacity_kg: 45.0}, // Económico
        {brand: "UniMac", model: "UWx045", capacity_lbs: 45, capacity_kg: 20.4}, // Alto Desempeño
        {brand: "UniMac", model: "UWx065", capacity_lbs: 65, capacity_kg: 29.5}, // Alto Desempeño
        {brand: "UniMac", model: "UWx085", capacity_lbs: 85, capacity_kg: 38.6}, // Alto Desempeño
        {brand: "UniMac", model: "UWx105", capacity_lbs: 105, capacity_kg: 47.6}, // Alto Desempeño
        {brand: "UniMac", model: "UWx130", capacity_lbs: 130, capacity_kg: 59.0}, // Alto Desempeño
        {brand: "UniMac", model: "UWx160", capacity_lbs: 160, capacity_kg: 72.6}, // Alto Desempeño
        {brand: "UniMac", model: "UWx200", capacity_lbs: 200, capacity_kg: 90.7}, // Alto Desempeño
        {brand: "UniMac", model: "UY350", capacity_lbs: 77, capacity_kg: 34.9}, // Alto Desempeño (ejemplo, verificar si aplica)
        {brand: "UniMac", model: "UY450", capacity_lbs: 100, capacity_kg: 45.4}, // Alto Desempeño (ejemplo, verificar si aplica)
        {brand: "UniMac", model: "UY600", capacity_lbs: 132, capacity_kg: 59.9}, // Alto Desempeño (ejemplo, verificar si aplica)
        {brand: "UniMac", model: "UY800", capacity_lbs: 180, capacity_kg: 81.6}, // Alto Desempeño (ejemplo, verificar si aplica)
        {brand: "UniMac", model: "UY1000", capacity_lbs: 230, capacity_kg: 104.3}, // Alto Desempeño (ejemplo, verificar si aplica)
        {brand: "UniMac", model: "UY1200", capacity_lbs: 275, capacity_kg: 124.7}  // Alto Desempeño (ejemplo, verificar si aplica)
    ],
    dryers: [
        {brand: "UniMac", model: "Uxx30", capacity_lbs: 30, capacity_kg: 13.6}, // Económico
        {brand: "UniMac", model: "Ux055", capacity_lbs: 55, capacity_kg: 24.9}, // Económico
        {brand: "UniMac", model: "Ux075", capacity_lbs: 75, capacity_kg: 34.0}, // Económico
        {brand: "UniMac", model: "Ux120", capacity_lbs: 120, capacity_kg: 54.4}, // Económico
        {brand: "UniMac", model: "Ux170", capacity_lbs: 170, capacity_kg: 77.1}, // Económico
        {brand: "UniMac", model: "Ux200", capacity_lbs: 200, capacity_kg: 90.7}, // Económico
        {brand: "UniMac", model: "UxT30", capacity_lbs: 30, capacity_kg: 13.6}, // Alto Desempeño
        {brand: "UniMac", model: "UxT45", capacity_lbs: 45, capacity_kg: 20.4}, // Alto Desempeño
        {brand: "UniMac", model: "UST30", capacity_lbs: 30, capacity_kg: 13.6}, // Alto Desempeño
        {brand: "UniMac", model: "UST50", capacity_lbs: 50, capacity_kg: 22.7}  // Alto Desempeño
    ]
};

function getBaseCapacityPerRoom(serviceLevel, unit) {
    if (unit === 'kg') return BASE_CAPACITY_PER_ROOM_KG_DATA[serviceLevel];
    return BASE_CAPACITY_PER_ROOM_KG_DATA[serviceLevel] * LB_PER_KG; // Convertir de KG a LB si la unidad es LB
}

function getFBLinenWeight(type, unit) {
    // Los datos de FB siguen en LBS, convertimos si la unidad es KG
    if (unit === 'kg') return FB_LINEN_WEIGHT_LBS[type] * KG_PER_LB;
    return FB_LINEN_WEIGHT_LBS[type];
}

function getSpecialBeddingAddition(unit) {
    // Los datos de Ropa Especial siguen en LBS, convertimos si la unidad es KG
    if (unit === 'kg') return SPECIAL_BEDDING_ADDITION_LBS_PER_ROOM * KG_PER_LB;
    return SPECIAL_BEDDING_ADDITION_LBS_PER_ROOM;
}

function getPoolSpaLinenWeight(unit) {
    // Los datos de Piscina/Spa siguen en LBS, convertimos si la unidad es KG
    if (unit === 'kg') return POOL_SPA_LINEN_WEIGHT_LBS_PER_USER * KG_PER_LB;
    return POOL_SPA_LINEN_WEIGHT_LBS_PER_USER;
}

function recommendUniMacMachines(totalCapacity, unit, type, performanceProfile) {
    // Filtrar la base de datos de máquinas por tipo (washers/dryers)
    const allMachinesOfType = MACHINE_DATABASE_UNIMAC[type];

    // Filtrar aún más por el perfil de desempeño seleccionado
    const db = allMachinesOfType.filter(m => {
        if (performanceProfile === 'Económico') {
            // Máquinas Económicas (ej: UCx, Ux series)
            return m.brand === 'UniMac' && (m.model.startsWith('UCx') || m.model.startsWith('Ux') || m.model === 'Uxx30');
        } else if (performanceProfile === 'Alto Desempeño') {
            // Máquinas de Alto Desempeño (ej: UWx, UY, UxT, UST series)
            return m.brand === 'UniMac' && (m.model.startsWith('UWx') || m.model.startsWith('UY') || m.model.startsWith('UxT') || m.model.startsWith('UST'));
        }
        return false; // Si no se selecciona un perfil, no retornar ninguna máquina
    });

    let options = [];

    // Filtrar máquinas disponibles por la unidad seleccionada
    const availableMachines = db.map(m => ({
        ...m,
        capacity_user_unit: m[`capacity_${unit}`]
    })).sort((a, b) => a.capacity_user_unit - b.capacity_user_unit);

    // Lógica para 1 máquina
    let bestSingle = availableMachines.find(m => m.capacity_user_unit >= totalCapacity);
    if (bestSingle) {
        options.push(`1 x ${bestSingle.brand} ${bestSingle.model} (${bestSingle.capacity_user_unit.toFixed(1)} ${unit})`);
    }

    // Lógica para 2 máquinas idénticas (si aplica y es una buena opción)
    if (availableMachines.length > 0) {
        let bestDouble = availableMachines.find(m => m.capacity_user_unit * 2 >= totalCapacity);

        if (bestDouble) {
            const totalCapDouble = bestDouble.capacity_user_unit * 2;
            const singleExceedsMuch = bestSingle && (bestSingle.capacity_user_unit / totalCapacity > 1.35);
            const doubleIsBetterFit = bestSingle && (totalCapDouble < bestSingle.capacity_user_unit);

            if (!bestSingle || doubleIsBetterFit || (totalCapDouble / totalCapacity <= 1.35 && !singleExceedsMuch)) {
                options.push(`2 x ${bestDouble.brand} ${bestDouble.model} (${bestDouble.capacity_user_unit.toFixed(1)} ${unit} c/u)`);
            }
        }
    }

    // Limitar a 1 o 2 opciones si hay varias disponibles
    if (options.length > 2) {
        options.sort((a, b) => {
            const numMachinesA = a.startsWith('1 x') ? 1 : 2;
            const numMachinesB = b.startsWith('1 x') ? 1 : 2;
            if (numMachinesA !== numMachinesB) return numMachinesA - numMachinesB;
            return 0;
        });
        options = options.slice(0, 2);
    } else if (options.length === 0 && allMachinesOfType.length > 0) { // Considerar todas las máquinas del tipo si no se encuentra en el perfil
         // Si no hay opciones que cumplan la capacidad DENTRO del perfil, sugerir la más grande disponible DEL TIPO como fallback
         const largestMachineOfType = allMachinesOfType[allMachinesOfType.length - 1];
         options.push(`Considerar (fuera del perfil seleccionado): 1 x ${largestMachineOfType.brand} ${largestMachineOfType.model} (${largestMachineOfType.capacity_user_unit.toFixed(1)} ${unit}) (puede requerir ajuste de carga)`);
    }

    return options.length ? options.join('<br>') : 'No se encontró configuración UniMac adecuada para el perfil seleccionado.';
}

function calcularYMostrarResultados() {
    // Paso 1
    const unit = document.getElementById('unit').value;
    const rooms = parseFloat(document.getElementById('rooms').value);
    const hotelType = document.getElementById('hotelType').value;
    const occupancy = parseFloat(document.getElementById('occupancy').value) / 100;
    const operatingDays = parseFloat(document.getElementById('operatingDays').value);
    const operatingHours = parseFloat(document.getElementById('operatingHours').value);

    // Paso 2
    const specialBedding = document.getElementById('specialBedding').value === 'si';
    const hasFB = document.getElementById('hasFB').value === 'si';
    const fbSeats = hasFB ? parseFloat(document.getElementById('fbSeats').value) : 0;
    const fbMeals = hasFB ? parseFloat(document.getElementById('fbMeals').value) : 0;
    const fbLinenType = hasFB ? document.getElementById('fbLinenType').value : '';
    const hasPoolSpa = document.getElementById('hasPoolSpa').value === 'si';
    const poolSpaUsers = hasPoolSpa ? parseFloat(document.getElementById('poolSpaUsers').value) : 0;

    // Paso 3
    const performanceProfile = document.getElementById('performanceProfile').value;

    // Mapear perfil de desempeño a factores de cálculo (usando valores de la versión anterior)
    let loadsPerHour;
    let dryerRatio;

    if (performanceProfile === 'Económico') {
        // Corresponde a ~100G (Baja G-Force) y productividad Normal
        loadsPerHour = 1.5; // WASHER_PRODUCTIVITY_LOADS_PER_HOUR["Normal"]
        dryerRatio = 2.0;   // DRYER_TO_WASHER_RATIO_BY_GFORCE["Baja (~100G)"]
    } else if (performanceProfile === 'Alto Desempeño') {
        // Corresponde a ~300G (Alta G-Force) y productividad Ligera
        loadsPerHour = 2.0; // WASHER_PRODUCTIVITY_LOADS_PER_HOUR["Ligero"]
        dryerRatio = 1.25;  // DRYER_TO_WASHER_RATIO_BY_GFORCE["Alta (300G o más)"]
    } else {
        // Fallback o manejar caso no esperado (aunque el select HTML lo previene)
        loadsPerHour = 1.5; // Default a Normal
        dryerRatio = 1.5;   // Default a Media
    }

    // Cálculos
    const baseRoomLoad = getBaseCapacityPerRoom(hotelType, unit) * rooms * occupancy;
    const specialBeddingLoad = specialBedding ? getSpecialBeddingAddition(unit) * rooms * occupancy : 0;
    const fbLoad = (hasFB && fbSeats > 0 && fbMeals > 0) ? fbSeats * fbMeals * getFBLinenWeight(fbLinenType, unit) : 0;
    const poolSpaLoad = (hasPoolSpa && poolSpaUsers > 0) ? poolSpaUsers * getPoolSpaLinenWeight(unit) : 0;

    const totalDaily = baseRoomLoad + specialBeddingLoad + fbLoad + poolSpaLoad;
    const totalWeekly = totalDaily * operatingDays;
    const effectiveHours = operatingDays * operatingHours;

    let capacityHour = 0;
    let washerCycle = 0;
    let dryerCycle = 0;

    if (effectiveHours > 0) {
        capacityHour = totalWeekly / effectiveHours;
        washerCycle = capacityHour / loadsPerHour;
        dryerCycle = washerCycle * dryerRatio;
    }

    // Recomendaciones (basadas en capacidad por ciclo y perfil de desempeño)
    const washerRec = recommendUniMacMachines(washerCycle, unit, 'washers', performanceProfile);
    const dryerRec = recommendUniMacMachines(dryerCycle, unit, 'dryers', performanceProfile);

    // Mostrar resultados
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