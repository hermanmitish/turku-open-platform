importScripts('modules/turf.min.js', 'modules/d3/d3.js');
var selected = {};
var progress = 0;
var pr = 5;
let treshold =1000;
const data = {"Space":{
    "Building Reach":{"axis":"Building Reach","value":0},
    "FAR":{"axis":"FAR","value":0},
    "Pedestrian Access":{"axis":"Pedestrian Access","value":0},
    "Urban Access":{"axis":"Urban Access","value":0},
    "Walkability":{"axis":"Walkability","value":0}},
"Activities":{
    "Consumption":{"axis":"Consumption","value":0},
    "Mobility":{"axis":"Mobility","value":0},
    "Necessary Activities":{"axis":"Necessary Activities","value":0},
    "Optional Activities":{"axis":"Optional Activities","value":0},
    "Diversity":{"axis":"Diversity","value":0}},
"Values":{
    "Indoor Activity":{"axis":"Indoor Activity","value":0},
    "Lively Places":{"axis":"Lively Places","value":0},
    "Popular Indoor":{"axis":"Popular Indoor","value":0},
    "Popular Outdoor":{"axis":"Popular Outdoor","value":0},
    "Real Estate":{"axis":"Real Estate","value":0}},
"Totals":{
    "Space Total":{"axis":"Space Total","value":0},
    "Activities Total":{"axis":"Activities Total","value":0},
    "Values Total":{"axis":"Values Total","value":0}}}


