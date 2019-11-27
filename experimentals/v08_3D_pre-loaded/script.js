// #######################
// Global variables
// #######################
var need_update_render = false;
var loading_running = true;
var num_of_items_to_load = 999999;
var num_of_items_loaded = 0;

var zscaleSize = d3.scale.linear().range([0, 500]).domain([0, 1000]);
var zscaleCost = d3.scale.linear().range([0, 500]).domain([0, 1000]);


var zAxis = "count"
var scaleDomainMax = 1000
var scaleRange = 500

var colorAttribute = "baseScore"
var colorScaleRange = 255

// #######
// POP-UP
// ######
// hides pop-up on click event
function hidePopup() {
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

// #####################
// Globals for tooptip
// #####################
var INTERSECTED;

// ###########################################################
// Mouse vector calculation for intersection vector of tooltip
// ###########################################################
mouse = { x: -1, y: -1, rawx: 0, rawy: 0 }
function onDocumentMouseMove(event) {
    // the following line would stop any other event handler from firing
    // (such as the mouse's TrackballControls)
    event.preventDefault();

    // update sprite position
    //sprite1.position.set( event.clientX, event.clientY - 20, 0 ); // the -20 is text height change

    // update the mouse variable
    mouse.rawx = event.clientX;
    mouse.rawy = event.clientY;
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1; // The 85 is a top margin
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    //console.log("mouse X:" + mouse.x + " y:" + mouse.y)
    //console.log("mouse rawX:" + mouse.rawx + " rawy:" + mouse.rawy)
}
document.addEventListener('mousemove', onDocumentMouseMove, false);


var OrRd = ["#fff7ec", "#fff7eb", "#fff6ea", "#fff6e9", "#fff5e7", "#fff5e6", "#fff4e5", "#fff4e4", "#fff3e3", "#fff3e2", "#fff2e1", "#fff2e0", "#fff1de", "#fff1dd", "#fff0dc", "#fff0db", "#feefda", "#feefd9", "#feeed7", "#feeed6", "#feedd5", "#feedd4", "#feecd3", "#feecd2", "#feebd0", "#feebcf", "#feeace", "#feeacd", "#fee9cc", "#fee9ca", "#fee8c9", "#fee8c8", "#fee7c7", "#fee7c6", "#fee6c4", "#fee5c3", "#fee5c2", "#fee4c1", "#fee4bf", "#fee3be", "#fee3bd", "#fee2bc", "#fee1ba", "#fee1b9", "#fee0b8", "#fee0b7", "#fedfb5", "#fedeb4", "#fedeb3", "#fdddb2", "#fddcb1", "#fddcaf", "#fddbae", "#fddaad", "#fddaac", "#fdd9ab", "#fdd8a9", "#fdd8a8", "#fdd7a7", "#fdd6a6", "#fdd6a5", "#fdd5a4", "#fdd4a3", "#fdd4a1", "#fdd3a0", "#fdd29f", "#fdd29e", "#fdd19d", "#fdd09c", "#fdcf9b", "#fdcf9a", "#fdce99", "#fdcd98", "#fdcc97", "#fdcc96", "#fdcb95", "#fdca94", "#fdc994", "#fdc893", "#fdc892", "#fdc791", "#fdc690", "#fdc58f", "#fdc48e", "#fdc38d", "#fdc28c", "#fdc18b", "#fdc08a", "#fdbf89", "#fdbe88", "#fdbd87", "#fdbc86", "#fdbb85", "#fdba84", "#fdb983", "#fdb882", "#fdb781", "#fdb680", "#fdb57f", "#fdb47d", "#fdb27c", "#fdb17b", "#fdb07a", "#fdaf79", "#fdae78", "#fdac76", "#fdab75", "#fdaa74", "#fca873", "#fca772", "#fca671", "#fca46f", "#fca36e", "#fca26d", "#fca06c", "#fc9f6b", "#fc9e6a", "#fc9c68", "#fc9b67", "#fb9a66", "#fb9865", "#fb9764", "#fb9563", "#fb9462", "#fb9361", "#fb9160", "#fa905f", "#fa8f5e", "#fa8d5d", "#fa8c5c", "#f98b5b", "#f9895a", "#f98859", "#f98759", "#f88558", "#f88457", "#f88356", "#f78155", "#f78055", "#f77f54", "#f67d53", "#f67c52", "#f67b52", "#f57951", "#f57850", "#f4774f", "#f4754f", "#f4744e", "#f3734d", "#f3714c", "#f2704c", "#f26f4b", "#f16d4a", "#f16c49", "#f06b49", "#f06948", "#ef6847", "#ef6646", "#ee6545", "#ed6344", "#ed6243", "#ec6042", "#ec5f42", "#eb5d41", "#ea5c40", "#ea5a3f", "#e9593e", "#e8573c", "#e8563b", "#e7543a", "#e65339", "#e65138", "#e55037", "#e44e36", "#e44c35", "#e34b34", "#e24932", "#e14831", "#e04630", "#e0442f", "#df432e", "#de412d", "#dd402b", "#dc3e2a", "#dc3c29", "#db3b28", "#da3927", "#d93826", "#d83624", "#d73423", "#d63322", "#d53121", "#d43020", "#d32e1f", "#d22c1e", "#d12b1d", "#d0291b", "#cf281a", "#ce2619", "#cd2518", "#cc2317", "#cb2216", "#ca2015", "#c91f14", "#c81d13", "#c71c12", "#c61b11", "#c51911", "#c31810", "#c2170f", "#c1150e", "#c0140d", "#bf130c", "#be120c", "#bc110b", "#bb100a", "#ba0e09", "#b80d09", "#b70c08", "#b60b07", "#b50b07", "#b30a06", "#b20906", "#b10805", "#af0705", "#ae0704", "#ac0604", "#ab0504", "#a90503", "#a80403", "#a60402", "#a50302", "#a40302", "#a20302", "#a00201", "#9f0201", "#9d0201", "#9c0101", "#9a0101", "#990101", "#970101", "#960100", "#940100", "#920000", "#910000", "#8f0000", "#8e0000", "#8c0000", "#8a0000", "#890000", "#870000", "#860000", "#840000", "#820000", "#810000", "#7f0000"]

function findGetParameter(parameterName) {
    var result = null,
        tmp = [];
    location.search
        .substr(1)
        .split("&")
        .forEach(function (item) {
            tmp = item.split("=");
            if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
        });
    return result
}

var animationDuration = findGetParameter('animationDuration')
if (animationDuration == null) {
    animationDuration = 1000
}

demo = {};

demo.Treemap3d = function () {


    var _width = window.innerWidth,
        _height = window.innerHeight,
        _renderer = null,
        _controls = null,
        _scene = new THREE.Scene(),
        _camera = new THREE.PerspectiveCamera(45, _width / _height, 1, 10000),
        _zmetric = zAxis,
        _colorScale = d3.scale.category20c(),
        _buttonBarDiv = null,
        _elements = null,
        _boxMap = {};
    // initialize object to perform world/screen calculations
    projector = new THREE.Projector();





    function Treemap3d(selection) {
        _camera.setLens(90);
        _camera.position.set(-4000, -3000, 5000);
        //var a = new THREE.Euler( 0, 1, 1.57, 'XYZ' );
        //_camera.rotation.set({ x : 1, y : 1, z : 1, order : 'XYZ' });
        _camera.lookAt(new THREE.Vector3(0, 0, 0));

        _renderer = Modernizr.webgl ? new THREE.WebGLRenderer({ antialias: true }) : new THREE.CanvasRenderer();
        _renderer.setSize(_width, _height);
        _renderer.setClearColor(0xFFFFFF);
        _renderer.domElement.style.position = 'absolute';
        _renderer.domElement.style.margin = '0px 0px';
        _renderer.domElement.style['z-index'] = '-1';
        _renderer.shadowMapEnabled = true;
        _renderer.shadowMapSoft = true;
        _renderer.shadowMapType = THREE.PCFShadowMap;
        _renderer.shadowMapAutoUpdate = true;

        ////////////////////////////////////////
        /*
        // create a canvas element
        canvas1 = document.createElement('canvas');
        context1 = canvas1.getContext('2d');
        context1.font = "Bold 20px Arial";
        context1.fillStyle = "rgba(0,0,0,0.95)";
        context1.fillText('Hello, world!', 0, 20);        
        
        // canvas contents will be used for a texture
        texture1 = new THREE.Texture(canvas1) 
        texture1.needsUpdate = true;  

        var spriteMaterial = new THREE.SpriteMaterial( { map: texture1, useScreenCoordinates: true } );
        
        sprite1 = new THREE.Sprite( spriteMaterial );
        sprite1.scale.set(200,100,1.0);
        sprite1.position.set( 50, 50, 0 );
        _scene.add( sprite1 );	
        */
        //////////////////////////////////////////  
        
        function zScaleSelected(value){
            console.log("zScaleSelected:");
            console.log(value);
    
            _zmetric = value;

            if (value == "count"){
                scaleDomainMax = 1000
            }
            if (value == "baseScore"){
                scaleDomainMax = 10
            }
            if (value == "critical"){
                scaleDomainMax = 100
            }                        

            transform();        
        }        

        function zColorSelected(value){
            console.log("zColorSelected:");
            console.log(value);
    
            colorAttribute = value;
            if (value == "baseScore"){
                colorScaleRange = 10
            }
            if (value == "critical"){
                colorScaleRange = 100
            }

            transform();        
        }        

        selection.node().appendChild(_renderer.domElement);
        controls = selection.append("div")
            .attr("class","controls")

        controls.append("div").text("Select Z - Scale attribute: ");
        selector = controls.append("div").attr("class","select")
        zScaleSelect = selector.append("select")
            .on("change", function(){
                zScaleSelected(this.value);
            })
        option1 = zScaleSelect.append("option")
            .text("Count")
            .attr("value","count")
        option2 = zScaleSelect.append("option")
            .text("baseScore")
            .attr("value","baseScore")
        option3 = zScaleSelect.append("option")
            .text("critical")
            .attr("value","critical")            
        selector.append("div").attr("class","select_arrow");  
        
        selector = controls.append("div").text("Select Coloring attribute: ");
        selector = controls.append("div").attr("class","select")
           
        zColorSelect = selector.append("select")
            .on("change", function(){
                zColorSelected(this.value);
            })
        option1 = zColorSelect.append("option")
            .text("baseScore")
            .attr("value","baseScore")
        option2 = zColorSelect.append("option")
            .text("critical")
            .attr("value","critical")           
        selector.append("div").attr("class","select_arrow");          
           

        /*
        _buttonBarDiv = selection.append("div")
            .attr("class", "controls")
            .text("Select Z-Scale attribute: ");
          

        _buttonBarDiv.append("button")
            .text("ZScale: Count (default)")
            .on("click", function () {
                _zmetric = "count";
                scaleDomainMax = 1000
                transform();
            });
        _buttonBarDiv.append("button")
            .text("ZScale: baseScore")
            .on("click", function () {
                _zmetric = "baseScore";
                scaleDomainMax = 10
                transform();
            });

        _buttonBarDiv.append("button")
            .text("ZScale: critical")
            .on("click", function () {
                _zmetric = "critical";
                scaleDomainMax = 100;
                transform();
            });

        _buttonBarDiv2 = selection.append("div")
            .attr("class", "controls")
            .text("Select Color attribute: ");


        _buttonBarDiv2.append("button")
            .text("Color: baseScore (default)")
            .on("click", function () {
                colorAttribute = "baseScore";
                colorScaleRange = 10
                transform();
            });

        _buttonBarDiv2.append("button")
            .text("Color: critical")
            .on("click", function () {
                colorAttribute = "critical";
                colorScaleRange = 100;
                transform();
            });

        _buttonBarDiv3 = selection.append("div")
            .attr("class", "controls")
            .text("Disable animations: ");


        _buttonBarDiv3.append("button")
            .text("Enable Animations (default)")
            .on("click", function () {
                animationDuration = 1000
                transform();
            });
        _buttonBarDiv3.append("button")
            .text("Disable Animations")
            .on("click", function () {
                animationDuration = 0
                transform();
            });

        _buttonBarDiv4 = selection.append("div")
            .attr("class", "controls-description")
            .text("[Drag with mouse to move/rotate; mouse wheel to zoom; right-drag to pan]");

        */

        function update_loading_count(){
            //LOADING UPDATE FOR USER
            if (loading_running){
                num_of_items_loaded = num_of_items_loaded + 1;
                // pop-up positioning on intersect
                var preload = document.getElementById("preload");

                // Information on pop-up text
                preload.innerHTML = "" + num_of_items_loaded + " / " + num_of_items_to_load;   
            }                    
        }


        function enterHandler(d) {
            //console.log("enterHandler")

            update_loading_count()

            if (d[colorAttribute] == null) { d[colorAttribute] = 0; }
            
            var box = box_threemap(d);
            if (box == null) {return;}
            box.castShadow = true;
            _boxMap[d.id] = box;

            _scene.add(box);
        }

        function box_threemap(d){
            //console.log("box_threemap")
            if (d.count == null) { d.count = 0; return null; }

            /// THreemap calculations
            var d3scale = d3.scale.linear().range([0, scaleRange]).domain([0, scaleDomainMax]);
            var zvalue = d3scale(d[_zmetric])
            var newMetrics = {
                x: d.x + (d.dx / 2) - _width / 2,
                y: d.y + (d.dy / 2) - _height / 2,
                z: zvalue / 2,
                w: Math.max(1, d.dx - 1),
                h: Math.max(1, d.dy - 1),
                d: Math.max(1, zvalue)
            };     
 
            var boxGeometry = new THREE.BoxGeometry(1,1,1);
            //var boxMaterial = new THREE.MeshLambertMaterial({color: _colorScale(d[colorAttribute])});
            var boxMaterial = new THREE.MeshLambertMaterial({ color: OrRd[((d[colorAttribute] * d[colorAttribute] * d[colorAttribute]) * 0.255).toFixed()] });
            //console.log(OrRd[((d[colorAttribute] * d[colorAttribute] * d[colorAttribute]) * 0.255).toFixed()])

            var box = new THREE.Mesh(boxGeometry, boxMaterial);  
            box.scale = { x: newMetrics.w, y: newMetrics.h, z: newMetrics.d }
            box.position = { x: newMetrics.x, y: newMetrics.y, z: newMetrics.z }
            box.rotation = { x: box.rotation.x, y: box.rotation.y, z: box.rotation.z }
            //box.material.color.set(OrRd[((d[colorAttribute] * d[colorAttribute] * d[colorAttribute]) * 0.255).toFixed()]);

            // TOOLTIP data
            box.name = d.name;
            box.priority = d.priority;
            box.baseScore = d.baseScore;
            box.count = d.count;
            box.critical = d.critical;  

            return box;
        }



        function updateHandler(d) {
            //console.log("updateHandler")
            //console.log(d)
            if (d.count == null) { return; }
            if (d.id == null) { return; }
            var d3scale = d3.scale.linear().range([0, scaleRange]).domain([0, scaleDomainMax]);
            //console.log("Entry zscale: " + d[zAxis]);
            var zvalue = d3scale(d[_zmetric]) //(_zmetric === "count" ? d3scale(d.count) : (_zmetric === "baseScore" ? d3scale(d.baseScore) : d3scale(10)));
            //console.log("Scaled zscale: " + zvalue)
            var box = _boxMap[d.id];
            box.material.color.set(OrRd[((d[colorAttribute] * d[colorAttribute] * d[colorAttribute]) * 0.255).toFixed()]);
            var newMetrics = {
                x: d.x + (d.dx / 2) - _width / 2,
                y: d.y + (d.dy / 2) - _height / 2,
                z: zvalue / 2,
                w: Math.max(1, d.dx - 1),
                h: Math.max(1, d.dy - 1),
                d: Math.max(1, zvalue)
            };
            box.name = d.name;
            box.priority = d.priority;
            box.baseScore = d.baseScore;
            box.count = d.count;
            box.critical = d.critical;
            /*
            console.log("X:" + newMetrics.x);
            console.log("Y:" + newMetrics.y);
            console.log("Z:" + newMetrics.z);
            console.log("W:" + newMetrics.w);
            console.log("h:" + newMetrics.h);
            console.log("d:" + newMetrics.d);
            */
        
            box.position = { x: newMetrics.x, y: newMetrics.y, z: newMetrics.z }
            //box.scale.x = newMetrics.w
            //box.scale.y = newMetrics.h
            box.scale.x = newMetrics.w;
            box.scale.y = newMetrics.h;
            box.scale.z = newMetrics.d;
            box.rotation = { x: box.rotation.x, y: box.rotation.y, z: box.rotation.z }
            /*
            var coords = new TWEEN.Tween(box.position)
                .to({ x: newMetrics.x, y: newMetrics.y, z: newMetrics.z }, animationDuration)
                //.easing(TWEEN.Easing.Sinusoidal.InOut)
                .start();

            var dims = new TWEEN.Tween(box.scale)
                .to({ x: newMetrics.w, y: newMetrics.h, z: newMetrics.d }, animationDuration)
                //.easing(TWEEN.Easing.Sinusoidal.InOut)
                .start();

            var newRot = box.rotation;
            var rotate = new TWEEN.Tween(box.rotation)
                .to({ x: newRot.x, y: newRot.y, z: newRot.z }, animationDuration)
                //.easing(TWEEN.Easing.Sinusoidal.InOut)
                .start();

            var update = new TWEEN.Tween(this)
                .to({}, animationDuration)
                .onUpdate(_.bind(render, this))
                .start();
            */

   
            
           need_update_render = true;
        }

        function tooltip() {

            needs_render_update = false;

            // create a Ray with origin at the mouse position
            //   and direction into the scene (camera direction)
            var vector = new THREE.Vector3(mouse.x, mouse.y, 1);
            projector.unprojectVector(vector, _camera);
            var ray = new THREE.Raycaster(_camera.position, vector.sub(_camera.position).normalize());

            // create an array containing all objects in the scene with which the ray intersects
            var intersects = ray.intersectObjects(_scene.children);

            // INTERSECTED = the object in the scene currently closest to the camera 
            //		and intersected by the Ray projected from the mouse position 	

            // if there is one (or more) intersections
            if (intersects.length > 0) {
                console.log("YES - length:" + intersects.length)
                console.log("ID:" + intersects[0].object.name)
                console.log("priority:" + intersects[0].object.priority)
                console.log("baseScore:" + intersects[0].object.baseScore)
                console.log("count:" + intersects[0].object.count)
                console.log("critical:" + intersects[0].object.critical)

                if (intersects[0].object != INTERSECTED) {
                    // Restore previous object
                    if (INTERSECTED != null) {
                        INTERSECTED.material.color.setHex(INTERSECTED.currentHex)
                    }
                    // Store new one
                    INTERSECTED = intersects[0].object
                    INTERSECTED.currentHex = INTERSECTED.material.color.getHex()
                    intersects[0].object.material.color.setHex(0xffff00);

                    // mark for render update
                    needs_render_update = true;
                }

                // pop-up positioning on intersect
                var popup = document.getElementById("popup");
                popup.style.display = "block";

                // Information on pop-up text
                popup.innerHTML = "<b>" + intersects[0].object.name + "</b>"
                    + "<br>Count:" + intersects[0].object.count
                    + "<br>Priority:" + intersects[0].object.priority
                    + "<br>baseScore:" + intersects[0].object.baseScore
                    + "<br>Critical:" + intersects[0].object.critical

                positionPopupOnPageXY(mouse.rawx, mouse.rawy);
            }
            else {
                // Restore previous object
                if (INTERSECTED != null) {
                    INTERSECTED.material.color.setHex(INTERSECTED.currentHex)
                    INTERSECTED = null;
                    needs_render_update = true;
                }

                // pop-up positioning on intersect
                var popup = document.getElementById("popup");
                popup.style.display = "none";
            }

            return needs_render_update;
        }

        function exitHandler(d) {
            //console.log("exit handler")
            var box = _boxMap[d.id];
            _scene.remove(box);
            delete _boxMap[d.id];
        }

        function transform() {
            //console.log("transform")
            //console.log(_elements)
            _elements.each(updateHandler);
            if (loading_running){
                loading_running = false;
                var preload = document.getElementById("preload");
                preload.style.display = 'none';                
            }
        }

        function render() {
            //console.log("render")
            _renderer.render(_scene, _camera);
        }

        function animate() {
            //console.log("animate")
            requestAnimationFrame(animate);
            if (tooltip()) {
                render()
            }
            if (need_update_render){
                need_update_render = false;
                render()
            }
            console.log(_camera)
            TWEEN.update();
            _controls.update();
        }

        Treemap3d.load = function (data) {

            // UPDATE LOADING SCREEN WITH DATA
            num_of_items_to_load = data.children.length;

            //console.log("LOAD")
            //console.log(data.children.length)
            var treemap = d3.layout.treemap()
                .size([_width, _height])
                .sticky(true)
                .value(function (d) {
                    return d.count;
                });
            zscaleSize.domain(d3.extent(data, function (d) { return d.count; }));
            zscaleCost.domain(d3.extent(data, function (d) { return d.baseScore; }));

            _elements = selection.datum(data).selectAll(".node")
                .data(treemap.nodes);

            _elements.enter().append("div")
                .attr("class", "node")
                .each(enterHandler);

            _elements.exit().each(exitHandler).remove();

            render();
            animate();
            transform();
        };

        var directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1.0);
        directionalLight.position.set(-1000, -2000, 4000);
        _scene.add(directionalLight);
        var directionalLight2 = new THREE.DirectionalLight(0xFFFFFF, 1.0);
        directionalLight2.position.set(1000, 2000, -4000);
        _scene.add(directionalLight2);        

        // add subtle ambient lighting
        var ambientLight = new THREE.AmbientLight(0x313131);
        _scene.add(ambientLight);

        //_controls = new THREE.OrbitControls(_camera, _renderer.domElement);
        _controls = new THREE.TrackballControls(_camera, _renderer.domElement);
        _controls.staticMoving = true;
        _controls.minDistance = 100;
        _controls.maxDistance = 6000;
        _controls.rotateSpeed = 1.5;
        _controls.zoomSpeed = 1.5;
        _controls.panSpeed = 0.5;
        _controls.addEventListener('change', render);
    }

    return Treemap3d;
};

