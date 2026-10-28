function median(values) {
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2
}

function getGraph(timingHistory, collname) {
  const rates = timingHistory.slice(1).map((time, index) => {
    const previous = timingHistory[index]
    const duration = (time.time - previous.time) / 1000
    const units = time.counts[collname] - previous.counts[collname]

    return {
      time: time.time,
      rate: duration > 0  && units >= 0 ? units / duration : null
    }
  }).filter(time => time.rate !== null)

  const rollingMedianRates = rates.map((time, index) => {
    const window = rates.slice(Math.max(0, index - 59), index + 1)
    return {
      ...time,
      median: median(window.map(item => item.rate))
    }
  })
  const values = rollingMedianRates
    .map(time => [time.rate, time.median])
    .flat()

  const maxRate = values.reduce((maximum, value) =>
    Math.max(maximum, value), 0)

  const barWidth = value => !maxRate ? 0 : (value / maxRate) * 100

  let output = `<style>
    #graphContainer {
      background-color: lightgray;
      font-size: 10pt;
      max-width: 100%;
      padding: 6px;
    }
    .timingRow {
      margin: 0;
      margin-bottom: 2px;
    }
    .timingBar { display: block; height: 1em; }
    .totalBar { background-color: cornflowerblue; }
    .matchBar { background-color: coral; }
    .timingLegend { margin-bottom: 1em; }
  </style>`

  output += `<div id="graphContainer">
    <h3>${collname} processed per second </h3>
    <p class="timingLegend">
      <span class="totalBar">&nbsp;&nbsp;</span> Interval rate<br>
      <span class="matchBar">&nbsp;&nbsp;</span> Rolling median
    </p>
  `

  if (rollingMedianRates.length === 0) {
    output += '<p>No timing data yet.</p>'
  } else {
    for (let time of rollingMedianRates) {
      const duration = (time.time - timingHistory[0].time) / 1000
      output += `<div class="timingRow">
        <div class="timingBar totalBar" style="width:${barWidth(time.rate)}%" title="Rate: ${time.rate.toFixed(2)} ${collname}/s"></div>
        <div class="timingBar matchBar" style="width:${barWidth(time.median)}%" title="Rolling median: ${time.median.toFixed(2)} ${collname}/s"></div>
      </div>`
    }
  }

  output += '</div><br>'
  return output;
}

module.exports = getGraph
