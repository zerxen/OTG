// ###############
// Global variables
// TODO: Stop using global variables :)
// ################
track_transform = ""
track_transform_x = 0
track_transform_y = 0
track_transform_k = 1

// ###############
// POP UP control 
// ###############


// hides pop-up on click event
function hidePopup(){
    var popup = document.getElementById("popup");
    popup.style.display = 'none';
}        

// Takes X,Y position of a node (from data model of force simulation)
// extends it translation from drag/zoom on SVG
// and checks in which quadrant of screen the node is so that the pop-up box 
// is positioned always on the screen (e.g. avoids tooltips to be outside of screen
// if nodes close to edges are clicked )
function positionPopupOnPageXY( X, Y) {

    var intVPW, intVPH;             // view port width / height

    // distance from click point to view port top 
    var intCoordX = X * track_transform_k + track_transform_x;    
    var intCoordY = Y * track_transform_k + track_transform_y;    
    //console.log("X/Y: " + intCoordX + "/" + intCoordY)
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
    //console.log("canvas size W/H: " + w + "/" + h)
    
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
} 

// This function takes data of single node (pre-processed by d3.data() ) 
// and returns a HTML content for a pop-up DIV
function popupHTMLfromDATA(d){

    //console.log(d)
    html = "ID: " + d.deviceId;
    html+= "<br>Zone:" + d.zone;
    if (d.name){ html+= "<br>Name:" + d.name; }
    if (d.hardware.type && d.hardware.type != "unknown" ){ html+= "<br>HW type  : " + d.hardware.type; }
    if (d.hardware.model){ html+= "<br>HW model : " + d.hardware.model; } 
    if (d.hardware.vendor){ html+= "<br>HW vendor: " + d.hardware.vendor; } 
    html+= "<br>(close me by clicking)"

    return html;
}

// ###############
// Pvisualization functions
// ###############

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

// #####################
// zoom && drag handlers
// #####################

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
 
function zoom_actions(){
    g.attr("transform", d3.event.transform)

    // the above applied transofrmation to the main <g class="everything"> we need these numbers for non svg elements like the pop-up box
    track_transform =  "translate(" + d3.event.transform.x + "," + d3.event.transform.y + ") scale(" + d3.event.transform.k + ")"
    track_transform_x = d3.event.transform.x 
    track_transform_y = d3.event.transform.y
    track_transform_k = d3.event.transform.k
    //console.log("translate(" + d3.event.transform.x + "," + d3.event.transform.y + ") scale(" + d3.event.transform.k + ")")
}

// ##################################
// simulating main() after page load
// ##################################
function onLoad(){

    // explicit set of SVG canvas to 100% and 100% with pixel sizes
    var mySVG = document.getElementById("canvas");
    mySVG.setAttribute("width",  window.innerWidth);
    mySVG.setAttribute("height", window.innerHeight);

    // D3 start
    svg = d3.select("svg"),
        width = +svg.attr("width"),
        height = +svg.attr("height");      

    g = svg.append("g").attr("class", "everything");      

    simulation = d3.forceSimulation()
        .force("link", d3.forceLink().strength(0).id(function(d) { return d.deviceId; }))
        //.force("charge", d3.forceManyBody().strength(0))
        // Extended original for vertical layers based on model
        // TODO: modify for dyamic layers based on "real" type number of layer 
        .force("y", d3.forceY(function(d){
			if(d.zone === "Level 1"){
				return (height*0.7)/3
			} else if (d.zone === "Level 2"){
				return 2*(height*0.7)/3
			} else {
				return 3*(height*0.7)/3
			}
         }).strength(1)) // maximum strenght as we do not want other forces to be strong enough to kick node out of layers
        .force("x", d3.forceX(function(d){
			if(d.hardware.type == "Printer"){
				return (width*0.6)/3
			} else {
				return 2*(width*0.6)/3
			}
         }).strength(0.1)) 
         
         /*
         .force('x', d3.forceX().x(function(d) {
            return xScale(d.value);
          }))
          .force('y', d3.forceY().y(function(d) {
            return 0;
          }))
          */         
         
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collision", d3.forceCollide().radius(50).strength(0.02)); // Radius is used for minimal distance between nodes to have space for text between them

    d3.json("OT-BASE-sample.json", function(error, assetData) {
        if (error) throw error;
      
        
        var link = g.append("g")
          .attr("class", "links")
          .selectAll("line")
          .data(assetData.links)
          .enter()
          .append("line")
          .attr("stroke-width", 1)
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
            var popup = document.getElementById("popup");  // using pre-created div to avoid impacting SVG structure for now
            popup.innerHTML = popupHTMLfromDATA(d)
            popup.style.display = "block" // changing from default none
            positionPopupOnPageXY(d.x,d.y, track_transform)
            
        },false);

        node.append("circle")
          .attr("r", 8.5)
          .attr("fill", nodeColor)
          .call(d3.drag()
              .on("start", dragstarted)
              .on("drag", dragged)
              .on("end", dragended));
              
        node.append("text")
            .attr("text-anchor", "middle")
            .attr("font-size", "1em")
            //.attr("dx", 12) // delta position against circle
            .attr("dy", 25) // delta position against circle as half of text size hight
            //.attr("x", +8)  // delta position against circle (for IE browser)
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



      

