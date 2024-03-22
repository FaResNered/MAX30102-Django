let CHART = document.getElementById('container-chart');

function createChart(){
  let ora = new Date();
  if (document.getElementById('data-inizio').value == "")
    document.getElementById('data-inizio').valueAsDate = ora;
  if (document.getElementById('ora-inizio').value == "")
    document.getElementById('ora-inizio').value = ora.getHours() + ":" + ora.getMinutes();
  if (document.getElementById('data-fine').value == "")
    document.getElementById('data-fine').valueAsDate = ora;
  if (document.getElementById('ora-fine').value == "")
    document.getElementById('ora-fine').value = ora.getHours() + ":" + ora.getMinutes();

  let link = `/history/'inizio':'${document.getElementById('data-inizio').value}_`
  link += `${document.getElementById('ora-inizio').value}',`
  link += `'fine':'${document.getElementById('data-fine').value}_`
  link += `${document.getElementById('ora-fine').value}'`
  console.log(link)

  fetch(link)
  .then(response => response.json())
  .then(data => receivedData(data))
  .catch(error => {
      console.error('Si è verificato un errore:', error);
  });
}

function receivedData(data){
  if (data.URL) {
    window.location.replace(data.URL);
    return
  }

  let BPM_chart = {
    x: [],
    y: [],
    type: 'scatter',
    name: 'BPM'
  }

  let SpO2_chart = {
    x: [],
    y: [],
    type: 'scatter',
    name: 'SpO2'
  }

  let HRV_chart = {
    x: [],
    y: [],
    type: 'scatter',
    name: 'HRV'
  }

  for (let i=0; i<data.length; i++){
    let date = new Date(data[i].Time).toLocaleString();

    if (data[i].BPM == 0 || data[i].BPM == null){
      data[i].BPM = data.slice(0, i-1).reduce((a, b) => a + b, 0) / data.slice(0, i-1).length;
    }

    if (data[i].SpO2 == 0 || data[i].SpO2 == null){
      data[i].SpO2 = data.slice(0, i-1).reduce((a, b) => a + b, 0) / data.slice(0, i-1).length;
    }

    BPM_chart.y.push(data[i].BPM)
    BPM_chart.x.push(date)

    SpO2_chart.y.push(data[i].SpO2)
    SpO2_chart.x.push(date)

    HRV_chart.y.push(data[i].HRV)
    HRV_chart.x.push(date)
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
      xaxis:{ range:[0, 100] },
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