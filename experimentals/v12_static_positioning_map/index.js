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
function positionPopupOnPageXY(X, Y) {

    var intVPW, intVPH;             // view port width / height

    // distance from click point to view port top 
    var intCoordX = X;
    var intCoordY = Y;
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
    popup.style.zIndex = '99';

    if (intCoordX > intVPW / 2) { intPopupOffsetLeft -= popup.offsetWidth; }
    // if x is in the right half of the viewport, pull popup left by its width
    else { intPopupOffsetLeft = intPopupOffsetLeft + 50 }

    if (intCoordY > intVPH / 2) { intPopupOffsetTop -= popup.offsetHeight; }
    // if y is in the bottom half of view port, pull popup up by its height
    else { intPopupOffsetTop = intPopupOffsetTop + 60 }

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

/*
function dragstarted(d) {
    //if (!d3.event.active) simulation.alphaTarget(1).restart();
    
    console.log("DRAGSTART") 
    console.log(d.x)
    console.log(d.y)
    console.log(d)
    
    console.log(d.deviceId)
    d3.select(d.deviceId);


    //d3.select(this)
    //.attr("x", d3.event.x)
    //.attr("y", d3.event.y)    
    d.fx = d.x;
    d.fy = d.y;
    
}

function dragged(d,fake_this) {
    console.log("DRAGGED") 
    console.log(d3.event.x)
    console.log(d3.event.y)
    console.log(d)
    console.log(fake_this)

    console.log(d.deviceId)
    svg = d3.select("svg")
    node = svg.select("#" + d.deviceId);
    console.log("NODE:")
    console.log(node)

    node.attr("transform", "translate(" + (d3.event.x) + "," + (d3.event.y) + ")")  

    d.fx = d3.event.x;
    d.fy = d3.event.y;

    d3.select(d)
    .attr("x", d3.event.x)
    .attr("y", d3.event.y); 
    
    // SELECTING ALL LINKS 
}

function dragended(d) {
  //if (!d3.event.active) simulation.alphaTarget(0);
  d.fx = d.x;
  d.fy = d.y;
}
*/
 
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
// This function goes through the raw 
// JSON end extend it with manually 
// calculated positions for nodes
// ##################################
function hierarchy_structure_analysis(data){
    console.log("hierarchy_structure_analysis: ")
    console.log(data)

    // Hierarchy is like this
    // -- first layer key is layer
    // -- second layer key is hw type
    var HierarchyLayersDict = {};

    // Basic parameters we want to establish
    var LayerSet = new Set(['Undefined'])

    // Go via nodes and get basics like number of layers and number of types in each layer 
    var i;
    var ii;
    for (i = 0; i < data.devices.length; i++) {
        console.log(data.devices[i])
        if (data.devices[i]['zone'] != null){
            console.log("Not null zone")
            LayerSet.add(data.devices[i]['zone'])
            
            if (HierarchyLayersDict[data.devices[i]['zone']] == null){
                HierarchyLayersDict[data.devices[i]['zone']] = {}    
            } 
            if (HierarchyLayersDict[data.devices[i]['zone']][data.devices[i].hardware.type] == null){
                HierarchyLayersDict[data.devices[i]['zone']][data.devices[i].hardware.type] = []
            }

            // ADD A DEVICE TO THE LAYER - and - HW TYPE
            HierarchyLayersDict[data.devices[i]['zone']][data.devices[i].hardware.type].push(data.devices[i])

        }else{
            if (HierarchyLayersDict["Undefined"] == null ){
                HierarchyLayersDict["Undefined"] = {}
                HierarchyLayersDict["Undefined"]["Undefined"] = []
            } 
            
            // ADD A DEVICE TO THE UNDEFINED LAYER AND HW TYPE
            HierarchyLayersDict["Undefined"]["Undefined"].push(data.devices[i])
        }
    }
    console.log("RESULTS:")
    console.log("Num of layers - " + Object.keys(HierarchyLayersDict).length)
    console.log(HierarchyLayersDict) 


    
    // ###################################################
    // Now lets update the JSON with visualization details
    // ###################################################
    width   = window.innerWidth;
    height  = window.innerHeight

    // Layers separation
    height_step = height / ( Object.keys(HierarchyLayersDict).length + 1)
    width_step  = width  / 10  // For now an arbitrary step

    data.devices = []

    // ITERATE OVER HIERARCHY TO ADD POSITIONING:
    console.log("HIERARCHY:")

    iLayerIter = 1;
    for (var layer in HierarchyLayersDict){
        
        iDeviceStep = 1;
        for ( var hw_type in HierarchyLayersDict[layer]){
            
            
            console.log(HierarchyLayersDict[layer][hw_type])
            for (i = 0; i < HierarchyLayersDict[layer][hw_type].length; i++) {
                HierarchyLayersDict[layer][hw_type][i]['y'] = iLayerIter * height_step;
                HierarchyLayersDict[layer][hw_type][i]['x'] = iDeviceStep * width_step;
                
                data.devices.push(HierarchyLayersDict[layer][hw_type][i])

                iDeviceStep = iDeviceStep + 1
            }
        }
        iLayerIter  = iLayerIter + 1;
    }

    return data
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

    d3.json("OT-BASE-sample.json", function(error, assetData) {
        if (error) throw error;
      
        // DATA ANALYSIS STARTS HERE
        assetData = hierarchy_structure_analysis(assetData)
        console.log(assetData)
        
        var link = g.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(assetData.links)
            .enter()
            .append("line")
            .attr("stroke-width", 0.5)
            .attr("source", function(d){return d.source;})
            .attr("target", function(d){return d.target;})
            .attr('x1',function(d){
                var i;
                for (i = 0; i < assetData.devices.length; i++) { 
                    if (d.source == assetData.devices[i].deviceId){
                        return assetData.devices[i].x;    
                    }
                }               
            })
            .attr('y1',function(d){
                var i;
                for (i = 0; i < assetData.devices.length; i++) { 
                    if (d.source == assetData.devices[i].deviceId){
                        return assetData.devices[i].y;    
                    }
                }               
            }) 
            .attr('x2',function(d){
                var i;
                for (i = 0; i < assetData.devices.length; i++) { 
                    if (d.target == assetData.devices[i].deviceId){
                        return assetData.devices[i].x;    
                    }
                }               
            })
            .attr('y2',function(d){
                var i;
                for (i = 0; i < assetData.devices.length; i++) { 
                    if (d.target == assetData.devices[i].deviceId){
                        return assetData.devices[i].y;    
                    }
                }               
            })                        
            .style("stroke", "red");

        
        // Restructured node from single <circle> into structure of
        // <a> <circle></circle> <text></text> </a> to hold a title text
        var node = g.append("g")
          .attr("class", "nodes")
          .selectAll("a")             // this just produces empty objects array
          .data(assetData.devices)    // attach to each 
          .enter()                    
          .append('a')
            .attr("id",function(d){return d.deviceId;})
            .attr("target", '_blank')
            .attr("x", function(d){return d.x;})
            .attr("y", function(d){return d.y;})
            .attr("transform", function(d){
                return "translate(" + d.x + "," + d.y + ")";
            })            
            //.attr("transform", "translate( 300,300 )")
            .attr("xlink:href",  function(d) { return (window.location.href + '?device=' + d.deviceId) })
            .call(d3.drag()
                .on("drag", function (d) {
                    d3.select(this)
                        .attr("x", d3.event.x)
                        .attr("y", d3.event.y)
                        .attr("transform", "translate(" + (d3.event.x) + "," + (d3.event.y) + ")");

                    //SELECT ALL LINKS THAT HAS THIS NODE AS SOURCE
                    //console.log("line[source='"+d.deviceId+"']")
                    links = g.selectAll('line[source=\''+d.deviceId+'\'')
                        .attr('x1',d3.event.x)
                        .attr('y1',d3.event.y)  
                    //console.log("line[target='"+d.deviceId+"']")
                    links = g.selectAll('line[target=\''+d.deviceId+'\'')
                        .attr('x2',d3.event.x)
                        .attr('y2',d3.event.y)                                             
                    //console.log(links._groups[0])
                }));
            
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
          /*.call(d3.drag()
              .on("start", dragstarted)
              .on("drag", dragged)
              .on("end", dragended));
          */    
        node.append("text")
            .attr("text-anchor", "middle")
            .attr("font-size", "0.5em")
            //.attr("dx", 12) // delta position against circle
            .attr("dy", 25) // delta position against circle as half of text size hight
            //.attr("x", +8)  // delta position against circle (for IE browser)
            .text(function(d) { return d.deviceId }); 
                       
      
        // I do not think this will work like this
        //node.append("title")
        //    .text(function(d) { return d.deviceId; });
      
        /*
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
        */
    });    

    // Zoom
    var zoom_handler = d3.zoom()
    .on("zoom", zoom_actions);    
    zoom_handler(svg); 
}



      

