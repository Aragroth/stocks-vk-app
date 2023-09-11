import React, { useState, useEffect } from 'react';

import { Line } from 'react-chartjs-2';
import Moment from 'moment';
import 'moment/locale/ru';

// https://stackoverflow.com/questions/41760855/how-to-skip-labels-on-x-axes
// https://query1.finance.yahoo.com/v8/finance/chart/TM?region=US&lang=en-US&includePrePost=false&interval=1d&range=6mo&corsDomain=finance.yahoo.com&.tsrc=finance

function getChartData(chartRange, setChartData, companyName) {
  if (companyName === '') return;

  fetch(`api/chart/${companyName}/${chartRange}`)
    .then((response) => {
      return response.json()
    })
    .then((data_json) => {

      let labels = []
      let data = []

      data_json.forEach((item) => {
        Moment.locale('ru');
        let date = Moment(item.timestamp * 1000);

        switch (chartRange) {
          case 'year': date = date.format('MMMM'); break;
          case 'month': date = date.format('MMM DD'); break;
          case 'day':
            date = date.format('HH:mm');
            break;
        }

        data.push(parseFloat(item.value.toFixed(2)))
        labels.push(date)
      })

      setChartData({ labels, data, type: chartRange })
    })

}

export default (info) => {
  const [chartData, setChartData] = useState({ labels: [], data: [], type: null });

  useEffect(() => {
    if (info.chartRange !== chartData.type && info.companyName !== null) {
      getChartData(info.chartRange, setChartData, info.companyName);
    }
  }, [info.chartRange])

  let chartRange = info.chartRange
  let min = 0
  let max = 0

  if (chartData.data.length !== 0) {
    let n_min = Math.min.apply(Math, chartData.data);

    min = n_min - 3 >= 0 ? Math.floor((n_min - 3) / 10) * 10 : 0

    let n_max = Math.max.apply(Math, chartData.data);
    max = n_max + 3 >= 0 ? Math.ceil((n_max + 3) / 10) * 10 : 0
  }

  let ticks_time = 2;
  switch (chartRange) {
    case 'year': ticks_time = 2; break;
    case 'month': ticks_time = 4; break;
    case 'day': ticks_time = 4; break;
  }

  const options = {
    legend: {
      display: false,
      labels: {
        font: {
          color: 'black',
          size: 10
        }
      }
    },
    scales: {
      yAxes: [{
        display: true,
        ticks: {
          callback: function (tick, index, array) {
            if (array.length % 2) {
              return !(index % 2) ? "" : tick;
            }
            return (index % 2) ? "" : tick;
          },
          min,
          max,
          // forces step size to be 5 units
          // stepSize: 20 // <----- This prop sets the stepSize
        }
      }],
      xAxes: [{
        display: true,
        ticks: {
          maxRotation: 0,
          callback: function (tick, index, array) {

            return (index % ticks_time) ? '' : tick;
          },
        }
      }]
    }
  }


  const data = {
    labels: chartData.labels,
    datasets: [
      {
        fill: true,
        lineTension: 0.1,
        backgroundColor: chartData.data[0] <= chartData.data[chartData.data.length - 1] ? 'rgba(100, 255, 100, 0.3)' : 'rgba(230, 62, 62, 0.6)',
        borderColor: chartData.data[0] <= chartData.data[chartData.data.length - 1] ? 'green' : "red",
        borderCapStyle: 'butt',
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: 'miter',
        pointBorderColor: chartData.data[0] <= chartData.data[chartData.data.length - 1] ? 'green' : "red",
        pointBackgroundColor: '#fff',
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: 'white',
        pointHoverBorderColor: chartData.data[0] <= chartData.data[chartData.data.length - 1] ? 'green' : 'red',
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: chartData.data
      }
    ]
  };


  return (
    <Line data={data} options={options} />
  )
}