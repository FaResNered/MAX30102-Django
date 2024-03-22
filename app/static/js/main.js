let counter = 0
let tableBody = document.getElementById("dynamic-body");

function switchClick(){
  if (!document.getElementById("switchData").checked){
    document.getElementById('sensore-valore').innerText = 'Switch is off';
  }
}

function fetchSensorData(){
  if (document.getElementById("switchData").checked){
    fetch('/measure')
    .then(response => response.json())
    .then(data => receivedData(data))
    .catch(error => {
        console.error('Si è verificato un errore:', error);
    });
  }
}

function receivedData(data){
  if (document.getElementById("switchData").checked)
    if (data.URL) {
      window.location.replace(data.URL);
      return
    }

    else if (data.Finger) {
      document.getElementById('sensore-valore').innerText = 'Updated data';
      updateTable(data)
      updateChart(data)
    }

    else
      document.getElementById('sensore-valore').innerText = 'Missing finger';
}

function updateTable(data){
  counter++;
  let newRow = document.createElement("tr");
  let date = new Date(data.Time).toLocaleString();
  newRow.innerHTML = `
    <th scope="row">${date}</th>
    <td>${data.BPM}</td>
    <td>${data.SpO2}</td>
    <td>${data.HRV}</td>
    <td>${data.Temperature}</td>
    <td>${data.Humidity}</td>
    <td>${data.Heat_index}</td>`
  tableBody.insertBefore(newRow, tableBody.firstChild);

  var rows = tableBody.querySelectorAll("tr");
  rows.forEach(function(row) {
      row.style.transition = "transform 0.5s ease";
  });

  // Remove the last row if it exceeds certain limit to prevent table from growing indefinitely
  if (rows.length > 50) {
      tableBody.removeChild(tableBody.lastChild);
  }
}

function updateChart(data){
  let date = new Date(data.Time).toLocaleString();

  if (data.BPM == 0){
    data.BPM = array_BPM.reduce((a, b) => a + b, 0) / array_BPM.length;
    console.log("BPM mancante")
  }

  if (data.SpO2 == 0){
    data.SpO2 = array_SpO2.reduce((a, b) => a + b, 0) / array_SpO2.length;
    console.log("SpO2 mancante")
  }

  if (array_Time.length >= MAX_VALUE){
    array_BPM.shift()
    array_SpO2.shift()
    array_HRV.shift()
    array_Time.shift()
  }

  array_BPM.push(data.BPM)
  array_SpO2.push(data.SpO2)
  array_HRV.push(data.HRV)
  array_Time.push(date)

  let BPM_chart = {
    x: array_Time,
    y: array_BPM,
    type: 'scatter',
    name: 'BPM'
  }

  let SpO2_chart = {
    x: array_Time,
    y: array_SpO2,
    type: 'scatter',
    name: 'SpO2'
  }

  let HRV_chart = {
    x: array_Time,
    y: array_HRV,
    type: 'scatter',
    name: 'HRV'
  }

  let layout = {
    font: {size: 13},
    margin: {
      l: 100,
      r: 100,
      b: 160,
      t: 50,
      pad: 4
    },
  };
  
  let config = {responsive: true}

	Plotly.newPlot(CHART, [
    BPM_chart,
    SpO2_chart,
    HRV_chart
  ],
  layout,
  config);
}

const MAX_VALUE = 50
let CHART = document.getElementById('container-chart');
let array_BPM = []
let array_SpO2 = []
let array_HRV = []
let array_Time = []

let T = setInterval(fetchSensorData, 1100);