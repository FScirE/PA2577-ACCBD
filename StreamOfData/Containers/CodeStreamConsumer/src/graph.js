function median(values) {
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2
}

function getGraph(timingHistory) {
  const timingPerFile = timingHistory.slice(2).map(time => ({
    ...time,
    total: time.lines > 0 ? time.total / time.lines : 0,
    match: time.lines > 0 ? time.match / time.lines : 0
  }))
  const rollingMedianTimingPerLine = timingPerFile.slice(7).map((time, index) => {
    const window = timingPerFile.slice(index, index + 21)
    return {
      ...time,
      total: median(window.map(item => item.total)),
      match: median(window.map(item => item.match))
    }
  })

  const values = rollingMedianTimingPerLine.map(time => [time.total, time.match]).flat()
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
      margin-bottom: 2px;
    }
    .timingBar { display: block; height: 1em; }
    .totalBar { background-color: cornflowerblue; }
    .matchBar { background-color: coral; }
    .timingLegend { margin-bottom: 1em; }
  </style>`

  output += `<div id="graphContainer">
    <h3>Rolling median timing per line over time (excluding test files)</h3>
    <p class="timingLegend">
      <span class="totalBar">&nbsp;&nbsp;</span> Total<br>
      <span class="matchBar">&nbsp;&nbsp;</span> Match
    </p>
  `

  if (rollingMedianTimingPerLine.length === 0) {
    output += '<p>No timing data yet.</p>'
  } else {
    for (let time of rollingMedianTimingPerLine) {
      output += `<div class="timingRow">
        <div class="timingBar totalBar" style="width:${barWidth(time.total)}%" title="Total: ${time.total.toFixed(1)}µs/line"></div>
        <div class="timingBar matchBar" style="width:${barWidth(time.match)}%" title="Match: ${time.match.toFixed(1)}µs/line"></div>
      </div>`
    }
  }

  output += '</div><br>'
  return output;
}

module.exports = getGraph