onmessage = function(e) {
    var point = e.data[0];
    var dict = e.data[1];
    var roads = e.data[2];
    var dots = e.data[3]
    var ind = Number(e.data[4])
    //var data = {"Space":[],"Activities":[],"Values":[],"Totals":[]};
    var total = e.data[7]
    var max = e.data[8];
    let inColor = e.data[6];
    var iterations = 0;
GrowthProcess(point.geometry.coordinates, dict, roads.features, total);
function GrowthProcess (point, dict, roads, total) {
    if(total<=200){treshold=1}else if(total<=400){treshold=3}else if(total<=600){treshold=10}else{treshold=1000}
    var selected = {};
    var progress = 0;
    var pr = 5;


    function assign(obj, keyPath, value) {
        lastKeyIndex = keyPath.length-1;
        for (var i = 0; i < lastKeyIndex; ++ i) {
            
            key = keyPath[i];
            if (!(key in obj))
            obj[key] = {}
            obj = obj[key];
        }
        obj[keyPath[lastKeyIndex]] = value;
    }

    function Color (d, ind){
        function Saturation(c){
            var col = d3.hsl(c);
            col.h=d3.hsl(inColor).h - d3.hsl(d3.interpolatePuBuGn(0.7)).h + d3.hsl(d3.interpolatePuBuGn(0.4+(d*0.3))).h;
            if(ind===1){col.s*=0.5;col.l*=1.2;}else if(ind===0){col.l*=1.25}else{col.s*=0.8;col.l*=1.35}
            col.l*=0.9;
            return col;
        }
        return  d3.rgb(Saturation(d3.interpolatePuBuGn(0.45+(d*0.2)))).toString();
    }

    function PointPr (coords){
        return [Number(coords[0].toFixed(pr)),Number(coords[1].toFixed(pr))];
    }
    //let polyline = {"type": "MultiLineString","coordinates": []}

    let polyline = turf.combine(turf.featureCollection(roads)).features[0];

    var snapped = turf.nearestPointOnLine(polyline, point, {units: 'meters'}).geometry.coordinates;
    var line = turf.lineString([point, snapped])
    line = turf.transformScale(line,1.02);
    line.properties.color='white'
    line.properties.start=0;
    line.properties.end=0;
    line.properties.flip=false;
    selected[0] = line;
    //var cnt =0;

    
        var executed = false;
let iterationDict = {};
        const Growth = function (branch, node, distance, iter){
            //console.log(iter)
            if (distance==null){distance=0};
            //console.log(distance/total, progress)
            if (distance/total>=progress){
                progress=distance/total
                //console.log(progress);
                //postMessage([progress, null, true]);
            }
            // console.log(distance);
    
            distance= Number(distance).toFixed(pr);
            total=Number(total).toFixed(pr);
            var f= 1; var g= 0.9;
            if(branch){
                var c_length = Number(turf.length(branch,{units:"meters"})).toFixed(pr)
                if(String(PointPr(branch.geometry.coordinates[0]))==String(node)){
                    var flip = 0; var dir = PointPr(branch.geometry.coordinates[branch.geometry.coordinates.length-1]);
                    
                }else{
                    var flip = 1; var dir = PointPr(branch.geometry.coordinates[0]);
                    
                }
                //Setting up dir and node values
            
            }else{
                branch = {properties:{start:0, end:0.0001, flip:0}}
                var c_length = 0
                dir=node;//console.log("dir=node")
                assign(dict, [node, node], {'id':roads.length, 'end': 0, 'start': 0.0001});
            }
    
    
            if(Number((total-distance).toFixed(pr))>Number((c_length-(dict[dir][node].end-dict[dir][node].start)).toFixed(pr))){
                
                if(Number(dict[dir][node].start)!==0){
                    if(Number((Number(distance)+Number(c_length)).toFixed(pr))>Number(dict[dir][node].start)){   
                        
                        if(Number((Number(distance)-Number(c_length)).toFixed(pr))<Number(dict[dir][node].start)){ //MIDLLE POINT
                            dict[node][dir].start = distance;        
                            dict[node][dir].end = ((Number(dict[node][dir].start) + Number(dict[dir][node].start) + Number(c_length))/2).toFixed(pr);     
                            dict[dir][node].end = ((Number(dict[node][dir].start) + Number(dict[dir][node].start) + Number(c_length))/2).toFixed(pr);
                            if(String(PointPr(branch.geometry.coordinates[0]))==String(node)){
                                var dept=0; var dest = (dict[node][dir].end-dict[node][dir].start).toFixed(pr); 
                                var dept_b = (c_length - Number(dict[dir][node].end) + Number(dict[dir][node].start)).toFixed(pr); var dest_b = Number(c_length).toFixed(pr);
                            }else{
                                var dept = (c_length - Number(dict[node][dir].end) + Number(dict[node][dir].start)).toFixed(pr); var dest = Number(c_length).toFixed(pr); 
                                var dept_b=0; var dest_b = (dict[dir][node].end-dict[dir][node].start).toFixed(pr);
                            }
                            var slice_a = turf.lineSliceAlong(branch, dept, dest, {units: 'meters'})//SHOULD START FROM PREVIOUS
                            slice_a.properties.color=Color(dict[node][dir].start/max, ind);

                            slice_a.properties.start=Number(dict[node][dir].start);
                            slice_a.properties.end=Number(dict[node][dir].end);
                            slice_a.properties.flip=flip;
                            selected[String(node +'|'+dir)] = slice_a;
    
                            var slice_b = turf.lineSliceAlong(branch, dept_b, dest_b, {units: 'meters'})//SHOULD START FROM PREVIOUS
                            slice_b.properties.color=Color(dict[dir][node].start/max, ind);

                            slice_b.properties.start=Number(dict[node][dir].start);
                            slice_b.properties.end=Number(dict[dir][node].end);
                            slice_b.properties.flip=!flip;
                            selected[String(dir +'|'+node)] = slice_b;
                        }
                    }else{
                        dict[node][dir].start = distance;
                        dict[node][dir].end = (Number(distance) + Number(c_length)).toFixed(pr);
                        dict[dir][node].start = (Number(distance) + Number(c_length)).toFixed(pr);
                        dict[dir][node].end = (Number(distance) + Number(c_length)).toFixed(pr);
                        delete selected[String(dir +'|'+node)];
                        var left = Number(distance)+Number(c_length);
                        
                        branch.properties.color=Color(dict[node][dir].start/max, ind);

                        branch.properties.start=Number(dict[node][dir].start);
                        branch.properties.end=Number(dict[node][dir].end);
                        branch.properties.flip=flip;
                        selected[String(node +'|'+dir)] = branch;
                        if (iter<treshold){
                            if(!iterationDict[iter]){
                                assign(iterationDict, [iter, "values"], [])
                            }
                            for (var key in dict[dir]){
                                if(dict[dir][key].id!==null && Number(left)<Number(total) && dict[key][dir].start!==dict[node][dir].start){
                                    iterationDict[iter].values.push([roads[dict[dir][key].id], dir, left, iter+1])
                                }
                            }
                        }else{
                            for (var key in dict[dir]){
                                if(dict[dir][key].id!==null && Number(left)<Number(total) && dict[key][dir].start!==dict[node][dir].start){
                                    Growth(roads[dict[dir][key].id], dir, left, iter+1);;
                                }
                            }  
                        }

                    }
                }else{ //Full new branch
                    dict[node][dir].start = distance;
                    dict[node][dir].end = (Number(distance) + Number(c_length)).toFixed(pr);           
                    dict[dir][node].start = (Number(distance) + Number(c_length)).toFixed(pr);
                    dict[dir][node].end = (Number(distance) + Number(c_length)).toFixed(pr);
                    var left = Number(distance)+Number(c_length);
                    
                    branch.properties.color=Color(dict[node][dir].start/max, ind);

                    branch.properties.start=Number(dict[node][dir].start);
                    branch.properties.end=Number(dict[node][dir].end);
                    branch.properties.flip=flip;
                    selected[String(node +'|'+dir)] = branch;
                    //console.log(iterationDict[iter])
                    if (iter<treshold){
                        if(!iterationDict[iter]){
                            assign(iterationDict, [iter, "values"], [])
                        }
                        for (var key in dict[dir]){
                            if(dict[dir][key].id!==null && Number(left)<Number(total) && dict[key][dir].start!==dict[node][dir].start){
                                iterationDict[iter].values.push([roads[dict[dir][key].id], dir, left, iter+1])
                            }
                        }
                    }else{
                        for (var key in dict[dir]){
                            if(dict[dir][key].id!==null && Number(left)<Number(total) && dict[key][dir].start!==dict[node][dir].start){
                                Growth(roads[dict[dir][key].id], dir, left, iter+1);;
                            }
                        }  
                    }
                }
            }else{
                dict[node][dir].start = distance;
                dict[node][dir].end = total;
                if(String(PointPr(branch.geometry.coordinates[0]))==String(node)){var dept=0; var dest = (dict[node][dir].end-dict[node][dir].start).toFixed(pr)}else{var dept = (c_length - Number(dict[node][dir].end) + Number(dict[node][dir].start)).toFixed(pr); var dest = c_length;}
                
                var slice = turf.lineSliceAlong(branch, dept, dest, {units: 'meters'})//SHOULD START FROM PREVIOUS
                slice.properties.color=Color(dict[node][dir].start/max, ind);

                slice.properties.start=Number(dict[node][dir].start);
                slice.properties.end=Number(dict[node][dir].end);
                slice.properties.flip=flip;
                selected[String(node +'|'+dir)] = slice;
            }        
        
        
        }//Growth End
    
        for(let i = 0; i < roads.length; i++){ 
            let d = roads[i];      

            if(!executed && !turf.booleanDisjoint(line, d)){
                executed = true;
                //if(!turf.booleanDisjoint(line, d)){console.log('not disjoint', turf.lineSplit(d, line))}
                //console.log(line)
                if(turf.lineSplit(d, line).features.length==0){

                    if(String(line.geometry.coordinates[0]).substring(0,8)===String(d.geometry.coordinates[0]).substring(0,8)){
                        line.geometry.coordinates[0] = d.geometry.coordinates[0]
                        //var start = [line.geometry.coordinates[0][0].toFixed(pr),line.geometry.coordinates[0][1].toFixed(pr)];
                        assign(dict, [PointPr(line.geometry.coordinates[0]), PointPr(line.geometry.coordinates[1])], {'id':null, 'end': 0, 'start': 0});
                        assign(dict, [PointPr(line.geometry.coordinates[1]), PointPr(line.geometry.coordinates[0])], {'id':null, 'end': 0, 'start': 0});
                        Growth(line, PointPr(line.geometry.coordinates[1]), null,0);console.log("here-2")
                        //resolve(selected);
                    }else{
                        line.geometry.coordinates[0] = d.geometry.coordinates[d.geometry.coordinates.length-1]
                        assign(dict, [PointPr(line.geometry.coordinates[0]), PointPr(line.geometry.coordinates[1])], {'id':roads.length, 'end': 0, 'start': 0});
                        assign(dict, [PointPr(line.geometry.coordinates[1]), PointPr(line.geometry.coordinates[0])], {'id':roads.length, 'end': 0, 'start': 0});
                        Growth(line, PointPr(line.geometry.coordinates[1]), null,0);console.log("here-1")
                    }

                }else{

                    delete dict[PointPr(d.geometry.coordinates[0])][PointPr(d.geometry.coordinates[d.geometry.coordinates.length-1])];
                    delete dict[PointPr(d.geometry.coordinates[d.geometry.coordinates.length-1])][PointPr(d.geometry.coordinates[0])];
                    var pPoint;
        
                    turf.lineSplit(d, line).features.forEach(function(g,i){
                        assign(dict, [PointPr(g.geometry.coordinates[0]), PointPr(g.geometry.coordinates[g.geometry.coordinates.length-1])], {'id':roads.length, 'end': 0, 'start': 0});
                        assign(dict, [PointPr(g.geometry.coordinates[g.geometry.coordinates.length-1]), PointPr(g.geometry.coordinates[0])], {'id':roads.length, 'end': 0, 'start': 0});
                        roads.push(g);
                        
                        if(g.geometry.coordinates[0]!==d.geometry.coordinates[0] 
                        && g.geometry.coordinates[0]!==d.geometry.coordinates[d.geometry.coordinates.length-1])
                        {pPoint=g.geometry.coordinates[0]}
                        if(g.geometry.coordinates[g.geometry.coordinates.length-1]!==d.geometry.coordinates[0] 
                        && g.geometry.coordinates[g.geometry.coordinates.length-1]!==d.geometry.coordinates[d.geometry.coordinates.length-1])
                        {pPoint=g.geometry.coordinates[[g.geometry.coordinates.length-1]]}
                    })
                
                    assign(dict, [PointPr(point), PointPr(pPoint)], {'id':null, 'end': 0, 'start': 0});
                    assign(dict, [PointPr(pPoint), PointPr(point)], {'id':null, 'end': 0, 'start': 0});
                    line.geometry.coordinates[0] = point;
                    line.geometry.coordinates[1]=pPoint;
                    Growth(line, PointPr(point), null, 0);//console.log("here")
                }
                //break;
            }
        }
        
        for (let currentInt = 0; currentInt<treshold; currentInt++){
            //console.log(iterationDict[currentInt])
            if(!iterationDict[currentInt]){ break }
            //console.log(iterationDict[currentInt].values.length)
            for (let i = 0; i < iterationDict[currentInt].values.length; i++){
                let values = iterationDict[currentInt].values;
                //console.log(values[0][2].geometry.coordinates[0])
                if(values[0]){
                    Growth(values[i][0], values[i][1], values[i][2], values[i][3]);
                }
            } 
        }
        
        //return turf.featureCollection(Object.values(selected));
    
    
    var con = turf.convex(turf.featureCollection(Object.values(selected)), {concavity: 4});
    //selected[99999999999999999999] = con;
    if(Object.values(selected).length<2|| turf.pointsWithinPolygon(dots, con).features.length<2){
        if(iterations<8){
            iterations++;
        point[1]+=0.0001;
        //Calculate();
        }else{
            postMessage([selected, data, true]);
        }
    }else{

    //var con = turf.convex(turf.featureCollection(Object.values(selected)), {concavity: 4});
    var ptsWithin = turf.pointsWithinPolygon(dots, con);
    //console.log(turf.pointsWithinPolygon(dots, con).features.length);
    var areaMean = ptsWithin.features[0].properties;
    delete areaMean.id
    //console.log(areaMean)
    for(let key in areaMean){    
    var a=0, b=0, c=0;
        if(key=="Pedestrian Access" || key=="Urban Access" || key == "Walkability" || key=="FAR" || key == "Building Reach"){
            //console.log(key)
            data["Space"][key].value = d3.mean( ptsWithin.features, function(v) { return v.properties[key];})
        }else if(key=="Diversity" || key == "Optional Activities" || key == "Necessary Activities" || key == "Consumption" || key=="Mobility"){
            data["Activities"][key].value = d3.mean( ptsWithin.features, function(v) { return v.properties[key];})
        }else if(key!=="Space Total" && key !=="Activities Total" && key !=="Values Total"){
            data["Values"][key].value = d3.mean( ptsWithin.features, function(v) { return v.properties[key]; })
        }else{
            data["Totals"][key].value = d3.mean( ptsWithin.features, function(v) { return v.properties[key]; })
        }
    }
    for (key in data){
        data[key]=Object.values(data[key])
    }
    postMessage([selected, data, false]);
    }
}
}

