function getGraph(timingHistory) {
  const timingPerLine = timingHistory.map(time => {
    return {
      ...time,
      total: time.lines > 0 ? time.total / time.lines : 0,
      match: time.lines > 0 ? time.match / time.lines : 0
    }
  })

  const values = timingPerLine.map(time => [time.total, time.match]).flat()
  const maxTime = Math.max(0, ...values)
  const barWidth = value => !maxTime ? 0 : (value / maxTime) * 100

  let output = `<style>
    #graphContainer {
      background-color: lightgray;
      font-size: 10pt;
      max-width: 100%;
      padding: 6px;
    }
    .timingRow {
      margin: 0;
      margin-bottom: 6px;
    }
    .timingName { overflow-wrap: anywhere; }
    .timingBar { display: block; height: 1em; }
    .totalBar { background-color: cornflowerblue; }
    .matchBar { background-color: coral; }
    .timingLegend { margin-bottom: 1em; }
  </style>`

  output += `<div id="graphContainer">
    <h3>Timing per line over time</h3>
    <p class="timingLegend">
      <span class="totalBar">&nbsp;&nbsp;</span> Total<br>
      <span class="matchBar">&nbsp;&nbsp;</span> Match
    </p>
  `

  if (timingPerLine.length === 0) {
    output += '<p>No timing data yet.</p>'
  } else {
    for (let time of timingPerLine) {
      output += `<div class="timingRow">
        <a href="#${time.name}" class="timingName">${time.name}</a>
        <div class="timingBar totalBar" style="width:${barWidth(time.total)}%" title="Total: ${time.total.toFixed(1)}µs/line"></div>
        <div class="timingBar matchBar" style="width:${barWidth(time.match)}%" title="Match: ${time.match.toFixed(1)}µs/line"></div>
      </div>`
    }
  }

  output += '</div><br>'
  return output;
}

module.exports = getGraph
