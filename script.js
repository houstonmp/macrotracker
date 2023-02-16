const wghtForm = document.querySelector("#wghtForm");
const LBS2KG = 0.45359237; //0.45359237kgs
const KG2LBS = 2.2; //2.2 lbs
const table = document.querySelector("#tContent");
const dietCont = document.querySelector("#dietContent");
const TODAY = new Date().toISOString().split('T')[0];

document.querySelector("#modalBtn").addEventListener("click",()=>{
    document.querySelector("#modal").classList.toggle("visible");
});

function wghtObject(date = null, lbs = null, kgs = null, food = []) {
    this.date = date;
    this.lbs = lbs;
    this.kgs = kgs;
    this.fName = food;
    this.tCalories = 0;
    this.tProtein = 0;
    this.tCarbs = 0;
    this.tFat = 0;
    this.tFiber = 0;
}

function ratio(value, maxValue) {
    const length = document.querySelector("#bmiBar").offsetWidth;
    console.log("width: " + length);
    return (100 * value) / maxValue;
    // return ((percent * length) / 100);
}

window.onload = function () {
    loadJSONData();
}

const wghtArray = [];

function saveJSONData() {
    let file = "save-json-data.php";
    fetch(file, {
        method: 'POST',
        body: JSON.stringify(wghtArray),
        headers: { 'Content-Type': 'application/json:charset=utf-8' }
    }).then(resp => resp.text()).then(function (resp) {
        console.log(resp);
    }).catch(err => console.error(err));
}
function addChartData(chart, label, data) {
    if (data !== "--" && data !== "0" && data !== "") {
        const exist = (element) => element === label;
        if (chart.data.labels.some(exist)) {
            const index = chart.data.labels.findIndex((el) => { return el === el.date });
            chart.data.labels[index] = data;
            chart.data.datasets.forEach((dataset) => {
                dataset.data[index] = data;
            });
        } else {
            chart.data.labels.push(label);
            chart.data.datasets.forEach((dataset) => {
                dataset.data.push(data);
            });
        }
        chart.data.labels.sort();
        chart.update();
    }
}

function loadJSONData() {
    fetch('wghtData.json').then(res => res.json()).then(res => {
        let temp = JSON.parse(JSON.stringify(res));
        const sorted = temp.sort(function (a, b) {
            return new Date(a.date) - new Date(b.date);
        });
        sorted.forEach((el) => {
            wghtArray.push(el);
            addChartData(myChart, el.date, el.lbs);
        });
        listData(TODAY);
    }).catch(err => console.log(err));
}

function calculateBMI(currentWeight) {
    const bmi = document.querySelector(".circle");

    const maxValue = 30 - 16;
    const bmiTop = maxValue - (24.9 - 16);
    const bmiBottom = maxValue - (18.5 - 16);
    const currentBMI = ((currentWeight / (70 * 70)) * 703)
    const bmiPlacement = maxValue - (currentBMI - 16);

    let oneThree = ratio(bmiTop, maxValue);
    let twoThree = ratio(bmiBottom, maxValue);
    let currentBMIPX = ratio(bmiPlacement, maxValue)
    document.querySelector("circle");
    console.log(maxValue + "," + bmiTop + "," + bmiBottom + "," + currentBMI)

    document.querySelector("hr:nth-Child(1)").style.left = `${oneThree}%`;
    document.querySelector("hr:nth-Child(2)").style.left = `${twoThree}%`;
    bmi.style.left = `${currentBMIPX}%`;
    bmi.setAttribute('data-after', `${parseFloat(currentBMI.toFixed(2))}`);
}

function addCalories(index) {
    if (index >= 0) {
        wghtArray[index].tCalories = wghtArray[index].fName.reduce((a, b) => { return a += b.dCalories }, 0);
        wghtArray[index].tCarbs = wghtArray[index].fName.reduce((a, b) => { return a += b.dCarbs }, 0);
        wghtArray[index].tProtein = wghtArray[index].fName.reduce((a, b) => { return a += b.dProtein }, 0);
        wghtArray[index].tFiber = wghtArray[index].fName.reduce((a, b) => { return a += b.dFiber }, 0);
        wghtArray[index].tFat = wghtArray[index].fName.reduce((a, b) => { return a += b.dFat }, 0);
    }
}

function listData(day2List) {
    if (wghtArray !== null) {
        table.innerHTML = '';
        dietCont.innerHTML = '';
        let index = 0;

        for (let wght of wghtArray) {
            if (wghtArray[index].fName !== undefined) {
                addCalories(index);

            }

            newRow(wght, day2List);
            index++;
        }
    }
    saveJSONData();
    // console.log(JSON.stringify(wghtArray));
}

document.addEventListener("click", function (e) {
    const target = e.target.closest("#dietContent tr"); // Or any other selector.

    if (target) {
        let date = target.firstChild.textContent;
        let fName = target.firstChild.nextSibling.textContent;
        let index = srchDate(date);
        if (index >= 0) {
            let index = wghtArray[srchDate(date)].fName.findIndex(el => this.fName === fName);
            wghtArray[srchDate(date)].fName.splice(index, 1);
        }
        listData(date);
    }
});

