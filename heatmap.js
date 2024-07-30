let url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json"
let req = new XMLHttpRequest()

let values = []
let baseTemp 

let svg = d3.select('#canvas')

const height = 600
const width = 1200
const padding = 60

let xScale 
let yScale

let tooltip = d3.select('#tooltip')

let makeCanvas = () => {
    svg.attr('width', width)
    svg.attr('height', height)
}

let generateScales = () => {
    xScale = d3.scaleLinear()
               .domain([d3.min(values, (item)=> {
                    return item['year']
               }), d3.max(values, (item) => {
                    return item['year']
               })])
               .range([padding, width - padding])

    yScale = d3.scaleTime() 
                .domain([new Date(0, 0, 0, 0, 0, 0), new Date(0, 12, 0, 0, 0, 0, 0)])
                .range([padding, height - padding])
}

let drawCells = () => {
    svg.selectAll('rect')
        .data(values)
        .enter()
        .append('rect')
        .attr('class', 'cell')
        .attr('fill', (item) => {
            if(item['variance'] <= -1) {
                return 'blue'
            } 
            else if (item['variance'] <= 0) {
                return 'cyan'
            }
            else if (item['variance'] < 1) {
                return 'Orange'
            }
            else {
                return 'red'
            }
        })
        .attr('data-year', (item) => {
            return item['year']
        })
        .attr('data-month', (item) => {
            return item['month'] - 1
            //js months start at 0
        })
        .attr('data-temp', (item) => {
            return baseTemp + item['variance']
        })
        .attr('height', (height - (2*padding))/12)
        .attr('y', (item) => {
            return yScale(new Date(0, item['month']-1, 0, 0, 0, 0, 0))
        })
        .attr('width', (item) => {
            let numYears = d3.max(values, (item) => {
                return item['year']
            }) - d3.min(values, (item) => {
                return item['year']
            })
            return (width - (2*padding))/numYears
        })
        .attr('x', (item) => {
            return xScale(item['year'])
        })
        .on('mouseover', (item) => {
            tooltip.transition()
                .style('visibility', 'visible')
            
            let monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
            ]
        
            tooltip.text(item['year'] + ' ' + monthNames[item['month'] -1 ] + ' : ' + item['variance'])

            tooltip.attr('data-year', item['year'])
        })
        .on('mouseout', (item) => {
            tooltip.transition()
                .style('visibility', 'hidden')
        })
}

let generateAxes = () => {
    let xAxis = d3.axisBottom(xScale)
                    .tickFormat(d3.format('d'))
    
    let yAxis = d3.axisLeft(yScale)
                    .tickFormat(d3.timeFormat('%B'))
    
    svg.append('g')
        .call(xAxis)
        .attr('id', 'x-axis')
        .attr('transform', 'translate(0,' + (height - padding) + ')')
        
    svg.append('g')
        .call(yAxis)
        .attr('id', 'y-axis')
        .attr('transform', 'translate(' + padding + ", 0)")
    

}

req.open('GET', url, true)
req.onload = () => {
    let object = JSON.parse(req.responseText)
    console.log(req.responseText)
    baseTemp = object['baseTemperature']
    values = object['monthlyVariance']
    makeCanvas()
    generateScales()
    drawCells()
    generateAxes()
}
req.send()
