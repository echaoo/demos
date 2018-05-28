let tableMap = function (chartElementId, dataJson) {
  const data = []
  transform(dataJson, data, 0)
  const width = document.getElementById(chartElementId).clientWidth
  const height = document.getElementById(chartElementId).clientHeight
  const links = {}
  const allLinks = []
  const dom = d3.select('#' + chartElementId).append('svg').attr('width', width).attr('height', height)
  const defsDom = d3.select('#' + chartElementId)
  arrowMark(defsDom)
  const averageWidth = width / data.length
  const rectWidth = averageWidth * 0.6

  for (const m in data) {
    for (const i in data[m]) {
      const rectData = [{
        'field': data[m][i].tableName,
        x: width - rectWidth - (width / data.length) * m,
        y: i * getHeight(height, 25, data[m])
      }]
      data[m][i].fields.forEach(function (af, ae) {
        af.x = width - rectWidth - (width / data.length) * m
        af.y = (ae + 1) * 25 + (i * getHeight(height, 25, data[m]))
        if ((af.field in links) && data[m][i].tableName === links[af.field].table) {
          links[af.field].target = {x: af.x + rectWidth, y: af.y}
          allLinks.push(links[af.field])
          delete links[af.field]
          if (af.link) {
            const tempObj = {}
            tempObj.table = af.link.table
            tempObj.source = {x: af.x, y: af.y}
            links[af.field] = tempObj
          }
        } else if (af.link) {
          const tempObj = {}
          tempObj.table = af.link.table
          tempObj.source = {x: af.x, y: af.y}
          links[af.link.field] = tempObj
        }
      })
      rectData.push(...data[m][i].fields)
      renderRect(dom, rectData, rectWidth)
    }
  }
  const tempLink = []
  for (const i in allLinks) {
    tempLink.push(allLinks[i])
  }
  renderPath(dom, tempLink)
}

function renderRect (dom, data, width) {
  const g = dom.append('g').attr('class', 'ditems').selectAll('ditems').data(data)
    .enter()
    .append('g').attr('class', 'ditem')

  g.append('rect').attr('x', function (d) {
    return d.x
  })
    .attr('y', function (d) {
      return d.y
    })
    .attr('fill', function (d, i) {
      if (i === 0) {
        return '#13C2C2'
      } else {
        return '#f0f2f5'
      }
    })
    .attr('stroke', '#e8e8e8')
    .attr('stroke-width', 0.5)
    .attr({
      width: width,
      height: 25
    })

  g.append('text').text(function (a) {
    return a.field
  })
    .attr('x', function (d, i) {
      return d.x + 10
    })
    .attr('y', function (d) {
      return d.y + 17
    })
    .attr('fill', function (d, i) {
      if (i === 0) {
        return '#fff'
      } else {
        return '#666'
      }
    })
}

function renderPath (dom, data) {
  const diagonal = d3.svg.diagonal()
    .source(function (d) { return {'x': d.source.y, 'y': d.source.x} })
    .target(function (d) { return {'x': d.target.y, 'y': d.target.x} })
    .projection(function (d) { return [d.y, d.x + 13] })

  const g = dom.selectAll('path')
    .data(data)
    .enter()
    .append('path')
    .attr('d', function (d) {
      return diagonal(d)
    })
    .attr('fill', 'none')
    .attr('stroke', 'black')
    .attr('stroke-width', 1)
    .attr('marker-start', 'url(#arrow)')

  // data.forEach(function (item) {
  //   arrowMark(dom).append('path')
  //     .attr('d', diagonal(item))
  //     .attr('fill', '#000')
  //     .attr('stroke-width', 1)
  // })
}

function arrowMark (dom) {
  const defs = dom.append('svg').attr('height', '0').attr('display', 'inline').append('defs')

  const arrowMarker = defs.append('marker')
    .attr('id', 'arrow')
    .attr('markerUnits', 'strokeWidth')
    .attr('markerWidth', 12)
    .attr('markerHeight', 12)
    .attr('viewBox', '0 0 12 12')
    .attr('refX', '6')
    .attr('refY', '6')
  const arrowPath = 'M2,2 L10,6 L2,10 L6,6 L2,2'
  arrowMarker.append('path')
    .attr('d', arrowPath)
    .attr('fill', '#000')
    .attr('transform', 'rotate(180deg)')
}

function transform (obj, rs, level) {
  if (obj.hasOwnProperty('tableName')) {
    if (obj.tableName === '') return
    const newItem = {tableName: obj.tableName, fields: []}
    obj.fields.forEach(item => {
      const key = Object.keys(item)[0]
      const tempObj = {'field': key}
      if (item[key].tableName && item[key].fields.length !== 0) {
        tempObj.link = {'table': item[key].tableName, 'field': key}
      }
      newItem.fields.push(tempObj)
      if (item[key] !== undefined) {
        transform(item[key], rs, level + 1)
      }
    })
    if (rs[level] === undefined) {
      rs[level] = []
      rs[level].push(newItem)
    } else {rs[level].push(newItem)}
  } else {
    return
  }
}

function getHeight (height, itemHeight, data) {
  let count = 0
  for (const i in data) {
    count = count + data[i].fields.length
  }
  if (data.length > 1) {
    return (height - itemHeight * count) / (data.length - 1)
  }
  return height
}

// export default tableMap

