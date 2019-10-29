function hidePopup(){
    var popup = document.getElementById("popup");
    popup.style.display = 'none';
}        

// positon popup on page relative to cursor
// position at time of click event  
function positionPopupOnPage( evt ) {

    var VPWH = [];                  // view port width / height
    var intVPW, intVPH;             // view port width / height
    var intCoordX = evt.clientX;    
    var intCoordY = evt.clientY;    // distance from click point to view port top
    console.log("X/Y: " + intCoordX + "/" + intCoordY)
    var intDistanceScrolledUp = document.body.scrollTop;
        // distance the page has been scrolled up from view port top
    var intPopupOffsetTop = intDistanceScrolledUp + intCoordY;
        // add the two for total distance from click point y to top of page

    var intDistanceScrolledLeft = document.body.scrollLeft;
    var intPopupOffsetLeft = intDistanceScrolledLeft + intCoordX;

    //VPWH = getViewPortWidthHeight();    // view port Width/Height
    var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    intVPW = w;
    intVPH = h;
    console.log("canvas size W/H: " + w + "/" + h)
    
    var popup = document.getElementById("popup")
    popup.style.position = 'absolute';
    // if not display: block, .offsetWidth & .offsetHeight === 0
    // popup.style.display = 'block';
    popup.style.zIndex = '10100';
    popup.style.backgroundColor = 'pink';

    if ( intCoordX > intVPW/2 ) { intPopupOffsetLeft -= popup.offsetWidth; }
        // if x is in the right half of the viewport, pull popup left by its width
    if ( intCoordY > intVPH/2 ) { intPopupOffsetTop -= popup.offsetHeight; }
        // if y is in the bottom half of view port, pull popup up by its height

    popup.style.top = intPopupOffsetTop + 'px';
    popup.style.left = intPopupOffsetLeft + 'px';
}   // end fn positionPopupOnPage

function positionPopupOnPageXY( X, Y ) {

    var VPWH = [];                  // view port width / height
    var intVPW, intVPH;             // view port width / height
    var intCoordX = X;    
    var intCoordY = Y;    // distance from click point to view port top
    console.log("X/Y: " + intCoordX + "/" + intCoordY)
    var intDistanceScrolledUp = document.body.scrollTop;
        // distance the page has been scrolled up from view port top
    var intPopupOffsetTop = intDistanceScrolledUp + intCoordY;
        // add the two for total distance from click point y to top of page

    var intDistanceScrolledLeft = document.body.scrollLeft;
    var intPopupOffsetLeft = intDistanceScrolledLeft + intCoordX;

    //VPWH = getViewPortWidthHeight();    // view port Width/Height
    var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    intVPW = w;
    intVPH = h;
    console.log("canvas size W/H: " + w + "/" + h)
    
    var popup = document.getElementById("popup")
    popup.style.position = 'absolute';
    // if not display: block, .offsetWidth & .offsetHeight === 0
    // popup.style.display = 'block';
    popup.style.zIndex = '10100';
    popup.style.backgroundColor = 'pink';

    if ( intCoordX > intVPW/2 ) { intPopupOffsetLeft -= popup.offsetWidth; }
        // if x is in the right half of the viewport, pull popup left by its width
    if ( intCoordY > intVPH/2 ) { intPopupOffsetTop -= popup.offsetHeight; }
        // if y is in the bottom half of view port, pull popup up by its height

    popup.style.top = intPopupOffsetTop + 'px';
    popup.style.left = intPopupOffsetLeft + 'px';
}   // end fn positionPopupOnPage

function nodeColor(d) {
    if (d.hardware.type == "PLC") {
        return "grey";
    } 
    else if (d.hardware.type == "RTU") {
        return "grey";
    }
    else if (d.hardware.type == "Switch") {
    		return "blue"
    }
    else if (d.hardware.type == "Computer") {
    		return "yellow"
    }
    else if (d.hardware.type == "Printer") {
    		return "green"
    }
    else {
    		return "red"
    }
}

