var zscaleSize     = d3.scale.linear().range([0,500]).domain([0,1000]);
var zscaleCost     = d3.scale.linear().range([0,500]).domain([0,1000]);


var zAxis           = "count"
var scaleDomainMax  = 1000
var scaleRange      = 500

var colorAttribute  = "baseScore"
var colorScaleRange = 255



var OrRd = ["#fff7ec","#fff7eb","#fff6ea","#fff6e9","#fff5e7","#fff5e6","#fff4e5","#fff4e4","#fff3e3","#fff3e2","#fff2e1","#fff2e0","#fff1de","#fff1dd","#fff0dc","#fff0db","#feefda","#feefd9","#feeed7","#feeed6","#feedd5","#feedd4","#feecd3","#feecd2","#feebd0","#feebcf","#feeace","#feeacd","#fee9cc","#fee9ca","#fee8c9","#fee8c8","#fee7c7","#fee7c6","#fee6c4","#fee5c3","#fee5c2","#fee4c1","#fee4bf","#fee3be","#fee3bd","#fee2bc","#fee1ba","#fee1b9","#fee0b8","#fee0b7","#fedfb5","#fedeb4","#fedeb3","#fdddb2","#fddcb1","#fddcaf","#fddbae","#fddaad","#fddaac","#fdd9ab","#fdd8a9","#fdd8a8","#fdd7a7","#fdd6a6","#fdd6a5","#fdd5a4","#fdd4a3","#fdd4a1","#fdd3a0","#fdd29f","#fdd29e","#fdd19d","#fdd09c","#fdcf9b","#fdcf9a","#fdce99","#fdcd98","#fdcc97","#fdcc96","#fdcb95","#fdca94","#fdc994","#fdc893","#fdc892","#fdc791","#fdc690","#fdc58f","#fdc48e","#fdc38d","#fdc28c","#fdc18b","#fdc08a","#fdbf89","#fdbe88","#fdbd87","#fdbc86","#fdbb85","#fdba84","#fdb983","#fdb882","#fdb781","#fdb680","#fdb57f","#fdb47d","#fdb27c","#fdb17b","#fdb07a","#fdaf79","#fdae78","#fdac76","#fdab75","#fdaa74","#fca873","#fca772","#fca671","#fca46f","#fca36e","#fca26d","#fca06c","#fc9f6b","#fc9e6a","#fc9c68","#fc9b67","#fb9a66","#fb9865","#fb9764","#fb9563","#fb9462","#fb9361","#fb9160","#fa905f","#fa8f5e","#fa8d5d","#fa8c5c","#f98b5b","#f9895a","#f98859","#f98759","#f88558","#f88457","#f88356","#f78155","#f78055","#f77f54","#f67d53","#f67c52","#f67b52","#f57951","#f57850","#f4774f","#f4754f","#f4744e","#f3734d","#f3714c","#f2704c","#f26f4b","#f16d4a","#f16c49","#f06b49","#f06948","#ef6847","#ef6646","#ee6545","#ed6344","#ed6243","#ec6042","#ec5f42","#eb5d41","#ea5c40","#ea5a3f","#e9593e","#e8573c","#e8563b","#e7543a","#e65339","#e65138","#e55037","#e44e36","#e44c35","#e34b34","#e24932","#e14831","#e04630","#e0442f","#df432e","#de412d","#dd402b","#dc3e2a","#dc3c29","#db3b28","#da3927","#d93826","#d83624","#d73423","#d63322","#d53121","#d43020","#d32e1f","#d22c1e","#d12b1d","#d0291b","#cf281a","#ce2619","#cd2518","#cc2317","#cb2216","#ca2015","#c91f14","#c81d13","#c71c12","#c61b11","#c51911","#c31810","#c2170f","#c1150e","#c0140d","#bf130c","#be120c","#bc110b","#bb100a","#ba0e09","#b80d09","#b70c08","#b60b07","#b50b07","#b30a06","#b20906","#b10805","#af0705","#ae0704","#ac0604","#ab0504","#a90503","#a80403","#a60402","#a50302","#a40302","#a20302","#a00201","#9f0201","#9d0201","#9c0101","#9a0101","#990101","#970101","#960100","#940100","#920000","#910000","#8f0000","#8e0000","#8c0000","#8a0000","#890000","#870000","#860000","#840000","#820000","#810000","#7f0000"]

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
if (animationDuration == null){
    animationDuration = 1000 
}

