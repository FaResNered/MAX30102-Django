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
  if (document.getElementById("switchData").checked){
    if (!data.Finger){
      document.getElementById("switch-label").innerHTML = "Missing finger"
      return
    }
    else{
      document.getElementById("switch-label").innerHTML = "Data received"
    }

    BPM_chart(data.BPM)
    SpO2_chart(data.SpO2)
    HRV_chart(data.HRV)
  }
}

function switchClick(){
  if (!document.getElementById("switchData").checked){
    document.getElementById('switch-label').innerText = 'Switch is off';
  }
}

function BPM_chart(BPM){
  document.getElementById("BPM-text").innerHTML = "BPM: " + BPM

  let theta = (BPM * 180) / 150;
  if (theta > 180){
    theta = 180
  }
  var x_head = rx * Math.cos((Math.PI*theta)/180) * (-1)
  var y_head = ry * Math.sin((Math.PI*theta)/180)

  let layout = {
    xaxis: {range: [0, 1], showgrid: false, 'zeroline': false, 'visible': false},
    yaxis: {range: [0, 1], showgrid: false, 'zeroline': false, 'visible': false},
    showlegend: false,
    annotations: [
    {
      ax: 0.5,
      ay: 0,
      axref: 'x',
      ayref: 'y',
      x: 0.5+x_head,
      y: y_head,
      xref: 'x',
      yref: 'y',
      showarrow: true,
      arrowhead: 3,
      arrowwidth: 5,
    }
    ],
    margin: margin_default
  };

  let config = {responsive: true}

  Plotly.newPlot(BPM_CHART, data_bpm_chart, layout, config)
}

function SpO2_chart(SpO2){
  document.getElementById("SpO2-text").innerHTML = "SpO2: " + SpO2

  let theta = ((SpO2-80) * 180) / 20;
  if (theta < 0){
    theta = 0
  }

  var x_head = rx * Math.cos((Math.PI*theta)/180) * (-1)
  var y_head = ry * Math.sin((Math.PI*theta)/180)

  let layout = {
    xaxis: {range: [0, 1], showgrid: false, 'zeroline': false, 'visible': false},
    yaxis: {range: [0, 1], showgrid: false, 'zeroline': false, 'visible': false},
    showlegend: false,
    annotations: [
    {
      ax: 0.5,
      ay: 0,
      axref: 'x',
      ayref: 'y',
      x: 0.5+x_head,
      y: y_head,
      xref: 'x',
      yref: 'y',
      showarrow: true,
      arrowhead: 3,
      arrowwidth: 5,
    }
    ],
    margin: margin_default
  };

  let config = {responsive: true}

  Plotly.newPlot(SpO2_CHART, data_spo2_chart, layout, config)
}

function HRV_chart(HRV){
  document.getElementById("HRV-text").innerHTML = "HRV: " + HRV

  let theta = (HRV * 180) / 100;
  if (theta > 180){
    theta = 180
  }

  var x_head = rx * Math.cos((Math.PI*theta)/180) * (-1)
  var y_head = ry * Math.sin((Math.PI*theta)/180)

  let layout = {
    xaxis: {range: [0, 1], showgrid: false, 'zeroline': false, 'visible': false},
    yaxis: {range: [0, 1], showgrid: false, 'zeroline': false, 'visible': false},
    showlegend: false,
    annotations: [
    {
      ax: 0.5,
      ay: 0,
      axref: 'x',
      ayref: 'y',
      x: 0.5+x_head,
      y: y_head,
      xref: 'x',
      yref: 'y',
      showarrow: true,
      arrowhead: 3,
      arrowsize: 1,
      arrowwidth: 5
    }
    ],
    margin: margin_default
  };

  let config = {responsive: true}

  Plotly.newPlot(HRV_CHART, data_hrv_chart, layout, config)
}

let rx = 0.35
let ry = 0.72

let BPM_CHART = document.getElementById('BPM-chart')
let data_bpm_chart = [
  {
      mode: "gauge",
      type: "indicator",
      value: 0, //modifica la linea rossa

      gauge: {
          shape: "angular",
          bar: {
              color: "blue",
              line: {
                  color: "red",
                  width: 4
              },  
              thickness: 0
          },
          bgcolor: "#388",
          bordercolor: "#FFFFFF",
          borderwidth: 3,
          axis: {
              range: [0,150],
              visible: true,
              tickmode: "array",
              tickvals: [0, 40, 60, 100, 120, 150],
              ticks: "outside"
          },
          steps: [
              {
                  range: [0, 40], //colore rosso
                  color: "#FF0000"
              },
              {
                range: [40, 60], //colore arancione
                color: "#FFA500"
              },
              {
                range: [60, 100], //colore verde
                color: "#00FF00"
              },
              {
                range: [100, 120], //colore arancione
                color: "#FFA500"
              },
              {
                range: [120, 150], //colore rosso
                color: "#FF0000"
              }
          ]
      }
  }
]

let SpO2_CHART = document.getElementById('SpO2-chart')
let data_spo2_chart = [
  {
      mode: "gauge",
      type: "indicator",
      value: 0, //modifica la linea rossa

      gauge: {
          shape: "angular",
          bar: {
              color: "blue",
              line: {
                  color: "red",
                  width: 4
              },  
              thickness: 0
          },
          bgcolor: "#388",
          bordercolor: "#FFFFFF",
          borderwidth: 3,
          axis: {
              range: [80,100],
              visible: true,
              tickmode: "array",
              tickvals: [80, 93, 97, 100],
              ticks: "outside"
          },
          steps: [
              {
                  range: [80, 93], //colore rosso
                  color: "#FF0000"
              },
              {
                range: [93, 97], //colore arancione
                color: "#FFA500"
              },
              {
                range: [97, 100], //colore verde
                color: "#00FF00"
              }
          ]
      }
  }
]

let HRV_CHART = document.getElementById('HRV-chart')
let data_hrv_chart = [
  {
      mode: "gauge",
      type: "indicator",
      value: 0, //modifica la linea rossa

      gauge: {
          shape: "angular",
          bar: {
              color: "blue",
              line: {
                  color: "red",
                  width: 4
              },  
              thickness: 0
          },
          bgcolor: "#388",
          bordercolor: "#FFFFFF",
          borderwidth: 3,
          axis: {
              range: [0, 100],
              visible: true,
              tickmode: "array",
              tickvals: [0, 20, 40, 60, 80, 100],
              ticks: "outside"
          },
          steps: [
              {
                  range: [0, 20], //colore rosso
                  color: "#FF0000"
              },
              {
                range: [20, 40], //colore arancione
                color: "#FFA500"
              },
              {
                range: [40, 100], //colore verde
                color: "#00FF00"
              }
          ]
      }
  }
]



let margin_default = {
  l: 30,
  r: 30,
  b: 10,
  t: 10,
  pad: 0
}

function generateChartStart(){
  BPM_chart(0)
  SpO2_chart(0)
  HRV_chart(0)
}


generateChartStart()
let T = setInterval(fetchSensorData, 1100);