function getPosition(el) {
    var xPosition = 0;
    var yPosition = 0;
   
    while (el) {
      if (el.tagName == "BODY") {
        // deal with browser quirks with body/window/document and page scroll
        var xScrollPos = el.scrollLeft || document.documentElement.scrollLeft;
        var yScrollPos = el.scrollTop || document.documentElement.scrollTop;
   
        xPosition += (el.offsetLeft - xScrollPos + el.clientLeft);
        yPosition += (el.offsetTop - yScrollPos + el.clientTop);
      } else {
        xPosition += (el.offsetLeft - el.scrollLeft + el.clientLeft);
        yPosition += (el.offsetTop - el.scrollTop + el.clientTop);
      }
   
      el = el.offsetParent;
    }
    console.log(xPosition + " : " + yPosition)
    return {
      x: xPosition,
      y: yPosition
    };
  }

// On HTML Load function
function onLoad(){

    svg = d3.select("svg"),
        width = +svg.attr("width"),
        height = +svg.attr("height");      

    g = svg.append("g").attr("class", "everything");      

    simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(function(d) { return d.deviceId; }).distance(50))
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(width / 2, height / 2));

    d3.json("OT-BASE-sample.json", function(error, assetData) {
        if (error) throw error;
      
        var link = g.append("g")
          .attr("class", "links")
          .selectAll("line")
          .data(assetData.links)
          .enter()
          .append("line")
          .attr("stroke-width", 3)
          .style("stroke", "red");
      
        // Restructured node from single <circle> into structure of
        // <a> <circle></circle> <text></text> </a> to hold a title text
        var node = g.append("g")
          .attr("class", "nodes")
          .selectAll("a")             // this just produces empty objects array
          .data(assetData.devices)    // attach to each 
          .enter()                    
          .append('a')
            .attr("target", '_blank')
            .attr("xlink:href",  function(d) { return (window.location.href + '?device=' + d.deviceId) });
            
        // Prevent default action on <a> tag and run custom function to show the tooltip    
        node.on("click",function(d){
            window.event.preventDefault();
            var popup = document.getElementById("popup");
            popup.textContent = "blbost text " + d.deviceId;
            popup.style.display = "block"
            getPosition(d)
            console.log(d)
            console.log(d.x + " :: " + d.y)
            positionPopupOnPageXY(d.x,d.y)
            
        },false);

        node.append("circle")
          .attr("r", 8.5)
          .attr("fill", nodeColor)
          .call(d3.drag()
              .on("start", dragstarted)
              .on("drag", dragged)
              .on("end", dragended));
              
        node.append("text")
            .attr("font-size", "1em")
            .attr("dx", 12) // delta position against circle
            .attr("dy", ".35em") // delta position against circle as half of text size hight
            .attr("x", +8)  // delta position against circle (for IE browser)
            .text(function(d) { return d.deviceId }); 
                       
      
        // I do not think this will work like this
        //node.append("title")
        //    .text(function(d) { return d.deviceId; });
      
        simulation
            .nodes(assetData.devices)
            .on("tick", ticked);
      
        simulation.force("link")
            .links(assetData.links);
      
        function ticked() {
          link
              .attr("x1", function(d) { return d.source.x; })
              .attr("y1", function(d) { return d.source.y; })
              .attr("x2", function(d) { return d.target.x; })
              .attr("y2", function(d) { return d.target.y; });
      
          node
              // You have to use transform if using non-svg constructs on nodes
              .attr("cx", function(d) { return d.x; })
              .attr("cy", function(d) { return d.y; })
              .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"});
        }
    });    

    // Zoom
    var zoom_handler = d3.zoom()
    .on("zoom", zoom_actions);    
    zoom_handler(svg); 
    
    // Pop-up initialization event
    //document.getElementById("canvas").addEventListener("click", positionPopupOnPage);  
}

function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  d.fx = d.x;
  d.fy = d.y;
}
 
// Zoom functions
function zoom_actions(){
    g.attr("transform", d3.event.transform)
}

      