demo = {};

demo.Treemap3d = function() {


    var _width          = window.innerWidth,
        _height         = window.innerHeight,
        _renderer       = null,
        _controls       = null,
        _scene          = new THREE.Scene(),
        _camera         = new THREE.PerspectiveCamera(45, _width/_height , 1, 10000),
        _zmetric        = zAxis,
        _colorScale     = d3.scale.category20c(),
        _buttonBarDiv   = null,
        _elements       = null,
        _boxMap         = {};

    

    function Treemap3d(selection) {
        _camera.setLens(80);
        _camera.position.set(-1000, -5000, 2000);
        
        _renderer = Modernizr.webgl ? new THREE.WebGLRenderer({antialias: true}) : new THREE.CanvasRenderer();
        _renderer.setSize(_width, _height);
        _renderer.setClearColor(0xFFFFFF);
        _renderer.domElement.style.position = 'absolute';
        _renderer.domElement.style.margin = '85px 0px';
        _renderer.shadowMapEnabled = true;
        _renderer.shadowMapSoft = true;
        _renderer.shadowMapType = THREE.PCFShadowMap;
        _renderer.shadowMapAutoUpdate = true;
        
        selection.node().appendChild(_renderer.domElement);

        _buttonBarDiv = selection.append("div")
            .attr("class", "controls")
            .text("Select Z-Scale attribute: ");

        _buttonBarDiv.append("button")
            .text("ZScale: Count (default)")
            .on("click", function() {
                _zmetric = "count";
                scaleDomainMax = 1000
                transform();
            });
        _buttonBarDiv.append("button")
            .text("ZScale: baseScore")
            .on("click", function() {
                _zmetric = "baseScore";
                scaleDomainMax = 10
                transform();
            });

        _buttonBarDiv.append("button")
            .text("ZScale: critical")
            .on("click", function() {
                _zmetric = "critical";
                scaleDomainMax = 100;
                transform();
            }); 
            
        _buttonBarDiv2 = selection.append("div")
        .attr("class", "controls")
        .text("Select Color attribute: ");

            
        _buttonBarDiv2.append("button")
            .text("Color: baseScore (default)")
            .on("click", function() {
                colorAttribute = "baseScore";
                colorScaleRange = 10
                transform();
            });

        _buttonBarDiv2.append("button")
            .text("Color: critical")
            .on("click", function() {
                colorAttribute = "critical";
                colorScaleRange = 100;
                transform();
            }); 

        _buttonBarDiv3 = selection.append("div")
        .attr("class", "controls")
        .text("Disable animations: ");

            
        _buttonBarDiv3.append("button")
            .text("Enable Animations (default)")
            .on("click", function() {
                animationDuration = 1000
                transform();
            });
        _buttonBarDiv3.append("button")
            .text("Disable Animations")
            .on("click", function() {
                animationDuration = 0
                transform();
            });
                      
        
        

        function enterHandler(d) {
            var boxGeometry = new THREE.BoxGeometry(1,1,1);
            //var boxMaterial = new THREE.MeshLambertMaterial({color: _colorScale(d[colorAttribute])});
            var boxMaterial = new THREE.MeshLambertMaterial({color: OrRd[ ( (d[colorAttribute] * d[colorAttribute] * d[colorAttribute]) * 0.255 ).toFixed() ] });
            console.log(OrRd[ ( (d[colorAttribute] * d[colorAttribute] * d[colorAttribute]) * 0.255 ).toFixed() ])
            
            var box = new THREE.Mesh(boxGeometry, boxMaterial);
            box.castShadow = true;
            _boxMap[d.id] = box;
            _scene.add(box);
        }
        
        

        function updateHandler(d) {
            if (d.count == null){ d.count = 0; return;}

            var d3scale = d3.scale.linear().range([0,scaleRange]).domain([0,scaleDomainMax]);
            console.log("Entry zscale: " + d[zAxis]);
            var zvalue = d3scale(d[_zmetric]) //(_zmetric === "count" ? d3scale(d.count) : (_zmetric === "baseScore" ? d3scale(d.baseScore) : d3scale(10)));
            console.log("Scaled zscale: " + zvalue)
            var box = _boxMap[d.id];
            box.material.color.set(  OrRd[ ( (d[colorAttribute] * d[colorAttribute] * d[colorAttribute]) * 0.255 ).toFixed() ] );
            var newMetrics = {
                x: d.x + (d.dx / 2) - _width / 2,
                y: d.y + (d.dy / 2) - _height / 2,
                z: zvalue / 2,
                w: Math.max(0, d.dx-1),
                h: Math.max(0, d.dy-1),
                d: zvalue
            };
            var coords = new TWEEN.Tween(box.position)
                .to({x: newMetrics.x, y: newMetrics.y, z: newMetrics.z}, animationDuration)
                //.easing(TWEEN.Easing.Sinusoidal.InOut)
                .start();
                
            var dims = new TWEEN.Tween(box.scale)
                .to({x: newMetrics.w, y: newMetrics.h, z: newMetrics.d}, animationDuration)
                //.easing(TWEEN.Easing.Sinusoidal.InOut)
                .start();
                
            var newRot = box.rotation;
            var rotate = new TWEEN.Tween(box.rotation)
                .to({x: newRot.x, y: newRot.y, z: newRot.z}, animationDuration)
                //.easing(TWEEN.Easing.Sinusoidal.InOut)
                .start();
                
            var update = new TWEEN.Tween(this)
                .to({}, animationDuration)
                .onUpdate(_.bind(render, this))
                .start();
        }
        
        function exitHandler(d) {
            var box = _boxMap[d.id];
            _scene.remove(box);
            delete _boxMap[d.id];
        }
        
        function transform() {
            TWEEN.removeAll();
            _elements.each(updateHandler);
        }
        
        function render() {
            _renderer.render(_scene, _camera);
        }
        
        function animate() {
            requestAnimationFrame(animate);
            TWEEN.update();
            _controls.update();
        }
            
        Treemap3d.load = function(data) {
            var treemap = d3.layout.treemap()
                .size([_width, _height])
                .sticky(true)
                .value(function(d) { 
                    return d.count;
                });
            zscaleSize.domain(d3.extent(data, function(d) { return d.count;}));
            zscaleCost.domain(d3.extent(data, function(d) { return d.baseScore;}));
                        
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
        
        // add subtle ambient lighting
        var ambientLight = new THREE.AmbientLight(0x313131);
        _scene.add(ambientLight);
        
        //_controls = new THREE.OrbitControls(_camera, _renderer.domElement);
        _controls = new THREE.TrackballControls(_camera, _renderer.domElement);
        _controls.staticMoving  = true;
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
if (file_to_load == null){
  file_to_load = "CVEdata_small.json" 
}

function translate_otbase_json_to_d3_treemap_hierarchy(data){

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

    console.log(result)
    return result;

}

d3.json(file_to_load, function(data){

    console.log(data)

    data_sanitized = translate_otbase_json_to_d3_treemap_hierarchy(data);

    var treemap3d = demo.Treemap3d();
    d3.select("#container_pehomu").append("div")
        .style("position", "relative")
        .call(treemap3d);
    treemap3d.load(data_sanitized);  
});


window.addEventListener("resize", function() {
    console.log(window.innerWidth)
    var newWidth  = window.innerWidth,
        newHeight = window.innerHeight;
    _renderer.setSize(newWidth, newHeight);
    _camera.aspect = newWidth / newHeight;
    _camera.updateProjectionMatrix();
});