document.addEventListener("click", function (e) {
    const target = e.target.closest("#tContent tr"); // Or any other selector.

    if (target) {
        let date = target.firstChild.textContent;
        listData(date);
    }
});



function srchDate(date) {
    return wghtArray.findIndex((el) => {
        return el.date === date;
    });
}

//Passes the wght object and creates a new row from it
function newRow(wght, day2List = TODAY) {

    let row = document.createElement("tr");
    let date = document.createElement("td");
    const kgs = document.createElement("td");
    const lbs = document.createElement("td");
    date.textContent = wght.date;
    kgs.textContent = wght.kgs;
    lbs.textContent = wght.lbs;
    row.append(date, lbs, kgs);
    table.append(row);

    //Reload dietInformation

    if (wght.fName.length > -1 && wght.date == day2List) {
        for (let food of wght.fName) {
            let dietRow = document.createElement("tr");
            let foodName = document.createElement("td");
            let calories = document.createElement("td");
            let protein = document.createElement("td");
            let fat = document.createElement("td");
            let carbs = document.createElement("td");
            let fiber = document.createElement("td");
            date = document.createElement("td");
            date.textContent = wght.date;
            foodName.textContent = food.fName;
            calories.textContent = food.dCalories;
            protein.textContent = food.dProtein;
            fat.textContent = food.dFat;
            carbs.textContent = food.dCarbs;
            fiber.textContent = food.dFiber;
            dietRow.append(date, foodName, calories, protein, fat, carbs, fiber);
            dietCont.append(dietRow);
        }
        const mainCal = document.querySelector("#mainCal");
        const mainProt = document.querySelector("#mainProt");
        const mainCarbs = document.querySelector("#mainCarbs");
        const mainFat = document.querySelector("#mainFat");
        const mainFiber = document.querySelector("#mainFiber");


        mainCal.textContent = wght.tCalories + " / 2060";
        mainProt.textContent = wght.tProtein + " / 130";
        mainCarbs.textContent = wght.tCarbs + " / 250";
        mainFat.textContent = wght.tFat + " / 60";
        mainFiber.textContent = wght.tFiber + " / 30";


        calculateBMI(wght.lbs);

        applyClass(mainCal, "danger", wght.tCalories, 2060);
        applyClass(mainProt, "danger", wght.tProtein, 130);
        applyClass(mainCarbs, "danger", wght.tCarbs, 250);
        applyClass(mainFat, "danger", wght.tFat, 60);
        applyClass(mainFiber, "danger", wght.tFiber, 30);

    }
    row = document.createElement("tr");
}

function applyClass(el, classString, value, max) {
    if (value > max) {
        el.classList = classString;
    } else {
        el.classList = "";
    }
}

//Change default of submit event to create a new weight for a specific day
wghtForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const unit = document.querySelector("input[name='unit']:checked").value;
    const date = document.querySelector("#wghtDate").value;
    let index = srchDate(date);
    if (index >= 0) {


        if (unit === "kgs") {
            wght = document.querySelector("#weight").value;
            wghtArray[index].kgs = wght;
            wghtArray[index].lbs = Number((wght * 2.2).toFixed(2));
        }
        else {
            wght = document.querySelector("#weight").value;
            wghtArray[index].kgs = Number((wght / 2.2).toFixed(2));
            wghtArray[index].lbs = wght;
        }
    }
    else {
        let temp = {};

        if (unit === "kgs") {
            wght = document.querySelector("#weight").value;
            temp = new wghtObject(date, Number((wght * 2.2).toFixed(2)), wght);
        }
        else {
            wght = document.querySelector("#weight").value;
            temp = new wghtObject(date, wght, Number((wght / 2.2).toFixed(2)));
        }

        wghtArray.push(temp);
    }
    listData();
});

dietForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const food = document.querySelector("#food").value;
    const date = document.querySelector("#dietDate").value;
    const protein = parseInt(document.querySelector("#protein").value);
    const fiber = parseInt(document.querySelector("#fiber").value);
    const carbs = parseInt(document.querySelector("#carbs").value);
    const fat = parseInt(document.querySelector("#fat").value);


    let calories = ((protein * 4) + (fat * 9) + (carbs * 4));
    let index = srchDate(date);
    if (index >= 0) {
        let temp = {
            fName: food,
            dFiber: fiber,
            dCarbs: carbs,
            dProtein: protein,
            dCalories: calories,
            dFat: fat
        };

        wghtArray[index].fName.push(temp);

    }
    else {
        let fNameTemp = [{
            fName: food,
            dCalories: calories,
            dProtein: protein,
            dFat: fat,
            dCarbs: carbs,
            dFiber: fiber
        }];
        wghtTemp = new wghtObject(date, "--", "--", fNameTemp);
        wghtArray.push(wghtTemp);
    }
    listData(date);
});