file_to_load = findGetParameter('json')
if (file_to_load == null) {
    file_to_load = "CVEdata_small.json"
}

function translate_otbase_json_to_d3_treemap_hierarchy(data) {

    var result = {}
    result["name"] = "tree"
    result["children"] = []
    var arrayLength = data.length;

    for (var i = 0; i < arrayLength; i++) {

        result['children'].push({
            id: i,
            name: data[i].id,
            priority: data[i].priority,
            baseScore: data[i].baseScore,
            count: data[i].count,
            critical: data[i].critical
        })
    }

    //console.log(result)
    return result;

}

d3.json(file_to_load, function (data) {

    //console.log(data)

    data_sanitized = translate_otbase_json_to_d3_treemap_hierarchy(data);

    var treemap3d = demo.Treemap3d();
    d3.select("#container_pehomu").call(treemap3d);
    
        //.append("div")
        //.style("position", "relative")
        //.attr("class", "controls")
        //.style("z-index", "-1")
        
    treemap3d.load(data_sanitized);
});


window.addEventListener("resize", function () {
    //console.log(window.innerWidth)
    var newWidth = window.innerWidth,
        newHeight = window.innerHeight;
    _renderer.setSize(newWidth, newHeight);
    _camera.aspect = newWidth / newHeight;
    _camera.updateProjectionMatrix();
});